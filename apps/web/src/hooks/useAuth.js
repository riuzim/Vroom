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

/** Login/registro trocam a identidade: a rodada em cache é do VISITANTE
 *  anterior — continuar nela prometeria pontos que o servidor não grava
 *  (userId null) e travaria o daily da conta com o resultado do guest.
 *  ['round', mode] não está montada na página de login: invalidar aqui não
 *  reemite POSTs — o próximo /game/* retoma/cria a rodada certa. */
function onIdentityChange(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['me'] });
  queryClient.invalidateQueries({ queryKey: ['round'] });
  // Stats da conta anterior não podem vazar para a nova sessão.
  queryClient.removeQueries({ queryKey: ['stats'] });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/api/auth/login', body),
    onSuccess: () => onIdentityChange(queryClient),
  });
}

/** Login com Google: recebe o ID token (credential) validado pela API. */
export function useGoogleLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credential) => api.post('/api/auth/google', { credential }),
    onSuccess: () => onIdentityChange(queryClient),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/api/auth/register', body),
    onSuccess: () => onIdentityChange(queryClient),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/auth/logout', {}),
    onSuccess: () => {
      queryClient.setQueryData(['me'], { user: null });
      // Invalida só o que depende da sessão. Um invalidate sem filtro
      // refetcharia ['round', mode] — que é um POST com efeito colateral
      // (criar rodada nova), não uma leitura. A rodada em cache segue
      // válida até o próximo chute falhar (ROUND_NOT_YOURS → revalida).
      // Stats SÃO removidos: com enabled:false a query não refetcha e os
      // dados do ex-usuário ficariam na tela do visitante.
      queryClient.removeQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
