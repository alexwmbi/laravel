<?php

namespace App\Http\Controllers;

use App\Http\Resources\ClientResource;
use App\Http\Resources\DetailmaterialResource;
use App\Http\Resources\DetailworkResource;
use App\Http\Resources\TaskResource;
use App\Http\Resources\WorkResource;
use App\Models\Client;
use App\Models\Detailmaterial;
use App\Models\Detailwork;
use App\Models\Task;
use App\Models\Work;
use App\Http\Requests\StoreWorkRequest;
use App\Http\Requests\UpdateWorkRequest;
use DB;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use League\CommonMark\Extension\Attributes\Node\Attributes;
use Session;
use Illuminate\Http\Request;
use SimpleXMLElement;


class WorkController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Work::query();

        //Ricerca per nome
        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }

        $works = $query->paginate(10);

        $client = Work::with("clients")->get();

        return inertia('Work/Index', [

            "works" => WorkResource::collection($works),
            "client" => compact('client'),
            "queryParams" => request()->query() ?: null,
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {

        return inertia("Work/Create");

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWorkRequest $request)
    {

        $client_id = Session::get('client_id');


        $data = $request->validated();
        $work = Work::create($data);
        $work->clients()->attach($client_id);

        return to_route("client.show", $client_id)->with('success', 'Nuovo lavoro inserito');

    }

    /**
     * Display the specified resource.
     */
    public function show(Work $work)
    {

        $work = new WorkResource($work);
        $query = $work->tasks()->get();

        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');

        /*  if (request("name")) {

             $query = $work->tasks()->where("name", "like", "%" . request("name") . "%")->get();

         } */

        Session::put('work', $work->name);
        Session::put('work_id', $work->id);
        $client = Session::get('client_name');
        $client_id = Session::get('client_id');

        $query = $work->tasks()
            ->where(function (Builder $query) {

                if (request("name")) {

                    $query->where("name", "like", "%" . request("name") . "%");

                }

                if (request("note")) {

                    $query->where("note", "like", "%" . request("note") . "%");

                }

                if (request("description")) {

                    $query->where("description", "like", "%" . request("description") . "%");

                }

                if (request("code")) {

                    $query->where("code", "like", "%" . request("code") . "%");

                }

                if (request("starting_date_from") || request("starting_date_to")) {

                    if (request("starting_date_from")) {

                        $startingDateFrom = (new Carbon(request("starting_date_from")))->format('Y-m-d');
                        request("starting_date_from", $startingDateFrom);
                        $query->where('starting_date', ">=", $startingDateFrom);

                    }


                    if (request("starting_date_to")) {

                        $starting_date_to = (new Carbon(request("starting_date_to")))->format('Y-m-d');
                        request("starting_date_to", $starting_date_to);
                        $query->where('starting_date', "<=", $starting_date_to);

                    }

                }


                if (request("due_date_from") || request("due_date_to")) {

                    if (request("due_date_from")) {

                        $dueDateFrom = (new Carbon(request("due_date_from")))->format('Y-m-d');
                        request("due_date_from", $dueDateFrom);
                        $query->where('due_date', ">=", $dueDateFrom);

                    }


                    if (request("due_date_to")) {

                        $due_date_to = (new Carbon(request("due_date_to")))->format('Y-m-d');
                        request("due_date_to", $due_date_to);
                        $query->where('due_date', "<=", $due_date_to);

                    }

                }

                return $query;

            })
           // ->orderBy($sortField, $sortDirection)->paginate(10);
           ->paginate(10);

        return inertia('Work/Show', [
            "work" => $work,
            "tasks" => TaskResource::collection($query),
            "queryParams" => request()->query() ?: null,
            'success' => session('success'),
            'print' => session('print'),
            'client' => $client,
            'client_id' => $client_id,


        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Work $work)
    {
        return inertia("Work/Edit", ['work' => new WorkResource($work)]);

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWorkRequest $request, Work $work)
    {
        $work->update($request->validated());
        return to_route('client.index')->with('success', 'Lavoro modificato');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Work $work)
    {
        $work->delete();
        return to_route('client.index')
            ->with('success', "Lavoro eliminato");
    }


    public function print(Work $work)
    {

        // ELENCO TASK ORE E PREZZI
        // ELENCO MATERIALI CON PREZZI
        // PREZZO TOTALE LAVORO
        // ALLEGATI

        $work = new WorkResource($work);
        $tasks = $work->tasks()->get();

        $taskId = [];
        //18 19 20 30 id
        $detailMaterial = new Detailmaterial();

        $detailWork = new Detailwork();
        $hoursTot = 0;
        $materialsTot = 0;


        foreach ($tasks as $task) {

            array_push($taskId, $task->id);

        }

        $detailMaterial = Detailmaterial::select('id', 'task', 'material_id', 'quantity', 'default_aug', 'custom_aug', 'priece', 'aug', 'um', 'name', 'code', 'task')->whereIn("task", $taskId)->distinct()->orderBy('task')->get();
        $detailWork = Detailwork::select('name', 'code', 'worker_id', 'hours', 'status', 'task')->whereIn("task", $taskId)->distinct()->orderBy('task')->get();
        //dd($taskId,$detailWork);
        //dd($detailMaterial);
        // $taskHours = Detailwork::select('task','hours')->whereIn("task", $taskId)->distinct()->get();
        $hoursTot = $detailWork->sum('hours');

        /* $taskMaterials = Detailmaterial::selectRaw('priece * quantity as price_quantity')->get();
        $materialsTot = $taskMaterials->sum('price_quantity');

 */



        //$taskMaterials = Detailmaterial::selectRaw('task, priece * quantity as price_quantity')->whereIn("task", $taskId)->get();
        $taskMaterials = Detailmaterial::selectRaw('task, (( priece + ( priece * default_aug / 100) + ( priece * custom_aug / 100 )) * quantity) as price_quantity')->whereIn("task", $taskId)->get();
        //dd($taskMaterials);
        $materialsTot = $taskMaterials->sum('price_quantity');
        $materialTaskDistinct = $taskMaterials->groupBy('task');
        //dd($materialTaskDistinct,$taskMaterials,$materialsTot);


        /*  $materialsTot = $task->detailmaterials()->selectRaw('detailmaterials.priece * detailmaterials.quantity as price_quantity')->get();
         $price_quantity = 0;
         foreach ($materialsTot as $key => $value) {
             if ($key = 'price_quantity')
                 $price_quantity = $price_quantity + $value->price_quantity;
         }
  */



        //dd($hoursTot, $materialsTot);



        Session::put('work_id', $work->id);
        $client = Session::get('client_name');
        $client_id = Session::get('client_id');
        $clientData = DB::table('clients')->where('id', $client_id)->first();

        //dd( $clientData);
        $query = $work->tasks()
            ->where(function (Builder $query) {

                if (request("name")) {

                    $query->where("name", "like", "%" . request("name") . "%");

                }

                if (request("note")) {

                    $query->where("note", "like", "%" . request("note") . "%");

                }

                if (request("description")) {

                    $query->where("description", "like", "%" . request("description") . "%");

                }

                if (request("code")) {

                    $query->where("code", "like", "%" . request("code") . "%");

                }

                if (request("starting_date_from") || request("starting_date_to")) {

                    if (request("starting_date_from")) {

                        $startingDateFrom = (new Carbon(request("starting_date_from")))->format('Y-m-d');
                        request("starting_date_from", $startingDateFrom);
                        $query->where('starting_date', ">=", $startingDateFrom);

                    }


                    if (request("starting_date_to")) {

                        $starting_date_to = (new Carbon(request("starting_date_to")))->format('Y-m-d');
                        request("starting_date_to", $starting_date_to);
                        $query->where('starting_date', "<=", $starting_date_to);

                    }

                }


                if (request("due_date_from") || request("due_date_to")) {

                    if (request("due_date_from")) {

                        $dueDateFrom = (new Carbon(request("due_date_from")))->format('Y-m-d');
                        request("due_date_from", $dueDateFrom);
                        $query->where('due_date', ">=", $dueDateFrom);

                    }


                    if (request("due_date_to")) {

                        $due_date_to = (new Carbon(request("due_date_to")))->format('Y-m-d');
                        request("due_date_to", $due_date_to);
                        $query->where('due_date', "<=", $due_date_to);

                    }

                }

                return $query;

            })
            ->paginate(10);

           
            // NOTA : COSTO ORE PER TASK E' IN TASKS.HOURS
           // $hoursCostTotArr =  $task->detailworkers()->selectRaw(' CAST( hours * ( priece + ( priece * aug  / 100 ) ) as DECIMAL (8,2) ) as "tot"')->get();
           /*  $hoursCostTot = 0;
            foreach ($hoursCostTotArr as $key => $value) {
                if ($key = 'tot')
                    $hoursCostTot = $hoursCostTot + $value->tot;
            } */
            
            // test
          

            $hoursCostTot = $task->sum('hourspriece');

        return inertia('Print/Preventive', [
            "detailmaterial" => DetailmaterialResource::collection($detailMaterial),
            "detailwork" => DetailworkResource::collection($detailWork),
            "work" => $work,
            "tasks" => TaskResource::collection($query),
            "queryParams" => request()->query() ?: null,
            'success' => session('success'),
            'print' => session('print'),
            'client' => $client,
            'client_id' => $client_id,
            'hoursTot' => $hoursTot,
            'materialsTot' => $materialsTot,
            'clientData' => $clientData,
            'materialTaskDistinct' => $materialTaskDistinct,
            'hoursCostTot' => $hoursCostTot,

        ]);

    }



    public function conformity(Work $work)
    {

        // ELENCO TASK ORE E PREZZI
        // ELENCO MATERIALI CON PREZZI
        // PREZZO TOTALE LAVORO
        // ALLEGATI

        $work = new WorkResource($work);
        $tasks = $work->tasks()->get();

        $taskId = [];
        //18 19 20 30 id
        $detailMaterial = new Detailmaterial();

        $detailWork = new Detailwork();
        $hoursTot = 0;
        $materialsTot = 0;


        foreach ($tasks as $task) {

            array_push($taskId, $task->id);

        }

        $detailMaterial = Detailmaterial::select('id', 'task', 'material_id', 'quantity', 'default_aug','custom_aug', 'priece', 'aug', 'um', 'name', 'code', 'task')->whereIn("task", $taskId)->distinct()->orderBy('task')->get();
        $detailWork = Detailwork::select('name', 'code', 'worker_id', 'hours', 'status', 'task')->whereIn("task", $taskId)->distinct()->orderBy('task')->get();
        //dd($taskId,$detailWork);

        // $taskHours = Detailwork::select('task','hours')->whereIn("task", $taskId)->distinct()->get();
        $hoursTot = $detailWork->sum('hours');

        /* $taskMaterials = Detailmaterial::selectRaw('priece * quantity as price_quantity')->get();
        $materialsTot = $taskMaterials->sum('price_quantity');

 */



        //$taskMaterials = Detailmaterial::selectRaw('task, priece * quantity as price_quantity')->whereIn("task", $taskId)->get();
        $taskMaterials = Detailmaterial::selectRaw('task, (( priece + ( priece * default_aug / 100) + ( priece * custom_aug / 100 )) * quantity) as price_quantity')->whereIn("task", $taskId)->get();
        $materialsTot = $taskMaterials->sum('price_quantity');
        $materialTaskDistinct = $taskMaterials->groupBy('task');
        //dd($materialTaskDistinct,$taskMaterials,$materialsTot);


        /*  $materialsTot = $task->detailmaterials()->selectRaw('detailmaterials.priece * detailmaterials.quantity as price_quantity')->get();
         $price_quantity = 0;
         foreach ($materialsTot as $key => $value) {
             if ($key = 'price_quantity')
                 $price_quantity = $price_quantity + $value->price_quantity;
         }
  */



        //dd($hoursTot, $materialsTot);



        Session::put('work_id', $work->id);
        $client = Session::get('client_name');
        $client_id = Session::get('client_id');
        $clientData = DB::table('clients')->where('id', $client_id)->first();

        //dd( $clientData);
        $query = $work->tasks()
            ->where(function (Builder $query) {

                if (request("name")) {

                    $query->where("name", "like", "%" . request("name") . "%");

                }

                if (request("note")) {

                    $query->where("note", "like", "%" . request("note") . "%");

                }

                if (request("description")) {

                    $query->where("description", "like", "%" . request("description") . "%");

                }

                if (request("code")) {

                    $query->where("code", "like", "%" . request("code") . "%");

                }

                if (request("starting_date_from") || request("starting_date_to")) {

                    if (request("starting_date_from")) {

                        $startingDateFrom = (new Carbon(request("starting_date_from")))->format('Y-m-d');
                        request("starting_date_from", $startingDateFrom);
                        $query->where('starting_date', ">=", $startingDateFrom);

                    }


                    if (request("starting_date_to")) {

                        $starting_date_to = (new Carbon(request("starting_date_to")))->format('Y-m-d');
                        request("starting_date_to", $starting_date_to);
                        $query->where('starting_date', "<=", $starting_date_to);

                    }

                }


                if (request("due_date_from") || request("due_date_to")) {

                    if (request("due_date_from")) {

                        $dueDateFrom = (new Carbon(request("due_date_from")))->format('Y-m-d');
                        request("due_date_from", $dueDateFrom);
                        $query->where('due_date', ">=", $dueDateFrom);

                    }


                    if (request("due_date_to")) {

                        $due_date_to = (new Carbon(request("due_date_to")))->format('Y-m-d');
                        request("due_date_to", $due_date_to);
                        $query->where('due_date', "<=", $due_date_to);

                    }

                }

                return $query;

            })
            ->paginate(10);

        return inertia('Print/Conformity', [
            "detailmaterial" => DetailmaterialResource::collection($detailMaterial),
            "detailwork" => DetailworkResource::collection($detailWork),
            "work" => $work,
            "tasks" => TaskResource::collection($query),
            "queryParams" => request()->query() ?: null,
            'success' => session('success'),
            'print' => session('print'),
            'client' => $client,
            'client_id' => $client_id,
            'hoursTot' => $hoursTot,
            'materialsTot' => $materialsTot,
            'clientData' => $clientData,
            'materialTaskDistinct' => $materialTaskDistinct,

        ]);

    }

    public function invoice(Work $work)
    {

        // ELENCO TASK ORE E PREZZI
        // ELENCO MATERIALI CON PREZZI
        // PREZZO TOTALE LAVORO
        // ALLEGATI

        //dd(request()->query());

        $work = new WorkResource($work);
        $tasks = $work->tasks()->get();

        $taskId = [];
        //18 19 20 30 id
        $detailMaterial = new Detailmaterial();

        $detailWork = new Detailwork();
        $hoursTot = 0;
        $materialsTot = 0;


        foreach ($tasks as $task) {

            array_push($taskId, $task->id);

        }

        $detailMaterial = Detailmaterial::select('id', 'task', 'material_id', 'quantity', 'priece', 'default_aug','custom_aug', 'aug', 'um', 'name', 'code', 'task')->whereIn("task", $taskId)->distinct()->orderBy('task')->get();
        $detailWork = Detailwork::select('name', 'code', 'worker_id', 'hours', 'priece', 'aug', 'status', 'task')->whereIn("task", $taskId)->distinct()->orderBy('task')->get();
        //dd($taskId,$detailWork);

        // $taskHours = Detailwork::select('task','hours')->whereIn("task", $taskId)->distinct()->get();
        $hoursTot = $detailWork->sum('hours');
        $hourspriece = $tasks->sum('hourspriece');
        

        /* $taskMaterials = Detailmaterial::selectRaw('priece * quantity as price_quantity')->get();
        $materialsTot = $taskMaterials->sum('price_quantity');

 */



        $taskMaterials = Detailmaterial::selectRaw('task, (( priece + ( priece * default_aug / 100) + ( priece * custom_aug / 100 )) * quantity) as price_quantity')->whereIn("task", $taskId)->get();
        //$taskMaterials = Detailmaterial::selectRaw('task, priece * quantity as price_quantity')->whereIn("task", $taskId)->get();
        //$taskMaterials = Detailmaterial::selectRaw('task, ( priece + ( priece * default_aug ) + ( priece * custom_aug )) * quantity as price_quantity')->whereIn("task", $taskId)->get();
        
        $materialsTot = $taskMaterials->sum('price_quantity');
        $materialTaskDistinct = $taskMaterials->groupBy('task');
        //dd($materialTaskDistinct,$taskMaterials,$materialsTot);


        /*  $materialsTot = $task->detailmaterials()->selectRaw('detailmaterials.priece * detailmaterials.quantity as price_quantity')->get();
         $price_quantity = 0;
         foreach ($materialsTot as $key => $value) {
             if ($key = 'price_quantity')
                 $price_quantity = $price_quantity + $value->price_quantity;
         }
  */



        //dd($hoursTot, $materialsTot);



        Session::put('work_id', $work->id);
        $client = Session::get('client_name');
        $client_id = Session::get('client_id');
        $clientData = DB::table('clients')->where('id', $client_id)->first();

        //dd( $clientData);
        $query = $work->tasks()
            ->where(function (Builder $query) {

                if (request("name")) {

                    $query->where("name", "like", "%" . request("name") . "%");

                }

                if (request("note")) {

                    $query->where("note", "like", "%" . request("note") . "%");

                }

                if (request("description")) {

                    $query->where("description", "like", "%" . request("description") . "%");

                }

                if (request("code")) {

                    $query->where("code", "like", "%" . request("code") . "%");

                }

                if (request("starting_date_from") || request("starting_date_to")) {

                    if (request("starting_date_from")) {

                        $startingDateFrom = (new Carbon(request("starting_date_from")))->format('Y-m-d');
                        request("starting_date_from", $startingDateFrom);
                        $query->where('starting_date', ">=", $startingDateFrom);

                    }


                    if (request("starting_date_to")) {

                        $starting_date_to = (new Carbon(request("starting_date_to")))->format('Y-m-d');
                        request("starting_date_to", $starting_date_to);
                        $query->where('starting_date', "<=", $starting_date_to);

                    }

                }


                if (request("due_date_from") || request("due_date_to")) {

                    if (request("due_date_from")) {

                        $dueDateFrom = (new Carbon(request("due_date_from")))->format('Y-m-d');
                        request("due_date_from", $dueDateFrom);
                        $query->where('due_date', ">=", $dueDateFrom);

                    }


                    if (request("due_date_to")) {

                        $due_date_to = (new Carbon(request("due_date_to")))->format('Y-m-d');
                        request("due_date_to", $due_date_to);
                        $query->where('due_date', "<=", $due_date_to);

                    }

                }

                return $query;

            })
            ->paginate(10);

        return inertia('Print/Invoice', [
            "detailmaterial" => DetailmaterialResource::collection($detailMaterial),
            "detailwork" => DetailworkResource::collection($detailWork),
            "work" => $work,
            "tasks" => TaskResource::collection($query),
            "queryParams" => request()->query() ?: null,
            'success' => session('success'),
            'print' => session('print'),
            'client' => $client,
            'client_id' => $client_id,
            'hoursTot' => $hoursTot,
            'materialsTot' => $materialsTot,
            'clientData' => $clientData,
            'materialTaskDistinct' => $materialTaskDistinct,
            'hourspriece' => $hourspriece,

        ]);

    }






    public function invoicePrint(Work $work)
    {

        //dd(request()->query());
        $taskQurery = request("selectedItemsTask", []);
        $materialQuery = request("selectedItemsMaterials", []);

        $work = new WorkResource($work);
        $tasks = $work->tasks()->get();

        $hourspriece = $tasks->sum('hourspriece');

        $taskId = [];
        $detailMaterial = new Detailmaterial();
        $detailWork = new Detailwork();
        $hoursTot = 0;
        $materialsTot = 0;

        foreach ($tasks as $task) {
            array_push($taskId, $task->id);
        }

        $detailMaterial = Detailmaterial::select('id', 'task', 'material_id', 'quantity', 'priece', 'default_aug','custom_aug', 'aug', 'um', 'name', 'code', 'task')->whereIn("task", $taskId)->distinct()->orderBy('task');
        //dd($materialQuery);
        if ($materialQuery) {
            $detailMaterial = $detailMaterial->whereIn('id', $materialQuery)->get();
        }
        //dd($detailMaterial);
        $detailWork = Detailwork::select('name', 'code', 'worker_id', 'hours', 'status', 'task')->whereIn("task", $taskId)->distinct()->orderBy('task')->get();
        //dd($taskId,$detailWork);

        // $taskHours = Detailwork::select('task','hours')->whereIn("task", $taskId)->distinct()->get();
        $hoursTot = $detailWork->sum('hours');

        //$taskMaterials = Detailmaterial::selectRaw('task, priece * quantity as price_quantity')->whereIn("task", $taskId)->get();
        //$taskMaterials = Detailmaterial::selectRaw('task, priece * quantity as price_quantity')->whereIn("task", $taskId)->whereIn("id", $materialQuery)->get();
        $taskMaterials = Detailmaterial::selectRaw('task, (( priece + ( priece * default_aug / 100) + ( priece * custom_aug / 100 )) * quantity) as price_quantity')->whereIn("task", $taskId)->get();
        $materialsTot = $taskMaterials->sum('price_quantity');
        $materialTaskDistinct = $taskMaterials->groupBy('task');
        //dd($taskMaterials,$materialsTot);

        Session::put('work_id', $work->id);
        $client = Session::get('client_name');
        $client_id = Session::get('client_id');
        $clientData = DB::table('clients')->where('id', $client_id)->first();

        // $query = $work->tasks()->ddRawSql() 
        $testqry = implode(',', $taskQurery);

        //dd($testqry);
        if ($testqry) {
            $query = DB::select('select * from `tasks` inner join `task_work` on `tasks`.`id` = `task_work`.`task_id` where `task_work`.`work_id` = ? and  `task_work`.`task_id` in  ' . '(' . $testqry . ')', [$work->id]);
            //$taskSum = $query->sum('hours');
        } else {
            $query = [];
        }

        $taskHours= 0;
         foreach ($query as $task) {
            $taskHours +=  $task->hours;
            
        }
       //dd($taskHours);
       //dd($detailMaterial);

        return inertia('Print/InvoicePrint', [
            "detailmaterial" => $detailMaterial,
            "detailwork" => DetailworkResource::collection($detailWork),
            "work" => $work,
            "tasks" => TaskResource::collection($query),
            "queryParams" => request()->query() ?: null,
            'success' => session('success'),
            'print' => session('print'),
            'client' => $client,
            'client_id' => $client_id,
            'hoursTot' => $taskHours,
            'materialsTot' => $materialsTot,
            'clientData' => $clientData,
            'materialTaskDistinct' => $materialTaskDistinct,
            'hourspriece' => $hourspriece,

        ]);

    }


    public function attach(Work $work)
    {
        //dd(request()->query());
        //dd(request()->query());
        // $taskQurery = request("selectedItemsTask", []);
        // $materialQuery = request("selectedItemsMaterials", []);
       // echo asset('storage/NsgG6j2TQMc8jSaU/Alessandro%20Panigada%20CV%20(1).pdf');
        $attachedUrl = [];
        $work = new WorkResource($work);
        $attachedUrl = DB::select('select `id` , `filename` , `fileurl` from `attaches`  where `work_id` = ?  ' , [$work->id]);
       // dd($attachedUrl);
        /*  $tasks = $work->tasks()->get();

        $taskId = [];
        $detailMaterial = new Detailmaterial();
        $detailWork = new Detailwork();
        $hoursTot = 0;
        $materialsTot = 0;

        foreach ($tasks as $task) {
            array_push($taskId, $task->id);
        }

        $detailMaterial = Detailmaterial::select('id', 'task', 'material_id', 'quantity', 'priece', 'aug', 'um', 'name', 'code', 'task')->whereIn("task", $taskId)->distinct()->orderBy('task');
        //dd($materialQuery);
        if ($materialQuery) {
            $detailMaterial = $detailMaterial->whereIn('id', $materialQuery)->get();
        }
        //dd($detailMaterial);
        $detailWork = Detailwork::select('name', 'code', 'worker_id', 'hours', 'status', 'task')->whereIn("task", $taskId)->distinct()->orderBy('task')->get();
        //dd($taskId,$detailWork);

        // $taskHours = Detailwork::select('task','hours')->whereIn("task", $taskId)->distinct()->get();
        $hoursTot = $detailWork->sum('hours');

        //$taskMaterials = Detailmaterial::selectRaw('task, priece * quantity as price_quantity')->whereIn("task", $taskId)->get();
        $taskMaterials = Detailmaterial::selectRaw('task, priece * quantity as price_quantity')->whereIn("task", $taskId)->whereIn("id", $materialQuery)->get();
        $materialsTot = $taskMaterials->sum('price_quantity');
        $materialTaskDistinct = $taskMaterials->groupBy('task');
        //dd($taskMaterials,$materialsTot);

        Session::put('work_id', $work->id);
        $client = Session::get('client_name');
        $client_id = Session::get('client_id');
        $clientData = DB::table('clients')->where('id', $client_id)->first();

        // $query = $work->tasks()->ddRawSql() 
        $testqry = implode(',', $taskQurery);

        //dd($testqry);
        if ($testqry) {
            $query = DB::select('select * from `tasks` inner join `task_work` on `tasks`.`id` = `task_work`.`task_id` where `task_work`.`work_id` = ? and  `task_work`.`task_id` in  ' . '(' . $testqry . ')', [$work->id]);
            //$taskSum = $query->sum('hours');
        } else {
            $query = [];
        }

        $taskHours= 0;
         foreach ($query as $task) {
            $taskHours +=  $task->hours;
            
        } */
       //dd($taskHours);

        return inertia('Print/Attach', [
            // "detailmaterial" => $detailMaterial,
            // "detailwork" => DetailworkResource::collection($detailWork),
            "work" => $work,
            // "tasks" => TaskResource::collection($query),
            "queryParams" => request()->query() ?: null,
            'success' => session('success'),
            'file_path' => $attachedUrl,
            // 'client' => $client,
            // 'client_id' => $client_id,
            // 'hoursTot' => $taskHours,
            // 'materialsTot' => $materialsTot,
            // 'clientData' => $clientData,
            // 'materialTaskDistinct' => $materialTaskDistinct,

        ]);

    }


    public function invoiceXml(Work $work, Request $request)
{
    // ========================== 1) INPUT ==========================
    $selectedTaskIds = collect($request->input('selectedItemsTask', []))
        ->map(static fn ($v) => (int) $v)->filter()->values();

    $selectedMaterialIds = collect($request->input('selectedItemsMaterials', []))
        ->map(static fn ($v) => (int) $v)->filter()->values();

    // ======================= 2) DATI DI BASE ======================
    $work->load(['tasks', 'clients']);

    $allTaskIds = $work->tasks()->pluck('tasks.id');
    $taskIdsForTotals = $selectedTaskIds->isNotEmpty() ? $selectedTaskIds : $allTaskIds;

    // Materiali
    $materialsQ = \App\Models\Detailmaterial::whereIn('task', $taskIdsForTotals)
        ->select([
            'id', 'task', 'material_id', 'quantity', 'default_aug', 'custom_aug', 'um',
            'name', 'code', DB::raw('priece as price'),
        ])->orderBy('task');

    if ($selectedMaterialIds->isNotEmpty()) {
        $materialsQ->whereIn('id', $selectedMaterialIds);
    }
    $materials = $materialsQ->get();

    // Lavorazioni
    $works = \App\Models\Detailwork::whereIn('task', $taskIdsForTotals)
        ->select(['task', 'name', 'code', 'hours', DB::raw('priece as price'), 'aug'])
        ->orderBy('task')
        ->get();

    // =================== 3) CALCOLI RIGHE / TOTALI =================
    $DEFAULT_VAT = 22.00;

    $lines = [];
    foreach ($materials as $m) {
        $base = (float) $m->price;
        $unit = $base
            + ($base * ((float) ($m->default_aug ?? 0)) / 100)
            + ($base * ((float) ($m->custom_aug ?? 0)) / 100);

        $qty = (float) $m->quantity;
        $imp = $unit * $qty;
        $iva = $imp * ($DEFAULT_VAT / 100);

        $lines[] = [
            'descr' => $m->name ?? ('Materiale '.$m->code),
            'qty'   => $qty,
            'um'    => $m->um ?: 'NR',
            'unit'  => $unit,
            'vat'   => $DEFAULT_VAT,
            'imp'   => $imp,
            'iva'   => $iva,
        ];
    }

    foreach ($works as $w) {
        $base = (float) $w->price;
        $unit = $base + ($base * ((float) ($w->aug ?? 0)) / 100);

        $qty = (float) $w->hours;
        $imp = $unit * $qty;
        $iva = $imp * ($DEFAULT_VAT / 100);

        $lines[] = [
            'descr' => $w->name ?? ('Manodopera '.$w->code),
            'qty'   => $qty,
            'um'    => 'H',
            'unit'  => $unit,
            'vat'   => $DEFAULT_VAT,
            'imp'   => $imp,
            'iva'   => $iva,
        ];
    }

    // Riepilogo per aliquota
    $byVat = [];
    foreach ($lines as $L) {
        $k = (string) $L['vat'];
        if (!isset($byVat[$k])) {
            $byVat[$k] = ['imp' => 0.0, 'iva' => 0.0];
        }
        $byVat[$k]['imp'] += $L['imp'];
        $byVat[$k]['iva'] += $L['iva'];
    }

    // ===================== 4) ANAGRAFICHE (DEMO) ===================
    $MY_DENOMINAZIONE = 'CASTELLARE IMPIANTI S.N.C. di Mariottini Daniele & C.';
    $MY_PIVA          = '00419390471';
    $MY_CF            = '00419390471';
    $MY_REGIME        = 'RF01';
    $MY_NAZIONE       = 'IT';
    $MY_PROV          = 'PT';
    $MY_COMUNE        = 'Pistoia';
    $MY_CAP           = '51017';
    $MY_INDIRIZZO     = 'Via del Castellare';

    $client = $work->clients->first();
    $CLIENT_DENOM   = $client->name     ?? 'Cliente';
    $CLIENT_PIVA    = $client->vat      ?? null;
    $CLIENT_CF      = $client->cf       ?? null;
    $CLIENT_NAZIONE = 'IT';
    $CLIENT_PROV    = $client->province ?? 'XX';
    $CLIENT_COMUNE  = $client->city     ?? 'Città';
    $CLIENT_CAP     = $client->zip      ?? '00000';
    $CLIENT_ADDR    = $client->address  ?? 'Indirizzo 1';

    $PROGRESSIVO_INVIO = substr(now()->format('YmdHis'), 0, 10); // String10
    $FORMATO_TRASM     = 'FPR12';
    $CODICE_DEST       = $client->sdi_code ?? '0000000'; // 7 char per B2C
    $PEC_DEST          = $client->pec ?? null;

    $NUMERO_DOC  = 'INV-'.$work->id;
    $DATA_DOC    = now()->format('Y-m-d');
    $TIPO_DOC    = 'TD01';
    $VALUTA      = 'EUR';
    $IMPONIBILE  = array_sum(array_column($lines, 'imp'));
    $IMPOSTA     = array_sum(array_column($lines, 'iva'));
    $TOTALE      = $IMPONIBILE + $IMPOSTA;

    $fmt2  = static fn (float $v) => number_format($v, 2, '.', '');
    $fmtQ  = static fn (float $v) => number_format($v, 2, '.', ''); // QuantitaType (>=2 decimali)
    $fmt8  = static fn (float $v) => number_format($v, 2, '.', ''); // Amount*Decimal -> 2 decimali ok
    $fmtRt = static fn (float $v) => number_format($v, 2, '.', '');

    // ===================== 5) COSTRUZIONE XML (DOM) ======================
    $ns = 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2';
    $ds = 'http://www.w3.org/2000/09/xmldsig#';

    $dom = new \DOMDocument('1.0', 'UTF-8');
    $dom->preserveWhiteSpace = false;
    $dom->formatOutput = true;

    // root qualificato nel namespace, tutti i figli NON qualificati
    $root = $dom->createElementNS($ns, 'p:FatturaElettronica');
    $root->setAttribute('versione', $FORMATO_TRASM);
    // dichiaro anche il prefix ds (anche se non usato in questo XML)
    $root->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:ds', $ds);
    $dom->appendChild($root);

    // helper per creare un figlio NON qualificato con testo
    $add = static function (\DOMNode $parent, string $name, ?string $value = null) use ($dom): \DOMElement {
        $el = $dom->createElement($name);
        if ($value !== null) {
            $el->appendChild($dom->createTextNode($value));
        }
        $parent->appendChild($el);
        return $el;
    };

    // Header (non qualificato)
    $header = $add($root, 'FatturaElettronicaHeader');

    // DatiTrasmissione
    $tx  = $add($header, 'DatiTrasmissione');
    $idT = $add($tx, 'IdTrasmittente');
    $add($idT, 'IdPaese',  'IT');
    $add($idT, 'IdCodice', $MY_PIVA);
    $add($tx, 'ProgressivoInvio',    $PROGRESSIVO_INVIO);
    $add($tx, 'FormatoTrasmissione', $FORMATO_TRASM);
    $add($tx, 'CodiceDestinatario',  $CODICE_DEST);
    if ($CODICE_DEST === '0000000' && $PEC_DEST) {
        $add($tx, 'PECDestinatario', $PEC_DEST);
    }

    // CedentePrestatore
    $cp       = $add($header, 'CedentePrestatore');
    $datiAnag = $add($cp, 'DatiAnagrafici');
    $idFisc   = $add($datiAnag, 'IdFiscaleIVA');
    $add($idFisc, 'IdPaese',  $MY_NAZIONE);
    $add($idFisc, 'IdCodice', $MY_PIVA);
    $anag = $add($datiAnag, 'Anagrafica');
    $add($anag, 'Denominazione', $MY_DENOMINAZIONE);
    $add($datiAnag, 'RegimeFiscale', $MY_REGIME);

    $sede = $add($cp, 'Sede');
    $add($sede, 'Indirizzo', $MY_INDIRIZZO);
    $add($sede, 'CAP',       $MY_CAP);
    $add($sede, 'Comune',    $MY_COMUNE);
    $add($sede, 'Provincia', $MY_PROV);
    $add($sede, 'Nazione',   $MY_NAZIONE);

    // CessionarioCommittente
    $cc   = $add($header, 'CessionarioCommittente');
    $ccAn = $add($cc, 'DatiAnagrafici');
    if ($CLIENT_PIVA) {
        $cf = $add($ccAn, 'IdFiscaleIVA');
        $add($cf, 'IdPaese',  'IT');
        $add($cf, 'IdCodice', $CLIENT_PIVA);
    }
    if ($CLIENT_CF && !$CLIENT_PIVA) {
        $add($ccAn, 'CodiceFiscale', $CLIENT_CF);
    }
    $ccName = $add($ccAn, 'Anagrafica');
    $add($ccName, 'Denominazione', $CLIENT_DENOM);

    $ccSede = $add($cc, 'Sede');
    $add($ccSede, 'Indirizzo', $CLIENT_ADDR);
    $add($ccSede, 'CAP',       $CLIENT_CAP);
    $add($ccSede, 'Comune',    $CLIENT_COMUNE);
    $add($ccSede, 'Provincia', $CLIENT_PROV);
    $add($ccSede, 'Nazione',   $CLIENT_NAZIONE);

    // Body (non qualificato)
    $body = $add($root, 'FatturaElettronicaBody');

    // DatiGeneraliDocumento
    $dg  = $add($body, 'DatiGenerali');
    $dgd = $add($dg, 'DatiGeneraliDocumento');
    $add($dgd, 'TipoDocumento', $TIPO_DOC);
    $add($dgd, 'Divisa',        $VALUTA);
    $add($dgd, 'Data',          $DATA_DOC);
    $add($dgd, 'Numero',        $NUMERO_DOC);

    // DatiBeniServizi
    $dbs = $add($body, 'DatiBeniServizi');
    $numLinea = 1;
    foreach ($lines as $L) {
        $dl = $add($dbs, 'DettaglioLinee');
        $add($dl, 'NumeroLinea',   (string) $numLinea++);
        $add($dl, 'Descrizione',   $L['descr']);
        $add($dl, 'Quantita',      $fmtQ((float) $L['qty']));
        $add($dl, 'UnitaMisura',   (string) $L['um']);
        $add($dl, 'PrezzoUnitario',$fmt8((float) $L['unit']));
        $add($dl, 'PrezzoTotale',  $fmt8((float) $L['imp']));
        $add($dl, 'AliquotaIVA',   $fmtRt((float) $L['vat']));
        // Se AliquotaIVA = 0, aggiungere Natura
    }
    foreach ($byVat as $vat => $tot) {
        $dr = $add($dbs, 'DatiRiepilogo');
        $add($dr, 'AliquotaIVA',       $fmtRt((float) $vat));
        $add($dr, 'ImponibileImporto', $fmt2((float) $tot['imp']));
        $add($dr, 'Imposta',           $fmt2((float) $tot['iva']));
        $add($dr, 'EsigibilitaIVA',    'I'); // I/D/S
    }

    // Pagamento
    $dp = $add($body, 'DatiPagamento');
    $add($dp, 'CondizioniPagamento', 'TP02');
    $mp = $add($dp, 'DettaglioPagamento');
    $add($mp, 'ModalitaPagamento', 'MP01');
    $add($mp, 'ImportoPagamento',  $fmt2((float) $TOTALE));

    // ================= 6) PRETTY PRINT + VALIDAZIONE ==============
    $filename = 'IT'.$MY_PIVA.'_'.$PROGRESSIVO_INVIO.'.xml';

    $prettyXml = $dom->saveXML();

    // ---- Percorsi XSD locali
    $xsdDir       = storage_path('app/fatturapa/xsd');
    $xsdMainPath  = $xsdDir.DIRECTORY_SEPARATOR.'fattura_v1.2.1.xsd';
    $xmldsigPath  = $xsdDir.DIRECTORY_SEPARATOR.'xmldsig-core-schema.xsd';

    if (!is_file($xsdMainPath) || !is_file($xmldsigPath)) {
        return response()->json([
            'ok'      => false,
            'message' => 'File XSD mancanti. Copia in '.$xsdDir.' i file: fattura_v1.2.1.xsd e xmldsig-core-schema.xsd',
        ], 500);
    }

    // ---- Helpers: normalizza XSD (rimuovi BOM e byte prima di <?xml)
    $normalizeXml = static function (string $s): string {
        if (strncmp($s, "\xEF\xBB\xBF", 3) === 0) {
            $s = substr($s, 3);
        }
        $p = strpos($s, '<?xml');
        if ($p !== false && $p > 0) {
            $s = substr($s, $p);
        }
        return str_replace("\r\n", "\n", $s);
    };

    // ---- Carico e normalizzo i due XSD
    $xsdMainRaw     = file_get_contents($xsdMainPath);
    $xsdXmldsigRaw  = file_get_contents($xmldsigPath);

    $xsdMainClean    = $normalizeXml($xsdMainRaw);
    $xsdXmldsigClean = $normalizeXml($xsdXmldsigRaw);

    // ---- Scrivo i due XSD temporanei "puliti"
    $tmpMain = $xsdDir.DIRECTORY_SEPARATOR.'_fattura_v1_2_1_main.clean.xsd';
    $tmpDs   = $xsdDir.DIRECTORY_SEPARATOR.'_xmldsig-core-schema.clean.xsd';
    file_put_contents($tmpMain,    $xsdMainClean);
    file_put_contents($tmpDs,      $xsdXmldsigClean);

    // ---- Sostituisco l’import del main per puntare al file xmldsig locale "clean"
    $tmpDsUri = 'file:///'.str_replace('\\', '/', realpath($tmpDs));
    $xsdEffective = str_replace(
        [
            'http://www.w3.org/TR/2002/REC-xmldsig-core-20020212/xmldsig-core-schema.xsd',
            'https://www.w3.org/TR/2002/REC-xmldsig-core-20020212/xmldsig-core-schema.xsd',
        ],
        $tmpDsUri,
        $xsdMainClean
    );
    file_put_contents($tmpMain, $xsdEffective);

    // -------- PRE-FLIGHT: schema parse check --------
    libxml_use_internal_errors(true);
    $schemaDom    = new \DOMDocument();
    $schemaLoadOk = @$schemaDom->load($tmpMain);

    if (!$schemaLoadOk) {
        $schemaErrors = array_map(static function (\LibXMLError $e) {
            return trim("Schema parse error: {$e->message} (line {$e->line}, col {$e->column})");
        }, libxml_get_errors());
        libxml_clear_errors();

        @unlink($tmpMain);
        @unlink($tmpDs);

        return response()->json([
            'ok'            => false,
            'message'       => 'XSD non valido/parsing fallito (probabile BOM o import corrotti).',
            'schema_errors' => $schemaErrors,
            'xsd_effective_head' => substr($xsdEffective, 0, 2000),
        ], 500);
    }

    // -------- VALIDAZIONE XML --------
    $domForValidation = new \DOMDocument('1.0', 'UTF-8');
    $domForValidation->preserveWhiteSpace = false;
    $domForValidation->formatOutput = false;
    $domForValidation->loadXML($prettyXml);

    libxml_clear_errors();
    set_error_handler(static function () { return true; });
    $isValid = @$domForValidation->schemaValidate($tmpMain);
    restore_error_handler();

    $libxmlErrors = array_map(static function (\LibXMLError $e) {
        $lvl = match ($e->level) {
            LIBXML_ERR_WARNING => 'Warning',
            LIBXML_ERR_ERROR   => 'Error',
            LIBXML_ERR_FATAL   => 'Fatal',
            default            => 'Info',
        };
        return trim("{$lvl}: {$e->message} (line {$e->line}, col {$e->column})");
    }, libxml_get_errors());
    libxml_clear_errors();

    // Pulizia XSD temporanei
    @unlink($tmpMain);
    @unlink($tmpDs);

    if (!$isValid) {
        // estraggo SOLO il body per debug
        $xmlBodyPretty = null;
        try {
            $tmpDom = new \DOMDocument('1.0', 'UTF-8');
            $tmpDom->loadXML($prettyXml);
            $bodyNode = $tmpDom->getElementsByTagName('FatturaElettronicaBody')->item(0);
            if ($bodyNode instanceof \DOMNode) {
                $xmlBodyPretty = $tmpDom->saveXML($bodyNode);
            }
        } catch (\Throwable $e) {}

        return response()->json([
            'ok'               => false,
            'message'          => 'XML non conforme agli XSD FatturaPA (v1.2.1).',
            'errors'           => $libxmlErrors,
            'xml_pretty'       => $prettyXml,
            'xml_body_pretty'  => $xmlBodyPretty,
            'xml_base64'       => base64_encode($prettyXml),
            'xsd_used'         => $xsdMainPath,
        ], 422);
    }

    return response($prettyXml, 200, [
        'Content-Type'        => 'application/xml; charset=UTF-8',
        'Content-Disposition' => 'attachment; filename="'.$filename.'"',
    ]);
}




}
