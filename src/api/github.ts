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
