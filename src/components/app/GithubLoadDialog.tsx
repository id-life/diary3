import { useFetchCommits } from '@/api/github';
import { persistor, selectLoginUser, useAppSelector } from '@/entry/store';
import { loadDialogOpenAtom, cloudBackupDialogOpenAtom } from '@/atoms/app';
import { Octokit } from '@octokit/rest';
import { useAtom } from 'jotai';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../button';
import Dialog from '../dialog';
import { isIncompleteGithubInfo } from '../../utils/GithubStorage';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import CloudBackupDialog from './CloudBackupDialog';

export type GithubLoadDialogProps = {};

const GithubLoadDialog: FunctionComponent<GithubLoadDialogProps> = () => {
  const [isOpen, setOpen] = useAtom(loadDialogOpenAtom);
  const [isCloudBackupOpen, setCloudBackupOpen] = useAtom(cloudBackupDialogOpenAtom);
  const loginUser = useAppSelector(selectLoginUser);
  const { data, isLoading } = useFetchCommits();
  const [path, setPath] = useState<string | null>(null);
  const loaded = useCallback(
    async (path: string | null) => {
      if (isIncompleteGithubInfo(loginUser)) {
        toast.error('Not logged in');
        return;
      }
      if (!path) {
        toast.error('Not Select Path');
        return;
      }
      persistor.pause();
      const loadMsg = toast.loading('Loading...');

      const octokit = new Octokit({
        auth: loginUser.githubSecret,
        userAgent: 'diary-app',
      });
      const owner = loginUser.uid!;
      const repo = loginUser.repo!;
      try {
        const file = await octokit.rest.repos.getContent({ owner, repo, path });
        let downloadUrl;

        if (Array.isArray(file.data)) {
          // If file.data is an array, it's a directory object
          toast.update(loadMsg, { render: 'Cannot download directory', type: 'error', isLoading: false, autoClose: 2000 });
          return;
        } else {
          // If file.data is an object, it's a file object
          downloadUrl = file.data.download_url;
        }
        console.log({ file, path, downloadUrl });

        if (downloadUrl) {
          const fileResponse = await fetch(downloadUrl);
          const stateToLoad = await fileResponse.json();

          // 保存到数据库
          try {
            const response = await fetch('/api/github-backup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content: stateToLoad,
                fileName: path,
              }),
            });
            if (response.status === 409) {
              console.log('Backup already exists');
            }
          } catch (error) {
            console.error('Failed to save to database:', error);
          }

          localStorage.setItem('persist:diary', JSON.stringify(stateToLoad));
        } else {
          toast.update(loadMsg, { render: 'Download URL is not available', type: 'error', isLoading: false, autoClose: 2000 });
          return;
        }
        toast.update(loadMsg, {
          render: 'Loaded Successfully, Refreshing...',
          type: 'success',
          isLoading: false,
        });
        setOpen(false);
        setTimeout(() => {
          window?.location?.reload();
        }, 1000);
      } catch (e: any) {
        toast.update(loadMsg, { render: e?.message ?? 'Loaded Error', type: 'error', isLoading: false, autoClose: 2000 });
      }
    },
    [loginUser, setOpen],
  );
  useEffect(() => {
    if (!data?.length) {
      setPath(null);
      return;
    }
    setPath(data[0].message);
  }, [data]);
  return (
    <Dialog
      open={isOpen}
      title={`Github Loading From: ${loginUser?.uid} ${loginUser?.repo}`}
      showCloseButton={false}
      // className="h-auto"
      onOpenChange={(open) => setOpen(open)}
      render={() => (
        <div className="flex flex-col justify-center gap-2 p-2 pb-8">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            data?.map((commit) => (
              <div
                key={commit?.url}
                className={twMerge(
                  'flex cursor-pointer justify-between gap-2 overflow-auto bg-zinc-700 py-2 text-center text-white hover:bg-zinc-600',
                  clsx({ 'bg-zinc-500': commit?.message === path }),
                )}
                onClick={() => setPath(commit.message)}
              >
                {commit.message}
              </div>
            ))
          )}
        </div>
      )}
      renderFooter={({ close }) => (
        <div className="flex items-center justify-between gap-4">
          <Button onClick={() => setOpen(false)} type="default">
            取消
          </Button>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setOpen(false);
                setCloudBackupOpen(true);
              }}
              type="default"
            >
              查看云端备份
            </Button>
            <Button onClick={() => loaded(path)} type="primary">
              确认
            </Button>
          </div>
        </div>
      )}
    >
      <CloudBackupDialog />
    </Dialog>
  );
};

export default GithubLoadDialog;
