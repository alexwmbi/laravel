<?php

namespace App\Http\Controllers;

use App\Http\Resources\ClientResource;
use App\Models\Client;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use Session;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Client::query();

        //Ricerca cliente
        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }

        $clients = $query->paginate(10);


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

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        Session::put('client_id', $client->id);

        $client = new ClientResource($client);
        $query = $client->works()->get();

        if (request("status")) {
            $query = $client->works()->where("status", request("status"))->get();

        }


        if (request("name")) {

            $query = $client->works()->where("name", "like", "%" . request("name") . "%")->get();

        }


        if (request("status") && request("name")) {
            $query = $client->works()->where("status", request("status"))->where("name", "like", "%" . request("name") . "%")->get();


        }


        return inertia('Client/Show', [

            'client' => $client,
            'works' => $query,
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
