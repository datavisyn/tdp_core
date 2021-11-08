import * as React from 'react';
import ReactDOM from 'react-dom';
import {BSModal, useAsync} from '../hooks';
import {IAlert, IFilter, IFilterComponent, IUploadAlert} from './interface';
import {getAlerts, runAlertById} from './api';
import {CDCGroupingFilterId, CDCGroupingFilter, createCDCGroupingFilter} from './CDCGroupingFilter';
import {v4 as uuidv4} from 'uuid';
import {CDCTextFilter, CDCTextFilterId, createCDCTextFilter} from './CDCTextFilter';
import {CDCCheckboxFilter, CDCCheckboxFilterId, createCDCCheckboxFilter} from './CDCCheckboxFilter';
import {CDCRangeFilter, CDCRangeFilterId, createCDCRangeFilter} from './CDCRangeFilter';
import {CDCCreateAlert} from './CDCCreateAlert';
import {CDCEditAlert} from './CDCEditAlert';

interface ICDCFilterDialogProps {
  filterComponents: {[key: string]: IFilterComponent<any>};
  filtersByCDC: {[cdcId: string]: IFilter<any>[]};
}

export const DEFAULTALERTDATA: IUploadAlert = {name: '', enable_mail_notification: false, cdc_id: 'demo', filter_dump: null, filter_query: ''};
export const DEFAULTFILTER = {...createCDCGroupingFilter(uuidv4(), 'Drop filters here'), disableDragging: true, disableRemoving: true};

export const accordionItem = (index: number, title: string, parentId: string, child: JSX.Element, show?: boolean) => {
  parentId = parentId.trim();
  return (
    <div key={index} className="accordion-item">
      <h2 className="accordion-header" id={`heading${index}`}>
        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`} aria-expanded="true" aria-controls={`collapse${index}`}>
          {title}
        </button>
      </h2>
      <div id={`collapse${index}`} className={`p-4 accordion-collapse collapse${show ? ' show' : ''}`} aria-labelledby={`heading${index}`} data-bs-parent={`#${parentId}`}>
        {child}
      </div>
    </div>
  );
};

export const runAlert = async (id: number): Promise<IAlert> => {
  const runAlert = runAlertById(id).then((alert) => {return alert}).catch((e) => {
    alert(`${e}: Invalid filter parameter in alert: ${id}`);
    return null;
  });
  return runAlert;
};

