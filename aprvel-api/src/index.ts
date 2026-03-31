import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';

// Import Routes
import auth from './routes/auth';
import orders from './routes/orders';
import orderLines from './routes/order-lines';
import metrics from './routes/metrics';
import notifications from './routes/notifications';

const app = new Hono();

// CONFIGURATION FOR HTTP & HTTPS
// Determine Environment
// You can use process.env.NODE_ENV or a custom env var like BUN_ENV / APP_ENV
const isProduction = process.env.NODE_ENV === 'production';

app.use(
  '/*',
  cors({
    origin: (origin) => origin, // Allow all origins for mobile dev ease, or specify array
    credentials: true,
  }),
);

app.use(logger());

// Mount Routes
app.route('/api', auth);
app.route('/api/orders', orders);
app.route('/api/order-lines', orderLines);
app.route('/api/metrics', metrics);
app.route('/api/notifications', notifications);

const tryServe = (port: number) => {
  const server = serve({ fetch: app.fetch, port }, (info) =>
    console.log(`Server running on http://localhost:${info.port}`),
  );
  server.on('error', (e: any) =>
    e.code === 'EADDRINUSE' ? tryServe(port + 1) : console.error(e),
  );
};

tryServe(3000);
