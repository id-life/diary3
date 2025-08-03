'use client';

import { getUserProfile, updateUserProfile, GitHubUser } from '@/api/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import Loading from '../loading';

const FormSchema = z.object({
  githubId: z.string().optional(),
  githubSecret: z.string().optional().describe('Your GitHub Personal Access Token'),
  repo: z.string().optional().describe('The name of the repository to save backups'),
  isAutoBackup: z.boolean().optional(),
});

type FormData = z.infer<typeof FormSchema>;

export default function GitHubConfigForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: isUserLoading,
    isError,
  } = useQuery<GitHubUser>({
    queryKey: ['fetch_user_profile'],
    queryFn: getUserProfile,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      githubId: '',
      githubSecret: '',
      repo: '',
      isAutoBackup: false,
    },
  });

  const githubId = form.watch('githubId');
  const repo = form.watch('repo');
  const githubSecret = form.watch('githubSecret');

  const areSettingsSufficient = useMemo(() => {
    return !!(githubId && repo && githubSecret);
  }, [githubId, repo, githubSecret]);

  useEffect(() => {
    if (!areSettingsSufficient) {
      form.setValue('isAutoBackup', false);
    }
  }, [areSettingsSufficient, form]);

  useEffect(() => {
    if (user) {
      form.reset({
        githubId: user.githubId || '',
        githubSecret: user.githubSecret || '',
        repo: user.repo || '',
        isAutoBackup: user.isAutoBackup || false,
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['fetch_user_profile'], updatedUser);
      toast.success('GitHub settings updated successfully!');
      router.push('/settings');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings.');
    },
  });

  const onSubmit = (data: FormData) => {
    updateProfileMutation.mutate(data);
  };

  if (isUserLoading) {
    return (
      <div className="flex-center py-10">
        <Loading />
        <span>Loading settings...</span>
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500">Failed to load user profile. Please try again.</div>;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col gap-5">
        <FormField
          control={form.control}
          name="githubId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub Username:</FormLabel>
              <FormControl>
                <Input placeholder="Your GitHub username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="repo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repository Name:</FormLabel>
              <FormControl>
                <Input placeholder="e.g., my-diary-backups" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="githubSecret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personal Access Token:</FormLabel>
              <FormControl>
                <Input type="password" placeholder="ghp_... or leave blank to keep existing" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isAutoBackup"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-0.5">
                <FormLabel>Enable Auto Backup:</FormLabel>
                <FormDescription className="text-xs">
                  {!areSettingsSufficient
                    ? 'Please provide a GitHub Username and Repository Name to enable this.'
                    : 'Automatically back up your data once daily.'}
                </FormDescription>
              </div>
              <FormControl>
                <Switch size="large" checked={field.value} onCheckedChange={field.onChange} disabled={!areSettingsSufficient} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="mx-6 mb-10 mt-auto">
          <Button
            variant="primary"
            size="large"
            className="w-full flex-1 rounded-[8px]"
            htmlType="submit"
            disabled={updateProfileMutation.isLoading}
            loading={updateProfileMutation.isLoading}
          >
            {updateProfileMutation.isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
