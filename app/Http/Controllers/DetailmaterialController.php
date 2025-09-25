<?php

namespace App\Http\Controllers;

use App\Library\Formatter\FormatStr;

use App\Http\Resources\DetailmaterialResource;
use App\Http\Resources\MaterialResource;
use App\Models\Detailmaterial;
use App\Http\Requests\StoreDetailmaterialRequest;
use App\Http\Requests\UpdateDetailmaterialRequest;
use App\Models\Material;
use DB;
use Session;
use Illuminate\Http\Request;


class DetailmaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        $taskid = "";

        if ($request->has('id')) {
            $taskid = $request->query("id");
            Session::put('task_id', $taskid);
        } else {
            $taskid = Session::get('task_id');
        }

        // ID dei materiali già collegati al task (pluck è più pulito di toArray())
        $detailMaterialIds = Detailmaterial::where("task", $taskid)
            ->distinct()
            ->pluck('material_id')
            ->all();

        // Parametri filtro da query string
        $codiceArticolo = $request->query('codice_articolo'); // materials.cod_art
        $codiceProdotto = $request->query('codice_prodotto'); // materials.cod_prod
        $descrizione    = $request->query('descrizione');     // materials.desc

        $materials = Material::query()
            ->when(
                !empty($detailMaterialIds),
                fn($q) =>
                $q->whereNotIn('id', $detailMaterialIds)
            )
            ->when($codiceArticolo !== null && $codiceArticolo !== '', function ($q) use ($codiceArticolo) {
                $q->where('cod_art', 'like', '%' . $codiceArticolo . '%');
            })
            ->when($codiceProdotto !== null && $codiceProdotto !== '', function ($q) use ($codiceProdotto) {
                $q->where('cod_prod', 'like', '%' . $codiceProdotto . '%');
            })
            ->when($descrizione !== null && $descrizione !== '', function ($q) use ($descrizione) {
                $q->where('desc', 'like', '%' . $descrizione . '%');
            })
            ->paginate(10)
            ->withQueryString(); // mantiene i filtri in paginazione

        return inertia('Detailmaterial/Index', [
            "materials" => MaterialResource::collection($materials),
            "taskid"    => $taskid,
            "filters"   => [
                'codice_articolo' => (string)($codiceArticolo ?? ''),
                'codice_prodotto' => (string)($codiceProdotto ?? ''),
                'descrizione'     => (string)($descrizione ?? ''),
            ],
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

        $formatStr = new FormatStr;
        $taskId = $formatStr->get_string_between(\URL::previous(), "&id=", "&");
        if (!strlen($taskId) > 0) {
            $taskId = $taskid = Session::get('task_id');
        }

        $chiavi = [];


        $quantity = [];
        $default_aug = [];
        $custom_aug = [];

        //{"default_aug14":"1","custom_aug14":"2","quantity14":"3","default_aug15":"4","custom_aug15":"5","quantity15":"6"}
        //dd($request->getContent());

        $HoursArrayAug = json_decode($request->getContent(), true);
        //dd($HoursArrayAug);
        foreach ($HoursArrayAug as $key => $value) {
            if (str_contains($key, 'quantity')) {
                $chiave = json_decode(str_replace("quantity", "", $key));
                $quantity[$chiave] = [$value];
            }
            if (str_contains($key, 'default_aug')) {
                $chiave = str_replace("default_aug", "", $key);
                $default_aug[$chiave] = [$value];
            }
            if (str_contains($key, 'custom_aug')) {
                $chiave = str_replace("custom_aug", "", $key);
                $custom_aug[$chiave] = [$value];
            }
            # code...
        }
        //dd($quantity,$default_aug,$custom_aug);

        $HoursArray = json_decode(str_replace("quantity", "", $request->getContent()), true);
        //dd($request->getContent(),$HoursArray);


        //$WorkerName = Material::query();

        foreach ($quantity as $x => $y) {

            isset($default_aug[$x][0]) ? $default_aug[$x][0] : $default_aug[$x][0] = 0;
            isset($custom_aug[$x][0]) ? $custom_aug[$x][0] : $custom_aug[$x][0] = 0;

            $materialsQuery = DB::select('select priece, um, name_prod, cod_art from materials where id = ?', [$x]);
            //dd($x);
            $attribute = [
                'quantity' => $y[0],
                'material_id' => $x,
                'task' => $taskId,
                //'name' => str_replace('"}]', "", str_replace('[{"desc":"', "", $WorkerName->select('desc')->where("id", "=", $x)->get())),
                'name' => $materialsQuery[0]->name_prod,
                //'code' => str_replace('"}]', "", str_replace('[{"cod_art":"', "", $WorkerName->select('cod_art')->where("id", "=", $x)->get())),
                'code' => $materialsQuery[0]->cod_art,
                //'priece' => str_replace('"}]', "", str_replace('[{"priece":"', "", $WorkerName->select('priece')->where("id", "=", $x)->get())) || '0',
                'priece' => $materialsQuery[0]->priece,
                //'um' => str_replace(']','',str_replace('[','',str_replace('"}]', "", str_replace('[{"um":"', "", $WorkerName->select('um')->where("id", "=", $x)->get())))),
                'um' => $materialsQuery[0]->um,
                'default_aug' => $default_aug[$x][0],
                'custom_aug' => $custom_aug[$x][0],

            ];

            //dd($attribute);
            //$priece = DB::select('select priece from materials where id = ?',[$attribute['material_id']]);
            //$attribute = [ 'priece' =>  $priece[0]->priece];
            $detailwork = Detailmaterial::create($attribute);
            $detailwork->tasks()->attach($taskId);
            // dd($priece[0]->priece,(float)$attribute['quantity'] , $attribute['material_id'],(float)json_encode($priece));
            DB::statement('insert into material_task (task_id , material_id) values (?,?)', [$taskId, $x]);

            //DB::statement('update tasks set materials = materials + ? where id = ?', [$attribute['quantity'] * $materialsQuery[0]->priece, $taskId]);
            DB::statement('update tasks set materials = materials + ? where id = ?', [$attribute['quantity'] * ($materialsQuery[0]->priece + ($default_aug[$x][0] * $materialsQuery[0]->priece / 100) + ($custom_aug[$x][0] * $materialsQuery[0]->priece / 100)), $taskId]);
            // DB::statement('update detailmaterials set priece =  ? where id = ?', [$attribute['quantity'] * $priece[0]->priece, $taskId]);

            DB::statement('update materials set quantity = quantity - ? where id = ?', [$attribute['quantity'], $x]);
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

        return inertia("Detailmaterial/Edit", ['materialdetail' => new DetailmaterialResource($detailmaterial)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDetailmaterialRequest $request, Detailmaterial $detailmaterial)
    {


        $detailmaterialold = DB::select('select quantity from detailmaterials where id = ?', [$detailmaterial->id]);


        $detailmaterial->update($request->validated());

        //$materialsTot = DB::select('select sum(priece * quantity) as taskpriece from detailmaterials where task = ?', [$detailmaterial->task]);
        $materialsTot = DB::select('select sum(( priece + ( priece * default_aug / 100 ) + ( priece * custom_aug / 100 )) * quantity) as taskpriece from detailmaterials where task = ?', [$detailmaterial->task]);
        DB::statement('update tasks set materials = ? where id = ?', [$materialsTot[0]->taskpriece, $detailmaterial->task]);


        //TODO : QUANTITY: MATERIALS - DETAILMATERIAL_OLD + DETAILMATERIAL_NEW

        $magazzino = DB::select('select quantity from materials where id = ?', [$detailmaterial->material_id]);

        $detalimaterialnew = $detailmaterial->quantity;
        //dd( $detailmaterial->material_id , $detailmaterialold[0]->quantity , $magazzino[0]->quantity ,  $detailmaterial->quantity );
        //$detalimaterialnew = $magazzino[0]->quantity - $detailmaterialold[0]->quantity +  $magazzino[0]->quantity + $detailmaterial->quantity ;
        //10                     //10
        $magazzinonew = $magazzino[0]->quantity + $detailmaterialold[0]->quantity;
        $magazzinonew = $magazzinonew - $detalimaterialnew;

        DB::statement('update materials set quantity = ? where id = ?', [$magazzinonew, $detailmaterial->material_id]);


        return to_route('task.show', $detailmaterial->task)->with('success', 'Materiale modificato');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Detailmaterial $detailmaterial)
    {
        $detailmaterial->delete();
        //dd($detailmaterial);

        // TODO  FIX    $detailmaterial->hours
        DB::statement('update tasks set materials = materials - ? where id = ?', [($detailmaterial->priece + ($detailmaterial->default_aug * $detailmaterial->priece / 100) + ($detailmaterial->custom_aug * $detailmaterial->priece / 100)) * $detailmaterial->quantity, $detailmaterial->task]);

        //materials update
        /*  $detailmaterialold = DB::select('select quantity from detailmaterials where id = ?', [$detailmaterial->id]);
         $magazzino =  DB::select('select quantity from materials where id = ?', [$detailmaterial->material_id]);
  */
        DB::statement('update materials set quantity = quantity + ? where id = ?', [$detailmaterial->quantity, $detailmaterial->material_id]);

        return to_route('task.show', $detailmaterial->task)
            ->with('success', "Materiale rimosso dal task");
    }
}
