import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileCheck, 
  Eye, 
  UsersRound, 
  GraduationCap, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Printer, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Award,
  Clock,
  Trash2,
  Edit2
} from 'lucide-react';
import { Activity, Enseignant, Etablissement, Commune, Role, AnneeScolaire, ActivityType } from '../../types';
import { ExcelService } from '../../services/excelService';
import { StorageService } from '../../services/storage';
import { useI18n } from '../../i18n';

interface ActivitesViewProps {
  activities: Activity[];
  enseignants: Enseignant[];
  etablissements: Etablissement[];
  communes: Commune[];
  anneesScolaires?: AnneeScolaire[];
  activeAnneeScolaireId?: string;
  userRole: Role;
  onOpenActivityDetail: (activity: Activity) => void;
  onOpenNewActivity: (type: ActivityType) => void;
  onOpenEditActivity?: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
}

export const ActivitesView: React.FC<ActivitesViewProps> = ({
  activities,
  enseignants,
  etablissements,
  communes,
  anneesScolaires = [],
  activeAnneeScolaireId,
  userRole,
  onOpenActivityDetail,
  onOpenNewActivity,
  onOpenEditActivity,
  onDeleteActivity
}) => {
  const { t } = useI18n();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommune, setSelectedCommune] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(activeAnneeScolaireId || 'all');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    if (activeAnneeScolaireId) {
      setSelectedYear(activeAnneeScolaireId);
      setCurrentPage(1);
    }
  }, [activeAnneeScolaireId]);

  // Filter logic
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      if (selectedType !== 'all' && act.type !== selectedType) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchObj = act.objet.toLowerCase().includes(q);
        const matchEtab = act.etablissementNom.toLowerCase().includes(q);
        const matchResp = act.responsableNom.toLowerCase().includes(q);
        const matchDesc = act.description?.toLowerCase().includes(q);
        const matchCommune = act.commune.toLowerCase().includes(q);
        if (!matchObj && !matchEtab && !matchResp && !matchDesc && !matchCommune) return false;
      }

      if (selectedCommune !== 'all' && act.commune !== selectedCommune) return false;

      if (selectedYear !== 'all') {
        const selectedAnnee = anneesScolaires.find(annee => annee.id === selectedYear);
        if (selectedAnnee && !StorageService.isDateInAnneeScolaire(act.date, selectedAnnee)) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activities, anneesScolaires, selectedType, searchTerm, selectedCommune, selectedYear]);

  const totalPages = Math.ceil(filteredActivities.length / pageSize) || 1;
  const paginatedActivities = filteredActivities.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportExcel = () => {
    ExcelService.exportActivitiesToExcel(filteredActivities, `activites_pedagogiques_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div id="activites-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            {t('activitiesTitle')}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {filteredActivities.length} / {activities.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {t('activitiesSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            {t('exportExcel')}
          </button>

          {userRole !== 'consultation' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenNewActivity('inspection')}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('newInspection')}
              </button>
              <button
                onClick={() => onOpenNewActivity('visite')}
                className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('newVisit')}
              </button>
              <button
                onClick={() => onOpenNewActivity('formation')}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('newTraining')}
              </button>
              <button
                onClick={() => onOpenNewActivity('reunion')}
                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('newMeeting')}
              </button>
              <button
                onClick={() => onOpenNewActivity('validation_fiches')}
                className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('fichesAndTimetables')}
              </button>
              <button
                onClick={() => onOpenNewActivity('suivi_examens')}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('examTracking')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Type Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => { setSelectedType('all'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('activities')} ({activities.length})
        </button>

        <button
          onClick={() => { setSelectedType('inspection'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            selectedType === 'inspection'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          {t('inspections')} ({activities.filter(a => a.type === 'inspection').length})
        </button>

        <button
          onClick={() => { setSelectedType('visite'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            selectedType === 'visite'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-teal-800 border border-teal-200 hover:bg-teal-50'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          {t('visits')} ({activities.filter(a => a.type === 'visite').length})
        </button>

        <button
          onClick={() => { setSelectedType('rencontre'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            selectedType === 'rencontre'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          <UsersRound className="w-3.5 h-3.5" />
          {t('meetings')} ({activities.filter(a => a.type === 'rencontre').length})
        </button>

        <button
          onClick={() => { setSelectedType('formation'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            selectedType === 'formation'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-purple-800 border border-purple-200 hover:bg-purple-50'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          {t('trainings')} ({activities.filter(a => a.type === 'formation').length})
        </button>

        <button
          onClick={() => { setSelectedType('reunion'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'reunion'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          {t('reunion')} ({activities.filter(a => a.type === 'reunion').length})
        </button>

        <button
          onClick={() => { setSelectedType('validation_fiches'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'validation_fiches'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-sky-800 border border-sky-200 hover:bg-sky-50'
          }`}
        >
          {t('fichesAndTimetables')} ({activities.filter(a => a.type === 'validation_fiches').length})
        </button>

        <button
          onClick={() => { setSelectedType('suivi_examens'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'suivi_examens'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          {t('examTracking')} ({activities.filter(a => a.type === 'suivi_examens').length})
        </button>

        <button
          onClick={() => { setSelectedType('visite_pionniere'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'visite_pionniere'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          {t('pioneerVisits')} ({activities.filter(a => a.type === 'visite_pionniere').length})
        </button>

        <button
          onClick={() => { setSelectedType('visite_non_pionniere'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'visite_non_pionniere'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          {t('nonPioneerVisits')} ({activities.filter(a => a.type === 'visite_non_pionniere').length})
        </button>

        <button
          onClick={() => { setSelectedType('rencontre_administrative'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'rencontre_administrative'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-orange-800 border border-orange-200 hover:bg-orange-50'
          }`}
        >
          {t('administrativeMeetings')} ({activities.filter(a => a.type === 'rencontre_administrative').length})
        </button>

        <button
          onClick={() => { setSelectedType('cours_experimentation'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'cours_experimentation'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'bg-white text-violet-800 border border-violet-200 hover:bg-violet-50'
          }`}
        >
          {t('experimentalLessons')} ({activities.filter(a => a.type === 'cours_experimentation').length})
        </button>

        <button
          onClick={() => { setSelectedType('remise_missions'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'remise_missions'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-sky-800 border border-sky-200 hover:bg-sky-50'
          }`}
        >
          {t('missionHandovers')} ({activities.filter(a => a.type === 'remise_missions').length})
        </button>

        <button
          onClick={() => { setSelectedType('recherche_pedagogique'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'recherche_pedagogique'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-indigo-800 border border-indigo-200 hover:bg-indigo-50'
          }`}
        >
          {t('pedagogicalResearch')} ({activities.filter(a => a.type === 'recherche_pedagogique').length})
        </button>

        <button
          onClick={() => { setSelectedType('qualite_suivi'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'qualite_suivi'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('qualityMonitoring')} ({activities.filter(a => a.type === 'qualite_suivi').length})
        </button>

        <button
          onClick={() => { setSelectedType('comite_suivi'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'comite_suivi'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('followUpCommittees')} ({activities.filter(a => a.type === 'comite_suivi').length})
        </button>

        <button
          onClick={() => { setSelectedType('comite_soutien'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'comite_soutien'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('supportCommittees')} ({activities.filter(a => a.type === 'comite_soutien').length})
        </button>

        <button
          onClick={() => { setSelectedType('reunion_nationale'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'reunion_nationale'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          {t('nationalMeetings')} ({activities.filter(a => a.type === 'reunion_nationale').length})
        </button>

        <button
          onClick={() => { setSelectedType('reunion_regionale'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'reunion_regionale'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          {t('regionalMeetings')} ({activities.filter(a => a.type === 'reunion_regionale').length})
        </button>

        <button
          onClick={() => { setSelectedType('reunion_provinciale'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'reunion_provinciale'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          {t('provincialMeetings')} ({activities.filter(a => a.type === 'reunion_provinciale').length})
        </button>

        <button
          onClick={() => { setSelectedType('reunion_coordination_regionale'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'reunion_coordination_regionale'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          {t('regionalCoordinationMeetings')} ({activities.filter(a => a.type === 'reunion_coordination_regionale').length})
        </button>

        <button
          onClick={() => { setSelectedType('reunion_coordination_gho'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'reunion_coordination_gho'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          {t('ghoCoordinationMeetings')} ({activities.filter(a => a.type === 'reunion_coordination_gho').length})
        </button>

        <button
          onClick={() => { setSelectedType('participation_programmes_nationaux'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'participation_programmes_nationaux'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'bg-white text-cyan-800 border border-cyan-200 hover:bg-cyan-50'
          }`}
        >
          {t('nationalPrograms')} ({activities.filter(a => a.type === 'participation_programmes_nationaux').length})
        </button>

        <button
          onClick={() => { setSelectedType('proposition_sujets'); setCurrentPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedType === 'proposition_sujets'
              ? 'bg-pink-600 text-white shadow-xs'
              : 'bg-white text-pink-800 border border-pink-200 hover:bg-pink-50'
          }`}
        >
          {t('topicProposals')} ({activities.filter(a => a.type === 'proposition_sujets').length})
        </button>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
          />
        </div>

        <div>
          <select
            value={selectedCommune}
            onChange={e => { setSelectedCommune(e.target.value); setCurrentPage(1); }}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
          >
            <option value="all">{t('allCommunes')}</option>
            {communes.map(c => (
              <option key={c.id} value={c.nomAr}>{c.nomAr} ({c.nomFr})</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedYear}
            onChange={e => { setSelectedYear(e.target.value); setCurrentPage(1); }}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
          >
            <option value="all">{t('allYears')}</option>
            {anneesScolaires.map(annee => (
              <option key={annee.id} value={annee.id}>{annee.libelle}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Activities */}
      {paginatedActivities.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          {t('noActivity')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedActivities.map(act => {
            const isInsp = act.type === 'inspection';
            const isVis = act.type === 'visite';
            const isForm = act.type === 'formation';
            const isReunion = act.type === 'reunion';
            const isValidation = act.type === 'validation_fiches';
            const isExam = act.type === 'suivi_examens';

            return (
              <div
                key={act.id}
                onClick={() => onOpenActivityDetail(act)}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isInsp ? 'bg-blue-100 text-blue-800' :
                      isVis ? 'bg-teal-100 text-teal-800' :
                      isForm ? 'bg-purple-100 text-purple-800' :
                      isReunion ? 'bg-amber-100 text-amber-800' :
                      isValidation ? 'bg-sky-100 text-sky-800' :
                      isExam ? 'bg-rose-100 text-rose-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {isInsp && <FileCheck className="w-3 h-3" />}
                      {isVis && <Eye className="w-3 h-3" />}
                      {isForm && <GraduationCap className="w-3 h-3" />}
                      {!isInsp && !isVis && !isForm && <UsersRound className="w-3 h-3" />}
                      {act.type}
                    </span>

                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {act.date}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {act.objet}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{act.etablissementNom} ({act.commune})</span>
                    </p>
                  </div>

                  {isInsp && (act as any).note !== undefined && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-800 font-semibold">Note attribuée :</span>
                      <span className="font-mono font-extrabold text-emerald-950 text-sm">
                        {(act as any).note} / 20
                      </span>
                    </div>
                  )}

                  {act.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[170px]">
                    Intervenant : <strong>{act.responsableNom}</strong>
                  </span>

                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenActivityDetail(act)}
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                    >
                      Détails / PV
                    </button>
                    {userRole !== 'consultation' && onOpenEditActivity && (
                      <button
                        onClick={() => onOpenEditActivity(act)}
                        className="p-1 rounded-md text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition-colors cursor-pointer"
                        title="Modifier cette activité"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {userRole === 'admin' && (
                      <button
                        onClick={() => onDeleteActivity(act.id)}
                        className="p-1 rounded-md text-rose-500 hover:bg-rose-50 cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div>
          Affichage de <strong>{Math.min(filteredActivities.length, (currentPage - 1) * pageSize + 1)}</strong> à{' '}
          <strong>{Math.min(filteredActivities.length, currentPage * pageSize)}</strong> sur <strong>{filteredActivities.length}</strong> activités
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-semibold">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
