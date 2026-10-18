import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { INITIAL_BLUR, MAX_ATTEMPTS } from '@vroom/shared';
import { api, apiUrl } from '@/lib/api';
import { useMe } from '@/hooks/useAuth';
import { loadLocalScores, saveLocalScores, useLocalScores } from '@/lib/localScores';

/**
 * Loop de jogo server-authoritative (Fase 3). O nome do carro nunca sai do
 * servidor antes do fim da rodada; o cliente apenas renderiza o estado que a
 * API devolve. Visitantes (guests) também jogam pelo servidor, mas não
 * pontuam no ranking.
 */
export function useVroomGame(mode = 'classic') {
  const queryClient = useQueryClient();
  const { data: meData } = useMe();
  const user = meData?.user ?? null;

  const roundQuery = useQuery({
    queryKey: ['round', mode],
    queryFn: () => api.post('/api/rounds', { mode }),
    staleTime: Infinity,
    retry: 1,
  });

  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [sessionScore, setSessionScore] = useState(0);
  // Fonte única de verdade para os scores locais (sincroniza entre abas).
  const scores = useLocalScores();
  const nextTimer = useRef(null);

  const round = roundQuery.data?.round ?? null;
  const isRoundOver = !round || round.status !== 'playing';
  const dailyDone = mode === 'daily' && isRoundOver && round !== null;

  useEffect(() => {
    return () => {
      if (nextTimer.current) {
        clearTimeout(nextTimer.current);
      }
    };
  }, []);

  const startNextRound = useCallback(() => {
    setStatus('idle');
    setMessage('');
    queryClient.invalidateQueries({ queryKey: ['round', mode] });
  }, [mode, queryClient]);

  const scheduleNext = useCallback(
    (delay) => {
      if (nextTimer.current) {
        clearTimeout(nextTimer.current);
      }
      nextTimer.current = setTimeout(() => {
        if (mode === 'daily') {
          // Daily encerrado: não há próxima rodada hoje.
          return;
        }
        startNextRound();
      }, delay);
    },
    [mode, startNextRound],
  );

  const recordEndedRound = useCallback((sessionStreak) => {
    // Score local acompanha o streak da sessão (Best/Last Score do painel).
    // Grava no fim da rodada direto na store, que é a fonte única de verdade.
    saveLocalScores([...loadLocalScores(), sessionStreak]);
  }, []);

  const guessMutation = useMutation({
    mutationFn: (guess) => api.post(`/api/rounds/${round?.id}/guess`, { guess }),
    onSuccess: (data) => {
      queryClient.setQueryData(['round', mode], { round: data.round });
      setStatus(data.result);
      setMessage(data.message);

      if (data.result === 'correct') {
        setSessionScore((value) => value + 1);
        if (user && data.points > 0) {
          toast.success(`+${data.points} pts cravados no ranking.`);
        }
        scheduleNext(1400);
      } else if (data.result === 'failed') {
        recordEndedRound(sessionScore);
        setSessionScore(0);
        scheduleNext(4000);
      }
    },
    onError: (error) => toast.error(error.message),
  });

  const skipMutation = useMutation({
    mutationFn: () => api.post(`/api/rounds/${round?.id}/skip`),
    onSuccess: (data) => {
      queryClient.setQueryData(['round', mode], { round: data.round });
      setStatus('skipped');
      setMessage(data.message);
      recordEndedRound(sessionScore);
      setSessionScore(0);
      // Igual ao chute errado: agenda a próxima rodada para não travar o jogo.
      scheduleNext(1800);
    },
    onError: (error) => toast.error(error.message),
  });

  const bestScores = useMemo(
    () =>
      [...scores]
        .filter((item) => item > 0)
        .sort((a, b) => b - a)
        .slice(0, 3),
    [scores],
  );

  const recentScores = useMemo(
    () =>
      [...scores]
        .filter((item) => item > 0)
        .slice(-5)
        .reverse(),
    [scores],
  );

  return {
    attemptsLeft: round?.attemptsLeft ?? MAX_ATTEMPTS,
    bestScores,
    blur: round?.blur ?? INITIAL_BLUR,
    carName: round?.carName ?? null,
    carCredits: round?.carCredits ?? null,
    dailyDone,
    guess: guessMutation.mutate,
    hint: round?.hint ?? '',
    imageUrl: round?.imagePath ? apiUrl(round.imagePath) : null,
    isError: roundQuery.isError,
    isLoading: roundQuery.isLoading,
    isGuessing: guessMutation.isPending,
    isHardMode: mode === 'hard',
    isRoundOver,
    isSkipping: skipMutation.isPending,
    message,
    mode,
    points: round?.points ?? null,
    recentScores,
    roundStatus: round?.status ?? 'idle',
    score: sessionScore,
    skip: skipMutation.mutate,
    status,
    user,
  };
}
