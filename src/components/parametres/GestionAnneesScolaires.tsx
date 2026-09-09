import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Star, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Archive, 
  AlertCircle,
  FileCheck,
  Eye,
  UsersRound,
  GraduationCap,
  ShieldCheck,
  Info
} from 'lucide-react';
import { AnneeScolaire, Activity, Role } from '../../types';
import { StorageService } from '../../services/storage';

interface GestionAnneesScolairesProps {
  anneesScolaires: AnneeScolaire[];
  activities: Activity[];
  userRole: Role;
  onOpenAddModal: () => void;
  onOpenEditModal: (annee: AnneeScolaire) => void;
  onSetActive: (id: string) => void;
  onDelete: (id: string) => void;
}

export const GestionAnneesScolaires: React.FC<GestionAnneesScolairesProps> = ({
  anneesScolaires,
  activities,
  userRole,
  onOpenAddModal,
  onOpenEditModal,
  onSetActive,
  onDelete
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getStatsForYear = (annee: AnneeScolaire) => {
    const yearActs = activities.filter(a => StorageService.isDateInAnneeScolaire(a.date, annee));
    const inspections = yearActs.filter(a => a.type === 'inspection').length;
    const visites = yearActs.filter(a => a.type === 'visite').length;
    const rencontres = yearActs.filter(a => a.type === 'rencontre').length;
    const formations = yearActs.filter(a => a.type === 'formation').length;
    return {
      total: yearActs.length,
      inspections,
      visites,
      rencontres,
      formations
    };
  };

  const formatDateFr = (isoDate: string) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-4">
      {/* Header card with action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold">
              Gestion des Années Scolaires (المواسم الدراسية)
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Découpage officiel réglementaire : du <strong>1er septembre</strong> au <strong>31 juillet</strong>. 
            L'année active détermine les bilans, inspections prioritaires et statistiques annuelles.
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            id="btn-add-school-year"
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Année Scolaire</span>
          </button>
        )}
      </div>

      {/* Role notice if not admin */}
      {userRole !== 'admin' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-blue-600" />
          <span>
            Mode {userRole} : Seul l'administrateur peut créer, modifier ou archiver des années scolaires.
          </span>
        </div>
      )}

      {/* Grid of School Years */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {anneesScolaires.map(annee => {
          const stats = getStatsForYear(annee);
          const isDeletingThis = deleteConfirmId === annee.id;

          return (
            <div
              key={annee.id}
              className={`rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                annee.estActive
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Header inside Card */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900 tracking-tight">
                      {annee.libelle}
                    </span>
                    {annee.estActive && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
                        <Star className="w-3 h-3 fill-current" />
                        Année Active
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>
                    {annee.statut === 'en_cours' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        <Clock className="w-3 h-3" />
                        En cours
                      </span>
                    )}
                    {annee.statut === 'cloturee' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
                        <Archive className="w-3 h-3" />
                        Clôturée
                      </span>
                    )}
                    {annee.statut === 'a_venir' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-100 text-sky-700">
                        <Calendar className="w-3 h-3" />
                        À venir
                      </span>
                    )}
                  </div>
                </div>

                {/* Period Dates (du 1er septembre au 31 juillet) */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    du <strong className="text-slate-900">{formatDateFr(annee.dateDebut)}</strong> au <strong className="text-slate-900">{formatDateFr(annee.dateFin)}</strong>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                    (1er sept. — 31 juil.)
                  </span>
                </div>

                {annee.description && (
                  <p className="text-xs text-slate-500 mb-3.5 line-clamp-2">
                    {annee.description}
                  </p>
                )}

                {/* Mini Stats Bar for this school year */}
                <div className="grid grid-cols-4 gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Total</span>
                    <span className="text-xs font-bold text-slate-800">{stats.total}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 block font-medium">Inspect.</span>
                    <span className="text-xs font-bold text-emerald-700">{stats.inspections}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-teal-600 block font-medium">Visites</span>
                    <span className="text-xs font-bold text-teal-700">{stats.visites}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-600 block font-medium">Form./Renc.</span>
                    <span className="text-xs font-bold text-purple-700">{stats.rencontres + stats.formations}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  {!annee.estActive && userRole === 'admin' ? (
                    <button
                      onClick={() => onSetActive(annee.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Activer cette année scolaire comme référence"
                    >
                      <Star className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Définir comme active</span>
                    </button>
                  ) : annee.estActive ? (
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Référence active
                    </span>
                  ) : null}
                </div>

                {userRole === 'admin' && (
                  <div className="flex items-center gap-1.5">
                    {isDeletingThis ? (
                      <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                        <span className="text-[10px] text-rose-700 font-bold px-1">Confirmer ?</span>
                        <button
                          onClick={() => {
                            onDelete(annee.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"
                        >
                          Oui
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold cursor-pointer"
                        >
                          Non
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => onOpenEditModal(annee)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Modifier les détails de cette année"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!annee.estActive && anneesScolaires.length > 1 && (
                          <button
                            onClick={() => setDeleteConfirmId(annee.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                            title="Supprimer cette année scolaire"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
