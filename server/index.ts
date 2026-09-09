import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { checkDatabase, pool, query } from './db';
import {
  INITIAL_COMMUNES,
  INITIAL_ETABLISSEMENTS,
  INITIAL_ENSEIGNANTS,
  INITIAL_ACTIVITIES,
  INITIAL_USERS,
  INITIAL_ANNEES_SCOLAIRES
} from '../src/data/initialData';

const app = express();
const port = Number(process.env.API_PORT || 8787);

function toMysqlDateTime(value: string): string {
  return value.replace('T', ' ').replace(/Z$/, '');
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const isJsonSyntaxError =
    error instanceof SyntaxError &&
    'body' in error &&
    error.message.includes('JSON');

  if (isJsonSyntaxError) {
    return res.status(400).json({ error: 'Requête JSON invalide.' });
  }

  return res.status(500).json({ error: 'Erreur serveur interne.' });
});

app.get('/api/health', async (_req, res) => {
  try {
    await checkDatabase();
    res.json({ ok: true, database: 'mysql' });
  } catch (error) {
    res.status(503).json({ ok: false, database: 'unavailable', error: String(error) });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '').trim();

    const aliases = Array.from(new Set([
      email,
      email === 'mustapha.yassini@taalim.ma' ? 'mustapha.elamrani@taalim.ma' : '',
      email === 'mustapha.elamrani@taalim.ma' ? 'mustapha.yassini@taalim.ma' : ''
    ])).filter(Boolean);

    const users = await query<any[]>(
      `SELECT * FROM users WHERE LOWER(email) IN (${aliases.map(() => '?').join(', ')})`,
      aliases
    );
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      const seedUser = INITIAL_USERS.find(u => aliases.includes(u.email.toLowerCase()));
      if (seedUser && password === seedUser.password) {
        const repairedHash = await bcrypt.hash(password, 10);
        await query(
          'UPDATE users SET password_hash = ?, must_change_password = ? WHERE id = ?',
          [repairedHash, Boolean(seedUser.mustChangePassword), user.id]
        );

        const repairedUser = {
          ...user,
          password_hash: repairedHash,
          must_change_password: Boolean(seedUser.mustChangePassword)
        };
        const { password_hash: _passwordHash, ...safeUser } = repairedUser;

        await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
        return res.json({ user: safeUser, mustChangePassword: Boolean(seedUser.mustChangePassword) });
      }

      return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
    }

    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    const { password_hash: _passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser, mustChangePassword: Boolean(user.must_change_password) });
  } catch (error) {
    return res.status(503).json({ error: 'Base de données indisponible.', details: String(error) });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const user = req.body;
  if (!user || !user.nom || !user.prenom || !user.email) {
    return res.status(400).json({ error: 'Les champs obligatoires de l’utilisateur sont manquants.' });
  }

  try {
    const id = String(user.id || req.params.id || `usr-${Date.now()}`);
    const email = String(user.email).trim().toLowerCase();
    const password = String(user.password || 'Abcd@1234').trim();
    const directionsProvinciales = Array.isArray(user.directionsProvinciales)
      ? user.directionsProvinciales
      : (user.direction ? [user.direction] : []);

    const passwordHash = await bcrypt.hash(password, 10);

    await query(
      `INSERT INTO users (
        id, nom, prenom, email, password_hash, role, academie, direction,
        directions_provinciales, matiere, specialite, avatar, telephone, bureau, doti,
        must_change_password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nom = VALUES(nom), prenom = VALUES(prenom), email = VALUES(email),
        password_hash = VALUES(password_hash), role = VALUES(role), academie = VALUES(academie),
        direction = VALUES(direction), directions_provinciales = VALUES(directions_provinciales),
        matiere = VALUES(matiere), specialite = VALUES(specialite), avatar = VALUES(avatar),
        telephone = VALUES(telephone), bureau = VALUES(bureau), doti = VALUES(doti),
        must_change_password = VALUES(must_change_password), updated_at = CURRENT_TIMESTAMP`,
      [
        id,
        String(user.nom).trim(),
        String(user.prenom).trim(),
        email,
        passwordHash,
        user.role || 'inspecteur',
        user.academie || 'Souss-Massa',
        user.direction || '',
        JSON.stringify(directionsProvinciales),
        user.matiere || '',
        user.specialite || '',
        user.avatar || `${String(user.prenom || '').trim().charAt(0) || ''}${String(user.nom || '').trim().charAt(0) || ''}`.toUpperCase(),
        user.telephone || null,
        user.bureau || null,
        user.doti || null,
        Boolean(user.mustChangePassword ?? true)
      ]
    );

    return res.json({ saved: true, id });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = ?', [req.params.id]);
    return res.json({ deleted: true });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});

