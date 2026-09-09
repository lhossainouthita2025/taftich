import React, { useState, useEffect } from 'react';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { EnseignantsView } from './components/enseignants/EnseignantsView';
import { EnseignantDetailModal } from './components/enseignants/EnseignantDetailModal';
import { NewEnseignantModal } from './components/enseignants/NewEnseignantModal';
import { EmploiDuTempsModal } from './components/enseignants/EmploiDuTempsModal';
import { EtablissementsView } from './components/etablissements/EtablissementsView';
import { EtablissementDetailModal } from './components/etablissements/EtablissementDetailModal';
import { NewEtablissementModal } from './components/etablissements/NewEtablissementModal';
import { ActivitesView } from './components/activites/ActivitesView';
import { NewActivityModal } from './components/activites/NewActivityModal';
import { ActivityDetailModal } from './components/activites/ActivityDetailModal';
import { PlanificationView } from './components/planification/PlanificationView';
import { TourneesView } from './components/itineraires/TourneesView';
import { RapportsView } from './components/rapports/RapportsView';
import { ExcelImportModal } from './components/import/ExcelImportModal';
import { InspecteurEditModal } from './components/inspecteurs/InspecteurEditModal';
import { InspecteursManagementView } from './components/inspecteurs/InspecteursManagementView';
import { GestionAnneesScolaires } from './components/parametres/GestionAnneesScolaires';
import { AnneeScolaireModal } from './components/parametres/AnneeScolaireModal';
import { LoginView } from './components/auth/LoginView';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { StorageService } from './services/storage';
import { Enseignant, Etablissement, Activity, Commune, Role, TimetableSlot, NotificationItem, User, AnneeScolaire, ActivityType } from './types';
import { ShieldCheck, Building2, BookOpen, LogOut, KeyRound, ArrowRight } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavItemKey>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<Role>('admin');

  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [isMandatoryPasswordChange, setIsMandatoryPasswordChange] = useState<boolean>(false);

  // Core Data State
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [anneesScolaires, setAnneesScolaires] = useState<AnneeScolaire[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Modals State
  const [selectedTeacherDetail, setSelectedTeacherDetail] = useState<Enseignant | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Enseignant | null>(null);
  const [isNewTeacherModalOpen, setIsNewTeacherModalOpen] = useState(false);
  const [teacherForTimetable, setTeacherForTimetable] = useState<Enseignant | null>(null);

  const [selectedSchoolDetail, setSelectedSchoolDetail] = useState<Etablissement | null>(null);
  const [editingSchool, setEditingSchool] = useState<Etablissement | null>(null);
  const [isNewSchoolModalOpen, setIsNewSchoolModalOpen] = useState(false);

  const [selectedActivityDetail, setSelectedActivityDetail] = useState<Activity | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);
  const [activityTypeToCreate, setActivityTypeToCreate] = useState<ActivityType>('inspection');
  const [prefilledTeacherForAct, setPrefilledTeacherForAct] = useState<Enseignant | undefined>(undefined);
  const [prefilledSchoolForAct, setPrefilledSchoolForAct] = useState<Etablissement | undefined>(undefined);

  const [editingInspecteur, setEditingInspecteur] = useState<User | null>(null);
  const [isInspecteurModalOpen, setIsInspecteurModalOpen] = useState(false);

  const [editingAnneeScolaire, setEditingAnneeScolaire] = useState<AnneeScolaire | null>(null);
  const [isAnneeScolaireModalOpen, setIsAnneeScolaireModalOpen] = useState(false);

  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // Initial Load from Storage and Session Restore
  useEffect(() => {
    let mounted = true;
    StorageService.initializeStorage();
    const loadData = async () => {
      await StorageService.loadFromApi();
      if (!mounted) return;
      setEnseignants(StorageService.getEnseignants());
      setEtablissements(StorageService.getEtablissements());
      setActivities(StorageService.getActivities());
      setCommunes(StorageService.getCommunes());
      setNotifications(StorageService.getNotifications());
      const loadedUsers = StorageService.getUsers();
      setUsers(loadedUsers);
      setAnneesScolaires(StorageService.getAnneesScolaires());

      const session = StorageService.getAuthSession();
      if (session && session.user) {
        const activeUser = loadedUsers.find(u => u.id === session.user.id) || session.user;
        setCurrentUser(activeUser);
        setUserRole(activeUser.role);
        setIsAuthenticated(true);
        if (activeUser.mustChangePassword) {
          setShowChangePasswordModal(true);
          setIsMandatoryPasswordChange(true);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsDataLoaded(true);
    };
    void loadData();
    return () => { mounted = false; };
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (user: User, mustChange: boolean) => {
    setCurrentUser(user);
    setUserRole(user.role);
    setIsAuthenticated(true);
    if (mustChange || user.mustChangePassword) {
      setIsMandatoryPasswordChange(true);
      setShowChangePasswordModal(true);
    }
  };

  const handleLogout = () => {
    StorageService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handlePasswordChanged = (updatedUser: User) => {
    handleSaveUser(updatedUser);
    setShowChangePasswordModal(false);
    setIsMandatoryPasswordChange(false);
  };

  // Sync to Storage on changes
  const saveEnseignants = (newList: Enseignant[]) => {
    setEnseignants(newList);
    StorageService.saveEnseignants(newList);
    setNotifications(StorageService.getNotifications());
  };

  const saveEtablissements = (newList: Etablissement[]) => {
    setEtablissements(newList);
    StorageService.saveEtablissements(newList);
  };

  const saveActivities = (newList: Activity[]) => {
    setActivities(newList);
    StorageService.saveActivities(newList);
    setNotifications(StorageService.getNotifications());
  };

  // Inspecteurs & Utilisateurs Handlers
  const handleSaveUser = (user: User) => {
    StorageService.saveUser(user);
    const updatedUsers = StorageService.getUsers();
    setUsers(updatedUsers);
    if (currentUser?.id === user.id) {
      setCurrentUser(user);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur / profil ?")) {
      StorageService.deleteUser(userId);
      setUsers(StorageService.getUsers());
    }
  };

  // Années Scolaires Handlers
  const handleSaveAnneeScolaire = (annee: AnneeScolaire) => {
    StorageService.saveAnneeScolaire(annee);
    setAnneesScolaires(StorageService.getAnneesScolaires());
  };

  const handleSetActiveAnneeScolaire = (id: string) => {
    StorageService.setActiveAnneeScolaire(id);
    setAnneesScolaires(StorageService.getAnneesScolaires());
  };

  const handleDeleteAnneeScolaire = (id: string) => {
    StorageService.deleteAnneeScolaire(id);
    setAnneesScolaires(StorageService.getAnneesScolaires());
  };

  // Enseignants Handlers
  const handleSaveTeacher = async (teacher: Enseignant) => {
    const exists = enseignants.some(e => e.id === teacher.id);
    let updated: Enseignant[];
    if (exists) {
      updated = enseignants.map(e => e.id === teacher.id ? teacher : e);
    } else {
      updated = [teacher, ...enseignants];
    }
    saveEnseignants(updated);

    try {
      await StorageService.saveEnseignantToApi(teacher);
    } catch (error) {
      console.error('Erreur de sauvegarde MySQL de l’enseignant:', error);
    }

    if (selectedTeacherDetail?.id === teacher.id) {
      setSelectedTeacherDetail(teacher);
    }
  };

  const handleDeleteTeacher = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet enseignant ?")) {
      const updated = enseignants.filter(e => e.id !== id);
      saveEnseignants(updated);
    }
  };

  // Etablissements Handlers
  const handleSaveSchool = async (school: Etablissement) => {
    const exists = etablissements.some(e => e.id === school.id);
    let updated: Etablissement[];
    if (exists) {
      updated = etablissements.map(e => e.id === school.id ? school : e);
    } else {
      updated = [school, ...etablissements];
    }
    saveEtablissements(updated);
    try {
      await StorageService.saveEtablissementToApi(school);
    } catch (error) {
      console.error(error);
    }
    if (selectedSchoolDetail?.id === school.id) {
      setSelectedSchoolDetail(school);
    }
  };

  const handleDeleteSchool = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet établissement ?")) {
      const updated = etablissements.filter(e => e.id !== id);
      saveEtablissements(updated);
      try {
        await StorageService.deleteEtablissementFromApi(id);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Activities Handlers
  const handleSaveActivity = (activity: Activity, updatedTeacher?: Enseignant) => {
    const exists = activities.some(a => a.id === activity.id);
    let updatedActivities: Activity[];
    if (exists) {
      updatedActivities = activities.map(a => a.id === activity.id ? activity : a);
    } else {
      updatedActivities = [activity, ...activities];
    }
    saveActivities(updatedActivities);
    void StorageService.saveActivityToApi(activity).catch(error => console.error(error));

    if (selectedActivityDetail?.id === activity.id) {
      setSelectedActivityDetail(activity);
    }

    if (updatedTeacher) {
      handleSaveTeacher(updatedTeacher);
    }
  };

  const handleDeleteActivity = (id: string) => {
    if (window.confirm("Supprimer cette activité enregistrée ?")) {
      const updated = activities.filter(a => a.id !== id);
      saveActivities(updated);
      void StorageService.deleteActivityFromApi(id).catch(error => console.error(error));
    }
  };

  // Open New Activity Wizard
  const handleOpenNewActivity = (
    type: ActivityType,
    teacher?: Enseignant,
    school?: Etablissement
  ) => {
    setEditingActivity(null);
    setActivityTypeToCreate(type);
    setPrefilledTeacherForAct(teacher);
    setPrefilledSchoolForAct(school);
    setIsNewActivityModalOpen(true);
  };

  const handleOpenEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityTypeToCreate(activity.type);
    setPrefilledTeacherForAct(undefined);
    setPrefilledSchoolForAct(undefined);
    setIsNewActivityModalOpen(true);
  };

  // Excel Bulk Imports
  const handleImportEnseignants = (importedRows: Partial<Enseignant>[]) => {
    const updated = [...enseignants];
    importedRows.forEach(row => {
      if (!row.doti || !row.nom) return;
      const index = updated.findIndex(e => e.doti === row.doti);
      const newTeacher: Enseignant = {
        id: index >= 0 ? updated[index].id : `ens-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        doti: String(row.doti).trim(),
        nom: String(row.nom).trim(),
        nomFr: row.nomFr,
        commune: row.commune || 'إنزكان',
        etablissementId: row.etablissementId || 'etab-1',
        etablissementNom: row.etablissementNom || 'مؤسسة غير محددة',
        grade: row.grade || 'أستاذ التعليم الثانوي',
        matiere: row.matiere || 'المعلوميات',
        cycle: row.cycle || 'اعدادي',
        actif: row.actif !== undefined ? row.actif : true,
        derniereNote: row.derniereNote,
        derniereAnneeInspection: row.derniereAnneeInspection,
        telephone: row.telephone,
        email: row.email,
        emploiDuTemps: index >= 0 ? updated[index].emploiDuTemps : []
      };

      if (index >= 0) {
        updated[index] = { ...updated[index], ...newTeacher };
      } else {
        updated.push(newTeacher);
      }
    });

    saveEnseignants(updated);
  };

  const handleImportEtablissements = (importedRows: Partial<Etablissement>[]) => {
    const updated = [...etablissements];
    importedRows.forEach(row => {
      if (!row.nomAr) return;
      const index = updated.findIndex(e => e.nomAr === row.nomAr);
      const newSchool: Etablissement = {
        id: index >= 0 ? updated[index].id : `etab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        nomAr: String(row.nomAr).trim(),
        nomFr: row.nomFr || row.nomAr,
        commune: row.commune || 'إنزكان',
        communeFr: row.communeFr || row.commune || 'Inzegane',
        type: row.type || 'college',
        estPionnier: Boolean(row.estPionnier),
        directionProvinciale: row.directionProvinciale || 'Inzegane Aït Melloul',
        academie: row.academie || 'Souss-Massa',
        latitude: row.latitude,
        longitude: row.longitude,
        telephone: row.telephone,
        email: row.email
      };

      if (index >= 0) {
        updated[index] = { ...updated[index], ...newSchool };
      } else {
        updated.push(newSchool);
      }
    });

    saveEtablissements(updated);
  };

  const handleImportTimetables = (importedSlots: { doti: string; slot: TimetableSlot }[]) => {
    const updated = [...enseignants];
    importedSlots.forEach(({ doti, slot }) => {
      const ens = updated.find(e => e.doti === doti);
      if (ens) {
        ens.emploiDuTemps = [...(ens.emploiDuTemps || []), slot];
      }
    });
    saveEnseignants(updated);
  };

  // Reset database to default test data
  const handleResetDatabase = () => {
    if (window.confirm("Voulez-vous réinitialiser toutes les données avec le jeu de données par défaut d'Inzegane - Aït Melloul ?")) {
      StorageService.resetToDefaults();
      setEnseignants(StorageService.getEnseignants());
      setEtablissements(StorageService.getEtablissements());
      setActivities(StorageService.getActivities());
      setCommunes(StorageService.getCommunes());
      setNotifications(StorageService.getNotifications());
      setAnneesScolaires(StorageService.getAnneesScolaires());
    }
  };

  const handleSelectTab = (tab: NavItemKey) => {
    if ((tab === 'inspecteurs' || tab === 'parametres') && currentUser?.role !== 'admin') {
      setActiveTab('dashboard');
      return;
    }

    if (tab === 'import') {
      setIsExcelImportModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-300">Chargement de l'espace de suivi pédagogique...</p>
        </div>
      </div>
    );
  }

  // Multi-User Login Check
  if (!isAuthenticated || !currentUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Multi-Direction & Discipline Scoping based on current user
  const scopedEtablissements = StorageService.getScopedEtablissements(currentUser);
  const scopedEnseignants = StorageService.getScopedEnseignants(currentUser, scopedEtablissements);
  const scopedActivities = StorageService.getScopedActivities(currentUser);

  const urgentCount = scopedEnseignants.filter(e =>
    !e.derniereAnneeInspection ||
    e.derniereNote === 'vis' ||
    Boolean(e.promotionEchelon || e.promotionGrade) ||
    (new Date().getFullYear() - (e.derniereAnneeInspection || 0) >= 3)
  ).length;
  const activeAnneeScolaire = anneesScolaires.find(a => a.estActive) || anneesScolaires.find(a => a.id === '2026-2027') || anneesScolaires[0];

  const assignedDirections = currentUser.directionsProvinciales && currentUser.directionsProvinciales.length > 0
    ? currentUser.directionsProvinciales
    : (currentUser.direction ? [currentUser.direction] : ['Inzegane Aït Melloul']);
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col antialiased">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        currentTab={activeTab}
        userRole={userRole}
        currentUser={currentUser}
        allUsers={isAdmin ? users : []}
        onSelectUser={(u) => {
          setCurrentUser(u);
          setUserRole(u.role);
          StorageService.setAuthSession(u);
          if (u.mustChangePassword) {
            setIsMandatoryPasswordChange(true);
            setShowChangePasswordModal(true);
          }
        }}
        onRoleChange={setUserRole}
        onSwitchRole={setUserRole}
        onOpenEditProfile={isAdmin ? (usr) => {
          setEditingInspecteur(usr);
          setIsInspecteurModalOpen(true);
        } : undefined}
        onOpenChangePassword={() => {
          setIsMandatoryPasswordChange(false);
          setShowChangePasswordModal(true);
        }}
        onLogout={handleLogout}
        notifications={notifications}
        onOpenGlobalSearch={() => setActiveTab('enseignants')}
        onOpenNewInspection={() => handleOpenNewActivity('inspection')}
        onOpenNewVisite={() => handleOpenNewActivity('visite')}
        onOpenNewRencontre={() => handleOpenNewActivity('rencontre')}
        onOpenNewFormation={() => handleOpenNewActivity('formation')}
        onOpenNewActivityModal={(type) => {
          if (type === 'enseignant') {
            setEditingTeacher(null);
            setIsNewTeacherModalOpen(true);
          } else if (type === 'etablissement') {
            setEditingSchool(null);
            setIsNewSchoolModalOpen(true);
          } else {
            handleOpenNewActivity(type);
          }
        }}
        onOpenImportExcel={() => setIsExcelImportModalOpen(true)}
        onResetDatabase={handleResetDatabase}
        onSelectTab={handleSelectTab}
        activeAnneeScolaire={activeAnneeScolaire}
        anneesScolaires={anneesScolaires}
        onSelectAnneeScolaire={handleSetActiveAnneeScolaire}
        onOpenAddAnneeScolaire={() => {
          setEditingAnneeScolaire(null);
          setIsAnneeScolaireModalOpen(true);
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Collapsible Sidebar */}
        <Sidebar
          activeTab={activeTab}
          currentTab={activeTab}
          onSelectTab={handleSelectTab}
          isCollapsed={isSidebarCollapsed}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          userRole={userRole}
          urgentCount={urgentCount}
          stats={{
            enseignantsCount: scopedEnseignants.length,
            etablissementsCount: scopedEtablissements.length,
            inspectionsCount: scopedActivities.filter(a => a.type === 'inspection').length,
            urgentCount: urgentCount
          }}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Inspector Perimeter Information Banner */}
            {currentUser?.role === 'inspecteur' && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-emerald-950">
                        Périmètre Inspecteur Actif : {currentUser.prenom} {currentUser.nom}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 border border-emerald-300/60">
                        {currentUser.specialite || 'Inspecteur'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-emerald-800 flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        Directions affectées ({assignedDirections.length}) :
                        <span className="font-bold underline decoration-emerald-400">
                          {assignedDirections.join(' • ')}
                        </span>
                      </span>
                      <span className="text-emerald-400">•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        Discipline :
                        <span className="font-bold">{currentUser.matiere || 'Toutes'}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700/90 mt-1">
                      Conformément aux règles de l'académie, vous n'avez accès qu'aux établissements de vos directions ({scopedEtablissements.length} établissements) et aux enseignants de votre matière ({scopedEnseignants.length} enseignants).
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setIsMandatoryPasswordChange(false);
                      setShowChangePasswordModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    Mot de passe
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}

            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
              <DashboardView
                enseignants={scopedEnseignants}
                etablissements={scopedEtablissements}
                activities={scopedActivities}
                communes={communes}
                activeAnneeScolaire={activeAnneeScolaire}
                onSelectTab={handleSelectTab}
                onOpenTeacherDetail={setSelectedTeacherDetail}
                onOpenSchoolDetail={setSelectedSchoolDetail}
                onOpenNewActivity={handleOpenNewActivity}
              />
            )}

            {/* Enseignants View */}
            {activeTab === 'enseignants' && (
              <EnseignantsView
                enseignants={scopedEnseignants}
                etablissements={scopedEtablissements}
                communes={communes}
                userRole={userRole}
                onOpenTeacherDetail={setSelectedTeacherDetail}
                onOpenNewInspectionForTeacher={ens => handleOpenNewActivity('inspection', ens)}
                onOpenNewVisiteForTeacher={ens => handleOpenNewActivity('visite', ens)}
                onOpenEditTeacher={ens => { setEditingTeacher(ens); setIsNewTeacherModalOpen(true); }}
                onOpenNewTeacher={() => { setEditingTeacher(null); setIsNewTeacherModalOpen(true); }}
                onOpenTimetable={setTeacherForTimetable}
                onDeleteTeacher={handleDeleteTeacher}
              />
            )}

            {/* Établissements View */}
            {activeTab === 'etablissements' && (
              <EtablissementsView
                etablissements={scopedEtablissements}
                enseignants={scopedEnseignants}
                activities={scopedActivities}
                communes={communes}
                userRole={userRole}
                activeAnneeScolaireId={activeAnneeScolaire?.id}
                onOpenSchoolDetail={setSelectedSchoolDetail}
                onOpenNewSchool={() => { setEditingSchool(null); setIsNewSchoolModalOpen(true); }}
                onOpenEditSchool={etab => { setEditingSchool(etab); setIsNewSchoolModalOpen(true); }}
                onDeleteSchool={handleDeleteSchool}
              />
            )}

            {/* Activités / Inspections / Visites / Rencontres / Formations / Calendrier View */}
            {(activeTab === 'activites' || activeTab === 'inspections' || activeTab === 'visites' || activeTab === 'rencontres' || activeTab === 'formations' || activeTab === 'calendrier') && (
              <ActivitesView
                activities={scopedActivities}
                enseignants={scopedEnseignants}
                etablissements={scopedEtablissements}
                communes={communes}
                anneesScolaires={anneesScolaires}
                activeAnneeScolaireId={activeAnneeScolaire?.id}
                userRole={userRole}
                onOpenActivityDetail={setSelectedActivityDetail}
                onOpenNewActivity={handleOpenNewActivity}
                onOpenEditActivity={handleOpenEditActivity}
                onDeleteActivity={handleDeleteActivity}
              />
            )}

            {/* Planification View */}
            {activeTab === 'planification' && (
              <PlanificationView
                enseignants={scopedEnseignants}
                etablissements={scopedEtablissements}
                communes={communes}
                userRole={userRole}
                onOpenNewInspection={ens => handleOpenNewActivity('inspection', ens)}
                onOpenTeacherDetail={setSelectedTeacherDetail}
              />
            )}

            {/* Tournées & Itinéraires View */}
            {activeTab === 'itineraires' && (
              <TourneesView
                enseignants={scopedEnseignants}
                etablissements={scopedEtablissements}
                communes={communes}
                onOpenTeacherDetail={setSelectedTeacherDetail}
                onOpenSchoolDetail={setSelectedSchoolDetail}
                onOpenNewInspection={(ens, school) => handleOpenNewActivity('inspection', ens, school)}
              />
            )}

            {/* Rapports & Statistiques View */}
            {(activeTab === 'rapports' || activeTab === 'statistiques') && (
              <RapportsView
                enseignants={scopedEnseignants}
                etablissements={scopedEtablissements}
                activities={scopedActivities}
                communes={communes}
                anneesScolaires={anneesScolaires}
                activeAnneeScolaireId={activeAnneeScolaire?.id}
              />
            )}

            {/* Inspecteurs Management View (Admin View) */}
            {activeTab === 'inspecteurs' && isAdmin && (
              <InspecteursManagementView
                users={users}
                currentUserId={currentUser.id}
                onUpdateUser={handleSaveUser}
                onAddUser={() => {
                  setEditingInspecteur(null);
                  setIsInspecteurModalOpen(true);
                }}
                onEditUser={(u) => {
                  setEditingInspecteur(u);
                  setIsInspecteurModalOpen(true);
                }}
                onDeleteUser={handleDeleteUser}
                onSimulateInspectorView={(inspector) => {
                  setCurrentUser(inspector);
                  setUserRole(inspector.role);
                  StorageService.setAuthSession(inspector);
                  setActiveTab('dashboard');
                }}
              />
            )}

            {/* Paramètres & Profils View */}
            {activeTab === 'parametres' && isAdmin && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 max-w-3xl mx-auto space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">Paramètres & Profils</h2>
                  <p className="text-xs text-slate-500 mt-1">Configuration générale, gestion des données et synchronisation de l'application</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Profil Actif</p>
                      <p className="text-xs text-slate-500">Rôle en cours : <span className="font-bold text-emerald-600 uppercase">{userRole}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUserRole('admin')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${userRole === 'admin' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                      >
                        Admin
                      </button>
                      <button
                        onClick={() => setUserRole('inspecteur')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${userRole === 'inspecteur' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                      >
                        Inspecteur
                      </button>
                      <button
                        onClick={() => setUserRole('consultation')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${userRole === 'consultation' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                      >
                        Consultation
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Données Démonstration Inzegane - Aït Melloul</p>
                      <p className="text-xs text-slate-500">Réinitialiser le stockage local avec la base de test complète</p>
                    </div>
                    <button
                      onClick={handleResetDatabase}
                      className="px-4 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Réinitialiser la Base
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Importation de Données Massives</p>
                      <p className="text-xs text-slate-500">Importer des listes Excel d'enseignants, collèges ou emplois du temps</p>
                    </div>
                    <button
                      onClick={() => setIsExcelImportModalOpen(true)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      Ouvrir l'Importateur Excel
                    </button>
                  </div>
                </div>

                {/* Gestion des Inspecteurs et Utilisateurs */}
                <div className="pt-6 border-t border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Équipe des Inspecteurs & Utilisateurs</h3>
                      <p className="text-xs text-slate-500">Mise à jour des coordonnées, spécialités et rôles du corps d'inspection</p>
                    </div>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => {
                          setEditingInspecteur(null);
                          setIsInspecteurModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        + Nouvel Inspecteur
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {users.map(u => (
                      <div key={u.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-start justify-between gap-3 shadow-xs">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {u.avatar || `${u.prenom[0]}${u.nom[0]}`}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {u.prenom} {u.nom}
                              </p>
                              <span className="text-[10px] font-semibold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {u.role}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 truncate">{u.specialite || 'Inspecteur Pédagogique'}</p>
                          <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                          {u.telephone && <p className="text-[11px] text-slate-500">{u.telephone}</p>}
                          {u.doti && <p className="text-[10px] font-mono text-slate-400">DOTI: {u.doti}</p>}
                        </div>

                        <div className="flex flex-col gap-1 shrink-0">
                          {userRole !== 'consultation' && (
                            <button
                              onClick={() => {
                                setEditingInspecteur(u);
                                setIsInspecteurModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Modifier
                            </button>
                          )}
                          {userRole === 'admin' && users.length > 1 && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="px-2 py-0.5 rounded-lg text-rose-500 hover:bg-rose-50 text-[10px] font-semibold transition-colors cursor-pointer"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gestion des Années Scolaires */}
                <div className="pt-6 border-t border-slate-200">
                  <GestionAnneesScolaires
                    anneesScolaires={anneesScolaires}
                    activities={activities}
                    userRole={userRole}
                    onOpenAddModal={() => {
                      setEditingAnneeScolaire(null);
                      setIsAnneeScolaireModalOpen(true);
                    }}
                    onOpenEditModal={(annee) => {
                      setEditingAnneeScolaire(annee);
                      setIsAnneeScolaireModalOpen(true);
                    }}
                    onSetActive={handleSetActiveAnneeScolaire}
                    onDelete={handleDeleteAnneeScolaire}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Teacher Detail Modal */}
      {selectedTeacherDetail && (
        <EnseignantDetailModal
          enseignant={selectedTeacherDetail}
          etablissement={etablissements.find(e => e.id === selectedTeacherDetail.etablissementId)}
          activities={activities}
          userRole={userRole}
          onClose={() => setSelectedTeacherDetail(null)}
          onOpenNewActivity={(type, t) => {
            setSelectedTeacherDetail(null);
            handleOpenNewActivity(type, t);
          }}
          onOpenEditTimetable={t => {
            setSelectedTeacherDetail(null);
            setTeacherForTimetable(t);
          }}
          onOpenEditTeacher={ens => {
            setSelectedTeacherDetail(null);
            setEditingTeacher(ens);
            setIsNewTeacherModalOpen(true);
          }}
        />
      )}

      {/* 2. New/Edit Teacher Modal */}
      {isNewTeacherModalOpen && (
        <NewEnseignantModal
          initialData={editingTeacher || undefined}
          etablissements={scopedEtablissements}
          communes={communes}
          onSave={handleSaveTeacher}
          onClose={() => { setIsNewTeacherModalOpen(false); setEditingTeacher(null); }}
        />
      )}

      {/* 3. Timetable Modal */}
      {teacherForTimetable && (
        <EmploiDuTempsModal
          enseignant={teacherForTimetable}
          onSave={handleSaveTeacher}
          onClose={() => setTeacherForTimetable(null)}
        />
      )}

      {/* 4. School Detail Modal */}
      {selectedSchoolDetail && (
        <EtablissementDetailModal
          etablissement={selectedSchoolDetail}
          enseignants={scopedEnseignants}
          activities={scopedActivities}
          userRole={userRole}
          onClose={() => setSelectedSchoolDetail(null)}
          onOpenTeacherDetail={setSelectedTeacherDetail}
          onOpenNewActivityForSchool={(type, school) => {
            setSelectedSchoolDetail(null);
            handleOpenNewActivity(type as any, undefined, school);
          }}
          onOpenEditSchool={etab => {
            setSelectedSchoolDetail(null);
            setEditingSchool(etab);
            setIsNewSchoolModalOpen(true);
          }}
        />
      )}

      {/* 5. New/Edit School Modal */}
      {isNewSchoolModalOpen && (
        <NewEtablissementModal
          initialData={editingSchool || undefined}
          communes={communes}
          allowedDirections={assignedDirections}
          onSave={handleSaveSchool}
          onClose={() => { setIsNewSchoolModalOpen(false); setEditingSchool(null); }}
        />
      )}

      {/* 6. New/Edit Activity Modal */}
      {isNewActivityModalOpen && (
        <NewActivityModal
          initialData={editingActivity || undefined}
          initialType={activityTypeToCreate}
          prefilledTeacher={prefilledTeacherForAct}
          prefilledSchool={prefilledSchoolForAct}
          enseignants={scopedEnseignants}
          etablissements={scopedEtablissements}
          communes={communes}
          inspecteurs={isAdmin ? users : [currentUser]}
          onSave={handleSaveActivity}
          onClose={() => {
            setIsNewActivityModalOpen(false);
            setEditingActivity(null);
            setPrefilledTeacherForAct(undefined);
            setPrefilledSchoolForAct(undefined);
          }}
        />
      )}

      {/* 7. Activity / PV Official Detail Modal */}
      {selectedActivityDetail && (
        <ActivityDetailModal
          activity={selectedActivityDetail}
          enseignants={scopedEnseignants}
          etablissements={scopedEtablissements}
          onOpenEditActivity={act => {
            setSelectedActivityDetail(null);
            handleOpenEditActivity(act);
          }}
          onClose={() => setSelectedActivityDetail(null)}
        />
      )}

      {/* 8. Excel Import Modal */}
      {isExcelImportModalOpen && (
        <ExcelImportModal
          onImportEnseignants={handleImportEnseignants}
          onImportEtablissements={handleImportEtablissements}
          onImportTimetables={handleImportTimetables}
          onClose={() => setIsExcelImportModalOpen(false)}
        />
      )}

      {/* 9. Inspecteur / User Edit Modal */}
      {isInspecteurModalOpen && (
        <InspecteurEditModal
          initialData={editingInspecteur}
          onSave={u => {
            handleSaveUser(u);
            setIsInspecteurModalOpen(false);
            setEditingInspecteur(null);
          }}
          onClose={() => {
            setIsInspecteurModalOpen(false);
            setEditingInspecteur(null);
          }}
        />
      )}

      {/* 10. School Year Modal */}
      {isAnneeScolaireModalOpen && (
        <AnneeScolaireModal
          initialData={editingAnneeScolaire}
          existingYears={anneesScolaires}
          onSave={handleSaveAnneeScolaire}
          onClose={() => {
            setIsAnneeScolaireModalOpen(false);
            setEditingAnneeScolaire(null);
          }}
        />
      )}

      {/* 11. Change Password Modal (Mandatory upon first login or on demand) */}
      {showChangePasswordModal && currentUser && (
        <ChangePasswordModal
          user={currentUser}
          isMandatory={isMandatoryPasswordChange}
          onSuccess={handlePasswordChanged}
          onCancel={isMandatoryPasswordChange ? undefined : () => setShowChangePasswordModal(false)}
        />
      )}
    </div>
  );
}
