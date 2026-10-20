import { drizzle } from 'drizzle-orm/netlify-db';
import * as schema from './schema';

// Resolve the managed connection inside the request, after Netlify runtime setup.
export function getDb() {
  return drizzle({ schema });
}
