<?php

use App\Http\Controllers\AccountingController;
use App\Http\Controllers\AttachController;
use App\Http\Controllers\CallController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashController;
use App\Http\Controllers\DetailmaterialController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\WorkController;
use App\Http\Controllers\WorkerController;
use App\Http\Controllers\DetailworkController;
use App\Http\Controllers\DetailAccountingController;


use App\Models\Detailwork;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



/* Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
}); */

Route::redirect('/', '/dashboard');

/* Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');
 */
Route::middleware(['auth', 'verified'])->group(function () {
   Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');

    //Route::resource('dashboard', DashController::class);     
    Route::resource('attach', AttachController::class);
    Route::resource('client', ClientController::class);
    Route::get('/client/clientDetail/{client}',[ClientController::class,'clientDetail'])->name('client.clientDetail');
    Route::resource('work', WorkController::class);
    Route::resource('task', TaskController::class);
    Route::resource('worker', WorkerController::class);
    Route::resource('material', MaterialController::class);
    Route::resource('detailwork', DetailworkController::class);
    Route::resource('detailmaterial', DetailmaterialController::class);
    Route::resource('supplier', SupplierController::class);
    Route::resource('accounting', AccountingController::class);
    Route::resource('detailaccounting', DetailAccountingController::class);
    Route::resource('call', CallController::class);

    Route::get('/work/print/{work}',[WorkController::class,'print'])->name('work.print');
    Route::get('/work/conformity/{work}',[WorkController::class,'conformity'])->name('work.conformity');
    Route::get('/work/invoice/{work}',[WorkController::class,'invoice'])->name('work.invoice');
    Route::get('/work/invoicePrint/{work}',[WorkController::class,'invoicePrint'])->name('work.invoicePrint');
    Route::get('/work/attach/{work}',[WorkController::class,'attach'])->name('work.attach');
    Route::get('/task/move/{task}',[TaskController::class,'move'])->name('task.move');
    Route::post('/task/moveTask',[TaskController::class,'moveTask'])->name('task.moveTask');
    
    Route::post('/import/store',[ImportController::class,'store'])->name('import.store');
    //Route::get('/material/import',[MaterialController::class,'import'])->name('material.import');
    
    Route::get('/import/importMaterial',[ImportController::class,'importMaterial'])->name('import.importMaterial');
    //Route::get('/accounting/import',[AccountingController::class,'import'])->name('accounting.import');


    Route::get('/worker/hoursDates/{worker}',[WorkerController::class,'hoursDates'])->name('worker.hoursDates');

    Route::post('/worker/taskfromworker',[WorkerController::class,'taskfromworker'])->name('worker.taskfromworker');
    Route::get('/worker/clientfromworker/{worker}',[WorkerController::class,'clientfromworker'])->name('worker.clientfromworker');

    Route::post('/call/taskfromcall',[CallController::class,'taskfromcall'])->name('call.taskfromcall');
    // clear route cache
Route::get('/clear-route-cache', function () {
    Artisan::call('route:cache');
    return 'Routes cache has clear successfully !';
});

//clear config cache
Route::get('/clear-config-cache', function () {
    Artisan::call('config:cache');
    return 'Config cache has clear successfully !';
});

// clear application cache
Route::get('/clear-app-cache', function () {
    Artisan::call('cache:clear');
    return 'Application cache has clear successfully!';
});

// clear view cache
Route::get('/clear-view-cache', function () {
    Artisan::call('view:clear');
    return 'View cache has clear successfully!';
});
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
