import React, { useState } from 'react';
import { 
  Users, 
  School, 
  MapPin, 
  FileCheck, 
  Eye, 
  UsersRound, 
  GraduationCap, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Compass, 
  FileSpreadsheet, 
  ArrowRight,
  Sparkles,
  Award,
  Filter
} from 'lucide-react';
import { Enseignant, Etablissement, Activity, Commune, AnneeScolaire, ActivityType } from '../../types';
import { NavItemKey } from '../layout/Sidebar';
import { StorageService } from '../../services/storage';
import { useI18n } from '../../i18n';

interface DashboardViewProps {
  enseignants: Enseignant[];
  etablissements: Etablissement[];
  activities: Activity[];
  communes: Commune[];
  activeAnneeScolaire?: AnneeScolaire;
  onSelectTab: (tab: NavItemKey) => void;
  onOpenTeacherDetail: (enseignant: Enseignant) => void;
  onOpenSchoolDetail: (etablissement: Etablissement) => void;
  onOpenNewActivity: (type: ActivityType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  enseignants,
  etablissements,
  activities,
  communes,
  activeAnneeScolaire: propsActiveAnnee,
  onSelectTab,
  onOpenTeacherDetail,
  onOpenSchoolDetail,
  onOpenNewActivity
}) => {
  const { t } = useI18n();
  const activeAnnee = propsActiveAnnee || StorageService.getActiveAnneeScolaire();
  const currentYear = activeAnnee ? parseInt(activeAnnee.dateDebut.substring(0, 4), 10) : new Date().getFullYear();

  // Metrics
  const totalEnseignants = enseignants.length;
  const enseignantsActifs = enseignants.filter(e => e.actif).length;
  const enseignantsInactifs = totalEnseignants - enseignantsActifs;
  const totalEtablissements = etablissements.length;
  const totalCommunes = communes.length;

  const activitiesThisYear = activities.filter(a => 
    StorageService.isDateInAnneeScolaire(a.date, activeAnnee)
  ).length;
  const activitiesForActiveYear = activities.filter(a =>
    StorageService.isDateInAnneeScolaire(a.date, activeAnnee)
  );
  const inspectionsCount = activitiesForActiveYear.filter(a => a.type === 'inspection').length;
  const visitesCount = activitiesForActiveYear.filter(a => a.type === 'visite').length;
  const rencontresCount = activitiesForActiveYear.filter(a => a.type === 'rencontre').length;
  const formationsCount = activitiesForActiveYear.filter(a => a.type === 'formation').length;

  // Timetables & GPS coverage
  const emploisSaisis = enseignants.filter(e => e.emploiDuTemps && e.emploiDuTemps.length > 0).length;
  const emploisNonSaisis = totalEnseignants - emploisSaisis;
  const gpsSaisis = etablissements.filter(e => e.latitude && e.longitude).length;
  const gpsNonSaisis = totalEtablissements - gpsSaisis;

  // Never inspected or visit only
  const jamaisInspectes = enseignants.filter(e => !e.derniereAnneeInspection || e.derniereNote === 'vis');
  
  // Inspection > 3 years (e.g. < 2023)
  const inspectionsAnciennes = enseignants.filter(e => {
    if (!e.derniereAnneeInspection || e.derniereNote === 'vis') return false;
    return currentYear - e.derniereAnneeInspection >= 3;
  });

  const urgentTotal = jamaisInspectes.length + inspectionsAnciennes.length;

  // Breakdown by commune
  const enseignantsParCommune: Record<string, number> = {};
  enseignants.forEach(e => {
    enseignantsParCommune[e.commune] = (enseignantsParCommune[e.commune] || 0) + 1;
  });

  // Breakdown by cycle
  const collegialCount = enseignants.filter(e => e.cycle === 'اعدادي').length;
  const qualifiantCount = enseignants.filter(e => e.cycle === 'تأهيلي').length;

  // Grade distributions
  const notesDistrib = {
    moinsDe10: 0,
    entre10et12: 0,
    entre12et14: 0,
    entre14et16: 0,
    plusDe16: 0,
    visiteSansNote: 0
  };

  enseignants.forEach(e => {
    if (e.derniereNote === 'vis' || e.derniereNote === undefined) {
      notesDistrib.visiteSansNote++;
    } else if (typeof e.derniereNote === 'number') {
      if (e.derniereNote < 10) notesDistrib.moinsDe10++;
      else if (e.derniereNote < 12) notesDistrib.entre10et12++;
      else if (e.derniereNote < 14) notesDistrib.entre12et14++;
      else if (e.derniereNote < 16) notesDistrib.entre14et16++;
      else notesDistrib.plusDe16++;
    }
  });

  // Recent 5 activities
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Top 5 establishments needing attention (most teachers with ancient / no inspection)
  const schoolNeedMap = new Map<string, { etab: Etablissement; count: number; totalEns: number }>();
  etablissements.forEach(e => {
    const ensInSchool = enseignants.filter(t => t.etablissementId === e.id);
    const needCount = ensInSchool.filter(t => !t.derniereAnneeInspection || t.derniereNote === 'vis' || (currentYear - t.derniereAnneeInspection >= 3)).length;
    schoolNeedMap.set(e.id, { etab: e, count: needCount, totalEns: ensInSchool.length });
  });
  const schoolsNeedingFollowup = Array.from(schoolNeedMap.values())
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div id="dashboard-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Welcome Banner with Fast Actions */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {t('portalTitle')}
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              {t('portalDescription')} ({totalEnseignants} {t('teachersCount')}, {totalEtablissements} {t('schoolsCount')}).
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => onSelectTab('planification')}
              className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs md:text-sm flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20"
            >
              <Clock className="w-4 h-4" />
              {urgentTotal} {t('urgentPriorities')}
            </button>
            <button
              onClick={() => onSelectTab('itineraires')}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs md:text-sm flex items-center gap-2 transition-all shadow-lg shadow-teal-600/20"
            >
              <Compass className="w-4 h-4" />
              {t('optimizeRoute')}
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alert Bar if urgent inspections exist */}
      {urgentTotal > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 text-rose-800">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">{t('followUpAlert')} : {urgentTotal} {t('needInspection')}</p>
              <p className="text-xs text-rose-700">
                {jamaisInspectes.length} {t('neverScored')}, {inspectionsAnciennes.length} {t('oldInspection')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('planification')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors"
          >
            {t('emergencyPlan')}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Key Metric KPI Cards (Clean high-contrast grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {/* Total Enseignants */}
        <div 
          onClick={() => onSelectTab('enseignants')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('teachersCount')}</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{totalEnseignants}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {enseignantsActifs} {t('activeTeachers')} ({enseignantsInactifs} {t('inactiveTeachers')})
          </div>
        </div>

        {/* Établissements */}
        <div 
          onClick={() => onSelectTab('etablissements')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('schoolsCount')}</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{totalEtablissements}</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1 truncate">
            {communes.length} {t('coveredCommunes')}
          </div>
        </div>

        {/* Inspections Réalisées */}
        <div 
          onClick={() => onSelectTab('inspections')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('inspectionsCount')}</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{inspectionsCount}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">
            {t('officialScores')}
          </div>
        </div>

        {/* Visites Réalisées */}
        <div 
          onClick={() => onSelectTab('visites')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('visitsCount')}</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{visitesCount}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            {t('fieldSupport')}
          </div>
        </div>

        {/* Rencontres & Formations */}
        <div 
          onClick={() => onSelectTab('formations')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('formationsWorkshops')}</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{formationsCount + rencontresCount}</div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">
            {formationsCount} {t('trainings')}, {rencontresCount} {t('meetings')}
          </div>
        </div>

        {/* Activités Cette Année */}
        <div 
          onClick={() => onSelectTab('activites')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Année {activeAnnee?.libelle || currentYear}</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{activitiesThisYear}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {t('actionsCompleted')}
          </div>
        </div>
      </div>

      {/* Secondary Metrics: Emplois du temps & Géolocalisation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">{t('timetablesEntered')}</span>
            <span className="text-xl font-bold text-slate-900">{emploisSaisis} / {totalEnseignants}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {Math.round((emploisSaisis / (totalEnseignants || 1)) * 100)}% {t('completed')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 border-4 border-blue-500 flex items-center justify-center font-bold text-xs text-blue-700">
            {emploisSaisis}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">{t('timetablesMissing')}</span>
            <span className="text-xl font-bold text-amber-600">{emploisNonSaisis}</span>
            <span className="text-[11px] text-amber-700 block mt-0.5">{t('toPlan')}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 border-4 border-amber-500 flex items-center justify-center font-bold text-xs text-amber-700">
            {emploisNonSaisis}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">{t('geolocatedSchools')}</span>
            <span className="text-xl font-bold text-slate-900">{gpsSaisis} / {totalEtablissements}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {Math.round((gpsSaisis / (totalEtablissements || 1)) * 100)}% {t('gpsCoordinates')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-teal-50 border-4 border-teal-500 flex items-center justify-center font-bold text-xs text-teal-700">
            {gpsSaisis}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">{t('withoutGps')}</span>
            <span className="text-xl font-bold text-slate-700">{gpsNonSaisis}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">{t('completeSchoolFile')}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-100 border-4 border-slate-400 flex items-center justify-center font-bold text-xs text-slate-600">
            {gpsNonSaisis}
          </div>
        </div>
      </div>

      {/* Main Charts & Analytical Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enseignants par Commune */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Répartition par Commune
            </h3>
            <span className="text-xs text-slate-400">{communes.length} communes</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(enseignantsParCommune).map(([commune, count]) => {
              const pct = Math.round((count / (totalEnseignants || 1)) * 100);
              return (
                <div key={commune} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800">{commune}</span>
                    <span className="text-slate-500 font-semibold">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution des Notes d'Inspection */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              Distribution des Notes (/20)
            </h3>
            <span className="text-xs text-slate-400">Dernière inspection</span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-emerald-700 font-semibold">&gt; 16 / 20 (Très Bien / Excellent)</span>
                <span className="text-slate-700 font-bold">{notesDistrib.plusDe16}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(notesDistrib.plusDe16 / totalEnseignants) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-teal-700 font-semibold">14 - 16 / 20 (Bien)</span>
                <span className="text-slate-700 font-bold">{notesDistrib.entre14et16}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(notesDistrib.entre14et16 / totalEnseignants) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-blue-700 font-semibold">12 - 14 / 20 (Assez Bien)</span>
                <span className="text-slate-700 font-bold">{notesDistrib.entre12et14}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(notesDistrib.entre12et14 / totalEnseignants) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-amber-700 font-semibold">10 - 12 / 20 (Moyen)</span>
                <span className="text-slate-700 font-bold">{notesDistrib.entre10et12}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(notesDistrib.entre10et12 / totalEnseignants) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 font-medium">Visite sans note / Non inspecté</span>
                <span className="text-slate-700 font-bold">{notesDistrib.visiteSansNote}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: `${(notesDistrib.visiteSansNote / totalEnseignants) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Cycle Collégial: <strong className="text-slate-800">{collegialCount}</strong></span>
            <span>Cycle Qualifiant: <strong className="text-slate-800">{qualifiantCount}</strong></span>
          </div>
        </div>

        {/* Établissements nécessitant davantage de suivi */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              Établissements Prioritaires
            </h3>
            <span className="text-xs text-rose-600 font-semibold">Besoin d'inspection</span>
          </div>

          <div className="space-y-2.5">
            {schoolsNeedingFollowup.map((item, idx) => (
              <div 
                key={item.etab.id}
                onClick={() => onOpenSchoolDetail(item.etab)}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{item.etab.nomAr}</p>
                  <p className="text-[11px] text-slate-500">{item.etab.commune} • {item.totalEns} ens. info</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                    {item.count} en attente
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onSelectTab('planification')}
            className="w-full py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
          >
            Voir la matrice complète de planification
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Activities & Quick Schedule List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières Activités Réalisées */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-700" />
              Dernières Activités Enregistrées
            </h3>
            <button
              onClick={() => onSelectTab('activites')}
              className="text-xs text-emerald-700 hover:underline font-semibold"
            >
              Tout voir ({activities.length})
            </button>
          </div>

          <div className="space-y-3">
            {recentActivities.map(act => {
              const isInspection = act.type === 'inspection';
              return (
                <div key={act.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 flex items-start gap-3 transition-colors">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    act.type === 'inspection' ? 'bg-blue-100 text-blue-700' :
                    act.type === 'visite' ? 'bg-teal-100 text-teal-700' :
                    act.type === 'formation' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {act.type === 'inspection' && <FileCheck className="w-4 h-4" />}
                    {act.type === 'visite' && <Eye className="w-4 h-4" />}
                    {act.type === 'formation' && <GraduationCap className="w-4 h-4" />}
                    {act.type === 'rencontre' && <UsersRound className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        {act.type}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{act.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-0.5 line-clamp-1">{act.objet}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {act.etablissementNom} ({act.commune})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Accès Rapide & Tâches Courantes
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onOpenNewActivity('inspection')}
              className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-left transition-all group"
            >
              <FileCheck className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900">Saisir Inspection</p>
              <span className="text-[11px] text-slate-500">Noter et apprécier</span>
            </button>

            <button
              onClick={() => onOpenNewActivity('visite')}
              className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/70 text-left transition-all group"
            >
              <Eye className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900">Saisir Visite</p>
              <span className="text-[11px] text-slate-500">Accompagnement terrain</span>
            </button>

            <button
              onClick={() => onSelectTab('planification')}
              className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-left transition-all group"
            >
              <Clock className="w-5 h-5 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900">Plan d'Inspection</p>
              <span className="text-[11px] text-slate-500">Seuils et priorités</span>
            </button>

            <button
              onClick={() => onSelectTab('rapports')}
              className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-left transition-all group"
            >
              <FileSpreadsheet className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900">Générer Rapports</p>
              <span className="text-[11px] text-slate-500">PV et bilans officiels</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">💡 Conseil d'utilisation</p>
            <p className="text-[11px] leading-relaxed">
              Pour préparer vos déplacements, utilisez le module <strong>Tournées & Itinéraires</strong> afin de regrouper les visites des établissements d'une même commune selon la priorité pédagogique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
