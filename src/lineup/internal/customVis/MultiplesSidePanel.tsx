import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from '@fortawesome/free-solid-svg-icons'
import * as React from 'react';
import {CategoricalColumn, chartTypes, correlationTypes, distributionTypes, highDimensionalTypes, NumericalColumn, supportedPlotlyVis} from './CustomVis';
import Plotly from "plotly.js";
import {useCallback, useRef} from "react";
import {useResizeDetector} from "react-resize-detector";

interface MultiplesSidePanelProps {
    chartTypeChangeCallback: (s: string) => void;
    updateSelectedNumCols: (s: string, b: boolean) => void
    updateSelectedCatCols: (s: string, b: boolean) => void
    selectedCatCols: string[]
    selectedNumCols: string[]
    setCurrentVis: (s: supportedPlotlyVis) => void
    currentVis: supportedPlotlyVis;
    currentType: supportedPlotlyVis;
    columns: (NumericalColumn | CategoricalColumn) []
    dropdowns: GenericSelect[];
}

type GenericSelect = {
    name: string;
    currentSelected: string;
    options: string[]
    callback: (s: string) => void
}

export function MultiplesSidePanel(props: MultiplesSidePanelProps) {
    const onResize = useCallback(() => {
        // window.dispatchEvent(new Event('resize'));

        if(document.getElementById("plotlyDiv"))
        {
            console.log("in here")
            Plotly.relayout("plotlyDiv", {   
                autosize: true,
                transition: {
                    duration: 1000,
                    easing: "cubic-in"
                }
            })
        }
    }, []);
    
    const { ref } = useResizeDetector({ onResize });

    return (
        <div ref={ref} className="position-relative h-100 flex-shrink-1 bg-light">
            <button className="btn btn-primary-outline" type="button" data-bs-toggle="collapse" data-bs-target="#generalVisBurgerMenu" aria-expanded="true" aria-controls="generalVisBurgerMenu">
                <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="collapse show collapse-horizontal" id="generalVisBurgerMenu">
                <div className="container" style={{width: "40em"}}>
                    <form>
                        <div className="form-group row pt-2 pb-4 pe-3 ps-3">
                            <label className="fw-light px-0 pb-1 form-label fs-6">Chart Type</label>
                            <select className="form-select text-muted" defaultValue={props.currentType} aria-label="Default select example" onChange={evt => props.chartTypeChangeCallback(evt.currentTarget.value)}>
                                {chartTypes.map(c => {
                                        return <option value={c} key={c}>{c}</option>
                                    })}
                            </select>
                        </div>
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Correlation</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Distribution</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact" type="button" role="tab" aria-controls="contact" aria-selected="false">High Dimensional</button>
                            </li>
                        </ul>
                        <div className="tab-content" id="myTabContent">
                            <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                <div className="btn-group px-2 pt-3" role="group" aria-label="Basic checkbox toggle button group">
                                    {correlationTypes.map(d => {
                                        return (
                                            <React.Fragment key={`correlationLabel${d}`}>
                                                <input checked={props.currentVis === d} onChange={e => props.setCurrentVis(e.currentTarget.value as supportedPlotlyVis)} value={d} type="checkbox" className="btn-check" id={`btnCheck${d}`} autoComplete="off"/>
                                                <label className="btn btn-outline-primary" htmlFor={`btnCheck${d}`}>{d}</label>
                                            </React.Fragment>
                                        )
                                    })}
                                </div>
                                <hr/>
                            </div>
                            <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                <div className="btn-group px-2 pt-3" role="group" aria-label="Basic checkbox toggle button group">
                                        {distributionTypes.map(d => {
                                            return (
                                                <React.Fragment key={`correlationLabel${d}`}>
                                                    <input checked={props.currentVis === d} onChange={e => props.setCurrentVis(e.currentTarget.value as supportedPlotlyVis)} value={d} type="checkbox" className="btn-check" id={`btnCheck${d}`} autoComplete="off"/>
                                                    <label className="btn btn-outline-primary" htmlFor={`btnCheck${d}`}>{d}</label>
                                                </React.Fragment>
                                            )
                                    })}
                                </div>
                                <hr/>
                            </div>
                            <div className="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
                                <div className="btn-group px-2 pt-3" role="group" aria-label="Basic checkbox toggle button group">
                                        {highDimensionalTypes.map(d => {
                                            return (
                                                <React.Fragment key={`correlationLabel${d}`}>
                                                    <input checked={props.currentVis === d} onChange={e => props.setCurrentVis(e.currentTarget.value as supportedPlotlyVis)} value={d} type="checkbox" className="btn-check" id={`btnCheck${d}`} autoComplete="off"/>
                                                    <label className="btn btn-outline-primary" htmlFor={`btnCheck${d}`}>{d}</label>
                                                </React.Fragment>
                                            )
                                    })}
                                </div>
                                <hr/>
                            </div>
                        </div>
                        <label className="fw-light px-3 pb-1 form-label fs-6 row">Numerical Columns</label>
                        <div className="btn-group px-2" role="group" aria-label="Basic checkbox toggle button group">

                            {props.columns.filter(c => c.type === "Numerical").map(d => {
                                return (
                                    <React.Fragment key={`btnLabel${d.name}`}>
                                        <input checked={props.selectedNumCols.includes(d.name)} onChange={e => props.updateSelectedNumCols(d.name, e.currentTarget.checked)}value={d.name} type="checkbox" className="btn-check" id={`btnCheck${d.name}`} autoComplete="off"/>
                                        <label className="btn btn-outline-primary" htmlFor={`btnCheck${d.name}`}>{d.name}</label>
                                    </React.Fragment>
                                )
                            })}
                        </div>
                        <hr/>
                        <label className="fw-light px-3 pb-1 form-label fs-6 row">Categorical Columns</label>
                        <div className="btn-group px-2 flex" role="group" aria-label="Basic checkbox toggle button group">
                            {props.columns.filter(c => c.type === "Categorical").map(d => {
                                return (
                                    <React.Fragment key={`btnLabel${d.name}`}>
                                        <input checked={props.selectedCatCols.includes(d.name)} onChange={e => props.updateSelectedCatCols(d.name, e.currentTarget.checked)} value={d.name} type="checkbox" className="btn-check" id={`btnCheck${d.name}`} autoComplete="off"/>
                                        <label className="btn btn-outline-primary" htmlFor={`btnCheck${d.name}`}>{d.name}</label>
                                    </React.Fragment>
                                )
                            })}
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