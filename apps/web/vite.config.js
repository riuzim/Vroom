/// <reference types="vitest" />
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

// Content-Security-Policy injetada APENAS no build de produção:
// o index.html de dev fica livre para HMR/react-refresh.
// - script-src: só código próprio + o script oficial do Google Identity Services
// - frame-src: o botão do Google renderiza um iframe de accounts.google.com
// - img-src: imagens de carros vêm da própria API (BLOB no banco) — 'self'
//   cobre dev (proxy) e produção; sem hosts externos de imagem.
// - connect-src: própria origem + API (quando remota) + validação do Google
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' https://accounts.google.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  `connect-src 'self' https://accounts.google.com${apiOrigin ? ` ${apiOrigin}` : ''}`,
  'frame-src https://accounts.google.com',
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

export default defineConfig({
  base: '/Vroom/',
  plugins: [react(), prodCsp()],
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
