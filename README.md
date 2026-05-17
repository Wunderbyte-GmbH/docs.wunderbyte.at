# docs.wunderbyte.at

This repository contains the Docusaurus source for `docs.wunderbyte.at`, the Wunderbyte documentation site for Moodle plugins and related projects.

## Local development

```bash
npm ci
npm run start
```

## Validation

```bash
npm run build
npm run typecheck
```

## Deployment

Local deployment uploads the generated `build/` output to `dedi458.your-server.de` over SFTP:

```bash
npm run build
npm run deploy:sftp
```

The deploy script uses:

- `~/.sftp` line 2 for the password during local runs
- `SFTP_PASSWORD` in CI

Optional environment variables:

- `SFTP_HOST` (default: `dedi458.your-server.de`)
- `SFTP_PORT` (default: `22`)
- `SFTP_USER` (default: `wunder_4`)
- `SFTP_REMOTE_DIR` (default: `/`)

## GitHub Actions

- `.github/workflows/ci.yml` runs the build
- `.github/workflows/deploy.yml` deploys on pushes to `main` and on manual dispatch

To enable automated deployment in GitHub Actions, add the repository secret `WUNDERBYTE_SFTP_PASSWORD`.
