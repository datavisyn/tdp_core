import { BaseConfig, ICommonVisProps, IVisConfig, VisColumn } from './interfaces';

type VisualizationWrapper<T extends BaseConfig<N>, N extends string> = {
  renderer: (props: ICommonVisProps<T, N>) => JSX.Element;
  initialiteConfig: (columns: VisColumn[], inconsistentVisConfig: T, defaultConfig: T) => BaseConfig<N>;
  type: N;
  defaultConfig: T;
};

const visualizations: any[] = [];

export function GetVisualizations() {
  return visualizations;
}

export function CreateVisualization<T extends BaseConfig<N>, N extends string>(
  renderer: (props: ICommonVisProps<T, N>) => JSX.Element,
  initialiteConfig: (columns: VisColumn[], inconsistentVisConfig: T, defaultConfig: T) => BaseConfig<N>,
  type: N,
  defaultConfig: Omit<T, 'type'>,
) {
  visualizations.push({
    renderer,
    initialiteConfig,
    type,
    defaultConfig: { ...defaultConfig, type },
  });

  return {
    renderer,
    initialiteConfig,
    type,
    defaultConfig: { ...defaultConfig },
  };
}
