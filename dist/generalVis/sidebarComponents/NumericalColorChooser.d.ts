/// <reference types="react" />
import { ENumericalColorScaleType } from '../plots/scatter';
interface NumericalColorChooserProps {
    callback: (s: ENumericalColorScaleType) => void;
    currentSelected: ENumericalColorScaleType;
    disabled: boolean;
}
export declare function NumericalColorChooser(props: NumericalColorChooserProps): JSX.Element;
export {};
