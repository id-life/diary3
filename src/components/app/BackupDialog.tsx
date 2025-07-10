import { useBackupList } from '@/api/github';
import { backupDialogOpenAtom } from '@/atoms/app';
import { useAtom } from 'jotai';
import { FunctionComponent } from 'react';
import { toast } from 'react-toastify';
import { 
  convertAndRestoreBackup, 
  validateBackupData, 
  createRestoreBackup,
  detectBackupFormat 
} from '@/utils/backupDataConverter';
import Button from '../button';
import Dialog from '../dialog';

interface BackupInfo {
  id: string;
  fileName: string;
  content: any;
  createdAt: string;
}

const BackupDialog: FunctionComponent = () => {
  const [isOpen, setOpen] = useAtom(backupDialogOpenAtom);
  const { data: backupList, isLoading, refetch } = useBackupList();

  const restoreBackup = async (backup: BackupInfo) => {
    try {
      const loadMsg = toast.loading('🔄 Validating backup data...');

      // Validate backup data
      if (!validateBackupData(backup.content)) {
        toast.update(loadMsg, {
          render: '❌ Invalid backup data format',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      // Show format detection info
      const format = detectBackupFormat(backup.content);
      console.log('📊 Backup format detected:', format);
      
      toast.update(loadMsg, {
        render: `🔄 Converting ${format} backup data...`,
        type: 'info',
        isLoading: true,
      });

      // Create backup of current data
      const backupSuccess = createRestoreBackup();
      if (!backupSuccess) {
        console.warn('⚠️ Failed to create pre-restore backup, but continuing...');
      }

      // Convert and restore backup data
      const conversionSuccess = await convertAndRestoreBackup(backup.content);
      
      if (conversionSuccess) {
        toast.update(loadMsg, {
          render: '✅ Backup restored successfully! Refreshing...',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        });

        setTimeout(() => {
          window?.location?.reload();
        }, 2000);
      } else {
        toast.update(loadMsg, {
          render: '❌ Failed to restore backup data',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('❌ Restore backup failed:', error);
      toast.error('Restore backup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => setOpen(open)}
      title="Cloud Backup Data"
      render={() => (
        <div className="flex flex-col gap-4 p-4">
          {isLoading ? (
            <div className="py-4 text-center">Loading...</div>
          ) : backupList?.length ? (
            <div className="flex max-h-[500px] flex-col gap-3 overflow-auto">
              {backupList.map((backup) => {
                const format = detectBackupFormat(backup.content);
                const isValid = validateBackupData(backup.content);
                
                return (
                  <div key={backup.id} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-700 p-4 shadow-md">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-200">{backup.fileName}</span>
                      <span className="text-xs text-zinc-400">{new Date(backup.createdAt).toLocaleString()}</span>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          format === 'old-redux' ? 'bg-blue-500/20 text-blue-300' : 
                          format === 'new-jotai' ? 'bg-green-500/20 text-green-300' : 
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {format === 'old-redux' ? '🔄 Redux' : format === 'new-jotai' ? '✅ Jotai' : '❌ Unknown'}
                        </span>
                        {!isValid && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-300">
                            ⚠️ Invalid
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => restoreBackup(backup)}
                      disabled={!isValid}
                      className={`rounded-full border px-4 py-2 font-semibold shadow-sm transition-all duration-300 ${
                        isValid 
                          ? 'border-gray-300 bg-white text-black hover:bg-gray-100' 
                          : 'border-gray-500 bg-gray-400 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {format === 'old-redux' ? 'Convert & Restore' : 'Restore'}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-4 text-center">Empty</div>
          )}
        </div>
      )}
      renderFooter={({ close }) => (
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={close} className="rounded bg-gray-500 px-3 py-1 font-semibold text-white hover:bg-gray-600">
            Close
          </Button>
          <Button
            onClick={refetch}
            type="primary"
            className="rounded bg-green-500 px-3 py-1 font-semibold text-white hover:bg-green-600"
          >
            Refetch
          </Button>
        </div>
      )}
    />
  );
};

export default BackupDialog;
