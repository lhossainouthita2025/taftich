import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  FileCheck, 
  Eye, 
  Calendar, 
  Clock, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  School,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Edit2,
  Award,
  Trash2
} from 'lucide-react';
import { Enseignant, Etablissement, Commune, Role } from '../../types';
import { ExcelService } from '../../services/excelService';
import { useI18n } from '../../i18n';

interface EnseignantsViewProps {
  enseignants: Enseignant[];
  etablissements: Etablissement[];
  communes: Commune[];
  userRole: Role;
  onOpenTeacherDetail: (enseignant: Enseignant) => void;
  onOpenNewInspectionForTeacher: (enseignant: Enseignant) => void;
  onOpenNewVisiteForTeacher: (enseignant: Enseignant) => void;
  onOpenEditTeacher: (enseignant: Enseignant) => void;
  onOpenNewTeacher: () => void;
  onOpenTimetable: (enseignant: Enseignant) => void;
  onDeleteTeacher: (id: string) => void;
}

export const EnseignantsView: React.FC<EnseignantsViewProps> = ({
  enseignants,
  etablissements,
  communes,
  userRole,
  onOpenTeacherDetail,
  onOpenNewInspectionForTeacher,
  onOpenNewVisiteForTeacher,
  onOpenEditTeacher,
  onOpenNewTeacher,
  onOpenTimetable,
  onDeleteTeacher
}) => {
  const { language, t } = useI18n();
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommune, setSelectedCommune] = useState<string>('all');
  const [selectedEtab, setSelectedEtab] = useState<string>('all');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedStatut, setSelectedStatut] = useState<string>('all'); // all, actif, inactif
  const [selectedNoteInterval, setSelectedNoteInterval] = useState<string>('all'); // all, lt10, 10-12, 12-14, 14-16, gt16, vis
  const [selectedAnneeFilter, setSelectedAnneeFilter] = useState<string>('all'); // all, never, before2022, 2022-2024, 2025, 2026

  // Sorting
  const [sortField, setSortField] = useState<keyof Enseignant | 'score'>('nom');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Filter logic
  const filteredEnseignants = useMemo(() => {
    return enseignants.filter(ens => {
      // Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = ens.nom.toLowerCase().includes(query) || (ens.nomFr && ens.nomFr.toLowerCase().includes(query));
        const matchDoti = ens.doti.toLowerCase().includes(query);
        const matchEtab = ens.etablissementNom.toLowerCase().includes(query);
        const matchCommune = ens.commune.toLowerCase().includes(query);
        const matchMatiere = ens.matiere.toLowerCase().includes(query);
        if (!matchName && !matchDoti && !matchEtab && !matchCommune && !matchMatiere) {
          return false;
        }
      }

      // Commune
      if (selectedCommune !== 'all' && ens.commune !== selectedCommune) {
        return false;
      }

      // Etablissement
      if (selectedEtab !== 'all' && ens.etablissementId !== selectedEtab && ens.etablissementNom !== selectedEtab) {
        return false;
      }

      // Cycle
      if (selectedCycle !== 'all' && ens.cycle !== selectedCycle) {
        return false;
      }

      // Statut
      if (selectedStatut === 'actif' && !ens.actif) return false;
      if (selectedStatut === 'inactif' && ens.actif) return false;

      // Note Interval
      if (selectedNoteInterval !== 'all') {
        const note = ens.derniereNote;
        if (selectedNoteInterval === 'vis') {
          if (note !== 'vis' && note !== undefined) return false;
        } else if (typeof note === 'number') {
          if (selectedNoteInterval === 'lt10' && !(note < 10)) return false;
          if (selectedNoteInterval === '10-12' && !(note >= 10 && note < 12)) return false;
          if (selectedNoteInterval === '12-14' && !(note >= 12 && note < 14)) return false;
          if (selectedNoteInterval === '14-16' && !(note >= 14 && note < 16)) return false;
          if (selectedNoteInterval === 'gt16' && !(note >= 16)) return false;
        } else {
          return false;
        }
      }

      // Année d'inspection
      if (selectedAnneeFilter !== 'all') {
        const annee = ens.derniereAnneeInspection;
        if (selectedAnneeFilter === 'never') {
          if (annee || ens.derniereNote !== 'vis') return false;
        } else if (selectedAnneeFilter === 'before2022') {
          if (!annee || annee >= 2022) return false;
        } else if (selectedAnneeFilter === '2022-2024') {
          if (!annee || annee < 2022 || annee > 2024) return false;
        } else if (selectedAnneeFilter === '2025') {
          if (annee !== 2025) return false;
        } else if (selectedAnneeFilter === '2026') {
          if (annee !== 2026) return false;
        }
      }

      return true;
    });
  }, [
    enseignants, 
    searchTerm, 
    selectedCommune, 
    selectedEtab, 
    selectedCycle, 
    selectedStatut, 
    selectedNoteInterval, 
    selectedAnneeFilter
  ]);

  // Sort logic
  const sortedEnseignants = useMemo(() => {
    return [...filteredEnseignants].sort((a, b) => {
      let valA: any = a[sortField as keyof Enseignant];
      let valB: any = b[sortField as keyof Enseignant];

      if (sortField === 'score') {
        valA = typeof a.derniereNote === 'number' ? a.derniereNote : -1;
        valB = typeof b.derniereNote === 'number' ? b.derniereNote : -1;
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredEnseignants, sortField, sortAsc]);

  // Pagination slice
  const totalPages = Math.ceil(sortedEnseignants.length / pageSize) || 1;
  const paginatedList = sortedEnseignants.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof Enseignant | 'score') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportExcel = () => {
    ExcelService.exportEnseignantsToExcel(filteredEnseignants, `enseignants_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCommune('all');
    setSelectedEtab('all');
    setSelectedCycle('all');
    setSelectedStatut('all');
    setSelectedNoteInterval('all');
    setSelectedAnneeFilter('all');
    setCurrentPage(1);
  };

  return (
    <div id="enseignants-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Fast Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            {t('teachersTitle')}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {filteredEnseignants.length} / {enseignants.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {t('teachersSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            title="Exporter les enseignants filtrés vers Excel"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            {t('exportExcel')} ({filteredEnseignants.length})
          </button>

          {userRole === 'admin' && (
            <button
              onClick={onOpenNewTeacher}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('addTeacher')}
            </button>
          )}
        </div>
      </div>

      {/* Filter Matrix Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs md:text-sm text-slate-900 focus:outline-emerald-600 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              {language === 'ar' ? 'مسح' : language === 'en' ? 'Clear' : 'Effacer'}
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {/* Commune */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Commune</label>
            <select
              value={selectedCommune}
              onChange={(e) => { setSelectedCommune(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-emerald-600"
            >
              <option value="all">Toutes ({communes.length})</option>
              {communes.map(c => (
                <option key={c.id} value={c.nomAr}>{c.nomAr} ({c.nomFr})</option>
              ))}
            </select>
          </div>

          {/* Établissement */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Établissement</label>
            <select
              value={selectedEtab}
              onChange={(e) => { setSelectedEtab(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-emerald-600 truncate"
            >
              <option value="all">Tous les établissements</option>
              {etablissements
                .filter(e => selectedCommune === 'all' || e.commune === selectedCommune)
                .map(e => (
                  <option key={e.id} value={e.nomAr}>{e.nomAr}</option>
                ))}
            </select>
          </div>

          {/* Cycle */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Cycle d'enseignement</label>
            <select
              value={selectedCycle}
              onChange={(e) => { setSelectedCycle(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-emerald-600"
            >
              <option value="all">Tous les cycles</option>
              <option value="اعدادي">Secondaire Collégial (اعدادي)</option>
              <option value="تأهيلي">Secondaire Qualifiant (تأهيلي)</option>
            </select>
          </div>

          {/* Note d'inspection */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Note d'inspection</label>
            <select
              value={selectedNoteInterval}
              onChange={(e) => { setSelectedNoteInterval(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-emerald-600"
            >
              <option value="all">Toutes les notes</option>
              <option value="gt16">&gt; 16 / 20 (Très Bien)</option>
              <option value="14-16">14 - 16 / 20</option>
              <option value="12-14">12 - 14 / 20</option>
              <option value="10-12">10 - 12 / 20</option>
              <option value="lt10">&lt; 10 / 20 (Insuffisant)</option>
              <option value="vis">Visite sans note / Non noté</option>
            </select>
          </div>

          {/* Année d'inspection */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Dernière inspection</label>
            <select
              value={selectedAnneeFilter}
              onChange={(e) => { setSelectedAnneeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-emerald-600"
            >
              <option value="all">Toutes les années</option>
              <option value="2026">2026 (Cette année)</option>
              <option value="2025">2025</option>
              <option value="2022-2024">2022 - 2024</option>
              <option value="before2022">Avant 2022 (&gt; 4 ans)</option>
              <option value="never">Jamais inspecté / Visite</option>
            </select>
          </div>

          {/* Statut & Reset */}
          <div className="flex items-end gap-1.5">
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Statut</label>
              <select
                value={selectedStatut}
                onChange={(e) => { setSelectedStatut(e.target.value); setCurrentPage(1); }}
                className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-emerald-600"
              >
                <option value="all">Tous</option>
                <option value="actif">Actif (VRAI)</option>
                <option value="inactif">Inactif (FAUX)</option>
              </select>
            </div>
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] text-slate-600 font-medium shrink-0"
              title="Réinitialiser tous les filtres"
            >
              Effacer
            </button>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('doti')}>
                  <div className="flex items-center gap-1">
                    Doti
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('nom')}>
                  <div className="flex items-center gap-1">
                    Enseignant
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('etablissementNom')}>
                  <div className="flex items-center gap-1">
                    Établissement & Commune
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Cadre & Cycle</th>
                <th className="py-3 px-4">Promotion</th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('score')}>
                  <div className="flex items-center gap-1">
                    Dernière Note
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('derniereAnneeInspection')}>
                  <div className="flex items-center gap-1">
                    Année
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions Rapides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Aucun enseignant ne correspond aux critères de recherche actuels.
                  </td>
                </tr>
              ) : (
                paginatedList.map(ens => {
                  const hasNote = typeof ens.derniereNote === 'number';
                  const isVisiteOnly = ens.derniereNote === 'vis';
                  const currentYear = new Date().getFullYear();
                  const isOldInspection = ens.derniereAnneeInspection && (currentYear - ens.derniereAnneeInspection >= 3);
                  const isNever = !ens.derniereAnneeInspection || isVisiteOnly;

                  return (
                    <tr 
                      key={ens.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => onOpenTeacherDetail(ens)}
                    >
                      {/* DOTI */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                        {ens.doti}
                      </td>

                      {/* Nom */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{ens.nom}</span>
                          {ens.nomFr && <span className="text-[11px] text-slate-400">{ens.nomFr}</span>}
                          <span className="text-[10px] text-emerald-700 font-medium">{ens.matiere}</span>
                        </div>
                      </td>

                      {/* Etablissement & Commune */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col max-w-xs">
                          <span className="font-medium text-slate-800 truncate" title={ens.etablissementNom}>
                            {ens.etablissementNom}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            {ens.commune}
                          </span>
                        </div>
                      </td>

                      {/* Cadre & Cycle */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-700 truncate max-w-[180px]" title={ens.grade}>
                            {ens.grade}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            Cycle {ens.cycle}
                          </span>
                        </div>
                      </td>

                      {/* Promotion */}
                      <td className="py-3 px-4">
                        {(ens.promotionEchelon || ens.promotionGrade) ? (
                          <div className="flex flex-wrap gap-1">
                            {ens.promotionEchelon && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[9px] font-semibold">
                                Échelon
                              </span>
                            )}
                            {ens.promotionGrade && (
                              <span className="px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 text-[9px] font-semibold">
                                Grade
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">-</span>
                        )}
                      </td>

                      {/* Note */}
                      <td className="py-3 px-4">
                        {hasNote ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                            (ens.derniereNote as number) >= 16 ? 'bg-emerald-100 text-emerald-800' :
                            (ens.derniereNote as number) >= 14 ? 'bg-teal-100 text-teal-800' :
                            (ens.derniereNote as number) >= 12 ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            <Award className="w-3 h-3" />
                            {ens.derniereNote} / 20
                          </span>
                        ) : isVisiteOnly ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                            Visite (Sans note)
                          </span>
                        ) : ens.derniereAnneeInspection ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                            Aucune note
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            Non inspecté
                          </span>
                        )}
                      </td>

                      {/* Année */}
                      <td className="py-3 px-4">
                        {ens.derniereAnneeInspection ? (
                          <span className={`text-xs font-mono font-semibold ${
                            isOldInspection ? 'text-rose-600 font-bold' : 'text-slate-700'
                          }`}>
                            {ens.derniereAnneeInspection}
                            {isOldInspection && (
                              <span className="ml-1 text-[10px] text-rose-500 font-sans block">
                                (&gt; 3 ans)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-rose-500 text-[11px] font-semibold flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            À planifier
                          </span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-4 text-center">
                        {ens.actif ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            <XCircle className="w-3 h-3" />
                            Inactif
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {userRole !== 'consultation' && (
                            <>
                              <button
                                onClick={() => onOpenNewInspectionForTeacher(ens)}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Enregistrer une inspection"
                              >
                                <FileCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onOpenNewVisiteForTeacher(ens)}
                                className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                                title="Enregistrer une visite"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onOpenTimetable(ens)}
                                className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                                title="Consulter/Modifier l'emploi du temps"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {userRole !== 'consultation' && (
                            <button
                              onClick={() => onOpenEditTeacher(ens)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              title="Modifier les données de l'enseignant"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {userRole === 'admin' && (
                            <button
                              onClick={() => onDeleteTeacher(ens.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Supprimer cet enseignant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <div>
            Affichage de <strong>{Math.min(sortedEnseignants.length, (currentPage - 1) * pageSize + 1)}</strong> à{' '}
            <strong>{Math.min(sortedEnseignants.length, currentPage * pageSize)}</strong> sur <strong>{sortedEnseignants.length}</strong> enseignants filtrés
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
