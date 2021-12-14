import * as React from 'react';
import {EBarDirection} from '../bar/utils';

interface OpacitySliderProps {
    callback: (n: number) => void;
    currentValue: number;
}

export function OpacitySlider(props: OpacitySliderProps) {
    const options = [EBarDirection.VERTICAL, EBarDirection.HORIZONTAL];
    return (
        <>
            <div className="ps-2 pt-0 m-0">
                <label htmlFor={`alphaSlider`}  className={`form-label m-0 p-0`}>Opacity</label>
                <input type="range" onChange={(e) => props.callback(+e.currentTarget.value)} className="form-range" value={props.currentValue} min="=0" max="1" step=".1" id={`alphaSlider`}/>
            </div>
        </>
    );
}
