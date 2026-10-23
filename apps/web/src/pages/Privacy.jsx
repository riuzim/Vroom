import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';

export const PRIVACY_UPDATED_AT = '18 de outubro de 2026';

const focusClasses = 'text-flame underline-offset-4 hover:underline';

export default function Privacy() {
  usePageMeta({
    title: 'Política de Privacidade — Vroom',
    description:
      'Quais dados o Vroom coleta (conta, pontuação, logs, cookies), por quê, com quem são compartilhados e como exercer seus direitos pela LGPD.',
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl uppercase tracking-[0.22em]">Política de Privacidade</h1>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-bone/50">
        Última atualização: {PRIVACY_UPDATED_AT}
      </p>

      <section className="mt-6 space-y-3 text-sm leading-relaxed text-bone/80">
        <p>
          O Vroom (o "site") é um jogo de adivinhar carros mantido como projeto pessoal
          por pessoa física ("controlador", nos termos da Lei nº 13.709/2018 — LGPD).
          Este documento explica quais dados pessoais tratamos, com quais bases legais
          e como você pode exercer seus direitos.
        </p>
      </section>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">1. Dados que coletamos</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-bone/80">
        <li>
          <strong>Conta:</strong> nome de usuário, e-mail e senha (armazenada apenas como
          hash bcrypt) — ou identificador do Google, se você entrar com login do Google.
        </li>
        <li>
          <strong>Jogo:</strong> pontuações, rodadas jogadas e presença no ranking
          (associadas à conta; sem conta, ficam só no seu navegador via localStorage).
        </li>
        <li>
          <strong>Logs técnicos:</strong> a infraestrutura de hospedagem registra IP,
          data/hora e user-agent para segurança e limitação de taxa (anti-abuso).
        </li>
        <li>
          <strong>Cookies e armazenamento local:</strong> veja a{' '}
          <Link to="/cookies" className={focusClasses}>Política de Cookies</Link>.
        </li>
      </ul>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">2. Bases legais (LGPD, art. 7º)</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-bone/80">
        <li><strong>Execução de contrato:</strong> criar e manter sua conta de jogo.</li>
        <li><strong>Legítimo interesse:</strong> segurança, prevenção a fraude e rate-limiting.</li>
        <li><strong>Consentimento:</strong> cookies de publicidade e de análise — opt-in, revogável.</li>
      </ul>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">3. Compartilhamento</h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        Não vendemos dados. Compartilhamos apenas: (a) provedor de hospedagem e banco
        de dados do site; (b) Google LLC — autenticação OAuth (quando você escolhe
        login com Google) e veiculação de anúncios (Google AdSense), com transferência
        internacional de dados suportada pelas garantias aplicáveis à transferência
        nos termos da LGPD (art. 33).
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">4. Anúncios e cookies de terceiros</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-bone/80">
        <p>
          Terceiros, incluindo o Google, usam cookies para veicular anúncios com base
          em visitas anteriores que você fez a este site ou a outros sites. Os cookies
          de publicidade do Google e de seus parceiros só são ativados após o seu
          consentimento, e você pode revogá-lo a qualquer momento na página de cookies.
        </p>
        <p>
          Você pode desativar a publicidade personalizada nas{' '}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noreferrer"
            className={focusClasses}
          >
            Configurações de anúncios do Google
          </a>
          , ou conhecer outras opções de desativação em{' '}
          <a
            href="https://www.aboutads.info/choices"
            target="_blank"
            rel="noreferrer"
            className={focusClasses}
          >
            aboutads.info
          </a>{' '}
          e{' '}
          <a
            href="https://www.youronlinechoices.eu"
            target="_blank"
            rel="noreferrer"
            className={focusClasses}
          >
            youronlinechoices.eu
          </a>
          .
        </p>
      </div>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">5. Retenção</h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        Dados de conta e jogo são mantidos enquanto a conta existir (você pode pedir
        exclusão a qualquer momento). Logs técnicos são mantidos por até 12 meses.
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">6. Seus direitos (LGPD, art. 18)</h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        Você pode solicitar confirmação do tratamento, acesso aos dados, correção,
        anonimização, portabilidade, eliminação, revogação de consentimento e
        informação sobre compartilhamentos. Basta escrever para{' '}
        <a href="mailto:vroomfeedback@gmail.com" className={focusClasses}>
          vroomfeedback@gmail.com
        </a>{' '}
        — respondemos em até 15 dias. Se entender que seus direitos foram violados,
        você pode peticionar à ANPD (gov.br/anpd).
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">7. Encarregado (DPO)</h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        Na condição de agente de pequeno porte (Resolução CD/ANPD nº 2/2022), o
        controlador dispensa a nomeação formal de encarregado, mas mantém este canal
        aberto para titulares: vroomfeedback@gmail.com.
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">8. Menores</h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        O Vroom não é direcionado a crianças. Menores de 14 anos só devem usá-lo com
        autorização dos responsáveis, que podem solicitar a exclusão dos dados pelo
        mesmo canal.
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">9. Alterações</h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        Esta política pode ser atualizada; a data no topo indica a versão vigente.
        Mudanças relevantes (por exemplo, novas ferramentas de análise) serão avisadas
        no site e exigirão novo consentimento quando aplicável.
      </p>
    </main>
  );
}
