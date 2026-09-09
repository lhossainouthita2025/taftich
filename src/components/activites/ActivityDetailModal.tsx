import React from 'react';
import { X, Printer, FileCheck, Eye, UsersRound, GraduationCap, School, User, Calendar, Award, Edit3, Download } from 'lucide-react';
import { Activity, Enseignant, Etablissement } from '../../types';
import { useI18n } from '../../i18n';

interface ActivityDetailModalProps {
  activity: Activity;
  enseignants: Enseignant[];
  etablissements: Etablissement[];
  onOpenEditActivity?: (activity: Activity) => void;
  onClose: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  enseignants,
  etablissements,
  onOpenEditActivity,
  onClose
}) => {
  const { t } = useI18n();
  const isInsp = activity.type === 'inspection';
  const isVis = activity.type === 'visite';
  const isForm = activity.type === 'formation';
  const isRenc = activity.type === 'rencontre';
  const isReunion = activity.type === 'reunion';
  const isValidation = activity.type === 'validation_fiches';
  const isExam = activity.type === 'suivi_examens';

  const inspData = isInsp ? (activity as any) : null;
  const teacher = inspData ? enseignants.find(t => t.id === inspData.enseignantId || t.doti === inspData.doti) : null;
  const etab = etablissements.find(e => e.id === activity.etablissementId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div 
        id="activity-detail-modal"
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header toolbar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className={`p-1.5 rounded-lg text-white ${
              isInsp ? 'bg-blue-600' :
              isVis ? 'bg-teal-600' :
              isForm ? 'bg-purple-600' :
              isReunion ? 'bg-amber-600' :
              isValidation ? 'bg-sky-600' :
              isExam ? 'bg-rose-600' :
              'bg-amber-600'
            }`}>
              {isInsp && <FileCheck className="w-4 h-4" />}
              {isVis && <Eye className="w-4 h-4" />}
              {isForm && <GraduationCap className="w-4 h-4" />}
              {isRenc && <UsersRound className="w-4 h-4" />}
              {isReunion && <UsersRound className="w-4 h-4" />}
              {isValidation && <FileCheck className="w-4 h-4" />}
              {isExam && <Award className="w-4 h-4" />}
            </span>
            <h3 className="text-base font-bold">
              {isInsp ? t('officialInspections') : `${t('activities')}: ${activity.type.toUpperCase()}`}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {onOpenEditActivity && (
              <button
                onClick={() => onOpenEditActivity(activity)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title={t('editProfile')}
              >
                <Edit3 className="w-4 h-4" />
                <span>{t('editProfile')}</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('annualReport')}</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 text-slate-900 font-sans print:p-0">
          {/* Official Moroccan Header */}
          <div className="border-b-2 border-slate-900 pb-5 text-center relative">
            <div className="flex justify-between items-start text-xs font-bold text-slate-800">
              <div className="text-left space-y-0.5">
                <p>المملكة المغربية</p>
                <p>وزارة التربية الوطنية والتعليم الأولي والرياضة</p>
                <p>الأكاديمية الجهوية للتربية والتكوين - سوس ماسة</p>
                <p>المديرية الإقليمية بإنزكان - أيت ملول</p>
              </div>

              <div className="text-right space-y-0.5" dir="rtl">
                <p>Royaume du Maroc</p>
                <p>Ministère de l'Éducation Nationale</p>
                <p>AREF Souss - Massa</p>
                <p>Direction Provinciale Inzegane Aït Melloul</p>
              </div>
            </div>

            <div className="mt-4 inline-block px-6 py-2 border-2 border-slate-900 rounded-lg bg-slate-50">
              <h2 className="text-base md:text-lg font-extrabold uppercase tracking-wider text-slate-950">
                {isInsp ? "تقرير تفتيش تربوي رسمي (PV d'Inspection)" : `تقرير نشاط تربوي: ${activity.objet}`}
              </h2>
              <p className="text-xs text-slate-600 font-medium">مادة المعلوميات • سلك التعليم الثانوي</p>
            </div>
          </div>

          {/* Inspection Teacher & Administrative Card */}
          {isInsp && (
            <div className="rounded-xl border border-slate-300 p-4 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block font-semibold">الأستاذ(ة) المفتش(ة) :</span>
                <span className="font-bold text-slate-900 text-sm">{inspData.enseignantNom}</span>
              </div>

              <div>
                <span className="text-slate-500 block font-semibold">رقم التأجير (DOTI) :</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{inspData.doti}</span>
              </div>

              <div>
                <span className="text-slate-500 block font-semibold">مؤسسة العمل :</span>
                <span className="font-bold text-slate-900">{activity.etablissementNom}</span>
                <span className="text-slate-500 text-[11px] block">({activity.commune})</span>
              </div>

              <div>
                <span className="text-slate-500 block font-semibold">الإطار والدرجة :</span>
                <span className="font-medium text-slate-900">{teacher ? teacher.grade : 'أستاذ التعليم الثانوي'}</span>
              </div>
            </div>
          )}

          {/* Event Metadata (Date, Time, Type) */}
          <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-slate-100/70 border border-slate-200 text-xs gap-2">
            <span>تاريخ الإنجاز : <strong className="font-mono">{activity.date}</strong> {activity.heure && `على الساعة ${activity.heure}`}</span>
            <span>المؤطر التربوي : <strong>{activity.responsableNom}</strong></span>
            {isInsp && inspData.typeInspection && (
              <span>طبيعة التفتيش : <strong className="capitalize">{inspData.typeInspection}</strong></span>
            )}
            {isVis && (activity as any).sujetVisite && (
              <span>Sujet : <strong>{(activity as any).sujetVisite}</strong></span>
            )}
            {isReunion && (activity as any).typeReunion && (
              <span>Type réunion : <strong>{(activity as any).typeReunion}</strong></span>
            )}
            {isExam && (activity as any).operationSuiviExamen && (
              <span>Opération : <strong>{(activity as any).operationSuiviExamen}</strong></span>
            )}
          </div>

          {/* Score Badge for Inspection */}
          {isInsp && (
            <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/70 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                  النقطة العددية الرسمية الممنوحة
                </span>
                <span className="text-[11px] text-emerald-700">
                  وفق معايير شبكة التقويم التربوي والديداكتيكي لأساتذة مادة المعلوميات
                </span>
              </div>

              <div className="flex items-baseline gap-1 text-emerald-950">
                {inspData.note !== undefined ? (
                  <>
                    <span className="text-3xl font-black font-mono">{inspData.note}</span>
                    <span className="text-base font-bold text-emerald-800">/ 20</span>
                  </>
                ) : (
                  <span className="text-base font-bold text-amber-800">زيارة توجيهية (بدون نقطة)</span>
                )}
              </div>
            </div>
          )}

          {/* General Assessment / Appreciation */}
          {inspData && inspData.appreciation && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                التقدير العام والملاحظات التربوية (Appréciation Globale)
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap">
                {inspData.appreciation}
              </p>
            </div>
          )}

          {(isInsp || isVis) && activity.rapportData && activity.rapportNom && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4 print:hidden">
              <div>
                <h4 className="font-bold text-xs text-blue-900">Rapport de visite joint</h4>
                <p className="text-[11px] text-blue-700">{activity.rapportNom}</p>
              </div>
              <a
                href={activity.rapportData}
                download={activity.rapportNom}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 hover:bg-blue-700"
              >
                <Download className="w-4 h-4" /> Ouvrir / télécharger
              </a>
            </div>
          )}

          {/* Description for other activities */}
          {!isInsp && activity.description && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                سياق ومحاور النشاط (Description)
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap">
                {activity.description}
              </p>
            </div>
          )}

          {(!isInsp || isVis || isReunion || isValidation || isExam || isForm || isRenc) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {isForm && (activity as any).roleFormation && (
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60">
                  <span className="font-bold text-purple-900 block mb-1">Rôle dans la formation</span>
                  <span className="text-slate-700">{(activity as any).roleFormation}</span>
                </div>
              )}

              {isForm && (activity as any).dureeHeures && (
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60">
                  <span className="font-bold text-purple-900 block mb-1">Durée</span>
                  <span className="text-slate-700">{(activity as any).dureeHeures} heures</span>
                </div>
              )}

              {(isRenc || isReunion || isValidation || isExam || isForm || !isInsp) && (activity as any).participantsNoms?.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 md:col-span-2">
                  <span className="font-bold text-slate-900 block mb-2">Participants</span>
                  <div className="flex flex-wrap gap-2">
                    {(activity as any).participantsNoms.map((participant: string) => (
                      <span key={participant} className="px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                        {participant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Strong Points & Areas to Improve */}
          {isInsp && (inspData.pointsForts || inspData.pointsAmeliorer) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {inspData.pointsForts && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                  <h5 className="font-bold text-emerald-900">نقط القوة والإيجابيات المسجلة :</h5>
                  <p className="text-slate-700 leading-relaxed">{inspData.pointsForts}</p>
                </div>
              )}

              {inspData.pointsAmeliorer && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1.5">
                  <h5 className="font-bold text-amber-900">الجوانب التي تستوجب التطوير والدعم :</h5>
                  <p className="text-slate-700 leading-relaxed">{inspData.pointsAmeliorer}</p>
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {activity.recommandations && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                التوجيهات والتوصيات التربوية الصادرة (Orientations & Recommandations)
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-purple-50/40 p-4 rounded-xl border border-purple-200">
                {activity.recommandations}
              </p>
            </div>
          )}

          {/* Official Signatures Section */}
          <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-12">
              <p className="font-bold text-slate-800">توقيع واطلاع الأستاذ(ة) المعني(ة) بالأمر</p>
              <p className="text-[10px] text-slate-400 italic">اطلع(ت) عليه بتاريخ : ..............................</p>
            </div>

            <div className="space-y-12">
              <p className="font-bold text-slate-800">توقيع وخاتم المفتش التربوي</p>
              <p className="text-xs font-semibold text-slate-700">{activity.responsableNom}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
