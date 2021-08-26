/// <reference types="react" />
interface GenericSidePanelProps {
    chartTypeChangeCallback: (s: string) => void;
    dropdowns: GenericSelect[];
}
declare type GenericSelect = {
    name: string;
    currentSelected: string;
    options: string[];
    callback: (s: string) => void;
};
export declare function GenericSidePanel(props: GenericSidePanelProps): JSX.Element;
export {};
