import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // /api/v1/* -> BACKEND_BASE_URL/* (e.g. http://localhost:3000/v1/*)
  const backend = env.BACKEND_BASE_URL;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api/v1': {
          target: backend,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/v1/, ''),
        },
      },
    },
    css: {
      // lets `.st-med` in a module be read as styles.stMed
      modules: { localsConvention: 'camelCaseOnly' },
    },
  };
});
