<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreImportRequest;
use App\Models\Material;
use DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Str;

class ImportController extends Controller
{


    public function importMaterial()
    {
       
        return inertia("Import/Material");
        
        
    }

    public function store(StoreImportRequest $request)
    {
       
        //excel_data

        $requestData = $request;
        /** @var $files \Illuminate\Http\UploadedFile */

        

        if(isset($requestData['excel_data'])){

            $file = $requestData['excel_data'];


            $fileName = $_FILES['excel_data']['name'];
            $file_ext = pathinfo($fileName[0], PATHINFO_EXTENSION);

            $inputFileNamePath = $_FILES['excel_data']['tmp_name'];
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($inputFileNamePath[0]);
            $data = $spreadsheet->getActiveSheet()->toArray();
    
            $count = "0";
            foreach($data as $row)
            {
                if($count > 0)
                {
                    $cod_articolo = $row['0']; //cod_art 
                    $cod_produttore = $row['1']; //cod_prod 
                    $nome_produttore = $row['2']; //name_prod
                    $descrizione = $row['3']; //desc
                    $um = $row['4']; //um 
                    $prezzo = $row['5']; //priece 
                    $iva = $row['6'];  //iva

                    $prezzo = str_replace(".", "", $prezzo);
                    $prezzo = str_replace(",", ".", $prezzo);
                    $descrizione = str_replace(",", " ", $descrizione);


                    $material_array = 
                        array(
                            'cod_art' =>  $cod_articolo,
                            'cod_prod' =>  $cod_produttore,
                            'name_prod' => $nome_produttore,
                            'desc' => $descrizione,
                            'um' => $um,
                            'priece' => $prezzo,
                            'iva' => $iva
                        );

                       // dd($material_array);

                        Material::create($material_array);

                  
                }
                else
                {
                    $count = "1";
                }
            }

           // dd($file_ext );
        }


       

        return inertia("Import/Material")->with('success', 'Catalogo importato con successo');
        
        
    }


}