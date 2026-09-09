import React, { useState } from 'react';
import { 
  X, 
  User, 
  School, 
  MapPin, 
  FileCheck, 
  Eye, 
  UsersRound, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Award, 
  Printer, 
  Plus, 
  Edit3, 
  BookOpen, 
  Phone, 
  Mail, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Enseignant, Activity, Etablissement, Role, ActivityType } from '../../types';

interface EnseignantDetailModalProps {
  enseignant: Enseignant;
  etablissement?: Etablissement;
  activities: Activity[];
  userRole: Role;
  onClose: () => void;
  onOpenNewActivity: (type: ActivityType, teacher: Enseignant) => void;
  onOpenEditTimetable: (enseignant: Enseignant) => void;
  onOpenEditTeacher?: (enseignant: Enseignant) => void;
}

export const EnseignantDetailModal: React.FC<EnseignantDetailModalProps> = ({
  enseignant,
  etablissement,
  activities,
  userRole,
  onClose,
  onOpenNewActivity,
  onOpenEditTimetable,
  onOpenEditTeacher
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'historique' | 'emploi'>('profil');

  // Filter activities related to this teacher
  const teacherActivities = activities.filter(act => {
    if (act.type === 'inspection') {
      return (act as any).enseignantId === enseignant.id || (act as any).doti === enseignant.doti;
    }
    if (act.type === 'visite') {
      const v = act as any;
      return v.enseignantsIds?.includes(enseignant.id) || v.etablissementId === enseignant.etablissementId;
    }
    if (act.type === 'rencontre' || act.type === 'formation') {
      const rf = act as any;
      return rf.participantsIds?.includes(enseignant.id) || rf.participantsNoms?.includes(enseignant.nom);
    }
    return false;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Inspections specific
  const inspections = teacherActivities.filter(a => a.type === 'inspection');

  const handlePrint = () => {
    window.print();
  };

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div 
        id="enseignant-detail-modal"
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-white">{enseignant.nom}</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  DOTI: {enseignant.doti}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {enseignant.grade} • Cycle {enseignant.cycle} • {enseignant.matiere}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userRole !== 'consultation' && onOpenEditTeacher && (
              <button
                onClick={() => onOpenEditTeacher(enseignant)}
                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Modifier les informations de l'enseignant"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Modifier</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Imprimer la fiche individuelle"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Nav Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('profil')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'profil'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Fiche Individuelle & Synthèse
            </button>
            <button
              onClick={() => setActiveTab('historique')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'historique'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Historique Chronologique
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                {teacherActivities.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('emploi')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'emploi'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Emploi du Temps Hebdomadaire
              {enseignant.emploiDuTemps && enseignant.emploiDuTemps.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>

          {/* Quick Action Button for this Teacher */}
          {userRole !== 'consultation' && (
            <div className="hidden sm:flex items-center gap-1.5 py-2">
              <button
                onClick={() => onOpenNewActivity('inspection', enseignant)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Inspection
              </button>
              <button
                onClick={() => onOpenNewActivity('visite', enseignant)}
                className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Visite
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'profil' && (
            <div className="space-y-6">
              {/* Top Banner with Latest Inspection Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Note Block */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-emerald-800 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Dernière Note d'Inspection</span>
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    {typeof enseignant.derniereNote === 'number' ? (
                      <>
                        <span className="text-3xl font-extrabold text-emerald-950 font-mono">
                          {enseignant.derniereNote}
                        </span>
                        <span className="text-sm font-bold text-emerald-700">/ 20</span>
                      </>
                    ) : enseignant.derniereNote === 'vis' ? (
                      <span className="text-lg font-bold text-amber-700">Visite sans note</span>
                    ) : (
                      <span className="text-lg font-bold text-rose-600">Non inspecté</span>
                    )}
                  </div>
                  <div className="text-xs text-emerald-800/80 mt-2">
                    {enseignant.derniereAnneeInspection ? (
                      <span>Session : <strong>{enseignant.derniereAnneeInspection}</strong></span>
                    ) : (
                      <span className="text-rose-600 font-semibold">Inspection à planifier prioritairement</span>
                    )}
                  </div>
                </div>

                {/* Affectation Scolaire */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-600 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Affectation Établissement</span>
                    <School className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{enseignant.etablissementNom}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Commune de {enseignant.commune}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200 flex justify-between">
                    <span>Cycle: <strong>{enseignant.cycle}</strong></span>
                    <span>Statut: <strong className={enseignant.actif ? 'text-emerald-600' : 'text-slate-500'}>{enseignant.actif ? 'Actif' : 'Inactif'}</strong></span>
                  </div>
                </div>

                {/* Indicateurs d'activités */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-600 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Volume des Activités</span>
                    <Clock className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-lg font-bold text-blue-700">{inspections.length}</span>
                      <p className="text-[10px] text-slate-500 font-medium">Inspections</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-lg font-bold text-teal-700">{teacherActivities.filter(a => a.type === 'visite').length}</span>
                      <p className="text-[10px] text-slate-500 font-medium">Visites</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 text-center">
                    {teacherActivities.filter(a => a.type === 'formation' || a.type === 'rencontre').length} formations et rencontres
                  </div>
                </div>
              </div>

              {/* Administrative Details Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-100/70 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Données Administratives & Statutaires
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nom et Prénom :</span>
                      <span className="font-bold text-slate-900">{enseignant.nom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">N° Somme (DOTI) :</span>
                      <span className="font-mono font-bold text-slate-900">{enseignant.doti}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cadre d'enseignement :</span>
                      <span className="font-medium text-slate-900">{enseignant.grade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Matière / Spécialité :</span>
                      <span className="font-medium text-slate-900">{enseignant.matiere}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Promotion concernée :</span>
                      <span className="font-medium text-slate-900">
                        {enseignant.promotionEchelon || enseignant.promotionGrade
                          ? [enseignant.promotionEchelon ? 'Échelon' : null, enseignant.promotionGrade ? 'Grade' : null].filter(Boolean).join(' + ')
                          : 'Aucune'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Direction Provinciale :</span>
                      <span className="font-medium text-slate-900">Inzegane - Aït Melloul</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Académie Régionale :</span>
                      <span className="font-medium text-slate-900">Souss - Massa</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contact Téléphonique :</span>
                      <span className="font-medium text-slate-900">{enseignant.telephone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Courriel Institutionnel :</span>
                      <span className="font-medium text-slate-900">{enseignant.email || `${enseignant.doti}@taalim.ma`}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Latest Inspection Assessment Details */}
              {inspections.length > 0 && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Détails du Dernier Procès-Verbal d'Inspection
                  </h4>

                  {(() => {
                    const latestInsp = inspections[0] as any;
                    return (
                      <div className="space-y-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-700 gap-2">
                          <span>Date : <strong>{latestInsp.date}</strong></span>
                          <span>Inspecteur : <strong>{latestInsp.inspecteurNom || latestInsp.responsableNom}</strong></span>
                          <span>Type : <strong className="capitalize">{latestInsp.typeInspection || 'Périodique'}</strong></span>
                          <span>Note finale : <strong className="text-emerald-700 text-sm font-bold font-mono">{latestInsp.note ? `${latestInsp.note} / 20` : 'Visite'}</strong></span>
                        </div>

                        {latestInsp.appreciation && (
                          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                            <p className="font-semibold text-blue-900 mb-1">Appréciation Pédagogique Globale :</p>
                            <p className="text-slate-700 leading-relaxed">{latestInsp.appreciation}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {latestInsp.pointsForts && (
                            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                              <p className="font-semibold text-emerald-900 mb-1">Points Forts :</p>
                              <p className="text-slate-700">{latestInsp.pointsForts}</p>
                            </div>
                          )}

                          {latestInsp.pointsAmeliorer && (
                            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                              <p className="font-semibold text-amber-900 mb-1">Points à Consolider :</p>
                              <p className="text-slate-700">{latestInsp.pointsAmeliorer}</p>
                            </div>
                          )}
                        </div>

                        {latestInsp.recommandations && (
                          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                            <p className="font-semibold text-purple-900 mb-1">Recommandations & Orientations :</p>
                            <p className="text-slate-700">{latestInsp.recommandations}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'historique' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Chronologie Complète des Interventions Pédagogiques
                </h4>
                <span className="text-xs text-slate-400 font-medium">
                  {teacherActivities.length} événement(s)
                </span>
              </div>

              {teacherActivities.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Aucune activité passée enregistrée pour cet enseignant.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {teacherActivities.map((act) => {
                    const isInsp = act.type === 'inspection';
                    const isVis = act.type === 'visite';
                    const isForm = act.type === 'formation';

                    return (
                      <div key={act.id} className="relative group">
                        {/* Dot */}
                        <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white ring-2 ring-slate-100 ${
                          isInsp ? 'bg-blue-600' : isVis ? 'bg-teal-600' : isForm ? 'bg-purple-600' : 'bg-amber-600'
                        }`} />

                        <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isInsp ? 'bg-blue-100 text-blue-800' :
                                isVis ? 'bg-teal-100 text-teal-800' :
                                isForm ? 'bg-purple-100 text-purple-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {act.type}
                              </span>
                              <span className="text-xs font-bold text-slate-900">{act.objet}</span>
                            </div>
                            <span className="text-xs text-slate-500 font-mono font-semibold">{act.date}</span>
                          </div>

                          {isInsp && (act as any).note !== undefined && (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                              <Award className="w-3.5 h-3.5" />
                              Note officielle : {(act as any).note} / 20
                            </div>
                          )}

                          {act.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                          )}

                          {act.observations && (
                            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                              <strong className="text-slate-800">Observations : </strong>
                              {act.observations}
                            </div>
                          )}

                          {act.recommandations && (
                            <div className="text-xs text-slate-600 bg-purple-50/50 p-2.5 rounded-xl">
                              <strong className="text-purple-800">Recommandations : </strong>
                              {act.recommandations}
                            </div>
                          )}

                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                            <span>Intervenant : {act.responsableNom}</span>
                            <span>{act.etablissementNom}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'emploi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    Emploi du Temps Hebdomadaire
                  </h4>
                  <p className="text-xs text-slate-500">
                    Créneaux d'enseignement pour faciliter la programmation et la visite en classe.
                  </p>
                </div>

                {userRole !== 'consultation' && (
                  <button
                    onClick={() => onOpenEditTimetable(enseignant)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Modifier l'emploi du temps
                  </button>
                )}
              </div>

              {!enseignant.emploiDuTemps || enseignant.emploiDuTemps.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">
                    Aucun emploi du temps n'a encore été saisi pour cet enseignant.
                  </p>
                  {userRole !== 'consultation' && (
                    <button
                      onClick={() => onOpenEditTimetable(enseignant)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Saisir la grille hebdomadaire
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {daysOfWeek.map(jour => {
                    const slots = enseignant.emploiDuTemps?.filter(s => s.jour === jour) || [];
                    return (
                      <div key={jour} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="font-bold text-xs text-slate-900">{jour}</span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {slots.length} séance(s)
                          </span>
                        </div>

                        {slots.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic py-2">Aucun cours</p>
                        ) : (
                          <div className="space-y-1.5">
                            {slots.map((slot, sIdx) => (
                              <div key={sIdx} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                <div className="flex justify-between items-center text-emerald-800 font-bold font-mono">
                                  <span>{slot.heureDebut} - {slot.heureFin}</span>
                                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 rounded text-emerald-900">{slot.salle}</span>
                                </div>
                                <div className="text-slate-800 font-semibold mt-0.5">{slot.classe}</div>
                                <div className="text-[11px] text-slate-500">{slot.matiere}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
