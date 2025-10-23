import React, { useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { ArrowUturnLeftIcon, PencilSquareIcon, DocumentArrowDownIcon } from "@heroicons/react/16/solid";
import { ACCOUNTING_STATUS_CLASS_MAP, ACCOUNTING_STATUS_TEXT_MAP } from "@/constants.jsx";

const formatEUR = (v) => {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
};

const fmtDateIT = (val) => {
  if (!val) return "";
  const s = String(val);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  return s;
};

const Row = ({ label, value, mono = false }) => (
  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-2 border-b last:border-b-0">
    <div className="col-span-1 text-xs text-gray-500">{label}</div>
    <div className={`col-span-2 sm:col-span-3 text-sm ${mono ? "font-mono" : ""}`}>
      {value ?? "-"}
    </div>
  </div>
);

// Fallback: estrae la riga bollo dall'XML se non presente nel DB
function useBolloFromXml(xmlString) {
  return useMemo(() => {
    if (!xmlString) return null;
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlString, "application/xml");
      const linee = Array.from(xml.querySelectorAll("DatiBeniServizi DettaglioLinee"));
      const hit = linee.find(l => {
        const d = (l.querySelector("Descrizione")?.textContent || "").toLowerCase();
        return d.includes("bollo") || d.includes("marca da bollo");
      });
      if (!hit) return null;

      const num = hit.querySelector("NumeroLinea")?.textContent ?? null;
      const desc = hit.querySelector("Descrizione")?.textContent ?? null;
      const pu = hit.querySelector("PrezzoUnitario")?.textContent ?? null;
      const pt = hit.querySelector("PrezzoTotale")?.textContent ?? null;
      const aliq = hit.querySelector("AliquotaIVA")?.textContent ?? null;
      const nat = hit.querySelector("Natura")?.textContent ?? null;

      const toNum = (s) => s != null ? Number(String(s).replace(",", ".")) : null;

      return {
        numero: num ? Number(num) : null,
        descrizione: desc ?? null,
        prezzoUnitario: toNum(pu),
        prezzoTotale: toNum(pt),
        aliquotaIVA: aliq != null ? Number(String(aliq).replace(",", ".")) : null,
        natura: nat ?? null,
      };
    } catch {
      return null;
    }
  }, [xmlString]);
}

