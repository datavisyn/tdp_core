import * as React from 'react';
import {ENumericalColorScaleType} from '../scatter/utils';

interface NumericalColorButtonsProps {
    callback: (s: ENumericalColorScaleType) => void;
    currentSelected: ENumericalColorScaleType;
}

export function NumericalColorButtons(props: NumericalColorButtonsProps) {
    const sequentialColors = ['#002245', '#214066', '#3e618a', '#5c84af', '#83a8c9', '#a9cfe4', '#cff6ff'];
    const divergentColors = ['#337ab7', '#7496c1', '#a5b4ca', '#d3d3d3', '#e5b19d', '#ec8e6a', '#ec6836'];

    return (
        <>
            <div key={`numericalColorChooserRadio`} className="btn-group w-100 px-2 pt-2" role="group" aria-label="Basic outlined example">
                <input checked={props.currentSelected === ENumericalColorScaleType.SEQUENTIAL} onChange={(e) => props.callback(e.currentTarget.value as ENumericalColorScaleType)} value={ENumericalColorScaleType.SEQUENTIAL} type="checkbox" className="btn-check" id={`formButton${ENumericalColorScaleType.SEQUENTIAL}`} autoComplete="off"/>
                <label style={{zIndex: 0}} className={`btn btn-outline-primary w-100`} htmlFor={`formButton${ENumericalColorScaleType.SEQUENTIAL}`} title="Sequential Color Scale">{ENumericalColorScaleType.SEQUENTIAL}</label>

                <input checked={props.currentSelected === ENumericalColorScaleType.DIVERGENT} onChange={(e) => props.callback(e.currentTarget.value as ENumericalColorScaleType)} value={ENumericalColorScaleType.DIVERGENT} type="checkbox" className="btn-check" id={`formButton${ENumericalColorScaleType.DIVERGENT}`} autoComplete="off"/>
                <label style={{zIndex: 0}} className={`btn btn-outline-primary w-100`} htmlFor={`formButton${ENumericalColorScaleType.DIVERGENT}`} title="Divergent Color Scale">{ENumericalColorScaleType.DIVERGENT}</label>
            </div>
            <div className="d-flex w-100 px-2 pt-1 pb-3">
                <div className="d-flex w-100 mx-2">
                    {sequentialColors.map((d) => {
                        return <span key={`colorScale ${d}`} className="w-100" style={{border: '1px solid lightgrey', background:`${d}`, height: '1rem'}}/>;
                    })}
                </div>

                <div className="d-flex w-100 mx-2">
                    {divergentColors.map((d) => {
                        return <span key={`colorScale ${d}`} className="w-100" style={{border: '1px solid lightgrey', background:`${d}`, height: '1rem'}}/>;
                    })}
                </div>
            </div>
        </>
    );
}
