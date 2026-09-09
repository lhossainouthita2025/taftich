import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { User } from '../../types';

interface ChangePasswordModalProps {
  user: User;
  isMandatory?: boolean;
  onSuccess: (updatedUser: User) => void;
  onCancel?: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  user,
  isMandatory = false,
  onSuccess,
  onCancel
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (newPassword === 'Abcd@1234') {
      setError('Le nouveau mot de passe doit être différent du mot de passe provisoire (Abcd@1234).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    const updatedUser: User = {
      ...user,
      password: newPassword,
      mustChangePassword: false
    };

    setSuccess(true);
    setTimeout(() => {
      onSuccess(updatedUser);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center gap-3 border-b border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isMandatory ? 'Changement Obligatoire du Mot de Passe' : 'Modifier le Mot de Passe'}
            </h3>
            <p className="text-xs text-slate-300">
              {isMandatory 
                ? 'Première connexion ou réinitialisation administrative' 
                : 'Mettez à jour vos identifiants de sécurité'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isMandatory && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Mot de passe provisoire détecté</span>
                <span>
                  Pour des raisons de sécurité, vous devez remplacer le mot de passe provisoire 
                  <span className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded mx-1 text-amber-800">Abcd@1234</span>
                  par un mot de passe personnel pour accéder à vos données pédagogiques.
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="font-medium">Mot de passe modifié avec succès ! Redirection en cours...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Compte professionnel
              </label>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 flex justify-between items-center">
                <span>{user.prenom} {user.nom}</span>
                <span className="font-mono text-slate-400">{user.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nouveau mot de passe personnel <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  disabled={success}
                  required
                  className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 focus:border-emerald-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Choisissez un mot de passe sécurisé différent de <span className="font-mono font-medium">Abcd@1234</span>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmer le nouveau mot de passe <span className="text-rose-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                disabled={success}
                required
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 focus:border-emerald-600 transition-colors"
              />
            </div>

            <div className="pt-3 flex gap-2">
              {!isMandatory && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={success}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
              )}
              <button
                type="submit"
                disabled={success}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                Valider le nouveau mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
