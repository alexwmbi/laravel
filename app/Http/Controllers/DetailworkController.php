<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkerResource;
use App\Models\Detailwork;
use App\Http\Requests\StoreDetailworkRequest;
use App\Http\Requests\UpdateDetailworkRequest;
use App\Models\Task;
use App\Models\Worker;


class DetailworkController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $taskid = request()->query("id");

        $detailWorker = Detailwork::select('worker_id')->where("task",$taskid)->distinct()->get();;

        $workers = Worker::query()->whereNotIn('id', $detailWorker)->get();
        
        
        dd($detailWorker);
        return inertia('Detailwork/Index',[
    
            "workers" => WorkerResource::collection($workers),
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
     * 
     */
    public function store(StoreDetailworkRequest $request)
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
        $HoursArray =  json_decode(str_replace("hours", "",  $request->getContent()), true);
        
       /*  foreach ($HoursArray as &$value) {
            $value = $value * 2;
        } */
       /*  $data = $request->validated();
        Detailwork::create($data); */
       //return to_route("client.index")->with('success','Nuovo cliente inserito');
       $WorkerName = Worker::query();

        foreach ($HoursArray as $x => $y) {
       
            $attribute = [
                'hours'   => $y,
                'worker_id'   => $x,
                'task' => $taskId,
                'name' =>  str_replace('"}]', "",  str_replace('[{"name":"', "",  $WorkerName->select('name')->where("id","=",$x)->get()))     ,
                'code' =>  str_replace('"}]', "",  str_replace('[{"code":"', "",  $WorkerName->select('code')->where("id","=",$x)->get()))  
            ];
            
            
           // $attribute = $request->validated();
          // dd($attribute);
        $detailwork = Detailwork::create($attribute);
        $detailwork->tasks()->attach($taskId);

       // 
                
       
        

        
      } 
      return to_route("task.show", $taskId)->with('success','Nuovo Operaio aggiunto');
      //$data = $request->validated();
      //  dd(count($data),$data); //{"hours1":"55","hours3":"22","hours4":"33"}

    
       
      
      // dd($taskId);
    }
    /**
     * Display the specified resource.
     */
    public function show(Detailwork $detailwork)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Detailwork $detailwork )

    {
        if (request("selectedItems") ) {
            
            dd(request("selectedItems"));
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDetailworkRequest $request, Detailwork $detailwork)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Detailwork $detailwork)
    {
        //
    }
}
