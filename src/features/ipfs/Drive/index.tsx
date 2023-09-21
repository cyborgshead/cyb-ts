import React, { useEffect, useState } from 'react';

import Table from 'src/components/Table/Table';

import { toListOfObjects } from 'src/services/CozoDb/utils';
import { saveAs } from 'file-saver';
import dbService from 'src/services/CozoDb/db.service';

import { useIpfs } from 'src/contexts/ipfs';
import { Pane, Text } from '@cybercongress/gravity';
import { Button as CybButton, Loading, Select } from 'src/components';
import FileInputButton from './FileInputButton';
import { useAppSelector } from 'src/redux/hooks';

import styles from './drive.scss';

import cozoPresets from './cozo_presets.json';

// TODO: refactor
import { useRobotContext } from 'src/pages/robot/robot.context';

import { useBackend } from 'src/contexts/backend';
import { SyncEntry, SyncProgress, SyncState } from 'src/services/backend/types';

const DEFAULT_PRESET_NAME = '💡 defaul commands...';

const presetsAsSelectOptions = [
  { text: DEFAULT_PRESET_NAME, value: '' },
  ...Object.entries(cozoPresets).map(([key, value]) => ({
    text: key,
    value: Array.isArray(value) ? value.join('\r\n') : value,
  })),
];

const diffMs = (t0: number, t1: number) => `${(t1 - t0).toFixed(1)}ms`;

function SyncEntryStatus({
  entry,
  status,
}: {
  entry: SyncEntry;
  status: SyncProgress;
}) {
  if (status.done) {
    return <div>{`☑️ ${entry} synchronized.`}</div>;
  }
  if (status.error) {
    return <div>{`❌ ${entry} syncronization failed - ${status.error}`}</div>;
  }
  return <div>{`⏳ ${entry}  ${status.progress} items syncronized...`}</div>;
}
function SyncInfo({ syncState }: { syncState: SyncState }) {
  console.log('----ssss', syncState);
  return (
    <div>
      <Loading />
      <div className={styles.logs}>
        <div>Sync DB in progress...</div>
        {Object.keys(syncState.entryStatus).map((name) => (
          <SyncEntryStatus
            key={`log_${name}`}
            entry={name}
            status={syncState.entryStatus[name]}
          />
        ))}
      </div>
    </div>
  );
}

