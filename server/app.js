import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = fastify({ logger: true });

// CORS Configuration
app.register(fastifyCors, {
  origin: [
    'http://localhost:3000',
    'https://your-production-domain.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
});

// JWT Authentication
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'your-strong-secret-key',
  sign: { expiresIn: '1h' }
});

// Proxy Endpoint
app.get('/proxy/aitopia', async (request, reply) => {
  try {
    const response = await fetch('https://extensions.aitopia.ai/ai/prompts', {
      headers: {
        'Accept': 'application/json',
        'Authorization': request.headers.authorization || ''
      }
    });
    
    if (!response.ok) throw new Error('Proxy request failed');
    
    const data = await response.json();
    reply.send(data);
  } catch (error) {
    app.log.error(error);
    reply.code(502).send({ error: 'Bad Gateway' });
  }
});

// Static files (optional)
app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/client/public/',
});

// Health check
app.get('/health', async () => ({ status: 'ok' }));

// Start server
const start = async () => {
  try {
    await app.listen({
      port: process.env.PORT || 3001,
      host: '0.0.0.0'
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3001; // Change default to 5000 or another port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

start();
