import React from 'react';
import { ComponentStory } from '@storybook/react';

// Define function to show all combinations of buttons possible
function AllButtons() {
  const themeColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'gray'];
  return (
    <div className="container">
      <h5>
        <span>
          Checkout the <i>Button</i> section in the{' '}
          <a href="https://docs.google.com/document/d/1O3SX49CRacjR2WyteFByPO8rKrFYklh7YJ5FsaBjuDQ/edit#heading=h.h4bfja47lkm7">Styleguide</a> to learn when to
          use which button style.
        </span>
        <hr />
      </h5>

      <div className="row">
        <div className="col-3">
          <h5>.btn-*</h5>
        </div>

        <div className="col-3">
          <h5>.btn-text-*</h5>
        </div>

        <div className="col-3">
          <h5>.btn-outline-*</h5>
        </div>

        <div className="col-3">
          <h5>.btn-icon-*</h5>
        </div>
      </div>

      <div>
        {themeColors.map((color) => {
          return (
            <div key={color} className="row pt-2 pb-2">
              <div className="col-3" style={{ display: 'flex', gap: 6 }}>
                <button type="button" className={`btn btn-${color}`}>
                  <i className="fas fa-plus me-1" /> Add
                </button>

                <button type="button" className={`btn btn-${color}`}>
                  <i className="fas fa-plus" />
                </button>
              </div>

              <div className="col-3" style={{ display: 'flex', gap: 6 }}>
                <button type="button" className={`btn btn-text-${color}`}>
                  <i className="fas fa-plus me-1" /> Add
                </button>

                <button type="button" className={`btn btn-text-${color}`}>
                  <i className="fas fa-plus" />
                </button>
              </div>

              <div className="col-3" style={{ display: 'flex', gap: 6 }}>
                <button type="button" className={`btn btn-outline-${color}`}>
                  <i className="fas fa-plus me-1" /> Add
                </button>

                <button type="button" className={`btn btn-outline-${color}`}>
                  <i className="fas fa-plus" />
                </button>
              </div>

              <div className="col-3">
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

// Create default export for this story
export default {
  title: 'UI/Buttons',
  component: AllButtons,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// Create template for story
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof AllButtons> = () => {
  return <AllButtons />;
};

// Create story that is shown
export const AllButtonsStory = Template.bind({}) as typeof Template;
AllButtonsStory.parameters = {
  backgrounds: { default: 'light' },
};