function Drive() {
  const { node } = useIpfs();
  const [queryText, setQueryText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [queryResults, setQueryResults] = useState<{ rows: []; cols: [] }>();
  const { address: userAddress } = useRobotContext();
  const { startSyncTask } = useBackend();
  const { syncState } = useAppSelector((store) => store.backend);

  console.log('-----syncStatus', syncState);
  useEffect(() => {
    dbService.init().then(() => {
      setIsLoaded(true);
    });
  }, []);

  function runQuery(queryArg?: string) {
    const query = queryArg || queryText.trim();
    if (query) {
      setInProgress(true);
      setErrorMessage('');
      setStatusMessage('');
      setQueryResults(undefined);
      requestAnimationFrame(() => {
        setTimeout(async () => {
          try {
            const t0 = performance.now();
            const result = await dbService.runCommand(query);
            const t1 = performance.now();

            if (result.ok === true) {
              setStatusMessage(
                `finished with ${result.rows.length} rows in ${diffMs(t0, t1)}`
              );
              if (!result.headers) {
                result.headers =
                  result.rows[0].map((_, i) => i.toString()) || [];
              }
              const rows = toListOfObjects(result);
              const cols = result.headers.map((n) => ({
                // header: n,
                accessorKey: n,
                header: () => n,
                cell: (item) => {
                  const value = item.getValue();
                  if (['cid'].indexOf(n) > -1) {
                    return (
                      <a
                        href={`/ipfs/${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {`${value.slice(0, 10)}...${value.slice(-10)}`}
                      </a>
                    );
                  }

                  return value;
                },
              }));
              setQueryResults({ rows, cols });
            } else {
              console.error('Query failed', result);
              setStatusMessage(`finished with errors`);
              if (result.display) {
                setErrorMessage(result.display);
              }
            }
          } catch (e) {
            setStatusMessage(`query failed`);
            setErrorMessage(e.message);
          } finally {
            setInProgress(false);
          }
        }, 0);
      });
    }
  }

  const importIpfs = async () => startSyncTask!();

  const exportReations = async () => {
    // TODO: refactor
    const result = await dbService.exportRelations(['pin', 'particle', 'link']);
    console.log('---export data', result);
    if (result.ok) {
      const blob = new Blob([JSON.stringify(result.data)], {
        type: 'text/plain;charset=utf-8',
      });
      saveAs(blob, 'export.json');
    } else {
      console.log('CozoDb: Failed to import', result);
    }
  };

  const importReations = async (file: any) => {
    const content = await file.text();
    const res = await dbService.importRelations(content);
    console.log('----import result', res);
  };

  const runExampleScript = async (value: string) => {
    console.log('---', value);
    setQueryText(value);
    runQuery(value);
  };

  // const renderColumn = (name: string, colIdx: number) => {
  //   let cellRenderer = null;
  //   if (['cid', 'text'].indexOf(name) > -1) {
  //     cellRenderer = (rowIdx: number) => (
  //       <Cell>
  //         <TruncatedFormat detectTruncation>
  //           {queryResults.rows[rowIdx][colIdx]}
  //         </TruncatedFormat>
  //       </Cell>
  //     );
  //   } else {
  //     cellRenderer = (rowIdx: number) => (
  //       <Cell>{queryResults.rows[rowIdx][colIdx]}</Cell>
  //     );
  //   }

  //   // const headerCellRenderer = (colIdx: number) => (
  //   //   <ColumnHeaderCell>{name}</ColumnHeaderCell>
  //   // );

  //   return (
  //     <Column
  //       name={name}
  //       key={colIdx}
  //       cellRenderer={cellRenderer}
  //       // columnHeaderCellRenderer={headerCellRenderer}
  //     />
  //   );
  // };
  return (
    <div>
      <Pane
        width="100%"
        display="flex"
        marginBottom={20}
        padding={10}
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        {syncState?.status && (
          <Text color="#fff" fontSize="20px" lineHeight="30px" padding="10px">
            Drive sync status - {syncState?.status}
          </Text>
        )}
        {syncState?.status === 'syncing' && <SyncInfo syncState={syncState} />}
        {syncState?.status === 'idle' && (
          <CybButton disabled={!isLoaded || !node} onClick={importIpfs}>
            sync drive
          </CybButton>
        )}
        {/* {logs.length > 0 && (
          <div className={styles.logs}>
            {Object.keys(syncStatus?.logs).map((m, i) => <div key={`ipfs_log_${i}`}>{m}</div>)
            <Text color="#fff" fontSize="20px" lineHeight="30px">
              Importing from IPFS:
            </Text>
            {logs.map((m, i) => (
              <div key={`ipfs_log_${i}`}>{m}</div>
            ))}
          </div>
        )} */}
      </Pane>

      <Pane width="100%">
        <textarea
          placeholder="Enter your query here..."
          onChange={(e) => setQueryText(e.target.value)}
          value={queryText}
          className="resize-none"
          rows={10}
        />
        <div className={styles.commandPanel}>
          <div className={styles.subPanel}>
            <CybButton
              disabled={!isLoaded || inProgress}
              onClick={() => runQuery()}
              small
            >
              {isLoaded
                ? inProgress
                  ? 'Query is running'
                  : '🟧 Run script'
                : 'Loading WASM ...'}
            </CybButton>
            <Select
              width="180px"
              valueSelect=""
              small
              // textSelectValue="select preset..."
              onChangeSelect={runExampleScript}
              options={presetsAsSelectOptions}
              // disabled={pending}
            />
          </div>
          <div className={styles.subPanel}>
            <CybButton
              disabled={!isLoaded || !node}
              onClick={exportReations}
              small
            >
              export
            </CybButton>
            <FileInputButton caption="import" processFile={importReations} />
          </div>
        </div>
      </Pane>
      {statusMessage && (
        <Pane width="100%" marginTop={10}>
          <div className={styles.statusMessage}>{statusMessage}</div>
        </Pane>
      )}
      <Pane width="100%" marginTop={10}>
        {queryResults ? (
          queryResults.cols.length > 0 ? (
            <div style={{ height: '600px' }} className="bp5-dark">
              <Table columns={queryResults.cols} data={queryResults.rows} />
            </div>
          ) : null
        ) : (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
      </Pane>
    </div>
  );
}

export default Drive;
