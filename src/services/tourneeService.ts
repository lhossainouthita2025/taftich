import { Enseignant, Etablissement, TimetableSlot } from '../types';

export type DayOfWeek = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
export type TimePeriod = 'matin' | 'apres-midi' | 'tous';
export type PriorityLevel = 'Urgente' | 'Haute' | 'Normale' | 'Faible';

export const DAYS_OF_WEEK: { key: DayOfWeek; labelFr: string; labelAr: string }[] = [
  { key: 'Lundi', labelFr: 'Lundi', labelAr: 'الإثنين' },
  { key: 'Mardi', labelFr: 'Mardi', labelAr: 'الثلاثاء' },
  { key: 'Mercredi', labelFr: 'Mercredi', labelAr: 'الأربعاء' },
  { key: 'Jeudi', labelFr: 'Jeudi', labelAr: 'الخميس' },
  { key: 'Vendredi', labelFr: 'Vendredi', labelAr: 'الجمعة' },
  { key: 'Samedi', labelFr: 'Samedi', labelAr: 'السبت' }
];

export const PRIORITY_CONFIG: Record<PriorityLevel, {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  description: string;
}> = {
  Urgente: {
    label: 'Urgente',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    borderColor: 'border-rose-200',
    description: 'Jamais inspecté ou > 3 ans (retard critique)'
  },
  Haute: {
    label: 'Haute',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    borderColor: 'border-amber-200',
    description: 'Dernière inspection il y a 3 ans'
  },
  Normale: {
    label: 'Normale',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-200',
    description: 'Dernière inspection il y a 2 ans'
  },
  Faible: {
    label: 'Faible',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    borderColor: 'border-slate-200',
    description: 'Inspecté récemment (≤ 1 an)'
  }
};

/**
 * Convert Date string (YYYY-MM-DD) to Moroccan school working day.
 */
export function getDayOfWeekFromDate(dateString: string): DayOfWeek | null {
  if (!dateString) return 'Lundi';
  const parts = dateString.split('-').map(Number);
  if (parts.length !== 3) return 'Lundi';
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  const dayIndex = date.getDay(); // 0: Sunday, 1: Monday, ... 6: Saturday
  switch (dayIndex) {
    case 1: return 'Lundi';
    case 2: return 'Mardi';
    case 3: return 'Mercredi';
    case 4: return 'Jeudi';
    case 5: return 'Vendredi';
    case 6: return 'Samedi';
    default: return null; // Sunday
  }
}

/**
 * Generate a deterministic realistic schedule for teachers without a registered timetable.
 * Ensures realistic morning and afternoon distribution for Moroccan informatics teachers.
 */
export function getTeacherSchedule(teacher: Enseignant): TimetableSlot[] {
  if (teacher.emploiDuTemps && teacher.emploiDuTemps.length > 0) {
    return teacher.emploiDuTemps;
  }

  // Derive deterministic pseudo-random seed from DOTI or ID
  const seedNum = parseInt(teacher.doti.replace(/\D/g, ''), 10) || teacher.nom.length * 17;
  const isCollege = teacher.cycle === 'اعدادي';

  const rooms = isCollege
    ? ['قاعة المعلوميات 1', 'قاعة المعلوميات 2', 'Salle Multimédia']
    : ['مختبر المعلوميات 1', 'مختبر المعلوميات 2', 'Labo Info'];

  const classesCollege = [
    '3ème ASC 1', '3ème ASC 2', '3ème ASC 3',
    '2ème ASC 1', '2ème ASC 2', '2ème ASC 3',
    '1ère ASC 1', '1ère ASC 2'
  ];

  const classesLycee = [
    'Tronc Commun Sc 1', 'Tronc Commun Sc 2', 'TC Lettres 1',
    '1ère Bac Sc Ex 1', '1ère Bac Sc Maths',
    '2ème Bac PC 1', '2ème Bac SVT 1'
  ];

  const availableClasses = isCollege ? classesCollege : classesLycee;
  const matiere = teacher.matiere || 'المعلوميات';

  // 4 distinct weekly rotation patterns
  const patternIndex = seedNum % 4;
  const slots: TimetableSlot[] = [];

  const addSlot = (
    jour: DayOfWeek,
    heureDebut: string,
    heureFin: string,
    classIdx: number,
    roomIdx: number
  ) => {
    slots.push({
      jour,
      heureDebut,
      heureFin,
      classe: availableClasses[classIdx % availableClasses.length],
      salle: rooms[roomIdx % rooms.length],
      matiere
    });
  };

  if (patternIndex === 0) {
    // Pattern 0: Lundi matin + Mercredi matin + Jeudi après-midi + Samedi matin
    addSlot('Lundi', '08:30', '10:30', 0, 0);
    addSlot('Lundi', '10:30', '12:30', 1, 0);
    addSlot('Mercredi', '08:30', '10:30', 2, 1);
    addSlot('Mercredi', '10:30', '12:30', 3, 1);
    addSlot('Jeudi', '14:30', '16:30', 4, 0);
    addSlot('Jeudi', '16:30', '18:30', 5, 0);
    addSlot('Samedi', '08:30', '10:30', 6, 1);
  } else if (patternIndex === 1) {
    // Pattern 1: Mardi matin + Mercredi après-midi + Vendredi matin + Samedi après-midi
    addSlot('Mardi', '08:30', '10:30', 1, 0);
    addSlot('Mardi', '10:30', '12:30', 2, 0);
    addSlot('Mercredi', '14:30', '16:30', 3, 1);
    addSlot('Mercredi', '16:30', '18:30', 4, 1);
    addSlot('Vendredi', '08:30', '10:30', 5, 0);
    addSlot('Vendredi', '10:30', '12:30', 6, 0);
  } else if (patternIndex === 2) {
    // Pattern 2: Lundi après-midi + Mardi après-midi + Jeudi matin + Vendredi après-midi
    addSlot('Lundi', '14:30', '16:30', 2, 0);
    addSlot('Lundi', '16:30', '18:30', 3, 0);
    addSlot('Mardi', '14:30', '16:30', 4, 1);
    addSlot('Jeudi', '08:30', '10:30', 0, 0);
    addSlot('Jeudi', '10:30', '12:30', 1, 0);
    addSlot('Vendredi', '14:30', '16:30', 5, 1);
    addSlot('Vendredi', '16:30', '18:30', 6, 1);
  } else {
    // Pattern 3: Mardi matin + Mercredi matin + Jeudi après-midi + Samedi matin
    addSlot('Mardi', '08:30', '10:30', 3, 1);
    addSlot('Mercredi', '08:30', '10:30', 0, 0);
    addSlot('Mercredi', '10:30', '12:30', 1, 0);
    addSlot('Jeudi', '14:30', '16:30', 2, 1);
    addSlot('Jeudi', '16:30', '18:30', 5, 1);
    addSlot('Samedi', '08:30', '10:30', 4, 0);
    addSlot('Samedi', '10:30', '12:30', 6, 0);
  }

  return slots;
}

