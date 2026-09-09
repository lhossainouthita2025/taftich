import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  Save, 
  Mail, 
  Phone, 
  Shield, 
  BookOpen, 
  Building2, 
  AlertCircle, 
  KeyRound, 
  Check, 
  CheckCircle2 
} from 'lucide-react';
import { User, Role } from '../../types';

interface InspecteurEditModalProps {
  initialData?: User | null;
  onSave: (user: User) => void;
  onClose: () => void;
}

const DIRECTIONS_SOUSS_MASSA = [
  'Inzegane Aït Melloul',
  'Agadir Ida-Outanane',
  'Chtouka Aït Baha',
  'Taroudannt',
  'Tiznit',
  'Tata'
];

const MATIERES_LIST = [
  'المعلوميات',
  'الرياضيات',
  'الفيزياء والكيمياء',
  'علوم الحياة والأرض',
  'اللغة العربية',
  'اللغة الفرنسية',
  'اللغة الإنجليزية',
  'الفلسفة',
  'التاريخ والجغرافيا',
  'التربية الإسلامية',
  'التربية البدنية والرياضية'
];

const MATIERE_LABELS: Record<string, string> = {
  'المعلوميات': 'Informatique',
  'الرياضيات': 'Mathématiques',
  'الفيزياء والكيمياء': 'Physique-Chimie',
  'علوم الحياة والأرض': 'Sciences de la Vie et de la Terre',
  'اللغة العربية': 'Arabe',
  'اللغة الفرنسية': 'Français',
  'اللغة الإنجليزية': 'Anglais',
  'الفلسفة': 'Philosophie',
  'التاريخ والجغرافيا': 'Histoire-Géographie',
  'التربية الإسلامية': 'Éducation islamique',
  'التربية البدنية والرياضية': 'Éducation physique et sportive',
  'Toutes les matières': 'Toutes les matières'
};

