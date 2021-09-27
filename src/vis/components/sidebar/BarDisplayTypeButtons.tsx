import * as React from 'react';
import {EBarDirection, EBarDisplayType} from '../../plotUtils/bar';

interface BarDisplayProps {
    callback: (s: EBarDisplayType) => void;
}

export function BarDisplayButtons(props: BarDisplayProps) {
    const options = [EBarDirection.VERTICAL, EBarDirection.HORIZONTAL];
    return (
        <>
            <div key={`barDirectionGroup`} className="btn-group w-100 px-2 pt-3" role="group" aria-label="Basic outlined example">
                {(options).map(((opt) => {
                    return (
                        <React.Fragment key={`radioButtonsFilter${opt}`}>
                            <input onChange={(e) => props.callback(e.currentTarget.value as EBarDisplayType)} value={opt} type="checkbox" className="btn-check" id={`formButton${opt}`} autoComplete="off"/>
                            <label style={{zIndex: 0}} className={`btn btn-outline-primary w-100`} htmlFor={`formButton${opt}`}>{opt}</label>
                        </React.Fragment>
                    );
                }))}
            </div>
        </>
    );
}
