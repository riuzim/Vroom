import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';

export const TERMS_UPDATED_AT = '18 de outubro de 2026';

const focusClasses = 'text-flame underline-offset-4 hover:underline';

export default function Terms() {
  usePageMeta({
    title: 'Termos de Uso — Vroom',
    description:
      'Regras do jogo Vroom: contas, fair play, propriedade intelectual das imagens, publicidade e limitação de responsabilidade.',
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl uppercase tracking-[0.22em]">Termos de Uso</h1>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-bone/50">
        Última atualização: {TERMS_UPDATED_AT}
      </p>

      <p className="mt-6 text-sm leading-relaxed text-bone/80">
        O Vroom é um jogo gratuito de adivinhar carros, oferecido "no estado em que se
        encontra" para fins de entretenimento. Ao usar o site e criar uma conta, você
        concorda com estes Termos e com a{' '}
        <Link to="/privacidade" className={focusClasses}>Política de Privacidade</Link>.
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">1. Contas e idade</h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        A pontuação no ranking global exige conta. Você é responsável pela segurança
        dos seus dados de acesso e declara ter ao menos 14 anos — menores só podem
        usar com autorização dos responsáveis.
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">2. Fair play e conduta</h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        É proibido usar bots, scripts, automação, engenharia reversa ou qualquer
        artifício para burlar o jogo, manipular o ranking ou abusar da API (incluindo
        ignorar limites de taxa). Violações podem resultar em zeramento de pontuação,
        suspensão ou exclusão da conta, a critério do mantenedor.
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">3. Propriedade intelectual</h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        Marcas, nomes e designs de veículos pertencem aos respectivos fabricantes; o
        Vroom é um projeto de fã independente, sem afiliação ou patrocínio. O código
        do site é aberto. As fotos dos carros vêm do Wikimedia Commons sob licenças
        Creative Commons/domínio público — a atribuição completa de autores e
        licenças está na página{' '}
        <Link to="/creditos" className={focusClasses}>Créditos</Link>.
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">4. Publicidade</h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        O site pode exibir anúncios do Google AdSense, veiculados por terceiros. Não
        endossamos anunciantes nem nos responsabilizamos pelo conteúdo anunciado.
        É proibido clicar artificialmente nos anúncios (inclusive pedir isso a
        terceiros) — isso viola as políticas do Google e pode banir o site.
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">5. Disponibilidade e responsabilidade</h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        O serviço é fornecido sem garantias de disponibilidade contínua. Na máxima
        extensão permitida pela lei, o Vroom não responde por danos indiretos, lucros
        cessantes ou perda de dados decorrentes do uso do site.
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">6. Alterações e foro</h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        Estes Termos podem mudar; a data no topo indica a versão vigente. Aplicam-se
        as leis da República Federativa do Brasil. Dúvidas ou denúncias de abuso:{' '}
        <a href="mailto:vroomfeedback@gmail.com" className={focusClasses}>
          vroomfeedback@gmail.com
        </a>
        .
      </p>
    </main>
  );
}
