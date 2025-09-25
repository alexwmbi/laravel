<?php


namespace App\Http\Controllers;

use App\Library\Formatter\FormatStr;

use App\Http\Resources\DetailworkResource;
use App\Http\Resources\WorkerResource;
use App\Models\Detailwork;
use App\Http\Requests\StoreDetailworkRequest;
use App\Http\Requests\UpdateDetailworkRequest;
use App\Models\Worker;
use Illuminate\Support\Facades\DB;




class DetailworkController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $taskid = request()->query("id");
        $detailWorker = Detailwork::select('worker_id')->where("task", $taskid)->distinct()->get();
        $workers = Worker::query()->whereNotIn('id', $detailWorker)->get();

        return inertia('Detailwork/Index', [

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

        $formatStr = new FormatStr;
        $taskId = $formatStr->get_string_between(\URL::previous(), "&id=", "&");
        
       

        $quantity = [];
        $priece = [];
        $aug = [];
       
        $HoursArrayAug = json_decode($request->getContent(), true);

        foreach ($HoursArrayAug as $key => $value) {
            if (str_contains($key, 'hours')){
                $chiave =  json_decode(str_replace("hours", "", $key));
                $quantity[$chiave]=[$value];
            }
            if (str_contains($key, 'priece')){
                $chiave = str_replace("priece", "", $key);
                $priece[$chiave]=[$value];
            }
            if (str_contains($key, 'aug')){
                $chiave = str_replace("aug", "", $key);
                $aug[$chiave]=[$value];
            }
            # code...
        }


       
        $HoursArray = json_decode(str_replace("hours", "", $request->getContent()), true);
        $WorkerName = Worker::query();

      // dd($quantity , $request->getContent());

        //foreach ($HoursArray as $x => $y) {
        foreach ($quantity as $x => $y) {

            //dd($x);
            isset($priece[$x][0]) ? $priece[$x][0] : $priece[$x][0] = 0 ;
            isset($aug[$x][0]) ? $aug[$x][0] : $aug[$x][0] = 0 ;

           
            $attribute = [
                'hours' => $y[0],
                'worker_id' => $x,
                'task' => $taskId,
                'name' => str_replace('"}]', "", str_replace('[{"name":"', "", $WorkerName->select('name')->where("id", "=", $x)->get())),
                'code' => str_replace('"}]', "", str_replace('[{"code":"', "", $WorkerName->select('code')->where("id", "=", $x)->get())),
                'priece' => $priece[$x][0],
                'aug' =>  $aug[$x][0],

            ];

           // dd($attribute,$priece[$x], $y[0]);

            $detailwork = Detailwork::create($attribute);
            $detailwork->tasks()->attach($taskId);
            DB::statement('insert into task_worker (task_id , worker_id) values (?,?)', [$taskId, $x]);
           // DB::statement('update tasks set hours = hours + ? where id = ?', [$y[0] + ($priece[$x][0] * $y[0] /100) + ($aug[$x][0] * $y[0] /100), $taskId]);
           DB::statement('update tasks set hourspriece = hourspriece + ? where id = ?', [$y[0] * ( ($priece[$x][0]) + ($aug[$x][0] * $priece[$x][0] /100) ), $taskId]);
           DB::statement('update tasks set hours = hours + ? where id = ?', [$y[0], $taskId]);

        }
        return to_route("task.show", $taskId)->with('success', 'Nuovo Operaio aggiunto');

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
    public function edit(Detailwork $detailwork)
    {
        /*   if (request("selectedItems")) {

              dd(request("selectedItems"));
          } */

        return inertia("Detailwork/Edit", ['workerdetail' => new DetailworkResource($detailwork)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDetailworkRequest $request, Detailwork $detailwork)
    {

        $detailwork->update($request->validated());
        //TASKS UPDATE
        $hoursTot = DB::select('select sum(hours) as taskhours from detailworks where task = ?', [$detailwork->task]);
        DB::statement('update tasks set hours = ? where id = ?', [$hoursTot[0]->taskhours, $detailwork->task]);

        $hoursTot = DB::select('select sum(hours * (priece + (priece * aug / 100 ))) as taskhourspriece from detailworks where task = ?', [$detailwork->task]);
        DB::statement('update tasks set hourspriece = ? where id = ?', [$hoursTot[0]->taskhourspriece, $detailwork->task]);


        return to_route('task.show', $detailwork->task)->with('success', 'Operaio modificato');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Detailwork $detailwork)
    {
        $detailwork->delete();
        DB::statement('update tasks set hours = hours - ? where id = ?', [$detailwork->hours, $detailwork->task]);
        DB::statement('update tasks set hourspriece = hourspriece - ? where id = ?', [$detailwork->hours * ($detailwork->priece + ($detailwork->priece * $detailwork->aug / 100 )), $detailwork->task]);

        return to_route('task.show', $detailwork->task)
            ->with('success', "Operaio rimosso dal task");
    }
}
