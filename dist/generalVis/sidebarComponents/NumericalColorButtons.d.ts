/// <reference types="react" />
import { ENumericalColorScaleType } from '../plots/scatter';
interface NumericalColorButtonsProps {
    callback: (s: ENumericalColorScaleType) => void;
    currentSelected: ENumericalColorScaleType;
    disabled: boolean;
}
export declare function NumericalColorButtons(props: NumericalColorButtonsProps): JSX.Element;
export {};
