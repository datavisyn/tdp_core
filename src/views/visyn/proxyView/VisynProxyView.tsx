// Gets into the phovea.ts
import * as React from 'react';
import { useEffect } from 'react';
import Select from 'react-select';
import { VisynSimpleViewPluginType } from '../interfaces';

export type ProxyViewPluginType = VisynSimpleViewPluginType<
  { currentId: string },
  {
    /**
     * hello world
     */
    url: string;
  }
>;

export function ProxyView({ parameters, onParametersChanged, desc }: ProxyViewPluginType['props']) {
  useEffect(() => {
    if (!parameters) {
      onParametersChanged({ currentId: '' });
    }
  });

  return <iframe className="w-100 h-100" src={desc.url} />;
}

// Toolbar ?
export function ProxyViewHeader({ selection, onParametersChanged }: ProxyViewPluginType['props']) {
  const options = selection.map((s) => {
    return { value: s, label: s };
  });

  return (
    <div style={{ width: '200px' }}>
      <Select
        options={options}
        onChange={(e) => {
          onParametersChanged({ currentId: e.value });
        }}
      />
    </div>
  );
}

export const create: () => ProxyViewPluginType['definition'] = () => {
  return {
    viewType: 'simple',
    defaultParameters: {
      currentId: '',
    },
    view: ProxyView,
    tab: null,
    header: ProxyViewHeader,
  };
};
