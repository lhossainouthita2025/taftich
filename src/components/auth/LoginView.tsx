import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  School, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  BookOpen, 
  Sparkles,
  Info
} from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storage';
import { Language, useI18n } from '../../i18n';

interface LoginViewProps {
  onLoginSuccess: (user: User, mustChangePassword: boolean) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { language, setLanguage, t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    {
      title: 'Admin Régional',
      name: 'M. lhossain Outhita',
      email: 'lhossain.outhita@taalim.ma',
      pass: 'Admin@1234',
      badge: 'Supervision Globale',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      scope: 'Toutes les directions & matières (Admin)',
      desc: 'Gestion des inspecteurs, réinitialisation des mots de passe & vue complète'
    },
    {
      title: 'Inspecteur Informatique (1 DP)',
      name: 'M. Mustapha El Amrani',
      email: 'mustapha.elamrani@taalim.ma',
      pass: 'Abcd@1234',
      badge: 'DP Inzegane • Info',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      scope: 'Inzegane Aït Melloul • المعلوميات',
      desc: 'Accès restreint aux établissements d’Inzegane et aux profs d’informatique'
    },
    {
      title: 'Inspecteur Multi-DP (2 Directions)',
      name: 'M. Ahmed Benali',
      email: 'ahmed.benali@taalim.ma',
      pass: 'Abcd@1234',
      badge: 'Multi-DP • Souss-Massa',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      scope: 'Inzegane Aït Melloul & Chtouka Aït Baha • المعلوميات',
      desc: 'Affectation à 2 directions provinciales dans la même académie régionale'
    },
    {
      title: 'Inspectrice Mathématiques (Agadir)',
      name: 'Mme Fatima Bennani',
      email: 'fatima.bennani@taalim.ma',
      pass: 'Abcd@1234',
      badge: 'DP Agadir • Maths',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      scope: 'Agadir Ida-Outanane • الرياضيات',
      desc: 'Accès exclusif aux établissements d’Agadir et profs de maths'
    },
    {
      title: 'Inspecteur Physique (Inzegane)',
      name: 'M. Rachid Tazi',
      email: 'rachid.tazi@taalim.ma',
      pass: 'Abcd@1234',
      badge: 'DP Inzegane • Physique',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      scope: 'Inzegane Aït Melloul • الفيزياء والكيمياء',
      desc: 'Établissements d’Inzegane filtrés sur la physique-chimie'
    }
  ];

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await StorageService.loginAsync(email, password);
    setIsLoading(false);
    if (result.success && result.user) onLoginSuccess(result.user, !!result.mustChangePassword);
    else setError(result.error || 'Erreur de connexion. Vérifiez vos identifiants.');
  };

  const handleSelectDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setIsLoading(true);

    const result = await StorageService.loginAsync(demoEmail, demoPass);
    setIsLoading(false);
    if (result.success && result.user) onLoginSuccess(result.user, !!result.mustChangePassword);
    else setError(result.error || 'Erreur lors de la connexion démo.');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-950/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm sm:text-base tracking-tight">
              Système de Suivi et d’Encadrement Pédagogique
            </h1>
            <p className="text-xs text-emerald-400">
              Ministère de l'Éducation Nationale, du Préscolaire et des Sports • Maroc
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t('secureSpace')}</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-700 p-1" title={t('language')}>
          {(['fr', 'ar', 'en'] as Language[]).map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setLanguage(option)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${language === option ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
              aria-label={option === 'fr' ? t('french') : option === 'ar' ? t('arabic') : t('english')}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-center justify-center">
        {/* Left Side: Auth Card */}
        <div className="w-full lg:w-[420px] bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('professionalEmail')} @taalim.ma</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t('loginTitle')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t('loginSubtitle')} <span className="text-slate-200 font-mono">prenom.nom@taalim.ma</span>
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-800/70 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('professionalEmail')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="prenom.nom@taalim.ma"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Le suffixe <span className="font-mono text-emerald-400">@taalim.ma</span> est complété automatiquement si omis.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {t('password')}
                </label>
                <span className="text-[11px] text-slate-400">
                  Initial : <span className="font-mono text-amber-400 font-bold">Abcd@1234</span>
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? <>يجب تغيير كلمة المرور المؤقتة <span className="font-mono text-amber-300 font-bold">Abcd@1234</span> عند أول تسجيل دخول. يمكن للإدارة إعادة تعيينها عند نسيانها.</>
                  : language === 'en'
                  ? <>The temporary password <span className="font-mono text-amber-300 font-bold">Abcd@1234</span> must be changed at first sign-in. An administrator can reset it if forgotten.</>
                  : <>Le mot de passe provisoire <span className="font-mono text-amber-300 font-bold">Abcd@1234</span> doit être modifié dès la première connexion. L'administrateur peut le réinitialiser en cas d'oubli.</>}
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? t('signingIn') : t('signIn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

     
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 px-6 py-3 text-center text-xs text-slate-500">
        Académie Régionale d’Éducation et de Formation Souss-Massa • Espace d’Inspection et d’Encadrement Pédagogique
      </footer>
    </div>
  );
};
