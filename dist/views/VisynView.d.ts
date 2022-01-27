export interface IVisynViewProps<C, P> {
    desc: C;
    data: {
        [key: string]: any;
    };
    dataDesc: any[];
    selection: string[];
    filters: string[];
    parameters: P;
    onSelectionChanged: (selection: string[]) => void;
    onFiltersChanged: (newFilter: string[]) => void;
    onParametersChanged: (parameters: P) => void;
}
//# sourceMappingURL=VisynView.d.ts.map