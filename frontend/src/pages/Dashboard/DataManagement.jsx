import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { Database, Upload, Download, FileText, FileSpreadsheet, ArrowRight, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useDataManagement } from '../../hooks/useDataManagement';

const DataManagement = () => {
  const { API } = useAuth();
  const fileInputRef = useRef(null);
  const { loading, importResult, setImportResult, importCSV, exportData, downloadTemplate } = useDataManagement();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('all');
  const [exportFormat, setExportFormat] = useState('csv');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await importCSV(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowImportModal(false);
  };

  const handleExport = async () => {
    const success = await exportData(exportType, exportFormat);
    if (success) setShowExportModal(false);
  };

  const handleDownloadTemplate = async (type) => {
    await downloadTemplate(type);
  };

  return (
    <div className="page-container animate-fade-in-up pb-10">

      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database size={14} className="text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">Data & Backup</span>
          </div>
          <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">Data Management</h1>
          <p className="page-subtitle text-sm mt-1 text-on-surface-variant">Import, export and manage your financial records.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="stat-card flex flex-col items-center text-center group cursor-pointer hover:border-primary/30 transition-all !p-8 relative overflow-hidden"
          onClick={() => setShowImportModal(true)}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl -mr-10 -mt-10" />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform shadow-xl shadow-primary/5 border border-primary/20">
            <Upload size={28} />
          </div>
          <h3 className="text-base font-black text-on-surface mb-2 uppercase tracking-tight">Import Data</h3>
          <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed opacity-60">Upload your CSV files to keep your records updated.</p>
        </div>

        <div className="stat-card flex flex-col items-center text-center group cursor-pointer hover:border-secondary/30 transition-all !p-8 relative overflow-hidden"
          onClick={() => setShowExportModal(true)}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 blur-2xl -mr-10 -mt-10" />
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-5 group-hover:scale-110 transition-transform shadow-xl shadow-secondary/5 border border-secondary/20">
            <Download size={28} />
          </div>
          <h3 className="text-base font-black text-on-surface mb-2 uppercase tracking-tight">Download Data</h3>
          <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed opacity-60">Save your financial records as CSV or PDF files.</p>
        </div>

        <div className="stat-card flex flex-col items-center text-center group cursor-pointer hover:border-tertiary/30 transition-all !p-8 relative overflow-hidden"
          onClick={() => handleDownloadTemplate('all')}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/5 blur-2xl -mr-10 -mt-10" />
          <div className="w-16 h-16 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-5 group-hover:scale-110 transition-transform shadow-xl shadow-tertiary/5 border border-tertiary/20">
            <Database size={28} />
          </div>
          <h3 className="text-base font-black text-on-surface mb-2 uppercase tracking-tight">Sample Templates</h3>
          <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed opacity-60">Download a sample file to see the correct format for importing.</p>
        </div>
      </div>

      {/* Templates Section */}
      <div className="stat-card mb-8">
        <h3 className="section-title mb-4">Import Templates</h3>
        <p className="text-xs text-on-surface-variant mb-6">Download a template, fill in your data, then import it back.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { type: 'expense', label: 'Expense Template', desc: 'Headers: Type, Title, Amount, Category, Date, Method', color: 'error' },
            { type: 'income', label: 'Income Template', desc: 'Headers: Type, Title, Amount, Source, Date', color: 'success' },
            { type: 'all', label: 'Combined Template', desc: 'Headers: Type, Title, Amount, Category/Source, Date, Method', color: 'primary' },
          ].map(temp => (
            <button key={temp.type} onClick={() => handleDownloadTemplate(temp.type)}
              className="p-4 rounded-xl bg-surface-container border border-glass-border hover:border-primary/30 text-left transition-all group">
              <div className="flex items-center gap-3 mb-2">
                <FileText size={18} className={`text-${temp.color}`} />
                <span className="text-sm font-bold text-on-surface">{temp.label}</span>
              </div>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">{temp.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-primary text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                <Download size={12} /> Download
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className={`stat-card mb-8 border-l-4 ${importResult.success ? 'border-l-success' : 'border-l-error'}`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${importResult.success ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              {importResult.success ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-on-surface mb-1">
                {importResult.success ? 'Import Successful' : 'Import Failed'}
              </h4>
              <p className="text-xs text-on-surface-variant">{importResult.message}</p>
            </div>
            <button onClick={() => setImportResult(null)} className="p-1.5 rounded-lg hover:bg-surface-container">
              <X size={14} className="text-on-surface-variant" />
            </button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Import Data">
        <div className="space-y-4">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Upload a CSV file with your financial data. Use the templates above for the correct format.
          </p>
          <div className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors">
            <Upload size={32} className="mx-auto text-on-surface-variant mb-3 opacity-40" />
            <p className="text-sm text-on-surface-variant mb-4">Drop your CSV file here or click to browse</p>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
            <label htmlFor="csv-upload" className="btn btn-primary text-xs cursor-pointer">
              {loading ? 'Processing...' : 'Select CSV File'}
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => handleDownloadTemplate('all')} className="btn btn-outline text-xs flex-1 justify-center">
              <FileText size={12} /> Get Template
            </button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Export Data">
        <div className="space-y-4">
          <div>
            <label className="input-label">Data Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Data' },
                { id: 'expenses', label: 'Expenses' },
                { id: 'income', label: 'Income' },
              ].map(opt => (
                <button key={opt.id} onClick={() => setExportType(opt.id)}
                  className={`py-3 rounded-xl text-xs font-bold transition-all ${exportType === opt.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant border border-glass-border hover:bg-surface-low'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="input-label">Format</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'csv', label: 'CSV File', icon: FileSpreadsheet },
                { id: 'pdf', label: 'PDF Report', icon: FileText },
              ].map(opt => (
                <button key={opt.id} onClick={() => setExportFormat(opt.id)}
                  className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${exportFormat === opt.id ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant border border-glass-border hover:bg-surface-low'}`}>
                  <opt.icon size={14} /> {opt.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleExport} disabled={loading} className="btn btn-primary w-full justify-center !py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
            {loading ? 'Preparing File...' : 'Download Now'}
            <ArrowRight size={14} />
          </button>
        </div>
      </Modal>

      {/* Detailing: Storage Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="stat-card !p-5 flex items-center gap-4 border-dashed border-primary/20 bg-primary/5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><CheckCircle size={20} /></div>
          <div>
            <h4 className="text-[10px] font-black text-on-surface uppercase tracking-widest leading-none mb-1">Data Safety</h4>
            <p className="text-[11px] font-bold text-on-surface-variant opacity-60">Your data is safe and synchronized.</p>
          </div>
        </div>
        <div className="stat-card !p-5 flex items-center gap-4 border-dashed border-secondary/20 bg-secondary/5">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center"><Database size={20} /></div>
          <div>
            <h4 className="text-[10px] font-black text-on-surface uppercase tracking-widest leading-none mb-1">Storage Status</h4>
            <p className="text-[11px] font-bold text-on-surface-variant opacity-60">Currently using 0.42 MB for your records.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
