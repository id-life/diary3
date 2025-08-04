import { atomWithStorage } from 'jotai/utils';

export interface GitHubConfig {
  username: string;
  repo: string;
  token: string;
  autoBackupEnabled: boolean;
}

export const githubConfigAtom = atomWithStorage<GitHubConfig | null>('githubUserConfig', null);
