import * as React from 'react';
import { uniqueId } from 'lodash';
import { VisSidebar, Vis, VisColumn, EColumnTypes } from '../../../vis';
import { DemoVisynViewPluginType } from './interfaces';

function fetchData(numberOfPoints: number): VisColumn[] {
  const dataGetter = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });

    return {
      pca_x: Array(numberOfPoints)
        .fill(null)
        .map(() => Math.random() * 100),
      pca_y: Array(numberOfPoints)
        .fill(null)
        .map(() => Math.random() * 100),
      value: Array(numberOfPoints)
        .fill(null)
        .map(() => Math.random() * 100),
      category: Array(numberOfPoints)
        .fill(null)
        .map(() => parseInt((Math.random() * 10).toString(), 10).toString()),
    };
  };

  const dataPromise = dataGetter();

  return [
    {
      info: {
        description: '',
        id: 'pca_x',
        name: 'pca_x',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.pca_x.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'pca_y',
        name: 'pca_y',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.pca_y.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'value',
        name: 'value',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.value.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'category',
        name: 'category',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.category.map((val, i) => ({ id: i.toString(), val }))),
    },
  ];
}

export function VisynDemoView({ desc, parameters, onParametersChanged }: DemoVisynViewPluginType['props']) {
  React.useEffect(() => {
    onParametersChanged((p) => ({
      ...p,
      columns: fetchData(p?.dataLength),
    }));
  }, [parameters?.dataLength, onParametersChanged]);

  return (
    <>
      {desc.helpText}
      {parameters.columns ? (
        <Vis
          columns={parameters.columns}
          externalConfig={parameters.config}
          setExternalConfig={(config) => {
            onParametersChanged((p) => ({
              ...p,
              config,
            }));
          }}
        />
      ) : null}
    </>
  );
}

export function VisynDemoViewSidebar({ parameters, onParametersChanged }: DemoVisynViewPluginType['props']) {
  return parameters.columns ? (
    <VisSidebar
      style={{
        justifySelf: 'center',
        alignSelf: 'center',
      }}
      columns={parameters.columns}
      externalConfig={parameters.config}
      setExternalConfig={(config) => {
        onParametersChanged((p) => ({
          ...p,
          config,
        }));
      }}
    />
  ) : null;
}

export function VisynDemoViewHeader({ parameters, selection, onParametersChanged }: DemoVisynViewPluginType['props']) {
  const id = React.useMemo(() => uniqueId('VisynDemoViewHeader'), []);
  React.useEffect(() => {
    onParametersChanged((p) => ({
      ...p,
      dataLength: (selection.length + 1) * 100,
    }));
  }, [selection, onParametersChanged]);

  return (
    <div className="d-flex flex-grow-1 align-self-center justify-content-center">
      <span>
        A selection of {selection.length} equals {parameters.dataLength} points.
        <div className="form-check form-switch form-check-inline ms-2">
          <input
            className="form-check-input"
            type="checkbox"
            id={id}
            onChange={(e) => {
              onParametersChanged((p) => ({
                ...p,
                dataLength: e.currentTarget.checked ? 5000 : (selection.length + 1) * 100,
              }));
            }}
            checked={parameters.dataLength === 5000}
          />
          <label className="form-check-label" htmlFor={id}>
            Show 5000 points instead
          </label>
        </div>
      </span>
    </div>
  );
}

export function createVisynDemoView(): DemoVisynViewPluginType['definition'] {
  return {
    viewType: 'simple',
    defaultParameters: {
      columns: null,
      config: null,
      dataLength: 100,
    },
    view: VisynDemoView,
    header: VisynDemoViewHeader,
    tab: VisynDemoViewSidebar,
  };
}
