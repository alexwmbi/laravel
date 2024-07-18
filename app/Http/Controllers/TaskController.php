<?php

namespace App\Http\Controllers;

use App\Http\Resources\DetailworkResource;
use App\Http\Resources\MaterialResource;
use App\Http\Resources\TaskResource;
use App\Http\Resources\WorkerResource;
use App\Models\Task;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Work;
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
        $work_id = Session::get('work_id');

      
        $data = $request->validated();
        $task = Task::create($data);
        $task->works()->attach($work_id);
        //dd($work_id);

        return to_route("work.show", $work_id)->with('success','Nuovo task inserito');
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
                
     
        $materials =   $task->materials()->get();
        $workers =   $task->workers()->get();
        $workersdetails =   $task->detailworkers()->get();
        $materialsdetails =   $task->detailmaterials()->get();
        $hoursTot = $task->detailworkers()->sum('hours');
        $materialsTot = $task->detailmaterials()->sum('priece')*$task->detailmaterials()->sum('quantity');
       // dd($materialsTot);
    
        return inertia('Task/Show' ,[

             'materials' => $materials,
             'task' => new TaskResource($task) ,
             'workers' => $workers ,
             'workersdetails' => $workersdetails,
             'materialsdetails' => $materialsdetails,
             'hoursTot' => $hoursTot,
             'materialsTot' => $materialsTot,
            // 'works' => $query,
             "queryParams" => request()->query() ?: null,
            // "works2"  => WorkResource::collection($works)
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

        $task -> update($request->validated());
        return to_route('work.show',$work_id)->with('success','Cliente modificato');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {

        $work_id = Session::get('work_id');

        $task->delete();
        return to_route('work.show',$work_id)
        ->with('success', "Task eliminato");
    }
}
