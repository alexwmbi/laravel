<?php

namespace App\Http\Controllers;

use App\Http\Resources\ClientDetailResource;
use App\Http\Resources\WorkResource;
use App\Models\ClientDetail;
use App\Http\Requests\StoreClientDetailRequest;
use App\Http\Requests\UpdateClientDetailRequest;
use Carbon\Carbon;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Session;

class ClientDetailController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = ClientDetail::query();
        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');

        //Ricerca cliente
        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }

        if (request("note")) {
            $query->where("note", "like", "%" . request("note") . "%");
        }

        $clients = $query->orderBy($sortField, $sortDirection)->paginate(10);

        return inertia('Client/Index', [

            "clients" => ClientDetailResource::collection($clients),
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
    public function store(StoreClientDetailRequest $request)
    {
        $data = $request->validated();
        ClientDetail::create($data);
        return to_route("client.index")->with('success', 'Nuovo cliente inserito');
    }

    /**
     * Display the specified resource.
     */
    public function show(ClientDetail $client)
    {

        Session::put('client_id', $client->id);
        Session::put('client_name', $client->name);

        $client = new ClientDetailResource($client);

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
    public function edit(ClientDetail $client)
    {
        return inertia("Client/Edit", ['client' => new ClientDetailResource($client)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClientDetailRequest $request, ClientDetail $client)
    {
        $client->update($request->validated());
        return to_route('client.index')->with('success', 'Cliente modificato');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClientDetail $client)
    {

        $client->delete();
        return to_route('client.index')
            ->with('success', "Cliente eliminato");
    }
}
