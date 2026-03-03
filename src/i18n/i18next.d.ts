import 'i18next';
import type enCommon from './locales/en/common.json';
import type enProjections from './locales/en/projections.json';
import type enTour from './locales/en/tour.json';
import type enNodes from './locales/en/nodes.json';
import type enHelp from './locales/en/help.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof enCommon;
      projections: typeof enProjections;
      tour: typeof enTour;
      nodes: typeof enNodes;
      help: typeof enHelp;
    };
  }
}