export const InspecteurEditModal: React.FC<InspecteurEditModalProps> = ({
  initialData,
  onSave,
  onClose
}) => {
  const [nom, setNom] = useState(initialData?.nom || '');
  const [prenom, setPrenom] = useState(initialData?.prenom || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [role, setRole] = useState<Role>(initialData?.role || 'inspecteur');
  const [academie, setAcademie] = useState(initialData?.academie || 'Souss-Massa');

  // Initial directions array
  const initialDirs = initialData?.directionsProvinciales && initialData.directionsProvinciales.length > 0
    ? initialData.directionsProvinciales
    : initialData?.direction ? [initialData.direction] : ['Inzegane Aït Melloul'];

  const [selectedDirections, setSelectedDirections] = useState<string[]>(initialDirs);
  const [customDirection, setCustomDirection] = useState('');
  
  const [matiere, setMatiere] = useState(initialData?.matiere || 'المعلوميات');
  const [telephone, setTelephone] = useState(initialData?.telephone || '+212 6 61 00 00 00');
  const [specialite, setSpecialite] = useState(
    initialData?.specialite || 'Inspecteur Pédagogique du Secondaire'
  );
  const [bureau, setBureau] = useState(initialData?.bureau || 'Bureau de l’Inspection Pédagogique');
  const [doti, setDoti] = useState(initialData?.doti || '');
  const [passwordReset, setPasswordReset] = useState(false);
  const [error, setError] = useState('');

  const toggleDirection = (dir: string) => {
    if (selectedDirections.includes(dir)) {
      if (selectedDirections.length === 1) {
        setError('L’inspecteur doit être affecté à au moins une direction provinciale.');
        return;
      }
      setSelectedDirections(selectedDirections.filter(d => d !== dir));
    } else {
      setSelectedDirections([...selectedDirections, dir]);
    }
    setError('');
  };

  const handleAddCustomDirection = () => {
    const trimmed = customDirection.trim();
    if (!trimmed) return;
    if (!selectedDirections.includes(trimmed)) {
      setSelectedDirections([...selectedDirections, trimmed]);
    }
    setCustomDirection('');
  };

  const handleResetPasswordToDefault = () => {
    setPasswordReset(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !email.trim()) {
      setError('Veuillez renseigner le nom, prénom et l’adresse email.');
      return;
    }

    if (selectedDirections.length === 0) {
      setError('Veuillez sélectionner au moins une direction provinciale d’affectation.');
      return;
    }

    // Ensure @taalim.ma
    let finalEmail = email.trim().toLowerCase();
    if (!finalEmail.includes('@')) {
      finalEmail = `${finalEmail}@taalim.ma`;
    }

    const initials = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
    const savedSpecialite = role === 'inspecteur'
      ? `Inspecteur Pédagogique - ${MATIERE_LABELS[matiere] || matiere.trim()}`
      : specialite.trim();

    const updatedUser: User = {
      id: initialData?.id || `usr-${Date.now()}`,
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: finalEmail,
      role,
      academie: academie.trim(),
      directionsProvinciales: selectedDirections,
      direction: selectedDirections.join(' & '),
      matiere: matiere.trim(),
      telephone: telephone.trim(),
      specialite: savedSpecialite,
      bureau: bureau.trim(),
      doti: doti.trim(),
      avatar: initials || 'IN',
      password: passwordReset ? 'Abcd@1234' : (initialData?.password || 'Abcd@1234'),
      mustChangePassword: passwordReset ? true : (initialData?.mustChangePassword ?? true)
    };

    onSave(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {initialData ? 'Modifier l’Inspecteur & ses Affectations' : 'Ajouter un Nouvel Inspecteur'}
              </h3>
              <p className="text-xs text-slate-400">Affectation multi-directions provinciales et discipline</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Identity */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-slate-100">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Identité & Coordonnées</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Prénom <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={prenom}
                  onChange={e => setPrenom(e.target.value)}
                  placeholder="Ex: Mustapha"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nom <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  placeholder="Ex: El Amrani"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Professionnel <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="prenom.nom@taalim.ma"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-mono"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-0.5">Format: prenom.nom@taalim.ma</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Téléphone
                </label>
                <input
                  type="text"
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                  placeholder="+212 6..."
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Rôle Système
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 bg-white"
                >
                  <option value="inspecteur">Inspecteur Pédagogique (Cloisonné sur ses DP & matière)</option>
                  <option value="admin">Administrateur (Supervision globale)</option>
                  <option value="consultation">Consultation (Lecture seule)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  N° Somme / DOTI
                </label>
                <input
                  type="text"
                  value={doti}
                  onChange={e => setDoti(e.target.value)}
                  placeholder="Ex: 1048293"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Scope & Affectation */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-slate-100">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Affectation Géographique & Discipline</span>
            </h4>

            {/* Academie & Discipline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Académie Régionale (AREF)
                </label>
                <input
                  type="text"
                  value={academie}
                  onChange={e => setAcademie(e.target.value)}
                  placeholder="Souss-Massa"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  Discipline / Matière Pédagogique <span className="text-rose-500">*</span>
                </label>
                <select
                  value={matiere}
                  onChange={e => setMatiere(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 bg-white font-semibold"
                >
                  {MATIERES_LIST.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="Toutes les matières">Toutes les matières (Admin)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  L'inspecteur n'aura accès qu'aux enseignants de cette matière.
                </p>
              </div>
            </div>

            {/* Directions Provinciales Checkboxes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">
                  Directions Provinciales affectées <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {selectedDirections.length} direction(s) sélectionnée(s)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Cochez une ou plusieurs directions provinciales au sein de la région. L'inspecteur pourra uniquement choisir et consulter les établissements de ces directions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                {DIRECTIONS_SOUSS_MASSA.map(dir => {
                  const isChecked = selectedDirections.includes(dir);
                  return (
                    <label 
                      key={dir}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDirection(dir)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>{dir}</span>
                    </label>
                  );
                })}
              </div>

              {/* Add custom direction */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={customDirection}
                  onChange={e => setCustomDirection(e.target.value)}
                  placeholder="Autre direction provinciale..."
                  className="flex-1 py-1.5 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomDirection}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Security & Password reset */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">Gestion du Mot de Passe</span>
              </div>
              {passwordReset ? (
                <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Sera réinitialisé à Abcd@1234
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResetPasswordToDefault}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Réinitialiser le mot de passe à Abcd@1234
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Mot de passe initial par défaut : <span className="font-mono font-bold text-slate-700">Abcd@1234</span>.
              L'inspecteur est invité à le changer lors de sa première connexion.
            </p>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Mettre à jour l’inspecteur' : 'Créer le compte inspecteur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
