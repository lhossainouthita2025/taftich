import * as XLSX from 'xlsx';
import { Enseignant, Etablissement, Activity, TimetableSlot } from '../types';

export interface ColumnMapping {
  excelColumn: string;
  mappedField: keyof RawTeacherRow | 'ignore';
}

export interface RawTeacherRow {
  la_com: string;
  nom_etaba: string;
  doti: string;
  nom: string;
  itar: string;
  designation: string;
  cycle_exe: string;
  actif: string;
  note: string | number;
  annee: string | number;
}

export interface ImportAnalysisReport {
  fileName: string;
  totalRows: number;
  detectedColumns: string[];
  columnMappings: Record<string, string>;
  communesCount: number;
  etablissementsCount: number;
  teachersCount: number;
  duplicateDotiInFile: string[];
  duplicateDotiInDb: string[];
  missingDotiRows: number[];
  missingSchoolRows: number[];
  invalidScoresRows: number[];
  validRows: RawTeacherRow[];
  parsedTeachers: Partial<Enseignant>[];
}

export class ExcelService {
  // Normalize header strings for fuzzy matching
  static normalizeHeader(header: string): string {
    return header
      .trim()
      .toLowerCase()
      .replace(/[\s_\-–]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/[ى]/g, 'ي');
  }

  // Detect likely field match
  static guessField(header: string): keyof RawTeacherRow | 'ignore' {
    const norm = this.normalizeHeader(header);
    
    // Commune
    if (norm.includes('com') || norm.includes('جماع')) return 'la_com';
    
    // Etablissement
    if (norm.includes('etab') || norm.includes('مؤسس') || norm.includes('مدرس') || norm.includes('ثانوي')) return 'nom_etaba';
    
    // Doti
    if (norm.includes('doti') || norm.includes('تاجير') || norm.includes('somme') || norm.includes('matricule')) return 'doti';
    
    // Nom
    if (norm.includes('nom') || norm.includes('اسم') || norm.includes('enseignant')) return 'nom';
    
    // Itar / Grade
    if (norm.includes('itar') || norm.includes('grade') || norm.includes('اطار') || norm.includes('درج')) return 'itar';
    
    // Designation / Matiere
    if (norm.includes('desig') || norm.includes('matier') || norm.includes('ماد') || norm.includes('تخصص')) return 'designation';
    
    // Cycle
    if (norm.includes('cycle') || norm.includes('سلك')) return 'cycle_exe';
    
    // Actif
    if (norm.includes('actif') || norm.includes('avctif') || norm.includes('نشيط') || norm.includes('وضعي')) return 'actif';
    
    // Note
    if (norm.includes('note') || norm.includes('نقط') || norm.includes('علام')) return 'note';
    
    // Annee
    if (norm.includes('annee') || norm.includes('year') || norm.includes('سن')) return 'annee';

    return 'ignore';
  }

  // Parse Excel file buffer
  static async parseFile(file: File, existingTeachers: Enseignant[]): Promise<ImportAnalysisReport> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Read as array of objects
          const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
          if (!rows || rows.length === 0) {
            throw new Error('Le fichier sélectionné est vide ou ne contient aucune ligne valide.');
          }

          const rawHeaders = Object.keys(rows[0]);
          const columnMappings: Record<string, string> = {};
          rawHeaders.forEach(h => {
            columnMappings[h] = this.guessField(h);
          });

          // Existing DOTIs map
          const existingDotiSet = new Set(existingTeachers.map(t => String(t.doti).trim()));
          const fileDotiMap = new Map<string, number>();

          const communesSet = new Set<string>();
          const etabsSet = new Set<string>();

          const duplicateDotiInFile: string[] = [];
          const duplicateDotiInDb: string[] = [];
          const missingDotiRows: number[] = [];
          const missingSchoolRows: number[] = [];
          const invalidScoresRows: number[] = [];

