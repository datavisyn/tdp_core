import '../src/scss/storybook.scss';
import { initializeLibrary } from '../src/initialize';

// TODO: This is async, how to wait for it?
initializeLibrary();

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
