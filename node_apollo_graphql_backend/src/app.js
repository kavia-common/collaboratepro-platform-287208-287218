'use strict';

/**
 * This file previously assembled express app directly.
 * The GraphQL + REST server is now initialized in graphqlServer.js to host both HTTP and WS on the same port.
 * This module exports a function to mount API docs (swagger) on a provided app instance.
 */

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

function mountDocs(app) {
  app.use('/docs', swaggerUi.serve, (req, res, next) => {
    const host = req.get('host');
    let protocol = req.protocol;
    const actualPort = req.socket.localPort;
    const hasPort = host.includes(':');
    const needsPort =
      !hasPort &&
      ((protocol === 'http' && actualPort !== 80) ||
        (protocol === 'https' && actualPort !== 443));
    const fullHost = needsPort ? `${host}:${actualPort}` : host;
    protocol = req.secure ? 'https' : protocol;

    const dynamicSpec = {
      ...swaggerSpec,
      servers: [
        {
          url: `${protocol}://${fullHost}`,
        },
      ],
    };
    swaggerUi.setup(dynamicSpec)(req, res, next);
  });
}

module.exports = { mountDocs };
