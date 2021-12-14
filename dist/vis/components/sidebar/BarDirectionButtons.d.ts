/// <reference types="react" />
import { EBarDirection } from '../../bar/bar';
interface BarDirectionProps {
    callback: (s: EBarDirection) => void;
    currentSelected: EBarDirection;
}
export declare function BarDirectionButtons(props: BarDirectionProps): JSX.Element;
export {};
