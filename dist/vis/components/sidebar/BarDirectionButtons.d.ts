/// <reference types="react" />
import { EBarDirection } from '../../plotUtils/bar';
interface BarDirectionProps {
    callback: (s: EBarDirection) => void;
}
export declare function BarDirectionButtons(props: BarDirectionProps): JSX.Element;
export {};
