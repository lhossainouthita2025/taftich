import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { Enseignant, Etablissement, Commune } from '../../types';

interface NewEnseignantModalProps {
  initialData?: Enseignant;
  etablissements: Etablissement[];
  communes: Commune[];
  onSave: (enseignant: Enseignant) => void;
  onClose: () => void;
}

export const NewEnseignantModal: React.FC<NewEnseignantModalProps> = ({
  initialData,
  etablissements,
  communes,
  onSave,
  onClose
}) => {
  const [doti, setDoti] = useState(initialData?.doti || '');
  const [nom, setNom] = useState(initialData?.nom || '');
  const [nomFr, setNomFr] = useState(initialData?.nomFr || '');
  const [commune, setCommune] = useState(initialData?.commune || 'إنزكان');
  const [etablissementId, setEtablissementId] = useState(initialData?.etablissementId || '');
  const [grade, setGrade] = useState(initialData?.grade || 'أستاذ التعليم الثانوي التأهيلي');
  const [matiere, setMatiere] = useState(initialData?.matiere || 'المعلوميات');
  const [cycle, setCycle] = useState<'اعدادي' | 'تأهيلي'>(initialData?.cycle || 'اعدادي');
  const [promotionEchelon, setPromotionEchelon] = useState(Boolean(initialData?.promotionEchelon));
  const [promotionGrade, setPromotionGrade] = useState(Boolean(initialData?.promotionGrade));
  const [actif, setActif] = useState(initialData ? initialData.actif : true);
  const [telephone, setTelephone] = useState(initialData?.telephone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [derniereNote, setDerniereNote] = useState<string>(
    initialData?.derniereNote !== undefined ? String(initialData.derniereNote) : ''
  );
  const [derniereAnnee, setDerniereAnnee] = useState<string>(
    initialData?.derniereAnneeInspection ? String(initialData.derniereAnneeInspection) : ''
  );
  const [error, setError] = useState('');

  // Auto set establishment if not selected
  useEffect(() => {
    if (!etablissementId && etablissements.length > 0) {
      const match = etablissements.find(e => e.commune === commune) || etablissements[0];
      setEtablissementId(match.id);
    }
  }, [commune, etablissements, etablissementId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doti.trim() || !nom.trim()) {
      setError('Veuillez renseigner au minimum le N° Doti et le nom de l’enseignant.');
      return;
    }

    const selectedEtab = etablissements.find(e => e.id === etablissementId);
    const etabNom = selectedEtab ? selectedEtab.nomAr : 'Établissement non spécifié';

    let parsedNote: number | 'vis' | undefined = undefined;
    if (derniereNote.trim().toLowerCase() === 'vis') {
      parsedNote = 'vis';
    } else if (derniereNote.trim() !== '') {
      const num = parseFloat(derniereNote.replace(',', '.'));
      if (!isNaN(num) && num >= 0 && num <= 20) {
        parsedNote = num;
      }
    }

    const parsedAnnee = derniereAnnee.trim() ? parseInt(derniereAnnee, 10) : undefined;

    const teacherData: Enseignant = {
      id: initialData?.id || `ens-${Date.now()}`,
      doti: doti.trim(),
      nom: nom.trim(),
      nomFr: nomFr.trim() || undefined,
      commune: selectedEtab ? selectedEtab.commune : commune,
      etablissementId,
      etablissementNom: etabNom,
      grade,
      matiere,
      cycle,
      promotionEchelon,
      promotionGrade,
      actif,
      telephone: telephone.trim() || undefined,
      email: email.trim() || undefined,
      derniereNote: parsedNote,
      derniereAnneeInspection: parsedAnnee,
      emploiDuTemps: initialData?.emploiDuTemps || []
    };

    onSave(teacherData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold">
              {initialData ? 'Modifier l’Enseignant' : 'Inscrire un Nouvel Enseignant'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* DOTI */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                N° Somme / DOTI <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={doti}
                onChange={e => setDoti(e.target.value)}
                placeholder="Ex: 2050271"
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-mono font-semibold"
                required
              />
            </div>

            {/* Nom en Arabe */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nom complet (Arabe) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nom}
                onChange={e => setNom(e.target.value)}
                placeholder="Ex: عمراوي وئام"
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
                required
              />
            </div>

            {/* Nom en Français */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nom complet (Français)
              </label>
              <input
                type="text"
                value={nomFr}
                onChange={e => setNomFr(e.target.value)}
                placeholder="Ex: Amraoui Ouiam"
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Statut d’exercice</label>
              <select
                value={actif ? 'actif' : 'inactif'}
                onChange={e => setActif(e.target.value === 'actif')}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
              >
                <option value="actif">Actif (VRAI)</option>
                <option value="inactif">Inactif / En congé (FAUX)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Commune */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Commune</label>
              <select
                value={commune}
                onChange={e => {
                  setCommune(e.target.value);
                  const firstEtab = etablissements.find(et => et.commune === e.target.value);
                  if (firstEtab) setEtablissementId(firstEtab.id);
                }}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
              >
                {communes.map(c => (
                  <option key={c.id} value={c.nomAr}>{c.nomAr} ({c.nomFr})</option>
                ))}
              </select>
            </div>

            {/* Établissement */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Établissement</label>
              <select
                value={etablissementId}
                onChange={e => setEtablissementId(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 truncate"
              >
                {etablissements
                  .filter(e => e.commune === commune)
                  .map(e => (
                    <option key={e.id} value={e.id}>{e.nomAr}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Grade */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Cadre (Itar)</label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
              >
                <option value="أستاذ التعليم الثانوي التأهيلي">أستاذ التعليم الثانوي التأهيلي</option>
                <option value="أستاذ التعليم الثانوي الاعدادي">أستاذ التعليم الثانوي الاعدادي</option>
                <option value="أستاذ مبرز">أستاذ مبرز</option>
              </select>
            </div>

            {/* Matière */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Matière</label>
              <input
                type="text"
                value={matiere}
                onChange={e => setMatiere(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
              />
            </div>

            {/* Cycle */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Cycle</label>
              <select
                value={cycle}
                onChange={e => setCycle(e.target.value as any)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
              >
                <option value="اعدادي">اعدادي (Collégial)</option>
                <option value="تأهيلي">تأهيلي (Qualifiant)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={promotionEchelon}
                onChange={e => setPromotionEchelon(e.target.checked)}
                className="rounded text-emerald-600"
              />
              Promotion en échelon
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={promotionGrade}
                onChange={e => setPromotionGrade(e.target.checked)}
                className="rounded text-emerald-600"
              />
              Promotion en grade
            </label>
          </div>

          {/* Inspection initiale */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Dernière Inspection (Optionnel)
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Note (/20 ou "vis")
                </label>
                <input
                  type="text"
                  value={derniereNote}
                  onChange={e => setDerniereNote(e.target.value)}
                  placeholder="Ex: 16.5 ou vis"
                  className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Année de l'inspection
                </label>
                <input
                  type="number"
                  value={derniereAnnee}
                  onChange={e => setDerniereAnnee(e.target.value)}
                  placeholder="Ex: 2024"
                  className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Téléphone</label>
              <input
                type="text"
                value={telephone}
                onChange={e => setTelephone(e.target.value)}
                placeholder="Ex: 0661234567"
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Ex: nom@taalim.ma"
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          {/* Footer actions */}
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-sm"
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
