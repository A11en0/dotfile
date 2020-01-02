
/*
NOTE: Do not edit. This is an auto-generated file. All changes will be lost!
*/

(function(scope) {

let require = undefined; let requirejs = undefined; let define = undefined;
let DBG = 0;
;
(function(scope) {
  const
    options = {baseUrl: '', paths: {}, shim: {}};


  const loaded = {};


  const cached = {};

  define = function(name, deps, defn) {
    if (arguments.length == 2) {
      defn = deps;
      deps = [];
    }
    // Register module for name
    loaded[name] = [defn, deps||[]];

    if (typeof defn == 'object') {
      module[name] = defn;
    }
  };

  require = function(deps, callback) {
    Promise.all(deps.map(load)).then(function(mods) {
      callback.apply(scope, mods);
    });
  };

  require.config = config;

  function config(_options) {
    Object.keys(_options).forEach(function(key) {
      options[key] = _options[key];
    });
  }

  function load(name) {
    let
      promise = Promise.resolve();


    const baseUrl = options.baseUrl;


    let path = options.paths[name] || name;


    const noProtocol = !path.match(/\w:/);


    const shim = options.shim[name] || {};

    noProtocol && (path = options.baseUrl + '/' + path);

    if (!path.match(/\.js$/)) {
      path = path + '.js';
    }

    if (shim.deps) {
      promise = promise.then(Promise.all(shim.deps.forEach(load)));
    }

    if (!loaded[name]) {
      promise = promise.then(function() {
        return loadScript(path);
      });
    }

    return new Promise(function(resolve, reject) {
      promise.then(function() {
        if (loaded[name]) {
          loadDefn(name).then(resolve, reject);
        } else {
          if (!shim.exports) {
            throw new Error('Did not find namespace for module: ' + name);
          }
          const
            module = scope[shim.exports];
          loaded[name] = true;
          cached[name] = module;
          resolve(module);
        }
      }, reject);
    });
  }

  function loadDefn(name) {
    return new Promise(function(resolve, reject) {
      const
        data = loaded[name];


      const fn = data[0];


      const deps = data[1];


      const mod = cached[name];

      if (mod) {
        resolve(mod);
        return;
      }

      Promise.all(deps.map(load)).then(function(depmods) {
        let
          mod = cached[name];
        if (mod) {
          resolve(mod);
        } else {
          mod = fn.apply(scope, depmods);
          resolve(cached[name] = mod);
        }
      }, function(err) {
        console.error('LOADDEFN: reject with error: ', err);
        reject(err);
      });
    });
  }

  scope.define = define;
  scope.require = require;
})(this);
;
if (this.brwsr_def) {
  // throw new Error('brwsr_def already taken');
  return;
}

Object.defineProperty(this, 'brwsr_def', {
  get: function() {
    return define;
  },
});

if (this.brwsr_req) {
  // throw new Error('brwsr_req already taken');
  return;
}

Object.defineProperty(this, 'brwsr_req', {
  get: function() {
    return require;
  },
});

// console.log('CONTENT:brwsr_req', location.href);

brwsr_req.config({
  baseUrl: URL_CDN, // Build script.
  paths: {
    'async': '../ui/lib/async',
    'backbone': '../ui/lib/backbone',
    'domo': '../ui/lib/domo',
    'jquery': '../ui/lib/jquery',
    'underscore': '../ui/lib/underscore',
  },

  shim: {
    async: {exports: 'async'},
    backbone: {exports: 'Backbone'},
    domo: {exports: 'domo'},
    jquery: {exports: 'jQuery'},
    underscore: {exports: '_'},
  },
});
;
brwsr_def('id', [], function() {
  return (function(x) {
    return function() {
      return x += 1;
    };
  })(0);
});

brwsr_def('api', ['underscore', 'id'], function(_, ID) {
  const
    MSG_INIT = 1;


  const MSG_EVENT = 2;


  const MSG_REQUEST = 3;


  const MSG_RESPONSE = 4;


  const MSG_LOG = 5;


  const ID_BRIDGE = 'sentinel-bridge';


  const EL_BRIDGE = document.createElement('p');
  EL_BRIDGE.id = ID_BRIDGE;
  // Tag so that the element is not removed during DOM modification.
  EL_BRIDGE.setAttribute('hasinclude__', '1');

  // Remove remanants from an older session.
  const old = document.getElementById(ID_BRIDGE);
  if (old) {
    old.parentNode.removeChild(old);
  // console.log('CONTENT:bridge:removed old', location.href);
  }

  document.head.appendChild(EL_BRIDGE);
  // console.log('CONTENT:bridge:added', location.href);

  // Our primary means of communication with extension world is via element
  // channels. Listen to events to initiate messaging.
  window.addEventListener('DistillEventExt', onEventExtn);

  function onEventExtn() {
    const msg = JSON.parse(EL_BRIDGE.textContent);
    EL_BRIDGE.textContent = '';
    onMessage(msg);
  }

  // Handle message from extension.
  function onMessage(msg) {
    if (msg.type == MSG_REQUEST) {
    // console.log('CONTENT: request:', msg._id, msg.path, msg);

      __brwsr__request(msg._id, _.pick(msg, 'path', 'data'));
    } else if (msg.type == MSG_EVENT) {
    // Events from extensions to its iframe may at times be used for inter-
    // communication between the frames. For now, we do not these events here.
      const
        eventType = msg.data.type;


      const eventData = msg.data.data;
      if (eventType == 'destroy') {
        window.removeEventListener('DistillEventExt', onEventExtn);
      }
    } else {
    // console.error('CONTENT: Unhandled message:', msg);
    }
  }

  function postToExtn(msg) {
    EL_BRIDGE.textContent = JSON.stringify(msg);
    const event = document.createEvent('Event');
    event.initEvent('DistillEventWeb', true, true);
    window.dispatchEvent(event);
  }

  // TODO Use tracekit.js/printStackTrace?
  const error = function error(e) {
    DBG && console.error('content error:', e, e.stack);
    return e.message ? (e.message + (e.stack ? ' ' + e.stack : '' )) : e + '';
  };

  const trigger = function trigger(event) {
    postToExtn({
      type: MSG_EVENT,
      data: event,
    });
  // TODO Post event to local event listeners.
  };

  /*
 * Need of this function arises due to rogue version of JSON included in host
 * pages.
 */
  function stringify(o) {
    const toJSON = Array.prototype.toJSON;

    delete Array.prototype.toJSON;

    const val = JSON.stringify(o);

    toJSON && (Array.prototype.toJSON = toJSON);

    return val;
  }

  function removeTags(name) {
    const embeds = Array.prototype.slice.call(
      document.getElementsByTagName(name), 0);
    embeds.forEach(function(el) {
      el.parentNode.removeChild(el);
    });
  }

  if (document.readyState == 'complete' || document.readyState == 'loaded') {
    documentOnReady();
  } else {
    document.addEventListener('DOMContentLoaded', documentOnReady, false);
  }

  function documentOnReady() {
  // We clean up the document before we prepare it for interaction.
  // XXX This may be a surprise for the end user.
    document.removeEventListener('DOMContentLoaded', documentOnReady, false);
    removeTags('embed');
  }

  function __brwsr__request(_id, msg) {
  // DBG && console.log('__brwsr__request:' + msg);

    const options = _.isString(msg) ? JSON.parse(msg) : msg;

    setTimeout(function() {
      callApi(options, callback);
    }, 0);

    function callback(err, data) {
      if (err) {
      // console.error("__brwsr__request failed:" + _id + " " + error(err) + ", for:" + msg);
      // Convert error to string
        if (typeof err == 'string') {
          err = {message: err};
        } else if (err instanceof Error) {
          err = {message: err.message, stack: err.stack};
        } else if (!err.code) {
          try {
            err = {message: stringify(err)};
          } catch (e) {
            err = {message: 'unknown error response received'};
          }
        }
        err.source = location.href;
      }

      // DBG && console.log('__brwsr__request: response:' + _id + " " + options.path + " " + stringify(data));

      // Send response back
      postToExtn({
        type: MSG_RESPONSE,
        _id: _id,
        err: err,
        data: data,
      });
    }
  }

  function callApi(options, callback) {
    const
      api = Api[options.path] || Api.none;


    const input = options.data;

    // DBG && console.log('callApi:' + " " + options.path + " " + location.href);
    // DBG && console.log("APIs:" + stringify(Object.keys(Api)));

    try {
      api(input, callback);
    } catch (e) {
    // console.error("API: unhandled exception: " + options.path + " " + error(e));
      callback && callback(error(e));
    }
  }


  const EVENTS = ['abort', 'beforeunload', 'blur', 'change', 'click', 'close',
    'contextmenu', 'devicemotion', 'deviceorientation', 'error', 'focus',
    'hashchange', 'keydown', 'keypress', 'keyup', 'load', 'mousedown',
    // 'mousemove','mouseover',
    'mouseup', 'reset', 'resize', 'scroll',
    'submit', 'unload', 'pageshow', 'pagehide'];

  window.addEventListener('message', onWindowMessage, true);

  Object.defineProperty(window, '__brwsr__request', {
    get: function() {
      return __brwsr__request;
    },
  });

  var Api = {
    eval: evalScript,
    none: function none(input, callback) {
      callback({code: 'EX00X', message: 'API not found'});
    },
    require: function(modules, sendResponse) {
      brwsr_req(modules, function() {
        sendResponse();
      }, sendResponse);
    },
    MSG_EVENT: MSG_EVENT,
    MSG_REQUEST: MSG_REQUEST,
    MSG_RESPONSE: MSG_RESPONSE,
    MSG_LOG: MSG_LOG,
  };

  // Support for inter-frame communication.
  const requestHandlers = {};
  const responseHandlers = {};
  const LISTENERS = {};


  function notifyListeners(name, data) {
    const listeners = LISTENERS[name];
    listeners && listeners.forEach(function(l) {
      l(data);
    });
  }

  // Receves message from another frame.
  function onWindowMessage(event) {
    const
      data = event.data;


    const type = data.brwsr_type;
    // We identify out messages using name brwsr_type.

    const id = data.id;


    const path = data.path;


    const source = event.source;

    // console.log('window.onmessage:'+type+':'+id+':'+path);

    if (type == Api.MSG_REQUEST) {
    // console.log('request:' + JSON.stringify(data));

      // Call request handler
      // We allow limited set of API access to callers from other windows.
      var handler = requestHandlers[path];
      if (handler) {
        handler(event, function(err, data) {
        // console.log('requestHandler:response:', err, data);
          source.postMessage({
            brwsr_type: Api.MSG_RESPONSE,
            id: id,
            err: err,
            data: data,
          }, '*');
        });
      } else {
      // TODO Emit log event for storage in errors table.
      // console.log('WARN! Unhandled request:' + stringify(event.data), event);
      }
    } else if (type == Api.MSG_RESPONSE) {
    // console.log('response:' + JSON.stringify(data));
      var handler = responseHandlers[id];
      if (handler) {
        delete responseHandlers[id];
        handler(event.data.err, event.data.data);
      } else {
      // TODO Emit log event
      // console.log('WARN! Unhandled response:' + stringify(event.data));
      }
    } else if (type == Api.MSG_EVENT) {
    // TODO Notify event listeners. Let modules register themselves as
    // event listeners.
    // console.log('WARN: TODO: Propagate event');
      notifyListeners(data.type, data.data);
    } else if (type != undefined) {
    // console.error('ERR: Unknow message type:'+type);
    }
  }

  // Sends event to another frame.
  function sendEvent(win, type, data) {
  // DBG && console.log('sendEvent:', stringify(data));

    win.postMessage({
      brwsr_type: Api.MSG_EVENT,
      type: type,
      data: data,
    });
  }

  // Sends request to another frame.
  function sendRequest(win, path, data, callback) {
  // DBG && console.log('sendRequest:' + path + ':' + stringify(data));

    const id = ID();
    responseHandlers[id] = callback;
    win.postMessage({
      brwsr_type: Api.MSG_REQUEST,
      id: id,
      path: path,
      data: data,
    }, '*');
  // DBG && console.log('sendRequest: done');
  }

  function syncToAsync(fn) {
    return function(input, callback) {
      try {
        const result = fn.call(this, input);
        callback && callback.call(this, undefined, result);
      } catch (e) {
      // console.error('API: syncToAsync error:' + error(e));
        throw e;
      }
    };
  }

  function resultTransformer(fn, transformer) {
    return function(input, callback) {
    // call function with a new callback that intercepts the result and
    // call original callback with transformed result.
      fn.call(input, function(err, result) {
        if (err) return callback.call(this, err);
        try {
          result = transformer(result);
          callback && callback(null, result);
        } catch (e) {
        // console.error('API: error transforming result:' + error(e));
          callback && callback(e);
        }
      });
    };
  }

  function evalScript(script, sendResponse) {
    let alert; let confirm; let prompt;
    // console.log('evalScript:', script);
    eval(script);
  }

  return {
  // Namespace is used when creating identifiable attributes in public context.
    NS: 'xbrwsr_',
    call: callApi,
    extend: function(extensions) {
      _.extend(Api, extensions);
    // console.log("APIs:" + stringify(Object.keys(Api)) + ':' + location.href);
    },
    resultTransformer: resultTransformer,
    syncToAsync: syncToAsync,
    /**
   * Triggers an event. `event` object should specify event type and data
   */
    trigger: function(event) {
      trigger(event);
    },

    // Internal functions used for inter-frame/window communications.
    sendEvent: sendEvent,
    sendRequest: sendRequest,

    // Event listeners for messages from other frames
    // TODO Rename to addFrameMessageListener
    addEventListener: function(name, listener) {
      (LISTENERS[name] || (LISTENERS[name] = [])).push(listener);
    },
    addRequestHandler: function(path, handler) {
    // Allow overrides?
      requestHandlers[path] = handler;
    },
  };
});
;
brwsr_def('util', ['underscore', 'api'], function(_, Api) {
  Api.addRequestHandler('frame/offset', function(event, callback) {
    const el = findWindowsFrame(event.source);
    if (!el) {
      callback('iframe element not found');
    } else {
      getOffsetFromScreen(el, callback);
    } // else somebody else's request or message
  });

  Api.extend({
    createEl: Api.syncToAsync(createEl),
    showEl: Api.syncToAsync(showEl),
    showMsg: Api.syncToAsync(showMsg),
  });

  function createEl(config) {
    const el = document.createElement(config.name);
    _.each(config.attrs, function(value, name) {
      el.setAttribute(name, value);
    });
    _.each(config.style, function(value, name) {
      el.style[name] = value;
    });
    _.each(config.children, function(child) {
      if (_.isString(child)) {
        el.appendChild(document.createTextNode(child));
      } else if (_.isObject(child)) {
        el.appendChild(createEl(child));
      }
    });
    el.className += ' ' + Api.NS;
    return el;
  }

  function removeEl(el) {
    el && el.parentElement && el.parentElement.removeChild(el);
  }

  function showEl(input) {
    const
      el = createEl(input.el);


    const oldEl = el.id && document.getElementById(el.id);

    removeEl(oldEl);

    (document.querySelectorAll(Api.NS+'ui')[0] || document.body || document.documentElement).appendChild(el);
    if (input.hideAfter) {
      setTimeout(function() {
        removeEl(el);
      }, input.hideAfter);
    }
    return el;
  }

  function showMsg(input) {
    showEl({
      hideAfter: 6000,
      el: {
        name: 'div',
        style: {
          'position': 'fixed',
          'top': '20px',
          'text-align': 'center',
          'textAlign': 'center',
          'width': '100%',
          'z-index': 10000000000,
        },
        attrs: {
          id: Api.NS + 'msg',
        },
        children: [{
          name: 'span',
          style: {
            'background-color': '#ff6',
            'backgroundColor': '#ff6',
            'border': 'solid 1px #666',
            'box-shadow': '2px 2px 2px rgba(0, 0, 0, .2)',
            'padding': '6px 12px',
          },
          children: [input.msg],
        }],
      },
    });
  }

  function findWindowsFrame(aWindow) {
    const frames = document.querySelectorAll('iframe,frame'); var frame;
    for (var i = 0, frame; i < frames.length; i += 1) {
      frame = frames[i];
      if (frame.contentWindow == aWindow) {
        return frame;
      }
    }
  }

  function getWindowOffset(callback) {
    if (window == window.top) {
      callback(null, {top: 0, left: 0});
    } else {
      Api.sendRequest(parent, 'frame/offset', null, function(err, offset) {
        err && console.error('ERR! getWindowOffset:' + err);
        callback(err, offset);
      });
    }
  }

  /**
 * Returns offset from screen measured in CSS pixels.
 */
  function getOffsetFromScreen(el, callback) {
    const
      offset = _.clone(el.getBoundingClientRect());
    delete offset.toJSON;

    offset.top += window.pageYOffset;
    offset.left += window.pageXOffset;

    getWindowOffset(function(err, ref) {
      err && console.error('ERR! getOffsetFromScreen:' + err);
      offset.top += ref.top;
      offset.left += ref.left;
      callback(err, offset);
    });
  }

  return {
    getOffsetFromScreen: getOffsetFromScreen,
    getWindowOffset: getWindowOffset,
  };
});
;
brwsr_req(['underscore', 'jquery', 'util', 'api'], function(_, $, util, Api) {
  let el;

  $(document).on('focus', '*', function(e) {
    el = e.target;
    debouncedOnSetFocus();
  }).on('blur', '*', function(e) {
    el = null;
    debouncedOnSetFocus();
  });

  $(window).on('resize scroll', _.debounce(function(e) {
    debouncedOnSetFocus();
  }));

  var
    debouncedOnSetFocus = _.debounce(onSetFocus, 200);

  function onSetFocus() {
    if (el) {
      util.getOffsetFromScreen(el, function(err, offset) {
        const
          event = {
            type: 'focus',
            data: _.extend(elInfo(el), {offset: offset}),
          };
        Api.trigger(event);
      });
    } else {
      Api.trigger({type: 'blur'});
    }
  }

  function elInfo(el) {
    return {
      nodeName: el.nodeName,
      attributes: _.map(el.attributes, function(attr) {
        return {name: attr.name, value: attr.value};
      }),
    };
  }

  Api.extend({
    dom_setFocusNodeValue: function(input, callback) {
      if (!el) {
        callback('err:dom:el_not_found');
      } else {
        el.value = input.value;
        callback();
      }
    },
  });
});


})(this)