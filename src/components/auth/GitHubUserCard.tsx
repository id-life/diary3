import { GitHubUser } from '@/api/auth';
import Button from '@/components/button';
import { AiFillGithub } from 'react-icons/ai';
import { BiTestTube, BiLogOut } from 'react-icons/bi';
import clsx from 'clsx';
import { backupDialogOpenAtom } from '@/atoms/app';
import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { saveStateToGithub } from '@/utils/GithubStorage';
import { useAppSelector } from '@/entry/store';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { SaveIcon } from 'lucide-react';

interface GitHubUserCardProps {
  user: GitHubUser;
  onLogout: () => void;
  className?: string;
}

export const GitHubUserCard: React.FC<GitHubUserCardProps> = ({ user, onLogout, className }) => {
  const setBackupDialogOpen = useSetAtom(backupDialogOpenAtom);
  const loginUserState = useAppSelector((state) => state.loginUser);
  const { user: githubUser } = useGitHubOAuth();
  const save = useCallback(() => saveStateToGithub(loginUserState, true, githubUser), [loginUserState, githubUser]);

  return (
    <div className={clsx('rounded-lg border border-gray-200/50 bg-white/95 p-4 shadow-lg backdrop-blur-sm', className)}>
      <div className="mb-3 flex items-center gap-3">
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="GitHub Avatar"
              className="h-12 w-12 rounded-full border-2 border-gray-300"
              onError={(e) => {
                // Fallback to default avatar if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <AiFillGithub className="h-6 w-6 text-gray-600" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium text-gray-900">{user.name || user.username}</h4>
          <p className="truncate text-sm text-gray-600">@{user.username}</p>
        </div>
      </div>

      {/* User Details */}
      <div className="mb-4 space-y-2">
        {user.email && <div className="text-sm text-gray-600">email: {user.email}</div>}
        <div className="text-sm text-gray-600">uid: {user.id}</div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-2">
          <Button className="flex items-center justify-center gap-2" onClick={save} type="primary" size="large">
            <SaveIcon className="h-4 w-4" />
            Save
          </Button>
          <Button
            className="flex items-center justify-center gap-2"
            onClick={() => setBackupDialogOpen(true)}
            type="primary"
            size="large"
          >
            <BiTestTube className="h-4 w-4" />
            Load
          </Button>
        </div>
        <Button className="flex flex-1 items-center justify-center gap-2" onClick={onLogout} type="default" danger>
          <BiLogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default GitHubUserCard;