/**
 * Calculate the teacher's priority level based on last inspection year.
 */
export function getTeacherPriority(
  teacher: Enseignant,
  referenceYear: number = new Date().getFullYear()
): {
  priority: PriorityLevel;
  diffYears: number;
  label: string;
  motif: string;
} {
  if (!teacher.derniereAnneeInspection || teacher.derniereNote === 'vis' || teacher.promotionEchelon || teacher.promotionGrade) {
    return {
      priority: 'Urgente',
      diffYears: 99,
      label: teacher.promotionEchelon || teacher.promotionGrade ? 'Promotion proposée' : 'Jamais inspecté',
      motif: teacher.promotionEchelon || teacher.promotionGrade
        ? 'Enseignant proposé en promotion (à inclure en priorité urgente)'
        : 'Enseignant jamais inspecté (ou visite de stage sans note)'
    };
  }

  const diff = referenceYear - teacher.derniereAnneeInspection;

  if (diff >= 4) {
    return {
      priority: 'Urgente',
      diffYears: diff,
      label: `Non inspecté depuis ${diff} ans (${teacher.derniereAnneeInspection})`,
      motif: `Dernière inspection en ${teacher.derniereAnneeInspection} (> 3 ans)`
    };
  } else if (diff === 3) {
    return {
      priority: 'Haute',
      diffYears: diff,
      label: `Dernière inspection il y a 3 ans (${teacher.derniereAnneeInspection})`,
      motif: `Seuil réglementaire triennal atteint (${teacher.derniereAnneeInspection})`
    };
  } else if (diff === 2) {
    return {
      priority: 'Normale',
      diffYears: diff,
      label: `Inspecté en ${teacher.derniereAnneeInspection} (il y a 2 ans)`,
      motif: `Dernière inspection en ${teacher.derniereAnneeInspection}`
    };
  } else {
    return {
      priority: 'Faible',
      diffYears: diff,
      label: `Récemment inspecté (${teacher.derniereAnneeInspection})`,
      motif: `Dossier à jour (inspecté en ${teacher.derniereAnneeInspection})`
    };
  }
}

/**
 * Check if teacher has teaching sessions for a specific day and time period.
 */
export function checkTeacherAvailability(
  teacher: Enseignant,
  day: DayOfWeek,
  period: TimePeriod
): {
  isTeaching: boolean;
  activeSlots: TimetableSlot[];
  allDaySlots: TimetableSlot[];
} {
  const schedule = getTeacherSchedule(teacher);
  const allDaySlots = schedule.filter(s => s.jour === day);

  const activeSlots = allDaySlots.filter(s => {
    const startHour = parseInt(s.heureDebut.split(':')[0], 10);
    if (period === 'matin') {
      return startHour < 13;
    } else if (period === 'apres-midi') {
      return startHour >= 13;
    } else {
      return true; // Tous
    }
  });

  return {
    isTeaching: activeSlots.length > 0,
    activeSlots,
    allDaySlots
  };
}

