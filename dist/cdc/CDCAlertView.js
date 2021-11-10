import get from 'lodash.get';
import React from 'react';
import Select from 'react-select';
import { runAlert } from '.';
import { confirmAlertById, deleteAlert, editAlert, saveAlert } from './api';
import { CDCFilterComponent } from './CDCFilterComponent';
export function CDCAlertView({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, onAlertChanged, selectedAlert, cdcs, compareColumnOptions, setCreationMode, creationMode }) {
    var _a, _b;
    const [editMode, setEditMode] = React.useState(false);
    const [deleteMode, setDeleteMode] = React.useState(false);
    const [validName, setValidName] = React.useState(true);
    const [validFilter, setValidFilter] = React.useState(true);
    React.useEffect(() => {
        setEditMode(false);
        setDeleteMode(false);
    }, [selectedAlert]);
    React.useEffect(() => {
        setValidFilter((filter === null || filter === void 0 ? void 0 : filter.children.length) > 0);
    }, [filter]);
    React.useEffect(() => {
        var _a;
        setValidName(((_a = alertData === null || alertData === void 0 ? void 0 : alertData.name) === null || _a === void 0 ? void 0 : _a.trim().length) > 0);
    }, [alertData.name]);
    const confirmChanges = async (id) => {
        const alert = await confirmAlertById(id);
        onAlertChanged(alert.id);
    };
    const onCreateSave = async () => {
        if (validFilter && validName) {
            const newAlert = await saveAlert({ ...alertData, filter })
                .then((alert) => {
                return runAlert(alert.id).then((a) => {
                    return a ? a : alert;
                });
            });
            onAlertChanged(newAlert.id);
            setCreationMode(false);
        }
    };
    const onEditSave = async () => {
        if (validFilter && validName) {
            const newAlert = await editAlert(selectedAlert.id, { ...alertData, filter })
                .then((alert) => {
                return runAlert(alert.id).then((a) => {
                    return a ? a : alert;
                });
            });
            onAlertChanged(newAlert.id);
            setEditMode(false);
        }
    };
    const onDiscard = () => {
        setEditMode(false);
        setAlertData(selectedAlert);
        setFilter(selectedAlert.filter);
    };
    const onDelete = async (id) => {
        setEditMode(false);
        await deleteAlert(id);
        onAlertChanged();
    };
    const literature = () => {
        var _a, _b, _c, _d, _e, _f;
        if (selectedAlert.latest_diff) {
            const change = new Map();
            (_b = (_a = selectedAlert.latest_diff) === null || _a === void 0 ? void 0 : _a.values_changed) === null || _b === void 0 ? void 0 : _b.map((d) => {
                const nestedField = d.field.map((f) => f).join(".");
                if (change.has(d.id)) {
                    change.set(d.id, change.get(d.id).set(nestedField, { old: d.old_value, new: d.new_value }));
                }
                else {
                    change.set(d.id, new Map().set(nestedField, { old: d.old_value, new: d.new_value }));
                }
            });
            return (React.createElement(React.Fragment, null,
                React.createElement("h6", null, "Changed data:"),
                React.createElement("table", { className: "table table-light mt-2" },
                    React.createElement("thead", null,
                        React.createElement("tr", null, (_c = selectedAlert.compare_columns) === null || _c === void 0 ? void 0 : _c.map((field, i) => React.createElement("th", { key: `header-${i}`, scope: "col" }, field)))),
                    React.createElement("tbody", null, (_d = selectedAlert.latest_diff.dictionary_item_added) === null || _d === void 0 ? void 0 :
                        _d.map((d) => {
                            var _a;
                            const data = selectedAlert.latest_fetched_data.find(a => a.id === d);
                            return (React.createElement("tr", { key: d, className: "table-success" }, (_a = selectedAlert.compare_columns) === null || _a === void 0 ? void 0 : _a.map((field, i) => React.createElement("td", { key: `added-${i}` }, get(data, field)))));
                        }), (_e = selectedAlert.latest_diff.dictionary_item_removed) === null || _e === void 0 ? void 0 :
                        _e.map((d) => {
                            var _a;
                            const data = selectedAlert.confirmed_data.find(a => a.id === d);
                            return (React.createElement("tr", { key: d, className: "table-danger" }, (_a = selectedAlert.compare_columns) === null || _a === void 0 ? void 0 : _a.map((field, i) => React.createElement("td", { key: `removed-${i}` }, get(data, field)))));
                        }), (_f = [...change.keys()]) === null || _f === void 0 ? void 0 :
                        _f.map((id, i) => {
                            var _a, _b;
                            const oldData = (_a = selectedAlert.confirmed_data) === null || _a === void 0 ? void 0 : _a.find(a => a.id === id);
                            return (React.createElement("tr", { key: `tr-changed-${i}`, className: "table-primary" }, (_b = selectedAlert.compare_columns) === null || _b === void 0 ? void 0 : _b.map((field, index) => change.get(id).has(field) ? React.createElement("td", { key: `changed-${i}-${index}` },
                                React.createElement("s", null, change.get(id).get(field).old),
                                " ",
                                change.get(id).get(field).new) : React.createElement("td", { key: `changed-${i}-${index}` }, get(oldData, field)))));
                        }))),
                React.createElement("div", { className: "d-md-flex justify-content-md-end" },
                    React.createElement("button", { title: "Confirm changes", className: "btn btn-primary", onClick: () => confirmChanges(selectedAlert.id) }, "Confirm"))));
        }
        return React.createElement("p", null, "No new data available");
    };
    const editButton = !editMode && !deleteMode && !creationMode ? (React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Edit Alert", className: "btn btn-text-secondary", onClick: () => setEditMode(true) },
            React.createElement("i", { className: "fas fa-pencil-alt" })),
        React.createElement("button", { title: "Delete Alert", className: "btn btn-text-secondary", onClick: () => setDeleteMode(true) },
            React.createElement("i", { className: "fas fa-trash" })))) : (editMode || creationMode ? React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Save changes", className: "btn btn-text-secondary", onClick: editMode ? () => onEditSave() : () => onCreateSave() },
            React.createElement("i", { className: "fas fa-save" })),
        React.createElement("button", { title: "Discard changes", className: "btn btn-text-secondary ms-1", onClick: editMode ? () => onDiscard() : () => setCreationMode(false) },
            React.createElement("i", { className: "fas fa-times" }))) : React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Delete", className: "btn btn-text-secondary", onClick: () => onDelete(selectedAlert.id) },
            React.createElement("i", { className: "fas fa-check" })),
        React.createElement("button", { title: "No Delete", className: "btn btn-text-secondary ms-1", onClick: () => setDeleteMode(false) },
            React.createElement("i", { className: "fas fa-times" }))));
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "d-flex w-100 justify-content-between mb-1" },
            React.createElement("h5", null, "Your options"),
            React.createElement("small", null, editButton)),
        React.createElement("div", { className: "accordion", id: "editAlert" },
            !editMode && !creationMode ?
                React.createElement("div", { key: "one", className: "accordion-item" },
                    React.createElement("h2", { className: "accordion-header", id: "heading-one" },
                        React.createElement("button", { className: "accordion-button", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#collapse-one", "aria-expanded": "true", "aria-controls": "collapse-one" }, `${selectedAlert.latest_diff ? 'Latest revision from: ' + ((_a = new Date(selectedAlert.latest_compare_date)) === null || _a === void 0 ? void 0 : _a.toLocaleDateString()) : 'No new data'}`)),
                    React.createElement("div", { id: "collapse-one", className: "p-4 accordion-collapse collapse show", "aria-labelledby": "heading-one", "data-bs-parent": "#editAlert" }, literature()))
                : null,
            React.createElement("div", { key: "two", className: "accordion-item" },
                React.createElement("h2", { className: "accordion-header", id: "heading-two" },
                    React.createElement("button", { className: "accordion-button", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#collapse-two", "aria-expanded": "true", "aria-controls": "collapse-two" }, "Alert overview")),
                React.createElement("div", { id: "collapse-two", className: `p-4 accordion-collapse collapse${editMode || creationMode ? ' show' : ''}`, "aria-labelledby": "heading-two", "data-bs-parent": "#editAlert" },
                    React.createElement("div", { className: "row mb-3" },
                        React.createElement("div", { className: "mb-3 col" },
                            React.createElement("label", { className: "form-label" }, "Name"),
                            !creationMode && !editMode ?
                                React.createElement("h6", null, alertData.name)
                                :
                                    React.createElement(React.Fragment, null,
                                        React.createElement("input", { type: "text", className: `form-control${validName ? '' : ' is-invalid'}`, value: alertData.name, onChange: (e) => setAlertData({ ...alertData, name: e.target.value }), required: true }),
                                        validName ? null :
                                            React.createElement("div", { className: "invalid-feedback" }, "Name must not be empty!"))),
                        React.createElement("div", { className: "mb-3 col pe-2" },
                            React.createElement("label", { className: "form-label" }, "CDC"),
                            React.createElement(Select, { isDisabled: !creationMode && !editMode, options: cdcs.map((c) => { return { label: c, value: c }; }), value: { label: alertData.cdc_id, value: alertData.cdc_id }, onChange: (e) => setAlertData({ ...alertData, cdc_id: e.value }) })),
                        React.createElement("div", { className: "mb-3 col pe-2" },
                            React.createElement("label", { className: "form-label" }, "Change Fields"),
                            React.createElement(Select, { isMulti: true, isDisabled: !creationMode && !editMode, closeMenuOnSelect: false, options: compareColumnOptions.map((col) => { return { label: col, value: col }; }), value: (_b = alertData.compare_columns) === null || _b === void 0 ? void 0 : _b.map((col) => { return { label: col, value: col }; }), onChange: (e) => setAlertData({ ...alertData, compare_columns: [...e.map((col) => col.value)] }) })),
                        React.createElement("div", { className: "mb-3 col" },
                            React.createElement("label", { className: "form-label" }, "Email notification"),
                            React.createElement("div", { className: "form-check" },
                                React.createElement("input", { className: "form-check-input", type: "checkbox", disabled: true, checked: alertData.enable_mail_notification, onChange: (e) => setAlertData({ ...alertData, enable_mail_notification: e.target.checked }) }),
                                React.createElement("label", { className: "form-check-label ms-2" }, "Send me an email")))),
                    React.createElement("div", null, filterSelection || !filter ?
                        React.createElement(CDCFilterComponent, { filterSelection: !creationMode && !editMode ? null : filterSelection, filterComponents: filterComponents, filter: filter, setFilter: setFilter, isInvalid: !validFilter })
                        :
                            React.createElement("p", null, "No filters available for this cdc")))))));
}
/*
const generalInformation =
  <>
    <div className="row mb-3">
      <div className="mb-3 col">
        <label className="form-label">Name</label>
        {!editMode ?
          <h6>{alertData.name}</h6>
          :
          <><input type="text" className={`form-control${validName ? '' : ' is-invalid'}`} value={alertData.name} onChange={(e) => setAlertData({...alertData, name: e.target.value})} />
            {validName ? null :
              <div className="invalid-feedback">
                Name must not be empty!
              </div>}</>
        }
      </div>
      <div className="mb-3 col pe-2">
        <label className="form-label">CDC</label>
        <Select
          isDisabled={!editMode}
          options={cdcs.map((c) => {return {label: c, value: c};})}
          value={{label: alertData.cdc_id, value: alertData.cdc_id}}
          onChange={(e) => setAlertData({...alertData, cdc_id: e.value})}
        />
      </div>
      <div className="mb-3 col pe-2">
        <label className="form-label">Change Fields</label>
        <Select
          isDisabled={!editMode}
          isMulti
          closeMenuOnSelect={false}
          options={compareColumnOptions}
          value={alertData.compare_columns}
          onChange={(e) => setAlertData({...alertData, compare_columns: [...e]})}
        />
      </div>
      <div className="mb-3 col">
        <label className="form-label">Email notification</label>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" disabled={!editMode} checked={alertData.enable_mail_notification} onChange={(e) => setAlertData({...alertData, enable_mail_notification: e.target.checked})} />
          <label className="form-check-label ms-2">Send me an email</label>
        </div>
      </div>
    </div>
    <div>
      {filterSelection || !filter ?
        <CDCFilterComponent filterSelection={!editMode ? null : filterSelection} filterComponents={filterComponents} filter={filter} setFilter={setFilter} disableFilter={!editMode} isInvalid={!validFilter} />
        :
        <p>No filters available for this cdc</p>}
    </div>
  </>;


const alertInformation =
<>
<div className="row mb-3">
  <div className="mb-3 col">
    <label className="form-label">Name</label>
      <h6>{alertData.name}</h6>
  </div>
  <div className="mb-3 col pe-2">
    <label className="form-label">CDC</label>
    <Select
      isDisabled={true}
      value={{label: alertData.cdc_id, value: alertData.cdc_id}}
    />
  </div>
  <div className="mb-3 col pe-2">
    <label className="form-label">Change Fields</label>
    <Select
      isDisabled={true}
      isMulti
      value={alertData.compare_columns}
    />
  </div>
  <div className="mb-3 col">
    <label className="form-label">Email notification</label>
    <div className="form-check">
      <input className="form-check-input" type="checkbox" disabled={true} checked={alertData.enable_mail_notification} />
      <label className="form-check-label ms-2">Send me an email</label>
    </div>
  </div>
</div>
<div>
  {filterSelection || !filter ?
    <CDCFilterComponent  filterComponents={filterComponents} filter={filter} setFilter={setFilter} />
    :
    <p>No filters available for this cdc</p>}
</div>
</>;

const onCreateSave = async () => {
  if (validFilter && validName) {
    const newAlert = await saveAlert({...alertData, filter})
      .then((alert) => {
        return runAlert(alert.id).then((a) => {
          return a ? a : alert;
        });
      });
    onAlertChanged(newAlert.id);
    setCreationMode(false);
  }
};

  const onEditSave = async () => {
  if (validFilter && validName) {
    const newAlert = await editAlert(selectedAlert.id, {...alertData, filter})
      .then((alert) => {
        return runAlert(alert.id).then((a) => {
          return a ? a : alert;
        });
      });
    onAlertChanged(newAlert.id);
    setEditMode(false);
  }
};

const alterAlert =
<>
  <div className="card p-3">
    <div className="row mb-3">
      <div className="mb-3 col">
        <label className="form-label">Name</label>
        <input type="text" className={`form-control${validName ? '' : ' is-invalid'}`} value={alertData.name} onChange={(e) => setAlertData({...alertData, name: e.target.value})} required />
        {validName ? null :
          <div className="invalid-feedback">
            Name must not be empty!
          </div>}
      </div>
      <div className="mb-3 col">
        <label className="form-label">CDC</label>
        <Select
          options={cdcs.map((c) => {return {label: c, value: c};})}
          value={{label: alertData.cdc_id, value: alertData.cdc_id}}
          onChange={(e) => setAlertData({...alertData, cdc_id: e.value})}
        />
      </div>
      <div className="mb-3 col">
        <label className="form-label">Change Fields</label>
        <Select
          isMulti
          closeMenuOnSelect={false}
          options={compareColumnOptions}
          value={alertData.compare_columns}
          onChange={(e) => setAlertData({...alertData, compare_columns: [...e]})}
        />
      </div>
      <div className="mb-3 col">
        <label className="form-label">Email notification</label>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" checked={alertData.enable_mail_notification} onChange={(e) => setAlertData({...alertData, enable_mail_notification: e.target.checked})} />
          <label className="form-check-label ms-2">Send me an email</label>
        </div>
      </div>
    </div>
    <div>
      {filterSelection || !filter ?
        <CDCFilterComponent filterSelection={filterSelection} filterComponents={filterComponents} filter={filter} setFilter={setFilter} isInvalid={!validFilter} />
        :
        <p>No filters available for this cdc</p>
      }
    </div>
  </div>
</>;

*/
//# sourceMappingURL=CDCAlertView.js.map