import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
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

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'O nome precisa ter ao menos 3 caracteres')
      .max(20, 'Máximo de 20 caracteres')
      .regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e _'),
    email: z.string().email('Informe um email válido'),
    password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

export default function Register() {
  const navigate = useNavigate();
  const register = useRegister();
  const googleLogin = useGoogleLogin();

  usePageMeta({
    title: 'Criar conta — Vroom',
    description: 'Crie sua conta no Vroom para salvar pontuações e entrar no ranking global.',
  });
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  function onSubmit(values) {
    const { confirmPassword: _confirm, ...body } = values;
    register.mutate(body, {
      onSuccess: () => {
        toast.success('Conta criada.');
        navigate('/');
      },
      onError: (error) => toast.error(error.message),
    });
  }

  function onGoogleSuccess(credential) {
    googleLogin.mutate(credential, {
      onSuccess: () => {
        toast.success('Conta criada.');
        navigate('/');
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl uppercase tracking-[0.22em]">Criar conta</h1>
        <p className="mt-2 text-sm text-bone/55">Guarde seu progresso e dispute o ranking.</p>
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
                    <FormLabel>Nome de usuário</FormLabel>
                    <FormControl>
                      <Input placeholder="seu nome" autoComplete="username" {...field} />
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
                    <FormLabel>Confirmar senha</FormLabel>
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
                {register.isPending ? 'Criando...' : 'Criar conta'}
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
            Já tem conta?{' '}
            <Link
              to="/login"
              className="font-bold text-flame transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
