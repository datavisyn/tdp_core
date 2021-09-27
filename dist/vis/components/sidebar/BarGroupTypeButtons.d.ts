/// <reference types="react" />
import { EBarGroupingType } from '../../plotUtils/bar';
interface BarGroupTypeProps {
    callback: (s: EBarGroupingType) => void;
    currentSelected: EBarGroupingType;
}
export declare function BarGroupTypeButtons(props: BarGroupTypeProps): JSX.Element;
export {};
