/// <reference types="react" />
import { EBarDisplayType } from '../../bar/bar';
interface BarDisplayProps {
    callback: (s: EBarDisplayType) => void;
    currentSelected: EBarDisplayType;
}
export declare function BarDisplayButtons(props: BarDisplayProps): JSX.Element;
export {};
