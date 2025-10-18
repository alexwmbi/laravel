<?php

use App\Http\Controllers\AccountingController;
use App\Http\Controllers\AttachController;
use App\Http\Controllers\CallController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashController;
use App\Http\Controllers\DetailmaterialController;
use App\Http\Controllers\DetailAccountingController;
use App\Http\Controllers\DetailworkController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\WorkController;
use App\Http\Controllers\WorkerController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;   // necessario per le rotte di clear*
use Inertia\Inertia;

Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard (doppia rotta per compatibilità con Ziggy)
    Route::get('/dashboard', [DashController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashController::class, 'index'])->name('dashboard.index');

    // Resources
    Route::resource('attach', AttachController::class);
    Route::resource('client', ClientController::class);
    Route::resource('work', WorkController::class);
    Route::resource('task', TaskController::class);
    Route::resource('worker', WorkerController::class);
    Route::resource('material', MaterialController::class);
    Route::resource('detailwork', DetailworkController::class);
    Route::resource('detailmaterial', DetailmaterialController::class);
    Route::resource('supplier', SupplierController::class);
    Route::resource('accounting', AccountingController::class);
    Route::resource('detailaccounting', DetailAccountingController::class)->except(['edit','update']);

    // Route::get('/detailaccounting/{detail}/edit', [AccountingController::class, 'editDetail'])
    // ->whereNumber('detail')
    // ->name('detailaccounting.edit');
     Route::get('/detailaccounting/{detail}/edit', [AccountingController::class, 'editDetail'])
    ->whereNumber('detailaccounting')
      ->name('detailaccounting.edit');

// Route::put('/detailaccounting/{detail}', [AccountingController::class, 'updateDetail'])
//     ->whereNumber('detail')
//     ->name('detailaccounting.update');

Route::put('/detailaccounting/{detail}', [AccountingController::class, 'updateDetail'])
    ->whereNumber('detailaccounting')
      ->name('detailaccounting.update');



    Route::resource('call', CallController::class);

    // Extra client
    Route::get('/client/clientDetail/{client}', [ClientController::class, 'clientDetail'])->name('client.clientDetail');

    // Accounting extra
    Route::get('/accounting/edit/{accounting}', [AccountingController::class, 'editprog'])->name('accounting.editprog');

    // === NUOVE ROTTE PER LE MODIFICHE ===
    // Inline update dei singoli campi della fattura
    Route::patch('/accounting/{accounting}/field', [AccountingController::class, 'patchField'])
        ->name('accounting.patchField');

    // Creazione riga pagamento (annidata nella fattura)
    Route::post('/accounting/{accounting}/details', [AccountingController::class, 'storeDetail'])
        ->name('accounting.details.store');

    // Import
    Route::post('/import/store', [ImportController::class, 'store'])->name('import.store');
    Route::get('/import/importMaterial', [ImportController::class, 'importMaterial'])->name('import.importMaterial');
    // Route::get('/accounting/import', [AccountingController::class,'import'])->name('accounting.import');

    // Work extra
    Route::get('/work/print/{work}', [WorkController::class, 'print'])->name('work.print');
    Route::get('/work/conformity/{work}', [WorkController::class, 'conformity'])->name('work.conformity');
    Route::get('/work/invoice/{work}', [WorkController::class, 'invoice'])->name('work.invoice');
    Route::get('/work/invoicePrint/{work}', [WorkController::class, 'invoicePrint'])->name('work.invoicePrint');
    Route::get('/work/attach/{work}', [WorkController::class, 'attach'])->name('work.attach');
    Route::get('/task/move/{task}', [TaskController::class, 'move'])->name('task.move');
    Route::post('/task/moveTask', [TaskController::class, 'moveTask'])->name('task.moveTask');

    // Worker extra
    Route::get('/worker/hoursDates/{worker}', [WorkerController::class, 'hoursDates'])->name('worker.hoursDates');
    Route::post('/worker/taskfromworker', [WorkerController::class, 'taskfromworker'])->name('worker.taskfromworker');
    Route::get('/worker/clientfromworker/{worker}', [WorkerController::class, 'clientfromworker'])->name('worker.clientfromworker');

    // Call extra
    Route::post('/call/taskfromcall', [CallController::class, 'taskfromcall'])->name('call.taskfromcall');

    // Utility: clear caches
    Route::get('/clear-route-cache', function () {
        Artisan::call('route:cache');
        return 'Routes cache has clear successfully !';
    });

    Route::get('/clear-config-cache', function () {
        Artisan::call('config:cache');
        return 'Config cache has clear successfully !';
    });

    Route::get('/clear-app-cache', function () {
        Artisan::call('cache:clear');
        return 'Application cache has clear successfully!';
    });

    Route::get('/clear-view-cache', function () {
        Artisan::call('view:clear');
        return 'View cache has clear successfully!';
    });

    // URL SDI
    Route::get('/work/invoiceXml/{work}', [WorkController::class, 'invoiceXml'])->name('work.invoiceXml');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
