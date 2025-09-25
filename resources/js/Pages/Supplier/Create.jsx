import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextAreaInput from "@/Components/TextAreaInput";

import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ auth }) {
  const { data, setData, post, errors, reset } = useForm({
    cfcditta: "",  tipocf: "",  codcf: "",  ragsoccf: "",  domicilio: "",  capcf: "",  cittacf: "",  provcf: "",  codfis: "",  pivacf: "",  telef: "",  fax: "",  addbol: "",  codban: "",  sconto1: "",  sconto2: "",  sconto3: "",  codpag: "",  codese: "",  codliscf: "",  civacf: "",  speinc: "",  speince: "",  cognome: "",  nome: "",  perfis: "",  sesso: "",  datanas: "",  provnas: "",  codcon: "",  partite: "",  scadenze: "",  mese2es: "",  giornosc: "",  numaut: "",  dataaut: "",  numpro: "",  tipocli: "",  ragsocfa: "",  indirifa: "",  cittafa: "",  provfa: "",  capfa: "",  ragsocri: "",  indiriri: "",  cittari: "",  provri: "",  capri: "",  fatemail: "",  indemailf: "",  indemaile: "",  indemailo: "",  indemailp: "",  indemailg: "",  perrit: "",  cfcodiban: "",  numdoc: "",  flagraee: "",  tipoca: "",  flagra: "",  cccodtri: "",  indpec: "", 
  });

  const onSubmit = (e) => {
    e.preventDefault();

    post(route("supplier.store"));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Nuovo Fornitore
          </h2>
        </div>
      }
    >
      <Head title="Fornitori" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form
              onSubmit={onSubmit}
              className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
            >
               <div className="mt-4">
                <InputLabel htmlFor="cfcditta" value="cfcditta" />

                <TextInput
                  id="cfcditta"
                  type="text"
                  name="cfcditta"
                  value={data.cfcditta}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("cfcditta", e.target.value)}
                />

                <InputError message={errors.cfcditta} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="tipocf" value="tipocf" />

                <TextInput
                  id="tipocf"
                  type="text"
                  name="tipocf"
                  value={data.tipocf}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("tipocf", e.target.value)}
                />

                <InputError message={errors.tipocf} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="codcf" value="codcf" />

                <TextInput
                  id="codcf"
                  type="text"
                  name="codcf"
                  value={data.codcf}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("codcf", e.target.value)}
                />

                <InputError message={errors.codcf} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="supplier_ragsoccf" value="ragsoccf" />

                <TextInput
                  id="supplier_ragsoccf"
                  type="text"
                  name="ragsoccf"
                  value={data.ragsoccf}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("ragsoccf", e.target.value)}
                />

                <InputError message={errors.ragsoccf} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="domicilio" value="domicilio" />

                <TextInput
                  id="domicilio"
                  type="text"
                  name="domicilio"
                  value={data.domicilio}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("domicilio", e.target.value)}
                />

                <InputError message={errors.domicilio} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="capcf" value="capcf" />

                <TextInput
                  id="capcf"
                  type="text"
                  name="capcf"
                  value={data.capcf}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("capcf", e.target.value)}
                />

                <InputError message={errors.capcf} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="cittacf" value="cittacf" />

                <TextInput
                  id="cittacf"
                  type="text"
                  name="cittacf"
                  value={data.cittacf}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("cittacf", e.target.value)}
                />

                <InputError message={errors.cittacf} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="provcf" value="provcf" />

                <TextInput
                  id="provcf"
                  type="text"
                  name="provcf"
                  value={data.provcf}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("provcf", e.target.value)}
                />

                <InputError message={errors.provcf} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="codfis" value="codfis" />

                <TextInput
                  id="codfis"
                  type="text"
                  name="codfis"
                  value={data.codfis}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("codfis", e.target.value)}
                />

                <InputError message={errors.codfis} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="pivacf" value="pivacf" />

                <TextInput
                  id="pivacf"
                  type="text"
                  name="pivacf"
                  value={data.pivacf}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("pivacf", e.target.value)}
                />

                <InputError message={errors.pivacf} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="telef" value="telef" />

                <TextInput
                  id="telef"
                  type="text"
                  name="telef"
                  value={data.telef}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("telef", e.target.value)}
                />

                <InputError message={errors.telef} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="fax" value="fax" />

                <TextInput
                  id="fax"
                  type="text"
                  name="fax"
                  value={data.fax}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("fax", e.target.value)}
                />

                <InputError message={errors.fax} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="addbol" value="addbol" />

                <TextInput
                  id="addbol"
                  type="text"
                  name="addbol"
                  value={data.addbol}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("addbol", e.target.value)}
                />

                <InputError message={errors.addbol} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="codban" value="codban" />

                <TextInput
                  id="codban"
                  type="text"
                  name="codban"
                  value={data.codban}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("codban", e.target.value)}
                />

                <InputError message={errors.codban} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="sconto1" value="sconto1" />

                <TextInput
                  id="sconto1"
                  type="text"
                  name="sconto1"
                  value={data.sconto1}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("sconto1", e.target.value)}
                />

                <InputError message={errors.sconto1} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="sconto2" value="sconto2" />

                <TextInput
                  id="sconto2"
                  type="text"
                  name="sconto2"
                  value={data.sconto2}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("sconto2", e.target.value)}
                />

                <InputError message={errors.sconto2} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="sconto3" value="sconto3" />

                <TextInput
                  id="sconto3"
                  type="text"
                  name="sconto3"
                  value={data.sconto3}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("sconto3", e.target.value)}
                />

                <InputError message={errors.sconto3} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="codpag" value="codpag" />

                <TextInput
                  id="codpag"
                  type="text"
                  name="codpag"
                  value={data.codpag}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("codpag", e.target.value)}
                />

                <InputError message={errors.codpag} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="codese" value="codese" />

                <TextInput
                  id="codese"
                  type="text"
                  name="codese"
                  value={data.codese}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("codese", e.target.value)}
                />

                <InputError message={errors.codese} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="codliscf" value="codliscf" />

                <TextInput
                  id="codliscf"
                  type="text"
                  name="codliscf"
                  value={data.codliscf}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("codliscf", e.target.value)}
                />

                <InputError message={errors.codliscf} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="civacf" value="civacf" />

                <TextInput
                  id="civacf"
                  type="text"
                  name="civacf"
                  value={data.civacf}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("civacf", e.target.value)}
                />

                <InputError message={errors.civacf} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="speinc" value="speinc" />

                <TextInput
                  id="speinc"
                  type="text"
                  name="speinc"
                  value={data.speinc}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("speinc", e.target.value)}
                />

                <InputError message={errors.speinc} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="speince" value="speince" />

                <TextInput
                  id="speince"
                  type="text"
                  name="speince"
                  value={data.speince}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("speince", e.target.value)}
                />

                <InputError message={errors.speince} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="cognome" value="cognome" />

                <TextInput
                  id="cognome"
                  type="text"
                  name="cognome"
                  value={data.cognome}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("cognome", e.target.value)}
                />

                <InputError message={errors.cognome} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="nome" value="nome" />

                <TextInput
                  id="nome"
                  type="text"
                  name="nome"
                  value={data.nome}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("nome", e.target.value)}
                />

                <InputError message={errors.nome} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="perfis" value="perfis" />

                <TextInput
                  id="perfis"
                  type="text"
                  name="perfis"
                  value={data.perfis}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("perfis", e.target.value)}
                />

                <InputError message={errors.perfis} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="sesso" value="sesso" />

                <TextInput
                  id="sesso"
                  type="text"
                  name="sesso"
                  value={data.sesso}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("sesso", e.target.value)}
                />

                <InputError message={errors.sesso} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="datanas" value="datanas" />

                <TextInput
                  id="datanas"
                  type="text"
                  name="datanas"
                  value={data.datanas}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("datanas", e.target.value)}
                />

                <InputError message={errors.datanas} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="provnas" value="provnas" />

                <TextInput
                  id="provnas"
                  type="text"
                  name="provnas"
                  value={data.provnas}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("provnas", e.target.value)}
                />

                <InputError message={errors.provnas} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="codcon" value="codcon" />

                <TextInput
                  id="codcon"
                  type="text"
                  name="codcon"
                  value={data.codcon}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("codcon", e.target.value)}
                />

                <InputError message={errors.codcon} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="partite" value="partite" />

                <TextInput
                  id="partite"
                  type="text"
                  name="partite"
                  value={data.partite}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("partite", e.target.value)}
                />

                <InputError message={errors.partite} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="scadenze" value="scadenze" />

                <TextInput
                  id="scadenze"
                  type="text"
                  name="scadenze"
                  value={data.scadenze}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("scadenze", e.target.value)}
                />

                <InputError message={errors.scadenze} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="mese2es" value="mese2es" />

                <TextInput
                  id="mese2es"
                  type="text"
                  name="mese2es"
                  value={data.mese2es}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("mese2es", e.target.value)}
                />

                <InputError message={errors.mese2es} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="giornosc" value="giornosc" />

                <TextInput
                  id="giornosc"
                  type="text"
                  name="giornosc"
                  value={data.giornosc}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("giornosc", e.target.value)}
                />

                <InputError message={errors.giornosc} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="numaut" value="numaut" />

                <TextInput
                  id="numaut"
                  type="text"
                  name="numaut"
                  value={data.numaut}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("numaut", e.target.value)}
                />

                <InputError message={errors.numaut} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="dataaut" value="dataaut" />

                <TextInput
                  id="dataaut"
                  type="text"
                  name="dataaut"
                  value={data.dataaut}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("dataaut", e.target.value)}
                />

                <InputError message={errors.dataaut} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="numpro" value="numpro" />

                <TextInput
                  id="numpro"
                  type="text"
                  name="numpro"
                  value={data.numpro}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("numpro", e.target.value)}
                />

                <InputError message={errors.numpro} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="tipocli" value="tipocli" />

                <TextInput
                  id="tipocli"
                  type="text"
                  name="tipocli"
                  value={data.tipocli}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("tipocli", e.target.value)}
                />

                <InputError message={errors.tipocli} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="ragsocfa" value="ragsocfa" />

                <TextInput
                  id="ragsocfa"
                  type="text"
                  name="ragsocfa"
                  value={data.ragsocfa}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("ragsocfa", e.target.value)}
                />

                <InputError message={errors.ragsocfa} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="indirifa" value="indirifa" />

                <TextInput
                  id="indirifa"
                  type="text"
                  name="indirifa"
                  value={data.indirifa}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("indirifa", e.target.value)}
                />

                <InputError message={errors.indirifa} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="cittafa" value="cittafa" />

                <TextInput
                  id="cittafa"
                  type="text"
                  name="cittafa"
                  value={data.cittafa}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("cittafa", e.target.value)}
                />

                <InputError message={errors.cittafa} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="provfa" value="provfa" />

                <TextInput
                  id="provfa"
                  type="text"
                  name="provfa"
                  value={data.provfa}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("provfa", e.target.value)}
                />

                <InputError message={errors.provfa} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="capfa" value="capfa" />

                <TextInput
                  id="capfa"
                  type="text"
                  name="capfa"
                  value={data.capfa}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("capfa", e.target.value)}
                />

                <InputError message={errors.capfa} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="ragsocri" value="ragsocri" />

                <TextInput
                  id="ragsocri"
                  type="text"
                  name="ragsocri"
                  value={data.ragsocri}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("ragsocri", e.target.value)}
                />

                <InputError message={errors.ragsocri} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="indiriri" value="indiriri" />

                <TextInput
                  id="indiriri"
                  type="text"
                  name="indiriri"
                  value={data.indiriri}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("indiriri", e.target.value)}
                />

                <InputError message={errors.indiriri} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="cittari" value="cittari" />

                <TextInput
                  id="cittari"
                  type="text"
                  name="cittari"
                  value={data.cittari}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("cittari", e.target.value)}
                />

                <InputError message={errors.cittari} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="provri" value="provri" />

                <TextInput
                  id="provri"
                  type="text"
                  name="provri"
                  value={data.provri}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("provri", e.target.value)}
                />

                <InputError message={errors.provri} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="capri" value="capri" />

                <TextInput
                  id="capri"
                  type="text"
                  name="capri"
                  value={data.capri}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("capri", e.target.value)}
                />

                <InputError message={errors.capri} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="fatemail" value="fatemail" />

                <TextInput
                  id="fatemail"
                  type="text"
                  name="fatemail"
                  value={data.fatemail}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("fatemail", e.target.value)}
                />

                <InputError message={errors.fatemail} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="indemailf" value="indemailf" />

                <TextInput
                  id="indemailf"
                  type="text"
                  name="indemailf"
                  value={data.indemailf}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("indemailf", e.target.value)}
                />

                <InputError message={errors.indemailf} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="indemaile" value="indemaile" />

                <TextInput
                  id="indemaile"
                  type="text"
                  name="indemaile"
                  value={data.indemaile}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("indemaile", e.target.value)}
                />

                <InputError message={errors.indemaile} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="indemailo" value="indemailo" />

                <TextInput
                  id="indemailo"
                  type="text"
                  name="indemailo"
                  value={data.indemailo}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("indemailo", e.target.value)}
                />

                <InputError message={errors.indemailo} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="indemailp" value="indemailp" />

                <TextInput
                  id="indemailp"
                  type="text"
                  name="indemailp"
                  value={data.indemailp}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("indemailp", e.target.value)}
                />

                <InputError message={errors.indemailp} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="indemailg" value="indemailg" />

                <TextInput
                  id="indemailg"
                  type="text"
                  name="indemailg"
                  value={data.indemailg}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("indemailg", e.target.value)}
                />

                <InputError message={errors.indemailg} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="perrit" value="perrit" />

                <TextInput
                  id="perrit"
                  type="text"
                  name="perrit"
                  value={data.perrit}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("perrit", e.target.value)}
                />

                <InputError message={errors.perrit} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="cfcodiban" value="cfcodiban" />

                <TextInput
                  id="cfcodiban"
                  type="text"
                  name="cfcodiban"
                  value={data.cfcodiban}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("cfcodiban", e.target.value)}
                />

                <InputError message={errors.cfcodiban} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="numdoc" value="numdoc" />

                <TextInput
                  id="numdoc"
                  type="text"
                  name="numdoc"
                  value={data.numdoc}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("numdoc", e.target.value)}
                />

                <InputError message={errors.numdoc} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="flagraee" value="flagraee" />

                <TextInput
                  id="flagraee"
                  type="text"
                  name="flagraee"
                  value={data.flagraee}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("flagraee", e.target.value)}
                />

                <InputError message={errors.flagraee} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="tipoca" value="tipoca" />

                <TextInput
                  id="tipoca"
                  type="text"
                  name="tipoca"
                  value={data.tipoca}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("tipoca", e.target.value)}
                />

                <InputError message={errors.tipoca} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="flagra" value="flagra" />

                <TextInput
                  id="flagra"
                  type="text"
                  name="flagra"
                  value={data.flagra}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("flagra", e.target.value)}
                />

                <InputError message={errors.flagra} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="cccodtri" value="cccodtri" />

                <TextInput
                  id="cccodtri"
                  type="text"
                  name="cccodtri"
                  value={data.cccodtri}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("cccodtri", e.target.value)}
                />

                <InputError message={errors.cccodtri} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="indpec" value="indpec" />

                <TextInput
                  id="indpec"
                  type="text"
                  name="indpec"
                  value={data.indpec}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("indpec", e.target.value)}
                />

                <InputError message={errors.indpec} className="mt-2" />
              </div>

              <div className="mt-4 text-right">
                <Link
                  href={route("supplier.index")}
                  className="bg-gray-100 py-1 px-3 text-gray-800 rounded shadow transition-all hover:bg-gray-200 mr-2"
                >
                  Annulla
                </Link>
                <button className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600">
                  OK
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
