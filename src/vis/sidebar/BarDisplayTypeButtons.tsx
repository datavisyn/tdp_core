import * as React from 'react';
import {EBarDirection, EBarDisplayType} from '../bar/utils';

interface BarDisplayProps {
    callback: (s: EBarDisplayType) => void;
    currentSelected: EBarDisplayType;
}

export function BarDisplayButtons(props: BarDisplayProps) {
    const options = [EBarDisplayType.DEFAULT, EBarDisplayType.NORMALIZED];
    return (
        <>
            <div key={`barDirectionGroup`} className="btn-group w-100 px-2 pt-3" role="group" aria-label="Basic outlined example">
                {(options).map(((opt) => {
                    return (
                        <React.Fragment key={`radioButtonsFilter${opt}`}>
                            <input checked={props.currentSelected === opt} onChange={(e) => props.callback(e.currentTarget.value as EBarDisplayType)} value={opt} type="checkbox" className="btn-check" id={`formButton${opt}`} autoComplete="off"/>
                            <label style={{zIndex: 0}} className={`btn btn-outline-primary w-100`} htmlFor={`formButton${opt}`}>{opt}</label>
                        </React.Fragment>
                    );
                }))}
            </div>
        </>
    );
}
