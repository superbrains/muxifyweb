/**
 * Asserts that the admin console and the fan/artist app are actually separated
 * in the built output, not merely code-split.
 *
 * The two apps are deployed as different origins (app./admin.getmuxify.com) so
 * that no admin route string, nav label or service client is reachable from the
 * creator origin. That boundary is easy to break by accident — one shared
 * component importing from `features/admin` pulls the whole surface back in, and
 * nothing else fails when it happens. So it is checked here.
 *
 * A lazy chunk does NOT count as absent: anyone can fetch a chunk URL directly.
 * The strings must not appear in the creator output at all.
 *
 * Usage:  npm run build && npm run build:admin && npm run verify:split
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CREATOR_DIR = 'dist/assets';
const ADMIN_DIR = 'dist-admin/assets';

// Distinctive admin markers: route paths, nav labels and the permissions client.
const ADMIN_MARKERS = [
    '/admin/advertising/creative-review',
    '/admin/users/ad-managers',
    '/admin/governance/audit-trail',
    '/admin/me/permissions',
    '/admin/finance',
    'Staff Assignment',
    'Risk & Compliance',
    'permissionCatalog',
];

// Creator-only routes, to catch the mirror-image mistake.
const CREATOR_MARKERS = ['/upload/album/new', '/label/withdrawal-requests'];

const readJs = (dir) => {
    if (!existsSync(dir)) {
        console.error(`✗ ${dir} does not exist — run the corresponding build first.`);
        process.exit(1);
    }
    return readdirSync(dir)
        .filter((f) => f.endsWith('.js'))
        .map((f) => ({ name: f, text: readFileSync(join(dir, f), 'utf8') }));
};

const creator = readJs(CREATOR_DIR);
const admin = readJs(ADMIN_DIR);
let failed = false;

const mustBeAbsent = (files, markers, label) => {
    for (const marker of markers) {
        const hits = files.filter((f) => f.text.includes(marker)).map((f) => f.name);
        if (hits.length) {
            failed = true;
            console.error(`✗ ${label}: "${marker}" found in ${hits.join(', ')}`);
        } else {
            console.log(`✓ ${label}: "${marker}" absent`);
        }
    }
};

const mustBePresent = (files, markers, label) => {
    for (const marker of markers) {
        if (files.some((f) => f.text.includes(marker))) {
            console.log(`✓ ${label}: "${marker}" present`);
        } else {
            failed = true;
            console.error(`✗ ${label}: "${marker}" missing — the admin build may be broken`);
        }
    }
};

console.log(`creator bundle: ${creator.length} JS chunks`);
console.log(`admin bundle:   ${admin.length} JS chunks\n`);

mustBeAbsent(creator, ADMIN_MARKERS, 'creator bundle');
console.log('');
mustBeAbsent(admin, CREATOR_MARKERS, 'admin bundle');
console.log('');
mustBePresent(admin, ADMIN_MARKERS.slice(0, 5), 'admin bundle');

console.log('');
if (failed) {
    console.error('BUNDLE SPLIT VIOLATED — admin and creator code are leaking across origins.');
    process.exit(1);
}
console.log('Bundle split verified.');
