/// <reference types="react" />
import { EBarDisplayType } from '../../plotUtils/bar';
interface BarDisplayProps {
    callback: (s: EBarDisplayType) => void;
}
export declare function BarDisplayButtons(props: BarDisplayProps): JSX.Element;
export {};
