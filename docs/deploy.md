# Frontend Deploy

This document describes how `ossi2.0-front` is deployed for production at `https://ossi2.esedu.fi`.

## Production Topology

- Frontend domain: `https://ossi2.esedu.fi`
- Frontend publish path: `/var/www/ossi2.esedu.fi/html`
- Backend GraphQL upstream: `http://127.0.0.1:3000/graphql`
- Nginx config: `/Users/purot/ossi/ossi-api/deploy/nginx/ossi2.esedu.fi.conf`

The frontend should use `VITE_GRAPHQL_URL=/graphql` in production so browser requests stay on the same origin and Nginx can proxy them to `ossi-api`.

## Release Steps

1. Build the frontend:

```bash
npm ci
npm run build
```

2. Copy the built files from `dist/` to:

```bash
/var/www/ossi2.esedu.fi/html
```

3. Verify the Nginx config points `location /` to the same publish path and proxies `/graphql` to `127.0.0.1:3000/graphql`.

4. Validate and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Required Production Settings

- `VITE_REDIRECT_URI` must point to `https://ossi2.esedu.fi/`
- `VITE_POST_LOGOUT_REDIRECT_URI` must point to `https://ossi2.esedu.fi/`
- `VITE_GRAPHQL_URL` should be `/graphql`

## Nginx Expectations

Production Nginx must provide:

- SPA fallback with `try_files $uri $uri/ /index.html`
- GraphQL proxy on `/graphql`
- HTTPS termination for `ossi2.esedu.fi`

## Smoke Test

After deploy, verify:

1. `https://ossi2.esedu.fi/` opens the app.
2. Reloading a deep route does not return 404.
3. Browser GraphQL requests go to `/graphql`.
4. Login and logout redirect back to `https://ossi2.esedu.fi/`.

## Rollback

If the release fails:

1. Restore the previous frontend files under `/var/www/ossi2.esedu.fi/html`
2. Re-run:

```bash
sudo nginx -t
sudo systemctl reload nginx
```
