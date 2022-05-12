import React from 'react';
import { NotificationHandler } from '../NotificationHandler';
// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Example/Vis/IrisData',
    component: NotificationHandler,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template = (args) => {
    const columns = React.useMemo(() => fetchIrisData(), []);
    return NotificationHandler.pushNotification('success', 'test');
};
// More on args: https://storybook.js.org/docs/react/writing-stories/args
//# sourceMappingURL=NotificationHandler.stories.js.map