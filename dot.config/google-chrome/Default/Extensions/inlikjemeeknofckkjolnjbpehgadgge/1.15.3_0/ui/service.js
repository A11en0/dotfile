import StoreProxy from './root/store-proxy.js';
const Backbone = window.Backbone;

if (!Backbone) {
  throw new Error('ADD ' + 'Backbone');
}

let serviceVar;
try {
  const service = chrome.extension.getBackgroundPage();
  window.service = service;
  serviceVar = service;
} catch (e) {
  // Not in extension process. We return a copy with hardcoded essentials.
  serviceVar = {
    store: new Proxy({}, {
      get: (obj, prop) => StoreProxy(prop),
    }),
    gEvents: Backbone,
    CFG: {
      CLIENT: {
        TYPE: 11,
      },
    },
    Supports: {
      tabForXFrame: true,
    },
  };
}
export default serviceVar;


