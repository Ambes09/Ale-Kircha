import { buildApp } from './app.js';
import { env } from './config/env.js';
const start = async () => {
    const app = await buildApp();
    try {
        await app.listen({ port: env.PORT, host: '0.0.0.0' });
        app.log.info(`🚀 API listening on http://localhost:${env.PORT}`);
        app.log.info(`📊 Health check: http://localhost:${env.PORT}/health`);
        app.log.info(`📚 API base: http://localhost:${env.PORT}/api/v1`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
