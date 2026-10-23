/// <reference types="vitest" />
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Origem pública da API em produção (ex.: https://api.vroom.example).
// Vazia em dev — o proxy do Vite cuida do /api.
const apiOrigin = process.env.VITE_API_URL
  ? new URL(process.env.VITE_API_URL).origin
  : '';

// Base pública do build. Default '/Vroom/' mantém o deploy atual no GitHub
// Pages; em servidor com domínio próprio defina VITE_BASE="/".
const base = process.env.VITE_BASE || '/Vroom/';

// URL pública do site SEM barra final (ex.: https://vroom.example.com).
// Quando definida, o build gera robots.txt + sitemap.xml no dist.
const siteUrl = (process.env.VITE_SITE_URL || '').replace(/\/+$/, '');

// ID do AdSense no formato "ca-pub-0000000000000000" (AdSense → Contas →
// ID do editor). Quando definido: libera os domínios do AdSense na CSP e
// gera ads.txt no dist.
const adsenseClient = process.env.VITE_ADSENSE_CLIENT || '';

// Content-Security-Policy injetada APENAS no build de produção:
// o index.html de dev fica livre para HMR/react-refresh.
// - script-src: código próprio + Google Identity Services
//   (+ pagead2/tpc.googlesyndication.com quando AdSense ativo)
// - frame-src: botão do Google renderiza iframe de accounts.google.com
//   (+ doubleclick/tpc quando AdSense ativo)
// - img-src: imagens de carros vêm da própria API (BLOB no banco) — 'self'
//   cobre dev (proxy) e produção; sem hosts externos de imagem
// - connect-src: própria origem + API (quando remota) + validação do Google
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' https://accounts.google.com${
    adsenseClient
      ? ' https://pagead2.googlesyndication.com https://tpc.googlesyndication.com'
      : ''
  }`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' data: blob:${
    adsenseClient
      ? ' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google.com'
      : ''
  }`,
  `connect-src 'self' https://accounts.google.com${apiOrigin ? ` ${apiOrigin}` : ''}${
    adsenseClient
      ? ' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google.com'
      : ''
  }`,
  `frame-src https://accounts.google.com${
    adsenseClient
      ? ' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com'
      : ''
  }`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

// Plugin que insere a tag <meta http-equiv="Content-Security-Policy"> no
// index.html gerado. Meta tag é a única via no GitHub Pages (sem headers).
const prodCsp = () => ({
  name: 'vroom-prod-csp',
  apply: 'build',
  transformIndexHtml(html) {
    return html.replace(
      '</title>',
      `</title>\n    <meta http-equiv="Content-Security-Policy" content="${cspDirectives}">`,
    );
  },
});

// Rotas estáticas indexáveis — usadas para gerar o sitemap.xml do domínio
// próprio (rotas de jogo dinâmicas ficam de fora de propósito).
const SITEMAP_ROUTES = [
  '',
  '/leaderboard',
  '/login',
  '/register',
  '/privacidade',
  '/termos',
  '/cookies',
  '/creditos',
];

// Plugin que gera no dist, no fim do build:
//   - robots.txt  (quando VITE_SITE_URL definida)
//   - sitemap.xml (quando VITE_SITE_URL definida)
//   - ads.txt     (quando VITE_ADSENSE_CLIENT definido — linha DIRECT do Google)
// Nada é gerado sem as variáveis: arquivo com ID falso é pior que ausência.
const prodSeoFiles = () => ({
  name: 'vroom-prod-seo-files',
  apply: 'build',
  async closeBundle() {
    const distDir = path.resolve(dirname, 'dist');

    if (siteUrl) {
      const withBase = (route) => `${siteUrl}${base === '/' ? '' : base}${route}`;

      await writeFile(
        path.join(distDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${withBase('/sitemap.xml')}\n`,
        'utf8',
      );

      const today = new Date().toISOString().slice(0, 10);
      const entries = SITEMAP_ROUTES.map(
        (route) =>
          `  <url>\n    <loc>${withBase(route)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
      ).join('\n');
      await writeFile(
        path.join(distDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
        'utf8',
      );
    }

    if (adsenseClient) {
      // ads.txt aceita "ca-pub-..." ou "pub-...": normaliza para pub-.
      const publisherId = adsenseClient.replace(/^ca-/, '');
      await writeFile(
        path.join(distDir, 'ads.txt'),
        `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`,
        'utf8',
      );
    }
  },
});

export default defineConfig({
  base,
  plugins: [react(), prodCsp(), prodSeoFiles()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
  },
});
