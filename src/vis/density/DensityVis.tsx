import * as React from 'react';
import { merge, uniqueId } from 'lodash';
import { useMemo } from 'react';
import { VisColumn, IVisConfig, IDensityConfig, EScatterSelectSettings } from '../interfaces';
import { DensityVisSidebar } from './DensityVisSidebar';
import { HexagonalBin } from './HexagonalBin';
import { HexBrushOptions } from '../sidebar/HexBrushOptions';
import { InvalidCols } from '../general';
import { I18nextManager } from '../../i18n/I18nextManager';

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
  selectionCallback?: (ids: string[]) => void;
  selected?: { [key: string]: boolean };
  hideSidebar?: boolean;
}

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function DensityVis({ config, extensions, columns, setConfig, selectionCallback = () => null, selected = {}, hideSidebar = false }: DensityVisProps) {
  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  const id = React.useMemo(() => uniqueId('PCPVis'), []);

  return (
    <div className="d-flex flex-row w-100 h-100" style={{ minHeight: '0px' }}>
      <div
        className="position-relative d-grid flex-grow-1"
        style={{ gridTemplateColumns: 'minmax(0, 1fr) '.repeat(config.numColumnsSelected.length < 3 ? 1 : config.numColumnsSelected.length) }}
      >
        {config.numColumnsSelected.length < 2 ? (
          <InvalidCols
            headerMessage={I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader')}
            bodyMessage={I18nextManager.getInstance().i18n.t('tdp:core.vis.scatterError')}
          />
        ) : (
          <>
            {config.numColumnsSelected.length > 2 ? (
              config.numColumnsSelected.map((xCol) => {
                return config.numColumnsSelected.map((yCol) => {
                  if (xCol.id !== yCol.id) {
                    return (
                      <HexagonalBin
                        selectionCallback={selectionCallback}
                        selected={selected}
                        config={config}
                        columns={columns.filter((col) => col.info.id === xCol.id || col.info.id === yCol.id || col.info.id === config.color?.id)}
                      />
                    );
                  }

                  return <div key={`${xCol.id}hist`} />;
                });
              })
            ) : (
              <>
                <div className="position-absolute top-0 start-50 translate-middle-x">
                  <HexBrushOptions callback={(dragMode: EScatterSelectSettings) => setConfig({ ...config, dragMode })} dragMode={config.dragMode} />
                </div>
                <HexagonalBin selectionCallback={selectionCallback} selected={selected} config={config} columns={columns} />
              </>
            )}
            {mergedExtensions.postPlot}
          </>
        )}
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
