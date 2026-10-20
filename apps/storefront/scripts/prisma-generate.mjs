import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const explicit = process.env.DATABASE_PROVIDER?.trim().toLowerCase();
const usePostgres =
  explicit === 'postgres' ||
  explicit === 'postgresql' ||
  (!explicit && Boolean(process.env.NETLIFY_DB_URL));

const schema = usePostgres
  ? 'prisma/schema.prisma'
  : 'prisma/mysql/schema.prisma';

console.log(
  `[prisma] generating ${usePostgres ? 'PostgreSQL' : 'MySQL'} client from ${schema}`
);

const prismaCli = require.resolve('prisma/build/index.js');
const result = spawnSync(
  process.execPath,
  [prismaCli, 'generate', '--schema', schema],
  { stdio: 'inherit', env: process.env }
);

process.exit(result.status ?? 1);
