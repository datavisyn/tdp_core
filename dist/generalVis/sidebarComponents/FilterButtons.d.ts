/// <reference types="react" />
import { EFilterOptions } from '../types/generalTypes';
interface FilterButtonsProps {
    callback: (s: EFilterOptions) => void;
}
export declare function FilterButtons(props: FilterButtonsProps): JSX.Element;
export {};
