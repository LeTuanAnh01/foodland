import * as React from 'react';
import { browserDemoDataRepository } from '@/data/repositories/demoDataRepository';
import * as commands from '@/data/services/foodlandCommands';
import type { WorkflowResult } from '@/features/documents/utils/documentWorkflow';
import type { ConfirmationOutcome } from '@/features/inventory/utils/stockConfirmation';
import type {
  DB,
  Product,
  Stock,
  Partner,
  BusinessDoc,
  Invoice,
  StockMovementV2,
  StockCheck,
} from '@/data/types';

// Keep public imports compatible with v0.7; no feature changes required.
export { subtotal } from '@/data/services/foodlandCommands';
export type {
  Product,
  Stock,
  Partner,
  BusinessDoc,
  Invoice,
  DocKind,
  Line,
  DB,
  StockMovement,
  StockMovementKind,
  StockMovementLine,
  StockMovementV2,
  StockCheck,
} from '@/data/types';

type Context = {
  db: DB;
  saveProduct: (product: Product, previousId?: string) => void;
  saveStock: (item: Stock) => void;
  savePartner: (partner: Partner) => void;
  saveDoc: (doc: BusinessDoc, previousId?: string) => WorkflowResult;
  deleteDoc: (id: string) => WorkflowResult;
  confirmDoc: (id: string) => WorkflowResult;
  saveInvoice: (invoice: Invoice) => WorkflowResult;
  confirmInvoice: (id: string) => WorkflowResult;
  saveStockMovement: (movement: StockMovementV2) => WorkflowResult;
  deleteStockMovement: (id: string) => void;
  confirmStockMovement: (id: string) => ConfirmationOutcome;
  saveStockCheck: (check: StockCheck) => void;
  reset: () => void;
};

const Store = React.createContext<Context | null>(null);

export function FoodlandProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = React.useState<DB>(() => browserDemoDataRepository.load());
  const dbRef = React.useRef(db);

  // All mutations operate on the latest state, even when React batches events.
  // Validation and business rules live in pure services, not in React.
  const commit = React.useCallback((change: (current: DB) => DB) => {
    const next = change(dbRef.current);
    if (next === dbRef.current) return;
    dbRef.current = next;
    setDb(next);
  }, []);

  const execute = React.useCallback(
    <T,>(change: (current: DB) => { db: DB; result: T }): T => {
      const outcome = change(dbRef.current);
      if (outcome.db !== dbRef.current) {
        dbRef.current = outcome.db;
        setDb(outcome.db);
      }
      return outcome.result;
    },
    [],
  );

  React.useEffect(() => {
    browserDemoDataRepository.save(db);
  }, [db]);

  const value = React.useMemo<Context>(
    () => ({
      db,
      saveProduct: (product, previousId) =>
        commit((current) => commands.saveProduct(current, product, previousId)),
      saveStock: (stock) => commit((current) => commands.saveStock(current, stock)),
      savePartner: (partner) => commit((current) => commands.savePartner(current, partner)),
      saveDoc: (doc, previousId) => execute((current) => commands.saveDocument(current, doc, previousId)),
      deleteDoc: (id) => execute((current) => commands.deleteDocument(current, id)),
      confirmDoc: (id) => execute((current) => commands.confirmDocument(current, id)),
      saveInvoice: (invoice) => execute((current) => commands.saveInvoice(current, invoice)),
      confirmInvoice: (id) => execute((current) => commands.confirmInvoice(current, id)),
      saveStockMovement: (movement) => execute((current) => commands.saveStockMovement(current, movement)),
      deleteStockMovement: (id) => commit((current) => commands.deleteStockMovement(current, id)),
      confirmStockMovement: (id) => execute((current) => commands.confirmStockMovement(current, id)),
      saveStockCheck: (check) => commit((current) => commands.saveStockCheck(current, check)),
      reset: () => commit(() => commands.resetData()),
    }),
    [db, commit, execute],
  );

  return <Store.Provider value={value}>{children}</Store.Provider>;
}

export function useFoodland() {
  const context = React.useContext(Store);
  if (!context) throw Error('FoodlandProvider missing');
  return context;
}
