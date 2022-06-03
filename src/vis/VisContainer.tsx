import React from 'react';

type VisContainerProps = {
  visualization: JSX.Element;
  sidebar?: JSX.Element;
};

export function VisContainer({ visualization, sidebar }: VisContainerProps) {
  return (
    <div style={{ minHeight: '0px', display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1,
        }}
      >
        {visualization}
        {sidebar}
      </div>
    </div>
  );
}
