'use strict';

require('dotenv').config();

const { buildApp } = require('./graphqlServer');
const { mountDocs } = require('./app');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

(async () => {
  try {
    const { app, server } = await buildApp();
    // Mount docs on the express app
    mountDocs(app);

    server.listen(PORT, HOST, () => {
      console.log(`HTTP/WS server running at http://${HOST}:${PORT}`);
      console.log(`GraphQL endpoint: http://${HOST}:${PORT}/graphql`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP/WS server');
      server.close(() => {
        console.log('HTTP/WS server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
