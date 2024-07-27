<?php


namespace App\Http\Controllers;

use App\Library\Formatter\FormatStr;

use App\Http\Resources\DetailworkResource;
use App\Http\Resources\WorkerResource;
use App\Models\Detailwork;
use App\Http\Requests\StoreDetailworkRequest;
use App\Http\Requests\UpdateDetailworkRequest;
use App\Models\Worker;




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
        $HoursArray = json_decode(str_replace("hours", "", $request->getContent()), true);
        $WorkerName = Worker::query();

        foreach ($HoursArray as $x => $y) {

            $attribute = [
                'hours' => $y,
                'worker_id' => $x,
                'task' => $taskId,
                'name' => str_replace('"}]', "", str_replace('[{"name":"', "", $WorkerName->select('name')->where("id", "=", $x)->get())),
                'code' => str_replace('"}]', "", str_replace('[{"code":"', "", $WorkerName->select('code')->where("id", "=", $x)->get()))
            ];

            $detailwork = Detailwork::create($attribute);
            $detailwork->tasks()->attach($taskId);

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
        return to_route('task.show', $detailwork->task)->with('success', 'Operaio modificato');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Detailwork $detailwork)
    {
        $detailwork->delete();
        return to_route('task.show', $detailwork->task)
            ->with('success', "Operaio rimosso dal task");
    }
}
