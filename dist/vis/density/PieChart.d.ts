import * as d3 from 'd3v7';
export interface PieChartProps {
    data: number[];
    dataCategories: string[];
    radius: number;
    transform: string;
    colorScale: d3.ScaleOrdinal<string, string, never>;
}
export declare function PieChart({ data, dataCategories, radius, transform, colorScale }: PieChartProps): JSX.Element;
//# sourceMappingURL=PieChart.d.ts.map