<?php

namespace App\Http\Controllers;

use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Supplier::query();
        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');

        //Ricerca fornitore
        if (request("name")) {
            $query->where("ragsoccf", "like", "%" . request("name") . "%");
        }

        if (request("note")) {
            $query->where("note", "like", "%" . request("note") . "%");
        }

        $suppliers = $query->orderBy($sortField, $sortDirection)->paginate(10);

        $arr = ['cfcditta','tipocf','codcf',	'ragsoccf',	'domicilio','capcf','cittacf','provcf','codfis','pivacf','telef','fax','addbol','codban','sconto1','sconto2','sconto3','codpag','codese','codliscf','civacf','speinc','speince','cognome','nome','perfis','sesso','datanas','provnas','codcon','partite','scadenze','mese2es','giornosc','numaut','dataaut','numpro','tipocli','ragsocfa','indirifa','cittafa','provfa','capfa','ragsocri','indiriri','cittari','provri','capri','fatemail','indemailf','indemaile','indemailo','indemailp','indemailg','perrit','cfcodiban','numdoc','flagraee','tipoca','flagra','cccodtri','indpec'];
        $string = "";
       /*  for ($i=0; $i < count($arr); $i++) { 
            # code...
            $string = $string.'<div className="mt-4">
                <InputLabel htmlFor="'.$arr[$i].'" value="'.$arr[$i].'" />

                <TextInput
                  id="'.$arr[$i].'"
                  type="text"
                  name="'.$arr[$i].'"
                  value={data.'.$arr[$i].'}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("'.$arr[$i].'", e.target.value)}
                />

                <InputError message={errors.'.$arr[$i].'} className="mt-2" />
              </div>'  ;
        } */


      /*   for ($i=0; $i < count($arr); $i++) { 
            # code...
            $string = $string.$arr[$i].': supplier.'.$arr[$i].' || "",'  ;
        }; */

        /* for ($i=0; $i < count($arr); $i++) { 
            # code...
            $string = $string.' "'.$arr[$i].'"'." => ['string','max:255', 'nullable'] , " ;
        }; */
        //"contact" => ['string','max:255', 'nullable'],


        for ($i=0; $i < count($arr); $i++) { 
            # code...
            $string = $string.' '.$arr[$i].': "", ' ;
        };
        // name: "",


        //dd($string);


        return inertia('Supplier/Index', [

            "suppliers" => SupplierResource::collection($suppliers),
            "queryParams" => request()->query() ?: null,
            'success' => session('success'),

        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia("Supplier/Create");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSupplierRequest $request)
    {
        $data = $request->validated();
        Supplier::create($data);
        return to_route("supplier.index")->with('success', 'Nuovo fornitore inserito');
    
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $supplier)
    {
        return inertia("Supplier/Edit", ['supplier' => new SupplierResource($supplier)]);
  
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
       
        $supplier->update($request->validated());
        return to_route('supplier.index')->with('success', 'Fornitore modificato');
   
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return to_route('supplier.index')
            ->with('success', "Fornitore eliminato");
    }
}
