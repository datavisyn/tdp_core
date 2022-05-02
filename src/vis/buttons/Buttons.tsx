import React from 'react';

export function Buttons({ backgroundColor }: { backgroundColor: string }) {
  const themeColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'gray'];
  return (
    <div className="container m-4">
      <div className="row">
        <div className="col-5">
          <h5>.btn-*</h5>
        </div>

        <div className="col-5">
          <h5>.btn-text-*</h5>
        </div>

        <div className="col-2">
          <h5 className="text-center">.btn-icon-*</h5>
        </div>
      </div>

      <div>
        {themeColors.map((color) => {
          return (
            <div key={color} className={`row pt-2 pb-2 ${backgroundColor}`}>
              <div className="col-3">
                <button type="button" className={`btn btn-${color}`}>
                  <i className="fas fa-plus me-1" /> Add column
                </button>
              </div>

              <div className="col-2">
                <button type="button" className={`btn btn-${color}`}>
                  <i className="fas fa-plus" />
                </button>
              </div>

              <div className="col-3">
                <button type="button" className={`btn btn-text-${color}`}>
                  <i className="fas fa-plus me-1" /> Add column
                </button>
              </div>

              <div className="col-2">
                <button type="button" className={`btn btn-text-${color}`}>
                  <i className="fas fa-plus" />
                </button>
              </div>

              <div className="col-2">
                <button type="button" className={`btn btn-icon-${color}`}>
                  <i className="fas fa-plus" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