app.get('/api/bootstrap', async (_req, res) => {
  try {
    const [users, communes, etablissements, enseignants, activities, anneesScolaires] = await Promise.all([
      query<any[]>('SELECT * FROM users'),
      query<any[]>('SELECT * FROM communes'),
      query<any[]>('SELECT * FROM etablissements'),
      query<any[]>('SELECT * FROM enseignants'),
      query<any[]>('SELECT * FROM activities ORDER BY date DESC'),
      query<any[]>('SELECT * FROM annees_scolaires ORDER BY date_debut DESC')
    ]);

    res.json({ users, communes, etablissements, enseignants, activities, anneesScolaires });
  } catch (error) {
    return res.status(503).json({ error: 'Base de données indisponible.', details: String(error) });
  }
});

app.put('/api/etablissements/:id', async (req, res) => {
  const school = req.body;
  if (!school || !school.nomAr || !school.commune || !school.directionProvinciale || !school.type) {
    return res.status(400).json({ error: 'Les champs obligatoires de l’établissement sont manquants.' });
  }

  try {
    await query(
      `INSERT INTO etablissements (id, nom_ar, nom_fr, commune, commune_fr, type, est_pionnier, direction_provinciale, academie, code_etab, adresse, telephone, email, directeur_nom, latitude, longitude, date_creation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         nom_ar = VALUES(nom_ar), nom_fr = VALUES(nom_fr), commune = VALUES(commune), commune_fr = VALUES(commune_fr),
         type = VALUES(type), est_pionnier = VALUES(est_pionnier), direction_provinciale = VALUES(direction_provinciale),
         academie = VALUES(academie), code_etab = VALUES(code_etab), adresse = VALUES(adresse), telephone = VALUES(telephone),
         email = VALUES(email), directeur_nom = VALUES(directeur_nom), latitude = VALUES(latitude), longitude = VALUES(longitude),
         date_creation = VALUES(date_creation)`,
      [school.id || req.params.id, school.nomAr, school.nomFr || school.nomAr, school.commune, school.communeFr || school.commune, school.type, Boolean(school.estPionnier), school.directionProvinciale, school.academie || 'Souss-Massa', school.codeEtab || null, school.adresse || null, school.telephone || null, school.email || null, school.directeurNom || null, school.latitude ?? null, school.longitude ?? null, school.dateCreation || null]
    );
    return res.json({ saved: true });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});

app.put('/api/enseignants/:id', async (req, res) => {
  const teacher = req.body;
  if (!teacher || !teacher.id || !teacher.nom || !teacher.etablissementId || !teacher.grade || !teacher.matiere || !teacher.cycle) {
    return res.status(400).json({ error: 'Les champs obligatoires de l’enseignant sont manquants.' });
  }

  try {
    await query(
      `INSERT INTO enseignants (
        id, doti, nom, nom_fr, etablissement_id, etablissement_nom, commune, grade, matiere, cycle, actif,
        telephone, email, date_naissance, date_recrutement, echelon, promotion_echelon, promotion_grade,
        derniere_note, derniere_annee_inspection, derniere_date_inspection, remarques, emploi_du_temps
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        doti = VALUES(doti), nom = VALUES(nom), nom_fr = VALUES(nom_fr), etablissement_id = VALUES(etablissement_id),
        etablissement_nom = VALUES(etablissement_nom), commune = VALUES(commune), grade = VALUES(grade),
        matiere = VALUES(matiere), cycle = VALUES(cycle), actif = VALUES(actif), telephone = VALUES(telephone),
        email = VALUES(email), date_naissance = VALUES(date_naissance), date_recrutement = VALUES(date_recrutement),
        echelon = VALUES(echelon), promotion_echelon = VALUES(promotion_echelon), promotion_grade = VALUES(promotion_grade),
        derniere_note = VALUES(derniere_note), derniere_annee_inspection = VALUES(derniere_annee_inspection),
        derniere_date_inspection = VALUES(derniere_date_inspection), remarques = VALUES(remarques),
        emploi_du_temps = VALUES(emploi_du_temps)`,
      [
        teacher.id || req.params.id,
        teacher.doti || '',
        teacher.nom,
        teacher.nomFr || null,
        teacher.etablissementId,
        teacher.etablissementNom || '',
        teacher.commune || '',
        teacher.grade,
        teacher.matiere,
        teacher.cycle,
        Boolean(teacher.actif),
        teacher.telephone || null,
        teacher.email || null,
        teacher.dateNaissance || null,
        teacher.dateRecrutement || null,
        teacher.echelon || null,
        Boolean(teacher.promotionEchelon ?? false),
        Boolean(teacher.promotionGrade ?? false),
        typeof teacher.derniereNote === 'number' ? teacher.derniereNote : null,
        teacher.derniereAnneeInspection ?? null,
        teacher.derniereDateInspection || null,
        teacher.remarques || null,
        JSON.stringify(teacher.emploiDuTemps || [])
      ]
    );

    return res.json({ saved: true });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/etablissements/:id', async (req, res) => {
  try {
    await query('DELETE FROM etablissements WHERE id = ?', [req.params.id]);
    return res.json({ deleted: true });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  const activity = req.body;
  if (!activity || !activity.type || !activity.date || !activity.etablissementId || !activity.objet) {
    return res.status(400).json({ error: 'Les champs obligatoires de l’activité sont manquants.' });
  }

  try {
    await query(
      `INSERT INTO activities (id, type, date, commune, etablissement_id, etablissement_nom, responsable_nom, objet, payload, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         type = VALUES(type), date = VALUES(date), commune = VALUES(commune), etablissement_id = VALUES(etablissement_id),
         etablissement_nom = VALUES(etablissement_nom), responsable_nom = VALUES(responsable_nom), objet = VALUES(objet),
         payload = VALUES(payload), updated_at = VALUES(updated_at)`,
      [activity.id || req.params.id, activity.type, activity.date, activity.commune || '', activity.etablissementId, activity.etablissementNom || '', activity.responsableNom || '', activity.objet, JSON.stringify(activity), toMysqlDateTime(activity.createdAt || new Date().toISOString()), toMysqlDateTime(activity.updatedAt || new Date().toISOString())]
    );
    return res.json({ saved: true });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    await query('DELETE FROM activities WHERE id = ?', [req.params.id]);
    return res.json({ deleted: true });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});

app.post('/api/admin/seed', async (_req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [countRows] = await connection.query<any[]>('SELECT COUNT(*) AS count FROM users');
    if (Number(countRows[0].count) > 0) {
      await connection.rollback();
      return res.json({ seeded: false, message: 'La base contient déjà des données.' });
    }

    for (const user of INITIAL_USERS) {
      await connection.query(
        `INSERT INTO users (id, nom, prenom, email, password_hash, role, academie, direction, directions_provinciales, matiere, specialite, avatar, telephone, doti, must_change_password)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [user.id, user.nom, user.prenom, user.email.toLowerCase(), await bcrypt.hash(user.password || 'Abcd@1234', 10), user.role, user.academie, user.direction, JSON.stringify(user.directionsProvinciales || []), user.matiere, user.specialite, user.avatar, user.telephone, user.doti, Boolean(user.mustChangePassword)]
      );
    }

    for (const commune of INITIAL_COMMUNES) {
      await connection.query('INSERT INTO communes (id, nom_ar, nom_fr, province, region) VALUES (?, ?, ?, ?, ?)', [commune.id, commune.nomAr, commune.nomFr, commune.province, commune.region]);
    }

    for (const school of INITIAL_ETABLISSEMENTS) {
      await connection.query(
        `INSERT INTO etablissements (id, nom_ar, nom_fr, commune, commune_fr, type, est_pionnier, direction_provinciale, academie, code_etab, adresse, telephone, email, directeur_nom, latitude, longitude, date_creation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [school.id, school.nomAr, school.nomFr, school.commune, school.communeFr, school.type, school.estPionnier, school.directionProvinciale, school.academie, school.codeEtab, school.adresse, school.telephone, school.email, school.directeurNom, school.latitude, school.longitude, school.dateCreation]
      );
    }

    for (const teacher of INITIAL_ENSEIGNANTS) {
      await connection.query(
        `INSERT INTO enseignants (id, doti, nom, nom_fr, etablissement_id, etablissement_nom, commune, grade, matiere, cycle, actif, telephone, email, date_naissance, date_recrutement, echelon, promotion_echelon, promotion_grade, derniere_note, derniere_annee_inspection, derniere_date_inspection, remarques, emploi_du_temps)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [teacher.id, teacher.doti, teacher.nom, teacher.nomFr, teacher.etablissementId, teacher.etablissementNom, teacher.commune, teacher.grade, teacher.matiere, teacher.cycle, teacher.actif, teacher.telephone, teacher.email, teacher.dateNaissance, teacher.dateRecrutement, teacher.echelon, Boolean(teacher.promotionEchelon ?? false), Boolean(teacher.promotionGrade ?? false), typeof teacher.derniereNote === 'number' ? teacher.derniereNote : null, teacher.derniereAnneeInspection, teacher.derniereDateInspection, teacher.remarques, JSON.stringify(teacher.emploiDuTemps || [])]
      );
    }

    for (const activity of INITIAL_ACTIVITIES) {
      await connection.query(
        `INSERT INTO activities (id, type, date, commune, etablissement_id, etablissement_nom, responsable_nom, objet, payload, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [activity.id, activity.type, activity.date, activity.commune, activity.etablissementId, activity.etablissementNom, activity.responsableNom, activity.objet, JSON.stringify(activity), toMysqlDateTime(activity.createdAt), toMysqlDateTime(activity.updatedAt)]
      );
    }

    for (const year of INITIAL_ANNEES_SCOLAIRES) {
      await connection.query('INSERT INTO annees_scolaires (id, libelle, date_debut, date_fin, est_active, statut, description) VALUES (?, ?, ?, ?, ?, ?, ?)', [year.id, year.libelle, year.dateDebut, year.dateFin, year.estActive, year.statut, year.description]);
    }

    await connection.commit();
    res.json({ seeded: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: String(error) });
  } finally {
    connection.release();
  }
});

app.listen(port, () => {
  console.log(`API MySQL locale disponible sur http://localhost:${port}`);
});
