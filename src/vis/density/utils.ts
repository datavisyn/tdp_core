import d3 from 'd3';
import { merge } from 'lodash';
import {
  EColumnTypes,
  ESupportedPlotlyVis,
  IVisConfig,
  VisColumn,
  IDensityConfig,
  VisNumericalValue,
  VisCategoricalValue,
  ColumnInfo,
  VisNumericalColumn,
} from '../interfaces';
import { resolveColumnValues, resolveSingleColumn } from '../general/layoutUtils';

export function isDensity(s: IVisConfig): s is IDensityConfig {
  return s.type === ESupportedPlotlyVis.DENSITY;
}

const defaultConfig: IDensityConfig = {
  type: ESupportedPlotlyVis.DENSITY,
  numColumnsSelected: [],
  color: null,
};

export function densityMergeDefaultConfig(columns: VisColumn[], config: IDensityConfig): IVisConfig {
  const merged = merge({}, defaultConfig, config);
  return merged;
}

export async function getHexData(
  columns: VisColumn[],
  config: IDensityConfig,
): Promise<{
  numColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  }[];
  colorColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
}> {
  const numCols: VisNumericalColumn[] = config.numColumnsSelected
    .filter((col) => columns.find((c) => c.info.id === col.id))
    .map((c) => columns.find((col) => col.info.id === c.id) as VisNumericalColumn);

  console.log(numCols);

  const numColVals = await resolveColumnValues(numCols);
  const colorColVals = await resolveSingleColumn(config.color ? columns.find((col) => col.info.id === config.color.id) : null);

  return { numColVals, colorColVals };
}

export function cutHex(path: string, radius: number, start: number, sixths: number): string {
  if (sixths === 6) {
    return path;
  }

  if (sixths === 0 || start > 5) {
    return '';
  }

  const splitPath = path.slice(1, path.length - 1).split(/[l]/);

  const currPos = [0, -radius];

  for (let i = 1; i <= start; i++) {
    currPos[0] += +splitPath[i].split(',')[0];
    currPos[1] += +splitPath[i].split(',')[1];
  }

  let finalString = `m${currPos}`;

  for (let i = 0; i < sixths; i++) {
    finalString += start + 1 + i >= 6 ? '' : `l${splitPath[start + 1 + i]}`;
  }

  if (start + sixths >= 6) {
    finalString += `L 0 -${radius}`;
  }

  finalString += 'L 0 0 z';

  return `${finalString}`;
}
