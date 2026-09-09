import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  KeyRound, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Building2, 
  BookOpen, 
  Search, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storage';

interface InspecteursManagementViewProps {
  users: User[];
  currentUserId: string;
  onUpdateUser: (user: User) => void;
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onSimulateInspectorView: (inspector: User) => void;
}

export const InspecteursManagementView: React.FC<InspecteursManagementViewProps> = ({
  users,
  currentUserId,
  onUpdateUser,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onSimulateInspectorView
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('toutes');
  const [selectedMatiere, setSelectedMatiere] = useState('toutes');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResetPassword = (user: User) => {
    const confirmReset = window.confirm(
      `Confirmez-vous la réinitialisation du mot de passe pour ${user.prenom} ${user.nom} ?\n\nLe mot de passe sera rétabli à "Abcd@1234" et l'inspecteur devra obligatoirement le modifier lors de sa prochaine connexion.`
    );
    if (!confirmReset) return;

    const res = StorageService.resetPassword(user.id);
    if (res.success && res.user) {
      onUpdateUser(res.user);
      setFeedbackMessage({
        type: 'success',
        text: `Mot de passe réinitialisé à "Abcd@1234" pour ${user.prenom} ${user.nom}.`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } else {
      setFeedbackMessage({
        type: 'error',
        text: res.error || 'Erreur lors de la réinitialisation du mot de passe.'
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Collect unique directions and matieres
  const allDirections = Array.from(
    new Set(
      users.flatMap(u => u.directionsProvinciales || (u.direction ? [u.direction] : []))
    )
  ).filter(Boolean);

  const allMatieres = Array.from(
    new Set(users.map(u => u.matiere).filter(Boolean))
  ) as string[];

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      `${u.prenom} ${u.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.doti || '').includes(searchTerm);

    const userDirs = u.directionsProvinciales || (u.direction ? [u.direction] : []);
    const matchesDirection = 
      selectedDirection === 'toutes' ||
      userDirs.some(d => d.toLowerCase().includes(selectedDirection.toLowerCase()));

    const matchesMatiere = 
      selectedMatiere === 'toutes' ||
      (u.matiere || '').toLowerCase().includes(selectedMatiere.toLowerCase());

    return matchesSearch && matchesDirection && matchesMatiere;
  });

  const totalInspecteurs = users.filter(u => u.role === 'inspecteur').length;
  const multiDpCount = users.filter(u => u.role === 'inspecteur' && (u.directionsProvinciales?.length || 0) > 1).length;
  const pendingResetCount = users.filter(u => u.mustChangePassword).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                Gestion des Inspecteurs & Contrôle des Accès
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Administrez les comptes des inspecteurs pédagogiques, affectez-les à une ou plusieurs directions provinciales 
              d’une même académie, assignez leur discipline et réinitialisez leurs mots de passe provisoires.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddUser}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Ajouter un Inspecteur</span>
            </button>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col">
            <span className="text-[11px] font-medium text-slate-500">Total Inspecteurs</span>
            <span className="text-xl font-bold text-slate-800 mt-0.5">{totalInspecteurs}</span>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 flex flex-col">
            <span className="text-[11px] font-medium text-blue-700">Multi-Directions (Multi-DP)</span>
            <span className="text-xl font-bold text-blue-800 mt-0.5">{multiDpCount}</span>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex flex-col">
            <span className="text-[11px] font-medium text-amber-700">Mots de passe provisoires</span>
            <span className="text-xl font-bold text-amber-800 mt-0.5">{pendingResetCount}</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 flex flex-col">
            <span className="text-[11px] font-medium text-emerald-700">Format d'accès</span>
            <span className="text-xs font-mono font-bold text-emerald-800 mt-1">@taalim.ma</span>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200 ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedbackMessage.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher nom, email ou DOTI..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDirection}
              onChange={e => setSelectedDirection(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-emerald-600"
            >
              <option value="toutes">Toutes les Directions</option>
              {allDirections.map(dir => (
                <option key={dir} value={dir}>{dir}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMatiere}
              onChange={e => setSelectedMatiere(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-emerald-600"
            >
              <option value="toutes">Toutes les Matières</option>
              {allMatieres.map(mat => (
                <option key={mat} value={mat}>{mat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Inspecteur / Encadrant</th>
                <th className="py-3 px-4">Email Professionnel</th>
                <th className="py-3 px-4">Directions Provinciales Affectées</th>
                <th className="py-3 px-4">Discipline</th>
                <th className="py-3 px-4">Sécurité & Mot de Passe</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucun inspecteur ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const dirs = user.directionsProvinciales && user.directionsProvinciales.length > 0
                    ? user.directionsProvinciales
                    : user.direction ? [user.direction] : ['Non affecté'];
                  const isMulti = dirs.length > 1;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Role */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            user.role === 'admin' 
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}>
                            {user.avatar || `${user.prenom[0]}${user.nom[0]}`}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.prenom} {user.nom}</span>
                              {user.id === currentUserId && (
                                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                                  Vous
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>DOTI: {user.doti || '—'}</span>
                              <span>•</span>
                              <span className="capitalize">{user.role}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {user.email}
                      </td>

                      {/* Directions Provinciales */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                          {dirs.map((dir, idx) => (
                            <span 
                              key={idx}
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                                isMulti 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {dir}
                            </span>
                          ))}
                          {isMulti && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded">
                              Multi-DP ({dirs.length})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Matiere */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 text-[11px] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                          {user.matiere || 'Toutes disciplines'}
                        </span>
                      </td>

                      {/* Password status */}
                      <td className="py-3 px-4">
                        {user.mustChangePassword ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Provisoire (Abcd@1234)</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Modifié & Sécurisé</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test view */}
                          {user.role === 'inspecteur' && (
                            <button
                              type="button"
                              onClick={() => onSimulateInspectorView(user)}
                              title="Tester la vue de cet inspecteur (établissements & professeurs autorisés)"
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Reset password button */}
                          <button
                            type="button"
                            onClick={() => handleResetPassword(user)}
                            title="Réinitialiser le mot de passe à Abcd@1234"
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-amber-200 hover:border-amber-300 transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => onEditUser(user)}
                            title="Modifier les affectations et le profil"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          {user.id !== currentUserId && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Supprimer l'accès pour ${user.prenom} ${user.nom} ?`)) {
                                  onDeleteUser(user.id);
                                }
                              }}
                              title="Supprimer l'inspecteur"
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Info notice about scoping */}
      <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-white">Règles de cloisonnement actif</p>
            <p className="text-[11px] text-slate-400">
              Chaque inspecteur connecté ne peut voir que les établissements des directions provinciales cochées dans son profil, et que les enseignants enseignant sa discipline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