export function CDCFilterDialog({filterComponents, filtersByCDC}: ICDCFilterDialogProps) {
  const [selectedAlert, setSelectedAlert] = React.useState<IAlert>();
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [creationMode, setCreationMode] = React.useState<boolean>(false);
  const [filter, setFilter] = React.useState<IFilter>();
  const [alertData, setAlertData] = React.useState<IUploadAlert>();
  const [cdcs, setCdcs] = React.useState<string[]>();
  const {status: alertStatus, error: alertError, execute: fetchAlerts, value: alerts} = useAsync(getAlerts, true);

  React.useEffect(() => {
    setAlertData(DEFAULTALERTDATA);
    setFilter(DEFAULTFILTER);
    setCdcs(['demo']);
  }, []);

  const onCreateButtonClick = () => {
    setCreationMode(true);
    setSelectedAlert(null);
    setAlertData(DEFAULTALERTDATA);
    setFilter(DEFAULTFILTER);
  };

  const onAlertClick = async (alert: IAlert) => {
    setAlertData(alert);
    setFilter(alert.filter_dump);
    setCreationMode(false);
    setSelectedAlert(alert);
  };

  const onAlertChanged = async (id?: number) => {
    //refetches alerts and makes new selection
    fetchAlerts().then((alerts) => {
      //if no id there is no need to iterate through alerts
      if (!id) {
        setSelectedAlert(null);
      } else {
        setSelectedAlert(alerts.find((alert) => alert.id === id));
      }
    }).catch((e) => console.error(e));
  };

  return <>
    <a style={{color: 'white', cursor: 'pointer'}} onClick={() => setShowDialog(true)}><i className="fas fa-filter" style={{marginRight: 4}}></i> Alert Filter</a>
    <BSModal show={showDialog} setShow={setShowDialog}>
      <div className="modal fade" tabIndex={-1}>
        <div className="modal-dialog" style={{maxWidth: '90%'}}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Alerts</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-3 overflow-auto">
                  <div className="d-flex w-100 justify-content-between mb-1">
                    <h5>Your alerts</h5>
                    <small><button className="btn btn-text-secondary" onClick={() => onCreateButtonClick()}><i className="fas fa-plus"></i></button></small>
                  </div>
                  {alertStatus === 'pending' ? <>Loading...</> : null}
                  {alertStatus === 'error' ? <>Error {alertError.toString()}</> : null}
                  {alertStatus === 'success' ? <div className="list-group">{alerts.map((alert) =>
                    <div key={alert.id}><a href="#" className={`list-group-item list-group-item-action${selectedAlert?.id === alert?.id ? ' border-primary' : ''}`} onClick={() => onAlertClick(alert)} aria-current="true">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 title={`${alert.name} for ${alert.cdc_id}`} className="mb-1 overflow-hidden">{alert.name} <small className="text-muted">for {alert.cdc_id}</small></h6>
                        {alert?.latest_diff ? <small><i className="fas fa-circle text-primary"></i></small> : null}
                      </div>
                      <small>{!alert?.latest_diff && !alert.confirmed_data ? 'No data revision yet' : alert.latest_diff ? 'Pending data revision' : `Last confirmed: ${new Date(alert.confirmation_date)?.toLocaleDateString()}`}</small>
                    </a></div>
                  )}</div> : null}
                </div>
                <div className="col-9 overflow-auto">
                  {selectedAlert ?
                    <CDCEditAlert
                      alertData={alertData}
                      setAlertData={setAlertData}
                      filter={filter}
                      setFilter={setFilter}
                      filterSelection={filtersByCDC['demo']}
                      filterComponents={filterComponents}
                      onAlertChanged={onAlertChanged}
                      selectedAlert={selectedAlert}
                      cdcs={cdcs}
                    />
                    :
                    creationMode ?
                      <CDCCreateAlert
                        alertData={alertData}
                        setAlertData={setAlertData}
                        filter={filter}
                        setFilter={setFilter}
                        filterComponents={filterComponents}
                        filterSelection={filtersByCDC['demo']}
                        onAlertChanged={onAlertChanged}
                        setCreationMode={setCreationMode}
                        cdcs={cdcs}
                      />
                      : null
                  }
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" onClick={() => {
                Promise.all(alerts?.map((alert) => runAlert(alert.id))).then(() => onAlertChanged(selectedAlert.id));
              }} className="btn btn-secondary">Sync</button>
            </div>
          </div>
        </div>
      </div>
    </BSModal>
  </>;
}

export class CDCFilterDialogClass {
  private node: HTMLElement;

  constructor(parent: HTMLElement) {
    this.node = document.createElement('div');
    parent.appendChild(this.node);
    this.init();
  }

  private init() {
    ReactDOM.render(
      <CDCFilterDialog
        filterComponents={{
          [CDCGroupingFilterId]: CDCGroupingFilter,
          [CDCTextFilterId]: CDCTextFilter,
          [CDCCheckboxFilterId]: CDCCheckboxFilter,
          [CDCRangeFilterId]: CDCRangeFilter
        }}
        filtersByCDC={{
          'demo': [
            createCDCGroupingFilter(uuidv4(), 'Grouping Filter'),
            createCDCTextFilter(uuidv4(), 'Text Filter', {filter: [{field: null, value: []}], fields: [{field: {label: 'City', value: `item["address"]["city"]`}, options: [{label: 'Gwenborough', value: `"Gwenborough"`}, {label: 'Wisokyburgh', value: `"Wisokyburgh"`}, {label: 'McKenziehaven', value: `"McKenziehaven"`}, {label: 'Roscoeview', value: `"Roscoeview"`},  {label: 'Aliyaview', value: `"Aliyaview"`}, {label: 'Howemouth', value: `"Howemouth"`}]}, {field: {label: 'Zip Code', value: `item["address"]["zipcode"]`}, options: [{label: '33263', value: `"33263"`}, {label: '23505-1337', value: `"23505-1337"`}, {label: '58804-1099', value: `"58804-1099"`}]}, {field: {label: 'Name', value: `item["name"]`}, options: [{label: 'Leanne Graham', value: `"Leanne Graham"`}, {label: 'Ervin Howell', value: `"Ervin Howell"`}, {label: 'Glenna Reichert', value: `"Glenna Reichert"`}, {label: 'Clementina DuBuque', value: `"Clementina DuBuque"`}]}]}),
            createCDCCheckboxFilter(uuidv4(), 'Checkbox Filter', {fields: ['Eins', 'zwei', 'dRei'], filter: []}),
            createCDCRangeFilter(uuidv4(), 'Range Filter', {config: {minValue: 1, maxValue: 10, label: 'ID', field: `item["id"]`}, value: {min: 1, max: 10}}),
          ]
        }} />,
      this.node
    );
  }
}
