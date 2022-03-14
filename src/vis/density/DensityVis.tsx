import * as React from 'react';
import { merge, uniqueId } from 'lodash';
import { useMemo } from 'react';
import { VisColumn, IVisConfig, IDensityConfig } from '../interfaces';
import { DensityVisSidebar } from './DensityVisSidebar';
// eslint-disable-next-line import/no-cycle
import { HexagonalBin } from './HexagonalBin';

interface DensityVisProps {
  config: IDensityConfig;
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  columns: VisColumn[];
  setConfig: (config: IVisConfig) => void;
  selected?: { [key: string]: boolean };
  hideSidebar?: boolean;
}

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function DensityVis({ config, extensions, columns, setConfig, selected = {}, hideSidebar = false }: DensityVisProps) {
  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  //   const { value: traces, status: traceStatus, error: traceError } = useAsync(createPCPTraces, [columns, config, selected]);

  const id = React.useMemo(() => uniqueId('PCPVis'), []);

  return (
    <div className="d-flex flex-row w-100 h-100" style={{ minHeight: '0px' }}>
      <div
        className="position-relative d-grid flex-grow-1"
        style={{ gridTemplateColumns: 'minmax(0, 1fr) '.repeat(config.numColumnsSelected.length < 3 ? 1 : config.numColumnsSelected.length) }}
      >
        {config.numColumnsSelected.length > 2 ? (
          config.numColumnsSelected.map((xCol) => {
            return config.numColumnsSelected.map((yCol) => {
              if (xCol.id !== yCol.id) {
                console.log(xCol, yCol);
                return (
                  <HexagonalBin config={config} columns={[columns.find((col) => col.info.id === xCol.id), columns.find((col) => col.info.id === yCol.id)]} />
                );
              }

              return <div>hello world</div>;
            });
          })
        ) : (
          <HexagonalBin config={config} columns={columns} />
        )}

        {/* {mergedExtensions.prePlot}
        {traceStatus === 'success' && traces?.plots.length > 0 ? (
          <div>Hello World</div>
        ) : traceStatus !== 'pending' ? (
          <InvalidCols message={traceError?.message || traces?.errorMessage} />
        ) : null} */}
        {mergedExtensions.postPlot}
      </div>
      {!hideSidebar ? (
        <div className="position-relative h-100 flex-shrink-1 bg-light overflow-auto mt-2">
          <button
            className="btn btn-primary-outline"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#generalVisBurgerMenu${id}`}
            aria-expanded="true"
            aria-controls="generalVisBurgerMenu"
          >
            <i className="fas fa-bars" />
          </button>
          <div className="collapse show collapse-horizontal" id={`generalVisBurgerMenu${id}`}>
            <DensityVisSidebar config={config} extensions={extensions} columns={columns} setConfig={setConfig} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
