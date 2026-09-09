import React, { useState, useMemo, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  School, 
  Users, 
  Printer, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Download,
  Pin,
  Sun,
  Sunset,
  Filter,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  Info,
  CalendarDays,
  Search,
  BookOpen
} from 'lucide-react';
import { Enseignant, Etablissement, Commune } from '../../types';
import { ExcelService } from '../../services/excelService';
import { 
  DayOfWeek, 
  TimePeriod, 
  PriorityLevel, 
  DAYS_OF_WEEK, 
  PRIORITY_CONFIG,
  getDayOfWeekFromDate,
  evaluateEstablishmentsForTour,
  generateGoogleMapsRouteUrl,
  EvaluatedSchool
} from '../../services/tourneeService';
import { useI18n } from '../../i18n';

interface TourneesViewProps {
  enseignants: Enseignant[];
  etablissements: Etablissement[];
  communes: Commune[];
  onOpenTeacherDetail: (enseignant: Enseignant) => void;
  onOpenSchoolDetail: (etablissement: Etablissement) => void;
  onOpenNewInspection?: (enseignant?: Enseignant, etablissement?: Etablissement) => void;
}

export const TourneesView: React.FC<TourneesViewProps> = ({
  enseignants,
  etablissements,
  communes,
  onOpenTeacherDetail,
  onOpenSchoolDetail,
  onOpenNewInspection
}) => {
  const { t } = useI18n();
  // 1. Communes sélectionnées (multi-sélection)
  const [selectedCommunes, setSelectedCommunes] = useState<string[]>(['إنزكان', 'الدشيرة الجهادية']);

  // 2. Date et Jour de la semaine
  const todayIso = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);

  // 3. Période : Matinée ou Après-midi (ou journée)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('matin');

  // 4. Matière de l'inspection
  const availableMatieres = useMemo(() => {
    const list = Array.from(new Set(enseignants.map(e => e.matiere).filter(Boolean))) as string[];
    return list.length > 0 ? list : ['المعلوميات'];
  }, [enseignants]);
  const [selectedMatiere, setSelectedMatiere] = useState<string>('المعلوميات');

  // 5. Priorités sélectionnées (multi-sélection)
  const [selectedPriorities, setSelectedPriorities] = useState<PriorityLevel[]>([
    'Urgente',
    'Haute',
    'Normale'
  ]);

  // 6. Établissements imposés manuellement
  const [imposedSchoolIds, setImposedSchoolIds] = useState<string[]>([]);

  // Mode d'affichage des établissements : uniquement ceux proposés ou tous
  const [displayMode, setDisplayMode] = useState<'proposes' | 'tous'>('proposes');

  // Établissements sélectionnés dans la feuille de route active
  const [selectedSchoolsIds, setSelectedSchoolsIds] = useState<string[]>([]);

  // Recherche rapide pour imposer un établissement
  const [imposedSearchQuery, setImposedSearchQuery] = useState('');
  const [showImposeDropdown, setShowImposeDropdown] = useState(false);

  // Détection du jour de la semaine à partir de la date
  const calculatedDay = useMemo<DayOfWeek>(() => {
    const day = getDayOfWeekFromDate(selectedDate);
    return day || 'Lundi';
  }, [selectedDate]);

  const isSunday = useMemo(() => {
    const parts = selectedDate.split('-').map(Number);
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.getDay() === 0;
    }
    return false;
  }, [selectedDate]);

  // Calcul d'évaluation globale des établissements
  const evaluatedSchools = useMemo(() => {
    return evaluateEstablishmentsForTour({
      schools: etablissements,
      teachers: enseignants,
      selectedCommunes,
      selectedPriorities,
      imposedSchoolIds,
      day: calculatedDay,
      period: selectedPeriod,
      selectedMatiere
    });
  }, [
    etablissements,
    enseignants,
    selectedCommunes,
    selectedPriorities,
    imposedSchoolIds,
    calculatedDay,
    selectedPeriod,
    selectedMatiere
  ]);

  // Établissements proposés (qui satisfont les filtres : disponibilité de l'enseignant + priorité OU imposés)
  const proposedSchools = useMemo(() => {
    return evaluatedSchools.filter(e => e.isProposed);
  }, [evaluatedSchools]);

  // Tous les établissements situés dans les communes sélectionnées et réellement disponibles
  const schoolsInCommune = useMemo(() => {
    return evaluatedSchools.filter(e => {
      const inSelectedCommune = selectedCommunes.length === 0 || selectedCommunes.includes(e.school.commune);
      return inSelectedCommune && e.hasTeachersInSubject && e.hasTeachingSlotInPeriod;
    });
  }, [evaluatedSchools, selectedCommunes]);

  // Établissements à afficher selon le mode d'affichage
  const displayedSchools = useMemo(() => {
    return displayMode === 'proposes' ? proposedSchools : schoolsInCommune;
  }, [displayMode, proposedSchools, schoolsInCommune]);

  // Synchronisation automatique : quand les critères changent, pré-sélectionner les étapes proposées
  useEffect(() => {
    const validProposedIds = proposedSchools.map(p => p.school.id);
    setSelectedSchoolsIds(prev => {
      // Conserver les imposés et ajouter les nouveaux proposés
      const combined = Array.from(new Set([...imposedSchoolIds, ...validProposedIds]));
      return combined;
    });
  }, [proposedSchools, imposedSchoolIds]);

  // Toggles pour les communes
  const toggleCommune = (nomAr: string) => {
    if (selectedCommunes.includes(nomAr)) {
      if (selectedCommunes.length > 1) {
        setSelectedCommunes(selectedCommunes.filter(c => c !== nomAr));
      }
    } else {
      setSelectedCommunes([...selectedCommunes, nomAr]);
    }
  };

  const selectAllCommunes = () => {
    setSelectedCommunes(communes.map(c => c.nomAr));
  };

  const deselectAllCommunes = () => {
    if (communes.length > 0) {
      setSelectedCommunes([communes[0].nomAr]);
    }
  };

  // Toggles pour les priorités
  const togglePriority = (priority: PriorityLevel) => {
    if (selectedPriorities.includes(priority)) {
      if (selectedPriorities.length > 1) {
        setSelectedPriorities(selectedPriorities.filter(p => p !== priority));
      }
    } else {
      setSelectedPriorities([...selectedPriorities, priority]);
    }
  };

  const selectAllPriorities = () => {
    setSelectedPriorities(['Urgente', 'Haute', 'Normale', 'Faible']);
  };

  // Gestion des établissements imposés
  const addImposedSchool = (schoolId: string) => {
    if (!imposedSchoolIds.includes(schoolId)) {
      setImposedSchoolIds([...imposedSchoolIds, schoolId]);
    }
    if (!selectedSchoolsIds.includes(schoolId)) {
      setSelectedSchoolsIds([...selectedSchoolsIds, schoolId]);
    }
    setShowImposeDropdown(false);
    setImposedSearchQuery('');
  };

  const removeImposedSchool = (schoolId: string) => {
    setImposedSchoolIds(imposedSchoolIds.filter(id => id !== schoolId));
  };

  const toggleSchoolInItinerary = (schoolId: string) => {
    if (selectedSchoolsIds.includes(schoolId)) {
      setSelectedSchoolsIds(selectedSchoolsIds.filter(id => id !== schoolId));
    } else {
      setSelectedSchoolsIds([...selectedSchoolsIds, schoolId]);
    }
  };

  // Changement rapide de jour de la semaine
  const setDayOfWeek = (targetDay: DayOfWeek) => {
    const current = new Date(selectedDate);
    const currentDayIndex = current.getDay(); // 0-6
    const targetMap: Record<DayOfWeek, number> = {
      'Lundi': 1,
      'Mardi': 2,
      'Mercredi': 3,
      'Jeudi': 4,
      'Vendredi': 5,
      'Samedi': 6
    };
    const targetDayIndex = targetMap[targetDay];
    const diff = targetDayIndex - currentDayIndex;
    current.setDate(current.getDate() + (diff >= 0 ? diff : diff + 7));
    setSelectedDate(current.toISOString().slice(0, 10));
  };

  // Réordonnancement des étapes de l'itinéraire
  const moveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedSchoolsIds.length) return;
    const copy = [...selectedSchoolsIds];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setSelectedSchoolsIds(copy);
  };

  // Construction des étapes de l'itinéraire ordonnées
  const itinerarySteps = useMemo(() => {
    return selectedSchoolsIds.map((sId, index) => {
      const evalItem = evaluatedSchools.find(e => e.school.id === sId);
      const school = evalItem ? evalItem.school : etablissements.find(e => e.id === sId)!;
      const isImposed = imposedSchoolIds.includes(sId);
      const availableTeachers = evalItem ? evalItem.availableTeachers : [];
      const targetTeachers = evalItem ? evalItem.targetTeachers : [];
      const allTeachers = evalItem ? evalItem.allTeachers : enseignants.filter(t => t.etablissementId === sId && t.actif);

      // Créneaux horaires selon la période sélectionnée
      let estimatedTime = '';
      if (selectedPeriod === 'matin') {
        if (index === 0) estimatedTime = '08:30 - 10:30';
        else if (index === 1) estimatedTime = '10:30 - 12:30';
        else estimatedTime = `${8 + index * 2}:30 - ${10 + index * 2}:30`;
      } else if (selectedPeriod === 'apres-midi') {
        if (index === 0) estimatedTime = '14:30 - 16:30';
        else if (index === 1) estimatedTime = '16:30 - 18:30';
        else estimatedTime = `${14 + index * 2}:30 - ${16 + index * 2}:30`;
      } else {
        // Toute la journée
        const slots = ['08:30 - 10:30', '10:30 - 12:30', '14:30 - 16:30', '16:30 - 18:30'];
        estimatedTime = slots[index] || `${8 + index * 2}:00 - ${10 + index * 2}:00`;
      }

      return {
        stepOrder: index + 1,
        school,
        isImposed,
        availableTeachers,
        targetTeachers,
        allTeachers,
        estimatedTime
      };
    });
  }, [selectedSchoolsIds, evaluatedSchools, etablissements, imposedSchoolIds, enseignants, selectedPeriod]);

  // Lien Google Maps combiné pour tout l'itinéraire
  const multiStopGoogleMapsUrl = useMemo(() => {
    const schoolsInOrder = itinerarySteps.map(s => s.school);
    return generateGoogleMapsRouteUrl(schoolsInOrder);
  }, [itinerarySteps]);

  // Export Excel enrichi
  const handleExportMissionExcel = () => {
    const rows = itinerarySteps.flatMap(step => {
      const teachersToExport = step.availableTeachers.length > 0
        ? step.availableTeachers.map(at => at.teacher)
        : step.allTeachers;

      if (teachersToExport.length === 0) {
        return [{
          'Ordre Étape': step.stepOrder,
          'Créneau Prévu': step.estimatedTime,
          'Période': selectedPeriod === 'matin' ? 'Matinée' : selectedPeriod === 'apres-midi' ? 'Après-midi' : 'Journée',
          'Matière ciblée': selectedMatiere === 'toutes' ? 'Toutes' : selectedMatiere,
          'Établissement': step.school.nomAr,
          'Commune': step.school.commune,
          'Type': step.school.type,
          'Statut Étape': step.isImposed ? 'Imposé manuellement' : 'Proposé par disponibilité',
          'Enseignant': `Aucun enseignant (${selectedMatiere})`,
          'DOTI': '-',
          'Disponibilité en classe': 'Non disponible',
          'Séance / Salle': '-',
          'Priorité': '-',
          'Dernière Inspection': '-',
          'GPS Latitude': step.school.latitude || '',
          'GPS Longitude': step.school.longitude || ''
        }];
      }

      return teachersToExport.map(t => {
        const availInfo = step.availableTeachers.find(at => at.teacher.id === t.id);
        const slotText = availInfo && availInfo.activeSlots.length > 0
          ? availInfo.activeSlots.map(s => `${s.heureDebut}-${s.heureFin} (${s.classe}, ${s.salle})`).join(' | ')
          : 'Non programmé sur ce créneau';

        return {
          'Ordre Étape': step.stepOrder,
          'Créneau Prévu': step.estimatedTime,
          'Période': selectedPeriod === 'matin' ? 'Matinée' : selectedPeriod === 'apres-midi' ? 'Après-midi' : 'Journée',
          'Matière': t.matiere || selectedMatiere,
          'Établissement': step.school.nomAr,
          'Commune': step.school.commune,
          'Type': step.school.type,
          'Statut Étape': step.isImposed ? 'Imposé manuellement' : 'Proposé par disponibilité',
          'Enseignant': t.nom,
          'DOTI': t.doti,
          'Disponibilité en classe': availInfo ? 'Oui (En cours)' : 'Non programmé',
          'Séance / Salle': slotText,
          'Priorité': availInfo?.priorityInfo.priority || 'Non définie',
          'Dernière Inspection': t.derniereAnneeInspection || 'Jamais',
          'GPS Latitude': step.school.latitude || '',
          'GPS Longitude': step.school.longitude || ''
        };
      });
    });

    const periodLabel = selectedPeriod === 'matin' ? 'matinee' : selectedPeriod === 'apres-midi' ? 'apresmidi' : 'journee';
    ExcelService.exportTableToExcel(
      rows,
      `tournee_${calculatedDay}_${periodLabel}_${selectedDate}.xlsx`,
      'Feuille de Route'
    );
  };

  const handlePrintMission = () => {
    window.print();
  };

  // Liste filtrée des établissements pour le combobox "Imposer un établissement"
  const filteredSchoolsToImpose = useMemo(() => {
    if (!imposedSearchQuery.trim()) return etablissements.slice(0, 10);
    const q = imposedSearchQuery.toLowerCase();
    return etablissements.filter(e => 
      e.nomAr.toLowerCase().includes(q) ||
      e.nomFr.toLowerCase().includes(q) ||
      e.commune.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [etablissements, imposedSearchQuery]);

  return (
    <div id="tournees-view" className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* 1. Header principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-600" />
            {t('routes')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('activitiesSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {itinerarySteps.length > 0 && (
            <a
              href={multiStopGoogleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Ouvrir tout l'itinéraire dans Google Maps"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Itinéraire GPS Complet</span>
            </a>
          )}
          <button
            onClick={handleExportMissionExcel}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            onClick={handlePrintMission}
            className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer Ordre de Mission</span>
          </button>
        </div>
      </div>

      {/* 2. Filtres Pédagogiques & Géographiques Avancés */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Paramètres & Filtres de la Tournée
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Jour actif : <strong className="text-teal-700 font-bold">{calculatedDay}</strong> (Session du {selectedDate})
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* A. Date & Période (Matinée / Après-midi) */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Date de la tournée
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-mono font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              {isSunday && (
                <p className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Dimanche est un jour non ouvrable dans les établissements.
                </p>
              )}
            </div>

            {/* Sélecteur direct de jour */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Changer rapidement le jour de la semaine :
              </span>
              <div className="grid grid-cols-6 gap-1">
                {DAYS_OF_WEEK.map(d => {
                  const isCurrent = calculatedDay === d.key;
                  return (
                    <button
                      key={d.key}
                      onClick={() => setDayOfWeek(d.key)}
                      className={`py-1.5 text-[11px] rounded-lg font-bold transition-all text-center cursor-pointer ${
                        isCurrent
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title={d.labelFr}
                    >
                      {d.labelAr.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sélecteur Période : Matinée ou Après-midi */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Période de la tournée (Créneau)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('matin')}
                  className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    selectedPeriod === 'matin'
                      ? 'border-amber-400 bg-amber-50/80 text-amber-900 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <Sun className={`w-4 h-4 ${selectedPeriod === 'matin' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>Matinée</span>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">08:30 - 12:30</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPeriod('apres-midi')}
                  className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    selectedPeriod === 'apres-midi'
                      ? 'border-indigo-400 bg-indigo-50/80 text-indigo-900 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <Sunset className={`w-4 h-4 ${selectedPeriod === 'apres-midi' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>Après-midi</span>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">14:30 - 18:30</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPeriod('tous')}
                  className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    selectedPeriod === 'tous'
                      ? 'border-teal-400 bg-teal-50/80 text-teal-900 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <CalendarDays className={`w-4 h-4 ${selectedPeriod === 'tous' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>Journée</span>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">08:30 - 18:30</span>
                </button>
              </div>
            </div>

            {/* Matière / Discipline d'inspection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                Matière d'inspection
              </label>
              <select
                value={selectedMatiere}
                onChange={e => setSelectedMatiere(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 shadow-2xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="toutes">Toutes les matières ({enseignants.length} profs)</option>
                {availableMatieres.map(mat => {
                  const countProf = enseignants.filter(e => e.matiere === mat).length;
                  return (
                    <option key={mat} value={mat}>
                      {mat} ({countProf} enseignant{countProf > 1 ? 's' : ''})
                    </option>
                  );
                })}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                La proposition des établissements s'adapte à la présence d'au moins un enseignant de cette matière.
              </p>
            </div>
          </div>

          {/* B. Sélection des Communes & Priorités */}
          <div className="lg:col-span-8 space-y-4">
            {/* 1. Sélection d'une ou plusieurs communes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Communes ciblées ({selectedCommunes.length}/{communes.length}) :
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    onClick={selectAllCommunes}
                    className="text-teal-600 hover:text-teal-800 font-semibold cursor-pointer"
                  >
                    Toutes
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={deselectAllCommunes}
                    className="text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {communes.map(c => {
                  const isChecked = selectedCommunes.includes(c.nomAr);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleCommune(c.nomAr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isChecked ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{c.nomAr}</span>
                      <span className="text-[10px] opacity-75 font-normal">({c.nomFr})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Sélection des Priorités d'inspection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                  Priorités d'inspection ciblées :
                </label>
                <button
                  onClick={selectAllPriorities}
                  className="text-teal-600 hover:text-teal-800 text-[11px] font-semibold cursor-pointer"
                >
                  Toutes les priorités
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Urgente', 'Haute', 'Normale', 'Faible'] as PriorityLevel[]).map(lvl => {
                  const cfg = PRIORITY_CONFIG[lvl];
                  const isSelected = selectedPriorities.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => togglePriority(lvl)}
                      className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? `${cfg.badgeBg} ${cfg.borderColor} font-bold shadow-2xs ring-1 ring-teal-500/20`
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <span className={`block font-bold ${isSelected ? cfg.badgeText : 'text-slate-500'}`}>
                          {lvl}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal line-clamp-1">
                          {cfg.description}
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-teal-600 text-white' : 'border border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Imposer un ou plusieurs établissements */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-amber-600" />
                  Imposer des établissements (Étapes obligatoires dans la tournée) :
                </label>

                {/* Bouton ouvrir dropdown d'ajout */}
                <div className="flex items-center gap-2">
                  {imposedSchoolIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setImposedSchoolIds([])}
                      className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold cursor-pointer underline"
                    >
                      Vider la liste ({imposedSchoolIds.length})
                    </button>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setShowImposeDropdown(!showImposeDropdown)}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-600" />
                      <span>+ Imposer un établissement</span>
                    </button>

                  {showImposeDropdown && (
                    <div className="absolute right-0 top-8 z-30 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={imposedSearchQuery}
                          onChange={e => setImposedSearchQuery(e.target.value)}
                          placeholder="Rechercher par nom ou commune..."
                          className="w-full py-1.5 pl-8 pr-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredSchoolsToImpose.map(sch => {
                          const isAlreadyImposed = imposedSchoolIds.includes(sch.id);
                          return (
                            <button
                              key={sch.id}
                              onClick={() => {
                                if (isAlreadyImposed) {
                                  removeImposedSchool(sch.id);
                                } else {
                                  addImposedSchool(sch.id);
                                }
                              }}
                              className={`w-full text-left p-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-100 transition-colors ${
                                isAlreadyImposed ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700'
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="truncate font-semibold">{sch.nomAr}</p>
                                <p className="text-[10px] text-slate-400 truncate">{sch.commune} • {sch.type}</p>
                              </div>
                              {isAlreadyImposed ? (
                                <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">Imposé</span>
                              ) : (
                                <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

              {/* Chips des établissements imposés */}
              {imposedSchoolIds.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">
                  Aucun établissement imposé pour le moment. Vous pouvez forcer l'inclusion de n'importe quel établissement de la province.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {imposedSchoolIds.map(schId => {
                    const sch = etablissements.find(e => e.id === schId);
                    if (!sch) return null;
                    return (
                      <span
                        key={schId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold"
                      >
                        <Pin className="w-3 h-3 text-amber-700" />
                        <span>{sch.nomAr}</span>
                        <span className="text-[10px] text-amber-700 font-normal">({sch.commune})</span>
                        <button
                          onClick={() => removeImposedSchool(schId)}
                          className="p-0.5 hover:bg-amber-200 rounded-full text-amber-800 transition-colors ml-1 cursor-pointer"
                          title="Retirer l'imposition"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* C. Synthèse de l'optimisation */}
        <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="text-teal-950 font-medium">
              Résultat du filtrage dynamique pour <strong>{calculatedDay} {selectedPeriod === 'matin' ? 'Matinée' : selectedPeriod === 'apres-midi' ? 'Après-midi' : 'Journée'}</strong> :
            </span>
          </div>
          <div className="flex items-center gap-3 font-bold text-teal-900">
            <span>{proposedSchools.length} établissements proposés</span>
            <span>•</span>
            <span>{itinerarySteps.length} étapes retenues dans la feuille de route</span>
            {imposedSchoolIds.length > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-800 font-bold">{imposedSchoolIds.length} imposé(s)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Établissements Proposés par Disponibilité en Classe (Cochez pour inclure/exclure) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <School className="w-4 h-4 text-teal-600" />
              Établissements Proposés par Disponibilité ({calculatedDay} • {selectedPeriod === 'matin' ? 'Matinée' : selectedPeriod === 'apres-midi' ? 'Après-midi' : 'Journée'})
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Établissements retenus car au moins un enseignant de <strong>{selectedMatiere === 'toutes' ? 'toutes matières' : selectedMatiere}</strong> y assure une séance pédagogique durant ce créneau horaire.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Bascule mode d'affichage : Proposés vs Tous */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDisplayMode('proposes')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  displayMode === 'proposes'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Proposés ({proposedSchools.length})
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('tous')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  displayMode === 'tous'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tous de la zone ({schoolsInCommune.length})
              </button>
            </div>

            <button
              onClick={() => setSelectedSchoolsIds(proposedSchools.map(p => p.school.id))}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Tout cocher
            </button>
            <button
              onClick={() => setSelectedSchoolsIds(imposedSchoolIds)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Imposés seuls
            </button>
          </div>
        </div>

        {displayedSchools.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              Aucun établissement ne correspond aux critères sélectionnés ({calculatedDay}, {selectedPeriod}, {selectedMatiere}).
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Vérifiez la sélection des communes, élargissez les priorités, choisissez une autre période ou imposez directement un établissement via le bouton ci-dessus.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedSchools.map(item => {
              const isChecked = selectedSchoolsIds.includes(item.school.id);
              const isImposed = item.isImposed;
              const hasSlot = item.availableTeachers.length > 0;

              return (
                <div
                  key={item.school.id}
                  className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                    isChecked
                      ? isImposed 
                        ? 'bg-amber-50/40 border-amber-300 shadow-2xs'
                        : 'bg-teal-50/30 border-teal-300 shadow-2xs'
                      : !hasSlot
                        ? 'bg-slate-50/60 border-dashed border-slate-200 opacity-70'
                        : 'bg-white border-slate-200 hover:border-slate-300 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenSchoolDetail(item.school)}
                          className="font-bold text-xs text-slate-900 hover:text-teal-700 truncate text-left cursor-pointer"
                          title="Voir la fiche établissement"
                        >
                          {item.school.nomAr}
                        </button>
                        {item.school.estPionnier && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 shrink-0">
                            رائدة
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {item.school.commune} • {item.school.type}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          if (isImposed) {
                            removeImposedSchool(item.school.id);
                          } else {
                            addImposedSchool(item.school.id);
                          }
                        }}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isImposed 
                            ? 'bg-amber-200 text-amber-900' 
                            : 'hover:bg-slate-100 text-slate-400 hover:text-amber-600'
                        }`}
                        title={isImposed ? "Établissement imposé (Cliquer pour relâcher)" : "Imposer cet établissement dans la tournée"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleSchoolInItinerary(item.school.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title={isChecked ? "Retirer de la feuille de route" : "Inclure dans la feuille de route"}
                      >
                        {isChecked ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Enseignants disponibles pour ce créneau */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Enseignant(s) en séance ({item.availableTeachers.length}) :
                    </span>

                    {item.availableTeachers.length === 0 ? (
                      <div className="space-y-1">
                        <p className="text-[10px] text-amber-700 italic">
                          {isImposed
                            ? "⚠️ Aucun cours prévu à ce créneau (Établissement imposé manuellement)."
                            : `⚪ Aucun enseignant de ${selectedMatiere === 'toutes' ? 'la matière' : selectedMatiere} en cours ce créneau.`}
                        </p>
                        {!isImposed && (
                          <button
                            type="button"
                            onClick={() => addImposedSchool(item.school.id)}
                            className="text-[10px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                          >
                            <Pin className="w-3 h-3 text-amber-600" />
                            <span>Imposer quand même dans la tournée</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      item.availableTeachers.map(at => {
                        const isPrioritary = selectedPriorities.includes(at.priorityInfo.priority);
                        const firstSlot = at.activeSlots[0];
                        return (
                          <div
                            key={at.teacher.id}
                            onClick={() => onOpenTeacherDetail(at.teacher)}
                            className={`p-2 rounded-lg text-xs space-y-1 cursor-pointer transition-all ${
                              isPrioritary
                                ? 'bg-white border border-teal-200 hover:border-teal-400 shadow-2xs'
                                : 'bg-slate-50 border border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs hover:text-teal-700">
                                {at.teacher.nom}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_CONFIG[at.priorityInfo.priority].badgeBg} ${PRIORITY_CONFIG[at.priorityInfo.priority].badgeText}`}>
                                {at.priorityInfo.priority}
                              </span>
                            </div>
                            {firstSlot && (
                              <div className="text-[10px] text-emerald-800 font-mono font-medium flex items-center justify-between">
                                <span>🟢 {firstSlot.heureDebut}-{firstSlot.heureFin} ({firstSlot.classe})</span>
                                <span className="text-slate-500">{firstSlot.salle}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Feuille de Route Officielle & Ordre de Mission Pédagogique */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* En-tête officiel pour impression */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                Ordre de Mission & Feuille de Route Pédagogique
              </span>
              <span className="text-xs font-mono font-bold text-slate-600">
                Session du {selectedDate} ({calculatedDay})
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1">
              Tournée d’Inspection : Communes de {selectedCommunes.length > 0 ? selectedCommunes.join(' - ') : 'Toutes les communes'} ({selectedPeriod === 'matin' ? 'Matinée' : selectedPeriod === 'apres-midi' ? 'Après-midi' : 'Journée'})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direction Provinciale Inzegane - Aït Melloul • Encadrement Pédagogique ({selectedMatiere === 'toutes' ? 'Toutes matières' : selectedMatiere})
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold shadow-xs">
              {itinerarySteps.length} étape(s) retenue(s)
            </span>
          </div>
        </div>

        {/* Liste ordonnée des étapes avec chronogramme & guidage GPS */}
        {itinerarySteps.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic">
            Aucun établissement n'est actuellement sélectionné dans la feuille de route.
          </div>
        ) : (
          <div className="space-y-4">
            {itinerarySteps.map((step, index) => {
              const hasGps = step.school.latitude && step.school.longitude;
              const gmapsLink = hasGps 
                ? `https://www.google.com/maps/dir/?api=1&destination=${step.school.latitude},${step.school.longitude}`
                : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${step.school.nomAr} ${step.school.commune}`)}`;

              return (
                <div 
                  key={step.school.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-4"
                >
                  {/* Step Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {step.stepOrder}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">
                            {step.school.nomAr}
                          </h4>
                          {step.isImposed && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Pin className="w-2.5 h-2.5" />
                              Étape Imposée
                            </span>
                          )}
                          {step.school.estPionnier && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              رائدة
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {step.school.nomFr} • {step.school.commune} • {step.school.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-teal-900 bg-teal-100 px-3 py-1 rounded-lg">
                        Créneau estimé : {step.estimatedTime}
                      </span>

                      {/* Ordonnancement */}
                      <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5">
                        <button
                          onClick={() => moveStep(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-25 text-slate-600 transition-colors cursor-pointer"
                          title="Déplacer vers le haut"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveStep(index, 'down')}
                          disabled={index === itinerarySteps.length - 1}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-25 text-slate-600 transition-colors cursor-pointer"
                          title="Déplacer vers le bas"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <a
                        href={gmapsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>GPS</span>
                      </a>

                      <button
                        onClick={() => toggleSchoolInItinerary(step.school.id)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Retirer cette étape de la tournée"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Teachers to inspect at this step */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                      Enseignants de la matière disponibles pour ce créneau :
                    </span>

                    {step.availableTeachers.length === 0 ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                        <p className="font-semibold">⚠️ Établissement inclus manuellement sans séance programmée sur ce créneau.</p>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Total des enseignants affectés dans l'établissement : {step.allTeachers.length}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {step.availableTeachers.map(at => {
                          const t = at.teacher;
                          const pInfo = at.priorityInfo;
                          const firstSlot = at.activeSlots[0];

                          return (
                            <div
                              key={t.id}
                              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-teal-400 text-xs space-y-1.5 transition-all shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <span 
                                  onClick={() => onOpenTeacherDetail(t)}
                                  className="font-bold text-slate-900 hover:text-teal-700 cursor-pointer"
                                >
                                  {t.nom}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_CONFIG[pInfo.priority].badgeBg} ${PRIORITY_CONFIG[pInfo.priority].badgeText}`}>
                                  {pInfo.priority}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 font-mono">
                                DOTI: {t.doti} • {t.derniereAnneeInspection ? `Note: ${t.derniereNote}/20 (${t.derniereAnneeInspection})` : 'Jamais noté'}
                              </p>

                              {/* Séance en cours */}
                              {firstSlot && (
                                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-900 text-[10px] font-medium space-y-0.5">
                                  <p className="font-bold font-mono">
                                    🟢 Séance : {firstSlot.heureDebut} - {firstSlot.heureFin}
                                  </p>
                                  <p className="truncate">
                                    Classe : {firstSlot.classe} • {firstSlot.salle}
                                  </p>
                                </div>
                              )}

                              <div className="pt-1 flex items-center justify-between text-[10px] text-teal-700">
                                <button
                                  onClick={() => onOpenTeacherDetail(t)}
                                  className="font-bold hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>Voir l'emploi du temps</span>
                                </button>
                                {onOpenNewInspection && (
                                  <button
                                    onClick={() => onOpenNewInspection(t, step.school)}
                                    className="px-2 py-0.5 rounded bg-teal-600 text-white font-bold hover:bg-teal-700 cursor-pointer"
                                  >
                                    Inspecter
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Section signature officielle pour impression */}
        <div className="hidden print:block pt-12 mt-8 border-t border-slate-300">
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="border border-slate-300 p-4 rounded-lg min-h-[120px]">
              <p className="font-bold text-slate-800">Visa des Chefs d'Établissements Visités :</p>
              <p className="text-[10px] text-slate-400 mt-1">Cachet et signature à chaque passage</p>
            </div>
            <div className="border border-slate-300 p-4 rounded-lg min-h-[120px]">
              <p className="font-bold text-slate-800">L'Inspecteur Pédagogique Responsable de la Tournée :</p>
              <p className="text-[10px] text-slate-400 mt-1">Date et signature officielle</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
