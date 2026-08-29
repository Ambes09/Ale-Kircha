import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/server.ts'),
      formats: ['es'],
      fileName: 'server',
    },
    outDir: 'dist',
    rollupOptions: {
      external: [
        '@prisma/client',
        'prisma',
        'fastify',
        '@fastify/cors',
        '@fastify/helmet',
        '@fastify/rate-limit',
        '@fastify/multipart',
        'jose',
        'bcryptjs',
        'pino',
        'zod',
        'dotenv',
        'uuid'
      ],
      output: {
        preserveModules: true,
      },
    },
    target: 'node20',
    minify: false,
  },
});
