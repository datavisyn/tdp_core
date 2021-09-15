import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import {allVisTypes, CategoricalColumn, comparisonTypes, correlationTypes, distributionTypes, EColumnTypes, EGeneralFormType, ESupportedPlotlyVis, GenericOption, highDimensionalTypes, NumericalColumn} from '../types/generalTypes';
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
                    <label className="pt-2 pb-1">Visualization Type</label>
                    <Select
                        closeMenuOnSelect={true}
                        onChange={(e) => props.setCurrentVis(e.value)}
                        name="visTypes"
                        options={allVisTypes.map((t) => {
                            return {
                                value: t,
                                label: t
                            };
                        })}
                        value={{value: props.currentVis, label: props.currentVis}}
                    />
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
                                <div key={`buttonGroup${d.name}`} className="btn-group w-100 px-2 pt-3" role="group" aria-label="Basic outlined example">
                                    {d.options.map(((opt) => {
                                        return (
                                            <React.Fragment key={`radioButtons${d.name + opt}`}>
                                                <input checked={d.currentSelected === opt} onChange={(e) => d.callback(e.currentTarget.value)} value={opt} type="checkbox" className="btn-check" id={`formButton${opt}`} autoComplete="off"/>
                                                <label style={{zIndex: 0}} className={`btn btn-outline-primary w-100 ${d.disabled ? 'disabled' : ''}`} htmlFor={`formButton${opt}`}>{opt}</label>
                                            </React.Fragment>
                                        );
                                    }))}
                                </div>
                            );
                        })}

                        {props.dropdowns.filter((d) => d.type === EGeneralFormType.SLIDER).map((d, i) => {
                            return (
                                <div key={`sliderDiv${d.name}`} className="w-100 px-2 pt-3">
                                        <input type="range" onChange={(e) => d.callback(e.currentTarget.value)} className="form-range" min="=0" max="1" step=".1" id={`sliderInput${d.name}`}/>
                                        <label htmlFor={`sliderInput${d.name}`}  className={`form-label ${d.disabled ? 'disabled' : ''}`}>{d.name}</label>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
