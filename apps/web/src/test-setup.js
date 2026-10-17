// Setup global dos testes do web (jsdom).
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
