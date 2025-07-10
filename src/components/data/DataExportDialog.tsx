import { useState } from 'react';
import { FunctionComponent } from 'react';
import { useDataExport } from '@/hooks/useDataExport';
import Button from '../button';
import Dialog from '../dialog';

interface DataExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DataExportDialog: FunctionComponent<DataExportDialogProps> = ({ open, onOpenChange }) => {
  const [exportPreview, setExportPreview] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const {
    isExporting,
    copyToDatabaseString,
    saveToDatabase,
    downloadAsFile,
    getExportString,
    getExportStats,
    clearLocalStorage,
  } = useDataExport();

  const stats = getExportStats();

  const handlePreviewExport = async () => {
    const exportString = await getExportString({ source: 'memory', validate: true });
    if (exportString) {
      setExportPreview(exportString);
      setShowPreview(true);
    }
  };

  const handleCopyToClipboard = async () => {
    await copyToDatabaseString({ source: 'memory', validate: true });
  };

  const handleSaveToDatabase = async () => {
    const success = await saveToDatabase({ source: 'memory', validate: true });
    if (success) {
      onOpenChange(false);
    }
  };

  const handleDownloadFile = async () => {
    await downloadAsFile({ source: 'memory', validate: true });
  };

  const handleClearLocalStorage = () => {
    const success = clearLocalStorage();
    if (success) {
      // Reload to reinitialize atoms without localStorage
      setTimeout(() => window?.location?.reload(), 1000);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Data Export & localStorage Management"
      render={() => (
        <div className="flex flex-col gap-6 p-4 max-h-[600px] overflow-auto">
          {/* Export Statistics */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-zinc-200 mb-3">📊 Current Data</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Entry Types:</span>
                <span className="text-zinc-200 font-medium">{stats.entryTypesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Entry Instances:</span>
                <span className="text-zinc-200 font-medium">{stats.entryInstancesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Reminders:</span>
                <span className="text-zinc-200 font-medium">{stats.reminderRecordsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Active Dates:</span>
                <span className="text-zinc-200 font-medium">{stats.totalDatesWithEntries}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-zinc-400">localStorage Data:</span>
                <span className={`font-medium ${stats.hasLocalStorageData ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.hasLocalStorageData ? '✅ Present' : '❌ Empty'}
                </span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-zinc-400">Database Auth:</span>
                <span className={`font-medium ${stats.isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.isAuthenticated ? '✅ Connected' : '❌ Not logged in'}
                </span>
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-200">💾 Export Options</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={handleSaveToDatabase}
                disabled={isExporting || !stats.isAuthenticated}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {isExporting ? '⏳ Saving...' : '🏗️ Save to Database'}
              </Button>
              
              <Button
                onClick={handleCopyToClipboard}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {isExporting ? '⏳ Preparing...' : '📋 Copy Database String'}
              </Button>
              
              <Button
                onClick={handleDownloadFile}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {isExporting ? '⏳ Preparing...' : '📁 Download JSON File'}
              </Button>
              
              <Button
                onClick={handlePreviewExport}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {isExporting ? '⏳ Generating...' : '👁️ Preview Export Data'}
              </Button>
            </div>
          </div>

          {/* localStorage Management */}
          <div className="space-y-4 border-t border-zinc-700 pt-4">
            <h3 className="text-lg font-semibold text-zinc-200">🗄️ localStorage Management</h3>
            <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
              <p className="text-amber-200 text-sm mb-3">
                <strong>⚠️ Decoupling Mode:</strong> Clear localStorage to make the app database-only. 
                Export your data first to ensure you have a backup.
              </p>
              <Button
                onClick={handleClearLocalStorage}
                disabled={isExporting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🧹 Clear localStorage
              </Button>
            </div>
          </div>

          {/* Export Preview */}
          {showPreview && (
            <div className="space-y-3 border-t border-zinc-700 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-200">📋 Export Preview</h3>
                <Button
                  onClick={() => setShowPreview(false)}
                  className="text-zinc-400 hover:text-zinc-200 text-sm"
                >
                  ✕ Close
                </Button>
              </div>
              <div className="bg-zinc-900 rounded-lg p-4 max-h-64 overflow-auto">
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap break-all">
                  {exportPreview.slice(0, 2000)}
                  {exportPreview.length > 2000 && '\n... (truncated for display)'}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigator.clipboard.writeText(exportPreview)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  📋 Copy Full Preview
                </Button>
                <span className="text-zinc-400 text-xs self-center">
                  {exportPreview.length.toLocaleString()} characters
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      renderFooter={({ close }) => (
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-zinc-500">
            💡 Database-ready format compatible with GitHub backup API
          </div>
          <Button 
            onClick={close} 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium"
          >
            Close
          </Button>
        </div>
      )}
    />
  );
};

export default DataExportDialog;