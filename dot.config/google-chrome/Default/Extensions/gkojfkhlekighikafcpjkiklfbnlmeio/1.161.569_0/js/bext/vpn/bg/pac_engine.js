// LICENSE_CODE ZON
'use strict'; 
(function(){
var define;
var is_node = typeof module=='object' && module.exports && module.children;
if (!is_node)
    define = self.define;
else
    define = require('../../../util/require_node.js').define(module, '../');
define(['/util/browser.js'], function quine(zbrowser){

var E = {};
E.def_ext = ['gif', 'png', 'jpg', 'mp3', 'css', 'mp4', 'wmv', 'flv', 'swf',
    'mkv', 'ico', 'f4v', 'h264', 'webp', 'webm', 'ts'];

var g_pac_engine = {};
var g_log = [];

function log(){
    var args = Array.from(arguments).map(function(o){
        return JSON.stringify(o); });
    var text = new Date().toISOString()+' '+args.join(' ');
    if (typeof browser!='undefined' && browser.runtime)
        browser.runtime.sendMessage({id: 'pac_log', data: text});
    else if (typeof alert!='undefined')
        alert(text);
    g_log.push(text);
    if (g_log.length > 256) 
        g_log.splice(0, g_log.length/2);
}

function pac_redir(url, host, do_redir){
    if (!do_redir || !g_pac_engine.redir_direct)
        return {proxy: false, str: 'DIRECT'};
    if (zbrowser.isPlainHostName(host))
        return {proxy: false, str: 'DIRECT'};
    var m = url.match(/^.+:([0-9]+)\/.*$/);
    if (m && m.length==2 && m[1]!='80')
        return {proxy: false, str: 'DIRECT'};
    if (url.match(/^https:.*$/))
        return {proxy: false, str: 'DIRECT'};
    return {proxy: false,
        str: 'PROXY 127.0.0.1:'+g_pac_engine.redir_port+'; DIRECT'};
}

function get_ext(url){
    var ext = '', index = url.indexOf('?');
    if (index>=0)
        url = url.slice(0, index);
    var ext_index = url.lastIndexOf('.', url.length);
    var _ext_index = url.lastIndexOf('/', url.length);
    if (ext_index>=0 && ext_index>_ext_index)
        ext = url.slice(ext_index+1);
    else if (_ext_index>=0)
        ext = url.slice(_ext_index+1);
    return ext;
}

var regex_ip = /^\d+\.\d+\.\d+\.\d+$/;
function is_ip(host){ return regex_ip.test(host); }

function handle_then(value, url, host, do_redir, exception, orig_proxy){
    if (value=='DIRECT')
        return pac_redir(url, host, do_redir);
    var n = value.split(' ');
    if (exception && n[0]=='PROXY')
    {
        if (n.length==1)
            return null;
        if (!n[1].indexOf('XX') && orig_proxy)
        {
            var c = orig_proxy.split(' ')[1].split('.')[0];
            return {proxy: true, str: 'PROXY '+n[1].replace('XX', c)};
        }
    }
    if (n.length<2)
        return pac_redir(url, host, do_redir);
    else if (!{PROXY: 1, SOCKS: 1, SOCKS5: 1, HTTPS: 1}[n[0]])
        return pac_redir(url, host, do_redir);
    if (g_pac_engine.ext)
        return {proxy: true, str: value};
    return {proxy: true, str: 'PROXY 127.0.0.1:'+g_pac_engine.proxy_port};
}

function host_cb(name, rule, cmd, url, host, do_redir, opt){
    if (!cmd['if'])
    {
        if (cmd.dst_dns)
        {
            return handle_then(cmd.then, url, host, do_redir, opt.exception,
                opt.orig_proxy);
        }
        cmd['if'] = [];
    }
    var ext = get_ext(url);
    for (var i=0; i<cmd['if'].length; i++)
    {
        var _if = cmd['if'][i];
        var arg = null, value = null;
        var type = '==';
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
        var cmp;
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
            return handle_then(_if.then, url, host, do_redir, opt.exception,
                opt.orig_proxy);
        }
        if (_if['else'])
        {
            return handle_then(_if['else'], url, host, do_redir,
                opt.exception, opt.orig_proxy);
        }
    }
    return handle_then(cmd.then, url, host, do_redir, opt.exception,
        opt.orig_proxy);
}

var regex_inet = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
function inet_aton(str){
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
}

function add(name, rule, cmd, hosts){
    if (!cmd[name])
        return;
    for (var i = 0; i<cmd[name].length; i++)
    {
        var val = cmd[name][i];
        hosts[name][val] = function(url, host, do_redir, opt){
            return host_cb(name, rule, cmd, url, host, do_redir, opt); };
    }
    return true;
}

var regex_ip2 = /^((\d{1,3}\.){3}\d{1,3})(\/(\d+))?$/;
function set_rule(name, rule, cmd, hosts){
    var _cif = cmd['if'], i;
    if (_cif)
    {
        for (i=0; i<_cif.length; i++)
        {
            var _if = _cif[i];
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
        if (add('root_urls', rule, cmd, hosts))
            return;
        if (add('src_country', rule, cmd, hosts))
            return;
        if (add('proxy_country', rule, cmd, hosts))
            return;
        hosts.hosts['*'] = function(url, host, do_redir, opt){
            return host_cb(name, rule, cmd, url, host, do_redir, opt); };
        return;
    }
    for (i=0; i<cmd.hosts.length; i++)
    {
        var _host = cmd.hosts[i], n;
        if (n = _host.match(regex_ip2))
        {
            if (!cmd.ips)
                cmd.ips = [];
            var bits = 32 - (n[4] ? +n[4] : 32);
            if (bits<0)
                bits = 0;
            var mask = inet_aton(n[1]) >>> bits << bits;
            hosts.ips.push({mask: mask, bits: bits,
                func: function(url, host, do_redir, exception){
                    return host_cb(name, rule, cmd, url, host, do_redir,
                        exception);
                }});
            continue;
        }
        hosts.hosts[_host] = function(url, host, do_redir, opt){
            return host_cb(name, rule, cmd, url, host, do_redir, opt); };
    }
}

function parse_cmds(name, rule, rules, hosts, by_rules){
    var cmds = rule.cmds;
    if (!cmds)
        return;
    for (var i=0; i<cmds.length; i++)
    {
        var cmd = cmds[i];
        if (cmd.rule)
        {
            var _name = cmd.rule;
            return parse_cmds(_name, rules[_name], rules, hosts);
        }
        if (!cmd.hosts && !by_rules && !cmd.root_urls && !cmd.src_country &&
            !cmd.proxy_country || !cmd.then)
        {
            continue;
        }
        set_rule(name, rule, cmd, hosts);
    }
}
function parse_match(name, rule, rules, hosts, by_rules){
    var match = rule.match;
    if (!match || !match.rules || !match.root_urls)
        return;
    var res = [];
    for (var i=0; i<match.rules.length; i++)
    {
        var ex, r = match.rules[i];
        res.push(ex = get_exceptions());
        parse_cmds(name, r, match, ex, by_rules);
        ex.fsrc_country = r.src_country;
        ex.fproxy_country = r.proxy_country;
    }
    match.root_urls.forEach(function(root_url){
        hosts.match_root_url[root_url] = res; });
}
function hex_decode(h){
    var s = '';
    for (var i = 0; i < h.length; i+=2)
        s += String.fromCharCode(parseInt(h.substr(i, 2), 16));
    return s;
}
var local_resp = {proxy: 0, str: 'PROXY 127.0.0.1:0'};
var regex_set_url = /^http:\/\/(.*).local.hola\/?$/;
function local_hola_cb(url){
    var n;
    try {
        if (n = url.match(regex_set_url))
            n = JSON.parse(hex_decode(n[1]));
    } catch(e){ n = null; }
    if (!n || n.key!=g_pac_engine.key)
        return local_resp;
    if (!g_pac_engine.local_redir)
    {
        g_pac_engine.local_redir = {};
        g_pac_engine.local_counter = 0;
    }
    if (n.cleanup)
    {
        for (var i in g_pac_engine.local_redir)
        {
            if (g_pac_engine.local_redir[i].rule_name==n.rule_name)
                delete g_pac_engine.local_redir[i];
        }
        return local_resp;
    }
    var set = n.set;
    var proxy = n.proxy;
    var entry = g_pac_engine.local_redir[set];
    if (!entry || entry.proxy != proxy)
        entry = g_pac_engine.local_redir[set] = {proxy: proxy};
    entry.ts = Date.now();
    entry.rule_name = n.rule_name;
    return local_resp;
}

function get_exceptions(){
    var e = {ips: [], match_root_url: {}};
    var rule_props = ['hosts', 'root_urls', 'src_country', 'proxy_country'];
    rule_props.forEach(function(name){
        e[name] = {};
        e[name+'_cache'] = {};
        e[name+'_counter'] = 0;
    });
    return e;
}

function parse(rules, exceptions){
    if (!rules)
        return;
    for (var i in rules)
    {
        var rule = rules[i];
        var fn = rule.match ? parse_match : parse_cmds;
        fn(i, rule, rules, exceptions);
    }
}

E.init = function(json, options){
    options = options||{};
    g_pac_engine = {
        hosts: {
            hosts: {},
            ips: [],
            hosts_cache: {},
            hosts_counter: 0,
        },
        exceptions: get_exceptions(),
        exceptions_plus: get_exceptions(),
        ext: options.ext||0,
        by_rules: options.by_rules||0,
        do_redir: options.do_redir||0,
        redir_direct: options.redir_direct===undefined || options.redir_direct,
        proxy_port: options.proxy_port||6857,
        redir_port: options.redir_port||6850,
        key: options.key,
        inited: true,
        rule_cleanup_ms: options.rule_cleanup_ms||30000,
    };
    if (!json.unblocker_rules)
        return -1;
    var rules = json.unblocker_rules, rule, i;
    if (!g_pac_engine.by_rules)
    {
        for (i in rules)
        {
            rule = rules[i];
            if (rule.internal || g_pac_engine.ext && !rule.enabled)
                continue;
            parse_cmds(i, rule, rules, g_pac_engine.hosts);
        }
    }
    else
    {
        g_pac_engine.rules = {};
        for (i in rules)
        {
            rule = rules[i];
            if (rule.internal || g_pac_engine.ext && !rule.enabled)
                continue;
            if (!rule.root_url)
            {
                parse_cmds(i, rule, rules, g_pac_engine.hosts);
                continue;
            }
            if (!rule.cmds)
                continue;
            g_pac_engine.rules[i] = {hosts: {}, ips: [], hosts_cache: {},
                hosts_counter: 0};
            parse_cmds(i, rule, rules, g_pac_engine.rules[i], 1);
        }
    }
    g_pac_engine.hosts.hosts['local.hola'] = local_hola_cb;
    g_pac_engine.hosts.hosts['127.255.255.255'] = function(url, host){
        return {proxy: 0, str: 'PROXY '+host+':0'}; };
    parse(json.unblocker_globals, g_pac_engine.exceptions);
    parse(json.unblocker_plus, g_pac_engine.exceptions_plus);
    return 0;
};

E.firefox_init = function(browser){
    browser.runtime.onMessage.addListener(function(msg){
        switch (msg.id)
        {
        case 'init': E.init(msg.json, msg.options); break;
        }
    });
    browser.runtime.sendMessage({id: 'init', from_pac_script: true});
};

function find_proxy_for_val(url, host, hosts, opt){
    opt = opt||{};
    if (!opt.name || !opt.val)
        return;
    var do_redir = g_pac_engine.do_redir;
    var cache = opt.name+'_cache', counter = opt.name+'_counter';
    if (hosts[cache])
    {
        var c = hosts[cache][opt.val];
        if (c && c.func)
            return c.func(url, host, do_redir, opt);
        if (c)
            return pac_redir(url, host, do_redir);
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

function find_proxy_for_url(url, host, hosts, opt){
    opt = opt||{};
    var do_redir = g_pac_engine.do_redir;
    if (hosts.hosts_cache)
    {
        var c = hosts.hosts_cache[host];
        if (c && c.func)
            return c.func(url, host, do_redir, opt);
        if (c)
            return pac_redir(url, host, do_redir);
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
    return pac_redir(url, host, do_redir);
}

var regex_set = /^__hola__\.set\.(.*\.local\.hola)$/;
var regex_trigger = /^(.*)\.trigger\.hola\.org$/;
E.FindProxyForURL = function(url, host){
    var pac = g_pac_engine, locals = pac.local_redir, ret, m;
    if (!pac.inited)
        return 'DIRECT';
    if (host[0]=='_') 
    {
        if (m = host.match(regex_set))
        {
            host = 'local.hola';
            url = 'http://'+m[1]+'/';
        }
        else if (host=='__hola__.pac_get_log.local.hola')
        {
            var prev = g_log;
            g_log = [];
            throw new Error('pac_get_log ['+prev.join('\n')+']');
        }
    }
    else if (host.substr(host.length-16, 16)=='trigger.hola.org' &&
        host.match(regex_trigger))
    {
        host = host.replace('.trigger.hola.org', '');
    }
    if (locals && host!='local.hola')
    {
        var then = locals[url];
        if (then)
        {
            ret = handle_then(then.proxy, url, host, pac.do_redir);
            if (ret)
                then.ts = Date.now();
        }
        pac.local_counter++;
        if (!(pac.local_counter%1000))
        {
            var cur_ts = Date.now();
            for (var i in locals)
            {
                var local = locals[i];
                if (cur_ts-local.ts>pac.rule_cleanup_ms)
                    delete locals[i];
            }
            pac.local_counter = 0;
        }
    }
    if (!ret)
        ret = find_proxy_for_url(url, host, pac.hosts);
    if (ret.proxy)
    {
        var ex = find_proxy_for_url(url, host, pac.exceptions,
            {exception: 1, orig_proxy: ret.str});
        if (ex)
            ret = ex;
    }
    if (!ret.str || typeof ret.str!='string')
    {
        var str = 'url '+url+'; host '+host+'; str '+ret.str+';';
        try { str += ' json '+JSON.stringify(ret.str)+';'; }
        catch(e){ str += ' json_err '+e+';'; }
        throw new Error('INVALID_RET '+str);
    }
    return ret.str;
};

E.set_key = function(key){ g_pac_engine.key = key; };

E.find_proxy_for_url_rule = function(rule, url, host, is_main, no_global){
    var pac = g_pac_engine, ret;
    if (host.match(/^(.*)\.trigger\.hola\.org/))
    {
        host = host.replace('.trigger.hola.org', '');
        url = url.replace('.trigger.hola.org', '');
    }
    var r = pac.rules && rule ? pac.rules[rule] : pac.hosts;
    if (!r)
        return 'DIRECT';
    ret = find_proxy_for_url(url, host, r, {is_main: is_main});
    if (ret.proxy && !no_global)
    {
        var ex = find_proxy_for_url(url, host, pac.exceptions,
            {exception: 1, orig_proxy: ret.str});
        if (ex)
            ret = ex;
    }
    return ret.str;
};

function find_proxy_for_url_exception_int(url, host, rules, orig, opt){
    var ret = find_proxy_for_url(url, host, rules, {exception: 1,
        orig_proxy: orig});
    if (!ret && opt.root_url)
    {
        ret = find_proxy_for_val(url, host, rules, {name: 'root_urls',
            val: opt.root_url, orig_proxy: orig, exception: 1});
    }
    if (!ret && opt.src_country)
    {
        ret = find_proxy_for_val(url, host, rules, {name: 'src_country',
            val: opt.src_country, orig_proxy: orig, exception: 1});
    }
    if (!ret && opt.proxy_country)
    {
        ret = find_proxy_for_val(url, host, rules, {name: 'proxy_country',
            val: opt.proxy_country, orig_proxy: orig, exception: 1});
    }
    return ret;
}

function find_proxy_for_match(url, host, rules, orig, opt){
    opt = opt||{};
    var mr, mrules;
    if (!rules.match_root_url || !opt.root_url ||
        !(mrules = rules.match_root_url[opt.root_url]))
    {
        return opt.orig_proxy;
    }
    mr = mrules.find(function(r){
        return (!r.fsrc_country||r.fsrc_country.includes(opt.src_country)) &&
            (!r.fproxy_country||r.fproxy_country.includes(opt.proxy_country));
    });
    if (mr)
        return find_proxy_for_url_exception_int(url, host, mr, orig, opt);
}

E.find_proxy_for_url_exception = function(url, host, orig, opt){
    if (!g_pac_engine.inited)
        return orig;
    opt = opt||{};
    var rules = opt.is_trial||opt.premium ? g_pac_engine.exceptions_plus :
        g_pac_engine.exceptions;
    var ret;
    if (!(ret = find_proxy_for_match(url, host, rules, orig, opt)))
        ret = find_proxy_for_url_exception_int(url, host, rules, orig, opt);
    return ret ? ret.str : orig;
};

E.t = {
    global_var: function(){ return g_pac_engine; },
    pac_redir: pac_redir,
    get_ext: get_ext,
};

E.gen_pac = function(json, options){
    return 'var pac_engine = ('+quine+')({\n'
        +'    isInNet: isInNet, isPlainHostName: isPlainHostName});\n'
        +'function FindProxyForURL(url, host){\n'
        +'    return pac_engine.FindProxyForURL(url, host);\n'
        +'}\n'
        +'pac_engine.dns_resolver = dnsResolve;\n'
        +'pac_engine.init('+JSON.stringify(json)+', '
            +JSON.stringify(options)+');\n';
};

E.gen_firefox_pac = function(){
    return 'var pac_engine = ('+quine+')({});\n'
        +'function FindProxyForURL(url, host){\n'
        +'    return pac_engine.FindProxyForURL(url, host);\n'
        +'}\n'
        +'pac_engine.firefox_init(browser);\n';
};

return E; }); })();
