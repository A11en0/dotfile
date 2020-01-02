import Service from '../ui/service.js';
import sendRequest from '../ui/sendrequest.js';
import {start, report} from '../ui/lib/error-reporter.js';
const params = location.search
  .slice(1).split('&')
  .reduce((obj, cVal)=>{
    const [key, val] = cVal.split('=');
    obj[key] = val;
    return obj;
  }, {});
window.SIEVE_ID = params.sieveId;
let brwsr; let curBrowser;
try {
  brwsr = ['browser', 'chrome'];
  curBrowser = window[typeof browser == 'undefined' ? brwsr[1] : brwsr[0]];
} catch (e) {
  console.error(e);
}

(async () => {
  const id = await sendRequest('auth', 'getId');
  const locale = await sendRequest('Prefs', 'get', ['locale']);
  Service.CFG.URL = await sendRequest('CFG', 'URL');
  window.URL_ROOT = Service.CFG.URL.ROOT;
  window.URL_API = Service.CFG.URL.API;
  Service.store.UserStore.findOne({
    id: id,
  }, async function(err, user) {
    window.USER = user || {id: 0};
    start({app: service.CFG.CLIENT.NAME, url: service.CFG.URL.ER, version: service.CFG.VERSION, id: USER.id});
    USER.prefs || (USER.prefs = {});
    window.LOCALE = (USER.locale ? USER.locale : locale) || 'en-US';
    await import('../ui/'+params.app+'.js');
  });
})();


