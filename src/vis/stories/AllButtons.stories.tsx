import React from 'react';
import { ComponentStory } from '@storybook/react';

// Define function to show all combinations of buttons possible
function AllButtons() {
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
            <div key={color} className="row pt-2 pb-2">
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

// Create default export for this story
export default {
  title: 'Example/UI/Buttons',
  component: AllButtons,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// Create template for story
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof AllButtons> = (args) => {
  return <AllButtons {...args} />;
};

// Create story that is shown
export const AllButtonsStory = Template.bind({}) as typeof Template;
AllButtonsStory.parameters = {
  backgrounds: { default: 'light' },
};
