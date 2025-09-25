<?php

namespace App\Http\Controllers;

use App\Http\Resources\CallResource;
use App\Models\Call;
use App\Http\Requests\StoreCallRequest;
use App\Http\Requests\UpdateCallRequest;
use App\Models\Client;

class CallController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $query = Call::query();
        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');

        //Ricerca call
        if (request("oggetto")) {
            request()->query->remove('page');        
            $query->where("oggetto", "like", "%" . request("oggetto") . "%");
        }
        if (request("cliente")) {
            request()->query->remove('page');        
            $query->where("cliente", "like", "%" . request("cliente") . "%");
        }
        if (request("urgenza")) {
            request()->query->remove('page');        
            $query->where("urgenza", "like", "%" . request("urgenza") . "%");
        }
        if (request("lavoro")) {
            request()->query->remove('page');        
            $query->where("lavoro", "like", "%" . request("lavoro") . "%");
        }

        
        $calls = $query->orderBy($sortField, $sortDirection)->paginate(10);

        //dd($calls);

        return inertia('Call/Index', [

            "calls" => CallResource::collection($calls),
            "queryParams" => request()->query() ?: null,
            'success' => session('success'),

        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $queryClient = Client::query()->get();



        return inertia('Call/Clientfromcall', [


            'clients' => $queryClient,
            "queryParams" => request()->query() ?: null,

        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCallRequest $request)
    {
        
        $data = $request->validated();
        Call::create($data);
        return to_route("call.index")->with('success', 'Nuovo cliente inserito');

    }

    /**
     * Display the specified resource.
     */
    public function show(Call $call)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Call $call)
    {
        return inertia("Call/Edit", ['call' => new CallResource($call)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCallRequest $request, Call $call)
    {
        $call->update($request->validated());
        return to_route('call.index')->with('success', 'Chiamata modificata');
  
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Call $call)
    {
        $call->delete();
        return to_route('call.index')
            ->with('success', "Chiamata eliminata");
    }


    public function taskfromcall(StoreCallRequest $request)
    {

        //dd($request->client);
        // $client = new ClientResource($request->client);
        //$client = $request->client;
        //dd($client );


        $client = Client::query()->where('id', $request->client)->get();
        //$worker = $request->worker;
        //dd($queryClient );
        //$client = new ClientResource($queryClient);



        $work = Client::find($request->client)->works()->get();


        // $queryWork = Work::query()->get();

        //$client = new ClientResource($client);

        //dd($queryWork);


        //$workerdetail = new WorkerResource($worker);
        //$query = $workerdetail->where('id', $worker->id)->get();
        //$detailWorker = Detailwork::select('task')->where("worker_id", $worker->id)->distinct()->get();
        //$taskworker = $worker->tasks()->get();
        // dd($query);
        /* for ($i=0; $i <count($detailWorker) ; $i++) { 
           // $taskworker[$i+1] = Task::all()->where('id',$detailWorker[$i]->task);
           $taskworker = Task::all()->where('id',$detailWorker[$i]->task);
        }
 */


        return inertia('Call/Taskfromcall', [


            'client' => $client,
            'works' => $work,
            "queryParams" => request()->query() ?: null,

        ]);

    }


}
