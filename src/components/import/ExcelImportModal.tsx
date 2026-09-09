import React, { useState, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  FileText,
  Table
} from 'lucide-react';
import { ExcelService } from '../../services/excelService';
import { Enseignant, Etablissement, TimetableSlot } from '../../types';

interface ExcelImportModalProps {
  onImportEnseignants: (data: Partial<Enseignant>[]) => void;
  onImportEtablissements: (data: Partial<Etablissement>[]) => void;
  onImportTimetables: (slots: { doti: string; slot: TimetableSlot }[]) => void;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  onImportEnseignants,
  onImportEtablissements,
  onImportTimetables,
  onClose
}) => {
  const [targetType, setTargetType] = useState<'enseignants' | 'etablissements' | 'emplois'>('enseignants');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    setSuccessReport(null);
    setIsLoading(true);

    try {
      if (targetType === 'enseignants') {
        const parsed = await ExcelService.parseEnseignantsExcel(selected);
        setPreviewData(parsed);
      } else if (targetType === 'etablissements') {
        const parsed = await ExcelService.parseEtablissementsExcel(selected);
        setPreviewData(parsed);
      } else {
        const parsed = await ExcelService.parseEmploiDuTempsExcel(selected);
        setPreviewData(parsed);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la lecture du fichier Excel.");
      setPreviewData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      setError(null);
      setSuccessReport(null);
      setIsLoading(true);
      try {
        if (targetType === 'enseignants') {
          const parsed = await ExcelService.parseEnseignantsExcel(droppedFile);
          setPreviewData(parsed);
        } else if (targetType === 'etablissements') {
          const parsed = await ExcelService.parseEtablissementsExcel(droppedFile);
          setPreviewData(parsed);
        } else {
          const parsed = await ExcelService.parseEmploiDuTempsExcel(droppedFile);
          setPreviewData(parsed);
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors de la lecture du fichier Excel.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownloadTemplate = () => {
    ExcelService.downloadTemplate(targetType);
  };

  const handleConfirmImport = () => {
    if (previewData.length === 0) return;

    if (targetType === 'enseignants') {
      onImportEnseignants(previewData);
      setSuccessReport(`${previewData.length} enseignants importés avec succès.`);
    } else if (targetType === 'etablissements') {
      onImportEtablissements(previewData);
      setSuccessReport(`${previewData.length} établissements importés avec succès.`);
    } else {
      onImportTimetables(previewData);
      setSuccessReport(`${previewData.length} créneaux d'emplois du temps importés avec succès.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div 
        id="excel-import-modal"
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Importation de Données via Excel (.xlsx)
              </h3>
              <p className="text-xs text-slate-300">
                Alimentez le répertoire depuis vos fichiers de données académiques et provinciales.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Entity Choice */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Type de données à importer
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => { setTargetType('enseignants'); setPreviewData([]); setFile(null); }}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  targetType === 'enseignants'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                1. Répertoire des Enseignants
              </button>

              <button
                type="button"
                onClick={() => { setTargetType('etablissements'); setPreviewData([]); setFile(null); }}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  targetType === 'etablissements'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                2. Liste des Établissements
              </button>

              <button
                type="button"
                onClick={() => { setTargetType('emplois'); setPreviewData([]); setFile(null); }}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  targetType === 'emplois'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                3. Emplois du Temps Hebdo
              </button>
            </div>
          </div>

          {/* Template Download Prompt */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800">
                Vous n'avez pas le format standardisé ?
              </p>
              <p className="text-[11px] text-slate-500">
                Téléchargez notre modèle Excel pré-rempli avec les entêtes attendues.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Télécharger Modèle (.xlsx)
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all space-y-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                {file ? file.name : "Glissez votre fichier Excel ici ou cliquez pour parcourir"}
              </p>
              <p className="text-xs text-slate-400 mt-1">Formats acceptés : .xlsx, .xls</p>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              Analyse et mapping des colonnes en cours...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {successReport && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">{successReport}</span>
              </div>
              <button
                onClick={onClose}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
              >
                Terminer
              </button>
            </div>
          )}

          {/* Preview Section */}
          {previewData.length > 0 && !successReport && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-emerald-600" />
                  Aperçu des Données Détectées ({previewData.length} lignes valides)
                </span>
                <span className="text-[11px] text-slate-400">
                  Affichage des 5 premières lignes
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-48 text-xs bg-white">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                    <tr>
                      {Object.keys(previewData[0] || {}).slice(0, 6).map(key => (
                        <th key={key} className="py-2 px-3">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 font-mono text-[11px]">
                        {Object.values(row).slice(0, 6).map((val: any, vIdx) => (
                          <td key={vIdx} className="py-2 px-3 truncate max-w-[150px]">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Fermer
          </button>

          {previewData.length > 0 && !successReport && (
            <button
              onClick={handleConfirmImport}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Importer les {previewData.length} enregistrements
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
