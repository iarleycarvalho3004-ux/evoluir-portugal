import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json';

const buildTime = new Date().toISOString();

/** Publica version.json junto do app; o app compara com a versão que está rodando. */
function versaoJson(): Plugin {
  return {
    name: 'evoluir-version-json',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version: pkg.version, buildTime }),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), versaoJson()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  test: {
    environment: 'jsdom',
  },
});
