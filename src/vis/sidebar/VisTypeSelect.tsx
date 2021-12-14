import * as React from 'react';
import Select from 'react-select';
import {allVisTypes, ESupportedPlotlyVis} from '../interfaces';

interface VisTypeSelectProps {
    callback: (s: ESupportedPlotlyVis) => void;
    currentSelected: ESupportedPlotlyVis;
}

export function VisTypeSelect(props: VisTypeSelectProps) {
    return (
        <>
            <label className="pt-2 pb-1">Visualization Type</label>
            <Select
                closeMenuOnSelect={true}
                // components={{Option: optionLayout}}
                onChange={(e) => props.callback(e.value)}
                name="visTypes"
                options={allVisTypes.map((t) => {
                    return {
                        value: t,
                        label: t
                    };
                })}
                value={{value: props.currentSelected, label: props.currentSelected}}
            />
        </>
    );
}
