<?php

namespace App\Http\Controllers;

use App\Http\Resources\ClientResource;
use App\Http\Resources\TaskResource;
use App\Http\Resources\WorkerResource;
use App\Models\Client;
use App\Models\Detailwork;
use App\Models\Task;
use App\Models\Work;
use App\Models\Worker;
use App\Http\Requests\StoreWorkerRequest;
use App\Http\Requests\UpdateWorkerRequest;
use Carbon\Carbon;
use Illuminate\Contracts\Database\Eloquent\Builder;
use DB;
use Request;

class WorkerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        //TODO: SEGNALAZIONE LAVORI/TASK ATTIVI
        //FILTRAGGIO (DATA) ???
        //CREAZIONE TASK DA OPERAIO (AGGIUNTA CLIENTE LAVORO TASK)

        $query = Worker::query();

        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }

        if (request("code")) {
            $query->where("code", "like", "%" . request("code") . "%");
        }

        if (request("status")) {

            if (request("status") == 'applied') {

                //$wid = DB::raw(" SELECT worker_id FROM `DETAILWORKS` WHERE TASK IN (SELECT distinct ID FROM `tasks` WHERE str_to_date(due_date,'%Y-%m-%d') > CURDATE())  ");
                $wid = DB::raw(" SELECT worker_id FROM `detailworks` WHERE TASK IN (SELECT distinct ID FROM `tasks` WHERE str_to_date(due_date,'%Y-%m-%d') >= CURDATE() and str_to_date(starting_date,'%Y-%m-%d') <= CURDATE()  )  ");
                $query->whereIn("id", [$wid]);

            } else {

                //$wid = DB::raw(" SELECT worker_id FROM `DETAILWORKS` WHERE TASK IN (SELECT distinct ID FROM `tasks` WHERE str_to_date(due_date,'%Y-%m-%d') < CURDATE() )  ");

                $wid = DB::raw(" SELECT worker_id FROM `detailworks` WHERE NOT TASK IN (SELECT distinct ID FROM `tasks` WHERE str_to_date(due_date,'%Y-%m-%d') >= CURDATE() and str_to_date(starting_date,'%Y-%m-%d') <= CURDATE()  )  ");
                $query->whereIn("id", [$wid]);

            }

        }

        $workers = $query->paginate(10);

        //$workerTask = Detailwork::select('worker_id', 'task')->distinct()->get();

        //TORNA GLI OPERAI OCCUPATI
        $workerTask = $query = DB::select(" SELECT worker_id,task FROM `detailworks` WHERE TASK IN (SELECT ID FROM `tasks` WHERE str_to_date(due_date,'%Y-%m-%d') > CURDATE())  ");

        //dd($workerTask );
        //TASKID


        /*  $workerTask = DB::table('detailworks')
             ->where('votes', '>', 100)
             ->orWhere(function (Builder $query) {
                 $query->where('name', 'Abigail')
                       ->where('votes', '>', 50);
             })
             ->get(); */

        /* $queryworkerTask = $workerTask 
            ->where(function (Builder $query) {
                $queryworkerTask->where('starting_date', ">=", $startingDateFrom);
            
            return $queryworkerTask;

            })
            ->paginate(10); */

        /*  $startingDateFrom = (new Carbon(request("starting_date_from")))->format('Y-m-d');
         request("starting_date_from", $startingDateFrom);
         $query->where('starting_date', ">=", $startingDateFrom);
  */




        return inertia('Worker/Index', [

            "workers" => WorkerResource::collection($workers),
            "queryParams" => request()->query() ?: null,
            "workerTask" => $workerTask ?: null,


        ]);

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia("Worker/Create");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWorkerRequest $request)
    {
        //dd($request);
        $data = $request->validated();
        Worker::create($data);
        return to_route("worker.index")->with('success', 'Nuovo operaio inserito');
    }

    /**
     * Display the specified resource.
     */
    public function show(Worker $worker)
    {

        // STAMPE
        // CONTEGGIO ORE COMPLESSIVE PER PERIODO
        // CONTEGGIO ORE SU LAVORO PER PERIODO
        // CONTEGGIO ORE COMPITO

        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');

        $workerdetail = new WorkerResource($worker);
        $queryWorkerdetail = $workerdetail->where('id', $worker->id)->get();
        //$detailWorker = Detailwork::select('task')->where("worker_id", $worker->id)->distinct()->get();

        // FUNZIONA !!! $taskworker = $worker->tasks()->get();//QUERY DA SELECTFIELD SU taskworker




        $taskworker = $worker->tasks()
            ->where(function (Builder $query) {

                if (request("task_name")) {

                    $query->where("name", "like", "%" . request("task_name") . "%");

                }

                if (request("work_name")) {

                    $query->where("work_name", "like", "%" . request("work_name") . "%");

                }

                if (request("category")) {

                    $query->where("category", "like", "%" . request("category") . "%");

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
            ->orderBy($sortField, $sortDirection)->paginate(10);








        /* for ($i=0; $i <count($detailWorker) ; $i++) { 
           // $taskworker[$i+1] = Task::all()->where('id',$detailWorker[$i]->task);
           $taskworker = Task::all()->where('id',$detailWorker[$i]->task);
        }
 */


        return inertia('Worker/Show', [

            'worker' => $queryWorkerdetail,
            'taskworker' => $taskworker,
            //'taskworker'  => new TaskResource($taskworker),
            "queryParams" => request()->query() ?: null,

        ]);

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Worker $worker)
    {
        return inertia("Worker/Edit", ['worker' => new WorkerResource($worker)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWorkerRequest $request, Worker $worker)
    {
        $worker->update($request->validated());
        return to_route('worker.index')->with('success', 'Operaio modificato');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Worker $worker)
    {
        $worker->delete();
        return to_route('worker.index')
            ->with('success', "Operaio eliminato");
    }


    public function clientfromworker(Worker $worker)
    {


        //$queryClient = Client::query()->get();
        $queryClient = Client::query()->get();

        // dd($query);
        /* for ($i=0; $i <count($detailWorker) ; $i++) { 
           // $taskworker[$i+1] = Task::all()->where('id',$detailWorker[$i]->task);
           $taskworker = Task::all()->where('id',$detailWorker[$i]->task);
        }
 */


        return inertia('Worker/Clientfromworker', [


            'clients' => $queryClient,
            'worker' => $worker,
            "queryParams" => request()->query() ?: null,

        ]);

    }


    public function taskfromworker(StoreWorkerRequest $request)
    {

        //dd($request->client);
        // $client = new ClientResource($request->client);
        //$client = $request->client;
        //dd($client );


        $client = Client::query()->where('id', $request->client)->get();
        $worker = $request->worker;
        //dd($queryClient );
        //$client = new ClientResource($queryClient);



        $work = Client::find($request->client)->works()->get();


        // $queryWork = Work::query()->get();

        //$client = new ClientResource($client);

        //dd($queryWork);


        //$workerdetail = new WorkerResource($worker);
        //$query = $workerdetail->where('id', $worker->id)->get();
        //$detailWorker = Detailwork::select('task')->where("worker_id", $worker->id)->distinct()->get();
        //$taskworker = $worker->tasks()->get();
        // dd($query);
        /* for ($i=0; $i <count($detailWorker) ; $i++) { 
           // $taskworker[$i+1] = Task::all()->where('id',$detailWorker[$i]->task);
           $taskworker = Task::all()->where('id',$detailWorker[$i]->task);
        }
 */


        return inertia('Worker/Taskfromworker', [


            'client' => $client,
            'works' => $work,
            'worker' => $worker,
            "queryParams" => request()->query() ?: null,

        ]);

    }


    public function hoursDates(Worker $worker)
    {
        // http://127.0.0.1:8000/worker/hoursDates
        //$taskworker = $worker;
        //dd($taskworker);
        //dd(request());


        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');

        $workerdetail = new WorkerResource($worker);
        $queryWorkerdetail = $workerdetail->where('id', $worker->id)->get();
        //$detailWorker = Detailwork::select('task')->where("worker_id", $worker->id)->distinct()->get();

        // FUNZIONA !!! $taskworker = $worker->tasks()->get();//QUERY DA SELECTFIELD SU taskworker




        $taskworker = $worker->tasks()
            ->where(function (Builder $query) {

                if (request("task_name")) {

                    $query->where("name", "like", "%" . request("task_name") . "%");

                }

                if (request("work_name")) {

                    $query->where("work_name", "like", "%" . request("work_name") . "%");

                }

                if (request("category")) {

                    $query->where("category", "like", "%" . request("category") . "%");

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
            ->orderBy($sortField, $sortDirection)->paginate(10);








        return inertia('Print/HoursDates', [



           // 'worker' => $taskworker,
           
            'worker' => $queryWorkerdetail,
            'taskworker' => $taskworker,
            //'taskworker'  => new TaskResource($taskworker),
            "queryParams" => request()->query() ?: null,

        ]);

    }



}
