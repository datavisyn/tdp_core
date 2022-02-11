import * as React from 'react';
import {CategoricalColumn, ColumnInfo, ESupportedPlotlyVis, EViolinOverlay, IViolinConfig, NumericalColumn} from '../interfaces';
import {useMemo} from 'react';
import {IVisConfig} from '../interfaces';
import {VisTypeSelect} from '../sidebar/VisTypeSelect';
import {NumericalColumnSelect} from '../sidebar/NumericalColumnSelect';
import {merge} from 'lodash';
import {WarningMessage} from '../sidebar/WarningMessage';
import {CategoricalColumnSelect, ViolinOverlayButtons} from '..';

interface ViolinVisSidebarProps {
    config: IViolinConfig;
    optionsConfig?: {
        overlay?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        }
    };
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: (NumericalColumn | CategoricalColumn) [];
    setConfig: (config: IVisConfig) => void;
    width?: string;
}

const defaultConfig = {
    overlay: {
        enable: true,
        customComponent: null
    }
};
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null
};
export function ViolinVisSidebar({
    config,
    optionsConfig,
    extensions,
    columns,
    setConfig,
    width = '20rem'
}: ViolinVisSidebarProps) {

    const uniqueId = useMemo(() => {
        return Math.random().toString(36).substr(2, 5);
    }, []);

    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);

    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);

    return (
        <div className="container pb-3 pt-2" style={{width}}>
            <WarningMessage/>
            <VisTypeSelect
                callback={(type: ESupportedPlotlyVis) => setConfig({...config as any, type})}
                currentSelected={config.type}
            />
            <hr/>
            <NumericalColumnSelect
                callback={(numColumnsSelected: ColumnInfo[]) => setConfig({...config, numColumnsSelected})}
                columns={columns}
                currentSelected={config.numColumnsSelected || []}
            />
            <CategoricalColumnSelect
                callback={(catColumnsSelected: ColumnInfo[]) => setConfig({...config, catColumnsSelected})}
                columns={columns}
                currentSelected={config.catColumnsSelected || []}
            />
            <hr/>
            {mergedExtensions.preSidebar}

            {mergedOptionsConfig.overlay.enable ? mergedOptionsConfig.overlay.customComponent
            || <ViolinOverlayButtons
                callback={(violinOverlay: EViolinOverlay) => setConfig({...config, violinOverlay})}
                currentSelected={config.violinOverlay}
            /> : null }

            {mergedExtensions.postSidebar}
        </div>
        );
}

