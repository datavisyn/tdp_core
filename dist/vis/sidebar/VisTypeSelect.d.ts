/// <reference types="react" />
import { ESupportedPlotlyVis } from '../interfaces';
interface VisTypeSelectProps {
    callback: (s: ESupportedPlotlyVis) => void;
    currentSelected: ESupportedPlotlyVis;
}
export declare function VisTypeSelect({ callback, currentSelected }: VisTypeSelectProps): JSX.Element;
export {};
//# sourceMappingURL=VisTypeSelect.d.ts.map