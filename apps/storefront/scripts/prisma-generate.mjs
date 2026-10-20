import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const configuredUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_DATABASE_URL ??
  process.env.POSTGRES_URL;

if (configuredUrl && !/^postgres(?:ql)?:\/\//i.test(configuredUrl)) {
  console.error(
    '[prisma] DATABASE_URL must be a PostgreSQL connection string.'
  );
  process.exit(1);
}

const schema = 'prisma/schema.prisma';
console.log(`[prisma] generating PostgreSQL client from ${schema}`);

const prismaCli = require.resolve('prisma/build/index.js');
const result = spawnSync(
  process.execPath,
  [prismaCli, 'generate', '--schema', schema],
  {
    stdio: 'inherit',
    env: configuredUrl
      ? { ...process.env, DATABASE_URL: configuredUrl }
      : process.env,
  }
);

process.exit(result.status ?? 1);
