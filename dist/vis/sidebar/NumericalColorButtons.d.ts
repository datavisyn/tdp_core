import { ENumericalColorScaleType } from '../scatter/utils';
interface NumericalColorButtonsProps {
    callback: (s: ENumericalColorScaleType) => void;
    currentSelected: ENumericalColorScaleType;
}
export declare function NumericalColorButtons(props: NumericalColorButtonsProps): JSX.Element;
export {};
