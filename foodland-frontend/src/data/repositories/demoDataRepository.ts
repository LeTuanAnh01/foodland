/**
 * Boundary between the current synchronous, browser-local demo storage and UI.
 * Domain commands never read/write storage directly.
 * The future API implementation will use async requests and loading/error state;
 * do not swap it in as if network requests were synchronous.
 */
import type { DB } from '@/data/types';
import { loadDemoData, saveDemoData } from './localStorageRepository';

export interface DemoDataRepository {
  load(): DB;
  save(db: DB): void;
}

export const browserDemoDataRepository: DemoDataRepository = {
  load: loadDemoData,
  save: saveDemoData,
};

/** Isolated in-memory repository for deterministic tests. */
export function createMemoryDataRepository(seed: DB): DemoDataRepository {
  let current = structuredClone(seed);
  return {
    load: () => structuredClone(current),
    save: (db) => { current = structuredClone(db); },
  };
}
