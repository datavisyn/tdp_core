import {get} from "lodash";
import React, {useEffect} from "react";
import {useAsync} from "../../hooks";
import {confirmAlertById} from "../api";
import {ErrorMessage} from "../common/ErrorMessage";
import {IAlert} from "../interfaces";

interface ICDCDataChangeTable {
  selectedAlert: IAlert;
  onAlertChanged: (id?: number) => void;
}

export function CDCDataChangeTable({selectedAlert, onAlertChanged}: ICDCDataChangeTable) {
  const [dataChange, setDataChange] = React.useState<Map<string, Map<string, {old: string, new: string}>>>(new Map());

  useEffect(() => {
    if (selectedAlert?.latest_diff?.values_changed) {
      const change: Map<string, Map<string, {old: string, new: string}>> = new Map();
      selectedAlert.latest_diff?.values_changed?.map((d) => {
        const nestedField = d.field.map((f) => f).join('.');
        if (change.has(d.id)) {
          change.set(d.id, change.get(d.id).set(nestedField, {old: d.old_value, new: d.new_value}));
        } else {
          change.set(d.id, new Map<string, {old: string, new: string}>().set(nestedField, {old: d.old_value, new: d.new_value}));
        }
      });
      setDataChange(change);
    } else {
      setDataChange(new Map());
    }
  }, [selectedAlert]);

  const {status: confirmStatus, error: confirmError, execute: doConfirm} = useAsync(async () => {
    const alert = await confirmAlertById(selectedAlert.id);
    onAlertChanged(alert.id);
  }, false);

  //loading icon when loading

  return (<>
    {selectedAlert.latest_diff || selectedAlert.confirmed_data ? (<>
      <table className="table mb-0">
        <thead>
          <tr>
            <th scope="col">ID</th>
            {selectedAlert.compare_columns.map((field, i) => <th key={field} scope="col">{field}</th>)}
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody style={{maxHeight: 600, overflow: 'auto'}}>
          {selectedAlert.latest_diff ? <>
            {selectedAlert.latest_diff?.dictionary_item_added?.map((d) => {
              const data = selectedAlert.latest_fetched_data.find((a) => a._cdc_compare_id === d);
              return (<tr key={d} className="table-success">
                <td scope="row">{data._cdc_compare_id}</td>
                {selectedAlert.compare_columns.map((field, i) => <td key={field}>{get(data, field)}</td>)}
                <td>Added</td>
              </tr>);
            })}
            {selectedAlert.latest_diff?.dictionary_item_removed?.map((d) => {
              const data = selectedAlert.confirmed_data.find((a) => a._cdc_compare_id === d);
              return (<tr key={d} className="table-danger">
                <td scope="row">{data._cdc_compare_id}</td>
                {selectedAlert.compare_columns.map((field, i) => <td key={field}>{get(data, field)}</td>)}
                <td>Removed</td>
              </tr>);
            })}
          </> : null}
          {selectedAlert.confirmed_data ? <>
            {selectedAlert.confirmed_data
              // Only show entries which are not already shown above
              .filter((item) => !selectedAlert.latest_diff?.dictionary_item_added?.includes(item._cdc_compare_id) && !selectedAlert.latest_diff?.dictionary_item_removed?.includes(item._cdc_compare_id))
              // Sort such that rows with changes are on top
              .sort((a, b) => (dataChange.has(b._cdc_compare_id) ? 1 : 0) - (dataChange.has(a._cdc_compare_id) ? 1 : 0)).map((d) => {
                const id = d._cdc_compare_id;
                const hasChanged = dataChange.has(id);
                // TODO: All these .find() and .includes() should be refactored as they are O(n).
                const isAlreadyHandled = selectedAlert.latest_diff?.dictionary_item_added?.includes(id) || selectedAlert.latest_diff?.dictionary_item_removed?.includes(id);
                return (isAlreadyHandled ? null :
                  <tr key={id} className={`${hasChanged ? 'table-primary' : ''}`}>
                    <td scope="row">{d._cdc_compare_id}</td>
                    {selectedAlert.compare_columns.map((field) => (
                      <React.Fragment key={field}>
                        {hasChanged ? (
                          dataChange.get(id).has(field) ? (<td><s>{dataChange.get(id).get(field).old}</s> {dataChange.get(id).get(field).new}</td>) : (<td>{get(d, field)}</td>)
                        ) : (
                          <td key={field}>{get(d, field)}</td>
                        )}
                      </React.Fragment>
                    ))}
                    <td>{hasChanged ? <>Changed</> : null}</td>
                  </tr>
                );
              })}
          </> : null}
        </tbody>
      </table>
      {selectedAlert.latest_diff ? <div className="p-1">
        <ErrorMessage error={confirmError} onRetry={() => doConfirm()} />
        <div className="d-md-flex justify-content-md-end">
          <button disabled={confirmStatus === 'pending'} title="Confirm changes" className="btn btn-primary" onClick={() => doConfirm()}>Confirm</button>
        </div>
      </div> : null}
    </>) : <p>No new data available</p>}
  </>);
}
