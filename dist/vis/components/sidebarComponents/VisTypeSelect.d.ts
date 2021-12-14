/// <reference types="react" />
import { ESupportedPlotlyVis } from '../../types/generalTypes';
interface VisTypeSelectProps {
    callback: (s: ESupportedPlotlyVis) => void;
    currentSelected: ESupportedPlotlyVis;
}
export declare function VisTypeSelect(props: VisTypeSelectProps): JSX.Element;
export {};
