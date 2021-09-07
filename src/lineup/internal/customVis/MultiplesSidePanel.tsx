import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import {CategoricalColumn, correlationTypes, distributionTypes, highDimensionalTypes, NumericalColumn, supportedPlotlyVis} from './CustomVis';
import Plotly from 'plotly.js';
import {useCallback, useState} from 'react';
import {useResizeDetector} from 'react-resize-detector';
import Select from 'react-select';

interface MultiplesSidePanelProps {
    chartTypeChangeCallback: (s: string) => void;
    updateSelectedNumCols: (s: string[]) => void;
    updateSelectedCatCols: (s: string[]) => void;
    selectedCatCols: string[];
    selectedNumCols: string[];
    setCurrentVis: (s: supportedPlotlyVis) => void;
    currentVis: supportedPlotlyVis;
    currentType: supportedPlotlyVis;
    columns: (NumericalColumn | CategoricalColumn) [];
    dropdowns: GenericSelect[];
    filterCallback: (s: string) => void;
}

type GenericSelect = {
    name: string;
    currentSelected: string;
    options: string[]
    callback: (s: string) => void
};

export function MultiplesSidePanel(props: MultiplesSidePanelProps) {
    const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);

    const onResize = useCallback(() => {
        // window.dispatchEvent(new Event('resize'));

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

    const selectNumOptions = props.columns.filter((c) => c.type === 'number').map((c) => {
        return {
            value: c.name,
            label: c.name
        };
    });

    const selectCatOptions = props.columns.filter((c) => c.type === 'categorical').map((c) => {
        return {
            value: c.name,
            label: c.name
        };
    });

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
                                        <input checked={props.currentVis === d} onChange={(e) => props.setCurrentVis(e.currentTarget.value as supportedPlotlyVis)} value={d} type="checkbox" className="btn-check" id={`btnCheck${d}`} autoComplete="off"/>
                                        <label className="btn btn-outline-primary" htmlFor={`btnCheck${d}`}>{d}</label>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                    <div className="row" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                        <label className="px-2 pt-2">Comparisons</label>

                        <div className="btn-group w-100 px-2 pt-1" role="group" aria-label="Basic checkbox toggle button group">
                                {distributionTypes.map((d) => {
                                    return (
                                        <React.Fragment key={`correlationLabel${d}`}>
                                            <input checked={props.currentVis === d} onChange={(e) => props.setCurrentVis(e.currentTarget.value as supportedPlotlyVis)} value={d} type="checkbox" className="btn-check" id={`btnCheck${d}`} autoComplete="off"/>
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
                                            <input checked={props.currentVis === d} onChange={(e) => props.setCurrentVis(e.currentTarget.value as supportedPlotlyVis)} value={d} type="checkbox" className="btn-check" id={`btnCheck${d}`} autoComplete="off"/>
                                            <label className="btn btn-outline-primary" htmlFor={`btnCheck${d}`}>{d}</label>
                                        </React.Fragment>
                                    );
                            })}
                        </div>
                    </div>
                    <hr></hr>
                    <label className="pt-2 pb-1">Numerical Columns</label>
                    <Select
                        isMulti
                        onChange={(e) => props.updateSelectedNumCols(e.map((c) => c.value))}
                        name="numColumns"
                        options={selectNumOptions}
                        value={selectNumOptions.filter((c) => props.selectedNumCols.includes(c.value))}
                    />
                    <label className="pt-2 pb-1">Categorical Columns</label>
                    <Select
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

                        {props.dropdowns.map((d, i) => {
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
                                    value={d.currentSelected ? {label: d.currentSelected, value: d.currentSelected} : []}
                                />
                            </React.Fragment>
                        );
                        })}

                            <div className="btn-group w-100 px-2 pt-3" role="group" aria-label="Basic outlined example">
                                <button onClick={(e) => props.filterCallback('in')} type="button" className="btn btn-outline-primary">Filter In</button>
                                <button onClick={(e) => props.filterCallback('out')} type="button" className="btn btn-outline-primary">Filter Out</button>
                            </div>

                            <div className="btn-group w-100 px-2 pt-3" role="group" aria-label="Basic outlined example">
                                <button onClick={(e) => props.filterCallback('clear')} type="button" className="btn btn-outline-primary">Clear Filters</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
