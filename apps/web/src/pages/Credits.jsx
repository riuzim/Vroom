import { usePageMeta } from '@/hooks/usePageMeta';
import carCredits from '@/data/car-credits.json';

export const CREDITS_UPDATED_AT = '18 de outubro de 2026';

const focusClasses =
  'text-flame underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export default function Credits() {
  usePageMeta({
    title: 'Créditos e Licenças — Vroom',
    description:
      'Atribuição das fotos de carros usadas no Vroom: autores e licenças (Creative Commons/domínio público) com link para cada arquivo no Wikimedia Commons.',
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl uppercase tracking-[0.22em]">Créditos e Licenças</h1>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-bone/50">
        Última atualização: {CREDITS_UPDATED_AT}
      </p>

      <p className="mt-6 text-sm leading-relaxed text-bone/80">
        Todas as fotos dos carros do Vroom vêm do{' '}
        <a
          href="https://commons.wikimedia.org"
          target="_blank"
          rel="noreferrer"
          className={focusClasses}
        >
          Wikimedia Commons
        </a>
        . As licenças Creative Commons Atribuição (CC BY) e
        Atribuição-CompartilhaIgual (CC BY-SA) exigem crédito ao autor — esta
        página presta essa atribuição, com o link para cada arquivo original.
        Marcas, nomes e designs de veículos pertencem aos respectivos
        fabricantes; o Vroom é um projeto de fã, sem afiliação.
      </p>

      <div className="mt-6 border-2 border-line">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-line bg-raised font-mono text-xs uppercase tracking-wide text-bone/60">
              <th className="p-3">Carro</th>
              <th className="p-3">Autor</th>
              <th className="p-3">Licença</th>
              <th className="p-3">Fonte</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-line text-bone/80">
            {carCredits.map((credit) => (
              <tr key={credit.filePageUrl}>
                <td className="p-3 font-bold">{credit.name}</td>
                <td className="p-3">{credit.author}</td>
                <td className="p-3">
                  <a
                    href={credit.licenseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={focusClasses}
                  >
                    {credit.license}
                  </a>
                </td>
                <td className="p-3">
                  <a
                    href={credit.filePageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={focusClasses}
                  >
                    Ver no Commons
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
