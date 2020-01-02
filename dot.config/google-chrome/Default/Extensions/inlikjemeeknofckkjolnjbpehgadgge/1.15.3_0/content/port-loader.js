(function(window) {
  const
    EVT = document.createEvent('Event');


  const ID_BRIDGE = 'sentinel-bridge';


  const MASK_FRAME_REMOVED = 1 << 0;


  const loading = {};


  const flags = innerWidth - 800;


  const isRoot = top == window;


  const attrs = {
    id: ''+(Math.random() * 10000000)|0,
    uri: location.href,
    root: isRoot,
    size: {
      width: innerWidth,
      height: innerHeight,
    },
  };


  let port;

  // console.log('PORT:LOADER:new', attrs, attrs.uri);

  // Add event listener first so that events from child ports are not missed.
  addEventListener('message', onMessage, false);

  connect();

  /*
// FIXME This can removeFrames in tab that hasn't been loaded by loader.
if(!isRoot && flags > 0 && (flags & MASK_FRAME_REMOVED)) {
  //console.log('PORT:LOADER:removeFrames');
  var mutationObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if(mutation.type == 'childList') {
        var
        addedNodes = Array.prototype.slice.call(mutation.addedNodes, 0);
        addedNodes.forEach(function(node) {
          if(node.nodeName == 'IFRAME' || node.nodeName == 'FRAME') {
            if(node.src.slice(0, 6) !== 'chrome' && node.parentNode) {
              node.parentNode.removeChild(node);
            }
          }
        });
      }
    });
  });

  mutationObserver.observe(document.documentElement, {
    subtree: true,
    childList: true
  });
}
*/

  function loadScript(path) {
    return loading[path] || (loading[path] = new Promise(function(resolve, reject) {
    // console.log('loadScript: QUEUE: ', location.host, path);

      const
        xhr = new XMLHttpRequest();
      xhr.open('GET', path);

      xhr.onerror = function(e) {
        reject(Error('XHR onerror: ' + e));
      };

      xhr.onload = function(e) {
      // console.log('loadScript: EVAL ', location.host, path);
        try {
          eval.call(window, xhr.responseText);
          resolve();
        } catch (e) {
        console.error('Error loading script: ', path, e);
          reject(e);
        }
      };

      xhr.send();
    }));
  }

  function connect() {
    // console.log('PORT:LOADER:loader:connect', attrs.uri);
    port = chrome.runtime.connect({
      name: 'loader:' + JSON.stringify(attrs),
    });

    port.onMessage.addListener(onPortMessage);
    port.onDisconnect.addListener(onPortDisconnect);

    function onPortDisconnect() {
    // console.log('PORT:LOADER:disconnect', attrs.uri);

      port.onMessage.removeListener(onPortMessage);
      port.onDisconnect.removeListener(onPortDisconnect);

      removeEventListener('message', onMessage);
      removeEventListener('DistillEventWeb', onContentMessage);
      removeEventListener('DistillEventWebReady', onContentReady);
    }

    function onPortMessage(msg) {
      // console.log('-> PORT:LOADER:message', msg, attrs.uri);

      switch (msg.type) {
        case 'bg':
          // It is a content script in bg.  When in bg, there is one extra step
          // before port is attached to loader.  Start linking frames. Once done,
          // sendMessage with update attrs for attachment.
          parent.postMessage({distillchildport: attrs}, '*');
          break;

        case 'content':
          sendContentMessage(msg.data);
          break;

        case 'content:load':
          // loadContent on document-ready.
          loadContent(msg);
          break;

        default:
          console.error('PORT:LOADER: Unhandled message:', msg, attrs.uri);
          break;
      }
    }
  }

  function init() {
    EVT.initEvent('DistillEventExt', true, true);
    addEventListener('DistillEventWeb', onContentMessage);
    addEventListener('DistillEventWebReady', onContentReady);
  }

  function loadContent(params) {
  // console.log('PORT:LOADER:loadContent:', params, document.readyState, attrs.uri);
    init();

    if (document.readyState == 'loading') {
      document.addEventListener('DOMContentLoaded', onLoad, false);
    } else {
      onLoad();
    }

    function onLoad() {
    // console.log('PORT:LOADER:document.DOMContentLoaded:', params, attrs.uri);
      let
        promise = Promise.resolve();
      (params.scripts || []).map(function(src) {
        return chrome.runtime.getURL('')+src;
      }).forEach(function(path) {
        promise = promise.then(function() {
          return loadScript(path);
        });
      });
      document.removeEventListener('DOMContentLoaded', onLoad, false);
    }
  }

  function onContentMessage(event) {
  // console.log('<- PORT:LOADER:onContentMessage', event, attrs.uri);

    const data = JSON.parse(document.getElementById(ID_BRIDGE).textContent);
    port.postMessage({type: 'content', data: data});
  }

  function onContentReady() {
  // console.log('PORT:LOADER:onContentReady', attrs.uri);

    port.postMessage({
      type: 'port:ready',
      data: {
        title: document.title,
      },
    });
  }

  function onMessage(event) {
  // console.log('PORT:LOADER:onMessage', event, attrs.uri);

    const
      data = event.data || {};


    const childAttrs = data.distillchildport;


    const parentAttrs = data.distillparentport;

    if (childAttrs) {
      event.source.postMessage({distillparentport: attrs, forChild: childAttrs}, '*');
    } else if (parentAttrs) {
      if (event.data.forChild.id == attrs.id) {
      // Received message from parentAttrs port. Connect port.
        attrs.parent = parentAttrs;
        // Send message with latest attrs to attach to relevant loader
        port.postMessage({
          type: 'update',
          data: attrs,
        });
      } else {
      // Response message from a different port-loader instance loaded later.
        removeEventListener('message', onMessage);
      }
    }
  }

  function sendContentMessage(msg) {
  // console.log('PORT:LOADER:sendContentMessage', event, attrs.uri);

    document.getElementById(ID_BRIDGE).textContent = JSON.stringify(msg);
    dispatchEvent(EVT);
  }

  window.loadScript = loadScript;
  window.URL_CDN = chrome.runtime.getURL('content');
})(window);

