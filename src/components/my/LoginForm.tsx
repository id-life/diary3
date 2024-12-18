'use client';

import clsx from 'clsx';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { AiFillGithub } from 'react-icons/ai';
import { firstLogin } from '../../entry/login-user-slice';
import { useAppDispatch } from '../../entry/store';
import Button from '../button';
import { toast } from 'react-toastify';

const LoginForm = ({ className }: { className?: string }) => {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (values: any) => {
    try {
      console.log('Success:', values);
      dispatch(firstLogin(values));
      toast.success(`${values?.uid} Login successfully!`);
    } catch (error) {
      console.log('Login Error:', error);
      toast.error('Login Error!');
    }
  };

  const onError = useCallback((errors: any) => {
    try {
      for (let field in errors) {
        if (errors?.[field]?.message) {
          toast.error(errors?.[field]?.message?.toString() as string);
          return;
        }
      }
    } catch (error) {
      console.log('Login Error:', error);
      toast.error('Login Error!');
    }
  }, []);

  return (
    <form className={clsx('flex flex-col items-center gap-4 text-white', className)} onSubmit={handleSubmit(onSubmit, onError)}>
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <div className="h-4 text-red-400">*</div>
            <label htmlFor="uid">github-username</label>
          </div>
          {errors?.uid?.message && <p className="text-red-400">{errors?.uid?.message.toString()}</p>}
        </div>
        <input
          aria-label="uid"
          className="flex-grow rounded-lg px-2 py-1 text-black"
          {...register('uid', { required: 'username is required' })}
        />
      </div>
      <div className="flex gap-2">
        <label htmlFor="githubSecret"> github-secret </label>
        <input aria-label="githubSecret" className="flex-grow rounded-lg px-2 py-1 text-black" {...register('githubSecret')} />
      </div>
      <div className="flex gap-2">
        <label htmlFor="repo">github-repo</label>
        <input aria-label="repo" className="flex-grow rounded-lg px-2 py-1 text-black" {...register('repo')} />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <div className="h-4 text-red-400">*</div>
            <label htmlFor="email">github-email</label>
          </div>
          {errors?.email?.message && <p className="text-red-400">{errors?.email?.message.toString()}</p>}
        </div>
        <input
          aria-label="email"
          className="flex-grow rounded-lg px-2 py-1 text-black"
          {...register('email', { required: 'email is required' })}
        />
      </div>
      <Button htmlType="submit" className="flex w-full items-center justify-center gap-2 py-3">
        <AiFillGithub className="h-6 w-6" /> Login with Github
      </Button>
    </form>
  );
};

export default LoginForm;
