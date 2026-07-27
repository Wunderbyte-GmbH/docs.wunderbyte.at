#!/usr/bin/env node
/**
 * Sync the documentation of the upstream Moodle plugins into `docs/`.
 *
 * Usage:
 *   node scripts/sync-upstream-docs.mjs            # clone upstream repos into a temp dir
 *   BOOKING_SRC=/path/to/moodle-mod_booking \
 *   DATALYNX_SRC=/path/to/moodle-mod_datalynx \
 *     node scripts/sync-upstream-docs.mjs          # use local checkouts instead
 *
 * The upstream READMEs and Markdown files are written for GitHub, so a few
 * transformations are applied while copying:
 *
 *  - the leading "Back to ..." navigation link is dropped (Docusaurus has a sidebar)
 *  - image references to screenshots that do not exist in the source tree are dropped
 *  - links to Moodle URLs such as `/mod/booking/view.php?id=<cmid>` become code spans,
 *    because they are not routes of this documentation site
 *  - relative links between Markdown files are rewritten to the paths used on this site
 *  - Datalynx pages get the `sidebar_position` front matter used by the site navigation
 *
 * Pages that only exist in this repository (curated `.mdx` overviews, `_category_.json`,
 * `ARCHITECTURE.md`, `certificates_de.md`, …) are never touched; they are reported at the
 * end so stale imports can be reviewed by hand.
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docsRoot = path.join(repoRoot, 'docs');

const UPSTREAM = {
  booking: {
    url: 'https://github.com/Wunderbyte-GmbH/moodle-mod_booking.git',
    branch: 'main',
    src: process.env.BOOKING_SRC,
  },
  datalynx: {
    url: 'https://github.com/Wunderbyte-GmbH/moodle-mod_datalynx.git',
    branch: 'develop',
    src: process.env.DATALYNX_SRC,
  },
};

/** Datalynx pages are ordered manually; the order follows the upstream README. */
const DATALYNX_ORDER = [
  'user_guide_getting_started.md',
  'user_guide_fields.md',
  'user_guide_field_formats.md',
  'user_guide_views.md',
  'user_guide_rules.md',
  'user_guide_managing_entries.md',
  'user_guide_permissions.md',
  'user_guide_patterns_and_styling.md',
];

function checkout(name) {
  const {url, branch, src} = UPSTREAM[name];
  if (src) {
    return src;
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `wb-${name}-`));
  process.stdout.write(`Cloning ${url} (${branch}) …\n`);
  execFileSync('git', ['clone', '--depth', '1', '--branch', branch, url, dir], {
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  return dir;
}

function listMarkdown(dir) {
  const out = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.md')) {
        out.push(path.relative(dir, full));
      }
    }
  };
  walk(dir);
  return out.sort();
}

function write(target, content) {
  fs.mkdirSync(path.dirname(target), {recursive: true});
  const previous = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
  if (previous === content) {
    return 'unchanged';
  }
  fs.writeFileSync(target, content);
  return previous === null ? 'added' : 'updated';
}

/** Drops the GitHub-only "Back to …" link at the top of a page. */
function stripBackLink(text) {
  return text.replace(/^\s*\[Back to [^\]]*\]\([^)]*\)\s*\n+/, '');
}

/** Drops image lines whose target does not exist in the upstream tree. */
function stripMissingImages(text, sourceFile) {
  return text
    .split('\n')
    .filter((line) => {
      const match = /^!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*$/.exec(line);
      if (!match) {
        return true;
      }
      const target = match[1];
      if (/^(https?:)?\/\//.test(target)) {
        return true;
      }
      return fs.existsSync(path.resolve(path.dirname(sourceFile), target));
    })
    .join('\n');
}

/**
 * Rewrites every inline link of a Markdown file.
 *
 * `resolveLink(target)` returns the replacement URL, `null` to keep the link as is,
 * or `{code: true}` to replace the whole link with a code span of its target.
 */
