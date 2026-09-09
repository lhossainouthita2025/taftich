import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'fr' | 'ar' | 'en';

type TranslationKey =
  | 'language'
  | 'french'
  | 'arabic'
  | 'english'
  | 'dashboard'
  | 'planning'
  | 'routes'
  | 'calendar'
  | 'statistics'
  | 'teachers'
  | 'schools'
  | 'inspections'
  | 'visits'
  | 'meetings'
  | 'trainings'
  | 'activities'
  | 'reports'
  | 'import'
  | 'inspectors'
  | 'settings'
  | 'pilotage'
  | 'directories'
  | 'pedagogicalActions'
  | 'editionData'
  | 'dashboardTitle'
  | 'dashboardSubtitle'
  | 'teachersTitle'
  | 'teachersSubtitle'
  | 'schoolsTitle'
  | 'schoolsSubtitle'
  | 'inspectionsTitle'
  | 'inspectionsSubtitle'
  | 'activitiesTitle'
  | 'activitiesSubtitle'
  | 'reportsTitle'
  | 'reportsSubtitle'
  | 'inspectorsTitle'
  | 'inspectorsSubtitle'
  | 'settingsTitle'
  | 'settingsSubtitle'
  | 'search'
  | 'notifications'
  | 'active'
  | 'schoolYear'
  | 'logout'
  | 'changePassword'
  | 'editProfile'
  | 'switchAccount'
  | 'testRole'
  | 'globalScope'
  | 'loginTitle'
  | 'loginSubtitle'
  | 'professionalEmail'
  | 'password'
  | 'signIn'
  | 'signingIn'
  | 'secureSpace';
  
type ExtendedTranslationKey = TranslationKey |
  'portalTitle' | 'portalDescription' | 'urgentPriorities' | 'optimizeRoute' | 'followUpAlert' | 'needInspection' | 'neverScored' | 'oldInspection' | 'emergencyPlan' |
  'activeTeachers' | 'inactiveTeachers' | 'coveredCommunes' | 'officialScores' | 'fieldSupport' | 'formationsWorkshops' | 'actionsCompleted' | 'timetablesEntered' | 'completed' | 'timetablesMissing' | 'toPlan' | 'geolocatedSchools' | 'gpsCoordinates' | 'withoutGps' | 'completeSchoolFile' | 'teachersCount' | 'schoolsCount' | 'inspectionsCount' | 'visitsCount' | 'activitiesCount' | 'download' | 'newInspection' | 'newVisit' | 'newTraining' | 'newMeeting' | 'reunion' | 'fichesAndTimetables' | 'examTracking' | 'trainer' | 'trained' | 'commune' | 'territorialDistribution' | 'meetingType' | 'examOperation' | 'interventionDate' | 'time' | 'intervenantInspector' | 'community' | 'school' | 'activityObjective' | 'observationsAndSummary' | 'recommendationsAndGuidance' | 'trainingRole' | 'complementaryActivitiesTracked' | 'newPedagogicalActivity' | 'editActivity' | 'interventionType' | 'selectedFile' | 'pedagogicalReportAndEvaluation' | 'inspectedTeacher' | 'inspectionReason' | 'visitWithoutGrade' | 'generalPedagogicalAssessment' | 'observedStrengths' | 'areasToStrengthen' | 'fieldVisitTargeting' | 'visitedTeacherOptional' | 'visitSubject' | 'participants' | 'selected' | 'selectAll' | 'filterTeachersToInvite' | 'cancel' | 'updateActivity' | 'saveActivity' |
  'pioneerVisits' | 'nonPioneerVisits' | 'administrativeMeetings' | 'experimentalLessons' | 'missionHandovers' | 'pedagogicalResearch' | 'qualityMonitoring' | 'followUpCommittees' | 'supportCommittees' | 'nationalMeetings' | 'regionalMeetings' | 'provincialMeetings' | 'regionalCoordinationMeetings' | 'ghoCoordinationMeetings' | 'nationalPrograms' | 'topicProposals' |
  'filters' | 'allYears' | 'allCommunes' | 'allTypes' | 'allStatuses' | 'noActivity' | 'exportExcel' | 'addTeacher' | 'addSchool' | 'noResults' | 'annualReport' | 'officialInspections' | 'pedagogicalVisits' | 'trainingSeminars';

