import React, { useState } from 'react';
import { X, School, Save, MapPin } from 'lucide-react';
import { Etablissement, Commune } from '../../types';

interface NewEtablissementModalProps {
  initialData?: Etablissement;
  communes: Commune[];
  allowedDirections?: string[];
  onSave: (etab: Etablissement) => void;
  onClose: () => void;
}

export const NewEtablissementModal: React.FC<NewEtablissementModalProps> = ({
  initialData,
  communes,
  allowedDirections = ['Inzegane Aït Melloul', 'Agadir Ida-Outanane', 'Chtouka Aït Baha', 'Taroudannt', 'Tiznit', 'Tata'],
  onSave,
  onClose
}) => {
  const [nomAr, setNomAr] = useState(initialData?.nomAr || '');
  const [nomFr, setNomFr] = useState(initialData?.nomFr || '');
  const [codeEtab, setCodeEtab] = useState(initialData?.codeEtab || '');
  const [commune, setCommune] = useState(initialData?.commune || 'إنزكان');
  const [type, setType] = useState<'college' | 'lycee' | 'qualifiant'>(initialData?.type || 'college');
  const [directionProvinciale, setDirectionProvinciale] = useState(
    initialData?.directionProvinciale || (allowedDirections[0] || 'Inzegane Aït Melloul')
  );
  const [estPionnier, setEstPionnier] = useState(initialData?.estPionnier || false);
  const [directeurNom, setDirecteurNom] = useState(initialData?.directeurNom || '');
  const [adresse, setAdresse] = useState(initialData?.adresse || '');
  const [telephone, setTelephone] = useState(initialData?.telephone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [latitude, setLatitude] = useState(initialData?.latitude ? String(initialData.latitude) : '');
  const [longitude, setLongitude] = useState(initialData?.longitude ? String(initialData.longitude) : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomAr.trim()) return;

    const latNum = latitude.trim() ? parseFloat(latitude) : undefined;
    const lngNum = longitude.trim() ? parseFloat(longitude) : undefined;

    const selectedCommuneObj = communes.find(c => c.nomAr === commune);

    const etabData: Etablissement = {
      id: initialData?.id || `etab-${Date.now()}`,
      nomAr: nomAr.trim(),
      nomFr: nomFr.trim() || nomAr.trim(),
      codeEtab: codeEtab.trim() || undefined,
      commune,
      communeFr: selectedCommuneObj ? selectedCommuneObj.nomFr : (initialData?.communeFr || commune),
      type,
      estPionnier,
      directionProvinciale: directionProvinciale.trim(),
      academie: initialData?.academie || 'Souss-Massa',
      directeurNom: directeurNom.trim() || undefined,
      adresse: adresse.trim() || undefined,
      latitude: latNum,
      longitude: lngNum,
      telephone: telephone.trim() || undefined,
      email: email.trim() || undefined
    };

    onSave(etabData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <School className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold">
              {initialData ? 'Modifier l’Établissement' : 'Inscrire un Établissement'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nom de l'établissement en Arabe <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nomAr}
                  onChange={e => setNomAr(e.target.value)}
                  placeholder="Ex: ثانوية الفردوس التأهيلية"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Code GRESA / Code
                </label>
                <input
                  type="text"
                  value={codeEtab}
                  onChange={e => setCodeEtab(e.target.value)}
                  placeholder="Ex: 09482X"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nom en Français
              </label>
              <input
                type="text"
                value={nomFr}
                onChange={e => setNomFr(e.target.value)}
                placeholder="Ex: Lycée Qualifiant Al Firdaous"
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Direction Provinciale</label>
              <select
                value={directionProvinciale}
                onChange={e => setDirectionProvinciale(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium bg-white"
              >
                {allowedDirections.map(dir => (
                  <option key={dir} value={dir}>{dir}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Commune</label>
              <select
                value={commune}
                onChange={e => setCommune(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
              >
                {communes.map(c => (
                  <option key={c.id} value={c.nomAr}>{c.nomAr} ({c.nomFr})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Type de structure</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
              >
                <option value="college">Collège (ثانوية إعدادية)</option>
                <option value="lycee">Lycée (ثانوية تأهيلية)</option>
                <option value="qualifiant">Lycée Qualifiant (تأهيلي)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Directeur / Chef d'établissement
              </label>
              <input
                type="text"
                value={directeurNom}
                onChange={e => setDirecteurNom(e.target.value)}
                placeholder="Ex: M. Ahmed Bennani"
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Téléphone de contact
              </label>
              <input
                type="text"
                value={telephone}
                onChange={e => setTelephone(e.target.value)}
                placeholder="Ex: 0528 24 00 00"
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email officiel
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="etab@men.gov.ma"
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Adresse physique
              </label>
              <input
                type="text"
                value={adresse}
                onChange={e => setAdresse(e.target.value)}
                placeholder="Ex: Bd Mohammed V, Inzegane"
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="estPionnier"
              checked={estPionnier}
              onChange={e => setEstPionnier(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="estPionnier" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Établissement Pionnier (مؤسسة الريادة)
            </label>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Coordonnées Géographiques (GPS)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={e => setLatitude(e.target.value)}
                  placeholder="Ex: 30.3653"
                  className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={e => setLongitude(e.target.value)}
                  placeholder="Ex: -9.4963"
                  className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