          const validRows: RawTeacherRow[] = [];
          const parsedTeachers: Partial<Enseignant>[] = [];

          rows.forEach((row, index) => {
            const rowNum = index + 2; // header is line 1
            const item: RawTeacherRow = {
              la_com: '',
              nom_etaba: '',
              doti: '',
              nom: '',
              itar: '',
              designation: '',
              cycle_exe: '',
              actif: 'VRAI',
              note: '',
              annee: ''
            };

            rawHeaders.forEach(h => {
              const field = columnMappings[h];
              if (field && field !== 'ignore') {
                item[field as keyof RawTeacherRow] = String(row[h] ?? '').trim();
              }
            });

            // Check doti
            const dotiStr = String(item.doti).trim();
            if (!dotiStr) {
              missingDotiRows.push(rowNum);
            } else {
              if (fileDotiMap.has(dotiStr)) {
                duplicateDotiInFile.push(`Ligne ${rowNum} (Doti: ${dotiStr})`);
              } else {
                fileDotiMap.set(dotiStr, rowNum);
              }

              if (existingDotiSet.has(dotiStr)) {
                duplicateDotiInDb.push(`Doti ${dotiStr} (déjà dans la base)`);
              }
            }

            // Check school
            if (!item.nom_etaba) {
              missingSchoolRows.push(rowNum);
            } else {
              etabsSet.add(item.nom_etaba);
            }

            if (item.la_com) {
              communesSet.add(item.la_com);
            }

            // Check note
            let parsedNote: number | 'vis' | undefined = undefined;
            const noteStr = String(item.note).toLowerCase().replace(',', '.');
            if (noteStr.includes('vis')) {
              parsedNote = 'vis';
            } else if (noteStr) {
              const num = parseFloat(noteStr);
              if (!isNaN(num)) {
                if (num < 0 || num > 20) {
                  invalidScoresRows.push(rowNum);
                } else {
                  parsedNote = num;
                }
              }
            }

            // Check annee
            let parsedAnnee: number | undefined = undefined;
            const anneeNum = parseInt(String(item.annee), 10);
            if (!isNaN(anneeNum) && anneeNum >= 1980 && anneeNum <= 2040) {
              parsedAnnee = anneeNum;
            }

            validRows.push(item);

            parsedTeachers.push({
              id: `ens-imp-${Date.now()}-${index}`,
              doti: dotiStr || `SANS_DOTI_${rowNum}`,
              nom: item.nom || 'Enseignant non nommé',
              etablissementNom: item.nom_etaba || 'Établissement non précisé',
              etablissementId: '', // To be linked on commit
              commune: item.la_com || 'Inzegane',
              grade: item.itar || 'أستاذ التعليم الثانوي',
              matiere: item.designation || 'المعلوميات',
              cycle: item.cycle_exe.includes('تأه') ? 'تأهيلي' : 'اعدادي',
              actif: item.actif.toUpperCase().includes('VRAI') || item.actif === '1' || item.actif.toLowerCase().includes('oui') || item.actif.toLowerCase().includes('true'),
              derniereNote: parsedNote,
              derniereAnneeInspection: parsedAnnee
            });
          });

