<?php

namespace App\Http\Controllers;

use App\Http\Resources\ClientResource;
use App\Http\Resources\WorkResource;
use App\Models\Client;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use Carbon\Carbon;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Session;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Client::query();
        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');

        //Ricerca cliente
        if (request("name")) {
            request()->query->remove('page');        
            $query->where("name", "like", "%" . request("name") . "%");
        }

        if (request("note")) {
            request()->query->remove('page');    
            $query->where("note", "like", "%" . request("note") . "%")->orWhere("note1", "like", "%" . request("note") . "%");
        }

        $clients = $query->orderBy($sortField, $sortDirection)->paginate(10);

        return inertia('Client/Index', [

            "clients" => ClientResource::collection($clients),
            "queryParams" => request()->query() ?: null,
            'success' => session('success'),

        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia("Client/Create");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClientRequest $request)
    {
        $data = $request->validated();
        Client::create($data);
        return to_route("client.index")->with('success', 'Nuovo cliente inserito');
    }

    public function clientDetail(Client $client)
    {

        $query = Client::where('id', $client->id)->first();
        //dd($client,$query);
        return inertia('Client/ClientDetail', [

            'client' => $client,
            'clientDetail' => $query,
            "queryParams" => request()->query() ?: null,

        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {

        Session::put('client_id', $client->id);
        Session::put('client_name', $client->name);

        $client = new ClientResource($client);

        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');

        $query = $client->works()
            ->where(function (Builder $query) {

                if (request("status")) {

                    $query->where("status", request("status"));
                }

                if (request("name")) {

                    $query->where("name", "like", "%" . request("name") . "%");

                }

                if (request("note")) {

                    $query->where("note", "like", "%" . request("note") . "%");

                }

                if (request("starting_date_from") || request("starting_date_to")) {

                    if (request("starting_date_from")) {

                        $startingDateFrom = (new Carbon(request("starting_date_from")))->format('Y-m-d');
                        request("starting_date_from", $startingDateFrom);
                        $query->where('starting_date', ">=", $startingDateFrom);

                    }


                    if (request("starting_date_to")) {

                        $starting_date_to = (new Carbon(request("starting_date_to")))->format('Y-m-d');
                        request("starting_date_to", $starting_date_to);
                        $query->where('starting_date', "<=", $starting_date_to);

                    }

                }


                if (request("due_date_from") || request("due_date_to")) {

                    if (request("due_date_from")) {

                        $dueDateFrom = (new Carbon(request("due_date_from")))->format('Y-m-d');
                        request("due_date_from", $dueDateFrom);
                        $query->where('due_date', ">=", $dueDateFrom);

                    }


                    if (request("due_date_to")) {

                        $due_date_to = (new Carbon(request("due_date_to")))->format('Y-m-d');
                        request("due_date_to", $due_date_to);
                        $query->where('due_date', "<=", $due_date_to);

                    }

                }

                return $query;

            })
            ->orderBy($sortField, $sortDirection)->paginate(10);


        return inertia('Client/Show', [

            'client' => $client,
            'works' => WorkResource::collection($query),
            "queryParams" => request()->query() ?: null,

        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        return inertia("Client/Edit", ['client' => new ClientResource($client)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClientRequest $request, Client $client)
    {
        $client->update($request->validated());
        return to_route('client.index')->with('success', 'Cliente modificato');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {

        $client->delete();
        return to_route('client.index')
            ->with('success', "Cliente eliminato");
    }


}
