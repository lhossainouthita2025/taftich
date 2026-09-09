import React, { useState } from 'react';
import { X, Calendar, Plus, Trash2, Save, Clock } from 'lucide-react';
import { Enseignant, TimetableSlot } from '../../types';

interface EmploiDuTempsModalProps {
  enseignant: Enseignant;
  onSave: (enseignant: Enseignant) => void;
  onClose: () => void;
}

const DEFAULT_SLOTS = [
  '08:30 - 10:30',
  '10:30 - 12:30',
  '14:30 - 16:30',
  '16:30 - 18:30'
];

export const EmploiDuTempsModal: React.FC<EmploiDuTempsModalProps> = ({
  enseignant,
  onSave,
  onClose
}) => {
  const [slots, setSlots] = useState<TimetableSlot[]>(enseignant.emploiDuTemps || []);

  const daysOfWeek: ('Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi')[] = [
    'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ];

  const [newJour, setNewJour] = useState<'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi'>('Lundi');
  const [newHeureDebut, setNewHeureDebut] = useState('08:30');
  const [newHeureFin, setNewHeureFin] = useState('10:30');
  const [newClasse, setNewClasse] = useState('2ème ASC 1');
  const [newSalle, setNewSalle] = useState('Salle Info 1');

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClasse.trim()) return;

    const newSlot: TimetableSlot = {
      jour: newJour,
      heureDebut: newHeureDebut,
      heureFin: newHeureFin,
      classe: newClasse.trim(),
      salle: newSalle.trim() || 'Salle Info',
      matiere: enseignant.matiere
    };

    setSlots([...slots, newSlot]);
    setNewClasse('');
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    const updated = {
      ...enseignant,
      emploiDuTemps: slots
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Emploi du Temps : {enseignant.nom}
              </h3>
              <p className="text-xs text-slate-300">
                {enseignant.etablissementNom} • DOTI: {enseignant.doti}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form to add slot */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleAddSlot} className="flex flex-wrap items-end gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Jour</label>
              <select
                value={newJour}
                onChange={e => setNewJour(e.target.value as any)}
                className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                {daysOfWeek.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Début</label>
              <input
                type="time"
                value={newHeureDebut}
                onChange={e => setNewHeureDebut(e.target.value)}
                className="py-1.5 px-2 text-xs rounded-lg border border-slate-200 bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Fin</label>
              <input
                type="time"
                value={newHeureFin}
                onChange={e => setNewHeureFin(e.target.value)}
                className="py-1.5 px-2 text-xs rounded-lg border border-slate-200 bg-white font-mono"
              />
            </div>

            <div className="flex-1 min-w-[120px]">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Classe / Groupe</label>
              <input
                type="text"
                value={newClasse}
                onChange={e => setNewClasse(e.target.value)}
                placeholder="Ex: 3ème ASC 2 ou 1ère Bac Sc"
                className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Salle</label>
              <input
                type="text"
                value={newSalle}
                onChange={e => setNewSalle(e.target.value)}
                placeholder="Salle Info 1"
                className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <button
              type="submit"
              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter Créneau
            </button>
          </form>
        </div>

        {/* Timetable visual display */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {daysOfWeek.map(jour => {
              const daySlots = slots.filter(s => s.jour === jour);
              return (
                <div key={jour} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-xs text-slate-900">{jour}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {daySlots.length} séance(s)
                    </span>
                  </div>

                  {daySlots.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic py-3 text-center">Aucun cours</p>
                  ) : (
                    <div className="space-y-2">
                      {daySlots.map((slot, sIdx) => {
                        const globalIndex = slots.findIndex(s => s === slot);
                        return (
                          <div key={sIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs relative group">
                            <div className="flex items-center justify-between text-emerald-800 font-bold font-mono">
                              <span>{slot.heureDebut} - {slot.heureFin}</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 rounded text-emerald-900">
                                {slot.salle}
                              </span>
                            </div>
                            <div className="font-semibold text-slate-900 mt-1">{slot.classe}</div>
                            <div className="text-[10px] text-slate-500">{slot.matiere}</div>

                            <button
                              onClick={() => handleRemoveSlot(globalIndex)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md text-rose-500 hover:bg-rose-50 transition-all"
                              title="Supprimer ce créneau"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Total : <strong>{slots.length} séances</strong> enregistrées
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Valider l'emploi du temps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
