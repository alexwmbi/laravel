<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkResource;
use App\Models\Attach;
use App\Http\Requests\StoreAttachRequest;
use App\Http\Requests\UpdateAttachRequest;
use Illuminate\Support\Str;
use Session;

class AttachController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //TODO come back to Work/Attach" id (passare work ???)
        return inertia("Work/Attach");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAttachRequest $request)
    {
       //dd(request());
       //dd($request);
        //$data = $request->validated();
        $data = [];
        $requestData = $request;
        /** @var $files \Illuminate\Http\UploadedFile */
        $files = $requestData['files'] ?? null;
        $work_id=Session::get('work_id');
        //dd( 'work_id:::'.Session::get('work_id'),'client name:::'.Session::get('client_name'));

        //TODO  salvere clint, work name, work id nel DB 
        if ($files) {
            foreach($files as $f) {
           // $data['files_path'] = $files->store('attach/' . Str::random(), 'public');
           //dd($f->getClientOriginalName());
           //  http://127.0.0.1:8000/storage/attach/NsgG6j2TQMc8jSaU/Alessandro%20Panigada%20CV%20(1).pdf
           $data['fileurl'] = $f->storeAs('attach/'. Str::random(), $f->getClientOriginalName(), 'public');
           $data['filename'] = $f->getClientOriginalName();
          
           $data['client'] = Session::get('client_name');
           $data['work'] = Session::get(key: 'work');
           $data['work_id'] = Session::get('work_id');
           Attach::create($data);

        }
        }

        //dd($data['files_path']);
        
        return to_route( "work.show", $work_id)->with('success', 'File allegati con successo');

       

    }

    /**
     * Display the specified resource.
     */
    public function show(Attach $attach)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Attach $attach)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAttachRequest $request, Attach $attach)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Attach $attach)
    {
        $workId = Session::get('work_id');
        //$work = new WorkResource($workId);
        $attach->delete();
        return to_route('work.attach',  $workId)
            ->with('success', "File eliminato");
    }
}