export default function Show({ auth, accounting, backQuery = null }) {
  const a = accounting ?? {};
  const backHref = backQuery ? route("accounting.index", backQuery) : route("accounting.index");

  const signed = (v) => ((a?.TipoDocumento === "TD04") ? -1 : 1) * Number(v ?? 0);

  // Dati bollo dal DB (nuove colonne) oppure fallback dall'XML
  const bolloDB = {
    numero: a?.BolloLineaNumero ?? null,
    descrizione: a?.BolloLineaDescrizione ?? null,
    prezzoUnitario: a?.BolloPrezzoUnitario ?? null,
    prezzoTotale: a?.BolloPrezzoTotale ?? null,
    aliquotaIVA: a?.BolloAliquotaIVA ?? null,
    natura: a?.BolloNatura ?? null,
  };
  const bolloXML = useBolloFromXml(a?.xml_originale);
  const bollo = (bolloDB.numero || bolloDB.descrizione || bolloDB.prezzoTotale != null) ? bolloDB : (bolloXML ?? null);

  return (
    <AuthenticatedLayout user={auth?.user}>
      <Head title={`Dettaglio Documento #${a?.id ?? ""}`} />

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Dettaglio Documento {a?.id ? <span className="text-gray-400">#{a.id}</span> : null}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm">
              {a?.TipoDocumento && (
                <span
                  className={
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border " +
                    (a.TipoDocumento === "TD04"
                      ? "bg-pink-50 text-pink-700 border-pink-200"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200")
                  }
                >
                  {a.TipoDocumento === "TD04" ? "Nota di credito (TD04)" : "Fattura (TD01)"}
                </span>
              )}
              {a?.Stato && (
                <span className={"inline-flex items-center rounded px-2 py-0.5 text-white " + ACCOUNTING_STATUS_CLASS_MAP[a.Stato]}>
                  {ACCOUNTING_STATUS_TEXT_MAP[a.Stato] || a.Stato}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {a?.xml_originale && (
              <a
                href={route("accounting.xml", a.id)}
                download={`fattura_${a.id}.xml`}
                className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                Scarica XML
              </a>
            )}
            <Link
              href={route("accounting.edit", a.id)}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Modifica
            </Link>
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
              Indietro
            </Link>
          </div>
        </div>

        {/* Documento */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Documento</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Row label="Progressivo" value={a?.Progressivo} />
                <Row label="Progressivo Invio" value={a?.ProgressivoInvio} />
                <Row label="Numero" value={a?.Numero} />
                <Row label="Data" value={fmtDateIT(a?.Data)} />
                <Row label="Divisa" value={a?.Divisa} />
              </div>
              <div>
                <Row label="Totale Documento" value={formatEUR(signed(a?.ImportoTotaleDocumento))} />
                <Row label="Stato" value={ACCOUNTING_STATUS_TEXT_MAP[a?.Stato] || a?.Stato} />
                <Row label="Importato il" value={a?.imported_at ? new Date(a.imported_at).toLocaleString("it-IT") : "-"} />
                <Row label="Formato Trasmissione" value={a?.FormatoTrasmissione} />
                <Row label="Ufficio REA" value={a?.UfficioRea} />
              </div>
            </div>
          </div>
        </div>

        {/* Fornitore */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Fornitore (Cedente/Prestatore)</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Row label="Nome/Ragione Sociale" value={a?.FornitoreNome} />
                <Row label="Codice Fiscale" value={a?.FornitoreCodiceFiscale} mono />
                <Row label="Id Paese" value={a?.FornitoreIdPaese} />
                <Row label="Id Codice" value={a?.FornitoreIdCodice} mono />
                <Row label="Regime Fiscale" value={a?.FornitoreRegimeFiscale} />
                <Row label="Telefono" value={a?.FornitoreTelefono} />
                <Row label="Email" value={a?.FornitoreEmail} />
              </div>
              <div>
                <Row label="Sede - Indirizzo" value={a?.FornitoreSedeIndirizzo} />
                <Row label="Sede - CAP" value={a?.FornitoreSedeCAP} />
                <Row label="Sede - Comune" value={a?.FornitoreSedeComune} />
                <Row label="Sede - Provincia" value={a?.FornitoreSedeProvincia} />
                <Row label="Sede - Nazione" value={a?.FornitoreSedeNazione} />
                <Row label="Numero REA" value={a?.NumeroRea} />
                <Row label="Capitale Sociale REA" value={a?.CapitaleSocialeRea} />
                <Row label="Socio Unico REA" value={a?.SocioUnicoRea} />
                <Row label="Stato Liquidazione REA" value={a?.StatoLiquidazioneRea} />
              </div>
            </div>
          </div>
        </div>

        {/* Dettagli fiscali */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Dettagli fiscali</h2>
          </div>
        <div className="px-6 py-4 grid md:grid-cols-2 gap-6">
            <div>
              <Row label="Codice Articolo Tipo 1" value={a?.CodiceArticoloTipo1} />
              <Row label="Codice Articolo Valore 1" value={a?.CodiceArticoloValore1} />
              <Row label="Codice Articolo Tipo 2" value={a?.CodiceArticoloTipo2} />
              <Row label="Codice Articolo Valore 2" value={a?.CodiceArticoloValore2} />
              <Row label="Descrizione" value={a?.Descrizione} />
              <Row label="Quantità" value={a?.Quantita} />
              <Row label="Unità di Misura" value={a?.UnitaMisura} />
            </div>
            <div>
              <Row label="Prezzo Unitario" value={a?.PrezzoUnitario} />
              <Row label="Prezzo Totale" value={a?.PrezzoTotale} />
              <Row label="Aliquota IVA" value={a?.AliquotaIVA} />
              <Row label="Riep. Aliquota IVA" value={a?.RiepilogoAliquotaIVA} />
              <Row label="Riep. Spese Accessorie" value={a?.RiepilogoSpeseAccessorie} />
              <Row label="Riep. Imponibile Importo" value={a?.RiepilogoImponibileImporto} />
              <Row label="Riep. Imposta" value={a?.RiepilogoImposta} />
              <Row label="Riep. Esigibilità IVA" value={a?.RiepilogoEsigibilitaIVA} />
            </div>
          </div>
        </div>

        {/* Bollo (riga beni) */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Bollo (riga beni)</h2>
          </div>
          <div className="px-6 py-4 grid md:grid-cols-2 gap-6">
            <div>
              <Row label="Numero linea" value={bollo?.numero ?? "-"} />
              <Row label="Descrizione" value={bollo?.descrizione ?? "-"} />
              <Row label="Prezzo Unitario" value={bollo?.prezzoUnitario != null ? formatEUR(bollo.prezzoUnitario) : "-"} />
            </div>
            <div>
              <Row label="Prezzo Totale" value={bollo?.prezzoTotale != null ? formatEUR(bollo.prezzoTotale) : "-"} />
              <Row label="Aliquota IVA" value={bollo?.aliquotaIVA != null ? `${bollo.aliquotaIVA}%` : "-"} />
              <Row label="Natura" value={bollo?.natura ?? "-"} />
            </div>
          </div>
        </div>

        {/* Righe pagamento */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <div className="px-6 py-4 flex items-center justify-between border-b">
            <h2 className="text-lg font-semibold">Righe pagamento</h2>
            {a?.TipoDocumento === "TD04" && (
              <span className="text-xs text-pink-700 bg-pink-50 border border-pink-200 px-2 py-1 rounded">
                Nota di credito: importi mostrati in negativo
              </span>
            )}
          </div>

          <div className="px-6 py-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Stato</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Modalità</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Tipo</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Scadenza</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Importo</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Note</th>
                </tr>
              </thead>
              <tbody>
                {(a?.detail_accounting ?? []).length ? (
                  a.detail_accounting.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="px-4 py-2">
                        {row.stato ? (
                          <span className={"px-2 py-1 rounded text-white " + ACCOUNTING_STATUS_CLASS_MAP[row.stato]}>
                            {ACCOUNTING_STATUS_TEXT_MAP[row.stato]}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="px-4 py-2">{row.modalitaPagamento ?? "-"}</td>
                      <td className="px-4 py-2">{row.tipoPagamento ?? "-"}</td>
                      <td className="px-4 py-2">{fmtDateIT(row.dataScadenzaPagamento)}</td>
                      <td className="px-4 py-2">{formatEUR(signed(row.importoPagamento))}</td>
                      <td className="px-4 py-2">{row.note ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                      Nessuna riga pagamento presente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* XML originale */}
        {a?.xml_originale && (
          <div className="bg-white shadow-sm sm:rounded-lg">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">XML originale</h2>
              <a
                href={route("accounting.xml", a.id)}
                download={`fattura_${a.id}.xml`}
                className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                Scarica XML
              </a>
            </div>
            <div className="px-6 py-4">
              <pre className="max-h-64 overflow-auto text-xs bg-gray-50 p-3 rounded border">{a.xml_originale}</pre>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