function rewriteLinks(text, resolveLink) {
  return text.replace(/\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g, (whole, label, target, title) => {
    const resolved = resolveLink(target);
    if (resolved === null || resolved === undefined) {
      return whole;
    }
    if (resolved.code) {
      return `\`${target}\``;
    }
    return `[${label}](${resolved}${title ?? ''})`;
  });
}

function splitAnchor(target) {
  const index = target.indexOf('#');
  return index === -1 ? [target, ''] : [target.slice(0, index), target.slice(index)];
}

function relativeLink(fromDocFile, toDocFile) {
  const rel = path.relative(path.dirname(fromDocFile), toDocFile);
  return rel.startsWith('.') ? rel : `./${rel}`;
}

// ---------------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------------

/**
 * Maps a path inside the upstream `docs/` tree to a file inside this repo's `docs/`.
 * Returns `null` when the upstream path has no counterpart here.
 */
function bookingTarget(upstreamRelPath) {
  const clean = upstreamRelPath.replace(/\/+$/, '');
  if (clean === 'README.md' || clean === '') {
    return 'mod_booking/index.mdx';
  }
  if (clean.startsWith('developer-guides/')) {
    return `mod_booking/${clean}`;
  }
  if (clean === 'user/examples' || clean.startsWith('user/examples/')) {
    return 'mod_booking/examples/index.mdx';
  }
  if (clean.startsWith('user/')) {
    return `mod_booking/${clean.slice('user/'.length)}`;
  }
  return null;
}

/** URL of a docs file on the site, used for links that cannot stay relative. */
function docUrl(docRelPath) {
  const withoutExt = docRelPath.replace(/\.(md|mdx)$/, '');
  const asRoute = withoutExt.replace(/\/(README|index)$/, '');
  return `/docs/${asRoute}`;
}

const bookingBlobUrl = `https://github.com/Wunderbyte-GmbH/moodle-mod_booking/blob/${UPSTREAM.booking.branch}`;

/**
 * Corrections for upstream content bugs, applied after the generic transformations.
 * Each entry is skipped silently once upstream fixes the issue.
 *
 * `CSV_IMPORT_USER_GUIDE.md` numbers two sections "16." and ends at "17.", while its
 * table of contents links to sections 16, 17, and 18 — which leaves dead anchors.
 */
const BOOKING_FIXUPS = {
  'user/CSV_IMPORT_USER_GUIDE.md': [
    ['See [Date formats](#15-date-formats)', 'See [Date formats](#16-date-formats)'],
    ['## 16. Tips and common mistakes', '## 17. Tips and common mistakes'],
    ['## 17. Example files', '## 18. Example files'],
  ],
};

