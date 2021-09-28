/// <reference types="react" />
import { ENumericalColorScaleType } from '../../scatter/scatter';
interface NumericalColorButtonsProps {
    callback: (s: ENumericalColorScaleType) => void;
    currentSelected: ENumericalColorScaleType;
}
export declare function NumericalColorButtons(props: NumericalColorButtonsProps): JSX.Element;
export {};
