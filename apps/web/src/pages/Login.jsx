import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';
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
import { useLogin, useGoogleLogin } from '@/hooks/useAuth';
import GoogleLoginButton from '@/components/GoogleLoginButton';

const loginSchema = z.object({
  email: z.string().email('Informe um email válido'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
});

export default function Login() {
  const navigate = useNavigate();
  const login = useLogin();
  const googleLogin = useGoogleLogin();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(values) {
    login.mutate(values, {
      onSuccess: () => {
        toast.success('De volta ao cockpit. Bora!');
        navigate('/');
      },
      onError: (error) => toast.error(error.message),
    });
  }

  function onGoogleSuccess(credential) {
    googleLogin.mutate(credential, {
      onSuccess: () => {
        toast.success('De volta ao cockpit. Bora!');
        navigate('/');
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl uppercase tracking-[0.22em]">Entrar</h1>
        <p className="mt-2 text-sm text-bone/55">
          Entre para guardar seus pontos no ranking global.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="voce@email.com"
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
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={login.isPending}>
                <LogIn className="size-4" />
                {login.isPending ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
          <div className="relative my-4" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-bone/55">ou</span>
            </div>
          </div>
          <GoogleLoginButton
            onSuccess={onGoogleSuccess}
            onError={(error) => toast.error(error.message)}
          />
          <p className="mt-4 text-center text-sm text-bone/55">
            Não tem conta?{' '}
            <Link
              to="/register"
              className="font-bold text-flame transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              Registre-se
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
