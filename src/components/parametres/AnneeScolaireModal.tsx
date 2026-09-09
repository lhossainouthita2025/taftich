import React, { useState } from 'react';
import { X, Calendar, Check, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { AnneeScolaire } from '../../types';

interface AnneeScolaireModalProps {
  initialData?: AnneeScolaire | null;
  existingYears: AnneeScolaire[];
  onSave: (annee: AnneeScolaire) => void;
  onClose: () => void;
}

export const AnneeScolaireModal: React.FC<AnneeScolaireModalProps> = ({
  initialData,
  existingYears,
  onSave,
  onClose
}) => {
  // If new, propose next logical school year or 2026/2027
  const defaultStartYear = initialData 
    ? parseInt(initialData.dateDebut.substring(0, 4), 10) 
    : 2026;

  const [startYear, setStartYear] = useState<number>(defaultStartYear);
  const [libelle, setLibelle] = useState(initialData?.libelle || `${defaultStartYear}/${defaultStartYear + 1}`);
  const [dateDebut, setDateDebut] = useState(initialData?.dateDebut || `${defaultStartYear}-09-01`);
  const [dateFin, setDateFin] = useState(initialData?.dateFin || `${defaultStartYear + 1}-07-31`);
  const [statut, setStatut] = useState<'en_cours' | 'cloturee' | 'a_venir'>(
    initialData?.statut || (startYear === 2026 ? 'en_cours' : 'a_venir')
  );
  const [estActive, setEstActive] = useState<boolean>(initialData?.estActive ?? (startYear === 2026));
  const [description, setDescription] = useState(initialData?.description || '');
  const [error, setError] = useState('');

  const handleStartYearChange = (newYear: number) => {
    setStartYear(newYear);
    const nextYear = newYear + 1;
    setLibelle(`${newYear}/${nextYear}`);
    setDateDebut(`${newYear}-09-01`);
    setDateFin(`${nextYear}-07-31`);
    if (newYear === 2026) {
      setStatut('en_cours');
      setEstActive(true);
    } else if (newYear < 2026) {
      setStatut('cloturee');
      setEstActive(false);
    } else {
      setStatut('a_venir');
      setEstActive(false);
    }
  };

  const handleApplyOfficialDates = () => {
    setDateDebut(`${startYear}-09-01`);
    setDateFin(`${startYear + 1}-07-31`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!libelle.trim()) {
      setError('Le libellé de l’année scolaire est requis (ex: 2026/2027).');
      return;
    }

    if (!dateDebut || !dateFin) {
      setError('Les dates de début et de fin sont obligatoires.');
      return;
    }

    if (dateDebut >= dateFin) {
      setError('La date de début doit être antérieure à la date de fin.');
      return;
    }

    // Check duplicate ID / Libellé if creating a new year
    const generatedId = `${dateDebut.substring(0, 4)}-${dateFin.substring(0, 4)}`;
    const idToUse = initialData?.id || generatedId;

    const isDuplicate = existingYears.some(
      y => y.id !== initialData?.id && (y.id === idToUse || y.libelle.trim().toLowerCase() === libelle.trim().toLowerCase())
    );

    if (isDuplicate) {
      setError(`Une année scolaire avec le libellé "${libelle}" existe déjà.`);
      return;
    }

    const savedYear: AnneeScolaire = {
      id: idToUse,
      libelle: libelle.trim(),
      dateDebut,
      dateFin,
      statut,
      estActive,
      description: description.trim() || `Année scolaire du 1er septembre au 31 juillet (${libelle.trim()})`
    };

    onSave(savedYear);
    onClose();
  };

  const isOfficialRange = dateDebut.endsWith('-09-01') && dateFin.endsWith('-07-31');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {initialData ? "Modifier l'Année Scolaire" : "Ajouter une Année Scolaire"}
              </h3>
              <p className="text-xs text-slate-400">
                Période réglementaire officielle : du 1er septembre au 31 juillet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* MENPS Regulatory Notice */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <span className="font-bold block">Cadre Réglementaire MENPS :</span>
              L’année scolaire s’étend officiellement du <strong>1er septembre</strong> au <strong>31 juillet</strong> de l’année civile suivante (ex: 2026/2027 du 01/09/2026 au 31/07/2027).
            </div>
          </div>

          {/* Quick Selection by Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Année de rentrée scolaire (septembre)</span>
              <span className="text-[11px] font-normal text-slate-500">Génération automatique</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2024, 2025, 2026, 2027].map(year => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleStartYearChange(year)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                    startYear === year
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {year}/{year + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Libellé */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Libellé de l'année scolaire <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex: 2026/2027"
              value={libelle}
              onChange={e => setLibelle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Date de début</span>
                <span className="text-[11px] text-emerald-600 font-semibold">(1er sept.)</span>
              </label>
              <input
                type="date"
                required
                value={dateDebut}
                onChange={e => setDateDebut(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Date de fin</span>
                <span className="text-[11px] text-emerald-600 font-semibold">(31 juil.)</span>
              </label>
              <input
                type="date"
                required
                value={dateFin}
                onChange={e => setDateFin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {!isOfficialRange && (
            <div className="flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <span className="text-[11px]">Attention: les dates s'écartent du 01/09 - 31/07 réglementaire.</span>
              <button
                type="button"
                onClick={handleApplyOfficialDates}
                className="px-2 py-1 bg-amber-200 hover:bg-amber-300 rounded text-[11px] font-bold text-amber-900 transition-colors shrink-0"
              >
                Rétablir 01/09 - 31/07
              </button>
            </div>
          )}

          {/* Status & Active Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Statut administratif</label>
              <select
                value={statut}
                onChange={e => setStatut(e.target.value as 'en_cours' | 'cloturee' | 'a_venir')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="en_cours">En cours (Active)</option>
                <option value="cloturee">Clôturée (Archivée)</option>
                <option value="a_venir">À venir (Prévisionnelle)</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={estActive}
                  onChange={e => {
                    setEstActive(e.target.checked);
                    if (e.target.checked) setStatut('en_cours');
                  }}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800">
                  Définir comme année active
                </span>
              </label>
            </div>
          </div>

          {/* Description / Remarques */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Description / Notes d'orientation
            </label>
            <input
              type="text"
              placeholder="ex: Année de déploiement des collèges pionniers et nouveau programme"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? "Mettre à jour" : "Enregistrer l'Année Scolaire"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