function syncBooking(sourceRoot) {
  const upstreamDocs = path.join(sourceRoot, 'docs');
  const files = listMarkdown(upstreamDocs).filter((rel) => rel !== 'README.md');
  const written = [];
  const stats = {added: 0, updated: 0, unchanged: 0};

  for (const rel of files) {
    const targetRel = bookingTarget(rel);
    if (!targetRel) {
      continue;
    }
    const sourceFile = path.join(upstreamDocs, rel);
    let text = fs.readFileSync(sourceFile, 'utf8');
    text = stripBackLink(text);
    text = stripMissingImages(text, sourceFile);
    text = rewriteLinks(text, (target) => {
      if (/^(https?:|mailto:|#)/.test(target)) {
        return null;
      }
      // Moodle URLs such as /mod/booking/view.php?id=<cmid> are not routes of this site.
      if (target.startsWith('/')) {
        return {code: true};
      }
      const [file, anchor] = splitAnchor(target);
      if (!file) {
        return null;
      }
      const upstreamTarget = path
        .relative(upstreamDocs, path.resolve(path.dirname(sourceFile), file))
        .split(path.sep)
        .join('/');
      // Links into the plugin source tree (`../../classes/…`) only exist on GitHub.
      if (upstreamTarget.startsWith('..')) {
        const inRepo = path
          .relative(sourceRoot, path.resolve(path.dirname(sourceFile), file))
          .split(path.sep)
          .join('/');
        if (inRepo.startsWith('..')) {
          return null;
        }
        return `${bookingBlobUrl}/${inRepo}${anchor}`;
      }
      const targetDoc = bookingTarget(upstreamTarget);
      if (!targetDoc) {
        return null;
      }
      // Pages outside the current tree (the section index, the examples page) are
      // linked by route so the link keeps working regardless of nesting.
      if (targetDoc.endsWith('.mdx')) {
        return `${docUrl(targetDoc)}${anchor}`;
      }
      return `${relativeLink(targetRel, targetDoc)}${anchor}`;
    });
    for (const [from, to] of BOOKING_FIXUPS[rel] ?? []) {
      text = text.split(from).join(to);
    }
    if (!text.endsWith('\n')) {
      text += '\n';
    }
    stats[write(path.join(docsRoot, targetRel), text)] += 1;
    written.push(targetRel);
  }

  return {written, stats};
}

// ---------------------------------------------------------------------------
// Datalynx
// ---------------------------------------------------------------------------

function syncDatalynx(sourceRoot) {
  const upstreamDocs = path.join(sourceRoot, 'docs');
  const written = [];
  const stats = {added: 0, updated: 0, unchanged: 0};

  const emit = (rel, targetRel, frontmatter) => {
    const sourceFile = path.join(upstreamDocs, rel);
    let text = fs.readFileSync(sourceFile, 'utf8');
    text = stripBackLink(text);
    text = stripMissingImages(text, sourceFile);
    text = rewriteLinks(text, (target) => {
      if (/^(https?:|mailto:|#|\/)/.test(target)) {
        return target.startsWith('/') ? {code: true} : null;
      }
      const [file, anchor] = splitAnchor(target);
      if (file === 'README.md') {
        return `/docs/mod_datalynx${anchor}`;
      }
      return null;
    });
    const body = `---\n${frontmatter.join('\n')}\n---\n\n${text.replace(/^\n+/, '')}`;
    stats[write(path.join(docsRoot, targetRel), body.endsWith('\n') ? body : `${body}\n`)] += 1;
    written.push(targetRel);
  };

  emit('README.md', 'mod_datalynx/index.mdx', ['slug: /mod_datalynx', 'sidebar_position: 1']);

  const guides = listMarkdown(upstreamDocs).filter((rel) => rel !== 'README.md');
  const unknown = guides.filter((rel) => !DATALYNX_ORDER.includes(rel));
  if (unknown.length) {
    process.stdout.write(
      `Warning: no sidebar position defined for ${unknown.join(', ')} — appended at the end.\n`,
    );
  }
  const ordered = [...DATALYNX_ORDER.filter((rel) => guides.includes(rel)), ...unknown];
  ordered.forEach((rel, index) => {
    emit(rel, `mod_datalynx/${rel}`, [`sidebar_position: ${index + 2}`]);
  });

  return {written, stats};
}

// ---------------------------------------------------------------------------

function report(name, {written, stats}, managedDirs) {
  process.stdout.write(
    `${name}: ${stats.added} added, ${stats.updated} updated, ${stats.unchanged} unchanged\n`,
  );
  const managed = new Set(written);
  const local = [];
  for (const dir of managedDirs) {
    const full = path.join(docsRoot, dir);
    if (!fs.existsSync(full)) {
      continue;
    }
    for (const rel of listMarkdown(full)) {
      const docRel = path.join(dir, rel);
      if (!managed.has(docRel)) {
        local.push(docRel);
      }
    }
  }
  if (local.length) {
    process.stdout.write(
      `  local-only pages (kept, review manually):\n    ${local.join('\n    ')}\n`,
    );
  }
}

const bookingSrc = checkout('booking');
const datalynxSrc = checkout('datalynx');

report('booking ', syncBooking(bookingSrc), ['mod_booking']);
report('datalynx', syncDatalynx(datalynxSrc), ['mod_datalynx']);
