import * as React from 'react';
import ReactDOM from 'react-dom';
import {BSModal, useAsync} from '../hooks';
import {IAlert, IFilter, IFilterComponent, IUploadAlert} from './interfaces';
import {getAlerts, runAlertById} from './api';
import {CDCGroupingFilterId, CDCGroupingFilter, createCDCGroupingFilter, CDCCheckboxFilter, CDCCheckboxFilterId, createCDCCheckboxFilter, CDCRangeFilter, CDCRangeFilterId, createCDCRangeFilter} from './filter';
import {v4 as uuidv4} from 'uuid';
import {CDCTextFilter, CDCTextFilterId, createCDCTextFilter} from './filter/CDCTextFilter';
import {CDCAlertView} from './alert/CDCAlertView';

interface ICDCFilterDialogProps {
  filterComponents: {[key: string]: {component: IFilterComponent<any>, config?: any}};
  filtersByCDC: {[cdcId: string]: IFilter<any>[]};
  compareColumnOptions: string[];
}

export const CDC_DEFAULT_ALERT_DATA: IUploadAlert = {name: '', enable_mail_notification: false, cdc_id: 'JSONPlaceholderUserCDC', filter: null, compare_columns: null};
export const CDC_DEFAULT_FILTER = {...createCDCGroupingFilter(uuidv4())};

export const runAlert = async (id: number): Promise<IAlert> => {
  return runAlertById(id).then((alert) => {return alert;}).catch((e) => {
    alert(`${e}: Invalid filter parameter in alert: ${id}`);
    return null;
  });
};

export function CDCFilterDialog({filterComponents, filtersByCDC, compareColumnOptions}: ICDCFilterDialogProps) {
  const [selectedAlert, setSelectedAlert] = React.useState<IAlert>();
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [creationMode, setCreationMode] = React.useState<boolean>(false);
  const [filter, setFilter] = React.useState<IFilter>();
  const [alertData, setAlertData] = React.useState<IUploadAlert>();
  const {status: alertStatus, error: alertError, execute: fetchAlerts, value: alerts} = useAsync(getAlerts, true);

  // TODO: CDCs are more complex than just filters, i.e. they also have fields.
  const cdcs = Object.keys(filtersByCDC);

  React.useEffect(() => {
    setAlertData(CDC_DEFAULT_ALERT_DATA);
    setFilter(CDC_DEFAULT_FILTER);
  }, []);

  const onCreateButtonClick = () => {
    setCreationMode(true);
    setSelectedAlert(null);
    setAlertData(CDC_DEFAULT_ALERT_DATA);
    setFilter(CDC_DEFAULT_FILTER);
  };

  const onAlertClick = async (alert: IAlert) => {
    setAlertData(alert);
    setFilter(alert.filter);
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
                  {selectedAlert || creationMode ?
                    <CDCAlertView
                      alertData={alertData}
                      setAlertData={setAlertData}
                      filter={filter}
                      setFilter={setFilter}
                      filterComponents={filterComponents}
                      filterSelection={filtersByCDC[alertData.cdc_id]}
                      onAlertChanged={onAlertChanged}
                      setCreationMode={setCreationMode}
                      selectedAlert={selectedAlert}
                      cdcs={cdcs}
                      compareColumnOptions={compareColumnOptions}
                      creationMode={creationMode}
                    />
                    : null
                  }
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" onClick={() => {
                Promise.all(alerts?.map((alert) => runAlert(alert?.id))).then(() => onAlertChanged(selectedAlert?.id));
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
//{id: .., filters: filter[], compareColumns: [], config: [id]: config} --> überschreibt die config einer bestimmten
  private init() {
    ReactDOM.render(
      <CDCFilterDialog
        filterComponents={{
          [CDCGroupingFilterId]: {component: CDCGroupingFilter},
          [CDCTextFilterId]: {component: CDCTextFilter, config: [{field: 'address.city', options: ['Gwenborough', 'Wisokyburgh', 'McKenziehaven', 'Roscoeview', 'Aliyaview', 'Howemouth']}, {field: 'address.zipcode', options: ['33263', '23505-1337', '58804-1099']}, {field: 'name', options: ['Leanne Graham', 'Ervin Howell', 'Glenna Reichert', 'Clementina DuBuque']}]},
          [CDCCheckboxFilterId]: {component: CDCCheckboxFilter, config: {fields: ['Eins', 'Zwei', 'Drei']}},
          [CDCRangeFilterId]: {component: CDCRangeFilter, config: {minValue: 1, maxValue: 10}}
        }}
        filtersByCDC={{
          'JSONPlaceholderUserCDC': [
            // [CDCTextFilterId]: {filter (defaultwert): createCDCGroupingFilter(uuidv4()), component: CDCTextFilter, config: [{field: 'address.city', options: ['Gwenborough', 'Wisokyburgh', 'McKenziehaven', 'Roscoeview', 'Aliyaview', 'Howemouth']}, {field: 'address.zipcode', options: ['33263', '23505-1337', '58804-1099']}, {field: 'name', options: ['Leanne Graham', 'Ervin Howell', 'Glenna Reichert', 'Clementina DuBuque']}]},
            createCDCGroupingFilter(uuidv4()),
            createCDCTextFilter(uuidv4(), 'Select...', null),
            createCDCCheckboxFilter(uuidv4(), {}),
            createCDCRangeFilter(uuidv4(), 'id', {min: 1, max: 10}),
            //compareComlumns
          ],
          'JSONPlaceholderPostsCDC': [
            createCDCGroupingFilter(uuidv4()),
            createCDCRangeFilter(uuidv4(), 'id', {min: 1, max: 100}),
          ]
        }}
        // TODO: This needs to be defined per CDC. Maybe we define this in the backend and fetch it via an API?
        compareColumnOptions={['id', 'name', 'address.street', 'adress.city', 'address.zipcode', 'title', 'body']}
      />,
      this.node
    );
  }
}
