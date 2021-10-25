import * as React from 'react';
import ReactDOM from 'react-dom';
import {BSModal, useAsync} from '../hooks';
import {IAlert, IFilter, IFilterComponent, IUploadAlert} from './interface';
import {deleteAlert, getAlerts, runAlertById} from './api';
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

export const DEFAULTALERTDATA: IUploadAlert = {name: '', enable_mail_notification: false, cdc_id: 'demo', filter_dump: '', filter_query: ''};
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
      <div id={`collapse${index}`} className={`p-2 accordion-collapse collapse${show ? ' show' : ''}`} aria-labelledby={`heading${index}`} data-bs-parent={`#${parentId}`}>
        {child}
      </div>
    </div>
  );
};

export function CDCFilterDialog({filterComponents, filtersByCDC}: ICDCFilterDialogProps) {
  const [selectedAlert, setSelectedAlert] = React.useState<IAlert>();
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [creationMode, setCreationMode] = React.useState<boolean>(false);
  const [filter, setFilter] = React.useState<IFilter>();
  const [alertData, setAlertData] = React.useState<IUploadAlert>();
  const [alertList, setAlertList] = React.useState<IAlert[]>();
  const [cdcs, setCdcs] = React.useState<string[]>();
  const {status: alertStatus, error: alertError, execute: alertExecute, value: alerts} = useAsync(getAlerts, true);

  React.useEffect(() => {
    setAlertData(DEFAULTALERTDATA);
    setFilter(DEFAULTFILTER);
    setCdcs(['demo']);
  }, []);

  React.useEffect(() => {
    const runAlerts = [];
    alerts?.sort((a, b) => a.modification_date > b.modification_date ? -1 : a.modification_date < b.modification_date ? 1 : 0).forEach((alert) => runAlertById(alert.id).then((a) => runAlerts.push(a)));
    setAlertList(runAlerts);
  }, [alerts]);

  const onCreateButtonClick = () => {
    setCreationMode(true);
    setSelectedAlert(null);
    setAlertData(DEFAULTALERTDATA);
    setFilter(DEFAULTFILTER);
  };

  const onDeleteButton = async (id: number) => {
    setAlertList([...alertList.filter((alert) => alert.id !== id)]);
    await deleteAlert(id);
    setSelectedAlert(null);
  };

  const onAlertClick = async (alert: IAlert) => {
    setAlertData(alert);
    setFilter(JSON.parse(alert.filter_dump));
    setCreationMode(false);
    setSelectedAlert(alert);
  };

  const newLiteratureCount = (alert: IAlert) => {
    const data = JSON.parse(alert?.latest_diff)?.dictionary_item_added;
    return data?.length > 0 ? <span className="badge bg-primary rounded-pill ms-1">{data.length}</span> : null;
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
                <div className="col-4 overflow-auto">
                  <div className="d-flex w-100 justify-content-between mb-1">
                    <h5>Your alerts</h5>
                    <small><button className="btn btn-text-secondary" onClick={() => onCreateButtonClick()}><i className="fas fa-plus"></i></button></small>
                  </div>
                  {alertStatus === 'pending' ? <>Loading...</> : null}
                  {alertStatus === 'error' ? <>Error {alertError.toString()}</> : null}
                  {alertStatus === 'success' ? <div className="list-group">{alertList.map((alert) =>
                    <div key={alert.id}><a href="#" className={`list-group-item list-group-item-action${selectedAlert === alert ? ' border-primary' : ''}`} onClick={() => onAlertClick(alert)} aria-current="true">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{alert.name} <small className="text-muted">for {alert.cdc_id}</small> {newLiteratureCount(alert)}</h6>
                        {selectedAlert === alert ? <span className="text-muted" onClick={() => onDeleteButton(alert.id)}><i className="fas fa-trash"></i></span> : null}
                      </div>
                      <small>{alert.confirmation_date ? `last confirmed: ${alert.confirmation_date}` : 'No data revision yet'}</small>
                    </a></div>
                  )}</div> : null}
                </div>
                <div className="col-8 overflow-auto">
                  {selectedAlert ?
                    <CDCEditAlert
                      alertData={alertData}
                      setAlertData={setAlertData}
                      filter={filter} setFilter={setFilter}
                      filterSelection={filtersByCDC[selectedAlert?.cdc_id]}
                      filterComponents={filterComponents}
                      alertList={alertList}
                      setAlertList={setAlertList}
                      selectedAlert={selectedAlert}
                      setSelctedAlert={setSelectedAlert}
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
                        alertList={alertList}
                        setAlertList={setAlertList}
                        setSelectedAlert={setSelectedAlert}
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
            createCDCTextFilter(uuidv4(), 'Text Filter', {filter: [{field: `item["address"]["city"]`, value: []}], fields: [{field: `item["address"]["city"]`, options: [`"Gwenborough"`, `"Wisokyburgh"`, `"McKenziehaven"`, `"South Elvis"`, `"Roscoeview"`, `"South Christy"`, `"Howemouth"`, `"Aliyaview"`, `"Bartholomebury"`]}, {field: `item["address"]["zipcode"]`, options: [`"33263"`, `"23505-1337"`, `"58804-1099"`]}, {field: `item["name"]`, options: [`"Leanne Graham"`, `"Ervin Howell"`, `"Glenna Reichert"`, `"Clementina DuBuque"`]}]}),
            createCDCCheckboxFilter(uuidv4(), 'Checkbox Filter', {fields: ['Eins', 'zwei', 'dRei'], filter: []}),
            createCDCRangeFilter(uuidv4(), 'Range Filter', {min: 1, max: 10}),
          ]
        }} />,
      this.node
    );
  }
}
