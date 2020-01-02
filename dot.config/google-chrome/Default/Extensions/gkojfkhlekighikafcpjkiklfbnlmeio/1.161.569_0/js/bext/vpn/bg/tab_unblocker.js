// LICENSE_CODE ZON
'use strict'; 
define(['underscore', '/bext/pub/backbone.js',
    '/util/etask.js', '/bext/pub/util.js', '/bext/vpn/bg/tabs.js',
    '/bext/pub/ext.js', '/bext/pub/browser.js', '/svc/vpn/pub/util.js',
    '/util/escape.js', '/bext/pub/lib.js', '/util/url.js', '/util/date.js',
    '/util/zerr.js', '/util/browser.js', '/bext/vpn/util/util.js',
    '/util/util.js', '/bext/vpn/bg/pac.js', '/util/array.js',
    '/util/attrib.js', '/util/string.js', '/svc/vpn/pub/unblocker_lib.js',
    '/util/storage.js', '/util/ajax.js',
    '/bext/vpn/bg/info.js', '/bext/vpn/bg/mitm_lib.js',
    '/bext/vpn/bg/svc.js', '/bext/vpn/bg/premium.js',
    '/bext/vpn/bg/trial.js', '/util/version_util.js',
    '/util/rate_limit.js', '/util/match.js', '/bext/vpn/bg/util.js',
    '/svc/vpn/pub/util.js', '/bext/vpn/bg/pac_engine.js',
    '/bext/vpn/bg/dev_mode.js'],
    function(_, be_backbone, etask, be_util, be_tabs, be_ext,
    B, svc_util, zescape, be_lib, zurl, date, zerr, browser,
    be_vpn_util, zutil, be_pac, array, attrib, string, unblocker_lib,
    storage, ajax, be_info, mitm_lib, be_svc, be_premium, be_trial,
    version_util, rate_limit, match, bg_util, svc_vpn_util, pac_engine,
    be_dev_mode){
be_trial = be_trial.default;
be_dev_mode = be_dev_mode.default;
be_info = be_info.default;
be_pac = be_pac.default;
be_svc = be_svc.default;
be_premium = be_premium.default;
bg_util = bg_util.default;
be_vpn_util.assert_bg('be_tab_unblocker');
function get_bg_main(){ return window.be_bg_main; }
const assign = Object.assign, chrome = window.chrome;
let proxy_debug, debug_hooks;
let requests_handler;
const E = new (be_backbone.model.extend({
    model_name: 'tab_unblocker',
    tab_unblockers: {}, requests: {},
    agent_requests: {}, internal_reqs: {}, routing_reqs: {},
    _defaults: function(){ this.on('destroy', ()=>E.uninit()); },
}))();
const cb_wrapper = zutil.is_mocha() ? (func, obj)=>func.bind(obj) :
    zerr.catch_unhandled_exception;
let bext_config = {};
const is_chrome = be_util.browser_guess.browser=='chrome';
const is_firefox = be_util.browser_guess.browser=='firefox';
const force_strategy = storage.get('be_force_strategy');
const load_errors = {}, tab_loads = {};
const status_rx = /^HTTP\/(\d\.\d) (\d{3})( (.*))?$/;
const DEBUG_REQS = [
    {url: /netflix|nflx/i, status: 420, info: get_nflx_info, vpn_dns: 1},
];
const mitm_tab_hooks = [
    {l: 'onBeforeRequest', cbname: 'on_before_request', extra_opt: true},
    {l: 'onCompleted', cbname: 'on_completed'},
    {l: 'onErrorOccurred', cbname: 'on_error_occurred'},
];
const err_logs_len = 20;
const req_types = {media: {chrome: {min_ver: 58}, opera: {min_ver: 45}}};
let request_errors = [];

function get_nflx_info(d){
    let hdrs, session, ip;
    if (!(hdrs = d&&d.responseHeaders))
        return '';
    const print = ['x-netflix-geo-check', 'x-session-info', 'x-tcp-info'];
    const get_hdr = n=>{
        n = n.toLowerCase();
        return zutil.get(hdrs.find(h=>h.name.toLowerCase()==n), 'value');
    };
    let ret = print.map(p=>p+':'+get_hdr(p)).join(';');
    if ((session = get_hdr('x-session-info')) &&
        (ip = session.match(/^addr=([\d.]+);/)) && ip[1])
    {
        ret = 'ip:'+ip[1]+';'+ret;
    }
    return ret;
}

const ff_exported = []; 
function ff_cb_wrapper(name){
    const args = array.slice(arguments, 1);
    const wrapped = zerr.catch_unhandled_exception.apply(zerr, args);
    ff_exported.push({fn: wrapped, name: name});
    return wrapped;
}

function is_main_frame(details){
    return !details.frameId && details.type=='main_frame'; }

let hola_req_id = 0;
function make_internal_request(url, hdrs, opt){
    let req_url;
    req_url = opt.no_redirect ? url : 'http://internal.hola/'+(++hola_req_id);
    E.internal_reqs[req_url] = {url, hdrs, opt};
    return req_url;
}
function hola_XMLHttpRequest(url, method, hdrs, opt){
    const xhr = new XMLHttpRequest();
    const req_url = make_internal_request(url, hdrs, opt);
    xhr.hola_url = req_url;
    xhr.open(method, req_url);
    return xhr;
}

function hdrs_arr_to_obj(hdrs){
    const _hdrs = {};
    hdrs.forEach(e=>_hdrs[e.name] = e.value);
    return _hdrs;
}

function routing_reqs_set(details, req){
    let url = req.url;
    if (!E.routing_reqs[url])
        E.routing_reqs[url] = {req};
    E.routing_reqs[url].to = be_vpn_util.set_timeout(
        ()=>(delete E.routing_reqs[url]), 10000, {sp: E.sp,
        name: 'del_routing_reqs'});
}

function send_direct_ajax(req){
    if (req.direct_req)
        return;
    req.hdrs = hdrs_arr_to_obj(req.hdrs);
    req.hdrs['Cache-Control'] = 'no-cache';
    try {
        const xhr = req.direct_req = hola_XMLHttpRequest(req.url, req.method,
            req.hdrs, {force: 'direct', ignore_redir: true, no_routing: true});
        xhr.onreadystatechange = cb_wrapper(function(){
            let cmd;
            if (xhr.readyState===xhr.DONE)
            {
                let ir = E.internal_reqs[req.url]||{};
                if (!req.direct_resp && ir.res)
                    req.direct_resp = {code: ir.res.code, error: ir.res.error};
                cmd = req.strategy(req.direct_resp, req.proxy_resp)||{};
                delete E.internal_reqs[req.url];
                delete E.internal_reqs[xhr.hola_url];
            }
            if (xhr.readyState!=xhr.HEADERS_RECEIVED)
                return;
            req.direct_resp = {
                code: xhr.status,
                len: xhr.getResponseHeader('Content-Length'),
                te: xhr.getResponseHeader('Transfer-Encoding'),
                lmod: xhr.getResponseHeader('Last-Modified'),
                etag: xhr.getResponseHeader('Etag'),
                type: xhr.getResponseHeader('Content-Type'),
            };
            function direct_req_abort(){
                if (req.direct_req.abort)
                    return req.direct_req.abort();
            }
            req.direct_timeout = be_vpn_util.clear_timeout(req.direct_timeout);
            cmd = req.strategy(req.direct_resp, req.proxy_resp)||{};
            if (cmd.proxy.serve && !cmd.direct.serve)
                return void direct_req_abort();
            const cc = xhr.getResponseHeader('Cache-Control');
            if (cc && (/no-store/.test(cc)
                || /(no-cache|must-revalidate|max-age)/.test(cc)
                && !req.direct_resp.lmod && !req.direct_resp.etag))
            {
                direct_req_abort();
            }
        });
        xhr.send();
    } catch(e){}
}

function nodify_res(details){
    let ret, n = details.statusLine.match(status_rx);
    if (!n)
    {
        be_lib.perr_err({id: 'bad_status_line', rate_limit: {count: 2},
            info: {statusLine: details.statusLine, url: details.url,
            method: details.method, statusCode: details.statusCode}});
        n = [null, '1.1', details.statusCode, ' ', ''];
    }
    ret = {
        httpVersion: n[1],
        statusCode: +n[2],
        reasonPhrase: n[4]||'',
        headers: {},
    };
    if (!details.responseHeaders)
        return ret;
    try {
        details.responseHeaders.forEach(function(hdr){
            ret.headers[hdr.name.toLowerCase()] = hdr.value; });
    } catch(e){}
    return ret;
}

function hdrs_add(hdrs, name, value){
    hdrs.push({name, value});
    return true;
}

class Bw_perr_acc {
    constructor(){
        this.data = {};
    }
    _send(bw_rule, acc){
        acc.id = bw_rule.id;
        be_lib.perr_ok({id: 'req_bw', info: {len: acc.len, ms: acc.ms,
            bw: acc.len*1000/acc.ms,
            id: acc.id, country: acc.rule && acc.rule.country}});
        delete this.data[bw_rule.id];
    }
    push(bw_rule, req){
        let acc = this.data[bw_rule.id];
        if (acc && acc.rule!=req.opt.rule)
            this._send(bw_rule, acc);
        acc = this.data[bw_rule.id] = this.data[bw_rule.id]||{len: 0, ms: 0,
            rule: req.opt.rule};
        acc.len += +req.proxy_resp.len;
        acc.ms += Date.now()-req.start_ts;
        if (acc.len>(bw_rule.sample_size||10*1024*1024))
            this._send(bw_rule, acc);
    }
}

let bw_perr_acc = new Bw_perr_acc();

function get_site_verify_conf(req, rule){
    if (!req || !req.proxy_resp || !rule)
        return false;
    if (req.method!='GET')
        return false;
    return be_util.get_site_verify_conf(rule.name, req.url, rule.country);
}

const is_trial = root_url=>!be_premium.is_active() &&
    (!!be_trial.get_trial_active(root_url) ||
    be_trial.is_trial_grace_period(root_url));

function is_force_proxy(country, opt){
    opt = opt||{};
    const r = opt.rule, tu = opt.tab_unblocker||{};
    if (!r || !r.name || !be_ext.get('is_premium') && (!E.rules ||
        (E.rules.blacklist||{})[r.name] || tu.force_premium))
    {
        return;
    }
    return is_trial(r.name) || be_premium.is_active() && (r.mode=='protect' ||
        tu.force_premium || be_ext.get('is_premium'));
}

function get_forced_strategy(details, rule, mitm_rule, strict, opt){
    let force;
    if (force = strict||opt.force)
        return force;
    if (opt.no_rule || !be_ext.get('is_premium') && rule.name &&
        be_util.is_google(rule.name) && (!mitm_rule ||
        mitm_rule.cmd=='ignore'))
    {
        return 'direct';
    }
}

function on_hooks_err(id, err){
    be_lib.perr_err({id, err, rate_limit: {count: 1}}); }

function is_redir_status(status, tmp_only){
    return {302: 1, 303: 1, 307: 1}[status] || !tmp_only && +status==301; }

const debug_bw_req = {};

function debug_bw(event, d){
    switch (event)
    {
    case 'headers_received':
        debug_bw_req[d.requestId] = {url: d.url, ts: Date.now()};
        break;
    case 'completed':
        let t = Date.now();
        let headers = d.responseHeaders;
        let len_o = headers && headers.find(o=>o.name=='Content-Length');
        let len = +zutil.get(len_o, 'value');
        if (len)
        {
            let dur = t - d.timeStamp;
            let dur2 = t - debug_bw_req[d.requestId].ts;
            let bw = dur ? len/dur2/1000 : 0;
            console.log('XXX on_completed dur %sms dur2 %s len %sb bw '+
                '%sMB/s %o', dur, dur2, len, parseInt(bw), d);
        }
        break;
    default: zerr('unexpected debug_bw event %s %o', event, d); break;
    }
}

let debug_pac_interval;
function start_debug_pac(){
    stop_debug_pac();
    debug_pac_interval = setInterval(()=>{
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://__hola__.pac_get_log.local.hola/?rnd='+
            Math.random(), true);
        xhr.send(null);
    }, 1000);
}

function stop_debug_pac(){
    debug_pac_interval = clearInterval(debug_pac_interval);
}

class Base_handler {
    constructor(){
        this.listener_opt = {urls: ['<all_urls>']};
        this.listener_extra_opt = ['blocking', 'requestBody'];
        this.tab_unblocker_end_cb = cb_wrapper(
            this._unsafe_tab_unblocker_end_cb.bind(this));
        this.on_before_send_headers = this.wrap('on_before_send_headers', d=>{
            this.tab_unblocker_cb(d = assign({}, d, {handler:
                this._on_before_send_headers.bind(this),
                cbname: 'on_before_send_headers', ret: {}}));
            return d.ret;
        }, true);
        this.on_headers_received = this.wrap('on_headers_received', d=>{
            this.tab_unblocker_cb(d = assign({}, d, {handler:
                this._on_headers_received.bind(this),
                cbname: 'on_headers_received', ret: {}}));
            return d.ret;
        }, true);
        this.on_completed = this.wrap('on_completed', d=>{
            this.tab_unblocker_end_cb(d = assign({}, d, {cbname:
                'on_completed', ret: {}}));
            delete this.cached_reqid[d.requestId];
            return d.ret;
        }, true);
        this.on_error_occurred = this.wrap('on_error_occurred', d=>{
            this.tab_unblocker_end_cb(assign(d, {cbname: 'on_error_occurred',
                ret: {}}));
            return d.ret;
        });
        this.on_headers_received_cache = cb_wrapper(d=>{
            let url;
            if (!E.rules || !(url = be_tabs.get_nav_tab_url(d.tabId)))
                return;
            if (_.findWhere(E.rules.unblocker_rules, {enabled: true,
                link: svc_util.get_root_url(url)}) &&
                !this.cached_reqid[d.requestId])
            {
                this.cached_reqid[d.requestId] = true;
                return {redirectUrl: zescape.uri(d.url, {ts: Date.now()})};
            }
        });
        this.on_headers_received_page = cb_wrapper(d=>{
            if (!d || !is_main_frame(d))
                return;
            let status = d.statusCode;
            if (status===undefined)
            {
                status = d.statusLine;
                if (typeof status!='string')
                    return;
                if (status = status.match(status_rx))
                    status = status[2]||null;
                if (status===null)
                    return;
            }
            else
                status += '';
            d.statusCode = status;
            be_tabs.page_trace(d, 'on_headers_received');
            on_main_frame_headers(d);
            if (is_redir_status(status))
            {
                return be_tabs.track_redirect({id: d.tabId, info: d,
                    url: d.url});
            }
            if (!{4: 1, 5: 1}[status[0]])
                return;
            be_tabs.trigger('error_occured', {id: d.tabId, info: {type: d.type,
                http_status_code: status}});
        });
        this.on_before_send_headers_debug = ff_cb_wrapper(
            'on_before_send_headers_debug', d=>{
            d = assign({}, d, {ret: {}});
            const req = E.requests[d.requestId], agent = req&&req.agent;
            const store = E.tab_unblockers[d.tabId]||this;
            const last_agent = store.last_agent||{};
            if (!agent || agent.ip==last_agent.ip&&agent.port==last_agent.port)
                return d.ret;
            zerr.notice('tab:%d proxy agent selected %O %s', d.tabId, agent,
                req.url.slice(0, 100));
            let rule;
            if (rule = req.opt.rule)
            {
                zerr.notice('tab:%d rule %O', d.tabId, zutil.pick(rule, 'id',
                    'name', 'country', 'description'));
            }
            store.last_agent = agent;
            return d.ret;
        });
        this.on_headers_received_debug = ff_cb_wrapper(
            'on_headers_received_debug', d=>{
            d = assign({}, d, {ret: {}});
            let req, res, tu, host;
            if ((req = E.requests[d.requestId]) && req.agent &&
                (tu = E.get_tab_unblocker(d.tabId)) && (res = nodify_res(d)) &&
                is_hola_agent_auth(res) && (host = req.agent.host))
            {
                host = host.split('.')[0];
                let rl, debug_auth = tu.debug_auth = tu.debug_auth||{};
                if (!(rl = debug_auth[host]))
                    rl = debug_auth[host] = {total: 0};
                rl.total++;
            }
            return d.ret;
        });
        this.on_completed_debug = ff_cb_wrapper('on_completed_debug', d=>{
            const req = E.requests[d.requestId];
            if (!req)
                return;
            const rule = be_vpn_util.get_rule_min_fmt(req.opt.rule);
            const limit = {count: 1, ms: date.ms.MIN};
            const info = {url: req.url, ip: d.ip, method: req.method,
                agent: req.agent, rule: rule};
            let verify;
            if ((verify = get_site_verify_conf(req, rule)) &&
                verify.ret && verify.ret.status==req.proxy_resp.code)
            {
                be_lib.perr_err({id: 'bw_req_err_'+verify.id,
                    rate_limit: limit,
                    info: assign({error: req.proxy_resp.code}, info)});
            }
            const tab_unblocker = E.get_tab_unblocker(d.tabId);
            let min_ver;
            if (tab_unblocker && req.proxy_req && d.ip &&
                (min_ver = bext_config.ip_check_min_ver) &&
                version_util.cmp(be_util.version(), min_ver)>=0 &&
                req.serving=='proxy' && req.agent && req.agent.ip!=d.ip &&
                !d.fromCache)
            {
                be_lib.perr_err({id: 'req_agent_ip_mismatch',
                    rate_limit: {count: 1}, info});
                svc_vpn_util.push_event('pac_miss', {req_ip: d.ip,
                    agent_ip: zutil.get(req, 'agent.ip'), url: req.url});
            }
            if (!d.error || !tab_unblocker)
                return;
            let rl_path = 'debug_errors.'+d.error+'.'+!!req.agent, rl;
            if (!(rl = zutil.get(tab_unblocker, rl_path)))
                zutil.set(tab_unblocker, rl_path, rl = {total: 0});
            rl.total++;
            if (!rate_limit(rl, limit.ms, limit.count))
                return;
            zerr.debug('tab:%d request failed with error %s after %d ms, '
                +'total cnt %d, rule %s, type %s, method %s, agent %s, url %s',
                d.tabId, d.error, Date.now()-req.start_ts, rl.total,
                req.opt.rule&&req.opt.rule.name, d.type, req.method,
                req.agent&&req.agent.host, req.url.slice(0, 200));
        });
        this.on_headers_received_media = ff_cb_wrapper(
            'on_headers_received_media', d=>{
            let media_failure;
            if (!(media_failure = get_failure_config('media')))
                return;
            let req, tab;
            if (d.tabId<0 || !(tab = E.tab_unblockers[d.tabId]) ||
                !(req = E.requests[d.requestId]))
            {
                return;
            }
            tab.media_chunks = tab.media_chunks||0;
            const media_agents = tab.media_agents = tab.media_agents||{};
            const agent = req.agent&&req.agent.host;
            if (d.statusCode==200)
            {
                tab.media_chunks++;
                if (agent)
                {
                    media_agents[agent] = (media_agents[agent]||0)+1;
                    E.be_rule.reset_set_err(tab);
                }
                return;
            }
            if (!/^(4|5)/.test(d.statusCode) || d.statusCode==407)
                return;
            if (agent)
                tab.media_failures = (tab.media_failures||0)+1;
            const debug = DEBUG_REQS.find(f=>f.url.test(d.url) && (!f.status ||
                f.status && f.status==d.statusCode));
            if (debug&&debug.vpn_dns&&agent)
            {
                debug.vpn_dns--;
                etask(function*on_headers_media_(){
                    try {
                        const ret = yield ajax.json({url:
                            'http://'+req.agent.ip+':3358/debug/vpn_dns'});
                        if (!ret || !ret.active_dns)
                            return;
                        zerr.notice('tab:%d agent %s active dns %s', d.tabId,
                            agent, ret.active_dns);
                    } catch(e){
                        zerr.notice('tab:%d agent %s failed to get active dns',
                            d.tabId, agent);
                    }
                });
            }
            zerr.notice('tab:%d media failure detected: %d, %s %s, info: %s',
                d.tabId, d.statusCode, agent, d.url.slice(0, 200),
                debug&&debug.info ? debug.info(d) : '');
            this.dump_media_stats(d.tabId, 'error');
            E.be_rule.fix_media_req_err(zutil.get(req, 'opt.rule'),
                req.agent, d, tab, req.route_opt, media_failure);
        });
    }

    wrap(name, cb, ff){
        const cb_wrap = cb=>ff ? ff_cb_wrapper(name, cb) : cb_wrapper(cb);
        return cb_wrap(cb);
    }

    static get_handler(){
        if (zutil.get(window, 'browser.proxy.onRequest'))
            return new Ff_new_handler();
        return new Chrome_handler();
    }

    init(){
        if (this.inited)
            return;
        this.inited = true;
        this.cached_reqid = {};
        this.update_hooks();
        this.init_media_stats();
        return true;
    }

    uninit(){
        if (!this.inited)
            return;
        this.inited = false;
        this.uninit_media_stats();
        this.update_hooks();
        this.cached_reqid = {};
        return true;
    }

    update_hooks(mode){
        let add_global = ()=>{
            if (!this.global_hooks)
                this.global_hooks = this.add_hooks('main_frame');
        };
        let rm_global = ()=>{
            if (this.global_hooks)
                this.global_hooks = this.remove_hooks(this.global_hooks);
        };
        let add_local = ()=>{
            for (let tabid in E.tab_unblockers)
            {
                let tab = E.tab_unblockers[tabid];
                if (!tab.hooks)
                    tab.hooks = this.add_hooks(tabid);
            }
        };
        let rm_local = ()=>{
            for (let tabid in E.tab_unblockers)
            {
                let tab = E.tab_unblockers[tabid];
                if (tab.hooks)
                    tab.hooks = this.remove_hooks(tab.hooks);
            }
        };
        if (mode=='all_browser')
            return rm_local();
        if (!this.inited)
        {
            rm_global();
            rm_local();
        }
        else
        {
            add_global();
            add_local();
        }
    }

    add_hooks(tabid){
        let hooks = {}, _this = this;
        try {
            if (tabid=='main_frame')
            {
                let topt = {urls: ['<all_urls>'], types: ['main_frame']};
                hooks.on_headers_received_page = this.on_headers_received_page
                    .bind(this);
                chrome.webRequest.onHeadersReceived.addListener(
                    hooks.on_headers_received_page, topt, ['responseHeaders']);
                return hooks;
            }
            tabid = +tabid;
            assign(hooks, {
                on_before_send_headers: this.on_before_send_headers.bind(this),
                on_headers_received: this.on_headers_received.bind(this),
                on_completed: this.on_completed.bind(this),
                on_error_occurred: this.on_error_occurred.bind(this),
            });
            let opt = tabid>=0 ? assign({tabId: tabid}, this.listener_opt) :
                this.listener_opt;
            if (debug_hooks)
            {
                hooks.on_completed_debug = this.on_completed_debug.bind(this);
                chrome.webRequest.onCompleted.addListener(
                    hooks.on_completed_debug, opt);
                hooks.on_error_occurred_debug =
                    this.on_completed_debug.bind(this);
                chrome.webRequest.onErrorOccurred.addListener(
                    hooks.on_error_occurred_debug, opt);
            }
            chrome.webRequest.onBeforeSendHeaders.addListener(
                hooks.on_before_send_headers, opt, ['blocking',
                'requestHeaders']);
            chrome.webRequest.onHeadersReceived.addListener(
                hooks.on_headers_received, opt, ['blocking',
                'responseHeaders']);
            chrome.webRequest.onCompleted.addListener(hooks.on_completed, opt);
            chrome.webRequest.onErrorOccurred.addListener(
                hooks.on_error_occurred, opt);
            let failure_opt;
            if (failure_opt = _this.get_failure_opt(tabid, 'media', opt))
            {
                const hname = 'on_headers_received_media';
                hooks[hname] = _this[hname].bind(_this);
                chrome.webRequest.onHeadersReceived.addListener(
                    hooks[hname], failure_opt, ['responseHeaders']);
                hooks.media_interval = be_vpn_util.set_interval(
                    _this.dump_media_stats.bind(_this, tabid, 'interval'),
                    10*date.ms.MIN, {sp: E.sp, name: 'dump_media_stats'});
            }
            let topt = {urls: ['*://*/*wor*/*i*/1*.js',
                '*://*/*wor*/*i*/2*.js*']};
            if (opt.tabId>=0)
                topt.tabId = opt.tabId;
            hooks.on_headers_received_cache =
                this.on_headers_received_cache.bind(this);
            chrome.webRequest.onHeadersReceived.addListener(
                hooks.on_headers_received_cache, topt, ['blocking',
                'responseHeaders']);
            if (!debug_hooks)
                return hooks;
            hooks.on_before_send_headers_debug =
                this.on_before_send_headers_debug.bind(this);
            chrome.webRequest.onBeforeSendHeaders.addListener(
                hooks.on_before_send_headers_debug, opt, ['blocking',
                'requestHeaders']);
            hooks.on_headers_received_debug =
                this.on_headers_received_debug.bind(this);
            chrome.webRequest.onHeadersReceived.addListener(
                hooks.on_headers_received_debug, opt, ['blocking',
                'responseHeaders']);
        } catch(e){ on_hooks_err('be_add_hooks_err', e); }
        return hooks;
    }

    get_failure_opt(tabid, name, opt){
        let failure;
        if (!(failure = get_failure_config(name)))
            return;
        let types, ext = failure.extensions||[];
        if (types = failure.types)
        {
            const g = be_util.browser_guess;
            types = types.filter(t=>{
                let min;
                return !(min = zutil.get(req_types[t], g.browser+'.min_ver'))
                    || g.version>=min;
            });
        }
        let urls = [], root_url;
        if (root_url = tabid>=0 && be_tabs.get_url(tabid))
            root_url = svc_util.get_root_url(root_url);
        let rules = failure.rules;
        if (root_url)
            rules = rules.filter(r=>r.domain==root_url);
        rules.forEach(r=>{
            if (r.urls)
                urls = urls.concat(r.urls);
            if (r.extensions)
                ext = ext.concat(r.extensions);
        });
        ext = array.unique(ext);
        ext.forEach(e=>urls.push('*://*/*.'+e, '*://*/*.'+e+'?*'));
        urls = array.unique(urls);
        if (urls.length)
            return assign({}, opt, {urls, types});
    }

    init_media_stats(){
        if (this.on_video_progress)
            return;
        E.on('video_progress', this.on_video_progress = msg=>{
            const tab = E.get_tab_unblocker(msg.tab_id);
            if (tab&&msg.progress)
                tab.video_progress = (tab.video_progress||0)+msg.progress;
        });
        E.listenTo(be_ext, 'change:ui_open', this.on_ui_open = function(c, ui){
            if (ui&&ui.tab_id)
                this.dump_media_stats(ui.tab_id, 'ui_open');
        }.bind(this));
    }

    uninit_media_stats(){
        if (this.on_video_progress)
            E.off('video_progress', this.on_video_progress);
        this.on_video_progress = null;
        if (this.on_ui_open)
            E.stopListening(be_ext, 'change:ui_open', this.on_ui_open);
        this.on_ui_open = null;
    }

    dump_media_stats(tab_id, reason){
        const tab = E.get_tab_unblocker(tab_id);
        if (!tab || !tab.media_agents)
            return;
        zerr.debug('tab:%d media stats on %s: %d sec played, %d chunks '
            +'received, agents %O', tab_id, reason, tab.video_progress||0,
            tab.media_chunks||0, tab.media_agents||{});
        tab.media_chunks = 0;
        tab.media_agents = {};
        tab.video_progress = 0;
    }

    remove_hooks(hooks){
        try {
            if (hooks.on_before_send_headers)
            {
                chrome.webRequest.onBeforeSendHeaders.removeListener(
                    hooks.on_before_send_headers);
            }
            if (hooks.on_headers_received)
            {
                chrome.webRequest.onHeadersReceived.removeListener(
                    hooks.on_headers_received);
            }
            if (hooks.on_completed)
            {
                chrome.webRequest.onCompleted.removeListener(
                    hooks.on_completed);
            }
            if (hooks.on_error_occurred)
            {
                chrome.webRequest.onErrorOccurred.removeListener(
                    hooks.on_error_occurred);
            }
            if (hooks.on_headers_received_cache)
            {
                chrome.webRequest.onHeadersReceived.removeListener(
                    hooks.on_headers_received_cache);
            }
            if (hooks.on_headers_received_page)
            {
                chrome.webRequest.onHeadersReceived.removeListener(
                    hooks.on_headers_received_page);
            }
            if (hooks.on_completed_debug)
            {
                chrome.webRequest.onCompleted.removeListener(
                    hooks.on_completed_debug);
            }
            if (hooks.on_error_occurred_debug)
            {
                chrome.webRequest.onErrorOccurred.removeListener(
                    hooks.on_error_occurred_debug);
            }
            if (hooks.on_before_send_headers_debug)
            {
                chrome.webRequest.onBeforeSendHeaders.removeListener(
                    hooks.on_before_send_headers_debug);
            }
            if (hooks.on_headers_received_debug)
            {
                chrome.webRequest.onHeadersReceived.removeListener(
                    hooks.on_headers_received_debug);
            }
            if (hooks.on_headers_received_media)
            {
                chrome.webRequest.onHeadersReceived.removeListener(
                    hooks.on_headers_received_media);
                be_vpn_util.clear_interval(hooks.media_interval);
            }
        } catch(e){ on_hooks_err('be_rm_hooks_err', e); }
    }

    gen_proxy_req(){}

    _on_first_request(details, opt){
        const url = details.url, rule = opt.rule||{};
        let req = E.requests[details.requestId];
        let country = opt.country || rule.country || '';
        if (!req)
        {
            req = E.requests[details.requestId] = {
                id: details.requestId,
                url,
                method: details.method,
                opt,
                route_opt: {direct: 1},
                start_ts: Date.now(),
                tab_id: details.tabId,
                ret: details.ret,
            };
            let strict = !E.internal_reqs[details.url] && force_strategy;
            const mitm_rule = mitm_lib.inited && mitm_lib.get_tab_rule(
                details.tabId, details.initiator || details.url);
            const force = get_forced_strategy(details, rule, mitm_rule, strict,
                opt);
            const proxy_country = country.toUpperCase();
            let min_ver;
            req.strategy = unblocker_lib.handle_request(url, {
                force,
                top_url: rule.name ? zurl.add_proto(rule.name)+'/' :
                    opt.int_req && opt.int_req.hdrs ?
                    opt.int_req.hdrs.Referer : null,
                root_url: rule.name,
                type: details.is_main ? 'main_frame' : details.type,
                method: details.method,
                country: proxy_country, 
                proxy_country,
                src_country: be_info.get('country'),
                premium: !!is_force_proxy(country, opt),
                is_trial: is_trial(rule.name) &&
                    (!(min_ver = bext_config.trial_rules_disable_min_ver) ||
                    version_util.cmp(be_util.version(), min_ver)<0),
                full_vpn: rule.full_vpn,
                strict,
                force_media_direct: true,
            });
            if (mitm_lib.inited && (be_ext.get('is_premium') || !mitm_rule ||
                mitm_rule.auto_unblock || !be_util.is_google(mitm_rule.name)))
            {
                req.strategy = mitm_lib.strategy_wrapper(req.strategy, req,
                    details.initiator||url);
            }
            const t = E.get_tab_unblocker(details.tabId);
            if (t)
            {
                if (proxy_debug)
                {
                    if (t.track.strategy != req.strategy.desc
                        || Date.now() - t.track.last > 30*date.ms.SEC)
                    {
                        if (t.track.counter)
                        {
                            zerr.info('STRATEGY: %s tab:%d - %d urls - %O',
                                t.track.strategy, details.tabId,
                                t.track.counter, Object.keys(t.track.domains));
                        }
                        zerr.info('STRATEGY: %s tab:%d %s', req.strategy.desc,
                            details.tabId, req.url.slice(0, 256));
                        t.track.counter = 0;
                        t.track.strategy = req.strategy.desc;
                        t.track.domains = {};
                        t.track.last = Date.now();
                    }
                    t.track.counter++;
                    t.track.domains[zurl.get_host(req.url)] = true;
                }
                t.req_total_n = (t.req_total_n||0)+1;
                t.req_stats.total_n = (t.req_stats.total_n||0)+1;
            }
        }
        req.proxy_req = false;
        if (req.cancel)
        {
            unblocker_lib.on_before(req.url, req.id, {err: 'cancel'});
            return void (details.ret.cancel = true);
        }
        const cmd = req.cmd = req.strategy(req.direct_resp, req.proxy_resp);
        if (!cmd)
        {
            return void unblocker_lib.on_before(req.url, req.id, details.tabId,
                {err: 'no_cmd'});
        }
        E.set('activity', Date.now());
        country = zutil.get(cmd, 'proxy.country', country);
        if (req.serving)
        {
            if (req.serving=='proxy')
                return void this.gen_proxy_req(req, details, cmd, {country});
        }
        else if (cmd.proxy)
        {
            if (cmd.direct && cmd.direct.serve)
                req.serving = 'direct';
            else if (cmd.proxy.serve)
            {
                req.serving = 'proxy';
                this.gen_proxy_req(req, details, cmd, {country});
            }
            else if (cmd.proxy.start)
                this.gen_proxy_req(req, details, cmd, {country});
            else if (cmd.direct.start)
                req.direct_req = true;
            else if (cmd.proxy.abort)
                return void (details.ret.cancel = true);
            if (cmd.direct && cmd.direct.abort && req.direct_req)
                req.direct_req.abort();
        }
        else if (cmd.direct)
        {
            if (cmd.direct.serve)
                req.serving = 'direct';
            else if (cmd.direct.start)
                req.direct_req = true;
            else if (cmd.direct.abort)
                details.ret.cancel = true;
        }
        unblocker_lib.on_before(req.url, req.id, req.tab_id,
            {strategy: req.strategy && req.strategy.desc, agent: req.proxy_req
            && req.proxy_req.host});
    }

    _on_before_send_headers(details){
        const url = details.url, req = E.requests[details.requestId];
        const req_hdrs = details.requestHeaders;
        let hdrs, modified = 0;
        if (!req || !req.strategy)
            return;
        if (be_dev_mode.get('debug_pac'))
        {
            let proto = zurl.get_proto(url), host = zurl.get_host(url);
            let _url = proto=='http' ? url : proto+'://'+host+'/';
            let ret = pac_engine.FindProxyForURL(_url, host);
            let exp = req.proxy_str||'DIRECT';
            if (ret==exp)
            {
                zerr.notice('virtual_pac FindProxyForURL OK %s exp %s url %s',
                    ret, exp, url);
            }
            else
            {
                zerr('virtual_pac FindProxyForURL MISS %s exp %s url %s',
                    ret, exp, url);
            }
        }
        const int_req = req.opt.int_req;
        if (hdrs = int_req && int_req.hdrs)
        {
            for (let h in hdrs)
                modified |= hdrs_add(req_hdrs, h, hdrs[h]);
        }
        const cmd = req.strategy(req.direct_resp, req.proxy_resp)||{};
        if (req.serving);
        else if (cmd.proxy)
        {
            if (cmd.direct && cmd.direct.start && !req.direct_req)
            {
                req.hdrs = req_hdrs;
                send_direct_ajax(req);
            }
            if (cmd.proxy.start && cmd.proxy.hdrs_only &&
                url.startsWith('http:') && !url.includes(':443/'))
            {
                modified |= hdrs_add(req_hdrs, 'X-Hola-Headers-Only', '1');
            }
        }
        if (modified)
            details.ret.requestHeaders = req_hdrs;
    }

    tab_unblocker_cb(details){
        let url;
        if (!(url = details.url))
            return;
        let tab_unblocker = E.get_tab_unblocker(details.tabId);
        const is_main = is_main_frame(details);
        if (!be_pac.has_pac)
            return;
        let rule_info, req, handler = details.handler;
        if (req = E.requests[details.requestId])
        {
            return handler(details, req.opt);
        }
        if (req = E.routing_reqs[url])
        {
            delete E.routing_reqs[url];
            req.to = be_vpn_util.clear_timeout(req.to);
            req = req.req;
            req.id = details.requestId;
            E.requests[details.requestId] = req;
            return handler(details, req.opt);
        }
        if (req = E.internal_reqs[url])
        {
            if (zurl.get_host(url)=='internal.hola')
            {
                req.reqid = details.requestId;
                E.internal_reqs[req.url] = req;
                delete E.internal_reqs[url];
                req.is_redirected = true;
                return void(details.ret.redirectUrl = req.url);
            }
            if (req.opt&&req.opt.no_redirect)
                req.reqid = details.requestId;
            if (req.reqid==details.requestId)
                return handler(details, assign({}, req.opt, {int_req: req}));
        }
        if (details.requestHeaders || details.responseHeaders)
            return;
        if (is_main)
        {
            rule_info = get_rule_info_from_url(url);
            if (!tab_unblocker)
            {
                if (rule_info && details.tabId!=-1)
                {
                    if (!(tab_unblocker = tab_unblocker_add(details.tabId,
                        rule_info, url)))
                    {
                        return;
                    }
                }
            }
            else if (!rule_info || rule_info.root_url!=tab_unblocker.root_url)
            {
                tab_unblocker_del(details.tabId);
                if (!rule_info || !(tab_unblocker =
                    tab_unblocker_add(details.tabId, rule_info, url)))
                {
                    return;
                }
            }
            let site, redir, force_redir;
            if (tab_unblocker && rule_info && rule_info.rule.src=='trial' &&
                (site = tab_unblocker.site_conf) &&
                (redir = zutil.get(site, 'trial.trial_redirect')) &&
                (force_redir = zutil.get(site, 'trial.trial_force_redirect')))
            {
                const now = Date.now();
                if (tab_unblocker.prev_url==redir && url!=force_redir &&
                    now-tab_unblocker.prev_url_ts<=5*date.ms.SEC)
                {
                    tab_unblocker.prev_url = tab_unblocker.prev_url_ts = null;
                    unblocker_lib.on_before(url, details.requestId,
                        details.tabId, {force_redir});
                    return void(details.ret.redirectUrl = force_redir);
                }
                tab_unblocker.prev_url = url;
                tab_unblocker.prev_url_ts = now;
            }
        }
        if (!is_vpn_allowed(url, is_main, details))
            return;
        let rule = tab_unblocker && tab_unblocker.rule;
        if (!tab_unblocker && details.tabId==-1 && details.frameId==-1)
        {
            let tab_id = be_tabs.get('active.id');
            tab_unblocker = E.get_tab_unblocker(tab_id);
            if (rule_info || (rule_info = get_rule_info_from_url(url)))
                rule = rule_info.rule;
            else if (tab_unblocker)
                rule = tab_unblocker.rule;
        }
        let mitm_rule;
        if (!rule && mitm_lib.inited
            && !(mitm_rule = mitm_lib.get_active_tab_rule(details.tabId,
            details.initiator || details.url)))
        {
            return;
        }
        if (!be_ext.get('is_premium') && ((tab_unblocker||{}).force_premium ||
            rule_info && be_vpn_util.is_all_browser(rule_info.rule)))
        {
            unblocker_lib.on_before(url, details.requestId, details.tabId,
                {err: (tab_unblocker||{}).force_premium ? 'force_premium'
                : 'all_browser'});
            return;
        }
        if (!be_ext.get('agent_key') && !storage.get('agent_key'))
        {
            unblocker_lib.on_before(url, details.requestId, details.tabId,
                {err: 'agent_key'});
            be_lib.perr_err({id: 'be_no_agent_key2', rate_limit: {count: 2}});
            return; 
        }
        let r;
        if ((r = rule||mitm_rule) && get_bg_main().set_rule_use)
            get_bg_main().set_rule_use(r, !!mitm_rule);
        rule = rule||mitm_rule;
        return this._on_first_request(details, {rule, no_rule: !rule,
            tab_unblocker});
    }

    _on_headers_received(details){
        let req;
        const res = nodify_res(details), req_id = details.requestId;
        if (!(req = E.requests[req_id]))
            return;
        unblocker_lib.on_completed(req_id, details.tabId,
            {status: details.statusLine, hdrs: res.headers});
        const tab_unblocker = E.get_tab_unblocker(details.tabId);
        const hola_warn = res.headers['x-hola-warning'];
        const hola_agent = is_hola_agent_auth(res);
        const int_req = req.opt.int_req;
        if (int_req && req.opt.ignore_redir && !int_req.res && !hola_agent)
        {
            int_req.res = res;
            req.cancel = true;
        }
        if (hola_warn && tab_unblocker && !tab_unblocker.rule.changing_proxy)
            E.be_rule.change_proxy(details, hola_warn, req.route_opt);
        const resp = get_strategy_resp(res);
        if (req.proxy_req)
        {
            if (hola_agent) 
            {
                if (req.opt.rule && !bext_config.disable_407_reauth)
                    unblocker_lib.reauth(req.opt.rule, 3*date.ms.MIN);
                return void be_lib.perr_err({id: 'req_header_proxy_auth',
                    rate_limit: {count: 5}, info: {url: req.url,
                    proxy_req: req.proxy_req}});
            }
            req.proxy_resp = resp;
            if (!req.direct_resp)
                req.direct_resp = {slow: true}; 
        }
        else if (req.direct_req)
            req.direct_resp = resp;
        const cmd = req.strategy(req.direct_resp, req.proxy_resp)||{};
        if (cmd.proxy)
        {
            if (cmd.proxy.serve)
            {
                if (req.direct_req)
                    req.direct_req.abort();
                let location = res.headers.location;
                if (is_redir_status(res.statusCode) &&
                    !zurl.is_valid_url(location))
                {
                    be_lib.perr_err({id: 'req_invalid_redirect',
                        rate_limit: {count: 3}, info: {url: req.url,
                        redirect: location, status: res.statusCode}});
                }
                if (!is_firefox && !bext_config.disable_redir_fix &&
                    tab_unblocker && is_redir_status(res.statusCode) &&
                    location && location.startsWith('http'))
                {
                    const country = zutil.get(cmd, 'proxy.country',
                        tab_unblocker.country);
                    location += location.endsWith('/') ? '' : '/';
                    if (req.url!=location)
                    {
                        this.gen_proxy_req(req, details, cmd, {country,
                            location});
                    }
                }
                return void(req.serving = 'proxy');
            }
            if (cmd.direct && cmd.direct.serve)
            {
                req.serving = 'direct';
                if (!req.proxy_req || is_redir_status(res.statusCode, true))
                    return;
                routing_reqs_set(details, req);
                return void(details.ret.redirectUrl = req.url);
            }
            if (cmd.proxy.start && !int_req)
            {
                req.direct_req = false;
                routing_reqs_set(details, req);
                return void(details.ret.redirectUrl = req.url);
            }
        }
        else if (cmd.direct)
        {
            if (cmd.direct.serve)
                return void(req.serving = 'direct');
            routing_reqs_set(details, req);
            return void(details.ret.redirectUrl = req.url);
        }
        if (req.proxy_resp)
        {
            if (req.direct_req && !req.direct_resp)
            {
                req.direct_timeout = be_vpn_util.set_timeout(
                    ()=>req.direct_req.abort(), 5000, {sp: E.sp,
                    name: 'direct_timeout'});
            }
            return void(req.serving = 'proxy');
        }
    }

    _unsafe_tab_unblocker_end_cb(details){
        const reqid = details.requestId;
        const req = E.requests[reqid];
        if (req)
        {
            delete E.requests[reqid];
            const agent_req = E.agent_requests[req.url];
            if (agent_req && agent_req.id==req.id)
                delete E.agent_requests[req.url];
            let resp;
            if (details.error)
                resp = {code: 0, error: details.error};
            else
            {
                if (details.responseHeaders)
                    resp = get_strategy_resp(nodify_res(details));
            }
            if (resp && !req.serving)
            {
                if (req.proxy_req)
                    req.proxy_resp = resp;
                else if (req.direct_req)
                    req.direct_resp = resp;
            }
            req.strategy(req.direct_resp, req.proxy_resp);
            const int_req = E.internal_reqs[req.url];
            if (int_req)
            {
                if (details.error)
                {
                    int_req.error = details.error;
                    if (!int_req.res)
                        int_req.res = {code: 0, error: int_req.error};
                }
                else if (!int_req.res)
                    int_req.res = nodify_res(details);
            }
        }
        let tabid = details.tabId, tab_unblocker = E.get_tab_unblocker(tabid);
        if (tab_unblocker)
        {
            tab_unblocker.last_req_ts = Date.now();
            if (req)
            {
                if (req.proxy_resp && is_main_frame(details) &&
                    req.proxy_resp.code==200 && !req.proxy_resp.error)
                {
                    inc_not_working('req_main_n', tab_unblocker);
                }
                if (req.proxy_req && !details.error)
                {
                    tab_unblocker.req_stats.succ_n =
                        (tab_unblocker.req_stats.succ_n||0)+1;
                }
            }
        }
        if (mitm_lib._is_mitm_active(tabid))
        {
            const req_info = mitm_lib.tab_get_req_info(tabid)||{};
            req_info.last_req_ts = Date.now();
            mitm_lib.tab_set_req_info(tabid, req_info);
        }
        let verify;
        if (req && (verify = get_site_verify_conf(req, req.opt.rule)) &&
            req.proxy_resp.code==200 && !req.proxy_resp.error)
        {
            bw_perr_acc.push(verify, req);
            inc_not_working('bw_media_n', tab_unblocker);
        }
        const errors = request_errors.slice();
        const is_proxy_req = tab_unblocker && req && req.opt.rule &&
            svc_util.gen_route_str_lc(req.route_opt)!='direct';
        if (is_proxy_req && !details.error && is_main_frame(details) &&
            req.url.startsWith('http:') && details.statusCode==502 &&
            details.statusLine.includes('DNS Failed'))
        {
            details.error = 'ERR_DNS_FAILED';
            errors.push(details.error);
        }
        if (!is_proxy_req || !details.error)
        {
            if (tab_unblocker && is_main_frame(details))
                E.be_rule.set_tab_load_err(tabid, null);
            return;
        }
        if (is_main_frame(details))
            errors.push('net::ERR_TUNNEL_CONNECTION_FAILED');
        const info = {url: req.url, type: details.type, method: req.method,
            error: details.error, agent: req.agent,
            rule: be_vpn_util.get_rule_min_fmt(req.opt.rule)};
        tab_unblocker.err_logs.push({ts: Date.now(), method: req.method,
            error: details.error, agent: zutil.get(req.agent, 'host'),
            url: req.url.slice(0, 100)});
        if (tab_unblocker.err_logs.length>err_logs_len)
            tab_unblocker.err_logs.shift();
        tab_unblocker.req_err_total_n = (tab_unblocker.req_err_total_n||0)+1;
        tab_unblocker.req_stats.err_n = (tab_unblocker.req_stats.err_n||0)+1;
        if (!errors.includes(details.error))
        {
            let reported;
            if (!(reported = load_errors[tabid]))
                reported = load_errors[tabid] = {};
            if (reported[details.error])
                return;
            reported[details.error] = true;
            return void be_lib.perr_err({id: 'req_err_unhandled',
                rate_limit: {count: 5}, info});
        }
        return E.be_rule.fix_req_err(req.opt.rule, req.agent, details,
            tab_unblocker, req.route_opt);
    }
}

class Ff_new_handler extends Base_handler {
    constructor(){
        super();
        this.on_proxy_request = this.wrap('on_proxy_request', d=>{
            this.tab_unblocker_cb(d = assign({}, d, {handler:
                this._on_first_request.bind(this),
                cbname: 'on_proxy_request', ret: {}}));
            this._clean_req_to_ret();
            this.req_to_ret[d.requestId] = {ret: d.ret, ts: Date.now()};
            return d.hola_proxy||{type: 'direct'};
        }, true);
        this.on_before_request = this.wrap('on_before_request', d=>{
            const data = this.req_to_ret[d.requestId];
            delete this.req_to_ret[d.requestId];
            return zutil.get(data, 'ret', {});
        }, true);
    }

    _clean_req_to_ret(){
        const clean = {}, now = Date.now();
        for (let id in this.req_to_ret)
        {
            const data = this.req_to_ret[id];
            if (now-data.ts < 5*date.ms.MIN)
                clean[id] = data;
        }
        this.req_to_ret = clean;
    }

    gen_proxy_req(req, details, cmd, opt){
        opt = opt||{};
        const prot = zutil.get(req, 'opt.prot', 'https');
        req.route_opt = {prot, country: opt.country};
        if (cmd.proxy.pool)
            req.route_opt.pool = cmd.proxy.pool;
        const proxy = get_proxy_agent(req, cmd.proxy);
        if (!proxy)
        {
            req.proxy_resp = {code: 0, error: 'failed set proxy'};
            return;
        }
        req.proxy_req = proxy;
        let host;
        if (E.be_bg_ajax && req.route_opt.prot=='https' &&
            E.be_bg_ajax.is_hola_via_proxy())
        {
            req.route_opt.prot = 'proxy';
            host = proxy.ip;
        }
        details.hola_proxy = {type: req.route_opt.prot,
            host: host||proxy.host||proxy.ip, port: proxy.port};
    }

    init(){
        if (!super.init())
            return;
        this.req_to_ret = {};
        try {
            window.browser.proxy.onRequest.addListener(this.on_proxy_request,
                this.listener_opt);
            chrome.webRequest.onBeforeRequest.addListener(
                this.on_before_request, this.listener_opt,
                this.listener_extra_opt);
        } catch(e){ on_hooks_err('be_add_hooks_err', e); }
    }

    uninit(){
        if (!super.uninit())
            return;
        try {
            window.browser.proxy.onRequest.removeListener(
                this.on_proxy_request);
            chrome.webRequest.onBeforeRequest.removeListener(
                this.on_before_request);
        } catch(e){ on_hooks_err('be_rm_hooks_err', e); }
    }
}

class Chrome_handler extends Base_handler {
    constructor(){
        super();
        let on_before_request = d=>{
            this.tab_unblocker_cb(assign(d||{}, {cbname: 'on_before_request',
                handler: this._on_first_request.bind(this), ret: {}}));
            return d.ret;
        };
        this.on_before_request = this.wrap('on_before_request',
            on_before_request, true);
        this.on_before_request_tab = this.wrap('on_before_request_tab', d=>{
            if (!is_main_frame(d))
                return on_before_request(d);
        }, true);
    }

    gen_proxy_req(req, details, cmd, opt){
        opt = opt||{};
        if (req.redirected) 
        {
            req.redirected = false;
            return void(req.proxy_req = true);
        }
        const req_opt = req.opt||{};
        const prot = (req_opt.prot||'https').toUpperCase();
        req.route_opt = {prot, country: opt.country};
        if (cmd.proxy.pool)
            req.route_opt.pool = cmd.proxy.pool;
        const proxy = get_proxy_agent(req, cmd.proxy);
        if (!proxy)
        {
            req.proxy_resp = {code: 0, error: 'failed set proxy'};
            return;
        }
        req.proxy_req = proxy;
        let host = proxy.host||proxy.ip;
        if (!req_opt.is_proxy_set)
        {
             if (E.be_bg_ajax && req.route_opt.prot=='HTTPS' &&
                 E.be_bg_ajax.is_hola_via_proxy())
             {
                 req.route_opt.prot = 'PROXY';
                 host = proxy.ip;
             }
             const rule_name = req_opt.rule && req_opt.rule.name;
             req.proxy_str = req.route_opt.prot+' '+host+':'+proxy.port;
             const src = cmd.src || req_opt.rule && 'geo_rule';
             set_proxy_for_url(rule_name, opt.location||details.url,
                 req.proxy_str, {src, tab_id: details.tabId});
             if ((!bext_config.disable_redir_fix && is_main_frame(details) ||
                 req_opt.fix_307) && /^http:/.test(details.url))
             {
                 set_proxy_for_url(rule_name,
                     details.url.replace('http:', 'https:'), req.proxy_str,
                     {src, tab_id: details.tabId});
             }
        }
        details.hola_proxy = {type: zutil.get(req, 'route_opt.prot'), host,
            port: proxy.port};
    }

    add_hooks(tabid){
        let hooks = super.add_hooks(tabid);
        try {
            let extra_opt = this.listener_extra_opt.slice();
            if (is_extra_headers_supported())
                extra_opt.push('extraHeaders');
            if (tabid=='main_frame')
            {
                hooks.on_before_request_main = this.on_before_request
                    .bind(this);
                chrome.webRequest.onBeforeRequest.addListener(
                    hooks.on_before_request_main,
                    assign({types: ['main_frame']}, this.listener_opt),
                    extra_opt);
                return hooks;
            }
            tabid = +tabid;
            let opt = tabid>=0 ? {tabId: tabid} : {};
            hooks.on_before_request_tab = this.on_before_request_tab
                .bind(this);
            chrome.webRequest.onBeforeRequest.addListener(
                hooks.on_before_request_tab, assign(opt, this.listener_opt),
                extra_opt);
            return hooks;
        } catch(e){ on_hooks_err('be_add_hooks_err', e); }
    }

    remove_hooks(hooks){
        super.remove_hooks(hooks);
        try {
            ['', '_main', '_tab'].forEach(e=>{
                let cb;
                if (cb = hooks['on_before_request'+e])
                    chrome.webRequest.onBeforeRequest.removeListener(cb);
            });
        } catch(e){ on_hooks_err('be_rm_hooks_err', e); }
    }
}

const set_proxy_for_url = (rule_name, url, proxy_str, opt)=>
etask({cancel: true},
    function*_set_proxy_for_url(){
    opt = opt||{};
    yield be_pac.set_proxy_for_url(rule_name, url, proxy_str, opt);
    let tu;
    if (tu = E.get_tab_unblocker(opt.tab_id))
        tu.pac_stats.total++;
});

function get_strategy_resp(res){
    let resp;
    if (res.headers['x-hola-response'])
    {
        resp = {
            hdrs_only: true,
            code: res.headers['x-hola-status-code'],
            len: res.headers['x-hola-content-length'],
            te: res.headers['x-hola-transfer-encoding'],
            lmod: res.headers['x-hola-last-modified'],
            etag: res.headers['x-hola-etag'],
            type: res.headers['x-hola-content-type'],
            error: res.headers['x-hola-error'],
        };
    }
    else
    {
        resp = {
            code: res.statusCode,
            len: res.headers['content-length'],
            te: res.headers['transfer-encoding'],
            lmod: res.headers['last-modified'],
            etag: res.headers.etag,
            type: res.headers['content-type'],
            error: res.headers['x-hola-error']
        };
    }
    resp.policy = res.headers['x-hola-policy'];
    return resp;
}

function is_vpn_allowed(_url, is_main, details){
    if (be_svc.get('vpn_country'))
        return;
    let protocol, hostname, url = zurl.parse(_url);
    if (!(protocol = url.protocol) || !(hostname = url.hostname))
    {
        if (protocol!='file:')
            be_lib.perr_err({id: 'url_parsing_failed', info: url});
        return false;
    }
    if (is_all_browser_rule_active())
        return !zurl.is_hola_domain(hostname) || details && details.tabId!=-1;
    if (unblocker_lib.is_agent(hostname))
        return false;
    return bg_util.is_vpn_allowed(_url, is_main, browser.isInNet);
}

function get_proxy_agent(req, proxy){
    const opt = req.opt||{}, rule = zutil.get(req, 'opt.rule');
    const route = svc_util.gen_route_str_lc(req.route_opt, {no_algo: true});
    let agents = opt.agent ? [opt.agent] :
        unblocker_lib.get_chosen_agent(req.route_opt, rule);
    if (!zutil.get(agents, 'length'))
    {
        zerr.debug('tab:%d no agents for %s route, rule: %s',
            req.tab_id, route, zutil.get(rule, 'name', 'unknown'));
        be_lib.perr_err({id: 'be_debug_no_agents',
            info: zerr.json({route_opt: req.route_opt,
            agents: unblocker_lib.get_active_agents(rule),
            rule: be_vpn_util.get_rule_min_fmt(rule)})});
        return;
    }
    const agent = agents[0];
    req.agent = agent;
    let tab;
    if ((tab = opt.tab_unblocker) && tab.agents)
        tab.agents[agent.host] = Date.now();
    if (mitm_lib._is_mitm_active(req.tab_id))
    {
        const info = mitm_lib.tab_get_req_info(req.tab_id)||{};
        if (!info.agents)
            info.agents = {};
        info.agents[agent.host] = Date.now();
        mitm_lib.tab_set_req_info(req.tab_id, info);
    }
    let port, plist;
    const trial = rule && is_trial(rule.name);
    if (rule && (plist = agent.port_list) && agent.port==plist.direct)
    {
        let key = [];
        if (trial)
            key.push('trial');
        if (proxy.peer)
            key.push('peer');
        port = plist[key.join('_')]||agent.port;
    }
    else
        port = be_trial.get_trial_agent_port(rule, agent.port, req.route_opt);
    if (agent.vendor!='force_agent' && (req.route_opt.pool || trial) &&
        !agent.pool)
    {
        be_lib.perr_err({id: 'be_wrong_agent', info: {agent,
            route_opt: req.route_opt, rule: be_vpn_util.get_rule_min_fmt(rule),
            trial}, rate_limit: {count: 1}});
    }
    return {ip: agent.ip, port, host: agent.host};
}

function get_rule_info_from_url(url){
    let rule_info, r;
    if (E.url_to_rule_infos.all_browser)
        return E.url_to_rule_infos.all_browser;
    if (!url)
        return null;
    for (r in E.url_to_rule_infos)
    {
        rule_info = E.url_to_rule_infos[r];
        if (rule_info.url_re && rule_info.url_re.test(url))
            return rule_info;
    }
    return null;
}

const is_all_browser_rule_active = ()=>
    !!E.url_to_rule_infos.all_browser;

E.get_tab_unblocker = tabid=>{
    if (E.tab_unblockers.all_browser)
        return E.tab_unblockers.all_browser;
    return tabid && E.tab_unblockers[tabid];
};

function tab_unblocker_del(tabid, refresh){
    const tab_unblocker = E.tab_unblockers[tabid];
    zerr.notice('tab:%d tab_unblocker_del: %s', +tabid,
        zutil.get(tab_unblocker, 'country', 'not_found'));
    if (!tab_unblocker)
        return;
    if (tab_unblocker.not_working)
        E.send_not_working(tab_unblocker, 'unblocker_del');
    const is_all_browser = tabid=='all_browser';
    E.be_rule.set_tab_load_err(tabid, null);
    if (requests_handler && tab_unblocker.hooks)
        requests_handler.remove_hooks(tab_unblocker.hooks);
    const rule_info = E.url_to_rule_infos[tab_unblocker.root_url];
    delete E.tab_unblockers[tabid];
    unblocker_lib.del_ctx(tabid);
    if (is_all_browser)
        requests_handler.update_hooks();
    if (!rule_info)
    {
        be_lib.perr_err({id: 'be_rule_info_missing', info: {tabid,
            tab_unblocker, rule_infos: E.url_to_rule_infos}});
    }
    else
        delete rule_info.tabs[tabid];
    if (refresh && is_all_browser)
        tabid = be_tabs.get('active.id');
    if (!refresh || be_tabs.get('active.id')!=tabid)
        return;
    chrome.tabs.get(bg_util.tabid2api(tabid), function(tab){
        if (tab)
            chrome.tabs.update(tab.id, {url: tab.url});
    });
}

function tab_reload(tabid, tab_url){
    chrome.tabs.update(tabid, {url: tab_url});
    chrome.tabs.get(tabid, function(tab){
        if (!tab || tab.status!='complete')
            return;
        be_tabs.reload(tabid);
    });
}

const get_force_premium_rule = tab_url=>
    be_premium.get_force_premium_rule(svc_util.get_root_url(tab_url));

const tab_unblocker_add = cb_wrapper((tabid, rule_info, tab_url, fix_url)=>{
    if (!rule_info || rule_info.tabs[tabid])
        return;
    const is_all_browser = be_vpn_util.is_all_browser(rule_info.rule);
    const id = is_all_browser ? rule_info.rule.name : tabid;
    let tab_unblocker = E.tab_unblockers[id];
    const root_url = svc_util.get_root_url(tab_url);
    if (tab_unblocker && tab_unblocker.rule)
        return;
    tab_unblocker = {country: rule_info.rule.country, rule: rule_info.rule,
        root_url: rule_info.root_url, log: tab_unblocker ? tab_unblocker.log :
        [], force_premium: get_force_premium_rule(tab_url), err_logs: [],
        agents: {}, track: {counter: 0, domains: {}}, site_conf:
        be_util.get_site_conf(root_url||rule_info.rule.name)||{},
        pac_stats: {total: 0}, req_stats: {}};
    E.tab_unblockers[id] = tab_unblocker;
    zerr.notice('tab:%d tab_unblocker_add: %s %s', tabid, rule_info.rule.name,
        tab_unblocker.country);
    if (requests_handler)
    {
        if (is_all_browser)
            requests_handler.update_hooks(id);
        tab_unblocker.hooks = requests_handler.add_hooks(id);
    }
    rule_info.tabs[tabid] = true;
    unblocker_lib.add_ctx(tabid, tab_unblocker.rule, {src: tab_url});
    if (!is_all_browser && be_tabs.get('active.id')==tabid)
    {
        if (fix_url)
            tab_url = bg_util.get_root_link(rule_info.rule, tab_url)||tab_url;
        if (be_trial.get_trial_active(root_url))
        {
            let site_conf = be_util.get_site_conf(root_url);
            tab_url = zutil.get(site_conf, 'trial.trial_redirect', tab_url);
        }
        if (tab_url)
        {
            zerr.notice('tab:%d reloading tab', tabid);
            return tab_reload(tabid, tab_url);
        }
    }
    E.set('activity', Date.now());
    return tab_unblocker;
});

const on_tab_created = cb_wrapper(o=>{
    const tab = o.tab;
    if (!tab.url)
        return;
    const rule_info = get_rule_info_from_url(tab.url);
    tab_unblocker_add(tab.id, rule_info, tab.url);
});

const on_tab_updated = cb_wrapper(o=>{
    let id = o.id, info = o.info;
    if (!info || !info.url)
        return;
    const tab_unblocker = E.tab_unblockers[id];
    const rule_info = get_rule_info_from_url(info.url);
    if (tab_unblocker &&
        rule_info && tab_unblocker.root_url==rule_info.root_url)
    {
        return;
    }
    if (tab_unblocker)
        tab_unblocker_del(id);
    tab_unblocker_add(id, rule_info, info.url);
});

const on_tab_removed = cb_wrapper(o=>{
    if (mitm_lib.inited)
        mitm_lib.tabs_del(o.id, 'on_tab_removed');
    tab_unblocker_del(o.id);
});

const on_tab_replaced = cb_wrapper(function(o){
    let added = o.added, removed = o.removed;
    tab_unblocker_del(removed);
    if (mitm_lib.inited)
        mitm_lib.tabs_del(removed, 'on_tab_replaced');
    chrome.tabs.get(added, tab=>{
        if (!tab || !tab.url)
            return;
        if (mitm_lib.inited)
            mitm_lib.tabs_add(added, tab.url, 'on_tab_replaced');
        const rule_info = get_rule_info_from_url(tab.url);
        tab_unblocker_add(added, rule_info, tab.url);
    });
});

function unset_rule_for_url(root_url, refresh){
    let rule_info = E.url_to_rule_infos[root_url];
    if (!rule_info)
        return;
    for (let tab in rule_info.tabs)
        tab_unblocker_del(tab, refresh);
    if (root_url=='all_browser')
        tab_unblocker_del(root_url, refresh);
    delete E.url_to_rule_infos[root_url];
}

function set_rule_for_url(root_url, rule, fix_url){
    let rule_info = E.url_to_rule_infos[root_url];
    if (rule_info)
        unset_rule_for_url(root_url, 0);
    rule_info = E.url_to_rule_infos[root_url] = {rule, root_url, tabs: {},
        url_re: new RegExp(root_url)};
    const disable = bext_config.disable_query_filter;
    chrome.tabs.query(disable ? {} : {url: '*://*.'+rule.name+'/*'},
        cb_wrapper(tabs=>{
        if (!tabs)
            return;
        for (let tab of tabs)
        {
            if (disable && rule_info.url_re && !rule_info.url_re.test(tab.url))
                continue;
            tab_unblocker_add(tab.id, rule_info, tab.url, fix_url);
        }
    }));
}

function update_rules(url_to_rule_infos){
    let url, rule;
    for (url in E.url_to_rule_infos)
    {
        rule = url_to_rule_infos[url];
        if (!rule)
            unset_rule_for_url(url, 1);
        else if (rule.id!=E.url_to_rule_infos[url].rule.id)
            set_rule_for_url(url, rule, 0);
    }
    for (url in url_to_rule_infos)
    {
        rule = url_to_rule_infos[url];
        if (!E.url_to_rule_infos[url])
            set_rule_for_url(url, rule, 1);
    }
}

be_pac.init_tab_listeners = ()=>{
    if (requests_handler)
        requests_handler.init();
};

E.set_rule_val = (r, key, val)=>{
    if (!E.rules || !r.root_url)
        return;
    let info;
    if (!(info = E.url_to_rule_infos[r.root_url[0]]))
    {
        if (r = svc_util.find_rule(E.rules.unblocker_rules, r))
            info = E.url_to_rule_infos[r.root_url[0]];
    }
    if (info && info.rule)
        info.rule[key] = val;
};

E.get_rule_route = rule=>{
    const country = rule.country, proxy_country = country.toUpperCase();
    return unblocker_lib.get_rule_strategy({}, null, {root_url: rule.name,
        premium: is_force_proxy(country, {rule}), country: proxy_country,
        proxy_country, src_country: be_info.get('country'),
        is_trial: is_trial(rule.name)});
};

E.update_rule_urls = rules=>etask(function*update_rule_urls(){
    if (!E.inited)
        return;
    be_pac.rules = E.rules = rules;
    if (be_ext.get('ext.active'))
        requests_handler.init();
    be_pac.load_pac_file();
    let url_to_rule_infos = {};
    if (!rules)
        return update_rules(url_to_rule_infos);
    const r = _.omit(E.rules, 'unblocker_globals');
    if ((E.rules||{}).unblocker_globals)
        r.unblocker_globals = assign({}, E.rules.unblocker_globals);
    unblocker_lib.unblocker_json_set(r, {by_rules: 1, ext: 1,
        rule_cleanup_ms: bext_config.pac_rule_cleanup_ms});
    if (be_dev_mode.get('debug_pac')) 
    {
        pac_engine.init(r, {by_rules: 1, ext: 1,
            rule_cleanup_ms: bext_config.pac_rule_cleanup_ms});
    }
    let ag_rules = [], agents = {};
    for (let r in rules.unblocker_rules)
    {
        let rule = rules.unblocker_rules[r];
        if (!rule.enabled)
            continue;
        if (be_vpn_util.is_all_browser(rule))
            url_to_rule_infos[rule.name] = rule;
        else
        {
            for (let i=0; i<rule.root_url.length; i++)
                url_to_rule_infos[rule.root_url[i]] = rule;
        }
        const pool = E.get_rule_route(rule).pool, def = [];
        def.push({peer: false, pool}, {peer: false});
        def.forEach(function(b){
            b = assign({country: rule.country, link: rule.link,
                name: rule.name}, b);
            let s = svc_util.gen_route_str_lc(b);
            if (!agents[s])
            {
                ag_rules.push(b);
                agents[s] = true;
            }
        });
    }
    yield unblocker_lib.resolve_agents(ag_rules, null, {new_only: true},
        'update_rule_urls');
    update_rules(url_to_rule_infos);
});

E.ajax_via_proxy = (url, _opt, state)=>etask({cancel: true},
    function*ajax_via_proxy(){
    if (!E.ajax_via_proxy_inited)
        E.init_ajax_via_proxy();
    this.finally(()=>{
        delete E.internal_reqs[opt.url];
        if (xhr)
        {
            xhr.abort();
            xhr.onerror = null;
            xhr.onreadystatechange = null;
            delete E.internal_reqs[xhr.hola_url];
        }
        if (!{bg_ajax: 1, proxy_auth: 1}[_opt.src])
            E.trigger('internal_reqs_update');
    });
    _opt = _opt||{};
    state = state||{};
    let opt = typeof url=='object' ? url : {type: 'POST', url: url};
    let xhr, complete, xhr_resp;
    const get_result = ()=>{
        let req = E.internal_reqs[opt.url]||{};
        complete = true;
        delete E.internal_reqs[xhr.hola_url];
        if (!req.res)
        {
            if (xhr_resp)
                req.res = xhr_resp;
            else
            {
                const headers_s = xhr.getAllResponseHeaders();
                req.res = xhr_resp = {
                    statusCode: xhr.status,
                    reasonPhrase: xhr.statusText,
                    responseURL: xhr.responseURL,
                    headers: attrib.to_obj_lower(attrib.from_str(headers_s,
                        {allow_invalid: true})),
                };
            }
        }
        else if (!xhr_resp)
            xhr_resp = req.res;
        if (_opt.force_headers && (!req.res.headers
            || !Object.keys(req.res.headers).length))
        {
            req.res.headers = xhr_resp ? xhr_resp.headers
                : attrib.to_obj_lower(attrib.from_str(
                xhr.getAllResponseHeaders(), {allow_invalid: true}));
            if (req.res.statusCode==407 && xhr_resp)
                req.res.statusCode = xhr_resp.statusCode;
        }
        return {data: xhr.responseText, xhr, agent: _opt.agent,
            status: xhr_resp.statusCode, orig_res: req.res,
            is_redirected: req.is_redirected};
    };
    try {
        const rule = opt.rule, agent = _opt.agent;
        if ((rule || _opt.force=='proxy') && !_opt.country && !agent)
        {
            const r = rule||get_rule_info_from_url(opt.url);
            if (r)
            {
                _opt.country = r.country;
                _opt.peer = _opt.peer||r.peer;
            }
            else
                throw new Error('proxy rule not found for '+opt.url);
            _opt.force = 'proxy';
        }
        const req_opts = {force: _opt.force, country: _opt.country,
            no_routing: true, peer: _opt.peer, no_rule: !_opt.country,
            fix_307: _opt.fix_307};
        if (_opt.ignore_redir!=false)
            req_opts.ignore_redir = true;
        if (_opt.prot)
            req_opts.prot = _opt.prot;
        if (agent)
            req_opts.agent = agent;
        let proxy;
        if (_opt.force=='direct')
            proxy = 'DIRECT';
        const b = be_util.browser_guess;
        if (is_chrome && b.version>=76 && (_opt.force=='direct' ||
            _opt.force=='proxy' && agent))
        {
            req_opts.no_redirect = true;
            if (_opt.force=='proxy')
                proxy = 'PROXY '+(agent.host||agent.ip)+':'+agent.port;
        }
        if (proxy)
        {
            req_opts.is_proxy_set = true;
            yield set_proxy_for_url(rule&&rule.name, opt.url, proxy,
                {async: !bext_config.disable_ajax_via_proxy_async});
        }
        xhr = hola_XMLHttpRequest(opt.url, opt.type, _opt.hdrs, req_opts);
        if (_opt.with_credentials)
            xhr.withCredentials = true;
        if (_opt.src!='bg_ajax')
            E.trigger('internal_reqs_update');
        xhr.onreadystatechange = cb_wrapper(function(){
            if (xhr.readyState!=xhr.HEADERS_RECEIVED)
                return;
            state.hdrs_received = true;
            const headers_s = xhr.getAllResponseHeaders();
            xhr_resp = {
                statusCode: xhr.status,
                reasonPhrase: xhr.statusText,
                responseURL: xhr.responseURL,
                headers: attrib.to_obj_lower(attrib.from_str(headers_s,
                    {allow_invalid: true})),
            };
            if (_opt.hdrs_abort)
                xhr.abort();
        });
        xhr.onerror = ev=>{
            const req = E.internal_reqs[opt.url];
            if (req)
                req.et = this;
        };
        xhr.onload = ()=>this.continue();
        xhr.onabort = ()=>this.continue();
        xhr.send(_opt.data);
        yield this.wait(_opt.timeout||30*date.ms.SEC);
        return get_result();
    } catch(e){
        if (_opt.always && xhr && !complete)
            return get_result();
        throw new Error(e.statusText||''+e);
    }
});

const on_tab_completed = cb_wrapper(o=>{
    if (o.frameId)
        return;
    if (mitm_lib.inited)
        mitm_lib.tabs_set_complete(o.tabId);
    let start_ts, load_perr;
    if (!o.url || !(start_ts = tab_loads[o.tabId]) ||
        !(load_perr = zutil.get(bext_config, 'load_perr')))
    {
        return;
    }
    const tab = E.get_tab_unblocker(o.tabId);
    const _url = zurl.parse(o.url), _path = _url.path.toLowerCase();
    let root_url = svc_util.get_root_url(o.url), rule, path;
    if (!(rule = load_perr.find(r=>r.domain==root_url)) ||
        (path = rule.paths.find(p=>_path.startsWith('/'+p)))===undefined)
    {
        return;
    }
    const info = {id: rule.id, path: path||'root', ms: Date.now()-start_ts,
        loc: zutil.get(be_info.get('location'), 'country', '').toLowerCase()};
    if (tab && (rule = tab.rule))
        assign(info, {country: rule.country, trial: rule.src=='trial'});
    else
        info.local = true;
    be_lib.perr_ok({id: 'tab_load_completed', info});
});

const on_before_navigate = cb_wrapper(o=>{
    if (o.frameId)
        return;
    svc_vpn_util.push_event('navgiate', {tab_id: o.tabId, url: o.url});
    load_errors[o.tabId] = {};
    tab_loads[o.tabId] = Date.now();
    if (mitm_lib.inited)
        mitm_lib.tabs_add(o.tabId, o.url, 'on_before_navigate');
});

function handle_mitm_block(tab_url, tab_id, ret){
    mitm_lib.trace(tab_id, tab_url, 'handle_mitm_block '+(!ret ? 'no ret'
        : 'blocked='+ret.blocked+' handle='+ret.handle+' root='
        +svc_util.get_root_url(ret.url)));
    if (!tab_id || is_disabled() || !ret || !ret.blocked || !ret.handle)
        return;
    const cur_url = be_tabs.get_url(tab_id);
    const active_id = be_tabs.get('active.id');
    const active_url = be_tabs.get('active.url');
    if (be_vpn_util.is_new_tab(cur_url) && active_id==tab_id &&
        active_url==tab_url)
    {
        chrome.tabs.update(tab_id, {url: tab_url});
        mitm_lib.trace(tab_id, tab_url, 'tabs.update chrome load');
    }
    else if (!cur_url && is_chrome && active_id==tab_id-1)
    {
        return void mitm_lib.trace(tab_id, tab_url, 'ignore preload');
    }
    else if (!ret.sim && cur_url!=tab_url)
    {
        if (cur_url==ret.redir)
        {
            chrome.tabs.update(tab_id, {url: ret.tab_url});
            mitm_lib.trace(tab_id, tab_url,
                'tabs.update redirect to other domain');
        }
        else if (tab_url==active_url && tab_id==active_id)
        {
            be_tabs.reload(tab_id);
            mitm_lib.trace(tab_id, tab_url, 'tabs.reload same active url');
        }
        else
            return void mitm_lib.trace(tab_id, tab_url, 'ignore mismatch url');
    }
    else if (ret.sim)
    {
        chrome.tabs.update(tab_id, {url: ret.sim.url});
        mitm_lib.trace(tab_id, tab_url, 'tabs.update sim '+ret.sim.url);
    }
    else
    {
        be_tabs.reload(tab_id);
        mitm_lib.trace(tab_id, tab_url, 'tabs.reload url match');
    }
    mitm_lib.trace(tab_id, tab_url, 'trigger mitm_block');
    E.trigger('mitm_block', tab_id, tab_url, ret.redirect, ret.country);
}

const test_rules = {};
function get_enabled_rule(url){
    const key = 'http://'+svc_util.get_root_url(url)+'/';
    if (zutil.is_mocha() && test_rules[key])
        return test_rules[key];
    const rules = E.be_rule.get_rules(key);
    const r = rules && rules[0];
    return r && r.enabled ? r : undefined;
}

function is_disabled(){ return !be_ext.get('ext.active'); }
function is_unblock_allowed(tab_id, tab_url){
    if (be_ext.get('is_premium'))
        return true;
    const tab_unblocker = E.tab_unblockers[tab_id];
    return tab_unblocker ? !tab_unblocker.force_premium
        : !get_force_premium_rule(tab_url);
}
function has_geo_rule(url){ return get_enabled_rule(url); }
const init_mitm_check_url = ff_cb_wrapper('init_mitm_check_url', details=>{
    const url = details.url;
    if (!url || url.startsWith('https') || !bg_util.is_vpn_allowed(url,
        is_main_frame(details), browser.isInNet))
    {
        return;
    }
    const tab_id = details.tabId;
    const tab_url = details.initiator||url;
    if (!tab_id || tab_id<0 || is_disabled()
        || !is_unblock_allowed(tab_id, tab_url)
        || be_tabs.get('active.id')!=tab_id || tab_url!=url)
    {
        return;
    }
    const res = nodify_res(details);
    const geo_rule = get_enabled_rule(tab_url);
    const hook = 'fake_resp', rule = {country: 'us'};
    details.headers = res.headers;
    if (force_strategy!='peer' && geo_rule
        || !mitm_lib.is_mitm_allowed(tab_id, tab_url, tab_url, details, hook))
    {
        return;
    }
    be_pac.load_pac_file(undefined, true);
    return etask('init_mitm_check_url', function*init_mitm_check_url_(){
        if (!zutil.is_mocha())
            yield unblocker_lib.get_agents(null, rule);
        const ret = yield mitm_lib.check_mitm_blocking({url: tab_url, tab_url,
            hook, prev_code: details.statusCode, tab_id,
            headers: details.headers, force_peer: geo_rule && geo_rule.country,
            redir: (details.headers||{}).location,
            agents: unblocker_lib.get_all_agents(rule.country, rule)});
        handle_mitm_block(tab_url, tab_id, ret);
    });
});

E.has_mitm = ()=>!!E.mitm;

const chrome_error_list = ['ACCESS_DENIED', 'BLOCKED_BY_ADMINISTRATOR',
    'CONNECTION_REFUSED', 'CONNECTION_FAILED', 'NAME_NOT_RESOLVED',
    'ADDRESS_UNREACHABLE', 'CERT_ERROR_IN_SSL_RENEGOTIATION',
    'NAME_RESOLUTION_FAILED', 'NETWORK_ACCESS_DENIED',
    'SSL_HANDSHAKE_NOT_COMPLETED', 'SSL_SERVER_CERT_CHANGED',
    'CERT_COMMON_NAME_INVALID', 'CERT_AUTHORITY_INVALID',
    'CERT_CONTAINS_ERRORS', 'CERT_INVALID', 'INVALID_RESPONSE',
    'EMPTY_RESPONSE', 'INSECURE_RESPONSE', 'DNS_MALFORMED_RESPONSE',
    'DNS_SERVER_FAILED', 'DNS_SEARCH_EMPTY', 'TIMED_OUT', 'CONNECTION_CLOSED',
    'CONNECTION_RESET', 'CONNECTION_TIMED_OUT'];
const init_mitm_check_err = cb_wrapper(o=>{
    const tab_id = o.tabId||o.id;
    if (o.frameId || !tab_id || tab_id==-1 || is_disabled() || !E.mitm
        || !o.error || !chrome_error_list.includes(o.error.split('::ERR_')[1]))
    {
        return;
    }
    const prev_code = o.statusCode||o.http_status_code||0;
    const tab_url = o.url||be_tabs.get_url(tab_id);
    const geo_rule = get_enabled_rule(tab_url);
    const hook = 'error', rule = {country: 'us'};
    mitm_lib.trace(tab_id, tab_url, 'hook error init');
    if (force_strategy!='peer' && geo_rule
        || !is_unblock_allowed(tab_id, tab_url)
        || !bg_util.is_vpn_allowed(tab_url, true, browser.isInNet)
        || !mitm_lib.is_mitm_allowed(tab_id, tab_url, tab_url,
        {statusCode: prev_code}, hook))
    {
        return void mitm_lib.trace(tab_id, tab_url, 'mitm not allowed');
    }
    be_pac.load_pac_file(undefined, true);
    return etask('init_mitm_check_err', function*init_mitm_check_err_(){
        mitm_lib.trace(tab_id, tab_url, 'get_agents country us');
        if (!zutil.is_mocha())
            yield unblocker_lib.get_agents(null, rule);
        const agents = unblocker_lib.get_all_agents(rule.country, rule);
        mitm_lib.trace(tab_id, tab_url, 'call check_mitm_blocking code '
            +prev_code+' with '+agents.length+' us agents');
        const ret = yield mitm_lib.check_mitm_blocking({url: tab_url, tab_url,
            hook, prev_code, tab_id, force_peer: geo_rule && geo_rule.country,
            err_str: o.error, agents});
        handle_mitm_block(tab_url, tab_id, ret);
    });
});

E.uninit = ()=>{
    if (!E.inited)
        return;
    E.stopListening(be_ext, 'change:ext.active', update_state);
    E.stopListening(be_ext, 'change:bext_config', update_config);
    be_ext.off('not_working', on_not_working);
    uninit_mitm();
    E.sp.return();
    E.update_rule_urls();
    be_pac.set_pac(null);
    be_pac.rules = E.rules = null;
    ff_exported.forEach(o=>window[o.name] = null);
    E.inited = 0;
    agent_auth_listener_del();
    requests_handler.uninit();
    E.uninit_ajax_via_proxy();
    E.requests = {};
    for (let k in E.routing_reqs)
        E.routing_reqs[k].to = be_vpn_util.clear_timeout(E.routing_reqs[k].to);
    E.routing_reqs = {};
    E.stopListening();
    E.clear();
};

function uninit_mitm(){
    E.mitm = undefined;
    uninit_mitm_hooks();
    mitm_lib.uninit();
    E.unset('mitm_inited');
}

const mitm_sim_before_request = ff_cb_wrapper('mitm_sim_before_request', d=>{
     const rule = mitm_lib.get_tab_rule(d.tabId, d.initiator || d.url);
     return !rule || rule.cmd=='ignore' ? {cancel: true} : null;
});

const mitm_sim_on_headers = ff_cb_wrapper('mitm_sim_on_headers', d=>{
     const rule = mitm_lib.get_tab_rule(d.tabId, d.initiator || d.url);
     return !rule || rule.cmd=='ignore' ? {redirectUrl:
         chrome.extension.getURL('/js/bext/vpn/bg/sim_dns_block.html')}
         : null;
});

function on_before_request_int(d){
    if (d.tabId==-1 && d.url && requests_handler && (E.internal_reqs[d.url]
        || d.url.startsWith('http://internal.hola/')))
    {
        return requests_handler.on_before_request(d);
    }
}

function on_completed_request_int(d){
    if (d.tabId!=-1 || !d.url || !E.requests || !E.requests[d.requestId]
        || d.type!='xmlhttprequest')
    {
        return;
    }
    const reqid = d.requestId, req = E.requests[reqid];
    delete E.requests[reqid];
    if (!d.error)
        return;
    const resp = {statusCode: 0, error: d.error};
    if (!req.serving)
    {
        if (req.proxy_req)
            req.proxy_resp = resp;
        else if (req.direct_req)
            req.direct_resp = resp;
    }
    let ireq;
    if (!(ireq = E.internal_reqs[req.url]))
        return;
    ireq.error = d.error;
    if (!ireq.res)
        ireq.res = resp;
    if (ireq.et)
        ireq.et.continue();
}

function on_send_headers_int(d){
    if (!d || d.tabId!=-1)
        return;
    const req = E.requests[d.requestId], int_req = req && req.opt.int_req;
    if (!req || !int_req || !int_req.hdrs)
        return;
    let modified;
    const hdrs = int_req.hdrs, req_hdrs = d.requestHeaders;
    for (let h in hdrs)
        modified |= hdrs_add(req_hdrs, h, hdrs[h]);
    if (modified)
        return {requestHeaders: req_hdrs};
}

const is_hola_agent_auth = res=>res.statusCode==407 &&
    res.headers['proxy-authenticate']=='Basic realm="Hola Unblocker"';

function on_headers_int(d){
    if (!d || d.tabId!=-1)
        return;
    const req = E.requests[d.requestId], int_req = req && req.opt.int_req;
    if (!req || !d || !requests_handler || !int_req || !req.opt.ignore_redir)
        return;
    const res = nodify_res(d);
    if (is_hola_agent_auth(res))
        return;
    int_req.res = res;
    req.cancel = true;
}

const init_mitm_before_request = ff_cb_wrapper('on_before_request_int',
    on_before_request_int);
const init_mitm_on_req_end = ff_cb_wrapper('on_completed_int',
    on_completed_request_int);
const init_mitm_on_send_headers = ff_cb_wrapper('init_mitm_on_send_headers',
    on_send_headers_int);
const init_mitm_on_headers = ff_cb_wrapper('init_mitm_on_headers',
    on_headers_int);

function uninit_mitm_hooks(){
    if (!init_mitm_hooks.inited)
        return;
    try {
        chrome.webRequest.onBeforeRequest.removeListener(
            init_mitm_before_request);
        chrome.webRequest.onHeadersReceived.removeListener(
            init_mitm_on_headers);
        chrome.webRequest.onHeadersReceived.removeListener(
            init_mitm_on_send_headers);
        chrome.webRequest.onErrorOccurred.removeListener(
            init_mitm_on_req_end);
        chrome.webRequest.onCompleted.removeListener(
            init_mitm_on_req_end);
        chrome.webRequest.onBeforeRequest.removeListener(
            mitm_sim_before_request);
        chrome.webRequest.onHeadersReceived.removeListener(
            init_mitm_check_url);
        chrome.webNavigation.onErrorOccurred.removeListener(
            init_mitm_check_err);
    } catch(e){ on_hooks_err('be_rm_hooks_err', e); }
    if (internal_reqs_update_cb)
        E.off('internal_reqs_update', internal_reqs_update_cb);
    internal_reqs_update_cb = undefined;
    init_mitm_hooks.inited = false;
}

let internal_reqs_update_cb;
function init_mitm_hooks(){
    if (!requests_handler || init_mitm_hooks.inited || !mitm_lib.inited
        || !E.mitm.is_auto_discovery())
    {
        return;
    }
    init_mitm_hooks.inited = true;
    try {
        if (mitm_lib.enable_sim)
        {
            chrome.webRequest.onBeforeRequest.addListener(
                mitm_sim_before_request, {urls: E.mitm
                .sim_filters('before_request'), types: ['main_frame']},
                ['blocking']);
            chrome.webRequest.onHeadersReceived.addListener(
                mitm_sim_on_headers, {urls: E.mitm
                .sim_filters('headers_received'), types: ['main_frame']},
                ['responseHeaders', 'blocking']);
        }
        chrome.webRequest.onHeadersReceived.addListener(
            init_mitm_check_url, {urls: ['<all_urls>'], types: ['main_frame']},
            ['responseHeaders']);
        chrome.webNavigation.onErrorOccurred.addListener(init_mitm_check_err);
        const get_internal_urls = ()=>{
            const ret = ['http://internal.hola/*'], urls = {};
            for (let key in E.internal_reqs)
            {
                key = /^http:\/\/internal.hola/.test(key) ?
                    E.internal_reqs[key].url : key;
                if (urls[key])
                    continue;
                ret.push(key);
                urls[key] = true;
            }
            return ret;
        };
        E.on('internal_reqs_update', internal_reqs_update_cb = ()=>{
            const urls = get_internal_urls();
            if (zutil.equal_deep(urls, init_mitm_hooks.int_urls))
                return;
            chrome.webRequest.onBeforeRequest.removeListener(
                init_mitm_before_request);
            chrome.webRequest.onErrorOccurred.removeListener(
                init_mitm_on_req_end);
            chrome.webRequest.onCompleted.removeListener(
                init_mitm_on_req_end);
            chrome.webRequest.onHeadersReceived.removeListener(
                init_mitm_on_headers);
            chrome.webRequest.onHeadersReceived.removeListener(
                init_mitm_on_send_headers);
            init_mitm_hooks.int_urls = urls;
            if (urls.length==1)
                return;
            chrome.webRequest.onBeforeRequest.addListener(
                init_mitm_before_request, {urls}, ['requestBody',
                'blocking']);
            chrome.webRequest.onHeadersReceived.addListener(
                init_mitm_on_headers, {urls}, ['blocking',
                'responseHeaders']);
            chrome.webRequest.onBeforeSendHeaders.addListener(
                init_mitm_on_send_headers, {urls}, ['blocking',
                'requestHeaders']);
            chrome.webRequest.onCompleted.addListener(init_mitm_on_req_end,
                {urls: urls.slice(1)});
            chrome.webRequest.onErrorOccurred.addListener(init_mitm_on_req_end,
                {urls: urls.slice(1)});
        });
    } catch(e){ on_hooks_err('be_add_hooks_err', e); }
}

function remove_mitm_unblock_rule(url){
    set_proxy_for_url(null, url, 'DIRECT', {src: 'mitm_route'}); }

function remove_mitm_tab_hook(hooks){
    try {
        mitm_tab_hooks.forEach(e=>{
            if (hooks[e.cbname])
                chrome.webRequest[e.l].removeListener(hooks[e.cbname]);
        });
    } catch(e){ on_hooks_err('be_rm_hooks_err', e); }
}

function add_mitm_tab_hook(tab_id){
    const hooks = {};
    be_pac.load_pac_file(undefined, true);
    const opt = assign({tabId: +tab_id}, requests_handler.listener_opt);
    try {
        mitm_tab_hooks.forEach(e=>{
            hooks[e.cbname] = requests_handler[e.cbname]
                .bind(requests_handler);
            if (!e.extra_opt)
            {
                return chrome.webRequest[e.l].addListener(hooks[e.cbname],
                    opt);
            }
            chrome.webRequest[e.l].addListener(hooks[e.cbname], opt,
                requests_handler.listener_extra_opt);
        });
    } catch(e){ on_hooks_err('be_add_hooks_err', e); }
    return hooks;
}

function init_mitm(){
    if (mitm_lib.inited || !mitm_lib.init({ajax_via_proxy: E.ajax_via_proxy,
        storage, perr: be_lib.perr_ok, loc: be_info.get('location'), zerr,
        bext_config, uuid: be_ext.get('uuid'), add_tab_hook: add_mitm_tab_hook,
        remove_tab_hook: remove_mitm_tab_hook, version: be_util.version(),
        remove_unblock_rule: remove_mitm_unblock_rule,
        connection_type: be_util.get_connection_type()||'eth',
        device_type: be_util.get_device_type(), has_geo: has_geo_rule,
        init_proxy: ()=>{ be_pac.load_pac_file(undefined, true); }}))
    {
        return;
    }
    E.mitm = mitm_lib;
    E.mitm.debug.tabs_dump = ()=>{
        console.log('TABS Dump:');
        chrome.tabs.query({}, tabs=>{ tabs.forEach(t=>{
            console.log(t.id+' '+t.url); }); });
    };
    init_mitm_hooks();
    E.set('mitm_inited', true);
}

E.send_not_working = (tab, reason)=>{
    let rate = be_ext.get('gen.dbg_log_rate');
    if (rate===undefined)
        rate = 100;
    const with_log = reason && !Math.floor(Math.random()*rate)/rate;
    be_lib.perr_err({id: 'be_not_working_stats', with_log, info: assign(
        {reason}, tab.not_working), rate_limit: {count: 5, ms: date.ms.MIN}});
    delete tab.not_working;
};

function monitor_not_working(tab_id){
    let e, period = 2*date.ms.MIN, n = period, now = Date.now();
    for (let id in E.tab_unblockers)
    {
        let diff, tab = E.tab_unblockers[id];
        if (!(e = tab.not_working) || (diff = now-e.ts)<period)
        {
            if (diff && id!=tab_id)
                n = Math.min(n, diff);
            continue;
        }
        E.send_not_working(tab);
    }
    monitor_not_working.to = be_vpn_util.clear_timeout(monitor_not_working.to);
    if (n<period || tab_id)
    {
        monitor_not_working.to = be_vpn_util.set_timeout(monitor_not_working,
            n, {sp: E.sp, name: 'monitor_not_working'});
    }
}

function inc_not_working(id, tab){
    let e;
    if (!tab || !(e = tab.not_working))
        return;
    e.stats[id] = (e.stats[id]||0)+1;
}

function on_not_working(e){
    let tab;
    if (!(tab = E.get_tab_unblocker(e.tab_id)))
    {
        return void be_lib.perr_err({id: 'be_not_working_tab_not_found',
            info: e, rate_limit: {count: 1}});
    }
    let rule = be_vpn_util.get_rule_min_fmt(tab.rule);
    zerr.notice('tab:%d not working trigger, src %s, current agent %s, %O',
        e.tab_id, e.src, tab.last_agent&&tab.last_agent.host, {rule,
        agents: tab.agents});
    e = assign({err_logs: tab.err_logs}, e);
    unblocker_lib.trigger('not_working', e.tab_id, e);
    if (tab.not_working)
        E.send_not_working(tab, 'not_working_'+e.src);
    tab.not_working = {ts: Date.now(), info: e, stats: {}, rule};
    monitor_not_working(e.tab_id);
    if (!['ui', 'watermark'].includes(e.src) || !debug_hooks)
        return;
    let errors = {}, total;
    for (let err in tab.debug_errors)
    {
        if (total = zutil.get(tab.debug_errors, err+'.true.total'))
            errors[err] = total;
    }
    if (tab.debug_auth)
        errors.auth = tab.debug_auth;
    if (tab.media_failures)
        errors.media = tab.media_failures;
    if (tab.browse_failures)
        errors.browse = tab.browse_failures;
    get_bg_main().dump_errors(e.tab_id, errors);
}

function get_credentials(){
    var _key = be_ext.get('agent_key'), key = _key||storage.get('agent_key');
    var err = _key ? null : key ? 'be_agent_key_fallback' : 'be_no_agent_key';
    if (err)
        be_lib.perr_err({id: err, rate_limit: {count: 2}});
    return {username: 'user-uuid-'+be_ext.get('uuid'),
        password: key||'cccccccccccc'};
}

const agent_auth_listener = ff_cb_wrapper('agent_auth_listener', details=>{
    if (details.isProxy && details.realm=='Hola Unblocker')
        return {authCredentials: get_credentials()};
    be_lib.perr_ok({id: 'auth_listener_not_proxy', info: _.pick(details, 'url',
        'realm', 'challenger'), rate_limit: {count: 2}});
    return {};
});

function agent_auth_listener_del(){
    if (!agent_auth_listener.inited)
        return;
    try { chrome.webRequest.onAuthRequired.removeListener(agent_auth_listener);
    } catch(e){ on_hooks_err('be_rm_hooks_err', e); }
    agent_auth_listener.inited = false;
}

function is_extra_headers_supported(){
    return is_chrome && be_util.browser_guess.version>=79; }

function agent_auth_listener_add(){
    if (zutil.is_mocha() || !chrome.webRequest.onAuthRequired)
        return;
    agent_auth_listener_del();
    try {
        let extra = ['blocking'];
        if (is_extra_headers_supported())
            extra.push('extraHeaders');
        chrome.webRequest.onAuthRequired.addListener(agent_auth_listener,
            {urls: ['<all_urls>']}, extra);
    } catch(e){ on_hooks_err('be_add_hooks_err', e); }
    agent_auth_listener.inited = true;
}

E.init = function(){
    if (E.inited)
        return;
    if (!requests_handler)
        requests_handler = Base_handler.get_handler();
    E.sp = be_vpn_util.new_etask('be_tab_unblocker');
    E.url_to_rule_infos = E.url_to_rule_infos||{};
    ff_exported.forEach(o=>window[o.name] = o.fn);
    agent_auth_listener_add();
    E.inited = 1;
    E.listen_to(be_ext, 'change:ext.active', update_state);
    E.listen_to(be_ext, 'change:bext_config', update_config);
    be_ext.on('not_working', on_not_working);
    if (!zutil.is_mocha())
        E.listen_to(be_info, 'change:location', init_mitm);
    unblocker_lib.resolve_agents([{country: 'us'}]);
    if (zutil.is_mocha())
    {
        hola_req_id = 0;
        E.t.requests_handler = requests_handler;
    }
    update_config();
    init_mitm();
    if (window && window.hola)
    {
        window.hola.get_log = ()=>be_util.get_log().join('\n');
        window.hola.dump_unittest = unblocker_lib.dump_unittest;
    }
};

const init_bg_ajax_on_before_request = ff_cb_wrapper('on_before_bg_ajax',
    on_before_request_int);
const init_bg_ajax_on_req_end = ff_cb_wrapper('on_req_end_bg_ajax',
    on_completed_request_int);
const init_bg_ajax_on_send_headers = ff_cb_wrapper('on_send_headers_bg_ajax',
    on_send_headers_int);
const init_bg_ajax_on_headers = ff_cb_wrapper('on_headers_bg_ajax',
    on_headers_int);
E.init_ajax_via_proxy = function(){
    if (E.ajax_via_proxy_inited || zutil.is_mocha())
        return;
    be_ext.set('ajax_via_proxy_inited', E.ajax_via_proxy_inited = 1);
    E.url_to_rule_infos = E.url_to_rule_infos||{};
    if (!requests_handler)
        requests_handler = Base_handler.get_handler();
    requests_handler.init();
    be_pac.init();
    const et = be_pac.load_pac_file(undefined, true);
    const urls = ['http://internal.hola/*', 'https://client.hola.org/*',
        'https://hola.org/*', 'https://perr.hola.org/*',
        'https://client.svd-cdn.com/*', 'https://svd-cdn.com/*',
        'https://perr.svd-cdn.com/*', 'http://*.trigger.hola.org/*'];
    try {
        chrome.webRequest.onBeforeRequest.addListener(
            init_bg_ajax_on_before_request, {urls: urls}, ['requestBody',
            'blocking']);
        chrome.webRequest.onHeadersReceived.addListener(
            init_bg_ajax_on_headers, {urls: urls}, ['blocking',
            'responseHeaders']);
        chrome.webRequest.onBeforeSendHeaders.addListener(
            init_bg_ajax_on_send_headers, {urls: urls}, ['blocking',
            'requestHeaders']);
        chrome.webRequest.onCompleted.addListener(init_bg_ajax_on_req_end,
            {urls: urls.slice(1)});
        chrome.webRequest.onErrorOccurred.addListener(init_bg_ajax_on_req_end,
            {urls: urls.slice(1)});
    } catch(e){ on_hooks_err('be_add_hooks_err', e); }
    return et;
};

E.uninit_ajax_via_proxy = function(){
    if (!E.ajax_via_proxy_inited)
        return;
    be_ext.set('ajax_via_proxy_inited', E.ajax_via_proxy_inited = 0);
    try {
        chrome.webRequest.onBeforeRequest.removeListener(
            init_bg_ajax_on_before_request);
        chrome.webRequest.onErrorOccurred.removeListener(
            init_bg_ajax_on_req_end);
        chrome.webRequest.onCompleted.removeListener(init_bg_ajax_on_req_end);
        chrome.webRequest.onHeadersReceived.removeListener(
            init_bg_ajax_on_headers);
        chrome.webRequest.onHeadersReceived.removeListener(
            init_bg_ajax_on_send_headers);
    } catch(e){ on_hooks_err('be_rm_hooks_err', e); }
};

function update_state(){
    let is_enabled = be_ext.get('ext.active');
    if (!is_enabled)
        E.uninit_ajax_via_proxy();
    be_pac.load_pac_cb();
    if (is_enabled==E.is_enabled)
        return;
    E.is_enabled = is_enabled;
    E.stopListening(be_tabs);
    if (requests_handler)
        requests_handler.uninit();
    if (!E.is_enabled)
        return;
    if (requests_handler)
        requests_handler.init();
    E.listenTo(be_tabs, 'created', on_tab_created);
    E.listenTo(be_tabs, 'updated', on_tab_updated);
    E.listenTo(be_tabs, 'removed', on_tab_removed);
    E.listenTo(be_tabs, 'replaced', on_tab_replaced);
    E.listenTo(be_tabs, 'completed', on_tab_completed);
    E.listenTo(be_tabs, 'before_navigate', on_before_navigate);
}

function mitm_config_reset(prev, config){
    if (_.isEqual(prev.mitm, config.mitm) || storage.get_json('mitm_debug'))
        return;
    uninit_mitm();
    init_mitm();
}
function update_config(){
    const prev = bext_config;
    bext_config = be_ext.get('bext_config')||{};
    mitm_config_reset(prev, bext_config);
    proxy_debug = zutil.get(bext_config, 'debug.proxy_debug');
    debug_hooks = !zutil.get(bext_config, 'debug_logs.disable');
    request_errors = zutil.get(bext_config, 'request_errors.handle', []);
}
function get_failure_config(type){
    const failure = bext_config[type+'_failure'];
    if (failure && !failure.disable && (!failure.min_ver ||
        version_util.cmp(be_util.version(), failure.min_ver)>=0))
    {
        return failure;
    }
}

const on_main_frame_headers = d=>{
    let failure;
    if (!(failure = get_failure_config('browse')))
        return;
    let req, tab;
    if (d.tabId<0 || !(tab = E.tab_unblockers[d.tabId]) ||
        !(req = E.requests[d.requestId]) ||
        !/^(4|5)/.test(d.statusCode) || d.statusCode==407)
    {
        return;
    }
    if (req.agent)
        tab.browse_failures = (tab.browse_failures||0)+1;
    let tab_url = d.initiator||d.url, root_url;
    if (tab_url)
        root_url = svc_util.get_root_url(tab_url);
    zerr.notice('tab:%d browse failure detected: %d %s', d.tabId,
        d.statusCode, d.url.slice(0, 200));
    if (!failure.disable_perr)
    {
        be_lib.perr_ok({id: 'browse_failure_detected',
            info: {url: d.url, code: d.statusCode, page_url: tab_url,
            root_url, agent: req.agent&&req.agent.host},
            rate_limit: {count: 1}});
    }
};

E.get_all_agents = function(){
    let agents = [];
    if (!E.rules)
        return agents;
    agents = agents.concat(unblocker_lib.get_all_agents('us')||[]);
    for (let r in E.rules.unblocker_rules)
    {
        let rule = E.rules.unblocker_rules[r];
        unblocker_lib.get_rule_routes(rule).forEach(function(s){
            if (s!='us')
            {
                agents = agents.concat(unblocker_lib.get_all_agents(s, rule)
                    || []);
            }
        });
    }
    return agents;
};

E.cleanup_rule_proxies = be_pac.cleanup_rule_proxies;

if (zutil.is_mocha())
{
    E.t = {Base_handler, is_force_proxy, on_not_working, tab_unblocker_del,
        url_hook: init_mitm_check_url, err_hook: init_mitm_check_err,
        get_forced_strategy, test_rules: test_rules, on_before_navigate,
        on_tab_created, on_tab_updated, on_tab_removed, requests_handler,
        is_vpn_allowed};
}

return E; });
