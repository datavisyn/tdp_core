import * as React from 'react';
import {EViolinOverlay} from '../../plotUtils/bar';
import {EFilterOptions} from '../../types/generalTypes';

interface ViolinOverlayProps {
    callback: (s: EViolinOverlay) => void;
}

export function ViolinOverlayButtons(props: ViolinOverlayProps) {
    const options = [EViolinOverlay.NONE, EViolinOverlay.BOX, EViolinOverlay.STRIP];
    return (
        <>
            <div key={`buttonGroupFilter`} className="btn-group w-100 px-2 pt-3" role="group" aria-label="Basic outlined example">
                {(options).map(((opt) => {
                    return (
                        <React.Fragment key={`radioButtonsFilter${opt}`}>
                            <input onChange={(e) => props.callback(e.currentTarget.value as EViolinOverlay)} value={opt} type="checkbox" className="btn-check" id={`formButton${opt}`} autoComplete="off"/>
                            <label style={{zIndex: 0}} className={`btn btn-outline-primary w-100`} htmlFor={`formButton${opt}`}>{opt}</label>
                        </React.Fragment>
                    );
                }))}
            </div>
        </>
    );
}
