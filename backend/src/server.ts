import { createApp } from './app';
import { env } from './config/env';

const app = createApp();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : env.PORT;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`grocery-list-app-api listening on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Firestore Collection: ${env.FIRESTORE_COLLECTION}`);
  console.log(`GCP Project ID: ${env.GCP_PROJECT_ID}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing HTTP server gracefully');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
