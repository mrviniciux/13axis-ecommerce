import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const configuredUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!configuredUrl) {
  console.error(
    '[prisma] Configure DATABASE_URL (or POSTGRES_PRISMA_DATABASE_URL) before running Prisma.'
  );
  process.exit(1);
}

if (!/^postgres(?:ql)?:\/\//i.test(configuredUrl)) {
  console.error(
    '[prisma] DATABASE_URL must be a PostgreSQL connection string.'
  );
  process.exit(1);
}

const prismaCli = require.resolve('prisma/build/index.js');
const result = spawnSync(
  process.execPath,
  [prismaCli, ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: configuredUrl },
  }
);

process.exit(result.status ?? 1);
