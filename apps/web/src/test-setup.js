// Setup global dos testes do web (jsdom).
import i18n from '@/i18n';

// Testes rodam sempre em pt-BR, independentemente do idioma do navegador.
i18n.changeLanguage('pt-BR');

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    };
  };
