import { 
  Enseignant, 
  Etablissement, 
  Commune, 
  Activity, 
  Inspection, 
  User, 
  NotificationItem,
  InspectionPriority,
  Role,
  AnneeScolaire
} from '../types';
import { 
  INITIAL_COMMUNES, 
  INITIAL_ETABLISSEMENTS, 
  INITIAL_ENSEIGNANTS, 
  INITIAL_ACTIVITIES, 
  INITIAL_USERS,
  INITIAL_ANNEES_SCOLAIRES,
  SAMPLE_TIMETABLE
} from '../data/initialData';

const STORAGE_KEYS = {
  COMMUNES: 'gsp_communes_v2',
  ETABLISSEMENTS: 'gsp_etablissements_v2',
  ENSEIGNANTS: 'gsp_enseignants_v2',
  ACTIVITIES: 'gsp_activities_v2',
  CURRENT_USER: 'gsp_current_user_v2',
  AUTH_SESSION: 'gsp_auth_session_v2',
  USERS: 'gsp_users_v2',
  ANNEES_SCOLAIRES: 'gsp_annees_scolaires_v2',
  THEME: 'gsp_theme_v2'
};

export class StorageService {
  private static mergeUsersWithApi(apiUsers: User[], localUsers: User[]): User[] {
    const mergedById = new Map<string, User>();

    apiUsers.forEach(user => {
      mergedById.set(user.id, {
        ...user,
        email: String(user.email || '').trim().toLowerCase(),
        password: user.password || 'Abcd@1234',
        mustChangePassword: Boolean(user.mustChangePassword ?? true)
      });
    });

    localUsers.forEach(user => {
      const normalizedUser: User = {
        ...user,
        email: String(user.email || '').trim().toLowerCase(),
        password: user.password || 'Abcd@1234',
        mustChangePassword: Boolean(user.mustChangePassword ?? true)
      };

      const existing = mergedById.get(normalizedUser.id);
      if (!existing) {
        mergedById.set(normalizedUser.id, normalizedUser);
        return;
      }

      mergedById.set(normalizedUser.id, {
        ...existing,
        ...normalizedUser,
        email: existing.email || normalizedUser.email,
        password: normalizedUser.password || existing.password || 'Abcd@1234',
        mustChangePassword: Boolean(normalizedUser.mustChangePassword ?? existing.mustChangePassword ?? true)
      });
    });

    return Array.from(mergedById.values());
  }

  private static ensureMustaphaCompatibleAliases(users: User[]): User[] {
    const normalizedUsers = users.map(user => ({
      ...user,
      email: String(user.email || '').trim().toLowerCase()
    }));

    const aliasPairs = [
      { canonical: 'mustapha.elamrani@taalim.ma', alias: 'mustapha.yassini@taalim.ma' },
      { canonical: 'mustapha.yassini@taalim.ma', alias: 'mustapha.elamrani@taalim.ma' }
    ];

    const byEmail = new Map(normalizedUsers.map(user => [user.email, user]));

    for (const { canonical, alias } of aliasPairs) {
      const source = byEmail.get(canonical) ?? byEmail.get(alias);
      if (!source) continue;

      if (!byEmail.has(alias)) {
        const aliasUser: User = {
          ...source,
          id: `${source.id}-alias-${alias.replace(/[^a-z0-9]/g, '')}`,
          email: alias,
          password: source.password || 'Abcd@1234',
          mustChangePassword: Boolean(source.mustChangePassword ?? true)
        };
        normalizedUsers.push(aliasUser);
        byEmail.set(alias, aliasUser);
      }
    }

    return normalizedUsers;
  }

