import * as React from 'react';
import {EBarDirection} from '../bar/utils';

export function WarningMessage() {
    const options = [EBarDirection.VERTICAL, EBarDirection.HORIZONTAL];
    return (
        <>
            <div className="alert alert-warning" role="alert">
                <strong>Please note:</strong> This feature is still under development. Please report any problems you might observe.
            </div>
        </>
    );
}
