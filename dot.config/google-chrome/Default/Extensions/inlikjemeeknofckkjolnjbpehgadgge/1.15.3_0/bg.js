import {start, report} from './ui/lib/error-reporter.js';
// start({app: CFG.CLIENT.NAME, url: CFG.URL.ER, version: CFG.VERSION, id: auth.getId()});
// throw new Error("some err")

window.service = new Service();
window.store = {
  SimpleStore: SimpleStore,
  Prefs: Prefs,
  ActionStore: ActionStore,
  AttrStore: AttrStore,
  ClientStore: ClientStore,
  ErrorStore: ErrorStore,
  KVStore: KVStore,
  PopupMessageStore: PopupMessageStore,
  RuleStore: RuleStore,
  SieveStore: SieveStore,
  SieveDataStore: SieveDataStore,
  SieveDataProxy,
  TagStore: TagStore,
  UserStore: UserStore,
  WorkStore: WorkStore,
  ClientGroupStore: ClientGroupStore
};

window.initLocale = function initLocale() {
  if (Prefs.get('locale')) {
    return;
  }
  const
    osLocale = chrome.i18n.getUILanguage();


  const lang = osLocale.split(/[-_]/)[0];

  if (['de', 'fr', 'ja', 'ru', 'zh', 'es', 'it', 'pl', 'pt', 'sr'].indexOf(lang) >= 0) {
    Prefs.set('locale', lang);
  }
};

service.on('init:data', function() {
  service.setActive(Prefs.get('active'));
});

Prefs.on('change:active', function(active, name) {
  service.setActive(active);
  setActionIcon(active);
});

gEvents.on('change:unread', function(count) {
  chrome.browserAction.setBadgeText({
    text: count == 0 ? '' : count+'',
  });
});

chrome.runtime.onConnect.addListener(function(port) {
  if (!port.sender.tab) {
    handleBGPort(port);
  } else {
    handlePort(port);
  }
});

window.handleBGPort = function handleBGPort(port) {
  // First message from a frame in background page, always created by a loader.
  // 1. Send message to confirm this to content script that it in bg
  // 2. Content script will send back its attributes which will contain
  //    info about its parent frames.
  // 3. Attach port with loader
  port.postMessage({type: 'bg'});

  port.onMessage.addListener(onPortMessage); // A one time listener
  port.onDisconnect.addListener(onPortDisconnect);

  function onPortMessage(msg) {
    port.onMessage.removeListener(onPortMessage); // Remove one time listener
    if (msg.type == 'update') {
      port.attrs = msg.data;
      handlePort(port);
    }
  }

  function onPortDisconnect() {
    port.onMessage.removeListener(onPortDisconnect);
    port.onMessage.removeListener(onPortMessage);
  }
};

window.handlePort = function handlePort(port) {
  const
    name = port.name;


  const type = name.substring(0, name.indexOf(':'));

  switch (type) {
    case 'loader':
      if (!port.attrs) {
        port.attrs = JSON.parse(name.substring('loader:'.length));
      }

      if (!loaderAttachPort(port)) {
        port.disconnect();
      }
      break;

    case 'selector':
      if (!selectorAttachPort(port)) {
        port.disconnect();
      }
      break;

    default:
      port.disconnect();
  }
};

// Handles messages sent by child frames created by loaders.
addEventListener('message', function(event) {
  // console.log('EXTN:message:', event);
  const
    source = event.source;


  const child = (event.data || {}).distillchildport;

  if (child) {
    // console.log('EXTN:message:send message to child:', child);
    source.postMessage({
      distillparentport: {id: 'BG'},
      forChild: child,
    }, '*');
  }
}, false);

window.addFeedForTab = function addFeedForTab(callback) {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    if (!testURL(tabs[0].url)) {
      callback(' Page with unsupported url:' + tabs[0].url);
      return;
    }

    chrome.tabs.create({
      active: true,
      openerTabId: tabs[0].id,
      url: CFG.URL.BASE + 'ui/feed.html?url=' + tabs[0].url,
    });
    callback();
  });
};

