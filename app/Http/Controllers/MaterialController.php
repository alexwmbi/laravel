<?php

namespace App\Http\Controllers;

use App\Http\Resources\MaterialResource;
use App\Models\Material;
use App\Http\Requests\StoreMaterialRequest;
use App\Http\Requests\UpdateMaterialRequest;

class MaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Material::query();

        //Ricerca per nome
        if(request("name")){
            $query->where("name","like","%".request("name")."%");
        }

       // $testclient = Client::with('works')->get();

        $materials = $query->get();


        //$testclient = Client::with('works')->get();
      
        

        return inertia('Material/Index',[
    
     "materials" => MaterialResource::collection($materials),
     "queryParams" => request()->query() ?: null,
     'success' => session('success'),

        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia("Material/Create");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMaterialRequest $request)
    {
        $data = $request->validated();
        Material::create($data);
       return to_route("material.index")->with('success','Nuovo articolo inserito');
    }

    /**
     * Display the specified resource.
     */
    public function show(Material $material)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Material $material)
    {
        return inertia("Material/Edit", ['material' => new MaterialResource($material)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMaterialRequest $request, Material $material)
    {
        $material -> update($request->validated());
        return to_route('material.index')->with('success','Articolo modificato');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Material $material)
    {
        $material->delete();
        return to_route('material.index')
        ->with('success', "Articolo eliminato");
    }
}
