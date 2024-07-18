<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkerResource;
use App\Models\Worker;
use App\Http\Requests\StoreWorkerRequest;
use App\Http\Requests\UpdateWorkerRequest;

class WorkerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $query = Worker::query();

        if(request("name")){
            $query->where("name","like","%".request("name")."%");
        }

        $workers = $query->paginate(10);

        return inertia('Worker/Index',[
    
     "workers" => WorkerResource::collection($workers),
     "queryParams" => request()->query() ?: null,
     'success' => session('success'),

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
        $data = $request->validated();
        Worker::create($data);
       return to_route("worker.index")->with('success','Nuovo operaio inserito');
    }

    /**
     * Display the specified resource.
     */
    public function show(Worker $worker)
    {
        //
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
        $worker -> update($request->validated());
        return to_route('worker.index')->with('success','Operaio modificato');
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
}
