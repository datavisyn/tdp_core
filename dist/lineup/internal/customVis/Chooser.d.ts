/// <reference types="react" />
interface ChooserProps {
    dropdownNames: string[];
    updateChartType: (s: string) => void;
}
export declare function Chooser(props: ChooserProps): JSX.Element;
export {};