          resolve({
            fileName: file.name,
            totalRows: rows.length,
            detectedColumns: rawHeaders,
            columnMappings,
            communesCount: communesSet.size,
            etablissementsCount: etabsSet.size,
            teachersCount: rows.length,
            duplicateDotiInFile,
            duplicateDotiInDb,
            missingDotiRows,
            missingSchoolRows,
            invalidScoresRows,
            validRows,
            parsedTeachers
          });
        } catch (err: any) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier Excel.'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Export Enseignants to Excel
  static exportEnseignantsToExcel(teachers: Enseignant[], fileName: string = 'enseignants_export.xlsx'): void {
    const data = teachers.map(t => ({
      'la_com': t.commune,
      'NOM_ETABA': t.etablissementNom,
      'Doti': t.doti,
      'Nom': t.nom,
      'Itar': t.grade,
      'Designation': t.matiere,
      'Cycle_Exe': t.cycle,
      'Avctif': t.actif ? 'VRAI' : 'FAUX',
      'النقطة': t.derniereNote !== undefined ? t.derniereNote : '',
      'السنة': t.derniereAnneeInspection || '',
      'Téléphone': t.telephone || '',
      'Email': t.email || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Enseignants');
    XLSX.writeFile(wb, fileName);
  }

  // Export Etablissements to Excel
  static exportEtablissementsToExcel(etabs: (Etablissement & { nbEnseignants?: number; nbInspections?: number })[], fileName: string = 'etablissements_export.xlsx'): void {
    const data = etabs.map(e => ({
      'Commune': e.commune,
      'Nom Arabe': e.nomAr,
      'Nom Français': e.nomFr,
      'Type': e.type === 'college' ? 'Collège' : 'Lycée',
      'Pionnier (رائدة)': e.estPionnier ? 'Oui' : 'Non',
      'Direction Provinciale': e.directionProvinciale,
      'Académie': e.academie,
      'Nombre Enseignants': e.nbEnseignants || 0,
      'Nombre Inspections': e.nbInspections || 0,
      'Latitude': e.latitude || '',
      'Longitude': e.longitude || '',
      'Téléphone': e.telephone || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Établissements');
    XLSX.writeFile(wb, fileName);
  }

  // Export Activities to Excel
  static exportActivitiesToExcel(activities: Activity[], fileName: string = 'activites_export.xlsx'): void {
    const data = activities.map(a => ({
      'Date': a.date,
      'Type': a.type.toUpperCase(),
      'Commune': a.commune,
      'Établissement': a.etablissementNom,
      'Responsable / Inspecteur': a.responsableNom,
      'Objet': a.objet,
      'Observations': a.observations || '',
      'Recommandations': a.recommandations || '',
      'Prochaine Échéance': a.prochaineEcheance || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Activités');
    XLSX.writeFile(wb, fileName);
  }

  // Generate Template File for Users to Fill
  static generateTemplateFile(): void {
    const templateData = [
      {
        'la_com': 'إنزكان',
        'NOM_ETABA': 'ثانوية أحمد المنصور الذهبي الإعدادية (رائدة)',
        'Doti': '2050271',
        'Nom': 'عمراوي وئام',
        'Itar': 'أستاذة التعليم الثانوي التأهيلي',
        'Designation': 'المعلوميات',
        'Cycle_Exe': 'اعدادي',
        'Avctif': 'VRAI',
        'النقطة': '14.5',
        'السنة': '2024'
      },
      {
        'la_com': 'أيت ملول',
        'NOM_ETABA': 'ثانوية الياسمين الإعدادية (رائدة)',
        'Doti': '1279075',
        'Nom': 'صادق حسن',
        'Itar': 'أستاذ التعليم الثانوي الاعدادي',
        'Designation': 'المعلوميات',
        'Cycle_Exe': 'اعدادي',
        'Avctif': 'VRAI',
        'النقطة': '19',
        'السنة': '2025'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modèle_Import');
    XLSX.writeFile(wb, 'modele_import_enseignants.xlsx');
  }

  // Parse Enseignants directly
  static async parseEnseignantsExcel(file: File): Promise<Partial<Enseignant>[]> {
    const report = await this.parseFile(file, []);
    return report.parsedTeachers;
  }

  // Parse Etablissements directly
  static async parseEtablissementsExcel(file: File): Promise<Partial<Etablissement>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<any>(firstSheet, { defval: '' });

          const results: Partial<Etablissement>[] = rows.map((row: any, idx) => {
            const nomAr = row['Nom Arabe'] || row['nomAr'] || row['NOM_ETABA'] || row['Établissement'] || `Établissement ${idx + 1}`;
            const nomFr = row['Nom Français'] || row['nomFr'] || nomAr;
            const commune = row['Commune'] || row['la_com'] || 'إنزكان';
            const typeStr = (row['Type'] || '').toLowerCase();
            const type = typeStr.includes('lyc') ? 'lycee' : 'college';
            const estPionnier = String(row['Pionnier'] || row['estPionnier'] || row['رائدة'] || '').toLowerCase().includes('oui') || String(row['estPionnier']) === 'true';

            return {
              nomAr: String(nomAr).trim(),
              nomFr: String(nomFr).trim(),
              commune: String(commune).trim(),
              type,
              estPionnier,
              latitude: row['Latitude'] ? parseFloat(row['Latitude']) : undefined,
              longitude: row['Longitude'] ? parseFloat(row['Longitude']) : undefined,
              telephone: row['Téléphone'] ? String(row['Téléphone']) : undefined,
              email: row['Email'] ? String(row['Email']) : undefined
            };
          });

          resolve(results);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier.'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Parse Emploi du temps slots
  static async parseEmploiDuTempsExcel(file: File): Promise<{ doti: string; slot: TimetableSlot }[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<any>(firstSheet, { defval: '' });

          const results: { doti: string; slot: TimetableSlot }[] = [];

          rows.forEach((row: any) => {
            const doti = String(row['DOTI'] || row['doti'] || row['Somme'] || '').trim();
            if (!doti) return;

            const jour = (row['Jour'] || row['jour'] || 'Lundi') as any;
            const heureDebut = String(row['Heure Début'] || row['heureDebut'] || '08:30');
            const heureFin = String(row['Heure Fin'] || row['heureFin'] || '10:30');
            const classe = String(row['Classe'] || row['classe'] || '3ème ASC');
            const salle = String(row['Salle'] || row['salle'] || 'Salle Info');
            const matiere = String(row['Matière'] || row['matiere'] || 'المعلوميات');

            results.push({
              doti,
              slot: {
                jour,
                heureDebut,
                heureFin,
                classe,
                salle,
                matiere
              }
            });
          });

          resolve(results);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier.'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Download template based on entity type
  static downloadTemplate(type: 'enseignants' | 'etablissements' | 'emplois'): void {
    if (type === 'enseignants') {
      this.generateTemplateFile();
      return;
    }

    if (type === 'etablissements') {
      const templateData = [
        {
          'Nom Arabe': 'ثانوية أحمد المنصور الذهبي الإعدادية (رائدة)',
          'Nom Français': 'Collège Ahmed Al Mansour Dahbi (Pionnier)',
          'Commune': 'إنزكان',
          'Type': 'Collège',
          'Pionnier (رائدة)': 'Oui',
          'Latitude': 30.3541,
          'Longitude': -9.5321,
          'Téléphone': '0528240001',
          'Email': 'mansour.gold@men.gov.ma'
        }
      ];
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Etablissements');
      XLSX.writeFile(wb, 'modele_import_etablissements.xlsx');
      return;
    }

    const templateData = [
      {
        'DOTI': '2050271',
        'Jour': 'Lundi',
        'Heure Début': '08:30',
        'Heure Fin': '10:30',
        'Classe': '2ème ASC 1',
        'Salle': 'Salle Informatique 1',
        'Matière': 'المعلوميات'
      },
      {
        'DOTI': '2050271',
        'Jour': 'Mardi',
        'Heure Début': '14:30',
        'Heure Fin': '16:30',
        'Classe': '3ème ASC 2',
        'Salle': 'Salle Informatique 1',
        'Matière': 'المعلوميات'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'EmploisDuTemps');
    XLSX.writeFile(wb, 'modele_import_emplois_du_temps.xlsx');
  }

  // Generic table export
  static exportTableToExcel(data: any[], fileName: string = 'export.xlsx', sheetName: string = 'Feuille 1'): void {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
  }
}
