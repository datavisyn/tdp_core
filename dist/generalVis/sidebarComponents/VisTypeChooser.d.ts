/// <reference types="react" />
import { ESupportedPlotlyVis } from '../types/generalTypes';
interface VisTypeChooserProps {
    callback: (s: ESupportedPlotlyVis) => void;
    currentSelected: ESupportedPlotlyVis;
    disabled: boolean;
}
export declare function VisTypeChooser(props: VisTypeChooserProps): JSX.Element;
export {};
