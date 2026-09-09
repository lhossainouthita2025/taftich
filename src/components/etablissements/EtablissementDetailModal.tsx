import React, { useState } from 'react';
import { 
  X, 
  School, 
  MapPin, 
  Users, 
  FileCheck, 
  Eye, 
  Calendar, 
  Compass, 
  ExternalLink, 
  Printer, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail, 
  Plus, 
  ArrowRight,
  Award,
  Edit3
} from 'lucide-react';
import { Etablissement, Enseignant, Activity, Role } from '../../types';

interface EtablissementDetailModalProps {
  etablissement: Etablissement;
  enseignants: Enseignant[];
  activities: Activity[];
  userRole: Role;
  onClose: () => void;
  onOpenTeacherDetail: (enseignant: Enseignant) => void;
  onOpenNewActivityForSchool: (type: 'visite' | 'inspection' | 'rencontre', etab: Etablissement) => void;
  onOpenEditSchool?: (etablissement: Etablissement) => void;
}

export const EtablissementDetailModal: React.FC<EtablissementDetailModalProps> = ({
  etablissement,
  enseignants,
  activities,
  userRole,
  onClose,
  onOpenTeacherDetail,
  onOpenNewActivityForSchool,
  onOpenEditSchool
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'enseignants' | 'activites' | 'gps'>('profil');

  // Teachers in this school
  const schoolTeachers = enseignants.filter(
    e => e.etablissementId === etablissement.id || e.etablissementNom === etablissement.nomAr
  );
  const activeTeachers = schoolTeachers.filter(e => e.actif);
  const inactiveTeachers = schoolTeachers.filter(e => !e.actif);

  // Activities in this school
  const schoolActivities = activities.filter(
    a => a.etablissementId === etablissement.id || a.etablissementNom === etablissement.nomAr
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const inspections = schoolActivities.filter(a => a.type === 'inspection');
  const visites = schoolActivities.filter(a => a.type === 'visite');
  const rencontres = schoolActivities.filter(a => a.type === 'rencontre');
  const formations = schoolActivities.filter(a => a.type === 'formation');

  const today = new Date().toISOString().slice(0, 10);
  const upcomingActivities = schoolActivities.filter(a => a.date >= today);

  const googleMapsUrl = etablissement.latitude && etablissement.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${etablissement.latitude},${etablissement.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${etablissement.nomAr} ${etablissement.commune}`)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div 
        id="etablissement-detail-modal"
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center shadow-md">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">{etablissement.nomAr}</h3>
                {etablissement.estPionnier && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
                    رائدة
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {etablissement.nomFr} • Commune de {etablissement.commune}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userRole !== 'consultation' && onOpenEditSchool && (
              <button
                onClick={() => onOpenEditSchool(etablissement)}
                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Modifier les données de cet établissement"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Modifier</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer"
              title="Imprimer la fiche établissement"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('profil')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'profil' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Fiche Établissement
            </button>
            <button
              onClick={() => setActiveTab('enseignants')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'enseignants' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Enseignants ({schoolTeachers.length})
            </button>
            <button
              onClick={() => setActiveTab('activites')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'activites' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Historique des Activités ({schoolActivities.length})
            </button>
            <button
              onClick={() => setActiveTab('gps')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'gps' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Localisation & Accès
            </button>
          </div>

          {userRole !== 'consultation' && (
            <button
              onClick={() => onOpenNewActivityForSchool('visite', etablissement)}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Planifier Visite
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'profil' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block">Total Enseignants</span>
                  <span className="text-2xl font-bold text-slate-900 mt-1 block">{schoolTeachers.length}</span>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    {activeTeachers.length} actifs • {inactiveTeachers.length} inactifs
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-xs text-blue-700 font-semibold block">Inspections</span>
                  <span className="text-2xl font-bold text-blue-950 mt-1 block">{inspections.length}</span>
                  <span className="text-[11px] text-blue-600">Procès-verbaux rédigés</span>
                </div>

                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                  <span className="text-xs text-teal-700 font-semibold block">Visites de Suivi</span>
                  <span className="text-2xl font-bold text-teal-950 mt-1 block">{visites.length}</span>
                  <span className="text-[11px] text-teal-600">Accompagnements terrain</span>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <span className="text-xs text-purple-700 font-semibold block">Rencontres & Formations</span>
                  <span className="text-2xl font-bold text-purple-950 mt-1 block">{rencontres.length + formations.length}</span>
                  <span className="text-[11px] text-purple-600">Ateliers & coordination</span>
                </div>
              </div>

              {/* Administrative Information */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-100/70 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Identification & Cadre Institutionnel
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nom de l'établissement (Arabe) :</span>
                      <span className="font-bold text-slate-900">{etablissement.nomAr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nom en Français :</span>
                      <span className="font-medium text-slate-900">{etablissement.nomFr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Commune territoriale :</span>
                      <span className="font-medium text-slate-900">{etablissement.commune}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Type de structure :</span>
                      <span className="font-medium text-slate-900 capitalize">
                        {etablissement.type === 'college' ? 'Secondaire Collégial' : 'Secondaire Qualifiant'}
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
                      <span className="text-slate-500">Statut Établissement Pionnier :</span>
                      <span className={`font-bold ${etablissement.estPionnier ? 'text-amber-600' : 'text-slate-500'}`}>
                        {etablissement.estPionnier ? 'Oui (مؤسسة رائدة)' : 'Non (Établissement standard)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Coordonnées GPS :</span>
                      <span className="font-mono text-slate-700">
                        {etablissement.latitude && etablissement.longitude 
                          ? `${etablissement.latitude}, ${etablissement.longitude}`
                          : 'Non renseignées'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status of Last and Next Activities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Dernière Activité Réalisée
                  </span>
                  {schoolActivities.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 capitalize">
                          {schoolActivities[0].type} : {schoolActivities[0].objet}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{schoolActivities[0].date}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">Intervenant : {schoolActivities[0].responsableNom}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Aucune activité passée répertoriée.</p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-2">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                    Prochaine Échéance / Prévision
                  </span>
                  {upcomingActivities.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-teal-950 capitalize">
                          {upcomingActivities[0].type} : {upcomingActivities[0].objet}
                        </span>
                        <span className="text-xs text-teal-700 font-mono">{upcomingActivities[0].date}</span>
                      </div>
                      <p className="text-xs text-teal-800 mt-1">Intervenant : {upcomingActivities[0].responsableNom}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-teal-700/80 italic">Aucune échéance immédiate programmée.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'enseignants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Enseignants Affectés à cet Établissement
                </h4>
                <span className="text-xs text-slate-400 font-semibold">{schoolTeachers.length} enseignant(s)</span>
              </div>

              {schoolTeachers.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Aucun enseignant n'est affecté à cet établissement pour l'instant.
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Doti</th>
                        <th className="py-2.5 px-4">Enseignant</th>
                        <th className="py-2.5 px-4">Grade & Matière</th>
                        <th className="py-2.5 px-4 text-center">Dernière Note</th>
                        <th className="py-2.5 px-4 text-center">Statut</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schoolTeachers.map(ens => (
                        <tr key={ens.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{ens.doti}</td>
                          <td className="py-2.5 px-4">
                            <span className="font-bold text-slate-900 block">{ens.nom}</span>
                            {ens.nomFr && <span className="text-[10px] text-slate-400">{ens.nomFr}</span>}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="text-slate-700 block">{ens.grade}</span>
                            <span className="text-[10px] text-emerald-700 font-medium">{ens.matiere}</span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {typeof ens.derniereNote === 'number' ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                {ens.derniereNote} / 20 ({ens.derniereAnneeInspection || '-'})
                              </span>
                            ) : ens.derniereNote === 'vis' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
                                Visite
                              </span>
                            ) : (
                              <span className="text-rose-500 font-semibold text-[11px]">Non noté</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {ens.actif ? (
                              <span className="text-emerald-700 font-bold text-[10px]">Actif</span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Inactif</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => onOpenTeacherDetail(ens)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                            >
                              Fiche
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Activités Réalisées dans cet Établissement
                </h4>
                <span className="text-xs text-slate-400">{schoolActivities.length} intervention(s)</span>
              </div>

              {schoolActivities.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Aucune activité n'a encore été enregistrée pour cet établissement.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {schoolActivities.map(act => (
                    <div key={act.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            act.type === 'inspection' ? 'bg-blue-100 text-blue-800' :
                            act.type === 'visite' ? 'bg-teal-100 text-teal-800' :
                            act.type === 'formation' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {act.type}
                          </span>
                          <span className="font-bold text-slate-900">{act.objet}</span>
                        </div>
                        <span className="font-mono text-slate-500 font-semibold">{act.date}</span>
                      </div>
                      <p className="text-slate-600">{act.description}</p>
                      <div className="text-[11px] text-slate-400 pt-1 flex justify-between">
                        <span>Responsable : {act.responsableNom}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'gps' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Localisation Géographique & Itinéraire
                    </h4>
                    <p className="text-xs text-slate-500">
                      Coordonnées GPS pour guider les tournées d'inspection et estimer les temps de trajet.
                    </p>
                  </div>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ouvrir dans Google Maps
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">Latitude :</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {etablissement.latitude || 'Non configurée'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">Longitude :</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {etablissement.longitude || 'Non configurée'}
                    </span>
                  </div>
                </div>

                {/* Simulated Interactive Radar Preview */}
                <div className="h-48 rounded-xl bg-emerald-950 text-white flex flex-col items-center justify-center relative overflow-hidden border border-emerald-900 p-4 text-center">
                  <div className="absolute inset-0 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
                  <Compass className="w-10 h-10 text-emerald-400 mb-2 animate-pulse" />
                  <p className="text-xs font-bold text-emerald-200">{etablissement.nomAr}</p>
                  <p className="text-[11px] text-slate-400">{etablissement.commune} • Inzegane Aït Melloul</p>
                  <p className="text-[10px] text-emerald-400/80 mt-1 font-mono">
                    GPS: {etablissement.latitude || '30.3650'} N, {etablissement.longitude || '-9.4950'} W
                  </p>
                </div>
              </div>

              {/* QR Code Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-slate-700" />
                    Fiche Mobile & QR Code d'Accès
                  </h5>
                  <p className="text-xs text-slate-500 max-w-md">
                    Scannez pour accéder directement aux coordonnées GPS et à la liste des enseignants depuis votre smartphone lors de vos déplacements.
                  </p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center font-mono text-[10px] text-slate-500 shrink-0">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Direction Provinciale Inzegane - Aït Melloul</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
