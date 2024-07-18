<?php

namespace App\Http\Controllers;

use App\Http\Resources\MaterialResource;
use App\Models\Detailmaterial;
use App\Http\Requests\StoreDetailmaterialRequest;
use App\Http\Requests\UpdateDetailmaterialRequest;
use App\Models\Material;

class DetailmaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $taskid = request()->query("id");

        $detailMaterial = Detailmaterial::select('material_id')->where("task", $taskid)->distinct()->get();
        ;


        $materials = Material::query()->whereNotIn('id', array_values(array_filter($detailMaterial->toArray())))->get();


        return inertia('Detailmaterial/Index', [

            "materials" => MaterialResource::collection($materials),
            "taskid" => $taskid

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
     * 
     */
    public function store(StoreDetailmaterialRequest $request)
    {
        function get_string_between($string, $start, $end)
        {
            $string = ' ' . $string;
            $ini = strpos($string, $start);
            if ($ini == 0)
                return '';
            $ini += strlen($start);
            $len = strpos($string, $end, $ini) - $ini;
            return substr($string, $ini, $len);
        }


        $taskId = get_string_between(\URL::previous(), "&id=", "&");

        $HoursArray = json_decode(str_replace("quantity", "", $request->getContent()), true);

        $WorkerName = Material::query();

        foreach ($HoursArray as $x => $y) {

            $attribute = [
                'quantity' => $y,
                'material_id' => $x,
                'task' => $taskId,
                'name' => str_replace('"}]', "", str_replace('[{"desc":"', "", $WorkerName->select('desc')->where("id", "=", $x)->get())),
                'code' => str_replace('"}]', "", str_replace('[{"cod_art":"', "", $WorkerName->select('cod_art')->where("id", "=", $x)->get())),
                'priece' => str_replace('"}]', "", str_replace('[{"priece":"', "", $WorkerName->select('priece')->where("id", "=", $x)->get())),
                'um' => str_replace('"}]', "", str_replace('[{"um":"', "", $WorkerName->select('um')->where("id", "=", $x)->get()))
            ];


            $detailwork = Detailmaterial::create($attribute);
            $detailwork->tasks()->attach($taskId);


        }
        return to_route("task.show", $taskId)->with('success', 'Nuovo Articolo aggiunto');

    }

    /**
     * Display the specified resource.
     */
    public function show(Detailmaterial $detailmaterial)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Detailmaterial $detailmaterial)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDetailmaterialRequest $request, Detailmaterial $detailmaterial)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Detailmaterial $detailmaterial)
    {
        //
    }
}
