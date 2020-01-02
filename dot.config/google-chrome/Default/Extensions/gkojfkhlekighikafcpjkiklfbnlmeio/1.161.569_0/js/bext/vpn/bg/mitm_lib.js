// LICENSE_CODE ZON
'use strict'; 
(function(){
let define;
const is_node = typeof module=='object' && module.exports && module.children;
if (!is_node)
    define = self.define;
else
    define = require('../../../util/require_node.js').define(module, '../');
define(['/util/etask.js', '/util/url.js', '/util/util.js',
    '/util/version_util.js'], function(etask, zurl, zutil, version_util){
const E = {debug: {}};
const assign = Object.assign;
let mitm_tabs = {}, bext_config = {}, rules = [];
let ajax, storage, perr, mitm_discovery, zerr, rnd_id, local;
let SEC = 1000, MIN = 60*SEC, HOUR = 60*MIN, api;
const min_rules_ver = '1.128.267';
const def_api = {ajax_via_proxy: ()=>{}, perr: ()=>{}, zerr: {notice: ()=>{}},
    add_tab_hook: ()=>{}, local: null, remove_tab_hook: ()=>{},
    remove_unblock_rule: ()=>{}, storage: {get: ()=>{}, set: ()=>{},
    get_json: ()=>{}, set_json: ()=>{}, getItem: ()=>{}}, init_proxy: ()=>{},
    has_geo: ()=>{}, loc: {country: 'us'}};
const sim_rules = [
    {domain: 'nako.me', resp: {status: 0}},
    {domain: 'keter.co.il', resp: {status: 302,
        headers: {location: 'https://facebook.com'}}},
];
function sim_find(url){
    return E.enable_sim && sim_rules.find(r=>{
        var reg = new RegExp('https?://'+r.domain+'/');
        return reg.test(url);
    });
}
E.sim_filters = type=>{
    if (!E.inited || !E.enable_sim)
        return;
    var ret = [];
    sim_rules.forEach(r=>{
        if (type=='before_request' && !r.resp.status)
            ret.push('*://'+r.domain+'/');
        if (type=='headers_received' && r.resp.status)
            ret.push('*://'+r.domain+'/');
    });
    return ret;
};

function sim_set(resp, url){
    var sim;
    if (!E.inited || !E.enable_sim || !(sim=sim_find(url||resp.url)))
        return;
    resp.statusCode = sim.resp.status;
    resp.headers = assign({}, resp.headers, sim.resp.headers);
    resp.redir = '/js/bext/vpn/bg/sim_dns_block.html?orig_url='
        +encodeURIComponent(url);
    return resp;
}

var mitm_dbg;
var ZG = zutil.get;
function CG(path, def){ return ZG(bext_config, path, def); }
function CGM(path, def){ return ZG(bext_config.mitm, path, def); }
function CGM_includes(path, i, def){
    return CGM(path, def||[]).length && CGM(path, def).includes(i); }
function CGM_match(path, i, def){
    return CGM(path, def||[]).some(m=>{
        var r = new RegExp(m);
        return r.test(i);
    });
}
function CGM_if_includes(path, i){ return CGM_includes(path, i, [i]); }
function trace(tid, turl, s){
    if (!E.debug.tracer && !CGM('tracer'))
        return;
    if (arguments.length==1)
    {
        s = tid;
        tid = null;
    }
    if (typeof s=='object')
        s = '\n'+JSON.stringify(s);
    console.log('TRACE '+(new Date().toLocaleTimeString('en-US',
        {hour12: false}))+' '+(tid ? '['+tid+':'+get_root_url(turl)+']' : '')
        +': '+s);
}
E.trace = trace;
function rule_get(url, opt){
    var host = get_root_url(url), now = Date.now(), ret = [];
    opt = opt||{};
    for (var i=0; i<rules.length; i++)
    {
        var r = rules[i];
        if (!opt.allow_stale && r.until && r.until < now)
            continue;
        if (r.name!=host || r.src_country!=local.src_country)
            continue;
        if (local.dev=='desktop' || local.conn=='cellular'
            || r.ips.includes(local.ip))
        {
            return r;
        }
        if ((local.dev=='laptop' || local.conn=='wifi') && opt.all)
            ret.push(r);
    }
    return ret.length ? ret : null;
}
function rules_cleanup(){
    var now = Date.now();
    var del = rules.filter(r=>(r.until && r.until<now && r.cmd=='ignore'
        && !r.auto_unblock));
    del.forEach(d=>{ rules.splice(rules.indexOf(d), 1); });
    if (del.length)
        set_rules_to_storage();
}
function rule_del(url){
    init_rules_from_storage();
    var rule = rule_get(url);
    if (!rule)
        return;
    if (rule.type=='unblock' || rule.auto_unblock)
        rule_invalidate(rule);
    else
        rules.splice(rules.indexOf(rule), 1);
    set_rules_to_storage();
}
function rule_gen(url, opt){
    opt = opt||{};
    var r = {};
    var now = Date.now();
    r.name = get_root_url(url);
    r.url = url;
    r.country = opt.country||'us';
    r.src_country = local.src_country;
    r.dev = local.dev;
    r.conn = local.conn;
    r.cmd = opt.cmd||'unblock';
    r.type = opt.type;
    r.ips = [local.ip];
    r.auto_unblock = r.type=='auto' && r.cmd=='unblock';
    if (opt.force)
        r.force = opt.force;
    if (opt.until)
        r.until = now + opt.until;
    r.ts = now;
    return r;
}
function init_rules_from_storage(){
    var o = storage.get_json('mitm_rules');
    if (!o || !o.ver || !o.rules || version_util.cmp(o.ver, min_rules_ver)<0)
        rules = [];
    else
    {
        rules = o.rules;
        rules = rules.map(e=>{
            return e.name ? e : assign(zutil.omit(e, 'host', 'proxy_country',
                'country'), {name: e.host, src_country: e.country,
                country: e.proxy_country});
        });
    }
    if (zutil.is_mocha())
        E.t.rules = rules;
}
function set_rules_to_storage(){
    storage.set_json('mitm_rules', {ver: min_rules_ver, rules});
}

function rule_compat(rule){
    return (rule.cmd=='unblock' && (rule.dev=='desktop'
        || rule.conn=='cellular'))
        || (rule.cmd=='unblock' || local.dev=='desktop'
        || local.dev=='cellular') || rule.ips.includes(local.ip);
}

function rule_invalidate(rule, set){ rule.until = Date.now()-10; }
function rule_set(url, opt){
    opt = opt||{};
    opt.cmd = opt.cmd||'unblock';
    init_rules_from_storage();
    var r = rule_get(url, {allow_stale: true});
    if (!r)
        rules.push(r=rule_gen(url, opt));
    else if (r.cmd==opt.cmd && !opt.until && !r.until
        && r.force==opt.force && r.type==opt.type
        && ((local.dev=='desktop' || local.conn=='cellular')
        || r.ips.includes(local.ip)))
    {
        return r;
    }
    else
    {
        r.cmd = opt.cmd||'unblock';
        if (r.force || opt.force)
            r.force = opt.force;
        delete r.until;
        if (opt.until)
            r.until = Date.now()+opt.until;
        r.type = opt.type;
        r.auto_unblock = r.auto_unblock || r.type=='auto' && r.cmd=='unblock';
        if ((local.dev=='laptop' || local.conn=='wifi')
            && !r.ips.includes(local.ip))
        {
            r.ips.push(local.ip);
        }
    }
    set_rules_to_storage();
    return r;
}
function rule_valid_ms(url){
    var rule = rule_get(url);
    return rule ? rule.until - Date.now() : 0;
}
function has_ignore_rule(tab_url){
    var rule = rule_get(tab_url);
    return rule && rule.cmd=='ignore';
}
function rule_del_and_cleanup(url){
    if (!E.inited)
        return;
    trace('rule_del_and_cleanup '+get_root_url(url));
    rule_del(url);
    api.remove_unblock_rule(url);
    for (var tab_id in mitm_tabs)
    {
        var tab = mitm_tabs[tab_id];
        if (get_root_url(tab.url)!=get_root_url(url))
            continue;
        delete tab.manual;
        delete tab.rule;
        tab_remove_hooks(tab);
    }
}
function is_feature_enabled(feature, extra){
    var m = feature.split('.'), path = '';
    return m.every(f=>{
        path = path+(path ? '.' : '')+f;
        var v_path = feature+'.min_ver';
        var d_path = feature+'.disable';
        var e_path = feature+'.'+extra;
        return !CGM(d_path) && (!CGM(v_path)
            || version_util.cmp(api.version, CGM(v_path))>=0)
            && (!extra || CGM(e_path));
    });
}
function is_redir(code){
    return [300, 301, 302, 303, 307].includes(code); }
function is_trigger_enabled(feature){
    return is_feature_enabled(feature, 'trigger'); }
function is_manual_supported(){ return is_feature_enabled('manual'); }
function is_auto_supported(){ return is_feature_enabled('auto'); }
function detect_error(){ return is_feature_enabled('auto.error'); }
function detect_fake_resp(){ return is_feature_enabled('auto.fake_resp'); }
function detect_fake_redirect(){ return is_feature_enabled('auto.redirect'); }
E.user_set_unblock = (url, until)=>
    E.inited && rule_set(url, {until, type: 'user_choice'});
E.set_ignore = (url, until, type)=>{
    if (!E.inited)
        return;
    rule_del_and_cleanup(url);
    rule_set(url, {cmd: 'ignore', until: until||7*24*HOUR,
        type: type||'user_choice'});
};
E.set_manual_tab = (tab_id, tab_url, until)=>{
    if (!E.inited || !is_manual_supported())
        return;
    E.tabs_add(tab_id, tab_url, 'set_manual_tab');
    var tab;
    if (!(tab = mitm_tabs[tab_id]))
        return;
    tab.manual = true;
    var rule = rule_set(tab_url, {until: until, type: 'manual'});
    tabs_set_rule(tab_id, rule, 'set_manual_tab');
};
E.is_ignored = url=>{
    if (!E.inited || CGM('disable') || is_site_blacklisted(url))
        return false;
    var rule = rule_get(url);
    return rule && rule.cmd=='ignore' && rule.type;
};
E.get_unblock_rules = ()=>{
    var now = Date.now();
    return rules.filter(r=>
        ((!r.until || r.until>now) && r.cmd=='unblock' && r.type!='auto'));
};

function get_domain_url(url){
    var m = (url||'').match(/^https?:\/\/([^\/^:]+)\/?.*$/);
    return m ? m[1] : '';
}
function get_root_url(url){ return zurl.get_root_domain(get_domain_url(url)); }

function print_rules_state(){
    var count = 0;
    zerr.notice('rules dump:');
    rules.forEach(r=>{
        zerr.notice(count+') '+r.name+(r.cmd=='unblock' ? ' UNBLOCK' :
            ' IGNORE')+' - cached for '+((r.until - Date.now())/SEC)+'sec');
    });
}

function send_mitm_err(err){ send_mitm_perr(null, {error: err}); }
function send_mitm_perr(url, info, hc){
    info = info||{};
    var cmd = info.rule && info.rule.cmd || 'unknown';
    var o = {id: 'mitm_'+(info.err ? 'err' : cmd),
        info: assign({host: get_root_url(url||''),
        country: local.src_country, blocked: cmd=='unblock',
        sb_conf: bext_config.mitm,
        mitm_dbg: mitm_dbg, uuid: api.uuid, proxy_country: 'us'}, info)};
    if (!zutil.is_mocha())
    {
        perr(assign({filehead: rnd_id<CGM('log.random')
            || storage.get('mitm_send_log')
            || CGM_includes('log.uuids', api.uuid)
            || CGM_includes('log.countries', local.src_country)
            ? zerr.json(last_log) : undefined}, o));
    }
    log('perr - '+(info.err || (cmd=='unblock' ? 'blocked --> us' : 'ignore'))
        +(info.from_cache ? ' from cache' : ''), o, {hc: hc});
}

function is_tab_manual(id){ return mitm_tabs[id]&&mitm_tabs[id].manual; }
function is_tab_rule_set(id, rule){
    var tab = mitm_tabs[id];
    return tab && tab.rule && (!rule || rule.cmd==tab.rule.cmd
        && rule.type==tab.rule.type);
}
function is_tab_completed(id){ return mitm_tabs[id]&&mitm_tabs[id].completed; }
function is_rule_active(o){
    var rule = typeof o=='object' ? o : rule_get(o);
    return rule && rule.cmd=='unblock'
        && (rule.type=='manual' && is_manual_supported()
        && is_trigger_enabled('manual') || rule.type=='auto'
        && is_auto_supported() && is_trigger_enabled('auto')
        || rule.type=='user_choice')
        && !is_trigger_blacklisted(rule.url) && rule.type;
}
E._is_mitm_active = tab_id=>{
    var tab = mitm_tabs[tab_id];
    return E.inited && tab && tab.hook && tab.rule && (is_rule_active(tab.url)
        ||tab.rule.type);
};
E.is_mitm_active = tab_url=>{
    var ret = E.inited && is_rule_active(tab_url);
    if (!ret)
    {
        for (var tab_id in mitm_tabs)
        {
            var tab = mitm_tabs[tab_id];
            if (tab.url==tab_url && (ret=E._is_mitm_active(tab.id)))
                break;
        }
    }
    trace('any', tab_url, 'is_mitm_active '+ret);
    return ret;
};
E.is_ext_ui_enabled = ()=>
    (E.inited && is_manual_supported() && rnd_id<CGM('enable_ext_ui', 0)*100);
E.is_popup_needed = (tab_url, tab_id)=>{
    var o = CGM('popup');
    var ret = E.inited && E._is_mitm_active(tab_id) && api
        && o && o.enable && (!o.min_version ||
        version_util.cmp(api.version, o.min_version)>=0);
    trace(tab_id, tab_url, 'is_popup_needed '+ret);
    return ret;
};
var last_tab_id;
E.get_active_tab_rule = (tab_id, tab_url)=>{
    if (!E.inited || tab_id==-1)
        return;
    var rule = E.get_tab_rule(tab_id, tab_url);
    return is_rule_active(rule) && rule;
};
E.get_tab_rule = (tab_id, tab_url)=>{
    if (!E.inited || tab_id==-1)
        return;
    var tab = mitm_tabs[tab_id];
    tab_url = tab_url || tab && tab.url;
    return tab && tab.rule || tab_url && tabs_set_rule(tab_id, tab_url,
        'get_tab_rule');
};
function tabs_set_rule(tab_id, o, caller){
    var rule = typeof o=='object' ? o : rule_get(o);
    var tab_url = typeof o=='object' ? o.url : o;
    trace(tab_id, tab_url, 'tabs_set_rule by '+caller);
    E.tabs_add(tab_id, tab_url, 'tabs_set_rule');
    var tab = mitm_tabs[tab_id];
    if (!E.inited || !rule || !tab || tab.rule && tab.rule.cmd==rule.cmd
        && tab.rule.type==rule.type)
    {
        return tab && tab.rule;
    }
    tab.rule = rule;
    if (is_rule_active(rule))
    {
        tab_add_hooks(tab);
        if (rule.type=='auto')
        {
            rule_invalidate(rule);
            set_rules_to_storage();
        }
    }
    else if (tab.rule.cmd=='ignore')
        tab_remove_hooks(tab);
    return tab.rule;
}
function tab_add_hooks(tab, type){
    if (tab.hook)
        return;
    tab.hook = api.add_tab_hook(tab.id);
    tab.hook_ts = Date.now();
    trace(tab.id, tab.url, 'tab_add_hooks');
}
function tab_remove_hooks(tab){
    if (!tab.hook)
        return;
    trace(tab.id, tab.url, 'tab_remove_hooks');
    api.remove_tab_hook(tab.hook);
    delete tab.hook;
    delete tab.hook_ts;
}
function tab_rule_cleanup(tab){
    if (!tab.rule || tab.rule.type!='auto' || tab.rule.cmd!='unblock')
        return;
    delete tab.manual;
    delete tab.rule;
    api.remove_unblock_rule(tab.url);
    tab_remove_hooks(tab);
}
E.tabs_del = (tab_id, caller)=>{
    var tab;
    if (!E.inited || !(tab = mitm_tabs[tab_id]))
        return;
    trace(tab_id, tab.url, 'tabs_del by '+(caller||'ext'));
    tab_rule_cleanup(tab);
    delete mitm_tabs[tab_id];
};
E.tabs_add = (tab_id, tab_url, caller)=>{
    if (!E.inited || !mitm_tabs[tab_id] && !tab_url
        || /chrome:\/\/newtab\//.test(tab_url))
    {
        return;
    }
    trace(tab_id, tab_url, 'tabs_add by '+caller);
    if (tab_url && mitm_tabs[tab_id] && mitm_tabs[tab_id].url!=tab_url)
    {
        trace(tab_id, tab_url, 'tabs_add url mismatch '+mitm_tabs[tab_id].url
            +'!='+tab_url);
        E.tabs_del(tab_id, 'tabs_add');
    }
    else if (mitm_tabs[tab_id] && caller=='on_before_navigate')
    {
        tab_rule_cleanup(mitm_tabs[tab_id]);
        tabs_set_rule(tab_id, tab_url, 'tabs_add');
    }
    if (!mitm_tabs[tab_id])
        mitm_tabs[tab_id] = {url: tab_url, method: 'root', id: tab_id};
    last_tab_id = tab_id;
};
E.tabs_set_complete = tab_id=>{
    if (E.inited && mitm_tabs[tab_id])
        mitm_tabs[tab_id].completed = true;
};

E.tab_set_req_info = (tab_id, info)=>{
    if (E.inited && mitm_tabs[tab_id])
        mitm_tabs[tab_id].req_info = info;
};
E.tab_get_req_info = tab_id=>{
    if (E.inited && mitm_tabs[tab_id])
        return mitm_tabs[tab_id].req_info;
};

E.strategy_wrapper = (strategy, req, tab_url)=>{
    var tab_id = req.tab_id, rule;
    if (!E.inited || !(rule = E.get_active_tab_rule(tab_id, tab_url)))
        return strategy;
    return (direct_resp, proxy_resp)=>{
        var error;
        if (req.mitm_rewrite)
        {
            error = proxy_resp&&proxy_resp.error;
            direct_resp = proxy_resp;
            proxy_resp = null;
        }
        var ret = strategy(direct_resp, proxy_resp)||{};
        var has_direct = Object.keys(ret.direct||{}).length;
        var has_proxy = Object.keys(ret.proxy||{}).length;
        if (!(req.mitm_rewrite = !!rule.force || !error && has_direct
            && !has_proxy))
        {
            return ret;
        }
        ret = {proxy: ret.direct, direct: ret.proxy, src: 'mitm_route'};
        ret.proxy = assign({country: rule.country}, ret.proxy);
        return ret;
    };
};

function is_valid_resp(details){
    var headers = details && details.headers || {};
    var code = details && details.statusCode || 0;
    var url = details && details.url;
    if (!code)
        return !detect_error();
    if (/cloudflare/.test(headers.server))
        return true;
    if (get_protocol(url)=='https')
        return true;
    if (is_redir(code))
    {
        return !detect_fake_redirect() || (headers.location
            && (!/^https?:\/\//.test(headers.location)
            || get_root_url(url)==get_root_url(headers.location))
            || check_redirect_filter(url, headers.location));
    }
    if (!detect_fake_resp())
        return true;
    if ([200, 404].includes(code) && (headers.connection=='close'
        || headers['content-length']<10000))
    {
        return false;
    }
    return true;
}

function handle_mitm_block(hc){
    trace(hc.tab_id, hc.tab_url, 'mitm.handle_mitm_block start');
    if (is_tab_rule_set(hc.tab_id, hc.rule))
        return void trace(hc.tab_id, hc.tab_url, 'tab rule already set');
    hc.handle = E.inited && is_rule_active(hc.tab_url);
    if (!hc.info.in_parallel)
        send_mitm_perr(hc.tab_url, assign({rule: hc.rule}, hc.info), hc);
    if (sim_find(hc.tab_url))
        hc.sim = {url: hc.tab_url};
    return hc;
}

function get_agent_min_fmt(a){ return zutil.pick(a, 'host', 'port', 'ip'); }

var last_log = [];
function log(short, long, opt){
    opt = opt||{};
    if (opt.init)
        last_log = [];
    var lopt;
    if (lopt = long&&long.opt)
    {
        lopt = long.opt = assign({}, lopt);
        if (lopt.agent)
            lopt.agent = get_agent_min_fmt(lopt.agent);
        if (lopt.agents)
            lopt.agents = lopt.agents.map(get_agent_min_fmt);
        if (lopt.hc)
            lopt.hc = zutil.omit(lopt.hc, 'detect_log');
    }
    trace(opt.hc&&opt.hc.tab_id, opt.hc&&opt.hc.tab_url, short||long);
    return last_log.push({short: short, long: long});
}

function get_protocol(url){
    var m = url && url.match(/(https?):\/\//);
    return m && m[1];
}
function check_redirect_filter(url, redir){
    return !!CGM('redirect_filter', []).find(r=>(r.domain ?
        get_domain_url(redir)==r.domain : r.url==url && r.redir==redir));
}

function check_response_filter(resp, response_filter){
    return CGM('response_filter', []).find(r=>
        Object.keys(r).every(k=>r[k]==resp[k]));
}

function etask_sleep(t){ return zutil.is_mocha() ? null : etask.sleep(t); }

function triple_check(url, opt){
    function send_next(){
        if (agents[next])
            delete agents[next].timeout;
        if (agents[++next])
            _this.spawn(send_ajax());
        else
            et_timeout = setTimeout(()=>{ et.return(ret); }, 3000);
    }
    function send_ajax(){
        var _url = {url: url, type: 'GET'};
        var agent = opt.force=='proxy' ? agents[next] : null;
        var _opt = assign({}, {always: true, hdrs_abort: true,
            ignore_redir: true, hdrs: {'Cache-Control': 'no-cache,'
            +'no-store,must-revalidate,max-age=-1'}, force_headers: true,
            fix_307: true, agent: agent}, opt);
        log('ajax '+(opt.replace||opt.force)+(opt.force=='proxy'
            && !opt.replace ? ' --> '+opt.country : ''),
            {url: _url, opt: _opt}, {hc: opt.hc});
        ts = Date.now();
        var state = {};
        var et = api.ajax_via_proxy(_url, _opt, state);
        if (agent)
        {
            agent.state = state;
            agent.timeout = setTimeout(send_next, 3000);
            agent.et = et;
        }
        else
        {
            et_timeout = setTimeout(()=>{
                et.return({orig_res: {error: 'timeout'}}); }, 20000);
        }
        return et;
    }
    var ret = {error: 'all agents failed'}, ts, agents = opt.agents||[];
    var next = 0, et_timeout, _this;
    var et = etask('triple_check', function*triple_check_(){
        _this = this;
        this.finally(()=>{
            clearTimeout(et_timeout);
            agents.forEach(a=>clearTimeout(a.timeout));
        });
        this.spawn(send_ajax());
        yield this.wait_child('any', resp=>{
            clearTimeout(et_timeout);
            var _ret = resp && resp.orig_res || {error: 'ajax failed'};
            _ret.statusCode = _ret.statusCode!=undefined ? _ret.statusCode
                : _ret.code;
            delete _ret.body;
            if (resp && resp.agent && resp.agent.timeout)
                clearTimeout(resp.agent.timeout);
            var proxy_err = opt.force=='proxy'
                && /ERR_PROXY_CONNECTION_FAILED/.test(_ret.error);
            var ajax_err = _ret.error=='ajax failed';
            log('resp '+(_ret.error||_ret.statusCode)+' after '
                +(Date.now()-ts)+'ms', null, {hc: opt.hc});
            if (opt.country && _ret.error && !proxy_err && !ajax_err
                || !opt.country && !ajax_err || !agents[next+1]
                || _ret.statusCode)
            {
                ret = _ret;
                return true;
            }
            send_next();
        });
        return ret;
    });
    return et;
}

function mitm_ret(hc, rule, info){
    hc.rule = rule;
    if (rule.cmd=='unblock')
    {
        hc.blocked = rule.type;
        hc.country = rule.country;
    }
    hc.info = assign({}, hc.info, info);
    return hc.test ? hc : handle_mitm_block(hc);
}
function set_temp_ignore(url, opt)
{
    var feature = opt.hook=='error' ? 'error' : is_redir(opt.prev_code)
        ? 'redirect' : 'fake_resp';
    var rule_opt = {force: opt.force_peer, type: 'auto',
            cmd: 'ignore', until: rule_get(url) ? HOUR : 5*MIN};
    var rule;
    if (opt.hook!='test' && is_trigger_enabled('auto.'+feature))
        rule = rule_set(url, rule_opt);
    else
        rule = rule_gen(url, rule_opt);
    return rule;
}
var running_tests = {}, SLEEP = 100;
function is_western(country){
    return ['us', 'ca', 'gb', 'fr', 'it', 'es', 'de', 'se'].includes(country);
}
E.check_mitm_blocking = function(opt){
    if (!E.inited)
        return;
    var url = opt.url, tab_id = opt.tab_id, tab_url = opt.tab_url;
    var prev_code = opt.prev_code||0, root_url = get_root_url(url);
    var hc = {name: root_url, tab_url: tab_url, url: opt.url,
        tab_id: tab_id, info: {timing: {tab_url: get_url_timing(tab_url),
        ts: Date.now()}}, test: opt.hook=='test', redir: opt.redir,
    };
    var rule = !hc.test && E.get_tab_rule(tab_id, hc.tab_url);
    var country = opt.country||'us', timing = hc.info.timing;
    var in_progress = running_tests[root_url];
    var feature = opt.hook=='error' ? 'error' : is_redir(prev_code)
        ? 'redirect' : 'fake_resp';
    function _ltrace(s){ trace(tab_id, tab_url, 'check_mitm_blocking(running '
        +Object.keys(running_tests).length+') '+s); }
    var ltrace = E.tracer ? _ltrace : ()=>{};
    ltrace('start');
    if (opt.headers)
    {
        hc.info.headers = assign({url: tab_url, country: local.src_country,
            status: prev_code}, opt.headers);
    }
    else if (opt.err_str)
        hc.info.headers = {status: 0, error: opt.err_str};
    if (in_progress && in_progress.tab_id==tab_id)
        return void ltrace('abort in progress');
    if (!opt.ignore_rule && rule)
    {
        ltrace('rule in cache');
        return mitm_ret(hc, rule, {from_cache: true});
    }
    in_progress = running_tests[root_url];
    if (!in_progress)
        in_progress = running_tests[root_url] = {tab_id: tab_id};
    log('init '+tab_url+' status code '+prev_code, '', {init: true, hc: hc});
    var proto = get_protocol(url);
    var test_url = !prev_code ? proto=='http' ? url.replace('http', 'https')
        : url : 'https://'+get_domain_url(url)
        +'/does_not_exist_'+(zutil.is_mocha() ? '11111'
        : Math.round(Math.random()*100000));
    return etask('check_mitm_blocking', [function(){
        if (hc.test)
            return this.goto('test');
        if (in_progress.et)
            return this.wait_ext(in_progress.et);
        in_progress.et = this;
        return this.goto('test');
    }, function(){
        hc.info.from_cache = true;
        hc.info.in_parallel = true;
        rule = rule_get(url);
        hc.blocked = rule && rule.cmd=='unblock';
        return this.goto('ret', rule);
    }, function test(){
        if (proto=='https' || !is_western(local.src_country))
            return this.goto('proxy');
        return triple_check(test_url, opt.force_peer ? {force: 'proxy',
            country: opt.force_peer, hc: hc} : {force: 'direct', hc: hc});
    }, function(resp){
        resp.statusCode = resp.status!==undefined ? resp.status
            : resp.statusCode;
        timing.pre_direct = Date.now() - timing.ts;
        hc.info.pre_direct_resp = assign({url: url, test_url: test_url},
            zutil.pick(resp, 'statusCode', 'headers', 'error'));
        if (resp.error=='ajax failed' || resp.statusCode)
        {
            hc.blocked = false;
            return this.goto('ret');
        }
    }, function proxy(){
        return triple_check(test_url, {force: 'proxy', country: country,
            agents: opt.agents, hc: hc});
    }, function(resp){
        timing.proxy = Date.now() - (timing.pre_direct||timing.ts);
        var r = hc.info.proxy_resp = {url: url};
        if (r.url!=test_url)
            r.test_url = test_url;
        r = assign(r, zutil.pick(resp, 'statusCode', 'headers', 'error'));
        log('proxy resp '+r.statusCode, r, {hc: hc});
        if (!r.statusCode)
        {
            rule = set_temp_ignore(url, opt);
            log('proxy request failed '+r.statusCode, '', {hc: hc});
            return this.return(mitm_ret(hc, rule, {proxy_fail: true}));
        }
        if (is_redir(prev_code) && is_redir(r.statusCode)
            && get_domain_url(opt.headers.location)
            == get_domain_url(r.headers.location))
        {
            hc.blocked = false;
            return this.goto('ret');
        }
        return etask_sleep(SLEEP);
    }, function(){
        if (prev_code)
            test_url += '1';
        if (sim_find(url))
            return sim_set({}, url);
        if (!opt.force_peer && ajax)
            return ajax({url: test_url, no_throw: true});
        return triple_check(test_url, opt.force_peer ? {force: 'proxy',
            country: opt.force_peer, hc: hc} : {force: 'direct', hc: hc});
    }, function(resp){
        timing.direct = Date.now() - timing.proxy;
        resp.statusCode = resp.status!==undefined ? resp.status
            : resp.statusCode;
        var r = hc.info.direct_resp = assign({url: url, test_url: test_url},
            zutil.pick(resp, 'statusCode', 'headers', 'error'));
        if (r.error=='ajax failed' || resp.statusCode)
        {
            hc.blocked = false;
            return this.goto('ret');
        }
        log('direct resp '+r.statusCode, r, {hc: hc});
        hc.detect_log = E.debug.last_log = last_log;
        hc.info.reason = 'direct https failed';
        hc.blocked = true;
    }, function ret(_rule){
        hc.info.reason = _rule ? 'in parallel' : hc.blocked ? 'trigger: '
            +prev_code+(opt.err_str ? ' '+opt.err_str : '')
            +' -> blocked due to '+hc.info.reason : '';
        var geo_rule = api.has_geo(tab_url);
        if (geo_rule)
        {
            log('geo rule enabled before detection complete', geo_rule);
            return;
        }
        var rule_opt = {force: opt.force_peer, type: 'auto',
            cmd: hc.blocked ? 'unblock' : 'ignore',
            until: !hc.blocked ? HOUR : 5*MIN};
        if (hc.test || !is_trigger_enabled('auto.'+feature))
            rule = _rule || rule_gen(url, rule_opt);
        else
        {
            rule = _rule || rule_set(url, rule_opt);
            if (!hc.info.in_parallel)
            {
                zerr.notice('MITM: '+hc.name+' on tab '+tab_url+'('+tab_id+')'
                    +(hc.blocked ? ' BLOCKED' : ' OK'));
            }
        }
        return mitm_ret(hc, rule);
    }, function finally$(){
        delete running_tests[root_url];
        timing.total = Date.now() - timing.ts;
        if (!hc.info.in_parallel)
            print_rules_state();
    }]);
};

function is_trigger_blacklisted(url){
    return CGM_match('trigger_blacklist', get_root_url(url)); }
function is_site_blacklisted(url){
    return CGM_match('site_blacklist', get_root_url(url)); }
function set_config(conf){ bext_config = conf||{}; }
function is_method_all(tab_id){ return is_method_allowed(tab_id, 'all'); }
function is_method_root(tab_id){ return is_method_allowed(tab_id, 'root'); }
function is_method_allowed(tab_id, method){
    var tab = mitm_tabs[tab_id];
    if (!E.inited || !tab || tab.method!=method)
        return;
    return E.is_auto_discovery() || is_tab_manual(tab_id);
}
E.is_mitm_allowed = (tab_id, tab_url, url, details)=>{
    return E.inited && !is_valid_resp(details) && (is_method_root(tab_id)
        && url==tab_url || is_method_all(tab_id)
        && get_root_url(url)==get_root_url(tab_url))
        && !has_ignore_rule(tab_url) && !is_site_blacklisted(tab_url);
};
E.is_auto_discovery = ()=>
    (E.inited && mitm_discovery=='auto' && is_auto_supported());
E.should_unblock = tab_url=>{
    var rule = rule_get(tab_url, {allow_stale: true});
    return rule && rule.auto_unblock;
};
E.debug.get_debug_info = tab_id=>{
    var tab = mitm_tabs[tab_id||last_tab_id];
    return {host: get_root_url(tab ? tab.url : ''),
        sb_conf: bext_config.mitm, mitm_dbg: mitm_dbg,
        url: tab && tab.ur, filehead: zerr.json(last_log)};
};
E.debug.bug_report = (tab_id, info)=>{
    if (isNaN(tab_id))
        info = tab_id;
    info = info||{};
    var o = {id: 'mitm_bug_report', info: assign({uuid: api.uuid,
        proxy_country: 'us'}, E.debug.get_debug_info(tab_id), info)};
    if (!zutil.is_mocha())
        perr(assign({filehead: zerr.json(last_log)}, o));
};

E.debug.rules_dump = print_rules_state;
E.debug.running_tests = running_tests;
E.debug.reset = ()=>{
    rules = [];
    set_rules_to_storage();
    Object.keys(running_tests).forEach(r=>{
        if (running_tests[r].et)
            running_tests[r].et.return();
    });
    for (var tab_id in mitm_tabs)
    {
        var tab = mitm_tabs[tab_id];
        delete tab.manual;
        delete tab.rule;
        tab_remove_hooks(tab);
    }
};
E.debug.mitm_test = (url, prev_code, force_peer)=>etask(function*mitm_test_(){
    console.log('Starting check_mitm_blocking test on '+url);
    api.init_proxy();
    const hc = yield E.check_mitm_blocking({url, force_peer, tab_url: url,
        hook: 'test', prev_code: prev_code||0});
    console.log('RESPONSE '+(hc.blocked ? 'blocked '+hc.blocked+' '+hc.reason :
        'not blocked'));
    console.log('log:', hc.detect_log);
    console.log('direct resp:', hc.info.direct_resp);
    console.log('proxy resp:', hc.info.proxy_resp);
    console.log('RESULT: '+(hc.blocked ? 'BLOCKED' : 'NOT BLOCKED'));
});

function get_url_timing(url){
    var e;
    if (typeof window!=='undefined' && window.performance
        && window.performance.getEntriesByName
        && (e=window.performance.getEntriesByName(url)) && e.length==1)
    {
        e = e[e.length-1];
        if (e.responseEnd && e.responseStart)
            return Math.round(e.responseEnd - e.responseStart);
    }
}

E.init = function(_api){
    api = assign({}, def_api, _api);
    E.inited = false;
    if (!api.loc || !api.loc.country)
        return;
    local = {src_country: api.loc.country.toLowerCase(), ip: api.loc.ip,
        conn: api.connection_type, dev: api.device_type};
    if (zutil.is_mocha())
        E.t.local = local;
    storage = api.storage;
    perr = api.perr;
    zerr = api.zerr;
    mitm_dbg = storage.get_json('mitm_debug');
    if (mitm_dbg && !Object.keys(mitm_dbg).length)
    {
        mitm_dbg = {disable: false, discovery: 'auto', popup: {enable: 1},
            enable_ext_ui: 1, manual: {trigger: true, disable: false},
            auto: {trigger: true, disable: false, error: {disable: false,
            trigger: true}, fake_resp: {disable: false, trigger: true},
            redirect: {disable: false, trigger: true}},
            detect_geo_rules: true};
        storage.set_json('mitm_debug', mitm_dbg);
    }
    set_config(zutil.extend_deep({}, api.bext_config, mitm_dbg
        ? {mitm: mitm_dbg} : null));
    if (CGM('disable') || !CGM_if_includes('country_whitelist',
        local.src_country) || CGM_includes('country_blacklist',
        local.src_country) || CGM('min_version')
        && version_util.cmp(api.version, CGM('min_version'))<0)
    {
        return;
    }
    E.enable_sim = storage.get('mitm_enable_sim');
    init_rules_from_storage();
    rules_cleanup();
    mitm_discovery = CGM('discovery', 'manual');
    rnd_id = storage.get('be_rnd');
    if (rnd_id==null || isNaN(rnd_id))
        storage.set('be_rnd', rnd_id=Math.round(Math.random()*100));
    E.debug.mitm_tabs = mitm_tabs;
    window.mitm = E.debug;
    return E.inited = true;
};

E.uninit = function(){
    Object.keys(running_tests).forEach(r=>{
        if (running_tests[r].et)
            running_tests[r].et.return();
    });
    delete window.mitm;
    api = def_api;
    mitm_dbg = local = ajax = rnd_id = undefined;
    bext_config = {};
    rules = [];
    perr = api.perr;
    zerr = api.zerr;
    storage = api.storage;
    mitm_discovery = 'manual';
    mitm_tabs = {};
    E.inited = false;
};

if (zutil.is_mocha())
{
    E.t = {rule_set, rule_get, rules, local, running_tests, is_valid_resp};
}
return E; }); }());