/**
 * Detailed evaluation of an establishment for a tour session.
 */
export interface EvaluatedSchool {
  school: Etablissement;
  isImposed: boolean;
  allTeachers: Enseignant[];
  availableTeachers: {
    teacher: Enseignant;
    priorityInfo: ReturnType<typeof getTeacherPriority>;
    activeSlots: TimetableSlot[];
  }[];
  targetTeachers: {
    teacher: Enseignant;
    priorityInfo: ReturnType<typeof getTeacherPriority>;
    activeSlots: TimetableSlot[];
  }[];
  isProposed: boolean;
  reason: string;
  hasTeachersInSubject: boolean;
  hasTeachingSlotInPeriod: boolean;
}

/**
 * Evaluate all establishments in the province against chosen criteria.
 */
export function evaluateEstablishmentsForTour(params: {
  schools: Etablissement[];
  teachers: Enseignant[];
  selectedCommunes: string[];
  selectedPriorities: PriorityLevel[];
  imposedSchoolIds: string[];
  day: DayOfWeek;
  period: TimePeriod;
  selectedMatiere?: string;
}): EvaluatedSchool[] {
  const {
    schools,
    teachers,
    selectedCommunes,
    selectedPriorities,
    imposedSchoolIds,
    day,
    period,
    selectedMatiere
  } = params;

  const currentYear = new Date().getFullYear();

  return schools.map(school => {
    const isImposed = imposedSchoolIds.includes(school.id);
    const inSelectedCommune = selectedCommunes.length === 0 || selectedCommunes.includes(school.commune);

    // N'afficher que les enseignants qui ont bien saisi un emploi du temps réel.
    // Cela évite d'utiliser des horaires générés automatiquement pour des établissements
    // qui n'ont pas réellement d'emploi du temps saisi dans la matière sélectionnée.
    const schoolTeachers = teachers.filter(t => {
      if (t.etablissementId !== school.id || !t.actif) return false;
      if (!(t.emploiDuTemps && t.emploiDuTemps.length > 0)) return false;
      if (selectedMatiere && selectedMatiere !== 'toutes') {
        const mat = (t.matiere || '').trim().toLowerCase();
        const filterMat = selectedMatiere.trim().toLowerCase();
        return mat === filterMat || mat.includes(filterMat) || filterMat.includes(mat);
      }
      return true;
    });

    const availableTeachers: EvaluatedSchool['availableTeachers'] = [];
    const targetTeachers: EvaluatedSchool['targetTeachers'] = [];

    schoolTeachers.forEach(teacher => {
      const availability = checkTeacherAvailability(teacher, day, period);
      const priorityInfo = getTeacherPriority(teacher, currentYear);

      if (availability.isTeaching) {
        const item = {
          teacher,
          priorityInfo,
          activeSlots: availability.activeSlots
        };
        availableTeachers.push(item);

        if (selectedPriorities.includes(priorityInfo.priority)) {
          targetTeachers.push(item);
        }
      }
    });

    const hasTeachersInSubject = schoolTeachers.length > 0;
    const hasTeachingSlotInPeriod = availableTeachers.length > 0;

    let isProposed = false;
    let reason = '';

    if (isImposed) {
      isProposed = true;
      reason = 'Établissement imposé manuellement';
    } else if (inSelectedCommune) {
      // Les établissements proposés se basent sur la disponibilité de l'un des enseignants de la matière pour la période sélectionnée
      if (targetTeachers.length > 0) {
        isProposed = true;
        reason = `${targetTeachers.length} enseignant(s) disponible(s) en classe (priorité ciblée)`;
      } else if (availableTeachers.length > 0 && selectedPriorities.length === 0) {
        isProposed = true;
        reason = `${availableTeachers.length} enseignant(s) disponible(s) en classe`;
      }
    }

    return {
      school,
      isImposed,
      allTeachers: schoolTeachers,
      availableTeachers,
      targetTeachers,
      isProposed,
      reason,
      hasTeachersInSubject,
      hasTeachingSlotInPeriod
    };
  });
}

/**
 * Build a Google Maps multi-stop route link.
 */
export function generateGoogleMapsRouteUrl(schools: Etablissement[]): string {
  const validGpsSchools = schools.filter(s => s.latitude && s.longitude);

  if (validGpsSchools.length === 0) {
    if (schools.length > 0) {
      const first = schools[0];
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${first.nomAr} ${first.commune}`)}`;
    }
    return 'https://www.google.com/maps';
  }

  if (validGpsSchools.length === 1) {
    const s = validGpsSchools[0];
    return `https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`;
  }

  const origin = `${validGpsSchools[0].latitude},${validGpsSchools[0].longitude}`;
  const destination = `${validGpsSchools[validGpsSchools.length - 1].latitude},${validGpsSchools[validGpsSchools.length - 1].longitude}`;

  if (validGpsSchools.length === 2) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  }

  const waypoints = validGpsSchools
    .slice(1, -1)
    .map(s => `${s.latitude},${s.longitude}`)
    .join('%7C');

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
}
