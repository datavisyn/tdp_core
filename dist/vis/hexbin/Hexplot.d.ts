/// <reference types="react" />
import { VisColumn, IHexbinConfig } from '../interfaces';
interface HexagonalBinProps {
    config: IHexbinConfig;
    columns: VisColumn[];
    selectionCallback?: (ids: string[]) => void;
    selected?: {
        [key: string]: boolean;
    };
}
export declare function Hexplot({ config, columns, selectionCallback, selected }: HexagonalBinProps): JSX.Element;
export {};
//# sourceMappingURL=Hexplot.d.ts.map