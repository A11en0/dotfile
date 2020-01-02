// LICENSE_CODE ZON
'use strict'; 
define(['underscore', '/util/etask.js', '/bext/pub/backbone.js',
    '/bext/pub/browser.js', '/util/zerr.js', '/svc/vpn/pub/util.js',
    '/util/date.js', '/util/url.js', '/bext/pub/ext.js', '/bext/pub/lib.js',
    '/bext/vpn/util/util.js', '/util/util.js'],
    function(_, etask, be_backbone, B, zerr, vpn_util, date,
    zurl, be_ext, be_lib, be_vpn_util, zutil){
be_vpn_util.assert_bg('be_tabs');
const chrome = window.chrome;
const E = new (be_backbone.model.extend({
    model_name: 'tabs',
    _defaults: function(){ this.on('destroy', ()=>{ E.uninit(); }); },
}))();
const max_redirects = 10;

function active_cb(){
    etask({name: 'active_cb', cancel: true}, function*active_cb_(){
        try {
            const tab = yield E.get_tab(E.get('active.real.id'));
            if (tab && chrome)
            {
                if ((tab.url||'').startsWith(
                    'chrome-devtools://devtools/bundled/devtools.html'))
                {
                    return;
                }
            }
            E.set({'active.id': tab ? tab.id : undefined,
                'active.url': tab ? tab.url : '',
                'active.status': tab ? tab.status : '',
                'active.incognito': tab ? tab.incognito : false,
            });
        } catch(err){ zerr('be_tabs_active_cb_err: '+err); }
    });
}

function is_active(id){ return id==E.get('active.real.id'); }

var tab_trace = {};
function page_trace(details, msg, clear){
    if (!details)
        return;
    var is_main = chrome ? !details.frameId && (!details.type ||
        details.type=='main_frame') : details.is_main;
    if (!is_main && msg!='autoreload')
        return;
    var tab_id = details.tabId;
    if (clear)
        page_trace_del(tab_id);
    var trace = tab_trace[tab_id] = tab_trace[tab_id]||[];
    var ts = details.timeStamp;
    var from_start = trace[0] ? ts-trace[0].ts : 0;
    var prev = trace.length ? trace[trace.length-1] : null;
    if (prev)
        prev.duration = ts-prev.ts;
    var status = details.statusCode || prev&&prev.status || '0';
    trace.push({ts: ts, real_ts: Date.now(), from_start: from_start, msg: msg,
        status: status, error: details.error});
    zerr.debug('tab:%d navigation %s %s', tab_id, msg, details.url.slice(0,
        200));
}

function page_trace_del(tab_id){
    delete tab_trace[tab_id];
}

E.page_trace = page_trace;
E.get_trace = tab_id=>{
    var trace = tab_trace[tab_id];
    if (!trace || !trace.length)
        return trace;
    trace[trace.length-1].duration = Date.now()-trace[trace.length-1].real_ts;
    return trace;
};

function on_created(tab){
    set_url(tab.id, tab.url);
    E.trigger('created', {tab});
}

function on_updated(id, info, tab){
    if (!info.url && !info.status) 
        return;
    set_url(id, info.url);
    if (is_active(id))
        E.sp.spawn(active_cb());
    E.trigger('updated', {id, info, tab});
}

function on_activated(info){ E.set('active.real.id', info.tabId); }

function on_removed(id, info){
    del_tab(id);
    track_redirect_del(id);
    page_trace_del(id);
    E.trigger('removed', {id, info});
}

function on_replaced(added, removed){
    del_tab(removed);
    track_redirect_del(removed);
    page_trace_del(removed);
    if (is_active(removed))
        E.set('active.real.id', added);
    E.trigger('replaced', {added, removed});
}

var chrome_error_list = ['ACCESS_DENIED', 'BLOCKED_BY_ADMINISTRATOR',
    'CONNECTION_REFUSED', 'CONNECTION_FAILED', 'NAME_NOT_RESOLVED',
    'ADDRESS_UNREACHABLE', 'CERT_ERROR_IN_SSL_RENEGOTIATION',
    'NAME_RESOLUTION_FAILED', 'NETWORK_ACCESS_DENIED',
    'SSL_HANDSHAKE_NOT_COMPLETED', 'SSL_SERVER_CERT_CHANGED',
    'CERT_COMMON_NAME_INVALID', 'CERT_AUTHORITY_INVALID',
    'CERT_CONTAINS_ERRORS', 'CERT_INVALID', 'INVALID_RESPONSE',
    'EMPTY_RESPONSE', 'INSECURE_RESPONSE', 'DNS_MALFORMED_RESPONSE',
    'DNS_SERVER_FAILED', 'DNS_SEARCH_EMPTY', 'TIMED_OUT', 'CONNECTION_CLOSED',
    'ABORTED', 'CONNECTION_RESET'];
function on_error_occured(info){
    if (info.frameId!=0)
        return;
    var err = info.error||'';
    err = err.split('::ERR_')[1];
    if (chrome && (!err || !chrome_error_list.includes(err)))
        return;
    info.http_status_code = 0;
    E.trigger('error_occured', {id: info.tabId, info});
}

const WINDOW_ID_NONE = chrome ? -1 : null;
function on_focused(id){
    if (id===WINDOW_ID_NONE)
        return;
    E.set('active.window.id', id);
    chrome.tabs.query({active: true, windowId: id}, tabs=>{
        if (tabs.length)
            E.set('active.real.id', tabs[0].id);
    });
}
var nav_tabs = {};
function on_before_navigate(info){
    if (!info.frameId)
        nav_tabs[info.tabId] = info.url;
    var trace, clear = true;
    if (!info.frameId && (trace = tab_trace[info.tabId]))
    {
        var i, now = Date.now();
        for (i = trace.length-1; i>=0 && trace[i].msg!='autoreload'; i--);
        if (i>=0 && now-trace[i].real_ts<2*date.ms.SEC)
            clear = false;
    }
    page_trace(info, 'before_navigate', clear);
    if (!info.frameId && is_active(info.tabId)) 
        active_cb();
    E.trigger('before_navigate', info);
}

function on_completed(info){
    page_trace(info, 'completed');
    if (is_active(info.tabId))
        active_cb();
    E.trigger('completed', info);
}

function on_committed(details){
    page_trace(details, 'committed');
    E.trigger('committed', {id: details.tabId, info: details});
    if (!details.frameId && details.tabId && details.url)
    {
        var qualifiers = details.transitionQualifiers;
        if (qualifiers && qualifiers.includes('client_redirect'))
        {
            track_redirect({id: details.tabId, url: details.url,
                info: details});
        }
        else if (!qualifiers.includes('server_redirect'))
            delete tabs_redirect[details.tabId];
        last_committed[details.tabId] = get_root_url(details.url);
    }
    if (false && details.transitionType=='reload')
        E.trigger('reload', details);
}

function get_root_url(url){
    url = zurl.parse(url);
    if (!url.hostname || !url.protocol)
        return;
    url = url.protocol+'//'+url.hostname+'/';
    return vpn_util.get_root_url(url);
}

var tabs_redirect = {}, last_committed = {};
function track_redirect(tab){
    let url;
    if (!chrome || !tab || tab.id===undefined ||
        !(url = tab.url||E.urls[tab.id]))
    {
        return;
    }
    let list = tabs_redirect[tab.id] = tabs_redirect[tab.id]||{redirects: []};
    let last_url = last_committed[tab.id], from_url = get_root_url(url);
    let to_url, headers;
    if (headers = tab.info && tab.info.responseHeaders)
    {
        let h;
        if (h = headers.find(e=>e.name.toLowerCase()=='location'))
            to_url = h.value;
        to_url = to_url && get_root_url(to_url);
    }
    if (!to_url && tab.info && tab.info.transitionQualifiers)
    {
        to_url = get_root_url(url);
        from_url = last_url;
    }
    const redirects = list.redirects;
    if (!from_url || !to_url || from_url==to_url || redirects.length &&
        redirects[redirects.length-1].from==from_url)
    {
        return;
    }
    redirects.push({to: to_url, from: from_url, url, ts: Date.now()});
    if (redirects.length==max_redirects)
    {
        if (!list.is_max && E.get_redirect_list(tab.id, max_redirects,
            true).length==max_redirects)
        {
            let urls = list.redirects.map(e=>e.url);
            be_lib.perr_err({id: 'be_max_redirect_sequence',
                info: {urls, rate_limit: {count: 1}}});
            E.trigger('max_redirect_sequence', from_url, to_url, urls);
            list.is_max = true;
        }
        redirects.shift();
    }
    if (list.to)
        be_vpn_util.clear_timeout(list.to);
    list.to = be_vpn_util.set_timeout(()=>list.redirects = [],
        2*date.ms.MIN);
}

function get_redirect_sequence(tab_id, url, ts_limit, limit){
    var list;
    if (!(list = tabs_redirect[tab_id]))
        return [];
    list = ts_limit ? list.redirects.filter(e=>e.ts>ts_limit) : list.redirects;
    if (!list.length || list.some(e=>e.from=='hola.org'))
        return [];
    var ts, parent_url, i, root_urls = [];
    for (i = 0, parent_url = list.find(e=>e.to==url); parent_url &&
        i<max_redirects; i++)
    {
        if (ts && ts<=parent_url.ts)
            break;
        root_urls.unshift(parent_url.from);
        if (!ts)
            ts = parent_url.ts;
        list.splice(0, list.indexOf(parent_url)+1);
        parent_url = list.find(e=>e.to==parent_url.from);
    }
    return root_urls.splice(0, limit||4);
}

function track_redirect_del(tab_id){
    if (tab_id===undefined)
        return;
    if (last_committed[tab_id])
        delete last_committed[tab_id];
    if (tabs_redirect[tab_id])
    {
        if (tabs_redirect[tab_id].to)
            be_vpn_util.clear_timeout(tabs_redirect[tab_id].to);
        delete tabs_redirect[tab_id];
    }
}

E.track_redirect = track_redirect;
E.get_redirect_list = (tab_id, limit)=>{
    var time_limit = Date.now()-120*date.ms.SEC;
    var active_url = E.get('active.url');
    active_url = active_url && get_root_url(active_url);
    return get_redirect_sequence(tab_id, active_url, time_limit, limit);
};

E.init = ()=>{
    if (E.inited)
        return;
    E.sp = be_vpn_util.new_etask('be_tabs');
    E.listen_to(be_ext, 'change:ext.active', update_state);
    E.urls = {};
    chrome.tabs.query({}, tabs=>{
        if (!tabs)
            return;
        for (var i=0; i<tabs.length; i++)
            set_url(tabs[i].id, tabs[i].url);
    });
    chrome.windows.getLastFocused({}, win=>{
        if (win)
            on_focused(win.id);
    });
    chrome.tabs.onCreated.addListener(on_created);
    chrome.tabs.onUpdated.addListener(on_updated);
    chrome.tabs.onActivated.addListener(on_activated);
    chrome.tabs.onRemoved.addListener(on_removed);
    chrome.tabs.onReplaced.addListener(on_replaced);
    chrome.windows.onFocusChanged.addListener(on_focused);
    set_navigation_listeners();
    E.on_init('change:active.real.id', active_cb);
    E.inited = true;
};

E.on_before_rule_set = function(){
    if (!zutil.is_mocha())
        handler_behavior_changed();
};

E.uninit = ()=>{
    if (!E.inited)
        return;
    E.sp.return();
    chrome.tabs.onCreated.removeListener(on_created);
    chrome.tabs.onUpdated.removeListener(on_updated);
    chrome.tabs.onActivated.removeListener(on_activated);
    chrome.tabs.onRemoved.removeListener(on_removed);
    chrome.tabs.onReplaced.removeListener(on_replaced);
    chrome.windows.onFocusChanged.removeListener(on_focused);
    E.off('change:active.real.id', active_cb);
    del_navigation_listeners();
    E.stopListening();
    E.inited = false;
    E.urls = undefined;
    E.clear();
};

function set_navigation_listeners(){
    if (E.nav_listening)
        return;
    E.nav_listening = true;
    if (zutil.get(chrome, 'webNavigation.onBeforeNavigate'))
        chrome.webNavigation.onBeforeNavigate.addListener(on_before_navigate);
    if (zutil.get(chrome, 'webNavigation.onCompleted'))
        chrome.webNavigation.onCompleted.addListener(on_completed);
    if (zutil.get(chrome, 'webNavigation.onErrorOccurred'))
        chrome.webNavigation.onErrorOccurred.addListener(on_error_occured);
    if (zutil.get(chrome, 'webNavigation.onCommitted'))
        chrome.webNavigation.onCommitted.addListener(on_committed);
}

function handler_behavior_changed(){
    if (zutil.get(chrome, 'webRequest.handlerBehaviorChanged'))
        chrome.webRequest.handlerBehaviorChanged();
}

function del_navigation_listeners(){
    if (!E.nav_listening)
        return;
    E.nav_listening = false;
    if (zutil.get(chrome, 'webNavigation.onBeforeNavigate'))
    {
        chrome.webNavigation.onBeforeNavigate
        .removeListener(on_before_navigate);
    }
    if (zutil.get(chrome, 'webNavigation.onCompleted'))
        chrome.webNavigation.onCompleted.removeListener(on_completed);
    if (zutil.get(chrome, 'webNavigation.onErrorOccurred'))
        chrome.webNavigation.onErrorOccurred.removeListener(on_error_occured);
    if (zutil.get(chrome, 'webNavigation.onCommitted'))
        chrome.webNavigation.onCommitted.removeListener(on_committed);
}

E.get_tab = tab_id=>{
    if (!tab_id)
        return null;
    return etask.cb_apply(chrome.tabs, '.get', [tab_id]);
};

E.get_nav_tab_url = id=>nav_tabs[id];
E.get_nav_tabs = ()=>nav_tabs;
function del_tab(id){
    delete nav_tabs[id];
    if (!E.urls[id])
        return;
    delete E.urls[id];
    E.trigger('url_updated', id);
}

function set_url(id, url){
    if (!url || url==E.urls[id])
        return;
    E.urls[id] = url;
    E.trigger('url_updated', id, url);
}

function update_state(){
    var is_active = be_ext.get('ext.active');
    if (E.is_active==is_active)
        return;
    E.is_active = is_active;
    del_navigation_listeners();
    if (!E.is_active)
        return;
    set_navigation_listeners();
}

E.has_root_url = root_url=>
    Object.values(E.urls||{}).some(url=>get_root_url(url)==root_url);

E.get_url = tab_id=>E.urls && E.urls[tab_id];

E.active = ()=>E.get_tab(E.get('active.id'));

E.reload = (tab_id, url)=>{
    if (!url)
        return void chrome.tabs.reload(tab_id, {bypassCache: true});
    chrome.tabs.update(tab_id, {url, active: true});
};

var tabs_suggestions = {};
E.set_force_suggestion = (tab_id, val)=>{
    tabs_suggestions[tab_id] = val;
};

E.is_force_suggestion = tab_id=>tabs_suggestions[tab_id];

E.t = {get_redirect_sequence, tabs_redirect};

return E; });
