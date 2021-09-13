import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import {CategoricalColumn, comparisonTypes, correlationTypes, distributionTypes, EColumnTypes, EGeneralFormType, ESupportedPlotlyVis, GenericOption, highDimensionalTypes, NumericalColumn} from '../types/generalTypes';
import Plotly from 'plotly.js';
import {useCallback, useMemo, useState} from 'react';
import {useResizeDetector} from 'react-resize-detector';
import Select from 'react-select';

interface GeneralSidePanelProps {
    updateSelectedNumCols: (s: string[]) => void;
    updateSelectedCatCols: (s: string[]) => void;
    selectedCatCols: string[];
    selectedNumCols: string[];
    setCurrentVis: (s: ESupportedPlotlyVis) => void;
    currentVis: ESupportedPlotlyVis;
    columns: (NumericalColumn | CategoricalColumn) [];
    dropdowns: GenericOption[];
    filterCallback: (s: string) => void;
}

export function GeneralSidePanel(props: GeneralSidePanelProps) {
    const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);

    // GOTTA BE A BETTER WAY
    const onResize = useCallback(() => {
        if(document.getElementById('plotlyDiv')) {
            Plotly.relayout('plotlyDiv', {
                autosize: true,
                transition: {
                    duration: 1000,
                    easing: 'cubic-in'
                }
            });
        }
    }, []);

    const { ref } = useResizeDetector({ onResize });

    const selectNumOptions = useMemo(() => {
        return props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL).map((c) => {
            return {
                value: c.name,
                label: c.name
            };
        });
    }, [props.columns.length]);

    const selectCatOptions = useMemo(() => {
        return props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => {
            return {
                value: c.name,
                label: c.name
            };
        });
    }, [props.columns.length]);

    return (
        <div ref={ref} className="position-relative h-100 flex-shrink-1 bg-light">
            <button className="btn btn-primary-outline" type="button" data-bs-toggle="collapse" data-bs-target="#generalVisBurgerMenu" aria-expanded="true" aria-controls="generalVisBurgerMenu">
                <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="collapse show collapse-horizontal" id="generalVisBurgerMenu">
                <div className="container" style={{width: '20rem'}}>
                    <div className="row" id="home" role="tabpanel" aria-labelledby="home-tab">
                        <label className="px-2 pt-2">Correlations</label>
                        <div className="btn-group w-100 px-2 pt-1" role="group" aria-label="Basic checkbox toggle button group">

                            {correlationTypes.map((d) => {
                                return (
                                    <React.Fragment key={`correlationLabel${d}`}>
                                        <input checked={props.currentVis === d} onChange={(e) => props.setCurrentVis(e.currentTarget.value as ESupportedPlotlyVis)} value={d} type="checkbox" className="btn-check" id={`btnCheck${d}`} autoComplete="off"/>
                                        <label className="btn btn-outline-primary" htmlFor={`btnCheck${d}`}>{d}</label>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                    <div className="row" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                        <label className="px-2 pt-2">Comparisons</label>

                        <div className="btn-group w-100 px-2 pt-1" role="group" aria-label="Basic checkbox toggle button group">
                                {comparisonTypes.map((d) => {
                                    return (
                                        <React.Fragment key={`correlationLabel${d}`}>
                                            <input checked={props.currentVis === d} onChange={(e) => props.setCurrentVis(e.currentTarget.value as ESupportedPlotlyVis)} value={d} type="checkbox" className="btn-check" id={`btnCheck${d}`} autoComplete="off"/>
                                            <label className="btn btn-outline-primary" htmlFor={`btnCheck${d}`}>{d}</label>
                                        </React.Fragment>
                                    );
                            })}
                        </div>
                    </div>
                    <div className="row" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                        <label className="px-2 pt-2">Distributions</label>

                        <div className="btn-group w-100 px-2 pt-1" role="group" aria-label="Basic checkbox toggle button group">
                                {distributionTypes.map((d) => {
                                    return (
                                        <React.Fragment key={`correlationLabel${d}`}>
                                            <input checked={props.currentVis === d} onChange={(e) => props.setCurrentVis(e.currentTarget.value as ESupportedPlotlyVis)} value={d} type="checkbox" className="btn-check" id={`btnCheck${d}`} autoComplete="off"/>
                                            <label className="btn btn-outline-primary" htmlFor={`btnCheck${d}`}>{d}</label>
                                        </React.Fragment>
                                    );
                            })}
                        </div>
                    </div>
                    <div className="row" id="contact" role="tabpanel" aria-labelledby="contact-tab">
                        <label className="px-2 pt-2">High Dimensional</label>

                        <div className="btn-group w-100 px-2 pt-1 pb-2" role="group" aria-label="Basic checkbox toggle button group">
                                {highDimensionalTypes.map((d) => {
                                    return (
                                        <React.Fragment key={`correlationLabel${d}`}>
                                            <input checked={props.currentVis === d} onChange={(e) => props.setCurrentVis(e.currentTarget.value as ESupportedPlotlyVis)} value={d} type="checkbox" className="btn-check" id={`btnCheck${d}`} autoComplete="off"/>
                                            <label className="btn btn-outline-primary" htmlFor={`btnCheck${d}`}>{d}</label>
                                        </React.Fragment>
                                    );
                            })}
                        </div>
                    </div>
                    <hr></hr>
                    <label className="pt-2 pb-1">Numerical Columns</label>
                    <Select
                        closeMenuOnSelect={false}
                        isMulti
                        onChange={(e) => props.updateSelectedNumCols(e.map((c) => c.value))}
                        name="numColumns"
                        options={selectNumOptions}
                        value={selectNumOptions.filter((c) => props.selectedNumCols.includes(c.value))}
                    />
                    <label className="pt-2 pb-1">Categorical Columns</label>
                    <Select
                        closeMenuOnSelect={false}
                        isMulti
                        onChange={(e) => props.updateSelectedCatCols(e.map((c) => c.value))}
                        name="catColumns"
                        options={selectCatOptions}
                        value={selectCatOptions.filter((c) => props.selectedCatCols.includes(c.value))}
                    />
                    <hr/>

                    <div>
                        <button className="btn btn-primary-outline w-100" id="advancedButton" onClick={(e) => setAdvancedOpen(!advancedOpen)} type="button" data-bs-toggle="collapse" data-bs-target="#advancedOptions" aria-expanded="false" aria-controls="advancedOptions">
                            <label className="pb-1 pe-2">Advanced</label>
                            <FontAwesomeIcon icon={advancedOpen? faCaretUp : faCaretDown} />
                        </button>
                        <div className="collapse" id="advancedOptions">

                        {props.dropdowns.filter((d) => d.type === EGeneralFormType.DROPDOWN).map((d, i) => {
                        return (
                            <React.Fragment key={`reactSelect${d.name}`}>
                                <label className="pt-2 pb-1">{d.name}</label>
                                <Select
                                    isClearable
                                    onChange={(e) => d.callback(e ? e.value : '')}
                                    name={d.name}
                                    options={d.options.map((s) => {
                                        return {
                                            value: s,
                                            label: s
                                        };
                                    })}
                                    value={d.currentColumn ? {label: d.currentColumn.name, value: d.currentColumn.name} : []}
                                />
                            </React.Fragment>
                        );
                        })}

                        {props.dropdowns.filter((d) => d.type === EGeneralFormType.BUTTON).map((d, i) => {
                            return (
                                <div key={`dropdownDiv${d.name}`} className="btn-group w-100 px-2 pt-3" role="group" aria-label="Basic outlined example">
                                    {d.options.map(((opt) => {
                                        return (
                                            <React.Fragment key={`radioButtons${d.name + opt}`}>
                                                <input checked={d.currentSelected === opt} onChange={(e) => d.callback(e.currentTarget.value)} value={opt} type="checkbox" className="btn-check" id={`btnCheck${opt}`} autoComplete="off"/>
                                                <label style={{zIndex: 0}} className={`btn btn-outline-primary w-100 ${d.disabled ? 'disabled' : ''}`} htmlFor={`btnCheck${opt}`}>{opt}</label>
                                            </React.Fragment>
                                        );
                                    }))}
                                </div>
                            );
                        })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
