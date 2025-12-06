# Apollo GraphQL & WebSocket Setup Notes

- GraphQL endpoint is served at `/graphql` for both HTTP and WebSocket (subscriptions) using `graphql-ws`.
- The Node process listens on a single port (default 3001). Ensure your reverse proxy forwards:
  - HTTP requests to `/graphql` and other REST routes.
  - WebSocket upgrade requests to `/graphql` as well.

Reverse proxy considerations:
- Use `ws` or `wss` depending on your TLS termination. If TLS is terminated at proxy use `ws` from proxy to upstream.
- Ensure `Upgrade: websocket` and `Connection: Upgrade` headers are set/preserved.
- When using a proxy/load balancer, forward `X-Forwarded-*` headers and set `app.set('trust proxy', true)` (already set).
- CORS: configure `CORS_ORIGIN` env (defaults to http://localhost:3000).

Auth:
- For HTTP requests, include `Authorization: Bearer <token>`.
- For WebSocket connections (graphql-ws), include `connectionParams: { Authorization: 'Bearer <token>' }`.
- Server parses the JWT and sets `context.user` consistently in both HTTP and WS.

RBAC & tenancy:
- All resolvers enforce tenant scoping via `context.user.companyId`.
- PubSub is in-memory; use for development only.
