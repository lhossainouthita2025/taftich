import React, { useState, useMemo } from 'react';
import { 
  School, 
  Search, 
  MapPin, 
  Users, 
  FileCheck, 
  Eye, 
  Plus, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  ArrowUpDown,
  Compass,
  Edit2,
  Trash2
} from 'lucide-react';
import { Etablissement, Enseignant, Activity, Commune, Role, AnneeScolaire } from '../../types';
import { ExcelService } from '../../services/excelService';
import { StorageService } from '../../services/storage';
import { useI18n } from '../../i18n';

interface EtablissementsViewProps {
  etablissements: Etablissement[];
  enseignants: Enseignant[];
  activities: Activity[];
  communes: Commune[];
  userRole: Role;
  activeAnneeScolaireId?: string;
  onOpenSchoolDetail: (etablissement: Etablissement) => void;
  onOpenNewSchool: () => void;
  onOpenEditSchool: (etablissement: Etablissement) => void;
  onDeleteSchool: (id: string) => void;
}

export const EtablissementsView: React.FC<EtablissementsViewProps> = ({
  etablissements,
  enseignants,
  activities,
  communes,
  userRole,
  activeAnneeScolaireId,
  onOpenSchoolDetail,
  onOpenNewSchool,
  onOpenEditSchool,
  onDeleteSchool
}) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommune, setSelectedCommune] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPionnier, setSelectedPionnier] = useState<string>('all');
  const [selectedGps, setSelectedGps] = useState<string>('all');

  const [sortField, setSortField] = useState<string>('nomAr');
  const [sortAsc, setSortAsc] = useState(true);

  const activeAnneeScolaire = useMemo<AnneeScolaire | undefined>(() => {
    const allAnnees = StorageService.getAnneesScolaires();
    return allAnnees.find(a => a.id === activeAnneeScolaireId) || StorageService.getActiveAnneeScolaire();
  }, [activeAnneeScolaireId]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Compute school stats
  const enrichedEtabs = useMemo(() => {
    return etablissements.map(etab => {
      const ensInSchool = enseignants.filter(e => e.etablissementId === etab.id || e.etablissementNom === etab.nomAr);
      const activeEns = ensInSchool.filter(e => e.actif).length;

      const actsInSchool = activities.filter(a => {
        const sameSchool = a.etablissementId === etab.id || a.etablissementNom === etab.nomAr;
        return sameSchool && (!activeAnneeScolaire || StorageService.isDateInAnneeScolaire(a.date, activeAnneeScolaire));
      });

      const inspCount = actsInSchool.filter(a => a.type === 'inspection').length;
      const visCount = actsInSchool.filter(a => a.type === 'visite').length;
      const rencCount = actsInSchool.filter(a => a.type === 'rencontre').length;
      const formCount = actsInSchool.filter(a => a.type === 'formation').length;

      const sortedActs = [...actsInSchool].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const lastAct = sortedActs.length > 0 ? sortedActs[0] : undefined;

      const today = new Date().toISOString().slice(0, 10);
      const futureActs = actsInSchool
        .filter(a => a.date >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const nextAct = futureActs.length > 0 ? futureActs[0] : undefined;

      return {
        ...etab,
        nbEnseignants: ensInSchool.length,
        nbActifs: activeEns,
        nbInspections: inspCount,
        nbVisites: visCount,
        nbRencontres: rencCount,
        nbFormations: formCount,
        derniereActivite: lastAct,
        prochaineActivite: nextAct
      };
    });
  }, [etablissements, enseignants, activities, activeAnneeScolaire]);

  // Filter logic
  const filteredEtabs = useMemo(() => {
    return enrichedEtabs.filter(etab => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchAr = etab.nomAr.toLowerCase().includes(q);
        const matchFr = etab.nomFr.toLowerCase().includes(q);
        const matchCom = etab.commune.toLowerCase().includes(q);
        if (!matchAr && !matchFr && !matchCom) return false;
      }

      if (selectedCommune !== 'all' && etab.commune !== selectedCommune) {
        return false;
      }

      if (selectedType !== 'all' && etab.type !== selectedType) {
        return false;
      }

      if (selectedPionnier === 'oui' && !etab.estPionnier) return false;
      if (selectedPionnier === 'non' && etab.estPionnier) return false;

      if (selectedGps === 'avec' && (!etab.latitude || !etab.longitude)) return false;
      if (selectedGps === 'sans' && (etab.latitude && etab.longitude)) return false;

      return true;
    });
  }, [enrichedEtabs, searchTerm, selectedCommune, selectedType, selectedPionnier, selectedGps]);

  // Sort logic
  const sortedEtabs = useMemo(() => {
    return [...filteredEtabs].sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredEtabs, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedEtabs.length / pageSize) || 1;
  const paginatedEtabs = sortedEtabs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportExcel = () => {
    ExcelService.exportEtablissementsToExcel(filteredEtabs, `etablissements_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div id="etablissements-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-600" />
            {t('schoolsTitle')}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {filteredEtabs.length} / {etablissements.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {t('schoolsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            {t('exportExcel')} ({filteredEtabs.length})
          </button>

          {userRole === 'admin' && (
            <button
              onClick={onOpenNewSchool}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('addSchool')}
            </button>
          )}
        </div>
      </div>

      {/* Filter Matrix */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs md:text-sm text-slate-900 focus:outline-emerald-600 focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Commune */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Commune</label>
            <select
              value={selectedCommune}
              onChange={e => { setSelectedCommune(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">{t('allCommunes')}</option>
              {communes.map(c => (
                <option key={c.id} value={c.nomAr}>{c.nomAr} ({c.nomFr})</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Type d'établissement</label>
            <select
              value={selectedType}
              onChange={e => { setSelectedType(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">Tous les types</option>
              <option value="college">Collège (ثانوية إعدادية)</option>
              <option value="lycee">Lycée (ثانوية تأهيلية)</option>
            </select>
          </div>

          {/* Pionnier */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Établissement Pionnier</label>
            <select
              value={selectedPionnier}
              onChange={e => { setSelectedPionnier(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">Tous</option>
              <option value="oui">Pionnier uniquement (رائدة)</option>
              <option value="non">Standard</option>
            </select>
          </div>

          {/* GPS */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Coordonnées GPS</label>
            <select
              value={selectedGps}
              onChange={e => { setSelectedGps(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">Toutes</option>
              <option value="avec">Géolocalisé (GPS renseigné)</option>
              <option value="sans">Sans coordonnées GPS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('commune')}>
                  <div className="flex items-center gap-1">
                    Commune
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('nomAr')}>
                  <div className="flex items-center gap-1">
                    Établissement Scolaire
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center cursor-pointer hover:text-slate-900" onClick={() => handleSort('nbEnseignants')}>
                  <div className="flex items-center justify-center gap-1">
                    Enseignants
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Activités</th>
                <th className="py-3 px-4">Dernière Activité</th>
                <th className="py-3 px-4">Prochaine Échéance</th>
                <th className="py-3 px-4 text-center">GPS</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEtabs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <School className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Aucun établissement trouvé.
                  </td>
                </tr>
              ) : (
                paginatedEtabs.map(etab => {
                  return (
                    <tr
                      key={etab.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onOpenSchoolDetail(etab)}
                    >
                      {/* Commune */}
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {etab.commune}
                        </span>
                      </td>

                      {/* Établissement */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{etab.nomAr}</span>
                            {etab.estPionnier && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                                رائدة (Pionnier)
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">{etab.nomFr}</span>
                        </div>
                      </td>

                      {/* Enseignants */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                          {etab.nbEnseignants}
                          <span className="text-[10px] text-emerald-600 font-normal ml-1">
                            ({etab.nbActifs} act.)
                          </span>
                        </span>
                      </td>

                      {/* Activités */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold" title="Inspections">
                            {etab.nbInspections} insp.
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-bold" title="Visites">
                            {etab.nbVisites} vis.
                          </span>
                        </div>
                      </td>

                      {/* Dernière activité */}
                      <td className="py-3 px-4">
                        {etab.derniereActivite ? (
                          <div className="flex flex-col text-xs">
                            <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                              {etab.derniereActivite.objet}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {etab.derniereActivite.date}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Aucune</span>
                        )}
                      </td>

                      {/* Prochaine activité */}
                      <td className="py-3 px-4">
                        {etab.prochaineActivite ? (
                          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                            {etab.prochaineActivite.date}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Non planifiée</span>
                        )}
                      </td>

                      {/* GPS */}
                      <td className="py-3 px-4 text-center">
                        {etab.latitude && etab.longitude ? (
                          <span className="inline-flex p-1 rounded-md text-emerald-600 bg-emerald-50" title={`${etab.latitude}, ${etab.longitude}`}>
                            <Compass className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Non saisi</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenSchoolDetail(etab)}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Voir la fiche détaillée"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {userRole !== 'consultation' && (
                            <button
                              onClick={() => onOpenEditSchool(etab)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              title="Modifier les données de l'établissement"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {userRole === 'admin' && (
                            <button
                              onClick={() => onDeleteSchool(etab.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <div>
            Affichage de <strong>{Math.min(sortedEtabs.length, (currentPage - 1) * pageSize + 1)}</strong> à{' '}
            <strong>{Math.min(sortedEtabs.length, currentPage * pageSize)}</strong> sur <strong>{sortedEtabs.length}</strong> établissements
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
