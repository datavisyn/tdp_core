import Plotly from 'plotly.js';
import React, { useEffect } from 'react';

export function useVisResize(id: string, plotlyDivRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
    });

    const divRef = plotlyDivRef.current;

    if (plotlyDivRef) {
      ro.observe(divRef);
    }

    return () => {
      ro.unobserve(divRef);
    };
  }, [id, plotlyDivRef]);
}
