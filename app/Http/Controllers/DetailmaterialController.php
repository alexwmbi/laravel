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

        $detailMaterial = Detailmaterial::select('material_id')->where("task",$taskid)->distinct()->get();;


        //dd($detailMaterial);
        //$linksArray = array_values(array_filter($detailMaterial));
        $materials = Material::query()->whereNotIn('id',array_values(array_filter($detailMaterial->toArray())))->get(); 
        
       // $materials = Material::query()->whereNotIn('id', $detailMaterial ? $detailMaterial : '')->get(); 
        
        //dd($detailMaterial,$materials);
        return inertia('Detailmaterial/Index',[
    
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
        function get_string_between($string, $start, $end){
            $string = ' ' . $string;
            $ini = strpos($string, $start);
            if ($ini == 0) return '';
            $ini += strlen($start);
            $len = strpos($string, $end, $ini) - $ini;
            return substr($string, $ini, $len);
        }

       

        //detailwork?created_at=30-11--0001&hours=10&id=1&materials=materiali%201&name=prova1&workers=1
        $taskId = get_string_between(\URL::previous(),"&id=","&");
        //$bodytag = str_replace("hours", "",  $request->getContent());
        $HoursArray =  json_decode(str_replace("quantity", "",  $request->getContent()), true);
       // dd($HoursArray);
        //$AugArray =  json_decode(str_replace("aug", "",  $request->getContent()), true);
        //dd($request->getContent());
       /*  foreach ($HoursArray as &$value) {
            $value = $value * 2;
        } */
       /*  $data = $request->validated();
        Detailwork::create($data); */
       //return to_route("client.index")->with('success','Nuovo cliente inserito');
       $WorkerName = Material::query();
        //dd($WorkerName );
        foreach ($HoursArray as $x => $y) {
       
            $attribute = [
                'quantity'   => $y,
                'material_id'   => $x,
                'task' => $taskId,
                'name' =>  str_replace('"}]', "",  str_replace('[{"desc":"', "",  $WorkerName->select('desc')->where("id","=",$x)->get()))     ,
                'code' =>  str_replace('"}]', "",  str_replace('[{"cod_art":"', "",  $WorkerName->select('cod_art')->where("id","=",$x)->get())) ,
                'priece' =>  str_replace('"}]', "",  str_replace('[{"priece":"', "",  $WorkerName->select('priece')->where("id","=",$x)->get()))  ,
                //'iva' =>  str_replace('"}]', "",  str_replace('[{"iva":"', "",  $WorkerName->select('iva')->where("id","=",$x)->get()))  ,
                'um' =>  str_replace('"}]', "",  str_replace('[{"um":"', "",  $WorkerName->select('um')->where("id","=",$x)->get()))  
            ];
            
            
           // $attribute = $request->validated();
            
        $detailwork = Detailmaterial::create($attribute);
        $detailwork->tasks()->attach($taskId);

       // 
                
       
        

        
      } 
      return to_route("task.show", $taskId)->with('success','Nuovo Articolo aggiunto');
      //$data = $request->validated();
      //  dd(count($data),$data); //{"hours1":"55","hours3":"22","hours4":"33"}

    
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
