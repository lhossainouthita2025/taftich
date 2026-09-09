import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Calendar, 
  Users, 
  Download, 
  FileCheck, 
  School, 
  MapPin, 
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { Enseignant, Etablissement, Commune, Role } from '../../types';
import { ExcelService } from '../../services/excelService';
import { useI18n } from '../../i18n';

interface PlanificationViewProps {
  enseignants: Enseignant[];
  etablissements: Etablissement[];
  communes: Commune[];
  userRole: Role;
  onOpenNewInspection: (enseignant: Enseignant) => void;
  onOpenTeacherDetail: (enseignant: Enseignant) => void;
}

export const PlanificationView: React.FC<PlanificationViewProps> = ({
  enseignants,
  etablissements,
  communes,
  userRole,
  onOpenNewInspection,
  onOpenTeacherDetail
}) => {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  // Configurable thresholds
  const [seuilAnnees, setSeuilAnnees] = useState<number>(3);
  const [seuilNoteFaible, setSeuilNoteFaible] = useState<number>(12);
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'high' | 'medium' | 'ok'>('all');
  const [selectedCommune, setSelectedCommune] = useState<string>('all');
  const [filterPromotionEchelon, setFilterPromotionEchelon] = useState(false);
  const [filterPromotionGrade, setFilterPromotionGrade] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

  // Priority algorithm
  const classifiedTeachers = useMemo(() => {
    return enseignants.map(ens => {
      const isPromotionEchelon = Boolean(ens.promotionEchelon);
      const isPromotionGrade = Boolean(ens.promotionGrade);
      const isPromotionProposed = isPromotionEchelon || isPromotionGrade;
      const isNever = !ens.derniereAnneeInspection || ens.derniereNote === 'vis';
      const ageAnnees = ens.derniereAnneeInspection ? currentYear - ens.derniereAnneeInspection : 99;
      const isOld = !isNever && ageAnnees >= seuilAnnees;
      const isLowScore = typeof ens.derniereNote === 'number' && ens.derniereNote < seuilNoteFaible;

      let priorityScore = 1; // 1: Urgent (Never), 2: High (Old), 3: Medium (Low score), 4: Low (Up to date)
      let priorityLabel = 'À jour';
      let priorityBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';

      if (isPromotionProposed) {
        priorityScore = 1;
        const promotionLabel = isPromotionEchelon && isPromotionGrade
          ? 'Échelon + Grade'
          : isPromotionEchelon
            ? 'Échelon'
            : 'Grade';
        priorityLabel = `Priorité 1 (${promotionLabel})`;
        priorityBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      } else if (isNever) {
        priorityScore = 1;
        priorityLabel = 'Priorité 1 (Jamais inspecté)';
        priorityBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      } else if (isOld) {
        priorityScore = 2;
        priorityLabel = `Priorité 2 (Inspection > ${seuilAnnees} ans)`;
        priorityBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      } else if (isLowScore) {
        priorityScore = 3;
        priorityLabel = 'Priorité 3 (Suivi note < 12)';
        priorityBadgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
      } else {
        priorityScore = 4;
        priorityLabel = 'Priorité 4 (À jour)';
        priorityBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
      }

      return {
        ...ens,
        priorityScore,
        priorityLabel,
        priorityBadgeClass,
        ageAnnees: ens.derniereAnneeInspection ? ageAnnees : null
      };
    });
  }, [enseignants, seuilAnnees, seuilNoteFaible, currentYear]);

  // Filtered
  const filteredList = useMemo(() => {
    return classifiedTeachers.filter(ens => {
      if (selectedCommune !== 'all' && ens.commune !== selectedCommune) return false;
      if (filterPromotionEchelon && !ens.promotionEchelon) return false;
      if (filterPromotionGrade && !ens.promotionGrade) return false;

      if (filterPriority === 'urgent' && ens.priorityScore !== 1) return false;
      if (filterPriority === 'high' && ens.priorityScore !== 2) return false;
      if (filterPriority === 'medium' && ens.priorityScore !== 3) return false;
      if (filterPriority === 'ok' && ens.priorityScore !== 4) return false;

      return true;
    }).sort((a, b) => a.priorityScore - b.priorityScore || (b.ageAnnees || 0) - (a.ageAnnees || 0));
  }, [classifiedTeachers, filterPriority, selectedCommune, filterPromotionEchelon, filterPromotionGrade]);

  // Counts
  const urgentCount = classifiedTeachers.filter(t => t.priorityScore === 1).length;
  const highCount = classifiedTeachers.filter(t => t.priorityScore === 2).length;
  const mediumCount = classifiedTeachers.filter(t => t.priorityScore === 3).length;
  const okCount = classifiedTeachers.filter(t => t.priorityScore === 4).length;

  const toggleSelectTeacher = (id: string) => {
    if (selectedTeachers.includes(id)) {
      setSelectedTeachers(selectedTeachers.filter(item => item !== id));
    } else {
      setSelectedTeachers([...selectedTeachers, id]);
    }
  };

  const selectAllFiltered = () => {
    if (selectedTeachers.length === filteredList.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(filteredList.map(t => t.id));
    }
  };

  const handleExportPlanningExcel = () => {
    ExcelService.exportEnseignantsToExcel(filteredList, `plan_inspections_prioritaires_${currentYear}.xlsx`);
  };

  return (
    <div id="planification-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-600" />
            {t('planning')}
          </h2>
          <p className="text-xs text-slate-500">
            Algorithme de calcul automatique des besoins d'inspection basé sur l'ancienneté, les notes et les seuils statutaires.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPlanningExcel}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Exporter le Plan d'Inspection
          </button>
        </div>
      </div>

      {/* Thresholds Control Box */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Paramétrage des Seuils d'Alerte</span>
            <span className="text-[11px] text-slate-500">Ajustez les curseurs pour recalculer la criticité de l'échéancier</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Seuil d'ancienneté :</span>
            <select
              value={seuilAnnees}
              onChange={e => setSeuilAnnees(parseInt(e.target.value, 10))}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800"
            >
              <option value="2">2 ans</option>
              <option value="3">3 ans (Recommandé)</option>
              <option value="4">4 ans</option>
              <option value="5">5 ans</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600">Seuil de remédiation :</span>
            <select
              value={seuilNoteFaible}
              onChange={e => setSeuilNoteFaible(parseInt(e.target.value, 10))}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800"
            >
              <option value="10">Note &lt; 10 / 20</option>
              <option value="12">Note &lt; 12 / 20</option>
              <option value="14">Note &lt; 14 / 20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Priority KPI Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterPriority(filterPriority === 'urgent' ? 'all' : 'urgent')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterPriority === 'urgent'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <span className="text-[11px] text-rose-700 font-bold uppercase tracking-wider block">
            Priorité 1 : Urgente
          </span>
          <span className="text-2xl font-black text-rose-950 mt-1 block">{urgentCount}</span>
          <span className="text-[11px] text-slate-500">Jamais inspectés ou visite ou promotion proposée</span>
        </button>

        <button
          onClick={() => setFilterPriority(filterPriority === 'high' ? 'all' : 'high')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterPriority === 'high'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <span className="text-[11px] text-amber-700 font-bold uppercase tracking-wider block">
            Priorité 2 : Élevée
          </span>
          <span className="text-2xl font-black text-amber-950 mt-1 block">{highCount}</span>
          <span className="text-[11px] text-slate-500">Inspection &gt; {seuilAnnees} ans</span>
        </button>

        <button
          onClick={() => setFilterPriority(filterPriority === 'medium' ? 'all' : 'medium')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterPriority === 'medium'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <span className="text-[11px] text-blue-700 font-bold uppercase tracking-wider block">
            Priorité 3 : Moyenne
          </span>
          <span className="text-2xl font-black text-blue-950 mt-1 block">{mediumCount}</span>
          <span className="text-[11px] text-slate-500">Note &lt; {seuilNoteFaible} / 20</span>
        </button>

        <button
          onClick={() => setFilterPriority(filterPriority === 'ok' ? 'all' : 'ok')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterPriority === 'ok'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider block">
            Priorité 4 : Régulier
          </span>
          <span className="text-2xl font-black text-emerald-950 mt-1 block">{okCount}</span>
          <span className="text-[11px] text-slate-500">Situation à jour</span>
        </button>
      </div>

      {/* Filter by Commune & Fast selection toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Filtrer par commune :</span>
          <select
            value={selectedCommune}
            onChange={e => setSelectedCommune(e.target.value)}
            className="py-1 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 font-medium"
          >
            <option value="all">Toutes les communes ({communes.length})</option>
            {communes.map(c => (
              <option key={c.id} value={c.nomAr}>{c.nomAr} ({c.nomFr})</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[11px] font-medium text-slate-700">
            <input
              type="checkbox"
              checked={filterPromotionEchelon}
              onChange={e => setFilterPromotionEchelon(e.target.checked)}
              className="rounded text-emerald-600"
            />
            Promotion en échelon
          </label>

          <label className="flex items-center gap-2 text-[11px] font-medium text-slate-700">
            <input
              type="checkbox"
              checked={filterPromotionGrade}
              onChange={e => setFilterPromotionGrade(e.target.checked)}
              className="rounded text-emerald-600"
            />
            Promotion en grade
          </label>

          <button
            onClick={selectAllFiltered}
            className="text-xs text-emerald-700 font-semibold hover:underline"
          >
            {selectedTeachers.length === filteredList.length ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
          {selectedTeachers.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
              {selectedTeachers.length} sélectionné(s)
            </span>
          )}
        </div>
      </div>

      {/* Planning Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase">
            <tr>
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedTeachers.length > 0 && selectedTeachers.length === filteredList.length}
                  onChange={selectAllFiltered}
                  className="rounded text-emerald-600"
                />
              </th>
              <th className="py-3 px-4">Niveau de Priorité</th>
              <th className="py-3 px-4">Doti</th>
              <th className="py-3 px-4">Enseignant</th>
              <th className="py-3 px-4">Établissement & Commune</th>
              <th className="py-3 px-4">Dernière Session</th>
              <th className="py-3 px-4">Note Actuelle</th>
              <th className="py-3 px-4 text-right">Action Planification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  Aucun enseignant dans ce niveau de priorité pour les critères sélectionnés.
                </td>
              </tr>
            ) : (
              filteredList.map(ens => {
                const isSelected = selectedTeachers.includes(ens.id);
                return (
                  <tr
                    key={ens.id}
                    className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}
                  >
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectTeacher(ens.id)}
                        className="rounded text-emerald-600"
                      />
                    </td>

                    {/* Priority badge */}
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] border ${ens.priorityBadgeClass}`}>
                        {ens.priorityLabel}
                      </span>
                    </td>

                    {/* DOTI */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {ens.doti}
                    </td>

                    {/* Enseignant */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span 
                          onClick={() => onOpenTeacherDetail(ens)}
                          className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer text-sm"
                        >
                          {ens.nom}
                        </span>
                        <span className="text-[10px] text-slate-400">{ens.grade}</span>
                        {(ens.promotionEchelon || ens.promotionGrade) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ens.promotionEchelon && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[9px] font-semibold">
                                Échelon
                              </span>
                            )}
                            {ens.promotionGrade && (
                              <span className="px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 text-[9px] font-semibold">
                                Grade
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Établissement */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{ens.etablissementNom}</span>
                      <span className="text-[11px] text-slate-500">{ens.commune}</span>
                    </td>

                    {/* Dernière session */}
                    <td className="py-3 px-4">
                      {ens.derniereAnneeInspection ? (
                        <span className="font-mono text-slate-800">
                          {ens.derniereAnneeInspection} 
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({ens.ageAnnees} an{ens.ageAnnees && ens.ageAnnees > 1 ? 's' : ''})
                          </span>
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold text-[11px]">Jamais</span>
                      )}
                    </td>

                    {/* Note */}
                    <td className="py-3 px-4">
                      {typeof ens.derniereNote === 'number' ? (
                        <span className="font-bold font-mono text-slate-900">
                          {ens.derniereNote} / 20
                        </span>
                      ) : ens.derniereNote === 'vis' ? (
                        <span className="text-amber-700 font-semibold text-[11px]">Visite</span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenNewInspection(ens)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Planifier Inspection
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
