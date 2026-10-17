import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLogin } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Informe um email válido'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
});

export default function Login() {
  const navigate = useNavigate();
  const login = useLogin();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(values) {
    login.mutate(values, {
      onSuccess: () => {
        toast.success('Bem-vindo de volta!');
        navigate('/');
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl uppercase tracking-[0.22em]">Entrar</h1>
        <p className="mt-2 text-sm text-white/55">Salve seus scores no ranking global.</p>
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
                      <Input type="email" placeholder="voce@email.com" autoComplete="email" {...field} />
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
                      <Input type="password" placeholder="••••••" autoComplete="current-password" {...field} />
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
          <p className="mt-4 text-center text-sm text-white/55">
            Não tem conta?{' '}
            <Link to="/register" className="font-bold text-flame hover:underline">
              Registre-se
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
