import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

/** Usuário autenticado atual (null quando visitante). */
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/api/auth/me'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/api/auth/login', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

/** Login com Google: recebe o ID token (credential) validado pela API. */
export function useGoogleLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credential) => api.post('/api/auth/google', { credential }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/api/auth/register', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/auth/logout', {}),
    onSuccess: () => {
      queryClient.setQueryData(['me'], { user: null });
      queryClient.invalidateQueries();
    },
  });
}
