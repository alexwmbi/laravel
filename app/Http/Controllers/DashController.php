<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkResource;
use App\Models\Dash;
use App\Http\Requests\StoreDashRequest;
use App\Http\Requests\UpdateDashRequest;
use App\Models\Work;

class DashController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $query = Work::query();

        //Ricerca per nome
        
            $query->where("status", "active");

            $query->where('starting_date', ">", today());
       

        $works = $query->paginate(10);


        return inertia('Dash/Index', [

            'works' =>  WorkResource::collection($works),
            "queryParams" => request()->query() ?: null,

        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDashRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Dash $dash)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Dash $dash)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDashRequest $request, Dash $dash)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Dash $dash)
    {
        //
    }
}
