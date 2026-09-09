import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileCheck, 
  Eye, 
  UsersRound, 
  GraduationCap, 
  Save, 
  Calendar, 
  Clock, 
  Award, 
  User, 
  School,
  Check
  , Upload
} from 'lucide-react';
import { Activity, Enseignant, Etablissement, Commune, InspectionActivity, VisiteActivity, RencontreActivity, FormationActivity, ActivityType, GenericActivity } from '../../types';
import { useI18n } from '../../i18n';

interface NewActivityModalProps {
  initialType?: ActivityType;
  initialData?: Activity;
  prefilledTeacher?: Enseignant;
  prefilledSchool?: Etablissement;
  enseignants: Enseignant[];
  etablissements: Etablissement[];
  communes: Commune[];
  inspecteurs?: any[];
  onSave: (activity: Activity, updatedTeacher?: Enseignant) => void;
  onClose: () => void;
}

export const NewActivityModal: React.FC<NewActivityModalProps> = ({
  initialType = 'inspection',
  initialData,
  prefilledTeacher,
  prefilledSchool,
  enseignants,
  etablissements,
  communes,
  inspecteurs,
  onSave,
  onClose
}) => {
  const { t, language } = useI18n();

  const [type, setType] = useState<ActivityType>(
    initialData ? initialData.type : initialType
  );
  
  // General Fields
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10));
  const [heure, setHeure] = useState(initialData?.heure || '09:00');
  const [objet, setObjet] = useState(initialData?.objet || '');
  const [responsableNom, setResponsableNom] = useState(
    initialData?.responsableNom || 'المفتش التربوي ذ. الحسين أتحيتى'
  );
  const [commune, setCommune] = useState(initialData?.commune || 'إنزكان');
  const [etablissementId, setEtablissementId] = useState(initialData?.etablissementId || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [observations, setObservations] = useState(initialData?.observations || '');
  const [recommandations, setRecommandations] = useState(initialData?.recommandations || '');

  // Inspection Specific
  const initialInsp = initialData && initialData.type === 'inspection' ? (initialData as InspectionActivity) : null;
  const initialVis = initialData && initialData.type === 'visite' ? (initialData as VisiteActivity) : null;
  const initialForm = initialData && initialData.type === 'formation' ? (initialData as FormationActivity) : null;
  const initialRenc = initialData && initialData.type === 'rencontre' ? (initialData as RencontreActivity) : null;

  const [selectedTeacherId, setSelectedTeacherId] = useState(
    initialInsp?.enseignantId || initialVis?.enseignantsIds?.[0] || prefilledTeacher?.id || ''
  );
  const [note, setNote] = useState(
    initialInsp && initialInsp.note !== undefined ? String(initialInsp.note) : '15'
  );
  const [isVisiteSansNote, setIsVisiteSansNote] = useState(
    initialInsp ? (initialInsp.note === undefined || (initialInsp.note as any) === 'vis') : false
  );
  const [typeInspection, setTypeInspection] = useState<'périodique' | 'titularisation' | 'promotion'>(
    initialInsp?.typeInspection === 'titularisation' ? 'titularisation' :
    initialInsp?.typeInspection === 'avancement' ? 'promotion' : 'périodique'
  );
  const [pointsForts, setPointsForts] = useState(initialInsp?.pointsForts || '');
  const [pointsAmeliorer, setPointsAmeliorer] = useState(initialInsp?.pointsAmeliorer || '');
  const [appreciation, setAppreciation] = useState(initialInsp?.appreciation || '');
  const [rapportNom, setRapportNom] = useState(initialData?.rapportNom || '');
  const [rapportType, setRapportType] = useState(initialData?.rapportType || '');
  const [rapportData, setRapportData] = useState(initialData?.rapportData || '');

  // Rencontre / Formation Specific
  const [selectedParticipantsIds, setSelectedParticipantsIds] = useState<string[]>(
    initialForm?.participantsIds || initialRenc?.participantsIds || []
  );
  const [participantSearch, setParticipantSearch] = useState('');
  const [dureeHeures, setDureeHeures] = useState(initialForm?.dureeHeures || 3);
  const [module, setModule] = useState(
    initialForm?.theme || initialForm?.contenu || initialRenc?.theme || 'ديداكتيك وتدبير أنشطة المعلوميات'
  );
  const [typeReunion, setTypeReunion] = useState<'régionale' | 'provinciale' | 'Conseil régional de coordination de l’inspection' | 'Conseil provincial de coordination de l’inspection'>(
    initialData?.typeReunion || 'régionale'
  );
  const [sujetVisite, setSujetVisite] = useState<'accompagnement' | 'suivi de la rentrée scolaire' | 'suivi de la remédiation pédagogique' | 'autre'>(
    initialData?.sujetVisite || 'accompagnement'
  );
  const [operationSuiviExamen, setOperationSuiviExamen] = useState<'chef du centre d’examen' | 'observation' | 'correction des copies' | 'élaboration des épreuves' | 'autre'>(
    initialData?.operationSuiviExamen || 'observation'
  );
  const [roleFormation, setRoleFormation] = useState<'formateur' | 'formé'>(
    initialData?.roleFormation || 'formateur'
  );

  const inspectionTypeOptions = [
    { value: 'périodique', label: language === 'ar' ? 'تقرير دوري' : language === 'en' ? 'Periodic inspection' : 'Inspection périodique' },
    { value: 'titularisation', label: language === 'ar' ? 'الترسيم' : language === 'en' ? 'Tenure' : 'Titularisation' },
    { value: 'promotion', label: language === 'ar' ? 'الترقية' : language === 'en' ? 'Promotion' : 'Promotion au choix' }
  ];

  const visitSubjectOptions = [
    { value: 'accompagnement', label: language === 'ar' ? 'المواكبة' : language === 'en' ? 'Support' : 'Accompagnement' },
    { value: 'suivi de la rentrée scolaire', label: language === 'ar' ? 'متابعة rentrée المدرسة' : language === 'en' ? 'School year opening follow-up' : 'Suivi de la rentrée scolaire' },
    { value: 'suivi de la remédiation pédagogique', label: language === 'ar' ? 'متابعة العلاج التربوي' : language === 'en' ? 'Pedagogical remediation follow-up' : 'Suivi de la remédiation pédagogique' },
    { value: 'autre', label: language === 'ar' ? 'أخرى' : language === 'en' ? 'Other' : 'Autre' }
  ];

  const meetingTypeOptions = [
    { value: 'régionale', label: language === 'ar' ? 'جهوي' : language === 'en' ? 'Regional' : 'Régionale' },
    { value: 'provinciale', label: language === 'ar' ? 'إقليمي' : language === 'en' ? 'Provincial' : 'Provinciale' },
    { value: 'Conseil régional de coordination de l’inspection', label: language === 'ar' ? 'مجلس التنسيق الجهوي للتفتيش' : language === 'en' ? 'Regional inspection coordination council' : 'Conseil régional de coordination de l’inspection' },
    { value: 'Conseil provincial de coordination de l’inspection', label: language === 'ar' ? 'مجلس التنسيق الإقليمي للتفتيش' : language === 'en' ? 'Provincial inspection coordination council' : 'Conseil provincial de coordination de l’inspection' }
  ];

  const examOperationOptions = [
    { value: 'chef du centre d’examen', label: language === 'ar' ? 'رئيس مركز الامتحان' : language === 'en' ? 'Exam center director' : 'Chef du centre d’examen' },
    { value: 'observation', label: language === 'ar' ? 'المراقبة' : language === 'en' ? 'Observation' : 'Observation' },
    { value: 'correction des copies', label: language === 'ar' ? 'تصحيح الأوراق' : language === 'en' ? 'Marking papers' : 'Correction des copies' },
    { value: 'élaboration des épreuves', label: language === 'ar' ? 'إعداد الامتحانات' : language === 'en' ? 'Preparing exams' : 'Élaboration des épreuves' },
    { value: 'autre', label: language === 'ar' ? 'أخرى' : language === 'en' ? 'Other' : 'Autre' }
  ];

  // Pre-fill setup
  useEffect(() => {
    if (initialData) return;
    if (prefilledTeacher) {
      setSelectedTeacherId(prefilledTeacher.id);
      setCommune(prefilledTeacher.commune);
      setEtablissementId(prefilledTeacher.etablissementId);
      if (type === 'inspection') {
        setObjet(`تفتيش تربوي رسمي للأستاذ(ة) ${prefilledTeacher.nom}`);
      } else if (type === 'visite') {
        setObjet(`زيارة تأطيرية وتوجيهية للأستاذ(ة) ${prefilledTeacher.nom}`);
      }
    } else if (prefilledSchool) {
      setCommune(prefilledSchool.commune);
      setEtablissementId(prefilledSchool.id);
      if (type === 'visite') {
        setObjet(`زيارة تفقدية وتأطيرية لمؤسسة ${prefilledSchool.nomAr}`);
      }
    } else if (!etablissementId && etablissements.length > 0) {
      setEtablissementId(etablissements[0].id);
      setCommune(etablissements[0].commune);
    }
  }, [prefilledTeacher, prefilledSchool, etablissements, initialData]);

  // Default objet when type changes
  useEffect(() => {
    if (initialData) return;
    if (!objet) {
      if (type === 'inspection') setObjet("تفتيش دوري لتقويم الأداء التربوي والديداكتيكي");
      if (type === 'visite') setObjet("زيارة صفية لتشخيص الممارسات الصفية وتقديم الدعم");
      if (type === 'rencontre') setObjet("لقاء تنسيقي مع أساتذة مادة المعلوميات");
      if (type === 'formation') setObjet("دورة تكوينية حول المقاربة بالكفايات ومستجدات المنهاج");
      if (type === 'reunion') setObjet("اجتماع تنسيقي مع الأطراف المعنية");
      if (type === 'validation_fiches') setObjet("مراجعة fiches personnelles و emplois du temps");
      if (type === 'suivi_examens') setObjet("متابعة تنظيم ومراقبة الامتحانات");
      if (type === 'visite_pionniere') setObjet("مواكبة مؤسسة رائدة");
      if (type === 'visite_non_pionniere') setObjet("مواكبة مؤسسة غير رائدة");
      if (type === 'rencontre_administrative') setObjet("لقاء مواكبة الأطر الإدارية الجديدة");
      if (type === 'cours_experimentation') setObjet("دروس تجريبية");
      if (type === 'remise_missions') setObjet("عملية لجان تسليم المهام");
      if (type === 'recherche_pedagogique') setObjet("البحث التربوي والانتاجات");
      if (type === 'qualite_suivi') setObjet("المداومة/المداولات/مراقبة الجودة/الإشراف على التصحيح/البث في الشكايات");
      if (type === 'comite_suivi') setObjet("لجنة المتابعة");
      if (type === 'comite_soutien') setObjet("لجنة الدعم");
      if (type === 'reunion_nationale') setObjet("اجتماع/تظاهرة على المستوى الوطني");
      if (type === 'reunion_regionale') setObjet("اجتماع/تظاهرة على المستوى الجهوي");
      if (type === 'reunion_provinciale') setObjet("اجتماع/تظاهرة على المستوى الإقليمي");
      if (type === 'reunion_coordination_regionale') setObjet("اجتماعات على مستوى التنسيق الإقليمي");
      if (type === 'reunion_coordination_gho') setObjet("اجتماعات على مستوى المنسقيات الجهوية التخصصية / المجلس الجهوي لتنسيق التفتيش");
      if (type === 'participation_programmes_nationaux') setObjet("المشاركة في البرامج والمهام الوطنية");
      if (type === 'proposition_sujets') setObjet("اقتراح وإعداد المواضيع");
    }
  }, [type, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedEtab = etablissements.find(et => et.id === etablissementId);
    const etabNom = selectedEtab ? selectedEtab.nomAr : 'Établissement';
    const currentCommune = selectedEtab ? selectedEtab.commune : commune;

    const nowIso = new Date().toISOString();
    const baseActivity = {
      id: initialData?.id || `act-${Date.now()}`,
      type,
      date,
      heure,
      objet: objet.trim() || `${type.toUpperCase()} - ${etabNom}`,
      responsableNom,
      commune: currentCommune,
      etablissementId,
      etablissementNom: etabNom,
      description,
      observations,
      recommandations,
      rapportNom: rapportNom || undefined,
      rapportType: rapportType || undefined,
      rapportData: rapportData || undefined,
      typeReunion,
      sujetVisite,
      operationSuiviExamen,
      roleFormation,
      createdAt: initialData?.createdAt || nowIso,
      updatedAt: nowIso
    };

    let updatedTeacher: Enseignant | undefined = undefined;
    const participantsNoms = enseignants
      .filter(t => selectedParticipantsIds.includes(t.id))
      .map(t => t.nom);

    if (type === 'inspection') {
      const teacher = enseignants.find(t => t.id === selectedTeacherId);
      const parsedNote = isVisiteSansNote ? 'vis' : parseFloat(note.replace(',', '.'));
      const parsedAnnee = new Date(date).getFullYear();

      const inspTypeKey: 'periodique' | 'titularisation' | 'avancement' | 'speciale' = 
        typeInspection === 'titularisation' ? 'titularisation' : 
        typeInspection === 'promotion' ? 'avancement' : 'periodique';

      const insp: InspectionActivity = {
        ...baseActivity,
        type: 'inspection',
        enseignantId: selectedTeacherId,
        enseignantNom: teacher ? teacher.nom : 'Enseignant',
        doti: teacher ? teacher.doti : '',
        matiere: teacher ? teacher.matiere : 'المعلوميات',
        cycle: teacher ? teacher.cycle : 'اعدادي',
        inspecteurNom: responsableNom,
        note: isVisiteSansNote ? undefined : (isNaN(parsedNote as number) ? 14 : (parsedNote as number)),
        typeInspection: inspTypeKey,
        pointsForts: pointsForts || 'تدبير جيد للأنشطة الصفية واستعمال أمثل للوسائط التعليمية',
        pointsAmeliorer: pointsAmeliorer || 'مواصلة التكوين الذاتي وتنويع أساليب التقويم التكويني',
        appreciation: appreciation || `عمل تربوي جاد ومنتظم. تم تسجيل تفاعل إيجابي مع المتعلمين.`
      };

      if (teacher) {
        updatedTeacher = {
          ...teacher,
          derniereNote: parsedNote,
          derniereAnneeInspection: isVisiteSansNote ? teacher.derniereAnneeInspection : parsedAnnee
        };
      }

      onSave(insp, updatedTeacher);
    } else if (type === 'visite') {
      const teacher = enseignants.find(t => t.id === selectedTeacherId);
      const vis: VisiteActivity = {
        ...baseActivity,
        type: 'visite',
        enseignantsIds: selectedTeacherId ? [selectedTeacherId] : [],
        enseignantsNoms: teacher ? [teacher.nom] : [],
        estGlobale: !selectedTeacherId,
        motif: objet,
        objectifs: description || 'المواكبة والتأطير الميداني',
        statut: 'realisee',
        sujetVisite
      };
      onSave(vis);
    } else if (type === 'formation') {
      const form: FormationActivity = {
        ...baseActivity,
        type: 'formation',
        intitule: objet,
        formateur: responsableNom,
        theme: module,
        objectifs: description || 'تنمية الكفايات المهنية والديداكتيكية',
        contenu: description || module,
        participantsIds: selectedParticipantsIds,
        participantsNoms,
        dureeHeures,
        lieu: etabNom,
        roleFormation
      };
      onSave(form);
    } else if (type === 'reunion') {
      const reunionActivity: Activity = {
        ...baseActivity,
        type: 'reunion',
        theme: objet,
        objectifs: description || 'تنسيق العمل التربوي وتقاسم الممارسات الناجعة',
        participantsIds: selectedParticipantsIds,
        participantsNoms,
        estIndividuelle: selectedParticipantsIds.length <= 1,
        compteRendu: observations || description || 'تم استعراض جدول الأعمال ومناقشة المستجدات التربوية',
        decisions: recommandations || 'التزام بالسياق المنهاجي وتتبع دفاتر التحضير',
        typeReunion
      };
      onSave(reunionActivity);
    } else if (type === 'validation_fiches') {
      const validationActivity: Activity = {
        ...baseActivity,
        type: 'validation_fiches',
        theme: objet,
        objectifs: description || 'مراجعة fiches personnelles des enseignants et emplois du temps',
        participantsIds: selectedParticipantsIds,
        participantsNoms,
        estIndividuelle: selectedParticipantsIds.length <= 1,
        compteRendu: observations || description || 'تمت مراجعة الفهارس وتسجيل الملاحظات',
        decisions: recommandations || 'متابعة التصحيحات والرفع النهائي'
      };
      onSave(validationActivity);
    } else if (type === 'suivi_examens') {
      const suiviExamensActivity: Activity = {
        ...baseActivity,
        type: 'suivi_examens',
        theme: objet,
        objectifs: description || 'متابعة سير examens وتعليمات التشغيل',
        participantsIds: selectedParticipantsIds,
        participantsNoms,
        estIndividuelle: selectedParticipantsIds.length <= 1,
        compteRendu: observations || description || 'تمت متابعة العملية ومراجعة الترتيبات',
        decisions: recommandations || 'إعداد تقرير تقويمي مع التوصيات',
        operationSuiviExamen
      };
      onSave(suiviExamensActivity);
    } else if (
      type === 'visite_pionniere' ||
      type === 'visite_non_pionniere' ||
      type === 'rencontre_administrative' ||
      type === 'cours_experimentation' ||
      type === 'remise_missions' ||
      type === 'recherche_pedagogique' ||
      type === 'qualite_suivi' ||
      type === 'comite_suivi' ||
      type === 'comite_soutien' ||
      type === 'reunion_nationale' ||
      type === 'reunion_regionale' ||
      type === 'reunion_provinciale' ||
      type === 'reunion_coordination_regionale' ||
      type === 'reunion_coordination_gho' ||
      type === 'participation_programmes_nationaux' ||
      type === 'proposition_sujets'
    ) {
      const genericActivity: GenericActivity = {
        ...baseActivity,
        type,
        theme: objet,
        objectifs: description || 'تنفيذ النشاط التربوي والمهام المرافقة',
        participantsIds: selectedParticipantsIds,
        participantsNoms,
        estIndividuelle: selectedParticipantsIds.length <= 1,
        compteRendu: observations || description || 'تم تسجيل النشاط ومناقشة مخرجاته.',
        decisions: recommandations || 'متابعة التنفيذ والرفع النهائي.'
      };
      onSave(genericActivity);
    } else {
      const renc: RencontreActivity = {
        ...baseActivity,
        type: 'rencontre',
        theme: objet,
        objectifs: description || 'تنسيق العمل التربوي وتقاسم الممارسات الناجعة',
        participantsIds: selectedParticipantsIds,
        participantsNoms,
        estIndividuelle: selectedParticipantsIds.length <= 1,
        compteRendu: observations || description || 'تم استعراض جدول الأعمال ومناقشة المستجدات التربوية',
        decisions: recommandations || 'التزام بالسياق المنهاجي وتتبع دفاتر التحضير'
      };
      onSave(renc);
    }

    onClose();
  };

  const toggleParticipant = (tId: string) => {
    if (selectedParticipantsIds.includes(tId)) {
      setSelectedParticipantsIds(selectedParticipantsIds.filter(id => id !== tId));
    } else {
      setSelectedParticipantsIds([...selectedParticipantsIds, tId]);
    }
  };

  const selectAllFiltered = () => {
    const ids = teachersForCommune.map(t => t.id);
    setSelectedParticipantsIds(Array.from(new Set([...selectedParticipantsIds, ...ids])));
  };

  const teachersForCommune = enseignants.filter(t => {
    if (participantSearch.trim()) {
      const q = participantSearch.toLowerCase();
      return t.nom.toLowerCase().includes(q) || t.doti.includes(q) || t.etablissementNom.toLowerCase().includes(q);
    }
    return true;
  });

  const normalizeText = (value: string) => value.trim().toLowerCase();
  const selectedInspecteur = (inspecteurs || []).find(inspecteur => {
    const fullName = `${inspecteur.prenom || ''} ${inspecteur.nom || ''}`.trim();
    return normalizeText(responsableNom).includes(normalizeText(fullName));
  }) || ((inspecteurs || []).length === 1 ? inspecteurs?.[0] : undefined);
  const inspectorMatiere = normalizeText(selectedInspecteur?.matiere || '');
  const teachersForVisite = enseignants.filter(teacher => {
    if (teacher.etablissementId !== etablissementId) return false;
    if (!inspectorMatiere || inspectorMatiere.includes('toutes') || inspectorMatiere.includes('tous')) return true;
    const teacherMatiere = normalizeText(teacher.matiere);
    return teacherMatiere.includes(inspectorMatiere) || inspectorMatiere.includes(teacherMatiere);
  });

  useEffect(() => {
    if (type !== 'visite' || !selectedTeacherId) return;
    if (!teachersForVisite.some(teacher => teacher.id === selectedTeacherId)) {
      setSelectedTeacherId('');
    }
  }, [type, selectedTeacherId, etablissementId, responsableNom, inspecteurs, enseignants]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {type === 'inspection' && <FileCheck className="w-5 h-5 text-blue-400" />}
            {type === 'visite' && <Eye className="w-5 h-5 text-teal-400" />}
            {type === 'formation' && <GraduationCap className="w-5 h-5 text-purple-400" />}
            {type === 'rencontre' && <UsersRound className="w-5 h-5 text-amber-400" />}
            <h3 className="text-base font-bold">
              {initialData ? `${t('editActivity')}: ${initialData.objet}` : t('newPedagogicalActivity')}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Type Choice */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">{t('interventionType')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => setType('inspection')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'inspection'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                {t('inspections')}
              </button>

              <button
                type="button"
                onClick={() => setType('visite')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'visite'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Eye className="w-4 h-4" />
                {t('visits')}
              </button>

              <button
                type="button"
                onClick={() => setType('formation')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'formation'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                {t('trainings')}
              </button>

              <button
                type="button"
                onClick={() => setType('rencontre')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'rencontre'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UsersRound className="w-4 h-4" />
                {t('meetings')}
              </button>

              <button
                type="button"
                onClick={() => setType('reunion')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'reunion'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UsersRound className="w-4 h-4" />
                {t('reunion')}
              </button>

              <button
                type="button"
                onClick={() => setType('validation_fiches')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'validation_fiches'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Check className="w-4 h-4" />
                {t('fichesAndTimetables')}
              </button>

              <button
                type="button"
                onClick={() => setType('suivi_examens')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'suivi_examens'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                {t('examTracking')}
              </button>

              <button
                type="button"
                onClick={() => setType('visite_pionniere')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'visite_pionniere'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Eye className="w-4 h-4" />
                {t('pioneerVisits')}
              </button>

              <button
                type="button"
                onClick={() => setType('visite_non_pionniere')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'visite_non_pionniere'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Eye className="w-4 h-4" />
                {t('nonPioneerVisits')}
              </button>

              <button
                type="button"
                onClick={() => setType('rencontre_administrative')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'rencontre_administrative'
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UsersRound className="w-4 h-4" />
                {t('administrativeMeetings')}
              </button>

              <button
                type="button"
                onClick={() => setType('cours_experimentation')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'cours_experimentation'
                    ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                {t('experimentalLessons')}
              </button>

              <button
                type="button"
                onClick={() => setType('recherche_pedagogique')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'recherche_pedagogique'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                {t('pedagogicalResearch')}
              </button>

              <button
                type="button"
                onClick={() => setType('participation_programmes_nationaux')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'participation_programmes_nationaux'
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UsersRound className="w-4 h-4" />
                {t('nationalPrograms')}
              </button>

              <button
                type="button"
                onClick={() => setType('reunion_nationale')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'reunion_nationale'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UsersRound className="w-4 h-4" />
                {t('nationalMeetings')}
              </button>

              <button
                type="button"
                onClick={() => setType('reunion_regionale')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'reunion_regionale'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UsersRound className="w-4 h-4" />
                {t('regionalMeetings')}
              </button>

              <button
                type="button"
                onClick={() => setType('reunion_provinciale')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'reunion_provinciale'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UsersRound className="w-4 h-4" />
                {t('provincialMeetings')}
              </button>

              <button
                type="button"
                onClick={() => setType('reunion_coordination_regionale')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'reunion_coordination_regionale'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UsersRound className="w-4 h-4" />
                {t('regionalCoordinationMeetings')}
              </button>

              <button
                type="button"
                onClick={() => setType('reunion_coordination_gho')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'reunion_coordination_gho'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UsersRound className="w-4 h-4" />
                {t('ghoCoordinationMeetings')}
              </button>

              <button
                type="button"
                onClick={() => setType('qualite_suivi')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'qualite_suivi'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Check className="w-4 h-4" />
                {t('qualityMonitoring')}
              </button>

              <button
                type="button"
                onClick={() => setType('comite_suivi')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'comite_suivi'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UsersRound className="w-4 h-4" />
                {t('followUpCommittees')}
              </button>

              <button
                type="button"
                onClick={() => setType('comite_soutien')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'comite_soutien'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UsersRound className="w-4 h-4" />
                {t('supportCommittees')}
              </button>

              <button
                type="button"
                onClick={() => setType('remise_missions')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'remise_missions'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Check className="w-4 h-4" />
                {t('missionHandovers')}
              </button>

              <button
                type="button"
                onClick={() => setType('proposition_sujets')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'proposition_sujets'
                    ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                {t('topicProposals')}
              </button>
            </div>
          </div>

          {(type === 'inspection' || type === 'visite') && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                {language === 'ar' ? 'تقرير الزيارة (PDF أو DOCX)' : language === 'en' ? 'Visit report (PDF or DOCX)' : 'Rapport de visite (PDF ou DOCX)'}
              </label>
              <input
                type="file"
                accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                onChange={event => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 7 * 1024 * 1024) {
                    event.target.value = '';
                    window.alert('Le rapport ne doit pas dépasser 7 Mo.');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    setRapportNom(file.name);
                    setRapportType(file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
                    setRapportData(String(reader.result));
                  };
                  reader.readAsDataURL(file);
                }}
                className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-700"
              />
              {rapportNom && <p className="text-[11px] text-slate-600">{t('selectedFile')} <strong>{rapportNom}</strong></p>}
            </div>
          )}

          {/* Date, Heure & Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('interventionDate')}</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('time')}</label>
              <input
                type="time"
                value={heure}
                onChange={e => setHeure(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('intervenantInspector')}</label>
              <input
                type="text"
                list="inspecteurs-datalist"
                value={responsableNom}
                onChange={e => setResponsableNom(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
                placeholder="Ex: المفتش التربوي ذ. الحسين أتحيتى"
                required
              />
              <datalist id="inspecteurs-datalist">
                {inspecteurs && inspecteurs.map(ins => (
                  <option key={ins.id} value={`المفتش التربوي ذ. ${ins.prenom} ${ins.nom}`}>
                    {ins.direction ? `${ins.direction} - ` : ''}{ins.specialite || 'Inspecteur'}
                  </option>
                ))}
                <option value="المفتش التربوي ذ. الحسين أتحيتى" />
                <option value="المفتش التربوي ذ. مصطفى العمراني" />
              </datalist>
            </div>
          </div>

          {/* Établissement & Commune */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('community')}</label>
              <select
                value={commune}
                onChange={e => {
                  setCommune(e.target.value);
                  const firstEtab = etablissements.find(et => et.commune === e.target.value);
                  if (firstEtab) setEtablissementId(firstEtab.id);
                }}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {communes.map(c => (
                  <option key={c.id} value={c.nomAr}>{c.nomAr} ({c.nomFr})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('school')}</label>
              <select
                value={etablissementId}
                onChange={e => setEtablissementId(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white truncate"
              >
                {etablissements
                  .filter(e => e.commune === commune)
                  .map(e => (
                    <option key={e.id} value={e.id}>{e.nomAr}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Objet */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t('activityObjective')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={objet}
              onChange={e => setObjet(e.target.value)}
              placeholder="Ex: تفتيش رسمي دوري / مواكبة وتتبع الممارسات الصفية"
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600"
              required
            />
          </div>

          {/* INSPECTION SPECIFIC SECTION */}
          {type === 'inspection' && (
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                <FileCheck className="w-4 h-4 text-blue-600" />
                {t('pedagogicalReportAndEvaluation')}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t('inspectedTeacher')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={e => setSelectedTeacherId(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                    required
                  >
                    <option value="">
                      {language === 'ar' ? 'اختر أستاذًا...' : language === 'en' ? 'Select a teacher...' : 'Sélectionner un enseignant...'}
                    </option>
                    {enseignants.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nom} (Doti: {t.doti}) - {t.etablissementNom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('inspectionReason')}</label>
                  <select
                    value={typeInspection}
                    onChange={e => setTypeInspection(e.target.value as any)}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    {inspectionTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note /20 */}
              <div className="p-3 bg-white rounded-xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <label className="text-xs font-bold text-slate-900 block">
                      {language === 'ar' ? 'الدرجة المعطاة من 20' : language === 'en' ? 'Score out of 20' : 'Note attribuée sur 20'}
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {language === 'ar' ? 'معدل بطاقة التقييم الرسمية' : language === 'en' ? 'Average of the official grading sheet' : 'Moyenne de la fiche officielle de notation'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isVisiteSansNote && (
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      className="w-24 py-1.5 px-3 text-sm font-bold font-mono text-center rounded-lg border border-slate-300 focus:outline-emerald-600"
                    />
                  )}
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVisiteSansNote}
                      onChange={e => setIsVisiteSansNote(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    {t('visitWithoutGrade')}
                  </label>
                </div>
              </div>

              {/* Appréciation générale */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t('generalPedagogicalAssessment')}
                </label>
                <textarea
                  rows={2}
                  value={appreciation}
                  onChange={e => setAppreciation(e.target.value)}
                  placeholder="Ex: تميز الأستاذ بإعداد جذاذات محكمة واستعمال هادف للديداكتيك الرقمي..."
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>

              {/* Points forts & À améliorer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-emerald-800 block mb-1">{t('observedStrengths')}</label>
                  <textarea
                    rows={2}
                    value={pointsForts}
                    onChange={e => setPointsForts(e.target.value)}
                    placeholder="Ex: تدبير زمني جيد، تشجيع العمل بالمجموعات..."
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-amber-800 block mb-1">{t('areasToStrengthen')}</label>
                  <textarea
                    rows={2}
                    value={pointsAmeliorer}
                    onChange={e => setPointsAmeliorer(e.target.value)}
                    placeholder="Ex: تنويع الوضعيات الإدماجية ومراعاة الفوارق الفردية..."
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* VISITE SPECIFIC */}
          {type === 'visite' && (
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wider block">
                {t('fieldVisitTargeting')}
              </span>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t('visitedTeacherOptional')}</label>
                <select
                  value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">
                    {language === 'ar' ? 'زيارة عامة للمؤسسة' : language === 'en' ? 'General school visit' : 'Visite générale de l’établissement'}
                  </option>
                  {teachersForVisite.map(t => (
                    <option key={t.id} value={t.id}>{t.nom} ({t.etablissementNom})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t('visitSubject')}</label>
                <select
                  value={sujetVisite}
                  onChange={e => setSujetVisite(e.target.value as any)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  {visitSubjectOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* FORMATION & RENCONTRE MULTI-TEACHER SELECTOR */}
          {(type === 'formation' || type === 'rencontre' || type === 'reunion' || type === 'validation_fiches' || type === 'suivi_examens') && (
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                  {t('participants')} ({selectedParticipantsIds.length} {t('selected')})
                </span>
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="text-xs text-purple-700 font-bold hover:underline"
                >
                  {t('selectAll')}
                </button>
              </div>

              <input
                type="text"
                value={participantSearch}
                onChange={e => setParticipantSearch(e.target.value)}
                placeholder={t('filterTeachersToInvite')}
                className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white"
              />

              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
                {teachersForCommune.slice(0, 30).map(t => {
                  const isChecked = selectedParticipantsIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleParticipant(t.id)}
                      className="p-2 flex items-center justify-between text-xs hover:bg-slate-50 cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{t.nom}</span>
                        <span className="text-[11px] text-slate-400 ml-2">{t.etablissementNom} ({t.commune})</span>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {type === 'formation' && (
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('trainingRole')}</label>
              <select
                value={roleFormation}
                onChange={e => setRoleFormation(e.target.value as 'formateur' | 'formé')}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="formateur">{t('trainer')}</option>
                <option value="formé">{t('trained')}</option>
              </select>
            </div>
          )}

          {type === 'reunion' && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('meetingType')}</label>
              <select
                value={typeReunion}
                onChange={e => setTypeReunion(e.target.value as any)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {meetingTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {type === 'suivi_examens' && (
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('examOperation')}</label>
              <select
                value={operationSuiviExamen}
                onChange={e => setOperationSuiviExamen(e.target.value as any)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {examOperationOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Description & Recommandations */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('observationsAndSummary')}</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description des activités menées..."
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('recommendationsAndGuidance')}</label>
              <textarea
                rows={2}
                value={recommandations}
                onChange={e => setRecommandations(e.target.value)}
                placeholder="Directives pédagogiques et suivi prescrit..."
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {initialData ? t('updateActivity') : t('saveActivity')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
