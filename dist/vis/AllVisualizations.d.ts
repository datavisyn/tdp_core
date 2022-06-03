import { BaseConfig, ICommonVisProps, VisColumn } from './interfaces';
export declare function GetVisualizations(): any[];
export declare function CreateVisualization<T extends BaseConfig<N>, N extends string>(renderer: (props: ICommonVisProps<T, N>) => JSX.Element, initialiteConfig: (columns: VisColumn[], inconsistentVisConfig: T, defaultConfig: T) => BaseConfig<N>, type: N, defaultConfig: Omit<T, 'type'>): {
    renderer: (props: ICommonVisProps<T, N>) => JSX.Element;
    initialiteConfig: (columns: VisColumn[], inconsistentVisConfig: T, defaultConfig: T) => BaseConfig<N>;
    type: N;
    defaultConfig: Omit<T, "type">;
};
//# sourceMappingURL=AllVisualizations.d.ts.map