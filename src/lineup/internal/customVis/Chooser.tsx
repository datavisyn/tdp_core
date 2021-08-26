import * as React from 'react';

interface ChooserProps {
    dropdownNames: string[]
    updateChartType: (s: string) => void;
}
  
export function Chooser(props: ChooserProps){
    return (
        <div className="position-relative h-100 bg-light">
            <div className="container" style={{width: "15em"}}>
                <div className="form-group row pt-2 pb-4 pe-3 ps-3">
                    <label className="fw-light px-0 pb-1 form-label fs-6">Chart Type</label>
                    <select className="form-select text-muted" aria-label="Default select example" onChange={evt => props.updateChartType(evt.currentTarget.value)}>
                        <option value={"None"}>None</option>
                        {props.dropdownNames.map(c => {
                                return <option value={c} key={c}>{c}</option>
                            })}
                    </select>
                </div>
            </div>
        </div>
    );
}