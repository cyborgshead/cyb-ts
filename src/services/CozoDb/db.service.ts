import { wrap, proxy } from 'comlink';
import DbWorker from 'worker-loader!./db.worker';
import { DbWorkerApi } from './db.worker';

const worker = new DbWorker();

async function waitUntiCondition(cond: () => boolean, timeoutDuration = 60000) {
  if (cond()) {
    return true;
  }

  const waitPromise = new Promise((resolve) => {
    const interval = setInterval(() => {
      if (cond()) {
        clearInterval(interval);
        resolve(true);
      }
    }, 10);
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('waitUntiCondition timed out!'));
    }, timeoutDuration);
  });

  return Promise.race([waitPromise, timeoutPromise]);
}

function dbService() {
  const dbServiceProxy = wrap<DbWorkerApi>(worker);
  let isInitialized = false;
  let writesCount = 0;

  const init = async () => {
    await dbServiceProxy.init();
    isInitialized = true;

    // Sync writesCount, main thread <- worker
    worker.onmessage = (event: any) => {
      const { type, value } = event.data;
      if (type === 'writesCountUpdate') {
        writesCount = value;
      }
    };
  };

  const runCommand = async (command: string) =>
    dbServiceProxy.runCommand(command);

  const executeGetCommand = async (
    tableName: string,
    conditionArr?: string[],
    keys?: string[]
  ) => dbServiceProxy.executeGetCommand(tableName, conditionArr, keys);

  const executePutCommand = async (tableName: string, array: any[][]) => {
    await waitUntiCondition(() => isInitialized);
    return dbServiceProxy.executePutCommand(tableName, array);
  };

  const executeBatchPutCommand = async (
    tableName: string,
    array: any[],
    batchSize: number,
    onProgress?: (count: number) => void
  ) => {
    await waitUntiCondition(() => isInitialized);

    return dbServiceProxy.executeBatchPutCommand(
      tableName,
      array,
      batchSize,
      onProgress ? proxy(onProgress) : undefined
    );
  };
  const importRelations = async (content: string) =>
    dbServiceProxy.importRelations(content);

  const exportRelations = async (relations: string[]) =>
    dbServiceProxy.exportRelations(relations);

  const importTransactions = async (address: string, cyberIndexHttps: string) =>
    dbServiceProxy.importTransactions(address, cyberIndexHttps);

  return {
    init,
    executePutCommand,
    executeBatchPutCommand,
    runCommand,
    executeGetCommand,
    importRelations,
    exportRelations,
    importTransactions,
  };
}

export default dbService();
