import * as d3v7 from 'd3v7';
import { uniqueId } from 'lodash';
import * as React from 'react';
import { useMemo } from 'react';
export function PieChart({ data, dataCategories, radius, transform, colorScale }) {
    const pie = useMemo(() => {
        return d3v7.pie();
    }, []);
    const createArc = useMemo(() => {
        return d3v7.arc().innerRadius(0).outerRadius(radius);
    }, [radius]);
    const id = React.useMemo(() => uniqueId('PieNum'), []);
    return (React.createElement("g", { style: { transform } }, pie(data).map((slice, i) => {
        // TODO: Why are indexes bad in the key? how else to do this? Also, I think the typings for arc are wrong, which is why im typing slice to any
        // eslint-disable-next-line react/no-array-index-key
        return React.createElement("path", { key: `${id}, ${i}`, d: createArc(slice), style: { fill: colorScale ? colorScale(dataCategories[i]) : 'cornflowerblue' } });
    })));
}
//# sourceMappingURL=PieChart.js.map