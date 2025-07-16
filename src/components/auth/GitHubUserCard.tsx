import { GitHubUser } from '@/api/auth';
import Button from '@/components/button';
import { AiFillGithub } from 'react-icons/ai';
import { BiTestTube, BiLogOut } from 'react-icons/bi';
import clsx from 'clsx';
import { backupDialogOpenAtom } from '@/atoms/app';
import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { saveStateToGithub } from '@/utils/GithubStorage';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { SaveIcon } from 'lucide-react';

interface GitHubUserCardProps {
  user: GitHubUser;
  onLogout: () => void;
  className?: string;
}

export const GitHubUserCard: React.FC<GitHubUserCardProps> = ({ user, onLogout, className }) => {
  const setBackupDialogOpen = useSetAtom(backupDialogOpenAtom);
  const { user: githubUser } = useGitHubOAuth();
  const save = useCallback(() => saveStateToGithub(null, true, githubUser), [githubUser]);

  return (
    <div className={clsx('rounded-lg bg-white p-6 shadow-sm border border-gray-100', className)}>
      {/* Header with Profile */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative">
          {user.avatar ? (
            <img src={user.avatar} alt="GitHub Avatar" className="h-16 w-16 rounded-full border-2 border-gray-200" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <AiFillGithub className="h-8 w-8 text-gray-600" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{user.name || user.username}&apos;s Diary</h3>
          <p className="text-sm text-gray-500">Last Use: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <SaveIcon className="h-5 w-5 text-gray-400" />
            <span className="text-gray-700">Save</span>
          </div>
          <button onClick={save} className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <BiTestTube className="h-5 w-5 text-gray-400" />
            <span className="text-gray-700">Load</span>
          </div>
          <button onClick={() => setBackupDialogOpen(true)} className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <Button className="w-full" onClick={onLogout} type="default" danger>
          Log out
        </Button>
      </div>
    </div>
  );
};

export default GitHubUserCard;