const translations: Record<Language, Partial<Record<ExtendedTranslationKey, string>>> = {
  fr: {
    language: 'Langue', french: 'Français', arabic: 'العربية', english: 'English',
    dashboard: 'Tableau de bord', planning: 'Planification & Priorités', routes: 'Tournées & Itinéraires', calendar: 'Calendrier des activités', statistics: 'Statistiques & Analyses',
    teachers: 'Corps Enseignant', schools: 'Établissements Scolaires', inspections: 'Inspections', visits: 'Visites d’accompagnement', meetings: 'Rencontres pédagogiques', trainings: 'Formations continues', activities: 'Historique des activités',
    reports: 'Rapports & PV officiels', import: 'Importateur Excel', inspectors: 'Gestion Inspecteurs', settings: 'Paramètres & Profils',
    pilotage: 'PILOTAGE', directories: 'RÉPERTOIRES SCOLAIRES', pedagogicalActions: 'ACTIONS PÉDAGOGIQUES', editionData: 'ÉDITION & DONNÉES',
    dashboardTitle: 'Tableau de Bord Pédagogique', dashboardSubtitle: 'Aperçu global, indicateurs clés et alertes de suivi',
    teachersTitle: 'Corps Enseignant', teachersSubtitle: 'Répertoire des enseignants, DOTI, grades et historique des notes', schoolsTitle: 'Établissements Scolaires', schoolsSubtitle: 'Cartographie des collèges, lycées et collèges pionniers',
    inspectionsTitle: 'Inspections Pédagogiques', inspectionsSubtitle: 'Enregistrement, notation, grilles d’appréciation et rapports', activitiesTitle: 'Registre Général des Activités', activitiesSubtitle: 'Traçabilité exhaustive de toutes les interventions', reportsTitle: 'Rapports & Procès-Verbaux', reportsSubtitle: 'Génération de fiches individuelles, synthèses et bilans officiels', inspectorsTitle: 'Corps d’Inspection & Utilisateurs', inspectorsSubtitle: 'Gestion des comptes, affectations et disciplines', settingsTitle: 'Configuration & Paramètres', settingsSubtitle: 'Gestion des rôles, sauvegardes et préférences de l’application',
    search: 'Rechercher...', notifications: 'Alertes & Notifications', active: 'Active', schoolYear: 'Année scolaire', logout: 'Déconnexion', changePassword: 'Modifier le mot de passe', editProfile: 'Modifier mon profil', switchAccount: 'Basculer vers un autre compte', testRole: 'Rôle de test', globalScope: 'Toutes les directions & matières',
    loginTitle: 'Connexion Inspecteur & Encadrant', loginSubtitle: 'Connectez-vous avec votre adresse institutionnelle', professionalEmail: 'Email professionnel', password: 'Mot de passe', signIn: 'Se connecter', signingIn: 'Connexion...', secureSpace: 'Espace multi-utilisateurs sécurisé',
    portalTitle: 'Portail de Suivi Pédagogique & Inspection', portalDescription: 'Supervision des enseignants répartis sur les établissements scolaires. Visualisez les visites, priorisez les inspections et générez les procès-verbaux.', urgentPriorities: 'Priorités urgentes', optimizeRoute: 'Optimiser une tournée', followUpAlert: 'Alerte de suivi pédagogique', needInspection: 'enseignants nécessitent une inspection', neverScored: "n'ont jamais été notés ou n'ont reçu qu'une visite", oldInspection: 'ont une inspection datant de plus de 3 ans', emergencyPlan: "Consulter le plan d'urgence", activeTeachers: 'actifs', inactiveTeachers: 'inactifs', coveredCommunes: 'communes couvertes', officialScores: 'Notations officielles', fieldSupport: 'Accompagnement terrain', formationsWorkshops: 'Formations & Ateliers', actionsCompleted: 'Actions réalisées', timetablesEntered: 'Emplois du temps saisis', completed: 'complétés', timetablesMissing: 'Emplois non saisis', toPlan: 'À renseigner pour planification', geolocatedSchools: 'Établissements géolocalisés', gpsCoordinates: 'avec coordonnées GPS', withoutGps: 'Sans coordonnées GPS', completeSchoolFile: 'Compléter la fiche établissement', teachersCount: 'Enseignants', schoolsCount: 'Établissements', inspectionsCount: 'Inspections', visitsCount: 'Visites terrain', activitiesCount: 'Activités cette année', download: 'Télécharger', newInspection: 'Nouvelle inspection', newVisit: 'Nouvelle visite', newTraining: 'Nouvelle formation', newMeeting: 'Nouvelle réunion', reunion: 'Réunion', fichesAndTimetables: 'Fiches & emplois', examTracking: 'Suivi examens', trainer: 'Formateur', trained: 'Formé', commune: 'Commune', territorialDistribution: 'Répartition territoriale', meetingType: 'Type de réunion', examOperation: 'Type d’opération', interventionDate: 'Date d’intervention', time: 'Heure', intervenantInspector: 'Intervenant / Inspecteur', community: 'Commune', school: 'Établissement', activityObjective: 'Objet de l’activité', observationsAndSummary: 'Observations & synthèse', recommendationsAndGuidance: 'Recommandations & orientations', trainingRole: 'Rôle de formation', complementaryActivitiesTracked: 'Activités complémentaires', newPedagogicalActivity: 'Nouvelle activité pédagogique', editActivity: 'Modifier l’activité', interventionType: 'Type d’intervention', selectedFile: 'Fichier sélectionné', pedagogicalReportAndEvaluation: 'Rapport pédagogique & évaluation', inspectedTeacher: 'Enseignant inspecté', inspectionReason: 'Motif d’inspection', visitWithoutGrade: 'Visite sans note', generalPedagogicalAssessment: 'Appréciation générale', observedStrengths: 'Points forts', areasToStrengthen: 'Points à améliorer', fieldVisitTargeting: 'Ciblage de la visite terrain', visitedTeacherOptional: 'Enseignant visité (facultatif)', visitSubject: 'Objet de la visite', participants: 'Participants', selected: 'sélectionnés', selectAll: 'Tout sélectionner', filterTeachersToInvite: 'Filtrer les enseignants à inviter', cancel: 'Annuler', updateActivity: 'Mettre à jour', saveActivity: 'Enregistrer', pioneerVisits: 'Visites pionnières', nonPioneerVisits: 'Visites non pionnières', administrativeMeetings: 'Rencontres avec les cadres administratifs', experimentalLessons: 'Cours expérimentaux', missionHandovers: 'Lettres / opérations de remise de missions', pedagogicalResearch: 'Recherche pédagogique & productions', qualityMonitoring: 'Suivi qualité / MDA / MDAUL / correction / plaintes', followUpCommittees: 'Comités de suivi', supportCommittees: 'Comités de soutien', nationalMeetings: 'Réunions / manifestations nationales', regionalMeetings: 'Réunions / manifestations régionales', provincialMeetings: 'Réunions / manifestations provinciales', regionalCoordinationMeetings: 'Réunions de coordination régionale', ghoCoordinationMeetings: 'Réunions de coordination des coordonnations GHO', nationalPrograms: 'Programmes et missions nationales', topicProposals: 'Propositions / préparation des sujets', filters: 'Filtres', allYears: 'Toutes les années', allCommunes: 'Toutes les communes', allTypes: 'Tous les types', allStatuses: 'Tous les statuts', noActivity: 'Aucune activité enregistrée ne correspond à votre filtre.', exportExcel: 'Exporter vers Excel', addTeacher: 'Inscrire un nouvel enseignant', addSchool: 'Inscrire un établissement', noResults: 'Aucun résultat', annualReport: 'Bilan annuel', officialInspections: 'Inspections officielles', pedagogicalVisits: 'Visites pédagogiques', trainingSeminars: 'Formations & séminaires'
  },
  ar: {
    language: 'اللغة', french: 'Français', arabic: 'العربية', english: 'English',
    dashboard: 'لوحة القيادة', planning: 'التخطيط والأولويات', routes: 'الجولات والمسارات', calendar: 'تقويم الأنشطة', statistics: 'الإحصائيات والتحليلات',
    teachers: 'هيئة التدريس', schools: 'المؤسسات التعليمية', inspections: 'التفتيشات', visits: 'زيارات المواكبة', meetings: 'اللقاءات التربوية', trainings: 'التكوينات المستمرة', activities: 'سجل الأنشطة',
    reports: 'التقارير والمحاضر الرسمية', import: 'استيراد Excel', inspectors: 'تدبير المفتشين', settings: 'الإعدادات والملفات الشخصية',
    pilotage: 'القيادة', directories: 'المؤسسات التعليمية', pedagogicalActions: 'الإجراءات التربوية', editionData: 'التحرير والبيانات',
    dashboardTitle: 'لوحة القيادة التربوية', dashboardSubtitle: 'نظرة عامة ومؤشرات أساسية وتنبيهات التتبع', teachersTitle: 'هيئة التدريس', teachersSubtitle: 'دليل المدرسين والدرجات وسجل النقط', schoolsTitle: 'المؤسسات التعليمية', schoolsSubtitle: 'خريطة المؤسسات التعليمية',
    inspectionsTitle: 'التفتيشات التربوية', inspectionsSubtitle: 'التسجيل والتنقيط والتقارير', activitiesTitle: 'السجل العام للأنشطة', activitiesSubtitle: 'التتبع الكامل لجميع التدخلات', reportsTitle: 'التقارير والمحاضر', reportsSubtitle: 'إنشاء الملفات الفردية والحصائل الرسمية', inspectorsTitle: 'هيئة التفتيش والمستخدمون', inspectorsSubtitle: 'تدبير الحسابات والتخصصات', settingsTitle: 'الإعدادات والملفات الشخصية', settingsSubtitle: 'تدبير الأدوار والنسخ الاحتياطية وتفضيلات التطبيق',
    search: 'بحث...', notifications: 'التنبيهات والإشعارات', active: 'نشطة', schoolYear: 'السنة الدراسية', logout: 'تسجيل الخروج', changePassword: 'تغيير كلمة المرور', editProfile: 'تعديل ملفي الشخصي', switchAccount: 'التبديل إلى حساب آخر', testRole: 'دور الاختبار', globalScope: 'جميع المديريات والمواد',
    loginTitle: 'تسجيل دخول المفتش والمؤطر', loginSubtitle: 'سجل الدخول باستعمال بريدك الإلكتروني المهني', professionalEmail: 'البريد الإلكتروني المهني', password: 'كلمة المرور', signIn: 'تسجيل الدخول', signingIn: 'جار تسجيل الدخول...', secureSpace: 'فضاء آمن متعدد المستخدمين',
    portalTitle: 'بوابة التتبع والتفتيش التربوي', portalDescription: 'تتبع المدرسين بالمؤسسات التعليمية. اطلع على الزيارات وحدد أولويات التفتيش وأنشئ المحاضر الرسمية.', urgentPriorities: 'أولويات عاجلة', optimizeRoute: 'تحسين جولة', followUpAlert: 'تنبيه التتبع التربوي', needInspection: 'مدرسين يحتاجون إلى التفتيش', neverScored: 'لم يتم تنقيطهم أو استفادوا من زيارة فقط', oldInspection: 'لديهم تفتيش يعود لأكثر من ثلاث سنوات', emergencyPlan: 'الاطلاع على خطة الطوارئ', activeTeachers: 'نشطون', inactiveTeachers: 'غير نشطين', coveredCommunes: 'جماعات مغطاة', officialScores: 'تنقيطات رسمية', fieldSupport: 'مواكبة ميدانية', formationsWorkshops: 'التكوينات والورشات', actionsCompleted: 'إجراءات منجزة', timetablesEntered: 'جداول زمنية مدخلة', completed: 'مكتملة', timetablesMissing: 'جداول زمنية غير مدخلة', toPlan: 'تحتاج إلى إدخال للتخطيط', geolocatedSchools: 'مؤسسات محددة الموقع', gpsCoordinates: 'بإحداثيات GPS', withoutGps: 'بدون إحداثيات GPS', completeSchoolFile: 'استكمال ملف المؤسسة', teachersCount: 'المدرسون', schoolsCount: 'المؤسسات', inspectionsCount: 'التفتيشات', visitsCount: 'الزيارات الميدانية', activitiesCount: 'أنشطة هذه السنة', download: 'تحميل', newInspection: 'تفتيش جديد', newVisit: 'زيارة جديدة', newTraining: 'تكوين جديد', newMeeting: 'لقاء جديد', reunion: 'اللقاء', fichesAndTimetables: 'الأوراق وجدول الحصص', examTracking: 'متابعة الامتحانات', trainer: 'مدرب', trained: 'متدرب', commune: 'الجماعة', territorialDistribution: 'التوزيع الترابي', meetingType: 'نوع اللقاء', examOperation: 'نوع العملية', interventionDate: 'تاريخ التدخل', time: 'الوقت', intervenantInspector: 'المتدخل / المفتش', community: 'الجماعة', school: 'المؤسسة', activityObjective: 'موضوع النشاط', observationsAndSummary: 'الملاحظات والتلخيص', recommendationsAndGuidance: 'التوصيات والتوجيهات', trainingRole: 'دور التدريب', complementaryActivitiesTracked: 'الأنشطة التكميلية', newPedagogicalActivity: 'نشاط تربوي جديد', editActivity: 'تعديل النشاط', interventionType: 'نوع التدخل', selectedFile: 'ملف محدد', pedagogicalReportAndEvaluation: 'التقرير التربوي والتقييم', inspectedTeacher: 'الأستاذ المفتش عليه', inspectionReason: 'سبب التفتيش', visitWithoutGrade: 'زيارة بدون درجة', generalPedagogicalAssessment: 'التقييم العام', observedStrengths: 'نقاط القوة', areasToStrengthen: 'نقاط التحسين', fieldVisitTargeting: 'استهداف الزيارة الميدانية', visitedTeacherOptional: 'الأستاذ المزار (اختياري)', visitSubject: 'موضوع الزيارة', participants: 'المشاركون', selected: 'محدد', selectAll: 'تحديد الكل', filterTeachersToInvite: 'تصفية المدرسين للدعوة', cancel: 'إلغاء', updateActivity: 'تحديث', saveActivity: 'حفظ', pioneerVisits: 'زيارات مؤسسات الريادة', nonPioneerVisits: 'زيارات مؤسسات غير الريادة', administrativeMeetings: 'لقاءات مع الأطر الإدارية', experimentalLessons: 'الدروس التجريبية', missionHandovers: 'عمليات تسليم المهام', pedagogicalResearch: 'البحث التربوي والمنتجات', qualityMonitoring: 'المداومة / المداولات / مراقبة الجودة / الاشراف على التصحيح / البث في الشكايات', followUpCommittees: 'لجان المتابعة', supportCommittees: 'لجان الدعم', nationalMeetings: 'الاجتماعات/التظاهرات على المستوى الوطني', regionalMeetings: 'الاجتماعات/التظاهرات على المستوى الجهوي', provincialMeetings: 'الاجتماعات/التظاهرات على المستوى الإقليمي', regionalCoordinationMeetings: 'اجتماعات التنسيق الإقليمي', ghoCoordinationMeetings: 'اجتماعات المنسقيات الجهوية / المجلس الجهوي لتنسيق التفتيش', nationalPrograms: 'البرامج والمهام الوطنية', topicProposals: 'اقتراح وإعداد المواضيع', filters: 'المرشحات', allYears: 'كل السنوات', allCommunes: 'كل الجماعات', allTypes: 'كل الأنواع', allStatuses: 'كل الحالات', noActivity: 'لا توجد أنشطة مطابقة للمرشح.', exportExcel: 'تصدير إلى Excel', addTeacher: 'تسجيل مدرس جديد', addSchool: 'تسجيل مؤسسة', noResults: 'لا توجد نتائج', annualReport: 'الحصيلة السنوية', officialInspections: 'التفتيشات الرسمية', pedagogicalVisits: 'الزيارات التربوية', trainingSeminars: 'التكوينات والندوات'
  },
  en: {
    language: 'Language', french: 'Français', arabic: 'العربية', english: 'English',
    dashboard: 'Dashboard', planning: 'Planning & Priorities', routes: 'Tours & Routes', calendar: 'Activity Calendar', statistics: 'Statistics & Analytics',
    teachers: 'Teaching Staff', schools: 'Schools', inspections: 'Inspections', visits: 'Support Visits', meetings: 'Pedagogical Meetings', trainings: 'Continuous Training', activities: 'Activity History',
    reports: 'Reports & Official Minutes', import: 'Excel Importer', inspectors: 'Inspector Management', settings: 'Settings & Profiles',
    pilotage: 'PILOTING', directories: 'SCHOOL DIRECTORIES', pedagogicalActions: 'PEDAGOGICAL ACTIONS', editionData: 'REPORTING & DATA',
    dashboardTitle: 'Pedagogical Dashboard', dashboardSubtitle: 'Overview, key indicators and monitoring alerts', teachersTitle: 'Teaching Staff', teachersSubtitle: 'Teacher directory, grades and assessment history', schoolsTitle: 'Schools', schoolsSubtitle: 'Map of colleges, high schools and pioneer schools',
    inspectionsTitle: 'Pedagogical Inspections', inspectionsSubtitle: 'Recording, grading, assessment grids and reports', activitiesTitle: 'General Activity Register', activitiesSubtitle: 'Complete traceability of all interventions', reportsTitle: 'Reports & Official Minutes', reportsSubtitle: 'Individual records, summaries and official reports', inspectorsTitle: 'Inspection Corps & Users', inspectorsSubtitle: 'Account, assignment and subject management', settingsTitle: 'Configuration & Settings', settingsSubtitle: 'Roles, backups and application preferences',
    search: 'Search...', notifications: 'Alerts & Notifications', active: 'Active', schoolYear: 'School year', logout: 'Log out', changePassword: 'Change password', editProfile: 'Edit my profile', switchAccount: 'Switch to another account', testRole: 'Test role', globalScope: 'All districts & subjects',
    loginTitle: 'Inspector & Supervisor Login', loginSubtitle: 'Sign in with your institutional email address', professionalEmail: 'Professional email', password: 'Password', signIn: 'Sign in', signingIn: 'Signing in...', secureSpace: 'Secure multi-user space',
    portalTitle: 'Pedagogical Monitoring & Inspection Portal', portalDescription: 'Monitor teachers across schools. Review visits, prioritize inspections and generate official minutes.', urgentPriorities: 'Urgent priorities', optimizeRoute: 'Optimize a route', followUpAlert: 'Pedagogical monitoring alert', needInspection: 'teachers need an inspection', neverScored: 'have never been graded or only received a visit', oldInspection: 'have an inspection older than three years', emergencyPlan: 'Open emergency plan', activeTeachers: 'active', inactiveTeachers: 'inactive', coveredCommunes: 'communes covered', officialScores: 'Official scores', fieldSupport: 'Field support', formationsWorkshops: 'Training & workshops', actionsCompleted: 'Completed actions', timetablesEntered: 'Timetables entered', completed: 'completed', timetablesMissing: 'Timetables missing', toPlan: 'To enter for planning', geolocatedSchools: 'Geolocated schools', gpsCoordinates: 'with GPS coordinates', withoutGps: 'Without GPS coordinates', completeSchoolFile: 'Complete school record', teachersCount: 'Teachers', schoolsCount: 'Schools', inspectionsCount: 'Inspections', visitsCount: 'Field visits', activitiesCount: 'Activities this year', download: 'Download', newInspection: 'New inspection', newVisit: 'New visit', newTraining: 'New training', newMeeting: 'New meeting', reunion: 'Meeting', fichesAndTimetables: 'Forms & timetables', examTracking: 'Exam follow-up', trainer: 'Trainer', trained: 'Trainee', commune: 'Commune', territorialDistribution: 'Territorial distribution', meetingType: 'Meeting type', examOperation: 'Exam operation', interventionDate: 'Intervention date', time: 'Time', intervenantInspector: 'Inspector / participant', community: 'Commune', school: 'School', activityObjective: 'Activity objective', observationsAndSummary: 'Observations & summary', recommendationsAndGuidance: 'Recommendations & guidance', trainingRole: 'Training role', complementaryActivitiesTracked: 'Complementary activities', newPedagogicalActivity: 'New pedagogical activity', editActivity: 'Edit activity', interventionType: 'Intervention type', selectedFile: 'Selected file', pedagogicalReportAndEvaluation: 'Pedagogical report & evaluation', inspectedTeacher: 'Inspected teacher', inspectionReason: 'Inspection reason', visitWithoutGrade: 'Visit without grade', generalPedagogicalAssessment: 'General assessment', observedStrengths: 'Observed strengths', areasToStrengthen: 'Areas to strengthen', fieldVisitTargeting: 'Field visit targeting', visitedTeacherOptional: 'Visited teacher (optional)', visitSubject: 'Visit subject', participants: 'Participants', selected: 'selected', selectAll: 'Select all', filterTeachersToInvite: 'Filter teachers to invite', cancel: 'Cancel', updateActivity: 'Update', saveActivity: 'Save', pioneerVisits: 'Pioneer school visits', nonPioneerVisits: 'Non-pioneer school visits', administrativeMeetings: 'Meetings with administrative staff', experimentalLessons: 'Experimental lessons', missionHandovers: 'Mission handover operations', pedagogicalResearch: 'Pedagogical research & outputs', qualityMonitoring: 'Quality monitoring / follow-up / correction / complaints', followUpCommittees: 'Follow-up committees', supportCommittees: 'Support committees', nationalMeetings: 'National meetings / events', regionalMeetings: 'Regional meetings / events', provincialMeetings: 'Provincial meetings / events', regionalCoordinationMeetings: 'Regional coordination meetings', ghoCoordinationMeetings: 'GHO coordination meetings / councils', nationalPrograms: 'National programmes and missions', topicProposals: 'Topic proposals / preparation', filters: 'Filters', allYears: 'All years', allCommunes: 'All communes', allTypes: 'All types', allStatuses: 'All statuses', noActivity: 'No activity matches your filter.', exportExcel: 'Export to Excel', addTeacher: 'Add a teacher', addSchool: 'Add a school', noResults: 'No results', annualReport: 'Annual report', officialInspections: 'Official inspections', pedagogicalVisits: 'Pedagogical visits', trainingSeminars: 'Training & seminars'
  }
};

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: ExtendedTranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('gsp_language');
    return saved === 'ar' || saved === 'en' || saved === 'fr' ? saved : 'fr';
  });

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    localStorage.setItem('gsp_language', nextLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return <I18nContext.Provider value={{ language, setLanguage, t: key => translations[language][key] ?? key }}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
};
