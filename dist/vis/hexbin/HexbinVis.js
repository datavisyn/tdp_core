import * as React from 'react';
import { merge, uniqueId } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { ActionIcon, Center, Container, Group, SimpleGrid, Stack, Tooltip } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { EScatterSelectSettings } from '../interfaces';
import { InvalidCols } from '../general';
import { I18nextManager } from '../../i18n/I18nextManager';
import { Hexplot } from './Hexplot';
import { HexbinVisSidebar } from './HexbinVisSidebar';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { BrushOptionButtons } from '../sidebar';
import { useSyncedRef } from '../../hooks/useSyncedRef';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function HexbinVis({ config, extensions, columns, setConfig, selectionCallback = () => null, selected = {}, enableSidebar, setShowSidebar, showSidebar, }) {
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    const setShowSidebarRef = useSyncedRef(setShowSidebar);
    // Cheating to open the sidebar after the first render, since it requires the container to be mounted
    useEffect(() => {
        setShowSidebarRef.current(true);
    }, [setShowSidebarRef]);
    const ref = useRef();
    const id = React.useMemo(() => uniqueId('HexbinVis'), []);
    return (React.createElement(Container, { p: 0, fluid: true, sx: { flexGrow: 1, height: '100%', overflow: 'hidden', width: '100%', position: 'relative' }, ref: ref },
        enableSidebar ? (React.createElement(Tooltip, { withinPortal: true, label: I18nextManager.getInstance().i18n.t('tdp:core.vis.openSettings') },
            React.createElement(ActionIcon, { sx: { zIndex: 10, position: 'absolute', top: '10px', right: '10px' }, onClick: () => setShowSidebar(true) },
                React.createElement(FontAwesomeIcon, { icon: faGear })))) : null,
        React.createElement(Stack, { spacing: 0, sx: { height: '100%' } },
            React.createElement(Center, null,
                React.createElement(Group, { mt: "lg" },
                    React.createElement(BrushOptionButtons, { callback: (dragMode) => setConfig({ ...config, dragMode }), options: [EScatterSelectSettings.RECTANGLE, EScatterSelectSettings.PAN], dragMode: config.dragMode }))),
            React.createElement(SimpleGrid, { style: { height: '100%' }, cols: config.numColumnsSelected.length > 2 ? config.numColumnsSelected.length : 1 }, config.numColumnsSelected.length < 2 ? (React.createElement(InvalidCols, { headerMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader'), bodyMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.hexbinError') })) : (React.createElement(React.Fragment, null,
                config.numColumnsSelected.length > 2 ? (config.numColumnsSelected.map((xCol) => {
                    return config.numColumnsSelected.map((yCol) => {
                        if (xCol.id !== yCol.id) {
                            return (React.createElement(Hexplot, { key: yCol.id + xCol.id, selectionCallback: selectionCallback, selected: selected, config: config, columns: [
                                    columns.find((col) => col.info.id === yCol.id),
                                    columns.find((col) => col.info.id === xCol.id),
                                    columns.find((col) => col.info.id === config.color?.id),
                                ] }));
                        }
                        return React.createElement("div", { key: `${xCol.id}hist` });
                    });
                })) : (React.createElement(Hexplot, { selectionCallback: selectionCallback, selected: selected, config: config, columns: [
                        columns.find((col) => col.info.id === config.numColumnsSelected[0].id),
                        columns.find((col) => col.info.id === config.numColumnsSelected[1].id),
                        columns.find((col) => col.info.id === config.color?.id),
                    ] })),
                mergedExtensions.postPlot)))),
        showSidebar ? (React.createElement(VisSidebarWrapper, { id: id, target: ref.current, open: showSidebar, onClose: () => setShowSidebar(false) },
            React.createElement(HexbinVisSidebar, { config: config, extensions: extensions, columns: columns, setConfig: setConfig }))) : null));
}
//# sourceMappingURL=HexbinVis.js.map