window.addSieveForTemplate = function addSieveForTemplate(tab, tplId) {
  chrome.tabs.create({
    active: true,
    url: service.appUrl + '#add/tpl-' + tplId + '/url-' + encodeURIComponent(tab.url) + '/'+encodeURIComponent(tab.title),
  }, function(newTab) {
    // Do nothing
  });
};

// Miscellaneous APIs
window.openSelector = function openSelector(callback) {
  callback || (callback = function() {});
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    if (!testURL(tabs[0].url)) {
      alert('Page with unsupported url: ' + tabs[0].url);
      return;
    }

    // Create loader for the tab and call openSelectorForTabLoader
    const loader = createLoader({
      type: 'tab',
      info: {
        tabId: tabs[0].id,
      },
    }, function(err, loader) {
      if (err) return callback(err);
      else callback();

      const selector = openSelectorForTabLoader({
        loader: loader,
        state: {
          selectorOn: true,
        },
      }, function(err, model) {
        if (err) {
          DBG && console.error('Visual Selector failed to work correctly:', err);
          // TODO Log error for user to see?
          destroy();
        } else if (model) {
          _.defaults(model, {
            schedule: JSON.stringify({
              type: 'INTERVAL',
              params: {interval: 1800},
            }),
            state: 20, // STATE_INIT
          });

          loader.port_request(0, {
            path: 'showMsg',
            data: {msg: 'Saving...'},
          }, function() {});

          SieveStore.create(model, function(err, doc) {
            if (err) {
              alert('Error saving model to DB. ' + (err.msg || err.message || err));
            } else {
              destroy();
              chrome.tabs.create({
                active: true,
                openerTabId: tabs[0].id,
                url: service.appUrl+'#edit/'+doc.id,
              });
            }
          });
        } else {
          // noop
          destroy();
        }
      });

      function destroy() {
        selector.destroy();
        loader.destroy();
      }
    });
  });
};

window.openSelectorForTabLoader = function openSelectorForTabLoader(options, resultCallback) {
  return new VisualSelector(options, resultCallback);
};

window.isActive = function isActive() {
  return Prefs.get('active');
};

window.toggleService = function toggleService() {
  Prefs.set('active', !Prefs.get('active'));
};

window.watchTab = function watchTab(callback) {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    if (!testURL(tabs[0].url)) {
      alert('Page with unsupported url:' + tabs[0].url);
      callback();
      return;
    }

    const model = {
      content_type: 2, // C.TYPE_HTML
      config: JSON.stringify({
        includeStyle: true,
        selections: [{
          uri: tabs[0].url,
          frames: [{
            index: 0,
            uri: tabs[0].url,
            excludes: [],
            includes: [{
              expr: '/html',
              type: 'xpath',
            }],
          }],
        }],
      }),
      schedule: JSON.stringify({
        type: 'INTERVAL',
        params: {interval: 1800},
      }),
      name: tabs[0].title || 'Untitled',
      uri: tabs[0].url,
      state: 20, // STATE_INIT
    };
    SieveStore.create(model, callback);
  });
};

window.logger = function logger(err) {
  err && console.error('Error adding action: ', err);
};

window.setActionIcon = (active) => {
  chrome.browserAction.setIcon({
    path: active ? {
      19: '/ui/img/distill_19.png',
      38: '/ui/img/distill_38.png',
    }: {
      19: '/ui/img/distill_disabled_19.png',
      38: '/ui/img/distill_disabled_38.png',
    },
  });
};

// setActionIcon(Prefs.get('active'));
// Set bg color for other chromium based browsers
chrome.browserAction.setBadgeBackgroundColor({
  color: '#c00',
});

window.testURL = function testURL(url) {
  return /^(http:|https:)/i.test(url);
};

window.removeBlanks = function removeBlanks() {
  chrome.tabs.query({
    pinned: true,
    url: CFG.URL.BLANK,
  }, function(tabs) {
    chrome.tabs.remove(_.pluck(tabs, 'id'));
  });
};

// initLocale();
// removePinnedTabs();
// removeBlanks();

