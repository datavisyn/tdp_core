import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from '@fortawesome/free-solid-svg-icons'
import * as React from 'react';
import {supportedPlotlyVis} from './CustomVis';

let chartTypes: supportedPlotlyVis[] = ["Scatterplot", "PCP", "Violin", "Strip Plot", "Multiples"]

interface GenericSidePanelProps {
    chartTypeChangeCallback: (s: string) => void;
    currentType: supportedPlotlyVis;
    dropdowns: GenericSelect[];
}

type GenericSelect = {
    name: string;
    currentSelected: string;
    options: string[]
    callback: (s: string) => void
}

export function GenericSidePanel(props: GenericSidePanelProps) {
    return (
        <div className="position-relative h-100 bg-light">
            <button className="btn btn-primary-outline" type="button" data-bs-toggle="collapse" data-bs-target="#generalVisBurgerMenu" aria-expanded="true" aria-controls="generalVisBurgerMenu">
                <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="collapse show collapse-horizontal" id="generalVisBurgerMenu">
                <div className="container" style={{width: "15em"}}>
                    <form>
                        <div className="form-group row pt-2 pb-4 pe-3 ps-3">
                            <label className="fw-light px-0 pb-1 form-label fs-6">Chart Type</label>
                            <select className="form-select text-muted" defaultValue={props.currentType} aria-label="Default select example" onChange={evt => props.chartTypeChangeCallback(evt.currentTarget.value)}>
                                {chartTypes.map(c => {
                                        return <option value={c} key={c}>{c}</option>
                                    })}
                            </select>
                        </div>
                        <hr/>
                        {props.dropdowns.map((d, i) => {
                            return (
                                <div key={d.name} className="form-group row pt-4 pb-2 px-3">
                                    <label className="fw-light px-0 pb-1 form-label fs-6">{d.name}</label>
                                    <select className="form-select text-muted" defaultValue={d.currentSelected} aria-label="Default select example" onChange={evt => d.callback(evt.currentTarget.value)}>
                                        {d.options.map((c) => {
                                                return <option value={c} key={c}>{c}</option>
                                            })}
                                    </select>
                                </div>
                            )
                        })}
                    </form>
                </div>
            </div>
        </div>
    );
}