import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
// code taken from https://wattenberger.com/blog/react-and-d3
export function YAxis({ domain = [0, 100], range = [10, 290], xRange, horizontalPosition = 0 }) {
    const ticks = useMemo(() => {
        const yScale = d3.scaleLinear().domain(domain.reverse()).range(range);
        return yScale.ticks(5).map((value) => ({
            value,
            yOffset: yScale(value),
        }));
    }, [domain, range]);
    return (React.createElement(React.Fragment, null,
        React.createElement("path", { transform: `translate(${horizontalPosition}, 0)`, d: ['M', 0, range[0], 'V', range[1]].join(' '), fill: "none", stroke: "currentColor" }),
        ticks.map(({ value, yOffset }) => (React.createElement("g", { key: value, transform: `translate(${horizontalPosition}, ${yOffset})` },
            React.createElement("line", { x2: "-6", stroke: "currentColor" }),
            React.createElement("line", { x2: `${xRange[1] - xRange[0]}`, stroke: `${value === 0 ? 'black' : 'lightgray'}` }),
            React.createElement("text", { key: value, style: {
                    dominantBaseline: 'middle',
                    fontSize: '10px',
                    textAnchor: 'end',
                    transform: 'translateX(-8px)',
                } }, value))))));
}
//# sourceMappingURL=YAxis.js.map