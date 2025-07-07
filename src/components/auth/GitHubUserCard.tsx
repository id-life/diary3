import { GitHubUser } from '@/api/auth';
import Button from '@/components/button';
import { AiFillGithub } from 'react-icons/ai';
import { BiTestTube, BiLogOut } from 'react-icons/bi';
import clsx from 'clsx';

interface GitHubUserCardProps {
  user: GitHubUser;
  onTestApi: () => void;
  onLogout: () => void;
  className?: string;
}

export const GitHubUserCard: React.FC<GitHubUserCardProps> = ({ user, onTestApi, onLogout, className }) => {
  return (
    <div className={clsx('rounded-lg bg-white/10 p-4 backdrop-blur-sm', className)}>
      <div className="mb-3 flex items-center gap-3">
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="GitHub Avatar"
              className="h-12 w-12 rounded-full border-2 border-white/20"
              onError={(e) => {
                // Fallback to default avatar if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <AiFillGithub className="h-6 w-6 text-white" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium text-white">{user.name || user.username}</h4>
          <p className="truncate text-sm text-white/70">@{user.username}</p>
        </div>
      </div>

      {/* User Details */}
      <div className="mb-4 space-y-2">
        {user.email && <div className="text-sm text-white/70">📧 {user.email}</div>}
        <div className="text-sm text-white/70">🆔 {user.id}</div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button size="small" className="flex flex-1 items-center justify-center gap-2" onClick={onTestApi} type="default">
          <BiTestTube className="h-4 w-4" />
          测试API
        </Button>
        <Button size="small" className="flex flex-1 items-center justify-center gap-2" onClick={onLogout} type="default" danger>
          <BiLogOut className="h-4 w-4" />
          登出
        </Button>
      </div>
    </div>
  );
};

export default GitHubUserCard;
