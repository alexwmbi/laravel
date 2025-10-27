<?php

namespace App\Http\Controllers\System;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class LogController extends Controller
{
    /** Limite di bytes caricati per non “freezare” la UI su file giganti */
    private const MAX_BYTES = 256 * 1024; // 256 KB

    public function index(Request $request)
    {
        [$files, $default] = $this->getLogFiles();
        $selected = $this->resolveSelectedFile($request->string('file')->toString(), $files, $default);

        $payload = $this->readTail($selected, self::MAX_BYTES);

        return Inertia::render('System/Logs', [
            'files'        => array_values($files),  // elenco con metadati
            'selectedFile' => $selected,
            'logContent'   => $payload['content'],
            'size'         => $payload['size'],
            'modifiedAt'   => $payload['modifiedAt'],
            'maxBytes'     => self::MAX_BYTES,
        ]);
    }

    /** Endpoint per polling: ritorna solo JSON con parti variabili del log */
    public function content(Request $request)
    {
        [$files, $default] = $this->getLogFiles();
        $selected = $this->resolveSelectedFile($request->string('file')->toString(), $files, $default);

        $payload = $this->readTail($selected, self::MAX_BYTES);

        return response()->json([
            'selectedFile' => $selected,
            'logContent'   => $payload['content'],
            'size'         => $payload['size'],
            'modifiedAt'   => $payload['modifiedAt'],
        ]);
    }

    /** Svuota (trunca) il file selezionato */
    public function clear(Request $request)
    {
        $request->validate([
            'file' => ['nullable', 'string'],
        ]);

        [$files, $default] = $this->getLogFiles();
        $selected = $this->resolveSelectedFile($request->string('file')->toString(), $files, $default);

        if (!File::exists($selected) || !is_writable($selected)) {
            return back()->with('error', 'File non trovato o non scrivibile');
        }

        // Truncate: più sicuro di unlink in ambienti con handle aperti
        $ok = (bool) @file_put_contents($selected, '');
        if (!$ok) {
            return back()->with('error', 'Impossibile svuotare il file di log.');
        }

        return back()->with('success', 'Log svuotato con successo.');
    }

    /** Opzionale: download del file selezionato */
    public function download(Request $request)
    {
        [$files, $default] = $this->getLogFiles();
        $selected = $this->resolveSelectedFile($request->string('file')->toString(), $files, $default);

        abort_unless(File::exists($selected), 404);
        return response()->download($selected, basename($selected), [
            'Content-Type' => 'text/plain; charset=utf-8',
        ]);
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------

    /** Ritorna: [ array $files, string $defaultFile ] */
    private function getLogFiles(): array
    {
        $dir = storage_path('logs');

        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $paths = glob($dir . DIRECTORY_SEPARATOR . '*.log') ?: [];

        // mappa in struttura ricca e ordina per mtime desc
        $files = [];
        foreach ($paths as $path) {
            $files[$path] = [
                'path'       => $path,
                'name'       => basename($path),
                'size'       => @filesize($path) ?: 0,
                'modifiedAt' => @filemtime($path) ?: null,
            ];
        }

        usort($files, function ($a, $b) {
            return ($b['modifiedAt'] ?? 0) <=> ($a['modifiedAt'] ?? 0);
        });

        // ricostruisci chiavi = path
        $byPath = [];
        foreach ($files as $f) {
            $byPath[$f['path']] = $f;
        }

        $default = !empty($files) ? $files[0]['path'] : ($dir . DIRECTORY_SEPARATOR . 'laravel.log');

        // se non esiste alcun file, creane uno vuoto come default
        if (empty($paths) && !File::exists($default)) {
            @file_put_contents($default, '');
            $byPath[$default] = [
                'path'       => $default,
                'name'       => basename($default),
                'size'       => 0,
                'modifiedAt' => time(),
            ];
        }

        return [$byPath, $default];
    }

    private function resolveSelectedFile(?string $candidate, array $files, string $fallback): string
    {
        if ($candidate && isset($files[$candidate])) {
            return $candidate;
        }

        // Permetti anche selezione via nome semplice (es. "laravel.log")
        foreach ($files as $path => $meta) {
            if ($candidate && Str::of($meta['name'])->exactly($candidate)) {
                return $path;
            }
        }

        return $fallback;
    }

    /** Legge gli ultimi $maxBytes del file e ritorna contenuto + metadata */
    private function readTail(string $path, int $maxBytes): array
    {
        if (!File::exists($path)) {
            return ['content' => '', 'size' => 0, 'modifiedAt' => null];
        }

        $size = @filesize($path) ?: 0;
        $offset = max(0, $size - $maxBytes);

        $content = ($size > 0)
            ? @file_get_contents($path, false, null, $offset, $maxBytes)
            : '';

        // Normalizza fine riga per Windows/macOS/Linux
        $content = str_replace(["\r\n", "\r"], "\n", $content ?? '');

        return [
            'content'    => $content,
            'size'       => $size,
            'modifiedAt' => @filemtime($path) ?: null,
        ];
    }
}
