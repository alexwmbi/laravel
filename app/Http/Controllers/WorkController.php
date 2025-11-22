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
use App\Models\SalesInvoice;
use App\Http\Requests\StoreWorkRequest;
use App\Http\Requests\UpdateWorkRequest;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use League\CommonMark\Extension\Attributes\Node\Attributes;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use SimpleXMLElement;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class WorkController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Work::query();

        if (request('name')) {
            $query->where('name', 'like', '%' . request('name') . '%');
        }

        $works = $query->paginate(10);
        $client = Work::with('clients')->get();

        return inertia('Work/Index', [
            'works'       => WorkResource::collection($works),
            'client'      => compact('client'),
            'queryParams' => request()->query() ?: null,
            'success'     => session('success'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('Work/Create');
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

        return to_route('client.show', $client_id)
            ->with('success', 'Nuovo lavoro inserito');
    }

    /**
     * Display the specified resource.
     */
    public function show(Work $work)
    {
        $work = new WorkResource($work);

        $sortField     = request('sort_field', 'created_at');
        $sortDirection = request('sort_direction', 'desc');

        Session::put('work', $work->name);
        Session::put('work_id', $work->id);
        $client    = Session::get('client_name');
        $client_id = Session::get('client_id');

        $query = $work->tasks()
            ->where(function (Builder $query) {

                if (request('name')) {
                    $query->where('name', 'like', '%' . request('name') . '%');
                }

                if (request('note')) {
                    $query->where('note', 'like', '%' . request('note') . '%');
                }

                if (request('description')) {
                    $query->where('description', 'like', '%' . request('description') . '%');
                }

                if (request('code')) {
                    $query->where('code', 'like', '%' . request('code') . '%');
                }

                if (request('starting_date_from') || request('starting_date_to')) {
                    if (request('starting_date_from')) {
                        $startingDateFrom = (new Carbon(request('starting_date_from')))->format('Y-m-d');
                        request('starting_date_from', $startingDateFrom);
                        $query->where('starting_date', '>=', $startingDateFrom);
                    }

                    if (request('starting_date_to')) {
                        $starting_date_to = (new Carbon(request('starting_date_to')))->format('Y-m-d');
                        request('starting_date_to', $starting_date_to);
                        $query->where('starting_date', '<=', $starting_date_to);
                    }
                }

                if (request('due_date_from') || request('due_date_to')) {
                    if (request('due_date_from')) {
                        $dueDateFrom = (new Carbon(request('due_date_from')))->format('Y-m-d');
                        request('due_date_from', $dueDateFrom);
                        $query->where('due_date', '>=', $dueDateFrom);
                    }

                    if (request('due_date_to')) {
                        $due_date_to = (new Carbon(request('due_date_to')))->format('Y-m-d');
                        request('due_date_to', $due_date_to);
                        $query->where('due_date', '<=', $due_date_to);
                    }
                }

                return $query;
            })
            ->orderBy($sortField, $sortDirection)
            ->paginate(10);

        return inertia('Work/Show', [
            'work'        => $work,
            'tasks'       => TaskResource::collection($query),
            'queryParams' => request()->query() ?: null,
            'success'     => session('success'),
            'print'       => session('print'),
            'client'      => $client,
            'client_id'   => $client_id,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Work $work)
    {
        return inertia('Work/Edit', [
            'work' => new WorkResource($work),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWorkRequest $request, Work $work)
    {
        $work->update($request->validated());

        return to_route('client.index')
            ->with('success', 'Lavoro modificato');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Work $work)
    {
        $work->delete();

        return to_route('client.index')
            ->with('success', 'Lavoro eliminato');
    }

    public function print(Work $work)
    {
        $work  = new WorkResource($work);
        $tasks = $work->tasks()->get();

        $taskId         = [];
        $detailMaterial = new Detailmaterial();
        $detailWork     = new Detailwork();
        $hoursTot       = 0;
        $materialsTot   = 0;

        foreach ($tasks as $task) {
            $taskId[] = $task->id;
        }

        $detailMaterial = Detailmaterial::select(
            'id',
            'task',
            'material_id',
            'quantity',
            'default_aug',
            'custom_aug',
            'priece',
            'aug',
            'um',
            'name',
            'code',
            'task'
        )
            ->whereIn('task', $taskId)
            ->distinct()
            ->orderBy('task')
            ->get();

        $detailWork = Detailwork::select(
            'name',
            'code',
            'worker_id',
            'hours',
            'status',
            'task'
        )
            ->whereIn('task', $taskId)
            ->distinct()
            ->orderBy('task')
            ->get();

        $hoursTot = $detailWork->sum('hours');

        $taskMaterials = Detailmaterial::selectRaw(
            'task, (( priece + ( priece * default_aug / 100) + ( priece * custom_aug / 100 )) * quantity) as price_quantity'
        )
            ->whereIn('task', $taskId)
            ->get();

        $materialsTot         = $taskMaterials->sum('price_quantity');
        $materialTaskDistinct = $taskMaterials->groupBy('task');

        Session::put('work_id', $work->id);
        $client    = Session::get('client_name');
        $client_id = Session::get('client_id');
        $clientData = DB::table('clients')->where('id', $client_id)->first();

        $query = $work->tasks()
            ->where(function (Builder $query) {

                if (request('name')) {
                    $query->where('name', 'like', '%' . request('name') . '%');
                }

                if (request('note')) {
                    $query->where('note', 'like', '%' . request('note') . '%');
                }

                if (request('description')) {
                    $query->where('description', 'like', '%' . request('description') . '%');
                }

                if (request('code')) {
                    $query->where('code', 'like', '%' . request('code') . '%');
                }

                if (request('starting_date_from') || request('starting_date_to')) {

                    if (request('starting_date_from')) {
                        $startingDateFrom = (new Carbon(request('starting_date_from')))->format('Y-m-d');
                        request('starting_date_from', $startingDateFrom);
                        $query->where('starting_date', '>=', $startingDateFrom);
                    }

                    if (request('starting_date_to')) {
                        $starting_date_to = (new Carbon(request('starting_date_to')))->format('Y-m-d');
                        request('starting_date_to', $starting_date_to);
                        $query->where('starting_date', '<=', $starting_date_to);
                    }
                }

                if (request('due_date_from') || request('due_date_to')) {

                    if (request('due_date_from')) {
                        $dueDateFrom = (new Carbon(request('due_date_from')))->format('Y-m-d');
                        request('due_date_from', $dueDateFrom);
                        $query->where('due_date', '>=', $dueDateFrom);
                    }

                    if (request('due_date_to')) {
                        $due_date_to = (new Carbon(request('due_date_to')))->format('Y-m-d');
                        request('due_date_to', $due_date_to);
                        $query->where('due_date', '<=', $due_date_to);
                    }
                }

                return $query;
            })
            ->paginate(10);

        $hoursCostTot = 0;

        return inertia('Print/Preventive', [
            'detailmaterial'       => DetailmaterialResource::collection($detailMaterial),
            'detailwork'           => DetailworkResource::collection($detailWork),
            'work'                 => $work,
            'tasks'                => TaskResource::collection($query),
            'queryParams'          => request()->query() ?: null,
            'success'              => session('success'),
            'print'                => session('print'),
            'client'               => $client,
            'client_id'            => $client_id,
            'hoursTot'             => $hoursTot,
            'materialsTot'         => $materialsTot,
            'clientData'           => $clientData,
            'materialTaskDistinct' => $materialTaskDistinct,
            'hoursCostTot'         => $hoursCostTot,
        ]);
    }

    public function conformity(Work $work)
    {
        $work  = new WorkResource($work);
        $tasks = $work->tasks()->get();

        $taskId         = [];
        $detailMaterial = new Detailmaterial();
        $detailWork     = new Detailwork();
        $hoursTot       = 0;
        $materialsTot   = 0;

        foreach ($tasks as $task) {
            $taskId[] = $task->id;
        }

        $detailMaterial = Detailmaterial::select(
            'id',
            'task',
            'material_id',
            'quantity',
            'default_aug',
            'custom_aug',
            'priece',
            'aug',
            'um',
            'name',
            'code',
            'task'
        )
            ->whereIn('task', $taskId)
            ->distinct()
            ->orderBy('task')
            ->get();

        $detailWork = Detailwork::select(
            'name',
            'code',
            'worker_id',
            'hours',
            'status',
            'task'
        )
            ->whereIn('task', $taskId)
            ->distinct()
            ->orderBy('task')
            ->get();

        $hoursTot = $detailWork->sum('hours');

        $taskMaterials = Detailmaterial::selectRaw(
            'task, (( priece + ( priece * default_aug / 100) + ( priece * custom_aug / 100 )) * quantity) as price_quantity'
        )
            ->whereIn('task', $taskId)
            ->get();

        $materialsTot         = $taskMaterials->sum('price_quantity');
        $materialTaskDistinct = $taskMaterials->groupBy('task');

        Session::put('work_id', $work->id);
        $client     = Session::get('client_name');
        $client_id  = Session::get('client_id');
        $clientData = DB::table('clients')->where('id', $client_id)->first();

        $query = $work->tasks()
            ->where(function (Builder $query) {

                if (request('name')) {
                    $query->where('name', 'like', '%' . request('name') . '%');
                }

                if (request('note')) {
                    $query->where('note', 'like', '%' . request('note') . '%');
                }

                if (request('description')) {
                    $query->where('description', 'like', '%' . request('description') . '%');
                }

                if (request('code')) {
                    $query->where('code', 'like', '%' . request('code') . '%');
                }

                if (request('starting_date_from') || request('starting_date_to')) {

                    if (request('starting_date_from')) {
                        $startingDateFrom = (new Carbon(request('starting_date_from')))->format('Y-m-d');
                        request('starting_date_from', $startingDateFrom);
                        $query->where('starting_date', '>=', $startingDateFrom);
                    }

                    if (request('starting_date_to')) {
                        $starting_date_to = (new Carbon(request('starting_date_to')))->format('Y-m-d');
                        request('starting_date_to', $starting_date_to);
                        $query->where('starting_date', '<=', $starting_date_to);
                    }
                }

                if (request('due_date_from') || request('due_date_to')) {

                    if (request('due_date_from')) {
                        $dueDateFrom = (new Carbon(request('due_date_from')))->format('Y-m-d');
                        request('due_date_from', $dueDateFrom);
                        $query->where('due_date', '>=', $dueDateFrom);
                    }

                    if (request('due_date_to')) {
                        $due_date_to = (new Carbon(request('due_date_to')))->format('Y-m-d');
                        request('due_date_to', $due_date_to);
                        $query->where('due_date', '<=', $due_date_to);
                    }
                }

                return $query;
            })
            ->paginate(10);

        return inertia('Print/Conformity', [
            'detailmaterial'       => DetailmaterialResource::collection($detailMaterial),
            'detailwork'           => DetailworkResource::collection($detailWork),
            'work'                 => $work,
            'tasks'                => TaskResource::collection($query),
            'queryParams'          => request()->query() ?: null,
            'success'              => session('success'),
            'print'                => session('print'),
            'client'               => $client,
            'client_id'            => $client_id,
            'hoursTot'             => $hoursTot,
            'materialsTot'         => $materialsTot,
            'clientData'           => $clientData,
            'materialTaskDistinct' => $materialTaskDistinct,
        ]);
    }

    public function invoice(Work $work)
    {
        $work  = new WorkResource($work);
        $tasks = $work->tasks()->get();

        $taskId         = [];
        $detailMaterial = new Detailmaterial();
        $detailWork     = new Detailwork();
        $hoursTot       = 0;
        $materialsTot   = 0;

        foreach ($tasks as $task) {
            $taskId[] = $task->id;
        }

        $detailMaterial = Detailmaterial::select(
            'id',
            'task',
            'material_id',
            'quantity',
            'priece',
            'default_aug',
            'custom_aug',
            'aug',
            'um',
            'name',
            'code',
            'task'
        )
            ->whereIn('task', $taskId)
            ->distinct()
            ->orderBy('task')
            ->get();

        $detailWork = Detailwork::select(
            'name',
            'code',
            'worker_id',
            'hours',
            'priece',
            'aug',
            'status',
            'task'
        )
            ->whereIn('task', $taskId)
            ->distinct()
            ->orderBy('task')
            ->get();

        $hoursTot    = $detailWork->sum('hours');
        $hourspriece = $tasks->sum('hourspriece');

        $taskMaterials = Detailmaterial::selectRaw(
            'task, (( priece + ( priece * default_aug / 100) + ( priece * custom_aug / 100 )) * quantity) as price_quantity'
        )
            ->whereIn('task', $taskId)
            ->get();

        $materialsTot         = $taskMaterials->sum('price_quantity');
        $materialTaskDistinct = $taskMaterials->groupBy('task');

        Session::put('work_id', $work->id);
        $client     = Session::get('client_name');
        $client_id  = Session::get('client_id');
        $clientData = DB::table('clients')->where('id', $client_id)->first();

        $query = $work->tasks()
            ->where(function (Builder $query) {

                if (request('name')) {
                    $query->where('name', 'like', '%' . request('name') . '%');
                }

                if (request('note')) {
                    $query->where('note', 'like', '%' . request('note') . '%');
                }

                if (request('description')) {
                    $query->where('description', 'like', '%' . request('description') . '%');
                }

                if (request('code')) {
                    $query->where('code', 'like', '%' . request('code') . '%');
                }

                if (request('starting_date_from') || request('starting_date_to')) {

                    if (request('starting_date_from')) {
                        $startingDateFrom = (new Carbon(request('starting_date_from')))->format('Y-m-d');
                        request('starting_date_from', $startingDateFrom);
                        $query->where('starting_date', '>=', $startingDateFrom);
                    }

                    if (request('starting_date_to')) {
                        $starting_date_to = (new Carbon(request('starting_date_to')))->format('Y-m-d');
                        request('starting_date_to', $starting_date_to);
                        $query->where('starting_date', '<=', $starting_date_to);
                    }
                }

                if (request('due_date_from') || request('due_date_to')) {

                    if (request('due_date_from')) {
                        $dueDateFrom = (new Carbon(request('due_date_from')))->format('Y-m-d');
                        request('due_date_from', $dueDateFrom);
                        $query->where('due_date', '>=', $dueDateFrom);
                    }

                    if (request('due_date_to')) {
                        $due_date_to = (new Carbon(request('due_date_to')))->format('Y-m-d');
                        request('due_date_to', $due_date_to);
                        $query->where('due_date', '<=', $due_date_to);
                    }
                }

                return $query;
            })
            ->paginate(10);

        return inertia('Print/Invoice', [
            'detailmaterial'       => DetailmaterialResource::collection($detailMaterial),
            'detailwork'           => DetailworkResource::collection($detailWork),
            'work'                 => $work,
            'tasks'                => TaskResource::collection($query),
            'queryParams'          => request()->query() ?: null,
            'success'              => session('success'),
            'print'                => session('print'),
            'client'               => $client,
            'client_id'            => $client_id,
            'hoursTot'             => $hoursTot,
            'materialsTot'         => $materialsTot,
            'clientData'           => $clientData,
            'materialTaskDistinct' => $materialTaskDistinct,
            'hourspriece'          => $hourspriece,
        ]);
    }



    public function invoicePrint(Work $work, Request $request)
    {
        // leggo ciò che arriva dalla pagina di selezione
        $taskQurery      = $request->input('selectedItemsTask', []);
        $materialQuery   = $request->input('selectedItemsMaterials', []);
        $tipoDocumento   = $request->input('tipo_documento', 'TD01');

        $work  = new WorkResource($work);
        $tasks = $work->tasks()->get();

        $hourspriece = $tasks->sum('hourspriece');

        $taskId         = [];
        $detailMaterial = new Detailmaterial();
        $detailWork     = new Detailwork();
        $hoursTot       = 0;
        $materialsTot   = 0;

        foreach ($tasks as $task) {
            $taskId[] = $task->id;
        }

        $detailMaterial = Detailmaterial::select(
            'id',
            'task',
            'material_id',
            'quantity',
            'priece',
            'default_aug',
            'custom_aug',
            'aug',
            'um',
            'name',
            'code',
            'task'
        )
            ->whereIn('task', $taskId)
            ->distinct()
            ->orderBy('task');

        if (!empty($materialQuery)) {
            $detailMaterial = $detailMaterial->whereIn('id', $materialQuery)->get();
        } else {
            $detailMaterial = $detailMaterial->get();
        }

        $detailWork = Detailwork::select(
            'name',
            'code',
            'worker_id',
            'hours',
            'status',
            'task'
        )
            ->whereIn('task', $taskId)
            ->distinct()
            ->orderBy('task')
            ->get();

        $hoursTot = $detailWork->sum('hours');

        $taskMaterials = Detailmaterial::selectRaw(
            'task, (( priece + ( priece * default_aug / 100) + ( priece * custom_aug / 100 )) * quantity) as price_quantity'
        )
            ->whereIn('task', $taskId)
            ->get();

        $materialsTot         = $taskMaterials->sum('price_quantity');
        $materialTaskDistinct = $taskMaterials->groupBy('task');

        Session::put('work_id', $work->id);
        $client     = Session::get('client_name');
        $client_id  = Session::get('client_id');
        $clientData = DB::table('clients')->where('id', $client_id)->first();

        $testqry = implode(',', $taskQurery);

        if ($testqry) {
            $query = DB::select(
                'select * from `tasks` inner join `task_work` on `tasks`.`id` = `task_work`.`task_id` where `task_work`.`work_id` = ? and  `task_work`.`task_id` in  (' . $testqry . ')',
                [$work->id]
            );
        } else {
            $query = [];
        }

        $taskHours = 0;
        foreach ($query as $task) {
            $taskHours += $task->hours;
        }

        return inertia('Print/InvoicePrint', [
            'detailmaterial'       => $detailMaterial,
            'detailwork'           => DetailworkResource::collection($detailWork),
            'work'                 => $work,
            'tasks'                => TaskResource::collection($query),
            'queryParams'          => $request->query() ?: null,
            'success'              => session('success'),
            'print'                => session('print'),
            'client'               => $client,
            'client_id'            => $client_id,
            'hoursTot'             => $taskHours,
            'materialsTot'         => $materialsTot,
            'clientData'           => $clientData,
            'materialTaskDistinct' => $materialTaskDistinct,
            'hourspriece'          => $hourspriece,

            // questi servono alla view per richiamare invoiceXml
            'selectedItemsTask'       => $taskQurery,
            'selectedItemsMaterials'  => $materialQuery,
            'tipo_documento'          => $tipoDocumento,
        ]);
    }


    // public function invoicePrint(Work $work)
    // {
    //     $taskQurery    = request('selectedItemsTask', []);
    //     $materialQuery = request('selectedItemsMaterials', []);

    //     $work  = new WorkResource($work);
    //     $tasks = $work->tasks()->get();

    //     $hourspriece = $tasks->sum('hourspriece');

    //     $taskId         = [];
    //     $detailMaterial = new Detailmaterial();
    //     $detailWork     = new Detailwork();
    //     $hoursTot       = 0;
    //     $materialsTot   = 0;

    //     foreach ($tasks as $task) {
    //         $taskId[] = $task->id;
    //     }

    //     $detailMaterial = Detailmaterial::select(
    //         'id',
    //         'task',
    //         'material_id',
    //         'quantity',
    //         'priece',
    //         'default_aug',
    //         'custom_aug',
    //         'aug',
    //         'um',
    //         'name',
    //         'code',
    //         'task'
    //     )
    //         ->whereIn('task', $taskId)
    //         ->distinct()
    //         ->orderBy('task');

    //     if ($materialQuery) {
    //         $detailMaterial = $detailMaterial->whereIn('id', $materialQuery)->get();
    //     }

    //     $detailWork = Detailwork::select(
    //         'name',
    //         'code',
    //         'worker_id',
    //         'hours',
    //         'status',
    //         'task'
    //     )
    //         ->whereIn('task', $taskId)
    //         ->distinct()
    //         ->orderBy('task')
    //         ->get();

    //     $hoursTot = $detailWork->sum('hours');

    //     $taskMaterials = Detailmaterial::selectRaw(
    //         'task, (( priece + ( priece * default_aug / 100) + ( priece * custom_aug / 100 )) * quantity) as price_quantity'
    //     )
    //         ->whereIn('task', $taskId)
    //         ->get();

    //     $materialsTot         = $taskMaterials->sum('price_quantity');
    //     $materialTaskDistinct = $taskMaterials->groupBy('task');

    //     Session::put('work_id', $work->id);
    //     $client     = Session::get('client_name');
    //     $client_id  = Session::get('client_id');
    //     $clientData = DB::table('clients')->where('id', $client_id)->first();

    //     $testqry = implode(',', $taskQurery);

    //     if ($testqry) {
    //         $query = DB::select(
    //             'select * from `tasks` inner join `task_work` on `tasks`.`id` = `task_work`.`task_id` where `task_work`.`work_id` = ? and  `task_work`.`task_id` in  (' . $testqry . ')',
    //             [$work->id]
    //         );
    //     } else {
    //         $query = [];
    //     }

    //     $taskHours = 0;
    //     foreach ($query as $task) {
    //         $taskHours += $task->hours;
    //     }

    //     return inertia('Print/InvoicePrint', [
    //         'detailmaterial'       => $detailMaterial,
    //         'detailwork'           => DetailworkResource::collection($detailWork),
    //         'work'                 => $work,
    //         'tasks'                => TaskResource::collection($query),
    //         'queryParams'          => request()->query() ?: null,
    //         'success'              => session('success'),
    //         'print'                => session('print'),
    //         'client'               => $client,
    //         'client_id'            => $client_id,
    //         'hoursTot'             => $taskHours,
    //         'materialsTot'         => $materialsTot,
    //         'clientData'           => $clientData,
    //         'materialTaskDistinct' => $materialTaskDistinct,
    //         'hourspriece'          => $hourspriece,
    //     ]);
    // }

    public function attach(Work $work)
    {
        $work        = new WorkResource($work);
        $attachedUrl = DB::select(
            'select `id` , `filename` , `fileurl` from `attaches`  where `work_id` = ?',
            [$work->id]
        );

        return inertia('Print/Attach', [
            'work'        => $work,
            'queryParams' => request()->query() ?: null,
            'success'     => session('success'),
            'file_path'   => $attachedUrl,
        ]);
    }

    /**
     * Generazione XML FatturaPA con supporto a TD01 / TD02 / TD04.
     */
    public function invoiceXml(Work $work, Request $request)
    {
        Log::info('➡️ invoiceXml avviata (con XSD)', [
            'work_id' => $work->id,
            'payload' => $request->all(),
        ]);

        // ================== 0) TIPO DOCUMENTO & FATTURA ORIGINE ==================

        // Letto dalla tendina React: tipo_documento = TD01 | TD02 | TD04
        $TIPO_DOC = strtoupper((string) $request->input('tipo_documento', 'TD01'));

        if (!in_array($TIPO_DOC, ['TD01', 'TD02', 'TD04'], true)) {
            $TIPO_DOC = 'TD01';
        }

        // Nota di credito: eventuale fattura origine (ID della nostra tabella sales_invoices)
        $originalInvoiceId = $request->input('original_invoice_id');
        $originalInvoice   = null;

        if ($TIPO_DOC === 'TD04' && $originalInvoiceId) {
            $originalInvoice = SalesInvoice::find($originalInvoiceId);

            if (!$originalInvoice) {
                Log::warning('⚠️ Nota di credito senza fattura origine valida', [
                    'work_id'             => $work->id,
                    'original_invoice_id' => $originalInvoiceId,
                ]);
            }
        }

        // TD04 = nota di credito → importi negativi
        $sign = ($TIPO_DOC === 'TD04') ? -1 : 1;

        // ========================== 1) INPUT ==========================
        $selectedTaskIds = collect($request->input('selectedItemsTask', []))
            ->map(static fn($v) => (int) $v)
            ->filter()
            ->values();

        $selectedMaterialIds = collect($request->input('selectedItemsMaterials', []))
            ->map(static fn($v) => (int) $v)
            ->filter()
            ->values();

        // ======================= 2) DATI DI BASE ======================
        $work->load(['tasks', 'clients']);

        $allTaskIds       = $work->tasks()->pluck('tasks.id');
        $taskIdsForTotals = $selectedTaskIds->isNotEmpty() ? $selectedTaskIds : $allTaskIds;

        // Materiali
        $materialsQ = Detailmaterial::whereIn('task', $taskIdsForTotals)
            ->select([
                'id',
                'task',
                'material_id',
                'quantity',
                'default_aug',
                'custom_aug',
                'um',
                'name',
                'code',
                DB::raw('priece as price'),
            ])
            ->orderBy('task');

        if ($selectedMaterialIds->isNotEmpty()) {
            $materialsQ->whereIn('id', $selectedMaterialIds);
        }
        $materials = $materialsQ->get();

        // Lavorazioni
        $works = Detailwork::whereIn('task', $taskIdsForTotals)
            ->select(['task', 'name', 'code', 'hours', DB::raw('priece as price'), 'aug'])
            ->orderBy('task')
            ->get();

        // =================== 3) CALCOLI RIGHE / TOTALI =================
        $DEFAULT_VAT = 22.00;

        $lines = [];
        foreach ($materials as $m) {
            $base = (float) $m->price;
            $unitBase = $base
                + ($base * ((float) ($m->default_aug ?? 0)) / 100)
                + ($base * ((float) ($m->custom_aug ?? 0)) / 100);

            $qty = (float) $m->quantity;

            // TD01/TD02: positivo / TD04: negativo
            $unit = $unitBase * $sign;
            $imp  = $unitBase * $qty * $sign;
            $iva  = $imp * ($DEFAULT_VAT / 100);

            $lines[] = [
                'descr' => $m->name ?? ('Materiale ' . $m->code),
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
            $unitBase = $base + ($base * ((float) ($w->aug ?? 0)) / 100);

            $qty = (float) $w->hours;

            $unit = $unitBase * $sign;
            $imp  = $unitBase * $qty * $sign;
            $iva  = $imp * ($DEFAULT_VAT / 100);

            $lines[] = [
                'descr' => $w->name ?? ('Manodopera ' . $w->code),
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

        // Riepilogo IVA per JSON in sales_invoices
        $vatSummary = [];
        foreach ($byVat as $vat => $tot) {
            $vatSummary[] = [
                'aliquota'    => (float) $vat,
                'natura'      => null,
                'imponibile'  => (float) $tot['imp'],
                'imposta'     => (float) $tot['iva'],
            ];
        }

        // ===================== 4) ANAGRAFICHE ===================
        // Dati nostri (cedente/prestatore)
        $MY_DENOMINAZIONE = 'CASTELLARE IMPIANTI S.N.C. di Mariottini Daniele & C.';
        $MY_PIVA          = '00419390471';
        $MY_CF            = '00419390471';
        $MY_REGIME        = 'RF01';
        $MY_NAZIONE       = 'IT';
        $MY_PROV          = 'PT';
        $MY_COMUNE        = 'Pistoia';
        $MY_CAP           = '51017';
        $MY_INDIRIZZO     = 'Via del Castellare';

        // Cliente associato al Work (primo della relazione many-to-many)
        $client = $work->clients->first();

        if (!$client) {
            Log::error('❌ Nessun client associato al Work per la generazione fattura', [
                'work_id' => $work->id,
            ]);

            return response()->json([
                'ok'      => false,
                'message' => 'Nessun cliente associato al lavoro. Impossibile generare la fattura elettronica.',
            ], 422);
        }

        // Helper per safe trim + truncation
        $safeStr = static function (?string $value, int $maxLen, string $default = ''): string {
            $value = $value ?? '';
            $value = trim($value);
            if ($value === '') {
                $value = $default;
            }
            if ($value === '') {
                return '';
            }
            return mb_substr($value, 0, $maxLen);
        };

        // Denominazione: uso SEMPRE Denominazione, anche per privati.
        $rawDenom = trim(($client->name ?? '') . ' ' . ($client->surname ?? ''));
        if ($rawDenom === '') {
            $rawDenom = 'CLIENTE SCONOSCIUTO';
        }
        $CLIENT_DENOM = $safeStr($rawDenom, 80, 'CLIENTE SCONOSCIUTO');

        // P.IVA e CF
        $CLIENT_PIVA = null;
        if (!empty($client->piva)) {
            // tolgo spazi e caratteri non numerici
            $pivaClean = preg_replace('/\D+/', '', $client->piva);
            $CLIENT_PIVA = $pivaClean !== '' ? $pivaClean : null;
        }

        $CLIENT_CF = null;
        if (!empty($client->cod_fiscale)) {
            $CLIENT_CF = strtoupper(trim($client->cod_fiscale));
        }

        // Indirizzo di fatturazione dal DB
        // address1 = via, address2 = civico
        $indirizzoParts = [];
        if (!empty($client->address1)) {
            $indirizzoParts[] = trim($client->address1);
        }
        if (!empty($client->address2)) {
            $indirizzoParts[] = trim($client->address2);
        }
        $CLIENT_ADDR = implode(' ', $indirizzoParts);
        $CLIENT_ADDR = $safeStr($CLIENT_ADDR, 60, 'ND');
        if ($CLIENT_ADDR === '') {
            $CLIENT_ADDR = 'ND';
        }

        // CAP / Comune / Provincia / Nazione
        $CLIENT_CAP = $safeStr($client->address3 ?? null, 5, '00000');
        if ($CLIENT_CAP === '') {
            $CLIENT_CAP = '00000';
        }

        $CLIENT_COMUNE = $safeStr($client->address4 ?? null, 60, 'ND');
        if ($CLIENT_COMUNE === '') {
            $CLIENT_COMUNE = 'ND';
        }

        $CLIENT_PROV = strtoupper($safeStr($client->address5 ?? null, 2, 'XX'));
        if ($CLIENT_PROV === '') {
            $CLIENT_PROV = 'XX';
        }

        $CLIENT_NAZIONE = strtoupper($safeStr($client->address6 ?? null, 2, 'IT'));
        if ($CLIENT_NAZIONE === '') {
            $CLIENT_NAZIONE = 'IT';
        }

        // Codice Destinatario (campo "address" nel legacy DB)
        $rawCodiceDest = trim((string) ($client->address ?? ''));
        $rawCodiceDest = strtoupper($rawCodiceDest);

        if ($rawCodiceDest === '' || !preg_match('/^[A-Z0-9]{6,7}$/', $rawCodiceDest)) {
            $CODICE_DEST = '0000000';
        } else {
            $CODICE_DEST = $rawCodiceDest;
        }

        // PEC destinatario: solo se CodiceDest = 0000000
        $PEC_DEST = null;
        if ($CODICE_DEST === '0000000' && !empty($client->email)) {
            $PEC_DEST = $client->email;
        }

        // ===================== 5) DATI DOCUMENTO ===================
        $today = now();
        $progressivoInvioDb = $today->format('YmdHis');     // 14 cifre, unico
        $PROGRESSIVO_INVIO  = substr($progressivoInvioDb, 0, 10); // per XML

        $FORMATO_TRASM = 'FPR12'; // fattura verso privati/aziende
        $NUMERO_DOC    = 'INV-' . $work->id;
        $DATA_DOC      = $today->format('Y-m-d');

        // 🔴 TIPO DOCUMENTO da richiesta (dropdown React)
        $TIPO_DOC = strtoupper((string) $request->input('tipo_documento', 'TD01'));

        if (!in_array($TIPO_DOC, ['TD01', 'TD02', 'TD04'], true)) {
            $TIPO_DOC = 'TD01';
        }

        $VALUTA        = 'EUR';
        $IMPONIBILE    = array_sum(array_column($lines, 'imp'));
        $IMPOSTA       = array_sum(array_column($lines, 'iva'));
        $TOTALE        = $IMPONIBILE + $IMPOSTA;




        // Pagamento: giorni da client->giorni
        $giorniPagamento = (int) ($client->giorni ?? 0);
        $dataScadenzaPagamento = null;
        if ($giorniPagamento > 0) {
            $dataScadenzaPagamento = $today->copy()->addDays($giorniPagamento)->format('Y-m-d');
        }
        // Modalità pagamento: uso sempre bonifico (MP05)
        $MODALITA_PAG = 'MP05';

        $fmt2  = static fn(float $v) => number_format($v, 2, '.', '');
        $fmtQ  = static fn(float $v) => number_format($v, 2, '.', '');
        $fmt8  = static fn(float $v) => number_format($v, 2, '.', '');
        $fmtRt = static fn(float $v) => number_format($v, 2, '.', '');

        // ===================== 6) COSTRUZIONE XML (DOM) ======================
        $ns = 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2';
        $ds = 'http://www.w3.org/2000/09/xmldsig#';

        $dom = new \DOMDocument('1.0', 'UTF-8');
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = true;

        $root = $dom->createElementNS($ns, 'p:FatturaElettronica');
        $root->setAttribute('versione', $FORMATO_TRASM);
        $root->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:ds', $ds);
        $dom->appendChild($root);

        $add = static function (\DOMNode $parent, string $name, ?string $value = null) use ($dom): \DOMElement {
            $el = $dom->createElement($name);
            if ($value !== null) {
                $el->appendChild($dom->createTextNode($value));
            }
            $parent->appendChild($el);
            return $el;
        };

        // Header
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

        // Body
        $body = $add($root, 'FatturaElettronicaBody');

        // DatiGeneraliDocumento
        $dg  = $add($body, 'DatiGenerali');
        $dgd = $add($dg, 'DatiGeneraliDocumento');
        $add($dgd, 'TipoDocumento', $TIPO_DOC);
        $add($dgd, 'Divisa',        $VALUTA);
        $add($dgd, 'Data',          $DATA_DOC);
        $add($dgd, 'Numero',        $NUMERO_DOC);

        // Se è nota di credito e abbiamo la fattura origine: DatiFattureCollegate
        if ($TIPO_DOC === 'TD04' && $originalInvoice) {
            $dfc = $add($dg, 'DatiFattureCollegate');
            $add($dfc, 'IdDocumento', $safeStr($originalInvoice->numero ?? '', 20, ''));
            if (!empty($originalInvoice->data_documento)) {
                $add($dfc, 'Data', $originalInvoice->data_documento);
            }
        }

        // DatiBeniServizi
        $dbs = $add($body, 'DatiBeniServizi');
        $numLinea = 1;
        foreach ($lines as $L) {
            $dl = $add($dbs, 'DettaglioLinee');
            $add($dl, 'NumeroLinea',   (string) $numLinea++);
            $add($dl, 'Descrizione',   $L['descr']);
            $add($dl, 'Quantita',      $fmtQ((float) $L['qty']));
            $add($dl, 'UnitaMisura',   (string) $L['um']);
            $add($dl, 'PrezzoUnitario', $fmt8((float) $L['unit']));
            $add($dl, 'PrezzoTotale',  $fmt8((float) $L['imp']));
            $add($dl, 'AliquotaIVA',   $fmtRt((float) $L['vat']));
        }
        foreach ($byVat as $vat => $tot) {
            $dr = $add($dbs, 'DatiRiepilogo');
            $add($dr, 'AliquotaIVA',       $fmtRt((float) $vat));
            $add($dr, 'ImponibileImporto', $fmt2((float) $tot['imp']));
            $add($dr, 'Imposta',           $fmt2((float) $tot['iva']));
            $add($dr, 'EsigibilitaIVA',    'I');
        }

        // Pagamento
        $dp = $add($body, 'DatiPagamento');
        $add($dp, 'CondizioniPagamento', 'TP02'); // pagamento completo

        $mp = $add($dp, 'DettaglioPagamento');
        $add($mp, 'ModalitaPagamento', $MODALITA_PAG);
        if ($dataScadenzaPagamento) {
            $add($mp, 'DataScadenzaPagamento', $dataScadenzaPagamento);
        }
        $add($mp, 'ImportoPagamento',  $fmt2((float) $TOTALE));

        // ================= 7) PRETTY XML =================
        $filename  = 'IT' . $MY_PIVA . '_' . $progressivoInvioDb . '.xml';
        $prettyXml = $dom->saveXML();

        // ================= 8) VALIDAZIONE XSD =============
        $xsdDir      = storage_path('app/fatturapa/xsd');
        $xsdMainPath = $xsdDir . DIRECTORY_SEPARATOR . 'FatturaOrdinaria_v1.2.3.xsd';
        $xmldsigPath = $xsdDir . DIRECTORY_SEPARATOR . 'xmldsig-core-schema.xsd';

        if (!is_file($xsdMainPath) || !is_file($xmldsigPath)) {
            Log::error('❌ File XSD mancanti', [
                'xsdMainPath' => $xsdMainPath,
                'xmldsigPath' => $xmldsigPath,
            ]);

            return response()->json([
                'ok'      => false,
                'message' => 'File XSD mancanti. Copia in ' . $xsdDir . ' i file: FatturaOrdinaria_v1.2.3.xsd e xmldsig-core-schema.xsd',
            ], 500);
        }

        libxml_use_internal_errors(true);
        $domForValidation = new \DOMDocument('1.0', 'UTF-8');
        $domForValidation->preserveWhiteSpace = false;
        $domForValidation->formatOutput = false;
        $domForValidation->loadXML($prettyXml);

        set_error_handler(static function () {
            return true;
        });
        $isValid = @$domForValidation->schemaValidate($xsdMainPath);
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

        if (!$isValid) {
            Log::error('❌ XML non conforme XSD fatturaPA', [
                'errors' => $libxmlErrors,
            ]);

            return response()->json([
                'ok'         => false,
                'message'    => 'XML non conforme agli XSD FatturaPA (v1.2.3).',
                'errors'     => $libxmlErrors,
                'xml_pretty' => $prettyXml,
            ], 422);
        }

        // ================= 9) SALVATAGGIO FILE + SALES_INVOICES =============
        $relativePath = 'fatture_vendita/' . $filename;
        Storage::disk('local')->put($relativePath, $prettyXml);
        $annoDocumento  = (int) date('Y', strtotime($DATA_DOC));
        $issuedByUserId = Auth::check() ? Auth::id() : null;

        // tipo_vendita: segno che è acconto o no
        $tipoVendita = ($TIPO_DOC === 'TD02') ? 'ACCONTO' : 'STANDARD';

        try {
            $invoice = SalesInvoice::create([
                'work_id'             => $work->id,
                'client_id'           => $client->id,
                'issued_by_user_id'   => $issuedByUserId,
                'original_invoice_id' => $originalInvoice?->id,

                'tipo_documento'   => $TIPO_DOC,
                'tipo_vendita'     => $tipoVendita,
                'serie'            => null,
                'numero'           => $NUMERO_DOC,
                'anno'             => $annoDocumento,
                'data_documento'   => $DATA_DOC,
                'valuta'           => $VALUTA,
                'cambio'           => null,

                'formato_trasmissione' => $FORMATO_TRASM,
                'progressivo_invio'    => $progressivoInvioDb,
                'codice_destinatario'  => $CODICE_DEST,
                'pec_destinatario'     => $PEC_DEST,

                'sdi_status'           => 'GENERATA',
                'sdi_sent_at'          => null,
                'sdi_response_at'      => null,
                'sdi_message_id'       => null,
                'sdi_file_id'          => null,
                'sdi_response_code'    => null,
                'sdi_response_description' => null,

                'imponibile_totale'    => $IMPONIBILE,
                'imposta_totale'       => $IMPOSTA,
                'totale_documento'     => $TOTALE,

                'bollo_applicato'      => false,
                'bollo_importo'        => null,

                'has_withholding_tax'  => false,
                'withholding_type'     => null,
                'withholding_rate'     => null,
                'withholding_amount'   => null,

                'spese_accessorie'     => 0,
                'arrotondamento'       => 0,
                'totale_da_pagare'     => $TOTALE,

                'vat_summary'          => $vatSummary,

                'original_invoice_number' => $originalInvoice?->numero,
                'original_invoice_date'   => $originalInvoice?->data_documento,

                'condizioni_pagamento'    => 'TP02',
                'modalita_pagamento'      => $MODALITA_PAG,
                'data_scadenza_pagamento' => $dataScadenzaPagamento,
                'iban'                    => null,
                'istituto_bancario'       => null,
                'intestatario_conto'      => null,

                'xml_filename'        => $filename,
                'xml_path'            => $relativePath,
                'xml_hash'            => hash('sha256', $prettyXml),
                'pdf_filename'        => null,
                'pdf_path'            => null,

                'origine'             => 'WORK',
                'note_interne'        => null,
                'note_esterne'        => null,
                'locked_at'           => null,
            ]);

            Log::info('✅ SalesInvoice creata', [
                'sales_invoice_id' => $invoice->id,
                'work_id'          => $work->id,
                'client_id'        => $client->id,
                'tipo_documento'   => $TIPO_DOC,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ Errore creazione SalesInvoice', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            // Non blocchiamo il download XML se è valido
        }

        // ================= 10) RITORNO XML =================
        return response($prettyXml, 200, [
            'Content-Type'        => 'application/xml; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
