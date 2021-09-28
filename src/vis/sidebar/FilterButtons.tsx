import * as React from 'react';
import {EFilterOptions} from '../interfaces';

interface FilterButtonsProps {
    callback: (s: EFilterOptions) => void;
}

export function FilterButtons(props: FilterButtonsProps) {
    const options = [EFilterOptions.IN, EFilterOptions.OUT, EFilterOptions.CLEAR];
    return (
        <>
            <div key={`buttonGroupFilter`} className="btn-group w-100 px-2 pt-3" role="group" aria-label="Basic outlined example">
                {(options).map(((opt) => {
                    return (
                        <React.Fragment key={`radioButtonsFilter${opt}`}>
                            <input checked={false} onChange={(e) => props.callback(e.currentTarget.value as EFilterOptions)} value={opt} type="checkbox" className="btn-check" id={`formButton${opt}`} autoComplete="off"/>
                            <label style={{zIndex: 0}} className={`btn btn-outline-primary w-100`} htmlFor={`formButton${opt}`}>{opt}</label>
                        </React.Fragment>
                    );
                }))}
            </div>
        </>
    );
}
