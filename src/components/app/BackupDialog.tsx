import { useBackupList } from '@/api/github';
import { backupDialogOpenAtom } from '@/atoms/app';
import { persistor } from '@/entry/store';
import { useAtom } from 'jotai';
import { FunctionComponent } from 'react';
import { toast } from 'react-toastify';
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
      persistor.pause();
      const loadMsg = toast.loading('正在恢复数据...');

      // 恢复数据到本地存储
      localStorage.setItem('persist:diary', JSON.stringify(backup.content));

      toast.update(loadMsg, {
        render: '数据恢复成功，即将刷新页面',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });

      // 延迟刷新页面
      setTimeout(() => {
        window?.location?.reload();
      }, 2000);
    } catch (error) {
      console.error('恢复备份失败:', error);
      toast.error('恢复备份失败');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => setOpen(open)}
      title="云端备份数据"
      render={() => (
        <div className="flex flex-col gap-4 p-4">
          {isLoading ? (
            <div className="py-4 text-center">Loading...</div>
          ) : backupList?.length ? (
            <div className="flex max-h-[500px] flex-col gap-3 overflow-auto">
              {backupList.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-700 p-4 shadow-md">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-200">{backup.fileName}</span>
                    <span className="text-xs text-zinc-400">{new Date(backup.createdAt).toLocaleString()}</span>
                  </div>
                  <Button
                    onClick={() => restoreBackup(backup)}
                    className="rounded-full border border-gray-300 bg-white px-4 py-2 font-semibold text-black shadow-sm transition-all duration-300 hover:bg-gray-100"
                  >
                    Recover
                  </Button>
                </div>
              ))}
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
