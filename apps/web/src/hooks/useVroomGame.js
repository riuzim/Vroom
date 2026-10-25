import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { INITIAL_BLUR, MAX_ATTEMPTS, dailyNumber } from '@vroom/shared';
import { api, apiErrorMessage, apiUrl } from '@/lib/api';
import { useMe } from '@/hooks/useAuth';
import { loadLocalScores, saveLocalScores, useLocalScores } from '@/lib/localScores';

/**
 * Loop de jogo server-authoritative (Fase 3). O nome do carro nunca sai do
 * servidor antes do fim da rodada; o cliente apenas renderiza o estado que a
 * API devolve. Visitantes (guests) também jogam pelo servidor, mas não
 * pontuam no ranking.
 *
 * As mensagens de fim de rodada são compostas no cliente via i18n a partir do
 * resultado estruturado (result + carName + attemptsLeft); a mensagem pt do
 * servidor continua como fallback implícito nos códigos da API.
 */
function composeGuessMessage(t, data) {
  const name = data.round?.carName ?? '';
  switch (data.result) {
    case 'correct':
      return t('game.messages.correct', { name });
    case 'failed':
      return t('game.messages.failed', { name });
    default: {
      const count = data.round?.attemptsLeft ?? data.attemptsLeft ?? 0;
      return t('game.messages.wrong', { count });
    }
  }
}

