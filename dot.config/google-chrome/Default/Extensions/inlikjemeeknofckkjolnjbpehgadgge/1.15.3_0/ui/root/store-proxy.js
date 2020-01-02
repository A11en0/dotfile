export default function (module) {
  const proxy = {
    hasField: function () {
      return false;
    },
  };
  function createProxyMethod(method) {
    return async function () {
      const args = [...arguments];

      const callback = args.pop();
      let brwsr; let curBrowser;
      try {
        brwsr = ['browser', 'chrome'];
        curBrowser = window[typeof browser == 'undefined' ? brwsr[1] : brwsr[0]];
      } catch (e) {
        console.error(e);
      }
      if (typeof browser == 'undefined') {
        curBrowser.runtime.sendMessage({
          type: 'request',
          module,
          method,
          args,
        }, function (response) {
          // console.log('proxy: response', response, ...arguments)
          callback(...response);
        });
      } else {
        const res = await curBrowser.runtime.sendMessage({
          type: 'request',
          module,
          method,
          args,
        });
        // console.log('store-proxy:module', module);
        // console.log('store-proxy:res', res);
        callback(...res);
      }
    };
  }
  ['create', 'find', 'findOne', 'destroy', 'update'].forEach((mName) => (proxy[mName] = createProxyMethod(mName)));
  return proxy;
}

