export type Role = 'admin' | 'inspecteur' | 'consultation';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string; // format: prenom.nom@taalim.ma
  password?: string;
  mustChangePassword?: boolean; // true upon first connection with temp password Abcd@1234
  role: Role;
  academie?: string; // ex: "Souss-Massa"
  directionsProvinciales?: string[]; // Multiple directions allowed within the same academy
  direction?: string;
  matiere?: string; // Discipline / Spécialité pédagogique
  avatar?: string;
  telephone?: string;
  specialite?: string;
  bureau?: string;
  doti?: string;
  lastLogin?: string;
}

export interface Commune {
  id: string;
  nomAr: string;
  nomFr: string;
  province: string;
  region: string;
}

export interface Etablissement {
  id: string;
  nomAr: string;
  nomFr: string;
  commune: string; // e.g. "إنزكان"
  communeFr: string; // e.g. "Inzegane"
  type: 'college' | 'lycee' | 'qualifiant';
  estPionnier: boolean; // رائدة
  directionProvinciale: string;
  academie: string;
  codeEtab?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  directeurNom?: string;
  latitude?: number;
  longitude?: number;
  dateCreation?: string;
}

export interface TimetableSlot {
  jour: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  heureDebut: string; // "08:30"
  heureFin: string;   // "10:30"
  classe: string;     // "2ème ASC 1"
  salle: string;      // "Salle Info 1"
  matiere: string;
}

export interface Enseignant {
  id: string;
  doti: string;
  nom: string; // Full Arabic / French name
  nomFr?: string;
  etablissementId: string;
  etablissementNom: string;
  commune: string;
  grade: string; // e.g. "أستاذ التعليم الثانوي التأهيلي"
  matiere: string; // e.g. "المعلوميات"
  cycle: 'اعدادي' | 'تأهيلي';
  actif: boolean;
  telephone?: string;
  email?: string;
  dateNaissance?: string;
  dateRecrutement?: string;
  echelon?: string;
  promotionEchelon?: boolean;
  promotionGrade?: boolean;
  derniereNote?: number | 'vis';
  derniereAnneeInspection?: number;
  derniereDateInspection?: string;
  emploiDuTemps?: TimetableSlot[];
  remarques?: string;
}

export type ActivityType = 
  | 'inspection'
  | 'visite'
  | 'visite_pionniere'
  | 'visite_non_pionniere'
  | 'rencontre'
  | 'rencontre_administrative'
  | 'formation'
  | 'reunion'
  | 'reunion_nationale'
  | 'reunion_regionale'
  | 'reunion_provinciale'
  | 'reunion_coordination_regionale'
  | 'reunion_coordination_gho'
  | 'validation_fiches'
  | 'suivi_examens'
  | 'cours_experimentation'
  | 'remise_missions'
  | 'recherche_pedagogique'
  | 'qualite_suivi'
  | 'comite_suivi'
  | 'comite_soutien'
  | 'participation_programmes_nationaux'
  | 'proposition_sujets'
  | 'accompagnement'
  | 'autre';

export interface BaseActivity {
  id: string;
  type: ActivityType;
  date: string; // YYYY-MM-DD
  commune: string;
  etablissementId: string;
  etablissementNom: string;
  responsableNom: string;
  objet: string;
  description?: string;
  observations?: string;
  recommandations?: string;
  prochaineEcheance?: string;
  piecesJointes?: string[];
  rapportNom?: string;
  rapportType?: string;
  rapportData?: string;
  typeReunion?: 'régionale' | 'provinciale' | 'Conseil régional de coordination de l’inspection' | 'Conseil provincial de coordination de l’inspection';
  sujetVisite?: 'accompagnement' | 'suivi de la rentrée scolaire' | 'suivi de la remédiation pédagogique' | 'autre';
  operationSuiviExamen?: 'chef du centre d’examen' | 'observation' | 'correction des copies' | 'élaboration des épreuves' | 'autre';
  roleFormation?: 'formateur' | 'formé';
  createdAt: string;
  updatedAt: string;
}

export interface Inspection extends BaseActivity {
  type: 'inspection';
  enseignantId: string;
  enseignantNom: string;
  doti: string;
  matiere: string;
  cycle: string;
  inspecteurNom: string;
  typeInspection: 'periodique' | 'titularisation' | 'avancement' | 'speciale';
  note?: number; // out of 20
  appreciation: string;
  pointsForts: string;
  pointsAmeliorer: string;
  disciplinePedagogique?: number;
  preparationCours?: number;
  gestionClasse?: number;
  evaluationApprenants?: number;
}

