let brwsr; let curBrowser;
try {
  brwsr = ['browser', 'chrome'];
  curBrowser = window[typeof browser == 'undefined' ? brwsr[1] : brwsr[0]];
} catch (e) {
  console.error(e);
}
export default async function sendRequest(module, method, args) {
  return new Promise(function(resolve, reject) {
    curBrowser.runtime.sendMessage({
      type: 'request',
      module, method, args,
    }, function(response) {
      // console.log('page-app:response: ', response, ...arguments)
      const [err, data] = response;
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