export function useVroomGame(mode = 'classic') {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: meData } = useMe();
  const user = meData?.user ?? null;

  const roundQuery = useQuery({
    queryKey: ['round', mode],
    queryFn: () => api.post('/api/rounds', { mode }),
    staleTime: Infinity,
    // Um 429 do rate limit NÃO deve ser reenviado na hora (dobra a pressão
    // no mesmo segundo); erros de rede legítimos ganham uma retentativa.
    retry: (failureCount, error) => failureCount < 1 && error?.status !== 429,
  });

  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [sessionScore, setSessionScore] = useState(0);
  // Fonte única de verdade para os scores locais (sincroniza entre abas).
  const scores = useLocalScores();
  const nextTimer = useRef(null);

  const round = roundQuery.data?.round ?? null;
  const isRoundOver = !round || round.status !== 'playing';
  // Daily e Série são "um desafio por dia": encerrados, mostram o card do dia.
  const isDailyMode = mode === 'daily' || mode === 'themed';
  const dailyDone = isDailyMode && isRoundOver && round !== null;
  // Número sequencial do desafio (#N) — derivado do dailyDate que o servidor
  // devolve (date pura ou slot "data#tema" da Série).
  const dailyDate = round?.dailyDate ?? null;
  const dailyNum = useMemo(() => {
    if (!isDailyMode || !dailyDate) {
      return null;
    }
    return dailyNumber(dailyDate.split('#')[0]);
  }, [dailyDate, isDailyMode]);

  // Trocar de modo (ex.: Daily acertado → Classic) não pode carregar o
  // resultado da rodada anterior: status/message são da rodada, não do
  // jogador. O cleanup também cancela o "próxima rodada" pendente do
  // modo anterior — e, no unmount, faz o trabalho do effect antigo.
  useEffect(() => {
    setStatus('idle');
    setMessage('');
    return () => {
      if (nextTimer.current) {
        clearTimeout(nextTimer.current);
        nextTimer.current = null;
      }
    };
  }, [mode]);

  // A virada do dia derruba o cache do desafio diário: sem isso, o
  // "Desafio de hoje concluído" de ONTEM fica na tela (e uma rodada
  // playing de ontem continuaria jogável no dia errado) até um F5.
  useEffect(() => {
    if (!isDailyMode || !round?.dailyDate) {
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (round.dailyDate.split('#')[0] !== today) {
      queryClient.invalidateQueries({ queryKey: ['round', mode] });
    }
  }, [isDailyMode, mode, queryClient, round?.dailyDate]);

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
        if (isDailyMode) {
          // Daily/Série encerrados: não há próxima rodada hoje.
          return;
        }
        startNextRound();
      }, delay);
    },
    [isDailyMode, startNextRound],
  );

  // Fim de rodada diária alimenta streak/stats do perfil — invalida para
  // refetch (na montagem da página de Perfil e no share).
  const refreshDailyStats = useCallback(() => {
    if (isDailyMode && user) {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  }, [isDailyMode, queryClient, user]);

  const recordEndedRound = useCallback((sessionStreak) => {
    // Score local acompanha o streak da sessão (Best/Last Score do painel).
    // Streak 0 não aparece em painel nenhum — não ocupa espaço; histórico
    // limitado para o localStorage não crescer sem fim.
    const history = loadLocalScores().filter((item) => item > 0);
    if (sessionStreak > 0 && history[history.length - 1] !== sessionStreak) {
      history.push(sessionStreak);
    }
    saveLocalScores(history.slice(-200));
  }, []);

  const guessMutation = useMutation({
    mutationFn: (guess) => api.post(`/api/rounds/${round?.id}/guess`, { guess }),
    onSuccess: (data) => {
      // Resposta atrasada (logout/troca de sessão no meio do voo): só grava
      // se o cache ainda mostra a MESMA rodada que recebeu o chute.
      if (queryClient.getQueryData(['round', mode])?.round?.id === data.round?.id) {
        queryClient.setQueryData(['round', mode], { round: data.round });
      }
      setStatus(data.result);
      setMessage(composeGuessMessage(t, data));

      if (data.result === 'correct') {
        const nextStreak = sessionScore + 1;
        // O acerto também grava no histórico local: sessão terminada em
        // vitória não pode se perder (o dedupe evita o failed seguinte
        // gravar o mesmo valor de novo).
        recordEndedRound(nextStreak);
        setSessionScore(nextStreak);
        if (user && data.points > 0) {
          toast.success(t('game.pointsToast', { points: data.points }));
        }
        refreshDailyStats();
        scheduleNext(1400);
      } else if (data.result === 'failed') {
        recordEndedRound(sessionScore);
        setSessionScore(0);
        refreshDailyStats();
        scheduleNext(4000);
      }
    },
    onError: (error) => {
      toast.error(apiErrorMessage(t, error));
      // Rodada morta no servidor (encerrada noutra aba, sessão caiu):
      // revalida para o jogo se recuperar sozinho em vez de ficar preso
      // em loop de 403/401 até um F5.
      if (
        ['ROUND_ENDED', 'ROUND_NOT_YOURS', 'ROUND_NOT_FOUND'].includes(error?.code) ||
        error?.status === 401
      ) {
        queryClient.invalidateQueries({ queryKey: ['round', mode] });
      }
    },
  });

  const skipMutation = useMutation({
    mutationFn: () => api.post(`/api/rounds/${round?.id}/skip`),
    onSuccess: (data) => {
      if (queryClient.getQueryData(['round', mode])?.round?.id === data.round?.id) {
        queryClient.setQueryData(['round', mode], { round: data.round });
      }
      setStatus('skipped');
      setMessage(t('game.messages.skipped', { name: data.round?.carName ?? '' }));
      recordEndedRound(sessionScore);
      setSessionScore(0);
      refreshDailyStats();
      // Igual ao chute errado: agenda a próxima rodada para não travar o jogo.
      scheduleNext(1800);
    },
    onError: (error) => {
      toast.error(apiErrorMessage(t, error));
      if (
        ['ROUND_ENDED', 'ROUND_NOT_YOURS', 'ROUND_NOT_FOUND'].includes(error?.code) ||
        error?.status === 401
      ) {
        queryClient.invalidateQueries({ queryKey: ['round', mode] });
      }
    },
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
    attemptsUsed: round ? MAX_ATTEMPTS - (round.attemptsLeft ?? MAX_ATTEMPTS) : 0,
    bestScores,
    blur: round?.blur ?? INITIAL_BLUR,
    carName: round?.carName ?? null,
    carCredits: round?.carCredits ?? null,
    dailyDone,
    dailyNum,
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
    theme: round?.theme ?? null,
    user,
  };
}