export interface Visite extends BaseActivity {
  type: 'visite';
  enseignantsIds?: string[];
  enseignantsNoms?: string[];
  estGlobale: boolean; // If for the entire school
  motif: string;
  objectifs: string;
  actionsARealiser?: string;
  statut: 'realisee' | 'planifiee' | 'annulee';
}

export interface Rencontre extends BaseActivity {
  type: 'rencontre';
  theme: string;
  objectifs: string;
  participantsIds: string[];
  participantsNoms: string[];
  estIndividuelle: boolean;
  compteRendu: string;
  decisions: string;
  actionsASuivre?: string;
}

export interface Reunion extends BaseActivity {
  type: 'reunion';
  theme: string;
  objectifs: string;
  participantsIds: string[];
  participantsNoms: string[];
  estIndividuelle: boolean;
  compteRendu: string;
  decisions: string;
  typeReunion?: 'régionale' | 'provinciale' | 'Conseil régional de coordination de l’inspection' | 'Conseil provincial de coordination de l’inspection';
}

export interface ValidationFiches extends BaseActivity {
  type: 'validation_fiches';
  theme: string;
  objectifs: string;
  participantsIds: string[];
  participantsNoms: string[];
  estIndividuelle: boolean;
  compteRendu: string;
  decisions: string;
}

export interface SuiviExamens extends BaseActivity {
  type: 'suivi_examens';
  theme: string;
  objectifs: string;
  participantsIds: string[];
  participantsNoms: string[];
  estIndividuelle: boolean;
  compteRendu: string;
  decisions: string;
  operationSuiviExamen?: 'chef du centre d’examen' | 'observation' | 'correction des copies' | 'élaboration des épreuves' | 'autre';
}

export interface Formation extends BaseActivity {
  type: 'formation';
  intitule: string;
  formateur: string;
  theme: string;
  objectifs: string;
  contenu: string;
  participantsIds: string[];
  participantsNoms: string[];
  dureeHeures: number;
  evaluation?: string;
  lieu: string;
  roleFormation?: 'formateur' | 'formé';
}

export interface GenericActivity extends BaseActivity {
  type:
    | 'visite_pionniere'
    | 'visite_non_pionniere'
    | 'rencontre_administrative'
    | 'cours_experimentation'
    | 'remise_missions'
    | 'recherche_pedagogique'
    | 'qualite_suivi'
    | 'comite_suivi'
    | 'comite_soutien'
    | 'reunion_nationale'
    | 'reunion_regionale'
    | 'reunion_provinciale'
    | 'reunion_coordination_regionale'
    | 'reunion_coordination_gho'
    | 'participation_programmes_nationaux'
    | 'proposition_sujets';
  theme?: string;
  objectifs?: string;
  participantsIds?: string[];
  participantsNoms?: string[];
  estIndividuelle?: boolean;
  compteRendu?: string;
  decisions?: string;
}

export type Activity = 
  | Inspection
  | Visite
  | Rencontre
  | Formation
  | Reunion
  | ValidationFiches
  | SuiviExamens
  | GenericActivity;

export type InspectionActivity = Inspection;
export type VisiteActivity = Visite;
export type RencontreActivity = Rencontre;
export type FormationActivity = Formation;
export type ReunionActivity = Reunion;
export type ValidationFichesActivity = ValidationFiches;
export type SuiviExamensActivity = SuiviExamens;

export interface NotificationItem {
  id: string;
  titre: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  date: string;
  lu: boolean;
  lien?: string;
}

export interface ItineraireEtape {
  ordre: number;
  etablissement: Etablissement;
  motif: string;
  enseignantsPrioritaires: Enseignant[];
  distanceKmDepuisPrecedent: number;
  dureeEstimeeMin: number;
}

export interface InspectionPriority {
  enseignant: Enseignant;
  etablissement: Etablissement;
  anneesSansInspection: number;
  priorite: 'Urgente' | 'Haute' | 'Normale' | 'Faible';
  motif: string;
}

export interface AnneeScolaire {
  id: string; // e.g. "2026-2027"
  libelle: string; // e.g. "2026/2027"
  dateDebut: string; // "YYYY-09-01" (du 1er septembre)
  dateFin: string; // "YYYY-07-31" (au 31 juillet)
  estActive: boolean;
  statut: 'en_cours' | 'cloturee' | 'a_venir';
  description?: string;
}

