import { useBackupList } from '@/api/github';
import { backupDialogOpenAtom } from '@/atoms/app';
import { useAtom } from 'jotai';
import { FunctionComponent } from 'react';
import { toast } from 'react-toastify';
import {
  convertAndRestoreBackup,
  validateBackupData,
  createRestoreBackup,
  detectBackupFormat,
} from '@/utils/backupDataConverter';
import Dialog from '../dialog';
import dayjs from 'dayjs';
import { LoadFileSVG } from '../svg';

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
      const loadMsg = toast.loading('Validating backup data...');
      if (!validateBackupData(backup.content)) {
        toast.update(loadMsg, { render: 'Invalid backup data format', type: 'error', isLoading: false, autoClose: 3000 });
        return;
      }
      const format = detectBackupFormat(backup.content);
      toast.update(loadMsg, { render: `Converting ${format} backup data...`, type: 'info', isLoading: true });
      createRestoreBackup();
      const conversionSuccess = await convertAndRestoreBackup(backup.content);
      if (conversionSuccess) {
        toast.update(loadMsg, {
          render: 'Backup restored successfully! Refreshing...',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        });
        setTimeout(() => window?.location?.reload(), 2000);
      } else {
        toast.update(loadMsg, { render: 'Failed to restore backup data', type: 'error', isLoading: false, autoClose: 3000 });
      }
    } catch (error) {
      console.error('Restore backup failed:', error);
      toast.error('Restore backup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const formatFileName = (fileName: string, index: number) => {
    const fileNumber = index + 1;
    return `SaveFile ${fileNumber.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => setOpen(open)}
      title={<span className="text-lg font-semibold">Load</span>}
      className="px-6 py-4"
      render={() => (
        <div className="pt-1">
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading backups...</div>
          ) : backupList?.length ? (
            <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-2.5">
              {backupList
                .slice()
                .reverse()
                .map((backup, index) => {
                  const isValid = validateBackupData(backup.content);
                  return (
                    <button
                      key={backup.id}
                      onClick={() => restoreBackup(backup)}
                      disabled={!isValid}
                      className="flex w-full items-center gap-[14px] rounded-[8px] border bg-white px-[14px] py-3"
                    >
                      <LoadFileSVG />
                      <div className="flex flex-col space-y-2">
                        <span className="text-left text-sm font-semibold">{formatFileName(backup.fileName, index)}</span>
                        <span className="text-xs">{dayjs(backup.createdAt).format('YYYY/MM/DD HH:mm:ss')}</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No backups found.</div>
          )}
        </div>
      )}
    />
  );
};

export default BackupDialog;