  static async loadFromApi(): Promise<boolean> {
    try {
      const existingUsers = this.getUsers();
      const response = await fetch('/api/bootstrap');
      if (!response.ok) throw new Error(`Bootstrap API error: ${response.status}`);

      const data = await response.json();
      const existingByEmail = new Map(existingUsers.map(user => [String(user.email || '').trim().toLowerCase(), user]));
      const users: User[] = data.users.map((user: any) => {
        const email = String(user.email || '').trim().toLowerCase();
        const existingUser = existingByEmail.get(email) || existingUsers.find(item => item.id === user.id);

        return {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email,
          role: user.role,
          academie: user.academie,
          direction: user.direction,
          directionsProvinciales: typeof user.directions_provinciales === 'string' ? JSON.parse(user.directions_provinciales) : user.directions_provinciales || [],
          matiere: user.matiere,
          specialite: user.specialite,
          avatar: user.avatar,
          telephone: user.telephone,
          bureau: user.bureau,
          doti: user.doti,
          password: existingUser?.password || 'Abcd@1234',
          mustChangePassword: Boolean(user.must_change_password ?? existingUser?.mustChangePassword ?? true),
          lastLogin: user.last_login
        };
      });

      const mergedUsers = this.mergeUsersWithApi(users, existingUsers);
      const communes: Commune[] = data.communes.map((commune: any) => ({
        id: commune.id,
        nomAr: commune.nom_ar,
        nomFr: commune.nom_fr,
        province: commune.province,
        region: commune.region
      }));
      const etablissements: Etablissement[] = data.etablissements.map((school: any) => ({
        id: school.id,
        nomAr: school.nom_ar,
        nomFr: school.nom_fr,
        commune: school.commune,
        communeFr: school.commune_fr,
        type: school.type,
        estPionnier: Boolean(school.est_pionnier),
        directionProvinciale: school.direction_provinciale,
        academie: school.academie,
        codeEtab: school.code_etab,
        adresse: school.adresse,
        telephone: school.telephone,
        email: school.email,
        directeurNom: school.directeur_nom,
        latitude: school.latitude === null ? undefined : Number(school.latitude),
        longitude: school.longitude === null ? undefined : Number(school.longitude),
        dateCreation: school.date_creation
      }));
      const enseignants: Enseignant[] = data.enseignants.map((teacher: any) => ({
        id: teacher.id,
        doti: teacher.doti,
        nom: teacher.nom,
        nomFr: teacher.nom_fr,
        etablissementId: teacher.etablissement_id,
        etablissementNom: teacher.etablissement_nom,
        commune: teacher.commune,
        grade: teacher.grade,
        matiere: teacher.matiere,
        cycle: teacher.cycle,
        actif: Boolean(teacher.actif),
        telephone: teacher.telephone,
        email: teacher.email,
        dateNaissance: teacher.date_naissance,
        dateRecrutement: teacher.date_recrutement,
        echelon: teacher.echelon,
        promotionEchelon: Boolean(teacher.promotion_echelon ?? teacher.promotionEchelon ?? false),
        promotionGrade: Boolean(teacher.promotion_grade ?? teacher.promotionGrade ?? false),
        derniereNote: teacher.derniere_note === null || teacher.derniere_note === undefined ? undefined : Number(teacher.derniere_note),
        derniereAnneeInspection: teacher.derniere_annee_inspection === null || teacher.derniere_annee_inspection === undefined ? undefined : Number(teacher.derniere_annee_inspection),
        derniereDateInspection: teacher.derniere_date_inspection,
        remarques: teacher.remarques,
        emploiDuTemps: typeof teacher.emploi_du_temps === 'string' ? JSON.parse(teacher.emploi_du_temps) : teacher.emploi_du_temps || []
      }));
      const activities: Activity[] = data.activities.map((activity: any) => {
        const payload = typeof activity.payload === 'string' ? JSON.parse(activity.payload) : activity.payload || {};
        return {
          ...payload,
          id: activity.id,
          type: activity.type,
          date: activity.date,
          commune: activity.commune,
          etablissementId: activity.etablissement_id,
          etablissementNom: activity.etablissement_nom,
          responsableNom: activity.responsable_nom,
          objet: activity.objet,
          createdAt: activity.created_at,
          updatedAt: activity.updated_at
        };
      });
      const anneesScolaires: AnneeScolaire[] = data.anneesScolaires.map((year: any) => ({
        id: year.id,
        libelle: year.libelle,
        dateDebut: year.date_debut,
        dateFin: year.date_fin,
        estActive: Boolean(year.est_active),
        statut: year.statut,
        description: year.description
      }));

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.ensureMustaphaCompatibleAliases(mergedUsers)));
      localStorage.setItem(STORAGE_KEYS.COMMUNES, JSON.stringify(communes));
      localStorage.setItem(STORAGE_KEYS.ETABLISSEMENTS, JSON.stringify(etablissements));
      localStorage.setItem(STORAGE_KEYS.ENSEIGNANTS, JSON.stringify(enseignants));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
      localStorage.setItem(STORAGE_KEYS.ANNEES_SCOLAIRES, JSON.stringify(anneesScolaires));
      return true;
    } catch (error) {
      console.warn('MySQL API unavailable, using local fallback.', error);
      return false;
    }
  }

  static async loginAsync(emailInput: string, passwordInput: string): Promise<{ success: boolean; user?: User; error?: string; mustChangePassword?: boolean }> {
    const cleanEmail = emailInput.trim().toLowerCase();
    const targetEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@taalim.ma`;
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: passwordInput.trim() })
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const localResult = this.login(emailInput, passwordInput);

        const isDatabaseUnavailable = response.status === 503 || data?.error === 'Base de données indisponible.';
        if (isDatabaseUnavailable || localResult.success) {
          return localResult;
        }

        return { success: false, error: data?.error || localResult.error || 'Identifiants incorrects.' };
      }

      const user = data.user as User;
      this.saveUserLocally(user);
      this.setAuthenticatedUser(user);
      return { success: true, user, mustChangePassword: Boolean(data.mustChangePassword) };
    } catch (error) {
      return this.login(emailInput, passwordInput);
    }
  }

  private static saveUserLocally(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(item => item.id === user.id);
    if (index >= 0) users[index] = { ...users[index], ...user };
    else users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // --- Initialization ---
  static initializeStorage(): void {
    this.init();
  }

  static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.COMMUNES)) {
      localStorage.setItem(STORAGE_KEYS.COMMUNES, JSON.stringify(INITIAL_COMMUNES));
    }
    // Check etablissements and sync if needed
    const storedEtabs = localStorage.getItem(STORAGE_KEYS.ETABLISSEMENTS);
    if (!storedEtabs) {
      localStorage.setItem(STORAGE_KEYS.ETABLISSEMENTS, JSON.stringify(INITIAL_ETABLISSEMENTS));
    } else {
      try {
        const parsed: Etablissement[] = JSON.parse(storedEtabs);
        const hasAgadir = parsed.some(e => e.directionProvinciale.includes('Agadir'));
        if (!hasAgadir) {
          localStorage.setItem(STORAGE_KEYS.ETABLISSEMENTS, JSON.stringify(INITIAL_ETABLISSEMENTS));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.ETABLISSEMENTS, JSON.stringify(INITIAL_ETABLISSEMENTS));
      }
    }

    // Check enseignants and sync if needed
    const storedEns = localStorage.getItem(STORAGE_KEYS.ENSEIGNANTS);
    if (!storedEns) {
      const enriched = INITIAL_ENSEIGNANTS.map((ens, idx) => {
        if (idx % 3 === 0) {
          return { ...ens, emploiDuTemps: SAMPLE_TIMETABLE };
        }
        return ens;
      });
      localStorage.setItem(STORAGE_KEYS.ENSEIGNANTS, JSON.stringify(enriched));
    } else {
      try {
        const parsedEns: Enseignant[] = JSON.parse(storedEns);
        const hasOtherMatiere = parsedEns.some(e => e.matiere.includes('الرياضيات') || e.matiere.includes('الفيزياء'));
        if (!hasOtherMatiere) {
          const enriched = INITIAL_ENSEIGNANTS.map((ens, idx) => {
            if (idx % 3 === 0) {
              return { ...ens, emploiDuTemps: SAMPLE_TIMETABLE };
            }
            return ens;
          });
          localStorage.setItem(STORAGE_KEYS.ENSEIGNANTS, JSON.stringify(enriched));
        }
      } catch (e) {
        // keep stored
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    }

    // Keep existing local users intact. Only normalize the stored list and add the
    // Mustapha compatibility aliases when needed.
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!storedUsers) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.ensureMustaphaCompatibleAliases(INITIAL_USERS)));
    } else {
      try {
        const parsedUsers: User[] = JSON.parse(storedUsers);
        const correctedUsers = parsedUsers.map(user => {
          if (user.email.toLowerCase() !== 'mustapha.yassini@taalim.ma') return user;
          return {
            ...user,
            matiere: 'اللغة الإنجليزية',
            specialite: 'Inspecteur Pédagogique - Anglais'
          };
        });
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.ensureMustaphaCompatibleAliases(correctedUsers)));
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.ensureMustaphaCompatibleAliases(INITIAL_USERS)));
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ANNEES_SCOLAIRES)) {
      localStorage.setItem(STORAGE_KEYS.ANNEES_SCOLAIRES, JSON.stringify(INITIAL_ANNEES_SCOLAIRES));
    } else {
      // Ensure 2026/2027 is present even if browser had older initial data
      try {
        const storedList: AnneeScolaire[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNEES_SCOLAIRES) || '[]');
        const has2026 = storedList.some(a => a.id === '2026-2027' || a.libelle.includes('2026/2027'));
        if (!has2026) {
          storedList.unshift({
            id: '2026-2027',
            libelle: '2026/2027',
            dateDebut: '2026-09-01',
            dateFin: '2027-07-31',
            estActive: true,
            statut: 'en_cours',
            description: 'Année scolaire en cours (du 1er septembre 2026 au 31 juillet 2027)'
          });
          // Update others to not active if 2026-2027 is active
          storedList.forEach(a => {
            if (a.id !== '2026-2027') a.estActive = false;
          });
          localStorage.setItem(STORAGE_KEYS.ANNEES_SCOLAIRES, JSON.stringify(storedList));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.ANNEES_SCOLAIRES, JSON.stringify(INITIAL_ANNEES_SCOLAIRES));
      }
    }
  }

  // --- Authentication & Session Management ---
  static getAuthenticatedUser(): User | null {
    this.init();
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  }

  static getAuthSession(): { user: User | null } | null {
    const user = this.getAuthenticatedUser();
    return user ? { user } : null;
  }

  static setAuthenticatedUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
  }

  static setAuthSession(user: User | null): void {
    this.setAuthenticatedUser(user);
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  }

  static login(emailInput: string, passwordInput: string): { 
    success: boolean; 
    user?: User; 
    error?: string; 
    mustChangePassword?: boolean 
  } {
    this.init();
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: "Veuillez saisir votre email professionnel et votre mot de passe." };
    }

    const users = this.getUsers();
    
    // Support typing "prenom.nom" without "@taalim.ma" as convenience
    const targetEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@taalim.ma`;

    const user = users.find(u => 
      u.email.toLowerCase() === targetEmail || 
      u.email.toLowerCase() === cleanEmail ||
      (cleanEmail === 'admin' && u.role === 'admin')
    );

    if (!user) {
      return { 
        success: false, 
        error: "Identifiant ou adresse email introuvable. Utilisez votre adresse professionnelle prenom.nom@taalim.ma." 
      };
    }

    const expectedPassword = user.password || 'Abcd@1234';
    if (cleanPassword !== expectedPassword) {
      return { 
        success: false, 
        error: "Mot de passe incorrect. (Mot de passe initial par défaut : Abcd@1234)" 
      };
    }

    // Check if temporary password is still in effect
    const mustChange = Boolean(user.mustChangePassword) || cleanPassword === 'Abcd@1234';

    const updatedUser: User = {
      ...user,
      lastLogin: new Date().toISOString()
    };

    this.saveUser(updatedUser);
    this.setAuthenticatedUser(updatedUser);

    return { 
      success: true, 
      user: updatedUser, 
      mustChangePassword: mustChange 
    };
  }

  static changePassword(userId: string, newPassword: string): { success: boolean; error?: string; user?: User } {
    const cleanPassword = newPassword.trim();
    if (cleanPassword.length < 6) {
      return { success: false, error: "Le mot de passe doit comporter au moins 6 caractères." };
    }
    if (cleanPassword === 'Abcd@1234') {
      return { success: false, error: "Veuillez choisir un mot de passe différent du mot de passe provisoire initial." };
    }

    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: "Utilisateur non trouvé." };
    }

    const updatedUser: User = {
      ...user,
      password: cleanPassword,
      mustChangePassword: false
    };

    this.saveUser(updatedUser);
    this.setAuthenticatedUser(updatedUser);

    return { success: true, user: updatedUser };
  }

  static resetPassword(userId: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: "Utilisateur non trouvé." };
    }

    const updatedUser: User = {
      ...user,
      password: 'Abcd@1234',
      mustChangePassword: true
    };

    this.saveUser(updatedUser);
    return { success: true, user: updatedUser };
  }

  // --- Current User & Role (Backwards Compatibility) ---
  static getCurrentUser(): User {
    this.init();
    const auth = this.getAuthenticatedUser();
    if (auth) return auth;

    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS[0];
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  static switchRole(role: Role): User {
    const users = this.getUsers();
    const target = users.find(u => u.role === role) || {
      ...this.getCurrentUser(),
      role
    };
    this.setCurrentUser(target);
    return target;
  }

  static getUsers(): User[] {
    this.init();
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    return stored ? JSON.parse(stored) : INITIAL_USERS;
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static saveUser(user: User): void {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      list[idx] = user;
    } else {
      list.push(user);
    }
    this.saveUsers(list);

    void fetch(`/api/users/${encodeURIComponent(user.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...user,
        email: String(user.email || '').trim().toLowerCase(),
        password: user.password || 'Abcd@1234',
        directionsProvinciales: user.directionsProvinciales || (user.direction ? [user.direction] : [])
      })
    }).catch(() => undefined);

    const curr = this.getCurrentUser();
    if (curr.id === user.id) {
      this.setCurrentUser(user);
    }
  }

  static deleteUser(userId: string): void {
    const list = this.getUsers().filter(u => u.id !== userId);
    this.saveUsers(list);

    void fetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    }).catch(() => undefined);
  }

  // --- Communes ---
  static getCommunes(): Commune[] {
    this.init();
    const stored = localStorage.getItem(STORAGE_KEYS.COMMUNES);
    return stored ? JSON.parse(stored) : INITIAL_COMMUNES;
  }

  static addCommune(commune: Commune): void {
    const list = this.getCommunes();
    list.push(commune);
    localStorage.setItem(STORAGE_KEYS.COMMUNES, JSON.stringify(list));
  }

  // --- Etablissements ---
  static getEtablissements(): Etablissement[] {
    this.init();
    const stored = localStorage.getItem(STORAGE_KEYS.ETABLISSEMENTS);
    return stored ? JSON.parse(stored) : INITIAL_ETABLISSEMENTS;
  }

  static getEtablissementById(id: string): Etablissement | undefined {
    return this.getEtablissements().find(e => e.id === id);
  }

  static saveEtablissement(etab: Etablissement): void {
    const list = this.getEtablissements();
    const idx = list.findIndex(e => e.id === etab.id);
    if (idx >= 0) {
      list[idx] = etab;
    } else {
      list.push(etab);
    }
    localStorage.setItem(STORAGE_KEYS.ETABLISSEMENTS, JSON.stringify(list));
  }

  static saveEtablissements(etabs: Etablissement[]): void {
    localStorage.setItem(STORAGE_KEYS.ETABLISSEMENTS, JSON.stringify(etabs));
  }

  static async saveEtablissementToApi(etab: Etablissement): Promise<void> {
    const response = await fetch(`/api/etablissements/${encodeURIComponent(etab.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(etab)
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Impossible d’enregistrer l’établissement dans MySQL.');
    }
  }

  static async saveEnseignantToApi(teacher: Enseignant): Promise<void> {
    const response = await fetch(`/api/enseignants/${encodeURIComponent(teacher.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacher)
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Impossible d’enregistrer l’enseignant dans MySQL.');
    }
  }

  static async deleteEtablissementFromApi(id: string): Promise<void> {
    const response = await fetch(`/api/etablissements/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Impossible de supprimer l’établissement dans MySQL.');
  }

  static deleteEtablissement(id: string): boolean {
    const list = this.getEtablissements().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.ETABLISSEMENTS, JSON.stringify(list));
    return true;
  }

  // --- Enseignants ---
  static getEnseignants(): Enseignant[] {
    this.init();
    const stored = localStorage.getItem(STORAGE_KEYS.ENSEIGNANTS);
    const list = stored ? JSON.parse(stored) : INITIAL_ENSEIGNANTS;

    return list.map((teacher: any) => ({
      ...teacher,
      promotionEchelon: Boolean(teacher.promotionEchelon ?? teacher.promotion_echelon ?? false),
      promotionGrade: Boolean(teacher.promotionGrade ?? teacher.promotion_grade ?? false),
      derniereNote: teacher.derniereNote === null || teacher.derniereNote === undefined || teacher.derniereNote === 'vis'
        ? teacher.derniereNote
        : Number(teacher.derniereNote),
      derniereAnneeInspection: teacher.derniereAnneeInspection === null || teacher.derniereAnneeInspection === undefined
        ? undefined
        : Number(teacher.derniereAnneeInspection)
    }));
  }

  static getEnseignantById(id: string): Enseignant | undefined {
    return this.getEnseignants().find(e => e.id === id);
  }

  static getEnseignantByDoti(doti: string): Enseignant | undefined {
    return this.getEnseignants().find(e => e.doti === doti);
  }

  static saveEnseignant(enseignant: Enseignant): void {
    const list = this.getEnseignants();
    const idx = list.findIndex(e => e.id === enseignant.id);
    if (idx >= 0) {
      list[idx] = enseignant;
    } else {
      list.push(enseignant);
    }
    localStorage.setItem(STORAGE_KEYS.ENSEIGNANTS, JSON.stringify(list));
  }

  static saveEnseignantsBatch(enseignants: Enseignant[]): void {
    localStorage.setItem(STORAGE_KEYS.ENSEIGNANTS, JSON.stringify(enseignants));
  }

  static saveEnseignants(enseignants: Enseignant[]): void {
    this.saveEnseignantsBatch(enseignants);
  }

  static deleteEnseignant(id: string): boolean {
    const list = this.getEnseignants().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.ENSEIGNANTS, JSON.stringify(list));
    return true;
  }

  // --- Activités ---
  static getActivities(): Activity[] {
    this.init();
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    const acts: Activity[] = stored ? JSON.parse(stored) : INITIAL_ACTIVITIES;
    return acts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static saveActivity(activity: Activity): void {
    const list = this.getActivities();
    const idx = list.findIndex(a => a.id === activity.id);
    if (idx >= 0) {
      list[idx] = activity;
    } else {
      list.unshift(activity);
    }
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(list));

    // If it's an inspection, update the teacher's latest score & year!
    if (activity.type === 'inspection') {
      const insp = activity as Inspection;
      if (insp.enseignantId) {
        const teacher = this.getEnseignantById(insp.enseignantId);
        if (teacher) {
          const inspYear = new Date(insp.date).getFullYear();
          const currentYear = teacher.derniereAnneeInspection || 0;
          if (inspYear >= currentYear) {
            teacher.derniereAnneeInspection = inspYear;
            teacher.derniereDateInspection = insp.date;
            if (insp.note !== undefined && insp.note !== null) {
              teacher.derniereNote = insp.note;
            }
            this.saveEnseignant(teacher);
          }
        }
      }
    }
  }

  static saveActivities(activities: Activity[]): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }

  static async saveActivityToApi(activity: Activity): Promise<void> {
    const response = await fetch(`/api/activities/${encodeURIComponent(activity.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Impossible d’enregistrer l’activité dans MySQL.');
    }
  }

  static async deleteActivityFromApi(id: string): Promise<void> {
    const response = await fetch(`/api/activities/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Impossible de supprimer l’activité dans MySQL.');
  }

  static deleteActivity(id: string): boolean {
    const list = this.getActivities().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(list));
    return true;
  }

  // --- Scoped Access Control (Directions Provinciales & Matières) ---
  static getScopedEtablissements(user: User | null): Etablissement[] {
    const all = this.getEtablissements();
    if (!user || user.role === 'admin') {
      return all;
    }

    const assignedDirections = (user.directionsProvinciales && user.directionsProvinciales.length > 0)
      ? user.directionsProvinciales
      : user.direction ? [user.direction] : [];

    if (assignedDirections.length === 0) {
      return all;
    }

    return all.filter(etab => {
      const etabDir = (etab.directionProvinciale || '').trim().toLowerCase();
      return assignedDirections.some(d => {
        const cleanD = d.trim().toLowerCase();
        return etabDir === cleanD || etabDir.includes(cleanD) || cleanD.includes(etabDir);
      });
    });
  }

  static getScopedEnseignants(user: User | null, scopedEtabs?: Etablissement[]): Enseignant[] {
    const all = this.getEnseignants();
    if (!user || user.role === 'admin') {
      return all;
    }

    const validEtabs = scopedEtabs || this.getScopedEtablissements(user);
    const allowedEtabIds = new Set(validEtabs.map(e => e.id));
    const userMatiere = (user.matiere || '').trim().toLowerCase();

    return all.filter(ens => {
      // Must belong to an establishment within the inspector's assigned directions
      if (!allowedEtabIds.has(ens.etablissementId)) {
        return false;
      }

      // If no discipline specified or 'toutes', all teachers in their schools are shown
      if (!userMatiere || userMatiere.includes('toutes') || userMatiere === 'tous') {
        return true;
      }

      // Must teach the inspector's subject
      const ensMatiere = (ens.matiere || '').trim().toLowerCase();
      return ensMatiere.includes(userMatiere) || userMatiere.includes(ensMatiere);
    });
  }

  static getScopedActivities(user: User | null): Activity[] {
    const all = this.getActivities();
    if (!user || user.role === 'admin') {
      return all;
    }

    const allowedEtabs = this.getScopedEtablissements(user);
    const allowedEtabIds = new Set(allowedEtabs.map(e => e.id));
    const allowedEnseignants = this.getScopedEnseignants(user, allowedEtabs);
    const allowedEnsIds = new Set(allowedEnseignants.map(e => e.id));

    return all.filter(act => {
      if (!allowedEtabIds.has(act.etablissementId)) {
        return false;
      }
      const actAny = act as any;
      if (actAny.enseignantId && !allowedEnsIds.has(actAny.enseignantId)) {
        return false;
      }
      return true;
    });
  }

  // --- Planification & Priorities ---
  static getInspectionPriorities(): InspectionPriority[] {
    const teachers = this.getEnseignants().filter(t => t.actif);
    const currentYear = new Date().getFullYear();
    const etabs = this.getEtablissements();
    const etabMap = new Map<string, Etablissement>();
    etabs.forEach(e => etabMap.set(e.id, e));

    const priorities: InspectionPriority[] = [];

    teachers.forEach(t => {
      const etab = etabMap.get(t.etablissementId) || {
        id: t.etablissementId,
        nomAr: t.etablissementNom,
        nomFr: t.etablissementNom,
        commune: t.commune,
        communeFr: t.commune,
        type: 'college',
        estPionnier: false,
        directionProvinciale: 'Inzegane Aït Melloul',
        academie: 'Souss-Massa'
      };

      if (!t.derniereAnneeInspection || t.derniereNote === 'vis' || t.promotionEchelon || t.promotionGrade) {
        priorities.push({
          enseignant: t,
          etablissement: etab,
          anneesSansInspection: 99,
          priorite: 'Urgente',
          motif: 'Enseignant jamais inspecté, visite sans note ou proposé en promotion'
        });
      } else {
        const diff = currentYear - t.derniereAnneeInspection;
        if (diff >= 4) {
          priorities.push({
            enseignant: t,
            etablissement: etab,
            anneesSansInspection: diff,
            priorite: 'Urgente',
            motif: `Dernière inspection il y a ${diff} ans (${t.derniereAnneeInspection})`
          });
        } else if (diff === 3) {
          priorities.push({
            enseignant: t,
            etablissement: etab,
            anneesSansInspection: diff,
            priorite: 'Haute',
            motif: `Dernière inspection en ${t.derniereAnneeInspection} (seuil de 3 ans atteint)`
          });
        } else if (diff === 2) {
          priorities.push({
            enseignant: t,
            etablissement: etab,
            anneesSansInspection: diff,
            priorite: 'Normale',
            motif: `Dernière inspection en ${t.derniereAnneeInspection}`
          });
        } else {
          priorities.push({
            enseignant: t,
            etablissement: etab,
            anneesSansInspection: diff,
            priorite: 'Faible',
            motif: `Récemment inspecté (${t.derniereAnneeInspection})`
          });
        }
      }
    });

    const rankOrder = { 'Urgente': 0, 'Haute': 1, 'Normale': 2, 'Faible': 3 };
    return priorities.sort((a, b) => rankOrder[a.priorite] - rankOrder[b.priorite]);
  }

  // --- Smart Notifications ---
  static getNotifications(): NotificationItem[] {
    const priorities = this.getInspectionPriorities();
    const urgentCount = priorities.filter(p => p.priorite === 'Urgente').length;
    const neverCount = priorities.filter(p => p.anneesSansInspection === 99).length;
    const activities = this.getActivities();
    const now = new Date();

    const futureActs = activities.filter(a => new Date(a.date) >= now);

    const items: NotificationItem[] = [
      {
        id: 'notif-urgent',
        titre: 'Inspections Urgentes Requises',
        message: `${urgentCount} enseignants nécessitent une inspection prioritaire (> 3 ans ou jamais inspectés).`,
        type: 'danger',
        date: 'Aujourd’hui',
        lu: false,
        lien: 'planification'
      },
      {
        id: 'notif-never',
        titre: 'Enseignants non inspectés',
        message: `${neverCount} enseignants sont enregistrés avec statut "visite / non inspecté".`,
        type: 'warning',
        date: 'Aujourd’hui',
        lu: false,
        lien: 'planification'
      }
    ];

    if (futureActs.length > 0) {
      items.push({
        id: 'notif-planned',
        titre: 'Activités Planifiées',
        message: `${futureActs.length} activité(s) pédagogique(s) programmée(s) pour les prochains jours.`,
        type: 'info',
        date: 'Planning en cours',
        lu: false,
        lien: 'calendrier'
      });
    }

    const activeAnnee = this.getActiveAnneeScolaire();
    const yearActs = activities.filter(a => this.isDateInAnneeScolaire(a.date, activeAnnee));
    items.push({
      id: 'notif-year',
      titre: `Bilan Annuel ${activeAnnee.libelle}`,
      message: `${yearActs.length} activité(s) réalisée(s) ou planifiée(s) cette année scolaire.`,
      type: 'success',
      date: 'Suivi global',
      lu: true,
      lien: 'activites'
    });

    return items;
  }

  // --- Backup export & import ---
  static exportBackupJSON(): string {
    return JSON.stringify({
      version: '2.0',
      exportedAt: new Date().toISOString(),
      communes: this.getCommunes(),
      etablissements: this.getEtablissements(),
      enseignants: this.getEnseignants(),
      activities: this.getActivities(),
      users: this.getUsers(),
      anneesScolaires: this.getAnneesScolaires()
    }, null, 2);
  }

  static importBackupJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.communes) localStorage.setItem(STORAGE_KEYS.COMMUNES, JSON.stringify(data.communes));
      if (data.etablissements) localStorage.setItem(STORAGE_KEYS.ETABLISSEMENTS, JSON.stringify(data.etablissements));
      if (data.enseignants) localStorage.setItem(STORAGE_KEYS.ENSEIGNANTS, JSON.stringify(data.enseignants));
      if (data.activities) localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(data.activities));
      if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      if (data.anneesScolaires) localStorage.setItem(STORAGE_KEYS.ANNEES_SCOLAIRES, JSON.stringify(data.anneesScolaires));
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  // --- Reset database to original ---
  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.COMMUNES);
    localStorage.removeItem(STORAGE_KEYS.ETABLISSEMENTS);
    localStorage.removeItem(STORAGE_KEYS.ENSEIGNANTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ANNEES_SCOLAIRES);
    this.init();
  }

  static resetToDefaults(): void {
    this.resetToDefault();
  }

  // --- Gestion des Années Scolaires (du 1er septembre au 31 juillet) ---
  static getAnneesScolaires(): AnneeScolaire[] {
    this.init();
    const stored = localStorage.getItem(STORAGE_KEYS.ANNEES_SCOLAIRES);
    const list: AnneeScolaire[] = stored ? JSON.parse(stored) : INITIAL_ANNEES_SCOLAIRES;
    // Sort descending by dateDebut
    return list.sort((a, b) => b.dateDebut.localeCompare(a.dateDebut));
  }

  static saveAnneesScolaires(annees: AnneeScolaire[]): void {
    localStorage.setItem(STORAGE_KEYS.ANNEES_SCOLAIRES, JSON.stringify(annees));
  }

  static getActiveAnneeScolaire(): AnneeScolaire {
    const list = this.getAnneesScolaires();
    const active = list.find(a => a.estActive);
    if (active) return active;
    // Default fallback to 2026-2027 or first
    const def = list.find(a => a.id === '2026-2027') || list[0] || INITIAL_ANNEES_SCOLAIRES[0];
    return def;
  }

  static setActiveAnneeScolaire(id: string): void {
    const list = this.getAnneesScolaires();
    const updated = list.map(a => ({
      ...a,
      estActive: a.id === id,
      statut: a.id === id ? ('en_cours' as const) : a.statut === 'en_cours' ? ('cloturee' as const) : a.statut
    }));
    this.saveAnneesScolaires(updated);
  }

  static saveAnneeScolaire(annee: AnneeScolaire): void {
    const list = this.getAnneesScolaires();
    const idx = list.findIndex(a => a.id === annee.id);
    
    if (annee.estActive) {
      list.forEach(a => {
        if (a.id !== annee.id) a.estActive = false;
      });
    }

    if (idx >= 0) {
      list[idx] = annee;
    } else {
      list.unshift(annee);
    }
    this.saveAnneesScolaires(list);
  }

  static deleteAnneeScolaire(id: string): boolean {
    const list = this.getAnneesScolaires();
    if (list.length <= 1) {
      return false; // Can't delete the only school year
    }
    const item = list.find(a => a.id === id);
    if (item?.estActive) {
      return false; // Can't delete active school year
    }
    const updated = list.filter(a => a.id !== id);
    this.saveAnneesScolaires(updated);
    return true;
  }

  static isDateInAnneeScolaire(dateStr: string, annee: AnneeScolaire): boolean {
    if (!dateStr || !annee) return false;
    const cleanDate = dateStr.substring(0, 10);
    return cleanDate >= annee.dateDebut && cleanDate <= annee.dateFin;
  }

  static getAnneeScolaireForDate(dateStr: string): AnneeScolaire | undefined {
    const list = this.getAnneesScolaires();
    return list.find(a => this.isDateInAnneeScolaire(dateStr, a));
  }
}
