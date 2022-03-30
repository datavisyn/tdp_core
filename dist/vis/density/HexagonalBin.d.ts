import { VisColumn, IDensityConfig } from '../interfaces';
interface HexagonalBinProps {
    config: IDensityConfig;
    columns: VisColumn[];
    selectionCallback?: (ids: string[]) => void;
    selected?: {
        [key: string]: boolean;
    };
}
export declare function HexagonalBin({ config, columns, selectionCallback, selected }: HexagonalBinProps): JSX.Element;
export {};
//# sourceMappingURL=HexagonalBin.d.ts.map