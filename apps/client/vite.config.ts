import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// Port fixe : il est inscrit dans SANCTUM_STATEFUL_DOMAINS et la liste CORS
// de l'API. Le changer ici sans changer le .env de l'API casse l'auth.
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 5174,
        strictPort: true,
    },
});
