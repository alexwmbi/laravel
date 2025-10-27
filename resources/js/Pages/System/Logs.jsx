import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";

export default function Logs({
  files = [],
  selectedFile = "",
  logContent = "",
  size = 0,
  modifiedAt = null,
  maxBytes = 0,
}) {
  const [currentFile, setCurrentFile] = useState(selectedFile);
  const [content, setContent] = useState(logContent || "");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [lastMeta, setLastMeta] = useState({ size, modifiedAt });
  const preRef = useRef(null);
  const intervalRef = useRef(null);

  const formattedSize = useMemo(() => {
    const s = lastMeta.size ?? 0;
    if (s < 1024) return `${s} B`;
    if (s < 1024 * 1024) return `${(s / 1024).toFixed(1)} KB`;
    return `${(s / (1024 * 1024)).toFixed(2)} MB`;
  }, [lastMeta.size]);

  const filteredContent = useMemo(() => {
    if (!filter.trim()) return content;
    const lines = (content || "").split("\n");
    const q = filter.toLowerCase();
    return lines.filter((l) => l.toLowerCase().includes(q)).join("\n");
  }, [content, filter]);

  useEffect(() => {
    // auto-scroll in fondo quando arriva nuovo contenuto
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [filteredContent]);

  useEffect(() => {
    // gestisci polling
    const tick = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("file", currentFile);
        const res = await fetch(`/system/logs/content?${params.toString()}`, {
          headers: { "Accept": "application/json" },
        });
        if (!res.ok) throw new Error("Fetch fallita");
        const data = await res.json();
        setContent(data.logContent ?? "");
        setLastMeta({ size: data.size ?? 0, modifiedAt: data.modifiedAt ?? null });
      } catch (e) {
        // opzionale: toast/console
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (autoRefresh) {
      // aggiornamento ogni 2 secondi
      intervalRef.current = setInterval(tick, 2000);
      tick(); // primo colpo immediato
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, currentFile]);

  const onChangeFile = (e) => {
    const next = e.target.value;
    setCurrentFile(next);
    // aggiorna anche la URL (utile per refresh manuale e shareable link)
    router.visit(route("logs.index", { file: next }), { preserveScroll: true, preserveState: true, replace: true });
  };

  const onClear = (e) => {
    e.preventDefault();
    if (!confirm("Sei sicuro di voler svuotare il file di log selezionato?")) return;

    router.post(route("logs.clear"), { file: currentFile }, {
      preserveScroll: true,
      onSuccess: () => {
        // azzera contenuto localmente
        setContent("");
        setLastMeta({ size: 0, modifiedAt: Date.now() / 1000 });
      },
    });
  };

  const onDownload = () => {
    const url = route("logs.download", { file: currentFile });
    // forza download
    window.location.href = url;
  };

  return (
    <div className="p-6 space-y-4">
      <Head title="System Logs" />

      <h1 className="text-2xl font-semibold">System Logs</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">File di log</label>
          <select
            value={currentFile}
            onChange={onChangeFile}
            className="border rounded-md px-3 py-2"
          >
            {files.map((f) => (
              <option key={f.path} value={f.path}>
                {f.name} {f.size ? `(${(f.size/1024).toFixed(1)} KB)` : "(vuoto)"}
              </option>
            ))}
          </select>
          <div className="text-xs text-gray-500">
            Caricati al massimo {Math.round(maxBytes / 1024)} KB dal fondo del file.
          </div>
        </div>

        <div className="flex items-end gap-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (2s)
          </label>

          <button
            type="button"
            onClick={() => router.reload({ only: ['files', 'selectedFile', 'logContent', 'size', 'modifiedAt'] })}
            className="border px-3 py-2 rounded-md"
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={onDownload}
            className="border px-3 py-2 rounded-md"
            title="Scarica il file di log"
          >
            Download
          </button>

          <form onSubmit={onClear}>
            <button
              type="submit"
              className="bg-red-600 text-white px-3 py-2 rounded-md"
              title="Svuota il file selezionato"
            >
              Svuota
            </button>
          </form>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Filtro (contiene)</label>
          <input
            type="text"
            placeholder="es. ERROR, stacktrace, View [app] not found..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          />
        </div>

        <div className="text-sm text-gray-600 flex items-end">
          <span className="mr-3">Dimensione: {formattedSize}</span>
          <span className="mr-3">
            Ultima modifica:{" "}
            {lastMeta.modifiedAt ? new Date(lastMeta.modifiedAt * 1000).toLocaleString() : "N/D"}
          </span>
          {loading && <span className="italic">aggiornamento…</span>}
        </div>
      </div>

      <div className="border rounded-md bg-black text-green-200">
        <pre
          ref={preRef}
          className="p-4 overflow-auto max-h-[70vh] whitespace-pre-wrap break-words"
        >
{filteredContent || "— nessun contenuto —"}
        </pre>
      </div>
    </div>
  );
}
