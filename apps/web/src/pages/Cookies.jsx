import { usePageMeta } from '@/hooks/usePageMeta';
import { setConsent, useConsent } from '@/lib/consent';

export const COOKIES_UPDATED_AT = '18 de outubro de 2026';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const focusClasses = 'text-flame underline-offset-4 hover:underline';

export default function Cookies() {
  usePageMeta({
    title: 'Política de Cookies — Vroom',
    description:
      'Quais cookies o Vroom usa (essenciais, publicidade, análise), por quê, e como aceitar, recusar ou rever suas preferências a qualquer momento.',
  });
  const consent = useConsent();

  const reopenBanner = () => setConsent({ decided: false });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl uppercase tracking-[0.22em]">Política de Cookies</h1>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-bone/50">
        Última atualização: {COOKIES_UPDATED_AT}
      </p>

      <p className="mt-6 text-sm leading-relaxed text-bone/80">
        Cookies essenciais (sessão de login) dispensam consentimento e não podem ser desativados.
        Todas as outras categorias vêm desativadas por padrão e só são ativadas com o seu
        consentimento explícito — padrão exigido pela LGPD e pelo guia de cookies da ANPD.
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">Categorias</h2>
      <div className="mt-2 border-2 border-line">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-line bg-raised font-mono text-xs uppercase tracking-wide text-bone/60">
              <th className="p-3">Categoria</th>
              <th className="p-3">O que faz</th>
              <th className="p-3">Consentimento</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-line text-bone/80">
            <tr>
              <td className="p-3 font-bold">Essenciais</td>
              <td className="p-3">
                <code className="font-mono text-xs">vroom_token</code> — sessão de login (JWT
                httpOnly, 7 dias, removido ao sair).{' '}
                <code className="font-mono text-xs">vroom:scores</code> e{' '}
                <code className="font-mono text-xs">vroom:consent</code> — pontuação local e a sua
                escolha de cookies (localStorage, só no seu navegador).
              </td>
              <td className="p-3">Não exigido (art. 7º, V LGPD)</td>
            </tr>
            <tr>
              <td className="p-3 font-bold">Publicidade</td>
              <td className="p-3">
                Cookies do Google AdSense e parceiros para veicular e medir anúncios (incl.
                personalização com base em visitas anteriores). Saiba mais na{' '}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noreferrer"
                  className={focusClasses}
                >
                  página do Google
                </a>
                .
              </td>
              <td className="p-3">
                Opt-in —{' '}
                <strong>
                  {consent.decided ? (consent.advertising ? 'ativado' : 'desativado') : 'pendente'}
                </strong>
              </td>
            </tr>
            <tr>
              <td className="p-3 font-bold">Análise</td>
              <td className="p-3">
                Estatísticas de uso para melhorar o jogo. Nenhuma ferramenta ativa hoje; se alguma
                for adicionada, será listada aqui e exigirá novo consentimento.
              </td>
              <td className="p-3">
                Opt-in —{' '}
                <strong>
                  {consent.decided ? (consent.analytics ? 'ativado' : 'desativado') : 'pendente'}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">Gerenciar preferências</h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        Você pode rever sua escolha a qualquer momento — o banner aparece de novo e nada é ativado
        sem o seu "sim". Alternativas externas: navegador em modo privado, configurações de cookies
        do próprio navegador,{' '}
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noreferrer"
          className={focusClasses}
        >
          Configurações de anúncios do Google
        </a>
        ,{' '}
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
        . Para visitantes do Espaço Econômico Europeu/Reino Unido, a plataforma de consentimento
        certificada do Google (CMP) pode exibir seu próprio aviso.
      </p>
      <button
        type="button"
        onClick={reopenBanner}
        className={`mt-4 rounded-none border-2 border-flame bg-flame px-4 py-1.5 text-xs font-black uppercase tracking-wide text-ink transition hover:shadow-hard-sm active:shadow-none motion-reduce:transition-none ${focusRing}`}
      >
        Revisar preferências de cookies
      </button>
    </main>
  );
}
