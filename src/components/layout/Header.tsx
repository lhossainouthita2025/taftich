import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  ChevronDown, 
  FileCheck, 
  Eye, 
  UsersRound, 
  GraduationCap, 
  School, 
  UserPlus, 
  Check, 
  AlertTriangle,
  Info,
  ShieldCheck,
  User as UserIcon,
  Compass,
  Edit2,
  Calendar,
  Settings,
  KeyRound,
  LogOut,
  Users,
  Building2,
  BookOpen
} from 'lucide-react';
import { User, Role, NotificationItem, AnneeScolaire, ActivityType } from '../../types';
import { NavItemKey } from './Sidebar';
import { Language, useI18n } from '../../i18n';

interface HeaderProps {
  currentTab?: NavItemKey;
  activeTab?: NavItemKey;
  currentUser?: User;
  userRole?: Role;
  onSwitchRole?: (role: Role) => void;
  onRoleChange?: (role: Role) => void;
  onOpenEditProfile?: (user: User) => void;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
  allUsers?: User[];
  onSelectUser?: (user: User) => void;
  notifications?: NotificationItem[];
  onOpenGlobalSearch?: () => void;
  onOpenNewActivityModal?: (type: ActivityType | 'etablissement' | 'enseignant') => void;
  onOpenNewInspection?: () => void;
  onOpenNewVisite?: () => void;
  onOpenNewRencontre?: () => void;
  onOpenNewFormation?: () => void;
  onOpenImportExcel?: () => void;
  onResetDatabase?: () => void;
  onSelectTab?: (tab: NavItemKey) => void;
  activeAnneeScolaire?: AnneeScolaire;
  anneesScolaires?: AnneeScolaire[];
  onSelectAnneeScolaire?: (id: string) => void;
  onOpenAddAnneeScolaire?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeTab,
  currentUser,
  userRole = 'admin',
  onSwitchRole,
  onRoleChange,
  onOpenEditProfile,
  onOpenChangePassword,
  onLogout,
  allUsers = [],
  onSelectUser,
  notifications = [],
  onOpenGlobalSearch,
  onOpenNewActivityModal,
  onOpenNewInspection,
  onOpenNewVisite,
  onOpenNewRencontre,
  onOpenNewFormation,
  onOpenImportExcel,
  onResetDatabase,
  onSelectTab,
  activeAnneeScolaire,
  anneesScolaires = [],
  onSelectAnneeScolaire,
  onOpenAddAnneeScolaire
}) => {
  const { language, setLanguage, t } = useI18n();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSchoolYearMenu, setShowSchoolYearMenu] = useState(false);

  const effectiveTab = currentTab || activeTab || 'dashboard';
  const effectiveRole = userRole || currentUser?.role || 'admin';
  const isAdmin = effectiveRole === 'admin' && currentUser?.role === 'admin';
  const effectiveUser: User = currentUser || {
    id: 'user-inspecteur-1',
    nom: 'Outhita',
    prenom: 'lhossain',
    role: effectiveRole,
    email: 'lhossain.outhita@taalim.ma',
    direction: 'Inzegane Aït Melloul',
    specialite: 'Informatique'
  };

  const safeNotifications = notifications || [];

  const handleRoleChange = (newRole: Role) => {
    if (onSwitchRole) onSwitchRole(newRole);
    if (onRoleChange) onRoleChange(newRole);
    setShowRoleMenu(false);
  };

  const handleCreateActivity = (type: ActivityType | 'etablissement' | 'enseignant') => {
    setShowQuickMenu(false);
    if (onOpenNewActivityModal) {
      onOpenNewActivityModal(type);
      return;
    }
    if (type === 'inspection' && onOpenNewInspection) onOpenNewInspection();
    else if (type === 'visite' && onOpenNewVisite) onOpenNewVisite();
    else if (type === 'rencontre' && onOpenNewRencontre) onOpenNewRencontre();
    else if (type === 'formation' && onOpenNewFormation) onOpenNewFormation();
    else if (type === 'enseignant' && onSelectTab) onSelectTab('enseignants');
    else if (type === 'etablissement' && onSelectTab) onSelectTab('etablissements');
  };

  const quickMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const schoolYearRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target as Node)) {
        setShowQuickMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
      if (schoolYearRef.current && !schoolYearRef.current.contains(event.target as Node)) {
        setShowSchoolYearMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = safeNotifications.filter(n => !n.lu).length;

  const tabTitles: Record<NavItemKey, { title: string; subtitle: string }> = {
    dashboard: { title: t('dashboardTitle'), subtitle: t('dashboardSubtitle') },
    enseignants: { title: t('teachersTitle'), subtitle: t('teachersSubtitle') },
    etablissements: { title: t('schoolsTitle'), subtitle: t('schoolsSubtitle') },
    inspections: { title: t('inspectionsTitle'), subtitle: t('inspectionsSubtitle') },
    visites: { title: t('visits'), subtitle: t('activitiesSubtitle') },
    rencontres: { title: t('meetings'), subtitle: t('activitiesSubtitle') },
    formations: { title: t('trainings'), subtitle: t('activitiesSubtitle') },
    activites: { title: t('activitiesTitle'), subtitle: t('activitiesSubtitle') },
    planification: { title: t('planning'), subtitle: t('activitiesSubtitle') },
    itineraires: { title: t('routes'), subtitle: t('activitiesSubtitle') },
    calendrier: { title: t('calendar'), subtitle: t('activitiesSubtitle') },
    statistiques: { title: t('statistics'), subtitle: t('activitiesSubtitle') },
    rapports: { title: t('reportsTitle'), subtitle: t('reportsSubtitle') },
    inspecteurs: { title: t('inspectorsTitle'), subtitle: t('inspectorsSubtitle') },
    import: { title: t('import'), subtitle: t('activitiesSubtitle') },
    parametres: { title: t('settingsTitle'), subtitle: t('settingsSubtitle') },
  };

  const currentInfo = tabTitles[effectiveTab] || { title: 'Suivi Pédagogique', subtitle: 'Gestion scolaire' };

  return (
    <header id="app-header" className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Page Title */}
      <div className="flex flex-col">
        <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {currentInfo.title}
        </h1>
        <p className="text-xs text-slate-500 hidden sm:block">
          {currentInfo.subtitle}
        </p>
      </div>

      {/* Action Center */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 p-1" title={t('language')}>
          {(['fr', 'ar', 'en'] as Language[]).map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setLanguage(option)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${language === option ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
              aria-label={option === 'fr' ? t('french') : option === 'ar' ? t('arabic') : t('english')}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
        {/* Année Scolaire Badge / Dropdown */}
        <div className="relative" ref={schoolYearRef}>
          <button
            id="header-school-year-btn"
            onClick={() => setShowSchoolYearMenu(!showSchoolYearMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Année scolaire officielle (du 1er septembre au 31 juillet)"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xl:inline text-emerald-700 font-medium">{t('schoolYear')} :</span>
            <span className="font-black text-emerald-950">{activeAnneeScolaire?.libelle || '2026/2027'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            <ChevronDown className="w-3 h-3 text-emerald-600 opacity-80" />
          </button>

          {showSchoolYearMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{t('schoolYear')}</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    MENPS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Période : du 1er septembre au 31 juillet
                </p>
              </div>

              <div className="py-1 max-h-56 overflow-y-auto divide-y divide-slate-50">
                {anneesScolaires.map(annee => (
                  <button
                    key={annee.id}
                    onClick={() => {
                      if (onSelectAnneeScolaire) onSelectAnneeScolaire(annee.id);
                      setShowSchoolYearMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      activeAnneeScolaire?.id === annee.id ? 'bg-emerald-50/60 font-bold text-emerald-900' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{annee.libelle}</span>
                        {annee.estActive && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-600 text-white rounded font-semibold">
                            Active
                          </span>
                        )}
                        {annee.statut === 'cloturee' && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded font-medium">
                            Clôturée
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block font-normal mt-0.5">
                        du {annee.dateDebut.substring(0, 4)}-09-01 au {annee.dateFin.substring(0, 4)}-07-31
                      </span>
                    </div>
                    {activeAnneeScolaire?.id === annee.id && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {effectiveRole === 'admin' && (
                <div className="pt-2 mt-1 border-t border-slate-100 px-3 flex flex-col gap-1.5">
                  {onOpenAddAnneeScolaire && (
                    <button
                      onClick={() => {
                        setShowSchoolYearMenu(false);
                        onOpenAddAnneeScolaire();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter une année scolaire</span>
                    </button>
                  )}
                  {onSelectTab && (
                    <button
                      onClick={() => {
                        setShowSchoolYearMenu(false);
                        onSelectTab('parametres');
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Gérer toutes les années</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Search Bar */}
        <button
          id="global-search-trigger"
          onClick={onOpenGlobalSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs md:text-sm border border-slate-200 transition-colors cursor-pointer group"
          title="Rechercher partout (Enseignant, Doti, Établissement...)"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          <span className="hidden md:inline">Rechercher...</span>
          <kbd className="hidden lg:inline text-[10px] bg-white border border-slate-300 rounded px-1 text-slate-400 font-mono">⌘K</kbd>
        </button>

        {/* Quick Action Button */}
        <div className="relative" ref={quickMenuRef}>
          <button
            id="quick-add-btn"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            disabled={effectiveUser.role === 'consultation'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all shadow-xs ${
              effectiveUser.role === 'consultation'
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvelle Action</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                {t('pedagogicalActions')}
              </div>
              <button
                id="btn-quick-new-inspection"
                onClick={() => handleCreateActivity('inspection')}
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors"
              >
                <FileCheck className="w-4 h-4 text-emerald-600" />
                {t('newInspection')}
              </button>
              <button
                id="btn-quick-new-visite"
                onClick={() => handleCreateActivity('visite')}
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors"
              >
                <Eye className="w-4 h-4 text-teal-600" />
                {t('newVisit')}
              </button>
              <button
                id="btn-quick-new-rencontre"
                onClick={() => handleCreateActivity('rencontre')}
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors"
              >
                <UsersRound className="w-4 h-4 text-blue-600" />
                {t('meetings')}
              </button>
              <button
                id="btn-quick-new-formation"
                onClick={() => handleCreateActivity('formation')}
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2.5 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-purple-600" />
                {t('newTraining')}
              </button>
              <button
                id="btn-quick-new-reunion"
                onClick={() => handleCreateActivity('reunion')}
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2.5 transition-colors"
              >
                <UsersRound className="w-4 h-4 text-amber-600" />
                {t('newMeeting')}
              </button>
              <button
                id="btn-quick-new-validation"
                onClick={() => handleCreateActivity('validation_fiches')}
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2.5 transition-colors"
              >
                <Check className="w-4 h-4 text-sky-600" />
                {t('fichesAndTimetables')}
              </button>
              <button
                id="btn-quick-new-examens"
                onClick={() => handleCreateActivity('suivi_examens')}
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2.5 transition-colors"
              >
                <FileCheck className="w-4 h-4 text-rose-600" />
                {t('examTracking')}
              </button>

              {effectiveUser.role === 'admin' && (
                <>
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-t border-b border-slate-100 mt-1">
                    {t('directories')}
                  </div>
                  <button
                    id="btn-quick-new-enseignant"
                    onClick={() => handleCreateActivity('enseignant')}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-slate-600" />
                    {t('addTeacher')}
                  </button>
                  <button
                    id="btn-quick-new-etablissement"
                    onClick={() => handleCreateActivity('etablissement')}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <School className="w-4 h-4 text-slate-600" />
                    {t('addSchool')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-trigger-btn"
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 relative transition-colors"
            title="Notifications et alertes"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{t('notifications')}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  {safeNotifications.length} actives
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {safeNotifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.lien && onSelectTab) onSelectTab(notif.lien as NavItemKey);
                      setShowNotifs(false);
                    }}
                    className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start ${
                      !notif.lu ? 'bg-slate-50/50' : ''
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      notif.type === 'danger' ? 'bg-rose-100 text-rose-600' :
                      notif.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                      notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {notif.type === 'danger' || notif.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">{notif.titre}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{notif.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scope Indicator Badge (Directions & Matière) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800 truncate max-w-[220px]" title={effectiveUser.directionsProvinciales?.join(', ') || effectiveUser.direction}>
              {effectiveUser.directionsProvinciales && effectiveUser.directionsProvinciales.length > 0
                ? effectiveUser.directionsProvinciales.join(' • ')
                : effectiveUser.direction || 'Souss-Massa'}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-emerald-800 font-bold">{effectiveUser.matiere || 'Informatique'}</span>
          </div>
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative pl-1 border-l border-slate-200" ref={roleRef}>
          <button
            id="role-switcher-btn"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {effectiveUser.avatar || effectiveUser.nom.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {effectiveUser.prenom} {effectiveUser.nom}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                {effectiveRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{effectiveUser.prenom} {effectiveUser.nom}</p>
                <p className="text-[11px] font-mono text-slate-500 truncate">{effectiveUser.email}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                    {effectiveUser.directionsProvinciales && effectiveUser.directionsProvinciales.length > 0
                      ? effectiveUser.directionsProvinciales.join(', ')
                      : effectiveUser.direction}
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
                    {effectiveUser.matiere}
                  </span>
                </div>
              </div>

              {/* Inspecteurs quick switch */}
              {isAdmin && allUsers.length > 0 && (
                <div className="py-1 border-b border-slate-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{t('switchAccount')}</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto">
                    {allUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          if (onSelectUser) onSelectUser(u);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${
                          u.id === effectiveUser.id ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate font-semibold">{u.prenom} {u.nom}</p>
                          <p className="text-[10px] text-slate-400 truncate font-mono">{u.email}</p>
                        </div>
                        {u.id === effectiveUser.id && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Role switch */}
              {isAdmin && <div className="py-1 border-b border-slate-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('testRole')}
                </div>
                <div className="grid grid-cols-3 gap-1 px-2">
                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`py-1 px-1.5 text-[11px] rounded font-semibold text-center ${
                      effectiveRole === 'admin' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => handleRoleChange('inspecteur')}
                    className={`py-1 px-1.5 text-[11px] rounded font-semibold text-center ${
                      effectiveRole === 'inspecteur' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    Inspecteur
                  </button>
                  <button
                    onClick={() => handleRoleChange('consultation')}
                    className={`py-1 px-1.5 text-[11px] rounded font-semibold text-center ${
                      effectiveRole === 'consultation' ? 'bg-blue-100 text-blue-900 font-bold' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    Lecture
                  </button>
                </div>
              </div>}

              {/* Password change & Actions */}
              <div className="pt-2 px-2 space-y-1">
                {onOpenChangePassword && (
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onOpenChangePassword();
                    }}
                    className="w-full py-1.5 px-3 rounded-lg hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('changePassword')}</span>
                  </button>
                )}

                {isAdmin && onOpenEditProfile && (
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onOpenEditProfile(effectiveUser);
                    }}
                    className="w-full py-1.5 px-3 rounded-lg hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('editProfile')}</span>
                  </button>
                )}

                {effectiveRole === 'admin' && onSelectTab && (
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onSelectTab('inspecteurs');
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Gestion des Inspecteurs</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onLogout();
                    }}
                    className="w-full py-1.5 px-3 rounded-lg hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t('logout')}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
