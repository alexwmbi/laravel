<?php

namespace App\Http\Controllers;

use App\Http\Resources\TaskResource;
use App\Http\Resources\WorkResource;
use App\Models\Work;
use App\Http\Requests\StoreWorkRequest;
use App\Http\Requests\UpdateWorkRequest;
use Session;


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



        if (request("name")) {

            $query = $work->tasks()->where("name", "like", "%" . request("name") . "%")->get();

        }

        Session::put('work_id', $work->id);

        return inertia('Work/Show', [
            "work" => $work,
            "tasks" => TaskResource::collection($query),
            "queryParams" => request()->query() ?: null,
            'success' => session('success'),

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
}
