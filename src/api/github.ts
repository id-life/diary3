import { selectLoginUser, useAppSelector } from '@/entry/store';
import { Octokit } from '@octokit/rest';
import { useMutation, useQuery } from '@tanstack/react-query';
import instance from './request';
import { useAccessToken } from '@/hooks/app';

export interface BackupInfo {
  id: string;
  fileName: string;
  content: any;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export const saveBackupList = ({ content, fileName }: { content: string; fileName: string }): Promise<boolean> =>
  instance.post('/github-backups', { content, fileName });

export const getBackupList = (): Promise<BackupInfo[]> => instance.get('/github-backups');

export const useBackupList = () => {
  const { accessToken } = useAccessToken();
  return useQuery({
    queryKey: ['fetch_backup_list', accessToken],
    queryFn: getBackupList,
    enabled: !!accessToken,
  });
};
export const useSaveBackupList = () => {
  return useMutation({
    mutationFn: saveBackupList,
  });
};
export const useFetchCommits = () => {
  const loginUser = useAppSelector(selectLoginUser);

  return useQuery(
    ['fetch_commits', loginUser],
    async () => {
      if (!loginUser?.uid || !loginUser?.repo || !loginUser?.githubSecret) {
        return [];
      }

      const octokit = new Octokit({
        auth: loginUser.githubSecret,
        userAgent: 'diary-app',
      });
      const owner = loginUser.uid;
      const repo = loginUser.repo;
      const commits = await octokit.rest.repos.listCommits({
        owner,
        repo,
      });
      return commits.data.filter(({ commit }) => commit?.message?.startsWith(`dairy-save-`)).map((item) => item.commit);
    },
    {
      enabled: !!(loginUser?.uid && loginUser?.repo && loginUser?.githubSecret),
    },
  );
};
