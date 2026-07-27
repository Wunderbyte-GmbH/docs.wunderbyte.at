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

## Updating the plugin documentation

The pages under `docs/mod_booking/` and `docs/mod_datalynx/` are imported from the plugin
repositories (`moodle-mod_booking@main` and `moodle-mod_datalynx@develop`):

```bash
npm run sync:docs
```

The script clones both repositories, copies their `docs/` trees into place, and adapts them for
the site (GitHub-only back links removed, missing screenshot references dropped, Moodle URLs
turned into code spans, relative links rewritten, Datalynx sidebar positions added). Use
`BOOKING_SRC=/path/to/checkout` and `DATALYNX_SRC=/path/to/checkout` to sync from local clones.

Curated pages that only exist here (`index.mdx` overviews, `examples/`, `developer-guides/ARCHITECTURE.md`,
`certificates_de.md`) are never overwritten; the script lists them after each run so stale imports
can be reviewed.

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
