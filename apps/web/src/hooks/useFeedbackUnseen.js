import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

/**
 * Sino de feedback novo para o admin: quantos feedbacks chegaram depois
 * da última visita à caixa de entrada (/api/feedback/summary). Para
 * não-admin a query nem roda (enabled) e o sino fica em zero.
 *
 * Mesma queryKey no Header e na página de Feedback: o react-query
 * deduplica e o POST /seen da página invalida o sino de todos.
 */
export function useFeedbackUnseen(isAdmin = false) {
  const query = useQuery({
    queryKey: ['feedback-summary'],
    queryFn: () => api.get('/api/feedback/summary'),
    enabled: isAdmin,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  return {
    unseen: query.data?.unseen ?? 0,
    total: query.data?.total ?? 0,
  };
}
