# Frontend Deploy

This document describes how `ossi2.0-front` is deployed to production at `https://ossi2.esedu.fi`.

The frontend is released together with the backend by the `ossi-api` deploy script
([`deploy/deploy-on-server.sh`](https://github.com/esedu-tivi/ossi-api/blob/main/deploy/deploy-on-server.sh)).
With `DEPLOY_FRONTEND=1` the script pulls this repository's `main` branch on the server, builds it in a
Node container and publishes `dist/` to the Nginx web root. There is no CI-based frontend deploy:
the server is only reachable inside the VPN.

**Whatever is on `main` is what gets deployed.** Merge to `main` only when the change is ready for production.

## Production Topology

| Item | Value |
|---|---|
| Domain | `https://ossi2.esedu.fi` |
| Server layout | `/srv/ossi2/ossi-api`, `/srv/ossi2/ossi2.0-front`, `/srv/ossi2/.deploy.env` |
| Deploy user | `ossi2` (system user, no login shell, member of `docker`, no sudo) |
| Frontend publish path | `/var/www/ossi2.esedu.fi/html` (owned by `ossi2`) |
| Previous release (rollback) | `/var/www/ossi2.esedu.fi/html.prev` |
| Backend GraphQL upstream | `http://127.0.0.1:3000/graphql` |
| Nginx config | [`ossi-api/deploy/nginx/ossi2.esedu.fi.conf`](https://github.com/esedu-tivi/ossi-api/blob/main/deploy/nginx/ossi2.esedu.fi.conf) |

## Release

1. Merge the changes to `main` in this repository.
2. On the server, update `ossi-api` and run the deploy as the `ossi2` user:

```bash
sudo -u ossi2 git -C /srv/ossi2/ossi-api pull --ff-only
sudo -u ossi2 sh -c 'cd /srv/ossi2/ossi-api && DEPLOY_FRONTEND=1 ./deploy/run-from-parent.sh'
```

`sudo -iu ossi2` does not work because the account has no login shell; use `sudo -u ossi2 sh -c '...'` as above.

The script also redeploys the backend (pulls the GHCR images, runs migrations, restarts services).
For the frontend it:

1. Refuses to continue if `/srv/ossi2/ossi2.0-front` has local changes to tracked files.
2. Fetches and fast-forwards `main` (`git merge --ff-only`, nothing is force-reset).
3. Builds with `npm ci && npm run build` inside `node:24-alpine` (no Node is needed on the host).
4. Copies the current web root to `html.prev`, then replaces the web root with the new `dist/`.

A successful run ends with:

```
Frontend <commit> published (previous release: /var/www/ossi2.esedu.fi/html.prev)
Deploy completed for tag: staging
```

### Options

Set these as environment variables in front of the command (or in `/srv/ossi2/.deploy.env`):

| Variable | Default | Purpose |
|---|---|---|
| `DEPLOY_FRONTEND` | `0` | `1` builds and publishes the frontend |
| `FRONT_BRANCH` | `main` | Branch to deploy |
| `FRONT_DIR` | `/srv/ossi2/ossi2.0-front` | Frontend checkout on the server |
| `FRONT_PUBLISH_DIR` | `/var/www/ossi2.esedu.fi/html` | Nginx web root |
| `FRONT_NODE_IMAGE` | `docker.io/node:24-alpine` | Build image |
| `APPLY_NGINX_CONF` | `0` | `1` installs the Nginx config from `ossi-api` and reloads Nginx (needs sudo, so run it as an admin user, not `ossi2`) |

## Production Settings

Vite bakes `VITE_*` variables into the bundle at build time. They are read from
`/srv/ossi2/ossi2.0-front/.env.production` (git-ignored, so it survives `git pull`):

```
VITE_GRAPHQL_URL=/graphql
VITE_REDIRECT_URI=https://ossi2.esedu.fi/
VITE_POST_LOGOUT_REDIRECT_URI=https://ossi2.esedu.fi/
VITE_CLIENT_ID=<same as MS_CLIENT_ID in /srv/ossi2/ossi-api/.env>
VITE_TENANT_ID=<same as MS_TENANT_ID in /srv/ossi2/ossi-api/.env>
```

- `VITE_GRAPHQL_URL=/graphql` keeps browser requests on the same origin so Nginx can proxy them to `ossi-api`.
- The redirect URIs must match the Microsoft Entra app registration exactly, including the trailing slash.
- After changing any value, run the deploy again; editing the file alone changes nothing.

## First-Time Server Setup

Only needed on a new server (already done on `ossi2.esedu.fi`):

```bash
# Frontend checkout (the repository is public)
sudo -u ossi2 git clone https://github.com/esedu-tivi/ossi2.0-front.git /srv/ossi2/ossi2.0-front
sudo -u ossi2 nano /srv/ossi2/ossi2.0-front/.env.production   # see Production Settings

# Let the deploy user write the web root (it has no sudo)
sudo mkdir -p /var/www/ossi2.esedu.fi/html
sudo chown -R ossi2:ossi2 /var/www/ossi2.esedu.fi
```

`ossi2` must also be in the `docker` group. Its home directory `/srv/ossi2` holds the GHCR login (`.docker/config.json`).

## Nginx Expectations

Production Nginx must provide:

- SPA fallback with `try_files $uri $uri/ /index.html`
- GraphQL proxy on `/graphql`
- HTTPS termination for `ossi2.esedu.fi`

Nginx does not need a reload after a frontend release; it serves the new files immediately.

## Smoke Test

After deploy, verify:

1. `https://ossi2.esedu.fi/` opens the app (hard-reload with Ctrl/Cmd+Shift+R if you see the old version).
2. Reloading a deep route does not return 404.
3. Browser GraphQL requests go to `/graphql` and succeed.
4. Login and logout redirect back to `https://ossi2.esedu.fi/`.

## Rollback

Restore the previous release (kept from the last deploy only):

```bash
sudo -u ossi2 sh -c 'rm -rf /var/www/ossi2.esedu.fi/html && mv /var/www/ossi2.esedu.fi/html.prev /var/www/ossi2.esedu.fi/html'
```

To roll back further, revert the change on `main` and deploy again.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `detected dubious ownership in repository` | Git was run as `it-admin`; run it as `ossi2` (`sudo -u ossi2 git ...`). |
| `This account is currently not available.` | `sudo -iu ossi2` was used; use `sudo -u ossi2 sh -c '...'`. |
| `Frontend checkout has local changes, refusing to deploy` | Someone edited files in `/srv/ossi2/ossi2.0-front`. Inspect with `git diff`, then discard or move the change to a PR. |
| `Missing .../.env.production` | Create it, see Production Settings. |
| `npm ci` fails: lock file not in sync | `package-lock.json` on `main` does not match `package.json`. Run `npm install` locally, commit the lock file, merge to `main`. |
| Permission denied while publishing | The web root is not owned by `ossi2`; see First-Time Server Setup. |
