// LICENSE_CODE ZON
'use strict'; 
define(['/bext/pub/backbone.js', 'underscore', '/util/zerr.js',
    '/util/version_util.js', '/util/etask.js', '/util/date.js',
    '/util/escape.js', '/util/sprintf.js', '/bext/pub/browser.js',
    '/util/user_agent.js', '/util/ajax.js',
    '/util/storage.js', '/util/array.js', '/util/util.js',
    '/bext/vpn/util/util.js', '/svc/vpn/pub/util.js', 'zon_config', 'conf'],
    function(be_backbone, _, zerr, version_util, etask, date, zescape,
    sprintf, B, user_agent, ajax, storage, array, zutil, be_vpn_util,
    svc_util, zconf, conf)
{
const is_bg = be_vpn_util.is_bg();
const chrome = window.chrome;
const E = new be_backbone.model({model_name: 'util'});
const assign = Object.assign, if_set = zutil.if_set;
let ajax_cb, bext_config_cb;

E.os_guess = user_agent.guess();
E.browser_guess = user_agent.guess_browser();
E.os_win = ()=>E.os_guess.os=='windows';
E.os_win8 = ()=>E.os_guess.version==8;
E.os_mac = ()=>E.os_guess.os=='macos';
E.is_mobile = ()=>E.os_guess.mobile;
let _is_laptop;
E.is_laptop = ()=>_is_laptop;

E.version = ()=>zconf.ZON_VERSION;

E.is_google = root_url=>root_url && (root_url.split('.')[0]=='google' ||
    root_url.split('.')[1]=='google');

E.is_youtube = root_url=>root_url && (root_url.split('.')[0]=='youtube' ||
    root_url.split('.')[1]=='youtube');

var check_opera = /\bOPR\b\/(\d+)/i;
E.browser = ()=>{
    if (E.browser_guess.edge)
        return 'edge';
    var ua = navigator.userAgent;
    var opera = check_opera.exec(ua);
    return conf.browser.firefox ? 'firefox' :
        conf.browser.opera || opera&&opera[1] ? 'opera' : 'chrome';
};

E.qs_ajax = o=>{
    var info = {ext_ver: E.version(), browser: E.browser(),
        product: E.get_product()};
    if (zutil.is_mocha()) 
        info.browser = undefined;
    assign(info, o);
    for (var k in info)
    {
        if (info[k]===undefined)
            delete info[k];
    }
    return info;
};

storage.on_err = (api, key, err)=>{
    zerr('%s failed %s %s', api, key, zerr.e2s(err));
    E.set('storage.last_error', {api: api, key: key, err: err});
    E.set('storage.err', (E.get('storage.err')||0)+1);
};

E.get_install_ms = ()=>{
    let ts = storage.get_int('install_ts');
    return ts ? Date.now()-ts : 0;
};

const get_bg_module = name=>{
    if (!is_bg)
        return null;
    let bg_main = E.rmt||window.be_bg_main;
    return name=='be_bg_main' ? bg_main : bg_main && bg_main[name];
};

E.build_info = opt=>{
    let ext = get_bg_module('be_ext');
    let mode = get_bg_module('be_mode');
    let tabs = get_bg_module('be_tabs');
    let be_rule = get_bg_module('be_rule');
    let info = {version: zconf.ZON_VERSION, local_ts: new Date(),
        src_country: storage.get('src_country'),
        manifest_version: zutil.get(B.runtime.manifest, 'version')};
    if (mode)
    {
        if_set(mode.get('svc.version'), info, 'svc_version');
        if_set(mode.get('pending'), info, 'svc_mode_pending');
    }
    if (ext)
    {
        if_set(ext.get('ext.active'), info, 'ext.active');
        if_set(ext.get('ext.conflict'), info, 'ext_conflict');
        if_set(ext.get('is_premium') && 1, info, 'is_premium');
        if_set(ext.get('hola_uid'), info, 'hola_uid');
        info.conf_tag = E.CG('conf_tag');
        var f;
        if (f = ext.get('features'))
            assign(info, f);
    }
    if (tabs)
    {
        info.active_url = tabs.get('active.url');
        info.active_tab = tabs.get('active.id');
        if (tabs.get('active.incognito'))
            info.active_incognito = true;
    }
    if (info.active_url)
    {
        if_set(svc_util.get_root_url(info.active_url), info, 'root_url');
        if (be_rule)
        {
            let rules = be_vpn_util.get_rules(be_rule.get('rules'),
                info.active_url);
            if (zutil.get(rules, '0.enabled'))
                info.proxy_country = rules[0].country;
        }
    }
    if_set(opt&&opt.is_tpopup, info, 'is_tpopup');
    if (chrome)
        info.product_type = conf.type;
    info.id = B.runtime.id;
    var browser = E.browser();
    var browser_ver = browser=='opera' ? E.browser_guess.opera_version :
        E.browser_guess.version;
    info.browser = browser+' '+browser_ver;
    info.browser_build = conf.browser.name;
    info.platform = navigator.platform;
    info.user_agent = navigator.userAgent;
    info.online = !!window.navigator.onLine;
    if_set(!window.navigator.onLine, info, 'offline');
    if (window.hola)
    {
        var now = Date.now();
        var install_ms;
        if (install_ms = E.get_install_ms())
        {
            info.install_ms = install_ms;
            info.install_time = select_duration(install_ms);
        }
        var update, diff;
        if ((update = storage.get_int('update_ts')) &&
            (diff = now-update)<=date.ms.MIN)
        {
            info.after_update = true;
            info.update_ms = diff;
        }
    }
    return info;
};

var durations = [
    {name: '0-1h', length: 1},
    {name: '1h-1d', length: 1*24},
    {name: '1d-2d', length: 2*24},
    {name: '2d-1w', length: 7*24},
    {name: '1w-2w', length: 14*24},
    {name: '2w-1m', length: 30*24},
    {name: '1m-3m', length: 90*24},
    {name: '3m-6m', length: 180*24},
    {name: '>=6m', length: Infinity},
];
function select_duration(len){
    len /= date.ms.HOUR;
    for (var i = 0; i<durations.length; ++i)
    {
        if (len<durations[i].length)
            return durations[i].name;
    }
}

E.build = opt=>{
    const info = E.build_info(opt);
    let s = '';
    for (let f in info)
        s += (s&&'\n')+f+': '+info[f];
    return s;
};

E.perr_id = (id, new_name)=>{
    if (new_name)
        return 'vpn.'+E.browser()+'.'+id;
    if (!id.match(/^be_/))
        id = 'be_'+id;
    return id;
};

function perr_send(id, info, opt){
    opt = zutil.clone(opt||{});
    var qs = opt.qs||{}, data = opt.data||{};
    data.is_json = 1;
    if (info && typeof info!='string')
        info = zerr.json(info);
    var err = opt.err;
    if (err)
    {
        if (!info)
            info = ''+(err.message||zerr.json(err));
        else if (!opt.bt)
            opt.bt = ''+(err.message||zerr.json(err));
        if (err.hola_info)
        {
            opt.bt = 'status '+err.hola_info.status+
                ' '+err.hola_info.method+' '+err.hola_info.url+
                ' text '+(''+err.hola_info.response_text).substr(0, 256)+'\n'+
                (opt.bt||'');
        }
    }
    data.info = info;
    qs.id = id;
    opt = {url: conf.url_perr+'/perr', qs, data, method: 'POST', json: 1};
    return ajax_cb ? ajax_cb(opt) : ajax(opt);
}

function perr_install(perr_orig, pending){
    while (pending.length)
        perr_send.apply(null, pending.shift());
    return function(id, info, opt){
        perr_orig.apply(null, arguments); 
        return perr_send(id, info, opt);
    };
}

function laptop_test(){
    _is_laptop = storage.get('is_laptop');
    if (!_is_laptop && !E.is_mobile() && navigator && navigator.getBattery)
    {
        navigator.getBattery().then(function(b){
            _is_laptop = !b.charging || b.chargingTime!=0;
            storage.set('is_laptop', _is_laptop);
        });
    }
}

E.init = ()=>{
    laptop_test();
    zerr.perr_install(perr_install);
    E.zopts.init();
};

E.get_product = ()=>conf.type;

E.zopts = {};
E.zopts.set = (key, val)=>{
    E.zopts.table[key] = val===undefined ? false : val;
    storage.set_json('hola_opts', E.zopts.table);
};

E.zopts.get = key=>E.zopts.table[key];

E.zopts.init = ()=>{
    if (be_vpn_util.is_tpopup())
        E.zopts.table = window.hola.tpopup_opt.zopts;
    else
        E.zopts.table = storage.get_json('hola_opts')||{};
};

E.get_connection_type = ()=>{
    const connection = navigator && (navigator.connection
        || navigator.mozConnection || navigator.webkitConnection);
    return connection&&connection.type;
};

E.get_device_type = ()=>
    E.is_mobile() ? 'mobile' : _is_laptop ? 'laptop' : 'desktop';

E.get_site_key = root_url=>{
    const sites = E.CG('sites', {});
    return Object.keys(sites).find(k=>{
        const v = sites[k];
        const urls = Array.isArray(v.root_url) ? v.root_url : [v.root_url];
        return urls.includes(root_url) && E.check_min_ver(v.min_ver);
    });
};

E.get_site_conf = (root_url, path, def)=>{
    let site_conf = zutil.get(E.CG('sites'), E.get_site_key(root_url));
    if (!site_conf)
        return;
    let {override} = site_conf;
    site_conf = _.omit(site_conf, 'override');
    if (override)
    {
        let curr_ver = E.version();
        let versions = Object.keys(override).sort((a, b)=>
            -version_util.cmp(a, b));
        let ver = versions.find(v=>version_util.cmp(curr_ver, v)>=0);
        if (ver)
        {
            if (E.browser()=='firefox')
            {
                site_conf = JSON.parse(JSON.stringify(site_conf));
                override = JSON.parse(JSON.stringify(override));
            }
            site_conf = zutil.extend_deep(site_conf, override[ver]);
        }
    }
    return path ? zutil.get(site_conf, path, def) : site_conf;
};

E.get_suggestion_conf = (site_conf, src_country)=>{
    if (!site_conf)
        return;
    src_country = (src_country||'').toUpperCase();
    var suggestion_popup = site_conf.suggestion_popup||{};
    return suggestion_popup[src_country]===undefined ? suggestion_popup['*'] :
        suggestion_popup[src_country];
};

E.get_site_verify_conf = (root_url, url, country)=>{
    let verify;
    if (!(verify = E.get_site_conf(root_url, 'verify')))
        return;
    let sv;
    if (!(sv = verify[country]===undefined ? verify['*'] : verify[country]))
        return;
    let check_url = v=>{
        if (!v.url)
            return;
        if (typeof v.url=='string')
        {
            v.url = new RegExp(v.url.replace(/\./g, '\\.').replace(/\*\*/, '*')
                .replace(/^\*/, '').replace(/\*/g, '.*'));
        }
        return v.url.test(url);
    };
    let site;
    if (!(site = sv.find(check_url)) && !sv.find(v=>!v.url))
        return;
    let key = E.get_site_key(root_url), idx = key.indexOf('_');
    return assign({id: key.slice(0, idx!=-1 ? idx : undefined)}, site);
};

E.get_site_storage = (root_url, path, def)=>{
    const key = E.get_site_key(root_url) || root_url;
    const data = storage.get_json('site_storage')||{};
    return zutil.get(data[key], path, def);
};

E.set_site_storage = (root_url, path, val)=>{
    const key = E.get_site_key(root_url) || root_url;
    const data = storage.get_json('site_storage')||{};
    data[key] = data[key]||{};
    zutil.set(data[key], path, val);
    storage.set_json('site_storage', data);
};

E.get_dont_show_def_period = ()=>E.CG('popup.dont_show_def_period', '7d');

E.is_force_protect_mode = (country, per_country)=>{
    var c = E.CG('force_protect_mode', {});
    if (!E.check_min_ver(c.min_ver))
        return;
    var ms, countries = c.countries||['us', 'ca'];
    return country && countries.includes(country.toLowerCase()) || !per_country
        && (ms = E.get_install_ms()) && ms<=(c.period||date.ms.DAY);
};

E.reload_ext = (cb, period)=>{
    var info;
    period = period||date.ms.MIN;
    if (!(info = storage.get_json('reload_ext')))
        info = {ts: Date.now(), count: 0};
    var diff = Date.now()-info.ts;
    if (diff>period || diff<0)
    {
        info.ts = Date.now();
        info.count = 1;
    }
    else if (info.count<2)
        info.count++;
    else
        return zerr('too many reload_ext '+info.count);
    storage.set_json('reload_ext', info);
    cb();
    return true;
};

E.reload_ext_native = function(args){
    E.perr({id: 'be_runtime_reload_ext'});
    storage.set('reload_ext_ts', Date.now());
    if (chrome.runtime.reload)
        return chrome.runtime.reload();
    var bg = chrome.extension.getBackgroundPage();
    bg.location.reload();
    if (window!=bg)
        window.close();
};

E.set_ajax_cb = cb=>{ ajax_cb = cb; };
E.set_bext_config_cb = cb=>{ bext_config_cb = cb; };

E.is_stub_rule_enabled = (stub_rule, url, is_premium)=>stub_rule &&
    stub_rule.enabled && (be_vpn_util.is_skip_url(url) ||
    E.is_google(svc_util.get_root_url(url)));

E.format_log = log=>{
    const skips = [/backbone\.\w+\./, /ajax.*(perr| url )/,
        /perr.*rate too high/, /connection.*tpopup(_int)?:[0-9]+/,
        /be_tab_unblocker.*chrome-extension/, /stop .*cws/,
        /: (tab:[\d-]+ )?[a-z.]*popup /, /fetch_rules/, /be_req_bw/,
        /update url .* is_vpn false/, /checking if site has high unblocking/,
        /impl\.init/, /be_(bw_)?req_err/, /not_working_trigger/,
        /be\.ccgi\.send/, /be_vpn_total_active_time/, /be_media_failure/,];
    const formats = [{from: /(perr [\w.]+) .*$/, to: '$1'}];
    const format = line=>{
        let ret = line;
        formats.forEach(f=>{ ret = ret.replace(f.from, f.to); });
        return ret;
    };
    const map = line=>{
        if (!/]$/.test(line))
            return format(line);
        let cnt = 0, str;
        let args_len = line.split('').reverse().findIndex(c=>{
            if (c=='"')
                return void (str = !str);
            return !str && (cnt += c==']' ? 1 : c=='[' ? -1 : 0)==0;
        });
        if (args_len==-1)
            return format(line);
        args_len++;
        const fmt = line.slice(0, -args_len);
        try {
            const args = JSON.parse(line.slice(-args_len));
            line = sprintf.apply(null, [fmt].concat(args));
        } catch(e){ line += ' (truncated)'; }
        return format(line);
    };
    return (log||[]).map(map).filter(line=>!skips.find(s=>s.test(line)));
};

function throttle_log(log, agg){
    const throttle = [{test: /tab_unblocker slow/, per: date.ms.MIN},
        {test: /media failure detected/, per: date.ms.SEC},
        {test: /popup not allowed/}, {test: /tab already attached/},
        {test: /perr be_wrong_agent/}];
    return log.map(l=>{
        let t = throttle.find(_t=>_t.test.test(l));
        if (!t)
            return l;
        let m, prefix = (m = l.match(/^\[[\w[\]]+\] /)) && m[0] || '';
        let _l = l.replace(prefix, '');
        let date_str = _l.substr(0, 23), d = new Date(date_str);
        if (!t.last)
        {
            t.last = d;
            t.count = 0;
            return l;
        }
        let count = ++t.count;
        if (!t.per || agg && d-t.last<t.per)
            return;
        t.last = d;
        t.count = 0;
        return agg && count>1 ? prefix+date_str+' x'+count+_l.substr(23) : l;
    }).filter(l=>l);
}

E.get_zerr_log = ()=>zerr.log ? E.format_log(zerr.log)
    .slice(-zerr.log.max_size) : [];

E.get_log = (ui_log = [])=>{
    let idx = 0;
    const be_ext = get_bg_module('be_ext');
    const is_premium = be_ext && be_ext.get('is_premium');
    const map = f=>l=>({from: f, line: l, idx: idx++});
    const log = E.get_zerr_log().map(map(is_bg ? 'bg' : 'ui'))
        .concat(ui_log.map(map('ui'))).sort((a, b)=>a.from==b.from ?
        a.idx-b.idx : a.line.localeCompare(b.line))
        .map(c=>'['+(is_premium ? 'P' : 'F')+']['+c.from+'] '+c.line);
    return throttle_log(log, true);
};

E.perr = (level, opt, new_name)=>{
    if (typeof level=='object')
    {
        new_name = opt;
        opt = level;
        level = zerr.L.NOTICE;
    }
    new_name = !!new_name;
    const ver = E.version();
    const bg_main = get_bg_module('be_bg_main');
    let id = opt.id, info = opt.info, bt = opt.bt, filehead = opt.filehead;
    let qs = {ext_ver: ver, product: E.get_product()};
    if (opt.with_log)
        filehead = (filehead||'')+'\n'+E.get_log(opt.ui_log);
    opt.data = {bt, info, filehead, ver, build: E.build({is_tpopup:
        opt.is_tpopup})};
    if (bg_main)
    {
        qs.uuid = bg_main.get('uuid');
        qs.browser = E.browser();
    }
    else
        zerr('cannot get information for perr %s %s', id, info);
    if (conf.check_agree_ts && !(bg_main && bg_main.get('agree_ts')))
        return zerr('no agree_ts, skip perr %s %s', id, info);
    if (!qs.uuid)
        qs.uuid = storage.get('uuid');
    if (!qs.browser)
        qs.browser = E.browser();
    qs.id = E.perr_id(id, new_name);
    opt.qs = qs;
    opt.level = level;
    return zerr.perr(qs.id, info, opt);
};

E.get_bext_config = ()=>
    bext_config_cb ? bext_config_cb() : storage.get_json('bext_config_last');

E.CG = (path, def)=>zutil.get(E.get_bext_config(), path, def);

E.check_min_ver = min_ver=>
    version_util.valid(min_ver) && version_util.cmp(E.version(), min_ver)>=0;

E.proxy_error_ui_enabled = type=>{
    const c = E.CG('proxy_error_ui', {});
    return !!(E.check_min_ver(c.min_ver) && c[type]);
};

E.init();
return E;
});
