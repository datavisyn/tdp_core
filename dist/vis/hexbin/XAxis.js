import * as React from 'react';
import { useMemo } from 'react';
// code taken from https://wattenberger.com/blog/react-and-d3
export function XAxis({ xScale, yRange, vertPosition }) {
    const ticks = useMemo(() => {
        return xScale.ticks(5).map((value) => ({
            value,
            xOffset: xScale(value),
        }));
    }, [xScale]);
    return (React.createElement(React.Fragment, null,
        React.createElement("path", { transform: `translate(0, ${vertPosition})`, d: ['M', xScale.range()[0], 0, 'H', xScale.range()[1]].join(' '), fill: "none", stroke: "lightgray" }),
        React.createElement("path", { transform: `translate(0, ${yRange[0]})`, d: ['M', xScale.range()[0], 0, 'H', xScale.range()[1]].join(' '), fill: "none", stroke: "lightgray" }),
        ticks.map(({ value, xOffset }) => (React.createElement("g", { key: value, transform: `translate(${xOffset}, ${vertPosition})` },
            React.createElement("line", { y2: "6", stroke: "currentColor" }),
            React.createElement("line", { y2: `${-(yRange[1] - yRange[0])}`, stroke: `${value === 0 ? 'black' : 'lightgray'}` }),
            React.createElement("text", { key: value, fontSize: "10px", textAnchor: "middle", style: {
                    transform: 'translateY(20px)',
                } }, value))))));
}
//# sourceMappingURL=XAxis.js.map