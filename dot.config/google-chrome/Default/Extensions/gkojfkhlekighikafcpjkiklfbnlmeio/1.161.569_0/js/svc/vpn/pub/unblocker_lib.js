// LICENSE_CODE ZON
'use strict'; 
(function(){
var define;
var is_node = typeof module=='object' && module.exports && module.children;
if (!is_node)
    define = self.define;
else
    define = require('../../../util/require_node.js').define(module, '../');
define(['/util/date.js', '/util/browser.js', '/util/escape.js', '/util/url.js',
    '/util/util.js', '/util/zerr.js', '/util/etask.js', '/svc/vpn/pub/util.js',
    '/util/ws.js', '/util/version_util.js', '/util/events.js', '/util/array.js'],
    function(date, zbrowser, zescape, zurl, zutil, zerr, etask,
    svc_vpn_util, zws, version_util, events, array){
const E = new events.EventEmitter();
const assign = Object.assign, ms = date.ms;
const CACHE_TTL = ms.MIN, POLICY_TTL = 5*ms.MIN, SEC = ms.SEC;
const gen_ping_id = id=>id || (zutil.is_mocha() ? '1111' : Math.random());
const ctx = [];

const extensions = {
    archive: zutil.bool_lookup(
        '7z apk arj bin bz deb dmg exe gz iso msi rar rpm tbz tgz xz zip'),
    media: zutil.bool_lookup(
        '3gp avi f4v flv h264 m4a m4s m4v mkv mov mp3 mp4 ogg ogv swf ts wav '
        +'webm wmv'),
    static: zutil.bool_lookup(
        'css eot gif ico jar jpeg jpg png svg svgz ttf webp woff'),
};

const expected_types = {
    archive: /^application\/(?!json$)/,
    media: /^((audio|video)\/|application\/octet-stream$)/,
};

const CG = (s, def)=>api.conf_get && api.conf_get(s, def);

var strategies = {};
var cache = {};
var peer_domain_re;
var user_plus = false;
var _app_trial_mode = false;
var active_reqs = [];
var conf_rand_id;
var hola_uid;
let proxy_rules_engine;

function ext_ver(){ return (api.get_prod_info()||{}).ext_ver; }
function product_ver(){
    let info = api.get_prod_info()||{};
    return info.ext_ver||info.apk_ver||info.svc_ver;
}

function get_strategy(strategy, ex, opt){
    opt = opt||{};
    if (!ex)
        return strategy;
    if (opt.country)
    {
        ex = ex.replace(new RegExp('\\b'+zescape.regex(opt.country)+'\\b'),
            'XX');
    }
    var m;
    if (m = ex.match(/PROXY XX\.POOL_(\w+)/))
    {
        m = m[1];
        ex = 'PROXY XX.POOL';
    }
    switch (ex)
    {
    case 'DIRECT': strategy = {name: 'direct'}; break;
    case 'PROXY XX': strategy.name = 'proxy'; break;
    case 'PROXY XX.direct_first': strategy.name = 'direct_first'; break;
    case 'PROXY XX.PEER':
        strategy.name = 'proxy';
        strategy.peer = true;
        break;
    case 'PROXY XX.POOL':
        strategy.name = 'proxy';
        strategy.pool = m||true;
        break;
    }
    return strategy;
}



E.get_rule_strategy = (s, url, opt)=>{
    if (!url && (opt.root_url || opt.src_country))
        url = {orig: '', hostname: ''};
    else if (!url || !url.hostname)
        return s;
    let ex = null;
    if (proxy_rules_engine)
    {
        ex = proxy_rules_engine.find_proxy_for_url_exception(url.orig,
            url.hostname, opt);
    }
    return get_strategy(s, ex, opt);
};

E.handle_request = function(url, opt){
    opt = opt||{};
    if (opt.premium===undefined)
        opt.premium = user_plus||_app_trial_mode;
    if (typeof url=='string')
        url = zurl.parse(url, true);
    var top_url = typeof opt.top_url=='string' ?
        zurl.parse(opt.top_url, true) : opt.top_url;
    var strategy, cache_entry = E.cache_access(url.hostname);
    var policy_key = 'policy:'+opt.country;
    var policy = cache_entry.get(policy_key);
    if (policy=='blocked')
        strategy = {name: 'direct'};
    else if (opt.force=='peer' && opt.strict)
        strategy = {name: 'proxy', peer: true};
    else if (opt.premium)
        strategy = E.get_rule_strategy({name: 'proxy', peer: false}, url, opt);
    else if (opt.force=='peer')
        strategy = {name: 'proxy'};
    else if (opt.force)
        strategy = {name: opt.force, peer: false};
    else
    {
        strategy = opt.full_vpn ? {name: 'proxy'} : (opt.force_media_direct ?
            choose_strategy_media : choose_strategy)(url, opt);
        if (strategy && strategy.name!='direct')
            strategy = E.get_rule_strategy(strategy, url, opt);
    }
    if (strategy.cache)
    {
        var cached = cache_entry.get(strategy.cache);
        if (cached)
            strategy = {name: cached, peer: strategy.peer};
    }
    var peer = strategy.peer===true || strategy.peer===undefined &&
        peer_domain_re && (peer_domain_re.test(url.hostname) ||
        top_url && peer_domain_re.test(top_url.hostname));
    var res = strategies[strategy.name].bind(null, {
        cache: cache_entry,
        cache_key: strategy.cache,
        policy: policy,
        policy_key: policy_key,
        peer: peer,
        expect_type: strategy.expect_type,
        strict: opt.strict,
        pool: strategy.pool,
    });
    res.desc = strategy.name;
    if (strategy.cache)
        res.desc += ' cache '+strategy.cache;
    if (peer && strategy.name!='direct')
        res.desc += ' peer';
    if (strategy.name=='proxy' && strategy.pool)
    {
        res.desc += ' pool'+(typeof strategy.pool=='string' ?
            '_'+strategy.pool : '');
    }
    return res;
};

function choose_strategy_media(url, opt){
    var is_mpeg, ext = url.ext && url.ext.toLowerCase();
    if (extensions.media[ext] || /=\d+-\d+\.dash/.test(url.file) ||
        /Seg\d+-?Frag\d+/.test(url.pathname) ||
        /\/QualityLevels\(\d+\)\/Fragments\(.+=\d+(,format=.+)?\)/
        .test(url.pathname) ||
        (is_mpeg = !user_plus && !_app_trial_mode && ext=='m3u8'))
    {
        return {name: 'direct_first', cache: 'media', peer: false,
            expect_type: is_mpeg ? /mpegurl/i : expected_types.media};
    }
    return zutil.is_mocha() && opt.type!='main_frame' &&
        url.protocol!='https:' ? {name: 'parallel'} : {name: 'proxy'};
}

function choose_strategy(url, opt){
    var ext = url.ext && url.ext.toLowerCase();
    if (opt.method && opt.method!='GET')
        return {name: 'proxy'};
    if (opt.type=='stylesheet' || opt.type=='image')
        return {name: 'parallel', cache: 'static', peer: false};
    if (url.query && zurl.qs_parse(url.query, 0, 1).callback) 
        return {name: 'parallel'};
    if (extensions.archive[ext])
    {
        return {name: 'direct_first', cache: 'archive', peer: false,
            expect_type: expected_types.archive};
    }
    if (extensions.media[ext] || /=\d+-\d+\.dash/.test(url.file) ||
        /Seg\d+-?Frag\d+/.test(url.pathname) ||
        /\/QualityLevels\(\d+\)\/Fragments\(.+=\d+(,format=.+)?\)/
        .test(url.pathname))
    {
        return {name: 'direct_first', cache: 'media', peer: false,
            expect_type: expected_types.media};
    }
    if (extensions.static[ext])
        return {name: 'parallel', cache: 'static', peer: false};
    if (!user_plus && !_app_trial_mode && ext=='m3u8')
    {
        return {name: 'direct_first', cache: 'media', peer: false,
            expect_type: /mpegurl/i};
    }
    if (opt.type=='main_frame')
        return {name: 'proxy'};
    if (url.protocol=='https:')
        return {name: 'proxy'};
    return {name: 'parallel'};
}

var last_user_type_set;
E.set_user_plus = flag=>{
    if (user_plus==flag || Date.now()-last_user_type_set < 2*ms.SEC)
        return;
    user_plus = flag;
    last_user_type_set = Date.now();
    return Object.keys(agents).reduce((arr, e)=>
        arr.concat(Object.keys(agents[e]).map(a=>agents[e][a].reinit())), []);
};
E.set_app_trial_mode = mode=>{ _app_trial_mode = mode; };

E.resp_match = (a, b)=>{
    if (a.code!=b.code)
        return {match: false, basis: 'response code'};
    if (a.type!=b.type)
        return {match: false, basis: 'content type'};
    if (a.etag || b.etag)
        return {match: a.etag==b.etag, basis: 'etag'};
    if (a.len || b.len)
        return {match: a.len==b.len, basis: 'content-length'};
};

E.unblocker_json_set = function(json, opt){
    proxy_rules_engine = new Proxy_rules_engine(json.unblocker_rules,
        {free: json.unblocker_globals, plus: json.unblocker_plus},
        opt||{ext: true});
    if (json.exceptions)
        E.set_peer_sites(json.exceptions.peer);
};

E.set_peer_sites = list=>{
    if (!list)
        return;
    peer_domain_re = new RegExp(
        '(^|\\.)('+list.map(zescape.regex).join('|')+')$', 'i');
};

E.gen_rule = opt=>{
    var rule = {
        name: opt.name,
        country: opt.country.toLowerCase(),
        peer: peer_domain_re && peer_domain_re.test(opt.name) || opt.peer,
        force_peer: opt.force_peer,
        link: opt.name,
        description: opt.country.toUpperCase()+' VPN',
        type: opt.type||'url',
        enabled: opt.enabled!==undefined ? !!opt.enabled : true,
        supported: true,
        root_url_orig: ['**.'+opt.name],
        root_url: [zurl.http_glob_url('**.'+opt.name, 1)],
        ts: opt.ts||Date.now(),
        mode: opt.mode||'unblock',
        full_vpn: !!opt.full_vpn,
    };
    zutil.if_set(opt.src, rule, 'src');
    zutil.if_set(opt.src_country, rule, 'src_country');
    zutil.if_set(opt.ratings, rule, 'ratings');
    rule.id = rule.name+'_'+rule.country+'_vpn';
    return rule;
};

function cache_entry(){ this.timers = {}; }

cache_entry.prototype.get = function(key){ return this[key]; };

cache_entry.prototype.put = function(key, value, ttl){
    var _this = this;
    _this[key] = value;
    if (_this.timers[key])
        clearTimeout(_this.timers[key]);
    _this.timers[key] = ttl && setTimeout(function(){
        delete _this[key];
        delete _this.timers[key];
    }, ttl);
    return _this;
};

cache_entry.prototype.put_weak = function(key, value, ttl){
    if (!this[key])
        this.put(key, value, ttl);
    return this;
};

cache_entry.prototype.del = function(key){
    delete this[key];
    delete this.timers[key];
    return this;
};

E.cache_access = function(domain){
    var entry = cache[domain];
    if (!entry)
        entry = cache[domain] = new cache_entry();
    return entry;
};

E.cache_purge = function(){ cache = {}; };

strategies.direct = function(opt, direct, proxy){
    var res = {direct: {}};
    if (!direct)
    {
        res.direct.start = true;
        return res;
    }
    if (direct.code || direct.error)
        res.direct.serve = true;
    return res;
};

strategies.proxy = (opt, direct, proxy)=>{
    if (opt.policy=='blocked' && !opt.strict)
        return strategies.direct(opt, direct, proxy);
    var res = {direct: {}, proxy: {}};
    if (!proxy)
    {
        res.proxy.start = true;
        res.proxy.peer = opt.peer;
        res.proxy.pool = opt.pool;
        res.proxy.allowed = opt.policy=='allowed';
        return res;
    }
    if (opt.strict)
    {
        res.proxy.abort = true;
        return res;
    }
    if (handle_policy(proxy.policy, opt)=='blocked')
    {
        res.direct.start = true;
        return res;
    }
    if (proxy.code || proxy.error)
        res.proxy.serve = true;
    zutil.if_set(opt.peer, res.proxy, 'peer');
    zutil.if_set(opt.pool, res.proxy, 'pool');
    return res;
};

strategies.parallel = (opt, direct, proxy)=>{
    if (opt.policy=='blocked')
        return strategies.direct(opt, direct, proxy);
    var res = {direct: {}, proxy: {}};
    function serve_proxy(){
        if (proxy.hdrs_only)
        {
            res.proxy.start = true;
            res.proxy.peer = opt.peer;
            res.proxy.pool = opt.pool;
            res.proxy.allowed = opt.policy=='allowed';
        }
        else
            res.proxy.serve = true;
        return !proxy.hdrs_only;
    }
    if (!direct)
    {
        res.direct.start = true;
        res.direct.timeout = true;
    }
    if (!proxy)
    {
        res.proxy.start = true;
        res.proxy.peer = opt.peer;
        res.proxy.pool = opt.pool;
        res.proxy.allowed = opt.policy=='allowed';
        res.proxy.hdrs_only = true;
    }
    if (!direct || !proxy)
        return res;
    if (handle_policy(proxy.policy, opt)=='blocked')
        return strategies.direct(opt, direct, proxy);
    if (proxy.error)
    {
        if (direct.code || direct.error)
            res.direct.serve = true;
        if (direct.error)
            res.proxy.serve = true; 
        return res;
    }
    if (!proxy.code)
        return res;
    if (!direct.code)
    {
        if (!serve_proxy())
            return res;
        if (opt.cache_key && direct.slow && is_ok(proxy, opt.expect_type))
        {
            res.log = 'cache put weak proxy';
            opt.cache.put_weak(opt.cache_key, 'proxy', CACHE_TTL);
        }
        else if (!opt.cache_key)
            res.direct.abort = true;
        return res;
    }
    var m = E.resp_match(direct, proxy);
    if (!m)
    {
        serve_proxy();
        return res;
    }
    res.log = m.basis + (m.match ? ' match' : ' mismatch');
    if (m.match)
    {
        res.direct.serve = true;
        if (!proxy.hdrs_only)
            res.proxy.serve = true; 
        if (opt.cache_key)
        {
            res.log += '; cache put direct';
            opt.cache.put(opt.cache_key, 'direct', CACHE_TTL);
        }
    }
    else
    {
        if (!serve_proxy())
            return res;
        if (opt.cache_key)
        {
            res.log += '; cache put proxy';
            opt.cache.put(opt.cache_key, 'proxy', CACHE_TTL);
        }
    }
    return res;
};

strategies.direct_first = function(opt, direct, proxy){
    if (opt.policy=='blocked')
        return strategies.direct(opt, direct, proxy);
    var res = {direct: {}, proxy: {}};
    if (!direct)
    {
        res.direct.start = true;
        res.direct.timeout = true;
        return res;
    }
    if (is_ok(direct, opt.expect_type))
    {
        res.direct.serve = true;
        if (opt.cache_key)
        {
            res.log = 'cache del';
            opt.cache.del(opt.cache_key);
        }
        return res;
    }
    if (!proxy)
    {
        if (direct.slow || direct.code || direct.error)
        {
            res.proxy.start = true;
            res.proxy.peer = opt.peer;
            res.proxy.pool = opt.pool;
            res.proxy.allowed = opt.policy=='allowed';
        }
        return res;
    }
    if (handle_policy(proxy.policy, opt)=='blocked')
        return strategies.direct(opt, direct, proxy);
    if (proxy.code)
    {
        if (opt.cache_key && (is_ok(proxy, opt.expect_type) || !direct.code))
        {
            res.log = 'cache put proxy';
            opt.cache.put(opt.cache_key, 'proxy', CACHE_TTL);
        }
        else if (proxy.code==302 && direct.code==302)
        {
            if (proxy.location==direct.location)
                res.direct.serve = true;
            else
            {
                var p = zurl.parse(proxy.location, true);
                var d = zurl.parse(direct.location, true);
                if (p.path==d.path)
                    res.direct.serve = true;
            }
        }
        if (!res.direct.serve)
            res.proxy.serve = true;
        return res;
    }
    if (proxy.error && !direct.slow)
    {
        res.direct.serve = true;
        if (direct.error)
            res.proxy.serve = true; 
        return res;
    }
};

function is_ok(resp, expect_type){
    var res = resp.code>=200 && resp.code<300 || resp.code==304;
    if (res && expect_type)
        res = expect_type.test(resp.type);
    return res;
}

function handle_policy(policy, opt){
    var m = /^(allowed|blocked)( domain)?$/.exec(policy);
    if (!m)
        return 'allowed';
    opt.policy = m[1];
    if (opt.policy_key && m[2])
        opt.cache.put(opt.policy_key, opt.policy, POLICY_TTL);
    return opt.policy;
}


var _ws_clients = {
    ccgi: function(opt){
        return zutil.extend_deep({
            ipc_client: {zgettunnels: {type: 'call', timeout: 7*ms.SEC}},
            retry_max: 5*ms.MIN,
            idle_timeout: ms.HOUR,
            handshake_timeout: 3*ms.SEC,
        }, opt.conf);
    },
    agent: function(opt){
        return zutil.extend_deep({
            ipc_client: {verify_proxy: {type: 'call', timeout: 7*ms.SEC}},
            no_retry: true,
            idle_timeout: ms.MIN,
            handshake_timeout: 3*ms.SEC,
        }, opt.conf);
    },
};

var _ws_conns = {}, _ws_conn_ccgi;
E._ws_conn = function(type, url, conf){
    if (_ws_conns[url])
        return _ws_conns[url];
    var client = _ws_clients[type];
    if (!client)
        throw new Error('no ws client for type: '+type);
    var conn = new zws.Client(url, client(conf||{}));
    if (type=='ccgi')
        _ws_conn_ccgi = conn;
    conn.on('disconnected', function(){ E._close_ws_conn(type, url); });
    return _ws_conns[url] = conn;
};

E._close_ws_conn = function(type, url_or_conn){
    var url, conn;
    if (typeof url_or_conn=='string')
    {
        url = url_or_conn;
        conn = _ws_conns[url];
    }
    else
    {
        conn = url_or_conn;
        url = conn.url;
    }
    if (!conn)
        return;
    conn.close();
    delete _ws_conns[url];
    if (type=='ccgi')
        _ws_conn_ccgi = undefined;
};

E._ws_call = function(conn, type, cmd, msg, conf){
    conf = conf||{};
    zerr.info('WS call %s %O', cmd, msg);
    return etask([function try_catch$(e){
        if (!conn)
            throw new Error('no ws conn for type: '+type+', cmd: '+cmd);
        if (!conn.ipc || !conn.ipc[cmd])
            throw new Error('no ws ipc for type: '+type+', cmd: '+cmd);
        return conn.ipc[cmd](msg);
    }, function(res){
        if (this.error)
        {
            if ((''+this.error).includes(cmd+' timeout'))
                E._perr_ws('be_ws_cmd_timeout', conn, type, cmd, this.error);
            return void E._perr_ws('be_ws_fallback_https_success', conn, type,
                cmd, this.error);
        }
        if (conf.log_ws_call)
            E._perr_ws('be_ws_call', conn, type, cmd, null, {res: res});
        return res;
    }]);
};

E.is_conf_allowed = on=>{
    if (!on)
        return;
    if (!conf_rand_id)
        api.storage.set('conf_rand_id', conf_rand_id = Math.random());
    return conf_rand_id<on;
};

E._ws_conf = function(key){
    var conf = CG('ws2', {});
    var ver = ext_ver();
    var match_min_ver = ver && conf.min_version
        && version_util.cmp(ver, conf.min_version)>=0;
    conf = conf[key]||{};
    conf.enabled = match_min_ver && E.is_conf_allowed(conf.enabled_on);
    return conf;
};

E._perr_ws = function(id, conn, type, cmd, err, info){
    info = assign({url: conn && conn.url, type: type, cmd: cmd}, info);
    if (err)
        info.err = zerr.e2s(err);
    api.perr({info: info, id: id+(type ? '_'+type : '')});
};

var ws_routes = {ccgi: {}, agent: {}};
function get_ws_route(type, conf){
    if (type!='ccgi')
        return {name: 'direct'};
    var direct = {name: 'direct', url: api.url_ws_ccgi};
    if (!E.is_conf_allowed(conf.fallback_on))
        return direct;
    var route = ws_routes[type];
    if (route.last_ts-Date.now()>ms.HOUR)
        delete route.selected;
    return route.selected || route.tested || (route.tested = direct);
}
function set_ws_route(conn, type, cmd, conf, used_route, success){
    var route = ws_routes[type];
    if (type!='ccgi' || !E.is_conf_allowed(conf.fallback_on) || route.selected)
        return;
    var used_name = used_route.name;
    if (!route[used_name+'_perr'])
    {
        E._perr_ws('be_ws_connectivity_check', conn, type, cmd, null,
            {route: used_name, success: success});
        route[used_name+'_perr'] = true;
    }
    delete route.tested;
    var set_selected = r=>{
        route.last_ts = Date.now();
        route.selected = r;
    };
    if (success)
        return void set_selected(used_route);
    if (used_name=='direct')
    {
        route.tested = {url: api.url_ws_ccgi_svd, name: 'svd'};
        return true;
    }
    set_selected({https: true});
}

E.ws_call = function(opt){
    var type;
    if (!(type = opt.type))
        return void api.perr({id: 'be_ws_call_no_type', info: {url: opt.url}});
    var conf = E._ws_conf(type), conn;
    if (!conf.enabled)
    {
        if (type=='ccgi' && _ws_conn_ccgi)
            E._close_ws_conn('ccgi', _ws_conn_ccgi);
        return;
    }
    var route = get_ws_route(type, conf);
    if (route.https)
        return;
    var url = route.url||opt.url;
    return etask([function(){
        try { conn = E._ws_conn(type, url, conf); }
        catch(e){
            E._perr_ws('be_ws_conn_err', conn, type, opt.cmd, e);
            return void E._perr_ws('be_ws_fallback_https_success', conn, type,
                opt.cmd, e);
        }
        return E._ws_call(conn, type, opt.cmd, opt.msg, conf);
    }, function(res){
        var fallback = set_ws_route(conn, type, opt.cmd, conf, route, !!res);
        if (!fallback)
            return res;
        return E.ws_call(opt);
    }]);
};

var api = {}, agents = {def: {}, trial: {}}, mem_storage = {};
var def_api = {
    perr: opt=>{ zerr('agent.perr not set, discarding '+opt.id); },
    ajax: opt=>{ zerr('agent.ajax not set, discarding '+opt.url); },
    storage: {get: id=>mem_storage[id],
        set: (id, val)=>mem_storage[id] = val},
    get_auth: ()=>void zerr('agent.get_auth not set'),
    get_prod_info: ()=>({}),
    get_user_info: ()=>({}),
    url_ccgi: 'https://client.hola.org/client_cgi',
    url_ws_ccgi: 'wss://client.hola.org/vpn_cgi/ws',
    url_ws_ccgi_svd: 'wss://client.svd-cdn.com/vpn_cgi/ws',
    get_url_ws_agent: agent=>'wss://'+agent.host+':3387',
    trigger: (ev, val)=>{},
    conf_get: (s, def)=>def,
    force_agent: ()=>{},
    get_rule_routes: rule=>{
        var routes = [], s = zutil.pick(rule, 'country');
        routes.push(s);
        if (rule.peer)
            routes.push(assign({peer: true}, s));
        if (rule.pool)
            routes.push(assign({pool: rule.pool}, s));
        return routes;
    },
};

var lib_sp;
E.init = set=>{
    E.sp = etask(function*unblocker_lib(){ yield this.wait(); });
    return etask('init', function*init(){
        assign(api, def_api, set);
        lib_sp = etask('lib_sp', function*(){
            conf_rand_id = yield api.storage.get('conf_rand_id');
            hola_uid = yield api.storage.get('hola_uid');
            yield this.wait();
        });
        E.sp.spawn(lib_sp);
        yield init_rules();
        E.on('conf_change', on_config_change);
        E.on('not_working', on_not_working);
    });
};

E.reset = ()=>{
    active_reqs.forEach(e=>e.return());
    active_reqs = [];
    for (var e in agents)
        Object.keys(agents[e]).forEach(a=>agents[e][a].uninit());
    agents = {def: {}, trial: {}};
    ws_routes = {ccgi: {}, agent: {}};
    Object.keys(_ws_conns).forEach(c=>_ws_conns[c] && _ws_conns[c].close());
    _ws_conns = {};
};

E.trigger = E.emit;

E.uninit = ()=>{
    lib_sp.return();
    E.reset();
    E.removeAllListeners();
    api = {};
    rules = null;
};

function Agent(o, parent){
    if (!(this instanceof Agent))
        return new Agent(o, parent);
    this.host = o.host;
    this.ip = o.ip;
    this.port = o.port;
    this.vendor = o.vendor;
    if (o.pool)
        this.pool = o.pool;
    if (o.port_list)
        this.port_list = o.port_list;
    this.parents = [];
    this.last_traffic = 0;
    this.last_verified = 0;
    this.err_timer = 500;
    this.auth_err_timer = 500;
    this.waiting = [];
    this.add_parent(parent);
    this.verify();
    this.proxy_auth();
}

Agent.prototype.is_verified = function(){
    if (this.last_verified && get_verify_conf('disable_verify'))
        return true;
    const ts = Math.max(this.last_traffic, this.last_verified);
    return Date.now() - ts < get_verify_conf('period_ms', 10*ms.MIN)+5*ms.MIN;
};

Agent.prototype.is_verify_err = function(){
    return this.error && (this.error.err||'').startsWith('verify_'); };

Agent.prototype.parent_to_ctx = function(parent){
    return this.parents.find(p=>p.up==parent); };

Agent.prototype.is_usable = function(parent){
    return !this.is_not_usable(parent); };

Agent.prototype.err_ts = function(parent){
    parent = parent && this.parent_to_ctx(parent);
    return this.error && this.error.ts || parent && parent.error
        && parent.error.ts;
};

Agent.prototype.is_not_usable = function(parent){
    parent = parent && this.parent_to_ctx(parent);
    return this.error&&'error' || this.busy&&'busy'
        || this.bw_busy&&'bw_busy' || !this.is_verified()&&(!this.verify_sp
        || !this.verify_sp.verify_running)&&'unverified'
        || !this.proxy_authed&&(!this.proxy_auth_sp
        || !this.proxy_auth_sp.auth_running)&&'not_authed'
        || parent && parent.error && 'parent error';
};

Agent.prototype.to_string = function(parent){
    return this.host+':'+this.port+'\t'+(this.pool||'reg')+'\t'
        +(this.is_not_usable(parent)||'usable');
};

Agent.prototype.reverify = function(){
    this.last_verified = this.last_traffic = 0;
    if (this.verify_sp)
        this.verify_sp.return();
    this.verify();
};

Agent.prototype.reauth = function(){
    this.last_proxy_authed = 0;
    if (this.proxy_auth_sp)
        this.proxy_auth_sp.return();
    this.proxy_auth();
};

Agent.prototype.add_parent = function(parent){
    this.parents.push({up: parent}); };

Agent.prototype.unset_error = function(){
    var _this = this;
    this.error = undefined;
    this.parents.forEach(function(p){
        if (!p.error)
            p.up.unset_exclude(_this);
    });
};

Agent.prototype.set_error = function(err, desc, rule){
    var _this = this;
    if (rule)
        rule = zutil.pick(rule, 'name', 'country');
    else
        this.error = {err, desc, ts: Date.now()};
    this.parents.forEach(function(p){
        if (rule && !svc_vpn_util.find_rule(p.up.rules, rule))
            return;
        if (rule)
            p.error = {err, desc, ts: Date.now()};
        p.up.set_exclude(_this);
    });
};

Agent.prototype.info = function(){
    var ret = {host: this.host, ip: this.ip, port: this.port,
        vendor: this.vendor};
    zutil.if_set(this.version, ret, 'version');
    zutil.if_set(this.bw_available, ret, 'bw_available');
    zutil.if_set(this.rtt, ret, 'rtt');
    zutil.if_set(this.country, ret, 'country');
    zutil.if_set(this.pool, ret, 'pool');
    zutil.if_set(this.error, ret, 'error');
    zutil.if_set(this.port_list, ret, 'port_list');
    return ret;
};

Agent.prototype.wait_verified = function(){
    var _this = this;
    return etask({name: 'wait_verified', cancel: true}, [function(){
        _this.waiting.push(this);
        return this.wait();
    }, function finally$(){
        _this.waiting.splice(_this.waiting.indexOf(this), 1);
    }]);
};

Agent.prototype.next_verify = function(){ return this._next_verify; };
Agent.prototype.next_auth = function(){ return this._next_auth; };

Agent.prototype.is_dormant = function(){
    return this.parents.every(function(p){ return p.up.is_dormant(); }); };

Agent.prototype.verify = function(){
    var t0 = Date.now(), _this = this, rule = this.parents[0].up.rules[0];
    var ping_id = this.ip+'_'+(zutil.is_mocha() ? '1111' : Math.random());
    var data = {proxy_country: this.parents[0].up.country, ping_id: ping_id,
        root_url: rule.link || rule.name};
    var root_urls = [];
    this.parents.forEach(function(p){
        root_urls = root_urls.concat(p.up.rules.map(function(r){
            return r.link||r.name; }).filter(function(r){ return r; }));
    });
    if (root_urls.length)
        data.root_urls = root_urls.join(',');
    var url = api.get_verify_url ? api.get_verify_url(this.info()) :
            'https://'+(this.host||this.ip)+':'+this.port+'/verify_proxy';
    E.sp.spawn(etask({name: 'verify_'+(this.host||this.ip),
        cancel: true}, [function start(){
        if (this.verify_running)
        {
            svc_vpn_util.push_event('<verify',
                {host: _this.host, ip: _this.ip, rtt: _this.rtt});
        }
        this.verify_running = false;
        _this.verify_sp = this;
        if (_this.error)
        {
            _this._next_verify = Date.now()+_this.err_timer;
            return etask.sleep(_this.err_timer);
        }
        if (_this.last_verified && get_verify_conf('disable_verify'))
            return this.return();
        var is_dormant, ts = Math.max(_this.last_traffic, _this.last_verified);
        var now = Date.now(), period = get_verify_conf('period_ms', 10*ms.MIN);
        if (now - ts < period || (is_dormant = ts && _this.is_dormant()))
        {
            this.set_state('start');
            let timer = period - (is_dormant ? 0 : now-ts);
            _this._next_verify = now+timer;
            return etask.sleep(timer);
        }
    }, function(){
        this.verify_running = true;
        svc_vpn_util.push_event('>verify', {host: _this.host, ip: _this.ip});
        _this._next_verify = 0;
        this.req_id = unittest_req_by_route(_this.parents.map(p=>p.up.route),
            'ea', '>req(url='+url+')');
        return E.ws_call({url: api.get_url_ws_agent(_this.info()),
            type: 'agent', cmd: 'verify_proxy',
            msg: assign(api.get_prod_info()||{}, data)});
    }, function(res){
        if (res)
            return this.goto('result', res);
        return api.ajax({timeout: 7*SEC, url, qs: api.get_prod_info(), data});
    }, function result(ret){
        if (!ret || !ret.version)
        {
            unittest_resp_by_route(_this.parents.map(p=>p.up.route),
                'ea', '<resp(fail=empty)', this.req_id);
            return this.goto('reset', {err: 'fail', desc: 'empty ret'});
        }
        var data;
        try { data = ret.data ? JSON.parse(ret.data) : ret; }
        catch(e){ data = {}; }
        _this.bw_available = data.bw_available;
        _this.rtt = Date.now() - t0;
        _this.country = data.country;
        _this.busy = data.busy;
        _this.bw_busy = data.bw_busy;
        _this.version = data.version;
        _this.last_verified = Date.now();
        _this.unset_error();
        _this.err_timer = 500;
        if (_this.busy || _this.bw_busy)
            _this.parents.forEach(function(p){ p.up.set_busy(); });
        unittest_resp_by_route(_this.parents.map(p=>p.up.route),
            'ea', '<resp(data='+ret.data+')', this.req_id);
        if (data.error)
            return {err: 'agent_err', desc: data.error};
        _this.waiting.forEach(function(et){ et.continue(); });
        return this.goto('start');
    }, function reset(e){
        svc_vpn_util.push_event('<verify_err',
            {host: _this.host, ip: _this.ip, err: e.err, err_desc: e.desc});
        _this.err_timer = e.err=='agent_err' ? ms.DAY:
            Math.min(_this.err_timer*2, 15*ms.MIN);
        _this.set_error('verify_'+e.err, e.desc);
        _this.waiting.forEach(function(et){ et.continue(); });
        return this.goto('start');
    }, function catch$(err){
        return this.goto('reset', {err: /timeout/.test(err) ? 'timeout'
            : 'unknown', desc: ''+err});
    }, function finally$(){ delete _this.verify_sp; }]));
};

Agent.prototype.proxy_auth = function(){
    if (!api.ajax_via_proxy || get_proxy_auth_conf('disable'))
        return void(this.proxy_authed = true);
    var _this = this, rule = this.parents[0].up.rules[0];
    var auth = api.get_auth()||{};
    var ping_id = this.ip+'_'+(zutil.is_mocha() ? '1111' : Math.random());
    var data = {ping: 'proxy_auth', proxy_country: this.parents[0].up.country,
        uuid: auth.uuid, root_url: rule.link || rule.name, ping_id};
    var url = 'http://'+(rule.link || rule.name || 'proxy_auth')+
        '.trigger.hola.org/hola_trigger?'+zurl.qs_str(data);
    E.sp.spawn(etask({name: 'proxy_auth_'+(this.host||this.ip),
        cancel: true}, [function start(){
        this.auth_running = false;
        _this.proxy_auth_sp = this;
        if (_this.auth_error)
        {
            _this._next_auth = Date.now()+_this.auth_err_timer;
            return etask.sleep(_this.auth_err_timer);
        }
        var is_dormant, now = Date.now(), ts = _this.last_proxy_authed;
        var period = get_proxy_auth_conf('period_ms', 4*ms.HOUR);
        if (ts && (now-ts<period || (is_dormant = _this.is_dormant())))
        {
            this.set_state('start');
            let timer = Math.max(period - (is_dormant ? 0 : now-ts), 0);
            _this._next_auth = now+timer;
            return etask.sleep(timer);
        }
    }, function(){
        this.auth_running = true;
        _this._next_auth = 0;
        this.req_id = unittest_req_by_route(_this.parents.map(p=>p.up.route),
            'ea', '>req(url='+url+')');
        return api.ajax_via_proxy({url, type: 'GET'}, {timeout: 7*SEC, rule,
            agent: _this, force: 'proxy', src: 'proxy_auth'});
    }, function(ret){
        if (!ret || ret.status!=200)
        {
            unittest_resp_by_route(_this.parents.map(p=>p.up.route),
                'ea', '<resp(fail=empty)', this.req_id);
            return this.goto('reset', {err: 'fail', desc: 'empty ret'});
        }
        _this.proxy_authed = true;
        _this.last_proxy_authed = Date.now();
        _this.auth_error = undefined;
        unittest_resp_by_route(_this.parents.map(p=>p.up.route),
            'ea', '<resp(status='+ret.status+')', this.req_id);
        if (get_proxy_auth_conf('disable_periodic'))
            return this.return();
        return this.goto('start');
    }, function reset(e){
        _this.auth_err_timer = Math.min(_this.auth_err_timer*2, 15*ms.MIN);
        _this.auth_error = e;
        return this.goto('start');
    }, function catch$(err){
        return this.goto('reset', {err: /timeout/.test(err) ? 'timeout'
            : 'etask_error'});
    }, function finally$(){ delete _this.proxy_auth_sp;
    }]));
};

Agent.prototype.perr = function(name, info, err){
    var rule = zutil.omit(this.rule, ['cmds']);
    info = assign({rule, proxy_country: rule.country, hola_uid}, info);
    api.perr({info, id: 'be_verify_proxy_'+name}, err);
};

Agent.prototype.to_str = function(){
    var s = zutil.pick(this, 'host', 'bw', 'bw_busy', 'busy', 'error',
        'last_verified', 'last_traffic', 'ip', 'pool');
    return JSON.stringify(s);
};

Agent.prototype.uninit = function(){
    if (this.verify_sp)
        this.verify_sp.return();
    if (this.proxy_auth_sp)
        this.proxy_auth_sp.return();
};

function Agents(rule, route, dormant){
    if (!(this instanceof Agents))
        return new Agents(rule);
    var _this = this;
    this.rule = rule;
    this.rules = [rule];
    this.period = 12*ms.HOUR;
    this.route = route.toLowerCase();
    this.dormant = dormant;
    this.is_country_route = !route.includes('.');
    var m;
    if (m = this.route.match(/\.pool_?(\w+)?/))
        this.pool = m[1]||true;
    this.exclude = [];
    this.agents = [];
    this._log = [];
    this.limit = CG('verify_proxy.agent_num', 3);
    this.keep_order = !CG('gen.disable_order');
    this.country = rule.country;
    this.rule_type = E.get_rule_type(rule);
    this.get_best_agent_waiting = [];
    var timeout = 100;
    agents[this.rule_type][this.route] = this;
    this.monitor_sp = E.sp.spawn(etask({name: 'Agents', cancel: true},
    [function start(timer){
        return etask.sleep(timer||_this.period);
    }, function(){ return api.storage.get('agent_key_ts');
    }, function(ts){
        var diff = Date.now() - ts;
        if (ts && diff < _this.period)
            return this.goto('start', _this.period-diff);
        return _this.zgettunnels(null, {agent_key_only: 1});
    }, function(ret){
        if (!ret || !ret.agent_key)
        {
            api.perr({id: 'agent_key_miss', rate_limit: {count: 2}});
            timeout = Math.min(timeout*2, 10*SEC);
            return this.goto('start', timeout);
        }
        api.storage.set('agent_key', ret.agent_key);
        E.emit('lib_event', {id: 'set_agent_key', data: ret.agent_key});
        api.storage.set('agent_key_ts', Date.now());
        return this.goto('start');
    }, function catch$(err){
        api.perr({info: {err: zerr.e2s(err)}, id: 'agent_key_update_err',
            rate_limit: {count: 2}});
        return this.goto('start', 10*ms.MIN);
    }]));
}

Agents.prototype.is_dormant = function(){
    return CG('skip_dormant') && (this.dormant || ctx.length && !ctx.some(e=>{
        let rule = zutil.pick(e.rule, 'name', 'country');
        return svc_vpn_util.find_rule(this.rules, rule);
    }));
};

Agents.prototype.reverify = function(){
    this.agents.forEach(a=>a.reverify()); };

Agents.prototype.reauth = function(period){
    this.agents.forEach(a=>{
        if (a.last_proxy_authed && Date.now()-a.last_proxy_authed>period)
            a.reauth();
    });
};

Agents.prototype.uninit = function(){
    this.monitor_sp.return();
    this.uninited = true;
    this.agents.forEach(function(a){ a.uninit(); });
    this.agents = [];
    delete agents[this.rule_type][this.route];
    if (this.get_agents_et)
        this.get_agents_et = void this.get_agents_et.return();
};

Agents.prototype.zgettunnels = function(ping_id, opt){
    opt = opt||{};
    var _this = this;
    var auth = api.get_auth()||{};
    var qs = assign({country: this.route, limit: opt.limit||this.limit},
        zutil.omit(auth, ['uuid', 'session_key']));
    if (this.rule_type=='trial')
        qs.country += (this.is_country_route ? '.' : ',')+'trial';
    zutil.if_set(opt.agent_key_only, qs, 'agent_key_only');
    var data = zutil.pick(auth, 'uuid', 'session_key');
    if (ping_id)
        data.ping_id = ping_id;
    var exclude = array.unique(this.exclude.concat(opt.exclude||[])
        .map(e=>e.host));
    if (exclude.length>1)
    {
        data.exclude = exclude.join(',');
        qs.exclude = 1;
    }
    else if (exclude.length)
        qs.exclude = exclude[0];
    var res_data;
    return etask({name: 'zgettunnels', cancel: true}, [function(){
        this.req_id = unittest_req_by_route(_this.route, 'ec', '>req(url='
            +api.url_ccgi+'/zgettunnels?'+zurl.qs_str(assign({}, qs, data))
            +')');
        svc_vpn_util.push_event('>zgettunnels', {country: qs.country,
            exclude: data.exclude});
        return E.ws_call({type: 'ccgi', cmd: 'zgettunnels', msg: assign({}, qs,
            data)});
    }, function(res){
        if (res)
            return res_data = res;
        return api.ajax({url: api.url_ccgi+'/zgettunnels',
            method: CG('gen.is_zgettunnels_post') ? 'POST' : 'GET', qs: qs,
            data: data, retry: 1});
    }, function(res){
        svc_vpn_util.push_event('<zgettunnels', {country: qs.country,
            ip_list: assign({}, res && res.ip_list)});
        try {
            unittest_resp_by_route(_this.route, 'ec', '<resp('+(!res
                ? 'err=failed' : 'data='+JSON.stringify(res))+')',
                this.req_id);
        } catch(e){ zerr('failed to generate test %s', e&&e.stakc); }
        return res_data = res;
    }, function finally$(){
        var fa;
        if (res_data && (fa = api.force_agent()))
        {
            res_data.ip_list = {[fa.host]: fa.ip};
            res_data.protocol = {[fa.host]: 'https'};
            res_data.vendor = {[fa.host]: 'force_agent'};
            res_data.ztun = {[_this.route]: [`HTTP ${fa.host}:${fa.port}`]};
        }
        return res_data;
    }]);
};

Agents.prototype.set_agents = function(agents, exclude, opt){
    if (!agents || !agents.length)
        return;
    var _this = this;
    agents.map(function(s, i){
        var match = s.match(/.* (.*):(.*)/);
        var a = {host: match[1], port: match[2],
            vendor: opt.vendor && opt.vendor[match[1]],
            ip: opt.ip_list[match[1]]};
        zutil.if_set(opt.pool && opt.pool[a.host], a, 'pool');
        zutil.if_set(opt.port, a, 'port_list');
        return a;
    }).forEach(function(a){
        if (!a.pool)
            return _this.push(a);
        if (_this.pool==true)
        {
            var route = svc_vpn_util.gen_route_str_lc({country: _this.country,
                pool: a.pool});
            var route_agent = set_agent_route(assign({}, _this.rule,
                {pool: a.pool}), route, true);
            route_agent.push(a);
            return _this.push(route_agent.find(a));
        }
        _this.push(find_agents(a)[0]||a);
    });
    this.type = opt.agent_types[this.route];
};

Agents.prototype.reinit = function(){
    this.agents = [];
    this.pool_agents = [];
    if (this.get_agents_et)
        this.get_agents_et = void this.get_agents_et.return();
    return this.get_agents(null, 'reset');
};

Agents.prototype.get_agents = function(ping_id, reason){
    var _this = this;
    if (this.get_agents_et)
    {
        return etask([function(){ return this.wait_ext(_this.get_agents_et);
            }]);
    }
    var usable = this.agents.filter(function(a){
        return !_this.should_replace(a); });
    if (usable.length >= _this.limit)
    {
        zerr.info('get_agents %s use existing %O', this.route, this.agents);
        return;
    }
    if (this.last_no_agents_ts &&
        Date.now()-this.last_no_agents_ts<CG('no_agents_period', 5*ms.MIN))
    {
        zerr.info('get_agents %s - ignore zgettunnels, no agents', this.route);
        return;
    }
    var exclude = this.agents.concat(this.exclude);
    return etask([function(){
        _this.get_agents_et = this;
        return _this.zgettunnels(ping_id,
            {exclude, limit: _this.limit - usable.length});
    }, function(ret){
        zerr.info('zgettunnels %s ret %O', _this.route, ret);
        if (!ret)
            return;
        if (!ret.agent_key)
            api.perr({id: 'get_agent_key_miss', rate_limit: {count: 2}});
        api.storage.set('agent_key', ret.agent_key);
        E.emit('lib_event', {id: 'set_agent_key', data: ret.agent_key});
        if (!_this.agents.length && _this.exclude.length &&
            _this.exclude.every(a=>a.is_verify_err()))
        {
            api.perr({id: 'verify_all_failed',
                info: {agents: _this.exclude.map(a=>a.info()),
                route: _this.route}, rate_limit: {count: 1}});
        }
        var new_agents;
        if (new_agents = ret.ztun[_this.route])
        {
            if (!new_agents.length && !exclude.length)
            {
                zerr.info('zgettunnels no agents for %s', _this.route);
                _this.last_no_agents_ts = Date.now();
            }
            else if (new_agents.length && _this.last_no_agents_ts)
                delete _this.last_no_agents_ts;
        }
        _this.set_agents(new_agents, exclude, ret);
        zerr.info('%s agents set, reason %s, %O', _this.route, reason,
            _this.agents);
    }, function finally$(){ delete _this.get_agents_et;
    }]);
};

Agents.prototype.usable = function(){
    var count = 0;
    for (var i=0; i<this.agents.length; i++)
        count += this.agents[i].is_usable(this);
    return count;
};

Agents.prototype.dump_agents = function(){
    var _this = this;
    console.log(this.route+' Agents:');
    this.agents.forEach(function(a){ console.log(a.to_string(_this)); });
    console.log(this.route+' Excludes:');
    this.exclude.forEach(function(a){ console.log(a.to_string(_this)); });
};

Agents.prototype.set_busy = function(){
    if (!this.dormant && this.usable()<=1)
        this.get_agents(gen_ping_id());
};

Agents.prototype.move = function(s, d, agent){
    var i = s.findIndex(function(a){ return a.host==agent.host; });
    if (i<0)
        return;
    s.splice(i, 1);
    d.push(agent);
    return true;
};

Agents.prototype.unset_exclude = function(agent){
    return this.move(this.exclude, this.agents, agent); };

Agents.prototype.set_exclude = function(agent){
    let moved = this.move(this.agents, this.exclude, agent);
    if ((moved || !moved && !CG('disable_get_agents_on_exclude')) &&
        !this.dormant && this.usable()<=1)
    {
        this.get_agents(gen_ping_id());
    }
};

Agents.prototype.log = function(s){ this._log.push(s); };

Agents.prototype.has_rule = function(rule){
    return this.rules.some(r=>r.name==rule.name); };

Agents.prototype.add_rule = function(rule, dormant){
    if (!dormant)
        this.dormant = false;
    if (this.has_rule(rule))
        return;
    this.rules.push(rule);
    if (this.pool)
        this.reverify();
};

Agents.prototype.should_replace = function(agent){
    return (!agent||!Object.keys(agent).length) && 'empty'
        || agent.is_not_usable(this);
};

Agents.prototype.get_best_agent = function(ping_id){
    var _this = this, agents, retry, ret;
    return etask({name: 'get_best_agent', cancel: true, async: true},
    [function(){
        if (_this.get_best_agent_sp)
        {
            _this.get_best_agent_waiting.push(this);
            return this.wait();
        }
        _this.get_best_agent_sp = this;
    }, function start(){
        var __this = this;
        agents = _this.get_chosen();
        ret = (agents||[]).find(a=>a.is_verified());
        if (ret)
            return this.return({agent: _this, chosen: ret});
        if (agents)
        {
            agents.forEach(function(a){
                __this.spawn(etask({name: 'wait_verify', cancel: true},
                    [function(){ return a.wait_verified();
                    }, function(){ return a; }]));
            });
            return this.wait_child('any', a=>a&&a.is_verified());
        }
        return !retry ? _this.get_agents(ping_id, 'missing agents') : null;
    }, function(res){
        ret = res && res.child.retval;
        if (ret)
            return {agent: _this, chosen: ret};
        if (!retry)
        {
            retry = true;
            return this.goto('start');
        }
        return {agent: _this, error: 'no_agents_found'};
    }, function catch$(err){ return {agent: _this, error: ''+err};
    }, function finally$(){
        var __this = this;
        delete _this.get_best_agent_sp;
        _this.get_best_agent_waiting.forEach(sp=>sp.return(__this.retval));
    }]);
};

Agents.prototype.get_all_agents = function(){
    const _this = this;
    const ret = this.agents.filter(a=>!_this.should_replace(a));
    return !ret.length ? this.agents : ret;
};

Agents.prototype.get_chosen = function(){
    var _this = this, ret = [];
    function add(cond){
        var list = _this.agents.filter(cond);
        if (!list.length)
            return;
        var agents = list.slice();
        agents.sort((a, b)=>a.rtt - b.rtt);
        ret = ret.concat(agents.slice(0, 3 - ret.length));
    }
    add(a=>!_this.should_replace(a));
    if (ret.length==3)
        return ret;
    add(a=>_this.should_replace(a));
    if (ret.length==3)
        return ret;
    this.exclude.sort((a, b)=>a.err_ts(_this) - b.err_ts(_this));
    ret = ret.concat(this.exclude.slice(0, 3 - ret.length));
    return ret.length ? ret : null;
};

Agents.prototype.push = function(agent){
    if (this.find(agent))
        return -1;
    if (agent instanceof Agent)
    {
        agent.add_parent(this);
        return this.agents.push(agent);
    }
    return this.agents.push(new Agent(agent, this));
};

Agents.prototype.find = function(agent){
    function cmp_agents(a, b){ return (a.host==b.host || a.ip == b.ip)
        && a.port==b.port; }
    return this.agents.find(a=>cmp_agents(agent, a))
        || this.exclude.find(a=>cmp_agents(agent, a));
};

Agents.prototype.to_str = function(){
    var s = '"'+this.route+'":{"agents":[';
    this.agents.forEach((a, i)=>{ s += (i ? ',' : '')+a.to_str(); });
    s += '],"exclude":[';
    this.exclude.forEach((a, i)=>{ s += (i ? ',' : '')+a.to_str(); });
    return s+']}';
};

function find_agents(agent){
    var res = [];
    if (!agent.host && !agent.ip)
        return res;
    for (var t in agents)
    {
        var routes = Object.keys(agents[t]);
        for (var i = 0; i<routes.length; i++)
        {
            var a = agents[t][routes[i]].find(agent);
            if (a)
                res.push(a);
        }
    }
    return res;
}

E.is_agent = o=>!!find_agents({ip: o, host: o})[0];

E.is_trial_rule = rule=>
    rule && rule.src=='trial' && !CG('gen.disable_trial_agents');

E.get_rule_type = rule=>E.is_trial_rule(rule) ? 'trial' : 'def';

E.update_chosen = agent=>{
    for (agent of find_agents(agent))
        agent.last_traffic = Date.now();
};

E.get_all_agents = (route_str, rule)=>{
    const t = E.get_rule_type(rule);
    return agents[t][route_str] && agents[t][route_str].get_all_agents();
};

E.get_agents_type = (route_str, rule)=>{
    const t = E.get_rule_type(rule);
    return agents[t][route_str] && agents[t][route_str].type;
};

E.get_rule_routes = function(rule, raw){
    var routes = rule && api.get_rule_routes ? api.get_rule_routes(rule) : [];
    return raw ? routes : routes.map(r=>svc_vpn_util.gen_route_str_lc(r));
};

function get_rule_agents(rule){
    var _agents = {}, t = E.get_rule_type(rule);
    E.get_rule_routes(rule).forEach(e=>_agents[e] = agents[t][e]);
    return _agents;
}

function set_agent_route(rule, route, dormant){
    var t = E.get_rule_type(rule);
    if (agents[t][route])
        agents[t][route].add_rule(rule, dormant);
    else
        agents[t][route] = new Agents(rule, route, dormant);
    return agents[t][route];
}

E.get_agents = function(ping_id, rule, opt){
    opt = opt||{};
    var rule_agents = get_rule_agents(rule);
    var res = {rule: rule, proxy_country: rule.country, verify_proxy: {}};
    ping_id = gen_ping_id(ping_id);
    return etask({name: 'get_agents', cancel: true}, [function(){
        active_reqs.push(this);
        reverify_dormant(rule);
        for (var route in rule_agents)
        {
            var route_agent = set_agent_route(rule, route);
            this.spawn(route_agent.get_best_agent(ping_id, opt));
        }
        return this.wait_child('any', function(ret){
            if (!ret)
                return;
            if (ret.error)
            {
                res.verify_proxy[ret.agent.route] = [];
                return;
            }
            var a = {host: ret.chosen.host, port: ret.chosen.port,
                ip: ret.chosen.ip, type: ret.agent.type, verified: true};
            zutil.if_set(ret.chosen.pool, a, 'pool');
            zutil.if_set(ret.chosen.port_list, a, 'port_list');
            var r = [{agent: a, res: {version: ret.chosen.version,
                ip: ret.chosen.ip, bw_available: ret.chosen.bw_available,
                country: ret.chosen.country}, t: ret.chosen.t}];
            zutil.if_set(ret.chosen.bw_busy, r[0].res, 'bw_busy');
            zutil.if_set(ret.chosen.busy, r[0].res, 'busy');
            res.verify_proxy[ret.agent.route] = r;
        });
    }, function(){ return res;
    }, function catch$(err){ return {info: {error: 'catch', err: ''+err}};
    }, function finally$(){
        var idx = active_reqs.indexOf(this);
        if (idx!=-1)
            active_reqs.splice(idx, 1);
    }]);
};

E.change_agents = function(ping_id, rule, opt){
    opt = opt||{};
    if (Array.isArray(opt))
        opt = {replace: opt};
    ping_id = gen_ping_id(ping_id);
    var replace = [], r = opt.replace||[];
    for (var i=0; i<r.length; i++)
        replace = replace.concat(find_agents(r[i]));
    return etask({name: 'change_agents', cancel: true}, [function(){
        replace.forEach(rep=>{
            if (rep)
                rep.set_error('force_change', 'by change agents', rule);
        });
        return E.get_agents(ping_id, rule, zutil.pick(opt, 'type',
            'src_rule'));
    }]);
};

var def_cc_states = {
    wait: {wait: ms.MIN, next: 'hola'},
    hola: {next: 'svd'},
    svd: {next: 'connectivity'},
    connectivity: {urls: ['google.com', 'microsoft.com', 'wikipedia.org'],
        next: 'wait', next_success: 'common_agents'},
    common_agents: {next: 'mem_agents', agents: 'common_agents', retries: 1},
    mem_agents: {next: 'build_agents', agents: 'mem_agents', retries: 1},
    build_agents: {next: 'cloud_agents', agents: 'build_agents', retries: 1},
    cloud_agents: {agents: 'cloud_agents', retries: 1},
};
var def_cc_api = {
    ajax_via_proxy: undefined,
    perr: function(opt){ zerr('cc.perr not set, discarding '+opt.id); },
};
function ConnectivityCheck(opt){
    this.api = {};
    assign(this.api, def_cc_api, opt.api);
    this.states = {};
    assign(this.states, def_cc_states, opt.states);
    for (var name in this.states)
    {
        var state = this.states[name] = assign({urls: []}, this.states[name]);
        state.name = name;
        if (opt.ignore)
        {
            state.ignore = opt.ignore instanceof RegExp ?
                opt.ignore.test(name) : opt.ignore.includes(name);
        }
        if (!state.urls || state.urls.length)
            continue;
        var is_agent_state = name.endsWith('_agents');
        var use_urls = !opt[name] || is_agent_state ? opt.hola : opt[name];
        if (typeof use_urls=='string')
            use_urls = [use_urls];
        if (is_agent_state)
            use_urls = use_urls.slice(0, 1);
        state.urls = use_urls;
    }
    this.opt = opt;
    this.logs = [];
    this.perrs = {};
}

ConnectivityCheck.prototype.reset = function(){
    if (this.et)
        this.et = this.et.return();
    this.selected = this.state = undefined;
};

ConnectivityCheck.prototype.uninit = function(){ this.reset(); };

ConnectivityCheck.prototype.log = function(log, state){
    this.logs.push({log: log, state: state}); };

ConnectivityCheck.prototype.perr = function(opt){
    var path = opt.info.name+'.'+opt.id;
    if (zutil.get(this.perrs, path))
        return;
    zutil.set(this.perrs, path, true);
    if (opt.info && this.opt.dbg_logs)
        opt.info.logs = this.logs.map(function(o){ return o.log; });
    return this.api.perr(opt);
};

ConnectivityCheck.prototype.check = function(state, loop_et){
    function send_next(){
        if (agents[next])
            delete agents[next].timeout;
        if (!agents.length || next+1==agents.length)
            return;
        if (agents[++next])
            state.urls.forEach(function(url){ __this.spawn(send_ajax(url)); });
        else
            et_timeout = setTimeout(function(){ et.return(ret); }, 3000);
    }
    function ajax_via_proxy(url, opt){
        return etask({name: 'ajax_wrapper', cancel: true}, [function(){
            return _this.api.ajax_via_proxy(url, opt);
        }, function(resp){
            if (resp)
                resp.test_url = url.url;
            return resp;
        }]);
    }
    function send_ajax(url){
        url = url.startsWith('http') ? url : 'https://'+url+
            (url.includes('/') ? '' : '/');
        var _url = {url: url, type: 'GET'};
        var agent = agents.length ? agents[next] : null;
        var opt = {always: true, hdrs_abort: true, ignore_redir: true,
            hdrs: {'Cache-Control': 'no-cache,no-store,must-revalidate,'+
            'max-age=-1'}, force_headers: true, fix_307: true, agent: agent,
            force: agent ? 'proxy' : 'direct', src: 'bg_ajax'};
        if (opt.force=='proxy')
            opt.prot = 'proxy';
        _this.log('ajax '+(agents.length ? 'proxy ' : '')+url);
        ts = Date.now();
        var et = ajax_via_proxy(_url, opt);
        if (agent)
            agent.timeout = setTimeout(send_next, 3000);
        else
        {
            et_timeout = setTimeout(function(){
                et.return({orig_res: {error: 'timeout'}}); }, 5000);
        }
        return et;
    }
    var agents = this.opt[state.agents]||[], ret = {error: 'check failed'};
    var et_timeout, ts, __this, _this = this, next = 0;
    var et = etask('connectivity_check', [function(){
        return typeof agents=='function' ? agents() : agents;
    }, function(res){
        agents = res||[];
        if (state.agents && !agents.length)
            return;
        __this = this;
        state.urls.forEach(function(url){ __this.spawn(send_ajax(url)); });
        return this.wait_child('any', function(resp){
            if (!ret.error)
                return;
            clearTimeout(et_timeout);
            var _ret = resp && resp.orig_res ? resp.orig_res :
                {error: 'ajax failed'};
            _ret.url = resp && resp.test_url;
            _ret.statusCode = _ret.statusCode!=undefined ? _ret.statusCode
                : _ret.code;
            delete _ret.body;
            if (resp && resp.agent && resp.agent.timeout)
                clearTimeout(resp.agent.timeout);
            var proxy_err = agents.length && /ERR_PROXY_CONNECTION_FAILED/
                .test(_ret.error);
            _this.log('resp '+(_ret.error||_ret.statusCode)+' after '
                +(Date.now()-ts)+'ms', state);
            if (!_ret.error && !proxy_err)
            {
                if (next)
                {
                    _this.perr({id: 'connectivity_check_failed_agent',
                        rate_limit: {count: 2}, info: {name: state.name}});
                }
                return ret = _ret;
            }
            send_next();
        });
    }, function finally$(){
        clearTimeout(et_timeout);
        if (agents.length)
            agents.forEach(function(a){ clearTimeout(a.timeout); });
        if (!ret.error)
        {
            if (state.next_success)
            {
                _this.state = assign({}, state);
                _this.retries = 0;
                _this.state.next = state.next_success;
            }
            else
            {
                _this.selected = assign({success_url: ret.url}, state);
                if (agents.length)
                    _this.selected.agent = agents[next];
                _this.perr({id: 'connectivity_check_success',
                    rate_limit: {count: 5}, info: {name: state.name,
                    urls: state.urls, success: ret.url}});
            }
        }
        else
        {
            _this.perr({id: 'connectivity_check_failed',
                rate_limit: {count: 15}, info: {name: state.name,
                urls: state.urls}});
        }
        loop_et.continue();
    }]);
    return et;
};

ConnectivityCheck.prototype.get_state = function(){
    return this.state ? this.states[this.state.next] : this.states.hola; };

ConnectivityCheck.prototype.run = function(opt){
    if (this.error_sent && Date.now()-this.error_sent<10*ms.MIN)
        return;
    opt = opt||{};
    var _this = this;
    return etask({name: 'run', cancel: true, async: true},
    [function(){
        if (_this.et)
        {
            if (_this.selected)
                return;
            return this.wait_ext(_this.et);
        }
        _this.retries = 0;
        _this.et = this;
        _this.error_sent = false;
        _this.perrs = {};
        return this.goto('loop');
    }, function(){ return this.goto('ret', _this.selected);
    }, function loop(){
        var wait, check, state;
        if (_this.selected)
            return _this.selected;
        if (!(state = _this.get_state()))
            return;
        var max = state.retries||_this.opt.retries||3;
        if (_this.retries==max || state.ignore)
        {
            _this.retries = 0;
            _this.state = state;
            this.set_state('loop');
            return;
        }
        var agents;
        if ((agents = _this.opt[state.agents]) &&
            agents instanceof ConnectivityCheck)
        {
            if (agents.selected)
            {
                _this.selected = assign(zutil.pick(agents.selected, 'agent',
                    'success_url'), state);
                _this.perr({id: 'connectivity_check_success',
                    rate_limit: {count: 5}, info: {name: state.name,
                    urls: state.urls}});
                return;
            }
            this.set_state('loop');
            return agents.run();
        }
        if (state.wait || (check = _this.check(state, this)))
        {
            this.set_state('loop');
            if (state.wait)
                wait = etask.sleep(state.wait);
            if (opt.on_state)
                opt.on_state(state);
        }
        _this.retries++;
        return wait ? wait : check&&this.wait();
    }, function ret(res){
        if (!_this.selected && !_this.error_sent)
        {
            _this.perr({id: 'connectivity_check_all_failed',
                rate_limit: {count: 5}, info: {url: _this.opt.hola}});
            _this.error_sent = Date.now();
        }
        return res||{error: 'all_failed'};
    }, function catch$(err){ return {error: ''+err};
    }, function finally$(){ _this.et = undefined;
    }]);
};

ConnectivityCheck.prototype.is_completed = function(){
    return !!this.selected; };
ConnectivityCheck.prototype.get_selected_state = function(){
    return this.selected ? this.selected.name : undefined;
};
ConnectivityCheck.prototype.get_backend_link = function(){
    const s = this.selected;
    return s ? {url: s.success_url, agent: s.agent} : {url: this.opt.def_url};
};

E.ConnectivityCheck = ConnectivityCheck;

E.get_chosen_agent = function(route_opt, rule){
    route_opt = route_opt||{};
    var route = svc_vpn_util.gen_route_str_lc(route_opt, {no_algo: true});
    var chosen, route_agent = set_agent_route(rule, route);
    if (!(chosen = route_agent.get_chosen()) || chosen[0].replace)
    {
        route_agent.get_best_agent(Math.random());
        return [];
    }
    return [chosen[0].info()];
};

E.get_active_agents = function(rule){
    var agents = [];
    E.get_rule_routes(rule, true).forEach(r=>{
        agents = agents.concat(E.get_chosen_agent(r, rule)); });
    return agents;
};

E.resolve_agents = function(r, exclude, opt){
    var ping_id = gen_ping_id();
    if (exclude)
        return E.change_agents(ping_id, r[0], assign({replace: exclude}, opt));
    return etask.for_each(r, [function(){
        return E.get_agents(ping_id, this.iter.val, opt); }]);
};

function gen_stamp(){ return Math.floor(Math.random()*0xffffffff); }

function commit_rules(update){
    rules.stamp = gen_stamp();
    if (update)
        gen_rules(rules.set);
    api.storage.set('rules', rules);
}

E.has_rule = function(o){
    if (!o)
        return;
    if (typeof o=='function')
    {
        for (var i in rules.set)
        {
            if (o(rules.set[i]))
                return true;
        }
        return;
    }
    return svc_vpn_util.find_rule(rules.set, o);
};

function rules_fixup(){
    var change, now = Date.now();
    var country = api.get_user_info().country;
    for (var i in rules.set)
    {
        var r = rules.set[i];
        var diff = now-(r.ts||0);
        if (!r.enabled)
            continue;
        if (r.country==country && diff>ms.DAY && r.mode!='protect' &&
            r.src_country && r.src_country!=country)
        {
            zerr.notice('disabled rule after country change site %s %s -> %s',
                r.name, r.src_country, r.country);
            api.perr({id: 'disable_rule_country_changed',
                info: {rule: {name: r.name, country: r.country,
                src_country: r.src_country}, src_country: country}});
            change = true;
            r.enabled = false;
        }
    }
    if (change)
        commit_rules(true);
}

function _set_rule(opt, pair){
    var r, i;
    svc_vpn_util.push_event('set_rule', {name: opt.name, src: opt.src, pair,
        country: opt.country, enabled: opt.enabled, full_vpn: opt.full_vpn,
        mode: opt.mode, del: opt.del});
    if (!opt.name || !opt.country)
        return;
    if (!rules.generated)
        rules.generated = {};
    if (!rules.set)
        rules.set = {};
    for (i in rules.set)
    {
        r = rules.set[i];
        if (r.name!=opt.name || opt.src && opt.src!=r.src)
            continue;
        delete rules.generated[i];
        delete rules.set[i];
    }
    if (!opt.del)
    {
        if (opt.name.match(/^https?:\/\//))
            opt.name = svc_vpn_util.get_root_url(opt.name);
        r = E.gen_rule(opt);
        rules.generated[r.id] = r;
        rules.set[r.id] = {name: r.name, country: r.country,
            enabled: r.enabled, ts: r.ts, mode: r.mode, src: r.src,
            full_vpn: r.full_vpn, src_country: r.src_country||''};
    }
    if (pair)
        return;
    var root_urls = get_root_urls(opt.name);
    for (i = 1; i<root_urls.length; i++)
        _set_rule(assign({}, opt, {name: root_urls[i]}), true);
}

E.get_site_key = root_url=>{
    var sites = CG('sites', {});
    return Object.keys(sites).find(k=>{
        var v = sites[k];
        var urls = Array.isArray(v.root_url) ? v.root_url : [v.root_url];
        return urls.includes(root_url) && v.min_ver &&
            version_util.cmp(ext_ver(), v.min_ver)>=0;
    });
};

E.get_site_conf = root_url=>CG('sites.'+E.get_site_key(root_url));

function get_root_urls(domain){
    var site = E.get_site_conf(domain);
    return site ? [...new Set([domain].concat(site.root_url))] : [domain];
}

E.set_rule_val = (rule, key, val)=>{
    var i, r;
    for (i in rules.set)
    {
        r = rules.set[i];
        if (r.name!=rule.name)
            continue;
        r[key] = rules.generated[i][key] = val;
    }
    commit_rules();
};

E.user_fix_it = function(opt){
    unittest_user_fix_it(opt);
};

E.set_rule = function(opt){
    opt = assign({ts: Date.now()}, opt);
    unittest_set_rule(opt);
    E.emit('lib_event', {id: 'before_rule_set', data: opt.name});
    _set_rule(opt);
    commit_rules();
};

function gen_rules(set){
    if (!set)
        return;
    rules.generated = null;
    rules.set = null;
    for (var i in set)
        _set_rule(set[i]);
}

function is_supported_country(op, rule){
    if (!rule.country)
        return true;
    var c = rule.country;
    if (!c.list || !c.type || !(c.list instanceof Array))
        return true;
    if (c.type=='in' && (!op.country || !c.list.includes(op.country))
        || c.type=='not_in' && op.country && c.list.includes(op.country))
    {
        return false;
    }
    return true;
}

function get_filtered_rules(urules, op){
    if (!urules)
        return;
    var m, res = {};
    for (var i in urules)
    {
        if (!is_supported_country(op, urules[i]))
            continue;
        res[i] = urules[i];
        if ((m = urules[i].match) && m.min_ver &&
            version_util.cmp(product_ver(), m.min_ver)<0)
        {
            delete urules[i].match;
        }
    }
    return res;
}

E.set_rules = _rules=>{
    var opt = {country: api.get_user_info().country};
    if (rules.enable!=_rules.enable
        || !zutil.equal_deep(rules.blacklist, _rules.blacklist)
        || ['globals', 'plus', 'trial'].some(e=>{
        return !zutil.equal_deep(rules[e],
        get_filtered_rules(_rules['unblocker_'+e], opt)); }))
    {
        rules.globals = get_filtered_rules(_rules.unblocker_globals, opt);
        rules.plus = get_filtered_rules(_rules.unblocker_plus, opt);
        rules.trial = get_filtered_rules(_rules.unblocker_trial, opt);
        rules.blacklist = _rules.blacklist;
        rules.enable = _rules.enable;
        api.storage.set('rules', rules);
    }
};

E.get_rules = ()=>{
    if (!rules)
        return null;
    rules_fixup();
    if (!rules.globals)
        return null;
    var json = {unblocker_rules: rules.generated||{}, stamp: rules.stamp,
        enable: rules.enable, blacklist: rules.blacklist};
    ['globals', 'plus', 'trial'].forEach(
        e=>json['unblocker_'+e] = rules[e]);
    return zutil.clone_deep(json);
};

E.get_groups = groups=>{
    var ret = {unblocker_rules: {}};
    for (var i=0; i<groups.length; i++)
    {
        var r = E.gen_rule(groups[i]);
        ret.unblocker_rules[r.id] = r;
    }
    return zutil.clone_deep(ret);
};

function agents_to_unittest_str(rule){
    var routes = E.get_rule_routes(rule);
    var s = '';
    for (var e in agents)
    {
        let _s = '"'+e+'":{';
        Object.keys(agents[e]).forEach(a=>{
            if (rule && !routes.includes(a))
                return;
            _s += agents[e][a].to_str();
        });
        s = s+(s ? ',' : '')+_s+'}';
    }
    return '{'+s+'}';
}

function reverify_dormant(rule){
    for (var e in agents)
    {
        Object.keys(agents[e]).forEach(a=>{
            var l = agents[e][a];
            if (l.has_rule(rule) && !l.usable() && l.is_dormant())
                l.reverify();
        });
    }
}

E.reauth = function(rule, period){
    period = period||ms.HOUR;
    for (var e in agents)
    {
        Object.keys(agents[e]).forEach(a=>{
            var l = agents[e][a];
            if (l.country==rule.country)
                l.reauth(period);
        });
    }
};

function get_ctx(id){ return ctx.find(c=>c.id==id); }
E.add_ctx = function(id, rule, data){
    try {
        reverify_dormant(rule);
        E.del_ctx(id);
        ctx.push({id, rule, data, ts: Date.now(), ids: {ew: 0,
           bw: 0, ea: 0, ec: 0}, reqs: {}, routes: E.get_rule_routes(rule),
           unittest: [], src: data.src});
        if (!gen_auto_unittest())
            return;
        c_unittest_push(id, 'open(country='+api.get_user_info().country
            +' date="'+date.to_sql(new Date())+'" auto user_plus='+user_plus
            +' set_agents='+agents_to_unittest_str(rule)+')');
        c_unittest_push(id, 'set_rule(raw='+JSON.stringify(rule)+')');
        c_unittest_push(id, 'nav(url='+data.src+')');
        if (ctx.length>20)
            ctx.splice(0, 10);
    }
    catch(e){ console.error(e); }
};

E.del_ctx = function(id){
    try {
        let c;
        if (c=get_ctx(id))
            ctx.splice(ctx.indexOf(c), 1);
    } catch(e){ console.error(e); }
};

function agent_num(host){ return host.match(/[a-z]+([0-9]+)/)[1]; }

E.on_before = function(url, req_id, ctx_id, data){
    if (!gen_auto_unittest())
        return;
    try {
        let c = get_ctx(ctx_id);
        if (!c)
            return;
        c_unittest_push(ctx_id, 'bw', '>req(url='+url+' '+(data.strategy
            ? 'strategy="'+data.strategy+(data.agent ? '.z'
            +agent_num(data.agent) : '')+'"' : '')+')', req_id);
    }
    catch(e){ console.error(e); }
};

E.on_completed = function(req_id, ctx_id, data){
    if (!gen_auto_unittest())
        return;
    try {
        let c = get_ctx(ctx_id);
        if (!c)
            return;
        let req = c.unittest.find(u=>u.req_id==req_id);
        if (!req)
            return;
        c_unittest_push(ctx_id, 'bw', '<resp(status="'+(data.status||0)
            +'"'+(data.hdrs ? ' hdrs='+JSON.stringify(zutil.pick(data.hdrs,
            'content-length', 'x-hola-response', 'x-hola-error', 'location'))
            : '')+')', req_id, req.roles_id);
    }
    catch(e){ console.error(e); }
};

E.dump_unittest = function(ctx_id){
    let c = get_ctx(ctx_id);
    if (!c)
        return;
    c.unittest.forEach(u=>console.log(u.s));
};

var regex_ip = /^\d+\.\d+\.\d+\.\d+$/;
let is_ip = host=>regex_ip.test(host);
let regex_ip2 = /^((\d{1,3}\.){3}\d{1,3})(\/(\d+))?$/;
var regex_inet = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
let inet_aton = str=>{
    var laddr = 0, i, parts = regex_inet.exec(str);
    if (!parts)
        return null;
    parts.shift();
    for (i=0; i<parts.length; i++)
    {
        laddr *= 256;
        laddr += +parts[i];
    }
    return laddr;
};

class Proxy_exceptions {
    constructor(){
        this.ips = [];
        this.match_root_url = {};
        var rule_props = ['hosts', 'root_urls', 'src_country',
            'proxy_country'];
        for (let name of rule_props)
        {
            this[name] = {};
            this[name+'_cache'] = {};
            this[name+'_counter'] = 0;
        }
    }
}

class Proxy_rules_engine {
    constructor(unblocker_rules, proxy_rules, opt){
        proxy_rules = proxy_rules||{};
        opt = opt||{};
        this.opt = {
            redir_direct: opt.redir_direct===undefined||opt.redir_direct,
            proxy_port: opt.proxy_port||6857,
            redir_port: opt.redir_port||6850,
            ext: opt.ext||0,
            by_rules: opt.by_rules||0,
            do_redir: opt.do_redir||0,
        };
        this.hosts = {
            hosts: {},
            ips: [],
            hosts_cache: {},
            hosts_counter: 0,
        };
        if (!this.opt.by_rules)
        {
            for (let i in unblocker_rules)
            {
                let rule = unblocker_rules[i];
                if (rule.internal || this.opt.ext && !rule.enabled)
                    continue;
                this.parse_cmds(i, rule, unblocker_rules, this.hosts);
            }
        }
        else
        {
            this.rules = {};
            for (let i in unblocker_rules)
            {
                let rule = unblocker_rules[i];
                if (rule.internal || this.opt.ext && !rule.enabled)
                    continue;
                if (!rule.root_url)
                {
                    this.parse_cmds(i, rule, unblocker_rules, this.hosts);
                    continue;
                }
                if (!rule.cmds)
                    continue;
                this.rules[i] = {hosts: {}, ips: [], hosts_cache: {},
                    hosts_counter: 0};
                this.parse_cmds(i, rule, unblocker_rules, this.rules[i], 1);
            }
        }
        this.exceptions = this.parse_exceptions(proxy_rules.free);
        this.exceptions_plus = this.parse_exceptions(proxy_rules.plus);
    }
    find_proxy_for_url_exception(url, host, opt){
        opt = opt||{};
        let rules = opt.is_trial||opt.premium ? this.exceptions_plus :
            this.exceptions;
        let ret;
        if (!(ret = this.find_proxy_for_match(url, host, rules, opt)))
            ret = this.find_proxy_for_url_exception_int(url, host, rules, opt);
        return ret && ret.str;
    }
    find_proxy_for_val(url, host, hosts, opt){
        opt = opt||{};
        if (!opt.name || !opt.val)
            return;
        let do_redir = this.opt.do_redir;
        var cache = opt.name+'_cache', counter = opt.name+'_counter';
        if (hosts[cache])
        {
            var c = hosts[cache][opt.val];
            if (c && c.func)
                return c.func(url, host, do_redir, opt);
            if (c)
                return this.pac_redir(url, host, do_redir);
        }
        if (hosts[counter]>5000)
        {
            hosts[counter] = 0;
            hosts[cache] = {};
        }
        var func;
        if (!(func = hosts[opt.name][opt.val]))
            return;
        hosts[cache][opt.val] = {func: func};
        hosts[counter]++;
        return func(url, host, do_redir, opt);
    }
    find_proxy_for_url_exception_int(url, host, rules, opt){
        var ret = this.find_proxy_for_url(url, host, rules, {exception: 1});
        if (!ret && opt.root_url)
        {
            ret = this.find_proxy_for_val(url, host, rules, {name: 'root_urls',
                val: opt.root_url, exception: 1});
        }
        if (!ret && opt.src_country)
        {
            ret = this.find_proxy_for_val(url, host, rules,
                {name: 'src_country', val: opt.src_country, exception: 1});
        }
        if (!ret && opt.proxy_country)
        {
            ret = this.find_proxy_for_val(url, host, rules,
                {name: 'proxy_country', val: opt.proxy_country, exception: 1});
        }
        return ret;
    }
    find_pac_proxy(url, host){
        let ret = this.find_proxy_for_url(url, host, this.hosts);
        if (ret.proxy)
        {
            let ex = this.find_proxy_for_url(url, host, this.exceptions,
                {exception: 1, orig_proxy: ret.str});
            if (ex)
                ret = ex;
        }
        return ret.str;
    }
    find_proxy_for_url(url, host, hosts, opt){
        opt = opt||{};
        var do_redir = this.opt.do_redir;
        if (hosts.hosts_cache)
        {
            var c = hosts.hosts_cache[host];
            if (c && c.func)
                return c.func(url, host, do_redir, opt);
            if (c)
                return this.pac_redir(url, host, do_redir);
        }
        if (hosts.hosts_counter>5000)
        {
            hosts.hosts_counter = 0;
            hosts.hosts_cache = {};
        }
        if (is_ip(host))
        {
            var ip = inet_aton(host);
            var ips = hosts.ips;
            for (var i=0; i<ips.length; i++)
            {
                var _ip = ips[i];
                if ((ip >>> _ip.bits << _ip.bits)^_ip.mask)
                    continue;
                hosts.hosts_cache[host] = {func: _ip.func};
                hosts.hosts_counter++;
                return _ip.func(url, host, do_redir, opt);
            }
        }
        var index = -1;
        for (;;)
        {
            var func = hosts.hosts['*']||hosts.hosts[host.substr(index+1)];
            if (func)
            {
                hosts.hosts_cache[host] = {func: func};
                hosts.hosts_counter++;
                return func(url, host, do_redir, opt);
            }
            if ((index = host.indexOf('.', index+1))<0)
                break;
        }
        if (opt.exception)
            return null;
        hosts.hosts_cache[host] = {};
        hosts.hosts_counter++;
        return this.pac_redir(url, host, do_redir);
    }
    find_proxy_for_match(url, host, rules, opt){
        opt = opt||{};
        var mr, mrules;
        if (!rules.match_root_url || !opt.root_url ||
            !(mrules = rules.match_root_url[opt.root_url]))
        {
            return opt.orig_proxy;
        }
        mr = mrules.find(function(r){
            if (r.fsrc_country && !r.fsrc_country.includes(opt.src_country))
                return false;
            if (r.fproxy_country &&
                !r.fproxy_country.includes(opt.proxy_country))
            {
                return false;
            }
            return true;
        });
        if (mr)
            return this.find_proxy_for_url_exception_int(url, host, mr, opt);
    }
    parse_exceptions(rules){
        if (!rules)
            rules = {};
        let exceptions = new Proxy_exceptions();
        for (let name in rules)
        {
            let rule = rules[name];
            if (rule.match)
                this.parse_match(name, rule, rules, exceptions);
            else
                this.parse_cmds(name, rule, rules, exceptions);
        }
        return exceptions;
    }
    pac_redir(url, host, do_redir){
        if (!do_redir || !this.opt.redir_direct)
            return {proxy: false, str: 'DIRECT'};
        if (zbrowser.isPlainHostName(host))
            return {proxy: false, str: 'DIRECT'};
        let m = url.match(/^.+:([0-9]+)\/.*$/);
        if (m && m.length==2 && m[1]!='80')
            return {proxy: false, str: 'DIRECT'};
        if (url.match(/^https:.*$/))
            return {proxy: false, str: 'DIRECT'};
        return {proxy: false,
            str: 'PROXY 127.0.0.1:'+this.opt.redir_port+'; DIRECT'};
    }
    handle_then(value, url, host, do_redir, exception, orig_proxy){
        if (value=='DIRECT')
            return this.pac_redir(url, host, do_redir);
        let n = value.split(' ');
        if (exception && n[0]=='PROXY')
        {
            if (n.length==1)
                return null;
            if (!n[1].indexOf('XX') && orig_proxy)
            {
                let c = orig_proxy.split(' ')[1].split('.')[0];
                return {proxy: true, str: 'PROXY '+n[1].replace('XX', c)};
            }
        }
        if (n.length<2)
            return this.pac_redir(url, host, do_redir);
        else if (!{PROXY: 1, SOCKS: 1, SOCKS5: 1, HTTPS: 1}[n[0]])
            return this.pac_redir(url, host, do_redir);
        if (this.opt.ext)
            return {proxy: true, str: value};
        return {proxy: true, str: 'PROXY 127.0.0.1:'+this.opt.proxy_port};
    }
    static get_ext(url){
        let ext = '', index = url.indexOf('?');
        if (index>=0)
            url = url.slice(0, index);
        let ext_index = url.lastIndexOf('.', url.length);
        let _ext_index = url.lastIndexOf('/', url.length);
        if (ext_index>=0 && ext_index>_ext_index)
            ext = url.slice(ext_index+1);
        else if (_ext_index>=0)
            ext = url.slice(_ext_index+1);
        return ext;
    }
    host_cb(name, rule, cmd, url, host, do_redir, opt){
        if (!cmd['if'])
        {
            if (cmd.dst_dns)
            {
                return this.handle_then(cmd.then, url, host, do_redir,
                    opt.exception, opt.orig_proxy);
            }
            cmd['if'] = [];
        }
        let ext = Proxy_rules_engine.get_ext(url);
        for (let i=0; i<cmd['if'].length; i++)
        {
            let _if = cmd['if'][i];
            let arg = null, value = null;
            let type = '==';
            if (!_if.then)
                continue;
            if (_if.type)
                type = _if.type;
            if (_if.host)
            {
                arg = host;
                value = _if.host;
            }
            else if (_if.url)
            {
                arg = url;
                value = _if.url;
            }
            else if (_if.ext)
            {
                arg = ext;
                value = _if.ext;
                if (value=='def-ext' && !(value = rule['def-ext']))
                    value = E.def_ext;
            }
            else if (_if.main)
            {
                arg = opt.is_main;
                value = _if.main;
            }
            else
                continue;
            let cmp;
            switch (type)
            {
            case '==': cmp = arg==value; break;
            case '!=': cmp = arg!=value; break;
            case '=~': cmp = arg.match(value); break;
            case '!~': cmp = !arg.match(value); break;
            case '=a':
            case 'in': cmp = value.indexOf(arg)!=-1; break;
            case '!a':
            case 'not_in': cmp = value.indexOf(arg)==-1; break;
            case '=o': cmp = !!value[arg]; break;
            case '!o': cmp = !value[arg]; break;
            default: continue;
            }
            if (cmp)
            {
                return this.handle_then(_if.then, url, host, do_redir,
                    opt.exception, opt.orig_proxy);
            }
            if (_if['else'])
            {
                return this.handle_then(_if['else'], url, host, do_redir,
                    opt.exception, opt.orig_proxy);
            }
        }
        return this.handle_then(cmd.then, url, host, do_redir, opt.exception,
            opt.orig_proxy);
    }
    set_rule(name, rule, cmd, hosts){
        let add = prop=>{
            if (!cmd[prop])
                return;
            for (let i = 0; i<cmd[prop].length; i++)
            {
                let val = cmd[prop][i];
                hosts[prop][val] = (url, host, do_redir, opt)=>{
                    return this.host_cb(prop, rule, cmd, url, host, do_redir,
                        opt);
                };
            }
            return true;
        };
        let _cif = cmd['if'];
        if (_cif)
        {
            for (let i=0; i<_cif.length; i++)
            {
                let _if = _cif[i];
                if (_if.type=='=~' || _if.type=='!~')
                {
                    if (_if.host)
                        _if.host = new RegExp(_if.host);
                    else if (_if.url)
                        _if.url = new RegExp(_if.url);
                    else if (_if.ext)
                        _if.ext = new RegExp(_if.ext);
                }
            }
        }
        if (!cmd.hosts)
        {
            if (add('root_urls'))
                return;
            if (add('src_country'))
                return;
            if (add('proxy_country'))
                return;
            hosts.hosts['*'] = (url, host, do_redir, opt)=>{
                return this.host_cb(name, rule, cmd, url, host, do_redir, opt);
            };
            return;
        }
        for (let i=0; i<cmd.hosts.length; i++)
        {
            let _host = cmd.hosts[i], n;
            if (n = _host.match(regex_ip2))
            {
                if (!cmd.ips)
                    cmd.ips = [];
                let bits = 32 - (n[4] ? +n[4] : 32);
                if (bits<0)
                    bits = 0;
                let mask = inet_aton(n[1]) >>> bits << bits;
                hosts.ips.push({mask: mask, bits: bits,
                    func: (url, host, do_redir, exception)=>{
                        return this.host_cb(name, rule, cmd, url, host,
                            do_redir, exception);
                    }});
                continue;
            }
            hosts.hosts[_host] = (url, host, do_redir, opt)=>{
                return this.host_cb(name, rule, cmd, url, host, do_redir, opt);
            };
        }
    }
    parse_cmds(name, rule, rules, exceptions, by_rules){
        let cmds = rule.cmds;
        if (!cmds)
            return;
        for (let i=0; i<cmds.length; i++)
        {
            let cmd = cmds[i];
            if (cmd.rule)
            {
                let _name = cmd.rule;
                return this.parse_cmds(_name, rules[_name], rules, exceptions);
            }
            if (!cmd.hosts && !by_rules && !cmd.root_urls &&
                !cmd.src_country && !cmd.proxy_country || !cmd.then)
            {
                continue;
            }
            this.set_rule(name, rule, cmd, exceptions);
        }
    }
    parse_match(name, rule, rules, exceptions, by_rules){
        let match = rule.match;
        if (!match || !match.rules || !match.root_urls)
            return;
        let res = [];
        for (let i=0; i<match.rules.length; i++)
        {
            let ex, r = match.rules[i];
            res.push(ex = new Proxy_exceptions());
            this.parse_cmds(name, r, match, ex, by_rules);
            ex.fsrc_country = r.src_country;
            ex.fproxy_country = r.proxy_country;
        }
        match.root_urls.forEach(function(root_url){
            exceptions.match_root_url[root_url] = res; });
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

function c_unittest_push(ctx_id, roles, req, req_id, roles_id){
    if (arguments.length==2)
    {
        req = roles;
        roles = null;
    }
    let c;
    if (!(c=get_ctx(ctx_id)))
         return;
    if (!roles)
        return void c.unittest.push({s: req, req_id});
    roles_id = roles_id||++c.ids[roles];
    c.unittest.push({s: roles+roles_id+req, req_id, roles_id: roles_id});
}

function on_not_working(id, e){
    let c;
    if (gen_auto_unittest() && (c=get_ctx(id)))
        e.unittest = c.unittest.map(u=>u.s).slice(0, 300);
    api.perr({id: 'be_not_working_trigger', info: e,
        rate_limit: {count: 5, ms: date.ms.MIN}}, true);
}

function unittest_req_by_route(routes, roles, req){
    if (!gen_auto_unittest())
        return;
    try {
        if (!Array.isArray(routes))
            routes = [routes];
        var req_id = gen_stamp();
        ctx.forEach(c=>{
            if (c.routes.some(r=>routes.includes(r)))
                c_unittest_push(c.id, roles, req, req_id);
        });
        return req_id;
    }
    catch(e){ console.error(e); }
}

function unittest_resp_by_route(route, roles, resp, req_id){
    if (!gen_auto_unittest())
        return;
    try {
        ctx.forEach(c=>{
            if (!c.routes.includes(route))
                return;
            let req = c.unittest.find(u=>u.req_id==req_id);
            if (req)
                c_unittest_push(c.id, roles, resp, req_id, req.roles_id);
        });
    }
    catch(e){ console.error(e); }
}

function unittest_user_fix_it(opt)
{
    if (!gen_auto_unittest())
        return;
    try { c_unittest_push(opt.tab_id, 'fix_vpn('+JSON.stringify(opt)+')'); }
    catch(e){ console.error(e); }
}

function unittest_set_rule(opt)
{
    if (!gen_auto_unittest())
        return;
    try { c_unittest_push(opt.tab_id, 'set_rule('+JSON.stringify(opt)+')'); }
    catch(e){ console.error(e); }
}

function gen_auto_unittest(){
    let conf = CG('auto_unittest', {});
    return conf && conf.enable && ext_ver() && version_util.cmp(ext_ver(),
        conf.min_ver||'0.0.0')>=0 && E.is_conf_allowed(conf.on||100);
}

function get_conf(root, name, def){
    let conf = CG(root);
    if (conf && conf.min_ver && product_ver() &&
        version_util.cmp(product_ver(), conf.min_ver)>=0 &&
        E.is_conf_allowed(conf.on||100))
    {
        return zutil.get(conf, name, def);
    }
    return def;
}


function get_verify_conf(name, def){
    return get_conf('verify_proxy', name, def); }

function get_proxy_auth_conf(name, def){
    return get_conf('proxy_auth', name, def); }

function on_config_change(){
    if (!rules)
        init_rules();
}

var rules;
function init_rules(){
    return etask(function*init_rules_(){
        rules = yield api.storage.get('rules');
        if (!rules)
        {
            rules = {ver: ext_ver()};
            commit_rules();
        }
        if (rules.set)
            gen_rules(rules.set);
        if (zutil.is_mocha())
            E.t.rules = rules;
        E.emit('local_rules_set', rules.set);
    });
}

if (zutil.is_mocha())
{
    E.t = {cache_entry, choose_strategy, expected_types, extensions,
        strategies, Agents, get_api: ()=>api, ConnectivityCheck, find_agents,
        rules_fixup, zws, rules, get_strategy, Proxy_rules_engine};
    E.init();
}

return E; }); }());
