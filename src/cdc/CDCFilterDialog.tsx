import * as React from 'react';
import ReactDOM from 'react-dom';
import {BSModal, useAsync} from '../hooks';
import {IAlert, IFilter, IUploadAlert, ICDCConfiguration} from './interfaces';
import {getAlerts, runAlertById} from './api';
import {CDCGroupingFilterId, CDCGroupingFilter, createCDCGroupingFilter, CDCCheckboxFilter, CDCCheckboxFilterId, createCDCCheckboxFilter, CDCRangeFilter, CDCRangeFilterId, createCDCRangeFilter} from './filter';
import {v4 as uuidv4} from 'uuid';
import {CDCTextFilter, CDCTextFilterId, createCDCTextFilter} from './filter/CDCTextFilter';
import {CDCAlertView} from './alert/CDCAlertView';
import {ErrorMessage} from './common';
import {runAllAlerts} from '.';

interface ICDCFilterDialogProps {
  cdcConfig: {[cdcId: string]: ICDCConfiguration};
}

export const CDC_DEFAULT_ALERT_DATA: () => IUploadAlert = () => ({name: '', enable_mail_notification: false, cdc_id: 'JSONPlaceholderUserCDC', filter: createCDCGroupingFilter(uuidv4()), compare_columns: null});

export const runAlert = async (id: number): Promise<IAlert> => {
  return runAlertById(id).then((alert) => {return alert;}).catch((e) => {
    alert(`${e}: Invalid filter parameter in alert: ${id}`);
    return null;
  });
};

export function CDCFilterDialog({cdcConfig}: ICDCFilterDialogProps) {
  const [selectedAlert, setSelectedAlert] = React.useState<IAlert | null>(null);
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [creationMode, setCreationMode] = React.useState<boolean>(false);
  const [alertData, setAlertData] = React.useState<IUploadAlert | null>(null);

  const onAlertChanged = async (id?: number) => {
    //refetches alerts and makes new selection
    fetchAlerts().then((alerts) => {
      //if no id there is no need to iterate through alerts
      if (!id) {
        setSelectedAlert(null);
      } else {
        setSelectedAlert(alerts.find((alert) => alert.id === id));
      }
    });
  };

  const {status: alertStatus, error: alertError, execute: fetchAlerts, value: alerts} = useAsync(getAlerts, true);

  const {status: syncStatus, error: syncError, execute: doSync} = useAsync(async () => {
    const result = await runAllAlerts();
    if (result.error?.length > 0) {
      throw new Error(`Alert(s) [${result.error.join(',')}] could not be synchronized!`);
    }
    onAlertChanged(selectedAlert?.id);
  }, false);

  const onCreateButtonClick = () => {
    setCreationMode(true);
    setSelectedAlert(null);
    setAlertData(CDC_DEFAULT_ALERT_DATA());
  };

  const onAlertClick = async (alert: IAlert) => {
    setAlertData(alert);
    setCreationMode(false);
    setSelectedAlert(alert);
  };

  const reviewStatus = (alert: IAlert) => {
    switch (true) {
      case (alert.latest_error != null):
        return `Error from Sync: ${new Date(alert.latest_error_date)?.toLocaleDateString()}`;
      case (alert.latest_diff != null):
        return 'Pending data revision';
      case (alert.confirmation_date != null):
        return `Last confirmed: ${new Date(alert.confirmation_date)?.toLocaleDateString()}`;
      default:
        return 'No data revision yet';
    }
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
              {syncStatus === 'pending' || alertStatus === 'pending' ?
                <i className="fas fa-spinner fa-spin"></i>
                :
                <div className="row">
                  <div className="col-3 overflow-auto">
                    <div className="d-md-flex justify-content-md-end">
                      <small><button className="btn btn-text-secondary" onClick={() => onCreateButtonClick()}><i className="fas fa-plus"></i></button></small>
                    </div>
                    {alertError ? <ErrorMessage error={new Error(`While loading occured ${alertError}`)} onRetry={() => fetchAlerts()} /> : null}
                    {alertStatus === 'success' ? <div className="list-group">{alerts.map((alert) =>
                      <div key={alert.id}><a href="#" className={`list-group-item list-group-item-action${selectedAlert?.id === alert?.id ? ' border-primary' : ''}`} onClick={() => onAlertClick(alert)} aria-current="true">
                        <div className="d-flex w-100 justify-content-between">
                          <h6 title={`${alert.name} for ${alert.cdc_id}`} className="mb-1 overflow-hidden">{alert.name} <small className="text-muted">for {alert.cdc_id}</small></h6>
                          <small><i className={alert?.latest_error ? "fas fa-exclamation-triangle text-danger" : alert?.latest_diff ? "fas fa-circle text-primary" : null} /></small>
                        </div>
                        <small>{reviewStatus(alert)}</small>
                      </a></div>
                    )}</div> : null}
                  </div>
                  <div className="col-9 overflow-auto">
                    {selectedAlert || creationMode ?
                      <CDCAlertView
                        alertData={alertData}
                        setAlertData={setAlertData}
                        onAlertChanged={onAlertChanged}
                        setCreationMode={setCreationMode}
                        selectedAlert={selectedAlert}
                        creationMode={creationMode}
                        cdcConfig={cdcConfig}
                      />
                      : null
                    }
                  </div>
                </div>
              }
            </div>
            <div className="modal-footer">
              {syncError ? <ErrorMessage error={new Error(`While synchronizing an error occured: ${syncError}`)} /> : null}
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" disabled={syncStatus === 'pending'} title="Sync alerts" className="btn btn-secondary" onClick={() => doSync()}>Sync</button>
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
        cdcConfig={{
          'JSONPlaceholderUserCDC': {
            filters: [
              createCDCGroupingFilter(uuidv4()),
              createCDCTextFilter(uuidv4(), 'Select...', null),
              createCDCCheckboxFilter(uuidv4(), {}),
              createCDCRangeFilter(uuidv4(), 'id', {min: 1, max: 10})
            ],
            components: {
              [CDCGroupingFilterId]: {component: CDCGroupingFilter},
              [CDCTextFilterId]: {component: CDCTextFilter, config: [{field: 'address.city', options: ['Gwenborough', 'Wisokyburgh', 'McKenziehaven', 'Roscoeview', 'Aliyaview', 'Howemouth']}, {field: 'address.zipcode', options: ['33263', '23505-1337', '58804-1099']}, {field: 'name', options: ['Leanne Graham', 'Ervin Howell', 'Glenna Reichert', 'Clementina DuBuque']}]},
              [CDCCheckboxFilterId]: {component: CDCCheckboxFilter, config: {fields: ['Eins', 'Zwei', 'Drei']}},
              [CDCRangeFilterId]: {component: CDCRangeFilter, config: {minValue: 1, maxValue: 10}}
            },
            compareColumns: ['id', 'name', 'address.street', 'address.city', 'address.zipcode']
          },
          'JSONPlaceholderPostsCDC': {
            filters: [
              createCDCGroupingFilter(uuidv4()),
              createCDCRangeFilter(uuidv4(), 'id', {min: 1, max: 100})
            ],
            components: {
              [CDCGroupingFilterId]: {component: CDCGroupingFilter},
              [CDCRangeFilterId]: {component: CDCRangeFilter, config: {minValue: 1, maxValue: 100}}
            },
            compareColumns: ['title', 'body']
          }
        }}
      />,
      this.node
    );
  }
}

