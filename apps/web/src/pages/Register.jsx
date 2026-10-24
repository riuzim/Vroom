import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRegister, useGoogleLogin } from '@/hooks/useAuth';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { usePageMeta } from '@/hooks/usePageMeta';
import { apiErrorMessage } from '@/lib/api';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const register = useRegister();
  const googleLogin = useGoogleLogin();

  usePageMeta({
    title: t('auth.registerMetaTitle'),
    description: t('auth.registerMetaDescription'),
  });

  const registerSchema = useMemo(
    () =>
      z
        .object({
          username: z
            .string()
            .min(3, t('auth.validation.usernameMin'))
            .max(20, t('auth.validation.usernameMax'))
            .regex(/^[a-zA-Z0-9_]+$/, t('auth.validation.usernameFormat')),
          email: z.string().email(t('auth.validation.emailInvalid')),
          password: z.string().min(6, t('auth.validation.passwordMin')),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t('auth.validation.passwordMismatch'),
          path: ['confirmPassword'],
        }),
    [t],
  );

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  function onSubmit(values) {
    const { confirmPassword: _confirm, ...body } = values;
    register.mutate(body, {
      onSuccess: () => {
        toast.success(t('auth.accountCreated'));
        navigate('/');
      },
      onError: (error) => toast.error(apiErrorMessage(t, error)),
    });
  }

  function onGoogleSuccess(credential) {
    googleLogin.mutate(credential, {
      onSuccess: () => {
        toast.success(t('auth.accountCreated'));
        navigate('/');
      },
      onError: (error) => toast.error(apiErrorMessage(t, error)),
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.18em]">
          {t('auth.registerTitle')}
        </h1>
        <p className="mt-2 text-sm text-bone/55">{t('auth.registerSubtitle')}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.username')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.usernamePlaceholder')}
                        autoComplete="username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.password')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={register.isPending}>
                <UserPlus className="size-4" />
                {register.isPending ? t('auth.creating') : t('auth.registerButton')}
              </Button>
            </form>
          </Form>
          <div className="relative my-4" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-bone/55">{t('auth.orDivider')}</span>
            </div>
          </div>
          <GoogleLoginButton
            onSuccess={onGoogleSuccess}
            onError={(error) => toast.error(apiErrorMessage(t, error))}
          />
          <p className="mt-4 text-center text-sm text-bone/55">
            {t('auth.hasAccount')}{' '}
            <Link
              to="/login"
              className="font-bold text-flame transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              {t('auth.loginLink')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
