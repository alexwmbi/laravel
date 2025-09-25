<?php

namespace App\Http\Controllers;

use App\Http\Resources\ClientResource;
use App\Http\Resources\TaskResource;
use App\Models\Client;
use App\Models\Detailwork;
use App\Models\Task;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Worker;
use DB;
use Session;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia("Task/Create");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request)
    {
        //dd($request);
        $clientArr = [];
        $attribute = [];
        $workNameIdArr = [];
        //dd($request->work);
        // dd(DB::table("SELECT NAME FROM WORKS  WHERE ID = ?",$request->work)->toSql());
        // $WorkIdName = DB::select("SELECT NAME FROM WORKS  WHERE ID = ?",$request->work);

        if ($request->client) {

            //SALVO DA: CREA TASK DA OPERAIO !!!!!!!
            //workname
            Session::put('work_id', $request->work);
            Session::put('client_name', $request->client[0]['name']);
            Session::put('client_id', $request->client[0]['id']);
            // dd(Session::get('work_id'),Session::get('client_name'),Session::get('client_id'),);

            $work_id = Session::get('work_id');


            $workNameIdArr = array_column(DB::SELECT("SELECT name FROM works  WHERE id = ?", [$work_id]), 'name');
            //$workNameIdArr = array_column(DB::SELECT("SELECT name FROM works  WHERE id = ?", [$work_id]));
            
            //$data['work_name'] = $WorkIdName;
            //dd($data);
           //dd($workNameIdArr ,  $request , $request->work);
            $data = $request->validated();
            $data['work_name'] = $workNameIdArr[0];
            $data['work_id'] = Session::get('work_id');
            $task = Task::create($data);
            $task->works()->attach($work_id);
            //dd($task);

            $attribute = [
                'hours' => $request->queryParamshours,
                'worker_id' => $request->worker['id'],
                'task' => $task->id,
                'name' => $request->worker['name'],
                'code' => $request->worker['code'],
            ];


            $detailwork = Detailwork::create($attribute);
            $detailwork->tasks()->attach($task->id);
            DB::statement('insert into task_worker (task_id , worker_id) values (?,?)', [$task->id, $request->worker['id']]);
            DB::statement('update tasks set hours = hours + ? where id = ?', [$request->queryParamshours || '0', $task->id]);


        } else {
            //salvo da: CERA TASK
            // dd($request);

            ///test !!!


            $work_id = Session::get('work_id');

            //dd(DB::SELECT("SELECT NAME FROM WORKS  WHERE ID = ?",[$work_id]));
            $workNameIdArr = array_column(DB::SELECT("SELECT name FROM works  WHERE id = ?", [$work_id]), 'name');

            // dd( $data); //////TODO !!!!!!!!!!!!!!!!   
            $data = $request->validated();
            $data['work_name'] = $workNameIdArr[0];
            $data['work_id'] = Session::get('work_id');
            //dd($data);
            $task = Task::create($data);
            $task->works()->attach($work_id);
        }

        return to_route("work.show", $work_id)->with('success', 'Nuovo task inserito');
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {

        $client = Session::get('client_name');
        $client_id = Session::get('client_id');
        $work_name = Session::get('work');
        $work_id = Session::get('work_id');
        $materials = $task->materials()->get();
        $workers = $task->workers()->get();
       
        $workersdetails = $task->detailworkers()->get();
       // dd($workersdetails);
        $materialsdetails = $task->detailmaterials()->get();
        $hoursTot = $task->detailworkers()->sum('hours');
        $hoursCostTotArr =  $task->detailworkers()->selectRaw(' CAST( hours * ( priece + ( priece * aug  / 100 ) ) as DECIMAL (8,2) ) as "tot"')->get();
        $hoursCostTot = 0;
        foreach ($hoursCostTotArr as $key => $value) {
            if ($key = 'tot')
                $hoursCostTot = $hoursCostTot + $value->tot;
        }
        //dd($hoursTot);
        // $hoursTot = $task->detailworkers()->sum('hours') * ($task->detailworkers()->sum('priece') + ( $task->detailworkers()->sum('priece') * $task->detailworkers()->sum('aug') / 100));
        //$hoursTot = $task->detailworkers()->selectRaw('(hours * ( priece + ( priece + (priece * aug / 100) ) ) ) as hoursTot ')->get();
        //$materialsTot = $task->detailmaterials()->sum('priece') * $task->detailmaterials()->sum('quantity');
        $materialsTot = $task->detailmaterials()->selectRaw('( (detailmaterials.priece + ( detailmaterials.priece * detailmaterials.default_aug /100) + (detailmaterials.priece * detailmaterials.custom_aug /100)))  * detailmaterials.quantity as price_quantity')->get();
        $price_quantity = 0;
        foreach ($materialsTot as $key => $value) {
            if ($key = 'price_quantity')
                $price_quantity = $price_quantity + $value->price_quantity;
        }

        return inertia('Task/Show', [

            'materials' => $materials,
            'task' => new TaskResource($task),
            'workers' => $workers,
            'workersdetails' => $workersdetails,
            'materialsdetails' => $materialsdetails,
            'hoursTot' => $hoursTot,
            'materialsTot' => $price_quantity,
            'client' => $client,
            'client_id' => $client_id,
            'work_name' => $work_name,
            'work_id' => $work_id,
            'hoursCostTot' => $hoursCostTot,
            "queryParams" => request()->query() ?: null,

        ]);

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        return inertia("Task/Edit", ['task' => new TaskResource($task)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $work_id = Session::get('work_id');
        $task->update($request->validated());
        return to_route('work.show', $work_id)->with('success', 'Cliente modificato');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {

        $work_id = Session::get('work_id');

        $task->delete();
        return to_route('work.show', $work_id)
            ->with('success', "Task eliminato");
    }


    public function move(Task $task)
    {
        $clientid = Session::get('client_id');
        $client = Client::find($clientid);
        $works = $client->works()->get();

        return inertia('Task/Move', [

            'works' => $works,
            'task' => new TaskResource($task),
            "queryParams" => request()->query() ?: null,

        ]);
    }

    public function moveTask(UpdateTaskRequest $request, Task $task)
    {

        //update
       // dd($request->workId,  $request);
        DB::statement('update tasks set work_id = ? where id = ?', [$request->workId, $request->id]);
       //select old work id form task_work
       $oldWorkId = DB::select('select work_id  from task_work where task_id = ?', [$request->id]);
       //dd($oldWorkId);
    
        DB::statement('update task_work set work_id = ? where task_id = ? and work_id = ?', [$request->workId, $request->id , $oldWorkId[0]->work_id]);
        


         $clientid = Session::get('client_id');
        /*  $client = Client::find($clientid); 
         $works = $client->works()->get(); */
  
        //dd($request->workId);
        return to_route("client.show", $clientid)->with('success', 'Task spostato con successo');
        /* 
        return inertia('Task/Move', [


            'task' => new TaskResource($task),
            "queryParams" => request()->query() ?: null,

        ]); */
    }


}
