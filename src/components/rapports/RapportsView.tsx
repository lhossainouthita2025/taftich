import React, { useEffect, useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Award, 
  School, 
  Users, 
  FileCheck, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Calendar
} from 'lucide-react';
import { Enseignant, Etablissement, Activity, Commune, AnneeScolaire } from '../../types';
import { ExcelService } from '../../services/excelService';
import { StorageService } from '../../services/storage';
import { useI18n } from '../../i18n';

interface RapportsViewProps {
  enseignants: Enseignant[];
  etablissements: Etablissement[];
  activities: Activity[];
  communes: Commune[];
  anneesScolaires?: AnneeScolaire[];
  activeAnneeScolaireId?: string;
}

export const RapportsView: React.FC<RapportsViewProps> = ({
  enseignants,
  etablissements,
  activities,
  communes,
  anneesScolaires: propsAnnees,
  activeAnneeScolaireId
}) => {
  const { t } = useI18n();
  const allAnnees = propsAnnees || StorageService.getAnneesScolaires();
  const defaultActive = allAnnees.find(a => a.id === activeAnneeScolaireId) || StorageService.getActiveAnneeScolaire();
  const [selectedYearId, setSelectedYearId] = useState<string>(defaultActive?.id || '2026-2027');

  useEffect(() => {
    if (activeAnneeScolaireId) {
      setSelectedYearId(activeAnneeScolaireId);
    }
  }, [activeAnneeScolaireId]);

  const selectedAnnee = allAnnees.find(a => a.id === selectedYearId) || allAnnees[0] || {
    id: '2026-2027',
    libelle: '2026/2027',
    dateDebut: '2026-09-01',
    dateFin: '2027-07-31',
    estActive: true,
    statut: 'en_cours' as const
  };

  // Computed stats filtered by official school year range (1er septembre au 31 juillet)
  const totalEnseignants = enseignants.length;
  const inspectedThisYear = activities.filter(
    a => a.type === 'inspection' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const visitedThisYear = activities.filter(
    a => a.type === 'visite' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const formationsThisYear = activities.filter(
    a => a.type === 'formation' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const visitesPionnieresThisYear = activities.filter(
    a => a.type === 'visite_pionniere' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const visitesNonPionnieresThisYear = activities.filter(
    a => a.type === 'visite_non_pionniere' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const rencontresAdminThisYear = activities.filter(
    a => a.type === 'rencontre_administrative' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const coursExperimentationThisYear = activities.filter(
    a => a.type === 'cours_experimentation' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const remisesMissionsThisYear = activities.filter(
    a => a.type === 'remise_missions' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const recherchesPedagogiquesThisYear = activities.filter(
    a => a.type === 'recherche_pedagogique' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const qualiteSuiviThisYear = activities.filter(
    a => a.type === 'qualite_suivi' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const comitesSuiviThisYear = activities.filter(
    a => a.type === 'comite_suivi' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const comitesSoutienThisYear = activities.filter(
    a => a.type === 'comite_soutien' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const reunionsNationalesThisYear = activities.filter(
    a => a.type === 'reunion_nationale' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const reunionsRegionalesThisYear = activities.filter(
    a => a.type === 'reunion_regionale' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const reunionsProvincialesThisYear = activities.filter(
    a => a.type === 'reunion_provinciale' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const reunionsCoordinationRegionalesThisYear = activities.filter(
    a => a.type === 'reunion_coordination_regionale' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const reunionsCoordinationGhoThisYear = activities.filter(
    a => a.type === 'reunion_coordination_gho' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const participationsProgrammesThisYear = activities.filter(
    a => a.type === 'participation_programmes_nationaux' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const propositionsSujetsThisYear = activities.filter(
    a => a.type === 'proposition_sujets' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const rencontresThisYear = activities.filter(
    a => a.type === 'rencontre' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const reunionsThisYear = activities.filter(
    a => a.type === 'reunion' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const validationsThisYear = activities.filter(
    a => a.type === 'validation_fiches' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const examensThisYear = activities.filter(
    a => a.type === 'suivi_examens' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const formationsAsFormateur = activities.filter(
    a => a.type === 'formation' && a.roleFormation === 'formateur' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const formationsAsForme = activities.filter(
    a => a.type === 'formation' && a.roleFormation === 'formé' && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
  ).length;

  const coverageRate = Math.round((inspectedThisYear / (totalEnseignants || 1)) * 100);

  const handlePrintBilan = () => {
    window.print();
  };

  const handleExportGlobalReport = () => {
    ExcelService.exportEnseignantsToExcel(enseignants, `bilan_general_pedagogique_${selectedAnnee.libelle.replace('/', '-')}.xlsx`);
  };

  return (
    <div id="rapports-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-600" />
            {t('reportsTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('reportsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportGlobalReport}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            {t('exportExcel')}
          </button>
          <button
            onClick={handlePrintBilan}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            {t('annualReport')}
          </button>
        </div>
      </div>

      {/* Year Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-800">{t('schoolYear')} :</span>
            <span className="text-[11px] text-slate-500 block">Période réglementaire du 1er septembre au 31 juillet</span>
          </div>
        </div>
        <select
          value={selectedYearId}
          onChange={e => setSelectedYearId(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        >
          {allAnnees.map(annee => (
            <option key={annee.id} value={annee.id}>
              {annee.libelle} {annee.estActive ? '(En cours / Active)' : ''} — du 01/09 au 31/07
            </option>
          ))}
        </select>
      </div>

      {/* Official Report Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-xs">
        {/* Moroccan Header */}
        <div className="border-b-2 border-slate-900 pb-5 text-center">
          <div className="flex justify-between items-start text-xs font-bold text-slate-800">
            <div className="text-left space-y-0.5">
              <p>المملكة المغربية</p>
              <p>وزارة التربية الوطنية والتعليم الأولي والرياضة</p>
              <p>الأكاديمية الجهوية - سوس ماسة</p>
              <p>المديرية الإقليمية بإنزكان - أيت ملول</p>
            </div>
            <div className="text-right space-y-0.5" dir="rtl">
              <p>Royaume du Maroc</p>
              <p>MENPS / AREF Souss Massa</p>
              <p>Direction Provinciale Inzegane Aït Melloul</p>
              <p>Inspection Pédagogique d'Informatique</p>
            </div>
          </div>

          <div className="mt-4 inline-block px-8 py-2.5 border-2 border-slate-900 rounded-xl bg-slate-50">
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-950">
              الحصيلة السنوية للتأطير والمراقبة التربوية
            </h2>
            <p className="text-xs text-slate-600 font-semibold">
              Bilan Annuel d'Encadrement et de Suivi Pédagogique — Année Scolaire {selectedAnnee.libelle} (du 01/09/{selectedAnnee.dateDebut.substring(0, 4)} au 31/07/{selectedAnnee.dateFin.substring(0, 4)})
            </p>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs text-slate-500 font-semibold block">Corps Professoral Total</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{totalEnseignants}</span>
            <span className="text-[11px] text-slate-500">Enseignants en exercice</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <span className="text-xs text-blue-700 font-semibold block">{t('officialInspections')}</span>
            <span className="text-3xl font-black text-blue-950 mt-1 block">{inspectedThisYear}</span>
            <span className="text-[11px] text-blue-600">Procès-verbaux homologués</span>
          </div>

          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-center">
            <span className="text-xs text-teal-700 font-semibold block">{t('pedagogicalVisits')}</span>
            <span className="text-3xl font-black text-teal-950 mt-1 block">{visitedThisYear}</span>
            <span className="text-[11px] text-teal-600">Accompagnement de classe</span>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-center">
            <span className="text-xs text-purple-700 font-semibold block">{t('trainingSeminars')}</span>
            <span className="text-3xl font-black text-purple-950 mt-1 block">{formationsThisYear}</span>
            <span className="text-[11px] text-purple-600">Sessions collectives</span>
          </div>
        </div>

        {/* Coverage Progress Bar */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
            <span>Taux de Couverture Annuel des Inspections :</span>
            <span className="font-mono text-sm">{coverageRate}%</span>
          </div>
          <div className="h-3 w-full bg-emerald-200/50 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${coverageRate}%` }} />
          </div>
          <p className="text-[11px] text-emerald-800">
            Objectif fixé par la Direction Provinciale : minimum 30% du corps professoral inspecté par an.
          </p>
        </div>

        {/* Indicator Summary from reference PDF */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900">Indicateurs de suivi et de coordination</h4>
            <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">Document de référence</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white border border-indigo-100 text-center">
              <span className="text-[10px] uppercase tracking-wide text-indigo-600 block">Visites / accompagnement</span>
              <span className="text-2xl font-black text-indigo-900 mt-1 block">{visitedThisYear}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-indigo-100 text-center">
              <span className="text-[10px] uppercase tracking-wide text-indigo-600 block">{t('meetings')}</span>
              <span className="text-2xl font-black text-indigo-900 mt-1 block">{reunionsThisYear + rencontresThisYear}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-indigo-100 text-center">
              <span className="text-[10px] uppercase tracking-wide text-indigo-600 block">{t('fichesAndTimetables')}</span>
              <span className="text-2xl font-black text-indigo-900 mt-1 block">{validationsThisYear}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-indigo-100 text-center">
              <span className="text-[10px] uppercase tracking-wide text-indigo-600 block">{t('examTracking')}</span>
              <span className="text-2xl font-black text-indigo-900 mt-1 block">{examensThisYear}</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-3">{t('complementaryActivitiesTracked')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-[10px] uppercase tracking-wide text-emerald-700 block">{t('pioneerVisits')}</span>
                <span className="text-xl font-black text-emerald-900 mt-1 block">{visitesPionnieresThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-[10px] uppercase tracking-wide text-emerald-700 block">{t('nonPioneerVisits')}</span>
                <span className="text-xl font-black text-emerald-900 mt-1 block">{visitesNonPionnieresThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 text-center">
                <span className="text-[10px] uppercase tracking-wide text-orange-700 block">{t('administrativeMeetings')}</span>
                <span className="text-xl font-black text-orange-900 mt-1 block">{rencontresAdminThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-center">
                <span className="text-[10px] uppercase tracking-wide text-violet-700 block">{t('experimentalLessons')}</span>
                <span className="text-xl font-black text-violet-900 mt-1 block">{coursExperimentationThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-center">
                <span className="text-[10px] uppercase tracking-wide text-sky-700 block">{t('missionHandovers')}</span>
                <span className="text-xl font-black text-sky-900 mt-1 block">{remisesMissionsThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                <span className="text-[10px] uppercase tracking-wide text-indigo-700 block">{t('pedagogicalResearch')}</span>
                <span className="text-xl font-black text-indigo-900 mt-1 block">{recherchesPedagogiquesThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase tracking-wide text-slate-700 block">{t('qualityMonitoring')}</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{qualiteSuiviThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase tracking-wide text-slate-700 block">{t('followUpCommittees')}</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{comitesSuiviThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase tracking-wide text-slate-700 block">{t('supportCommittees')}</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{comitesSoutienThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-[10px] uppercase tracking-wide text-amber-700 block">{t('nationalMeetings')}</span>
                <span className="text-xl font-black text-amber-900 mt-1 block">{reunionsNationalesThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-[10px] uppercase tracking-wide text-amber-700 block">{t('regionalMeetings')}</span>
                <span className="text-xl font-black text-amber-900 mt-1 block">{reunionsRegionalesThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-[10px] uppercase tracking-wide text-amber-700 block">{t('provincialMeetings')}</span>
                <span className="text-xl font-black text-amber-900 mt-1 block">{reunionsProvincialesThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-[10px] uppercase tracking-wide text-amber-700 block">{t('regionalCoordinationMeetings')}</span>
                <span className="text-xl font-black text-amber-900 mt-1 block">{reunionsCoordinationRegionalesThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-[10px] uppercase tracking-wide text-amber-700 block">{t('ghoCoordinationMeetings')}</span>
                <span className="text-xl font-black text-amber-900 mt-1 block">{reunionsCoordinationGhoThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-center">
                <span className="text-[10px] uppercase tracking-wide text-cyan-700 block">{t('nationalPrograms')}</span>
                <span className="text-xl font-black text-cyan-900 mt-1 block">{participationsProgrammesThisYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-pink-50 border border-pink-100 text-center">
                <span className="text-[10px] uppercase tracking-wide text-pink-700 block">{t('topicProposals')}</span>
                <span className="text-xl font-black text-pink-900 mt-1 block">{propositionsSujetsThisYear}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white border border-purple-100 text-center">
              <span className="text-[10px] uppercase tracking-wide text-purple-600 block">{t('trainings')}</span>
              <span className="text-xl font-black text-purple-900 mt-1 block">{formationsThisYear}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-purple-100 text-center">
              <span className="text-[10px] uppercase tracking-wide text-purple-600 block">{t('trainer')}</span>
              <span className="text-xl font-black text-purple-900 mt-1 block">{formationsAsFormateur}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-purple-100 text-center">
              <span className="text-[10px] uppercase tracking-wide text-purple-600 block">{t('trained')}</span>
              <span className="text-xl font-black text-purple-900 mt-1 block">{formationsAsForme}</span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown by Commune */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
            {t('territorialDistribution')}
          </h4>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">{t('commune')}</th>
                  <th className="py-2.5 px-4 text-center">{t('schools')}</th>
                  <th className="py-2.5 px-4 text-center">{t('teachers')}</th>
                  <th className="py-2.5 px-4 text-center">{t('inspections')}</th>
                  <th className="py-2.5 px-4 text-center">{t('visits')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {communes.map(c => {
                  const etabsInCom = etablissements.filter(e => e.commune === c.nomAr);
                  const ensInCom = enseignants.filter(e => e.commune === c.nomAr);
                  const actInCom = activities.filter(
                    a => a.commune === c.nomAr && StorageService.isDateInAnneeScolaire(a.date, selectedAnnee)
                  );
                  const inspCount = actInCom.filter(a => a.type === 'inspection').length;
                  const visCount = actInCom.filter(a => a.type === 'visite').length;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{c.nomAr} ({c.nomFr})</td>
                      <td className="py-2.5 px-4 text-center font-mono">{etabsInCom.length}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-emerald-800">{ensInCom.length}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-blue-800">{inspCount}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-teal-800">{visCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature Box for Print */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
          <div className="space-y-12">
            <p className="font-bold text-slate-800">مصلحة تأطير المؤسسات التعليمية والتوجيه</p>
            <p className="text-[11px] text-slate-400">تأشيرة المصلحة</p>
          </div>
          <div className="space-y-12">
            <p className="font-bold text-slate-800">المفتش التربوي المكلف بالتنسيق الإقليمي</p>
            <p className="text-xs font-semibold text-slate-700">ذ. رشيد المنصوري</p>
          </div>
        </div>
      </div>
    </div>
  );
};
