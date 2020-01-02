// LICENSE_CODE ZON
'use strict'; 
(function(){
var define;
var is_node = typeof module=='object' && module.exports;
if (!is_node)
    define = self.define;
else
    define = require('../../../util/require_node.js').define(module, '../');
define(['jquery', 'underscore', '/util/etask.js',
    '/util/util.js', '/util/user_agent.js', '/util/storage.js'],
    function($, _, etask, zutil, user_agent, storage){
var assign = Object.assign;
var port_no_load_from_storage = 1;
function port_get(){
    var is_dev;
    try { is_dev = storage.get_json('hola_opts').developer_mode; } catch(err){}
    if (port_no_load_from_storage || is_dev)
        return;
    try { return storage.get_int('svc_ipc_port'); } catch(err){}
}

function port_set(port, up, info){
    if (up)
        return void (E.port_up = port||undefined);
    if (!port)
    {
        try { storage.clr('svc_ipc_port'); } catch(err){}
        delete E.svc_port;
        return;
    }
    try { storage.set('svc_ipc_port', port); } catch(err){}
    E.svc_port = port;
    E.svc_has_ssl = port && info && info.ssl;
}
var ua = user_agent.guess_browser();
var is_ie = ua.browser=='ie';
var is_firefox = ua.browser=='firefox';
var E = {
    svc_ports: [6880, 6881, 6882, 6883, 6884, 6885, 6886, 6887, 6888, 6889],
    up_ports: [6890, 6891, 6892, 6893, 6894, 6895, 6896, 6897, 6898, 6899]
};
E.svc_port = port_get();
E.svc_has_ssl = false;
E.up_port = undefined;
E.load_port_from_storage = function(){
    port_no_load_from_storage = 0;
    E.svc_port = port_get();
};

function Eport(up){
    return up ? E.up_port : E.svc_port; }

function Eports(up){
    return up ? E.up_ports : E.svc_ports; }

function get_url(cmd, opt){
    opt = opt||{};
    var https = location.protocol=='https:' && opt.https;
    return (https ? 'https://localhost.h-local.org' : 'http://127.0.0.1')+':'+
        (opt.port||Eport(opt.up))+'/'+cmd;
}

function exe2order(e){
    if (e.os_ver=='NaCl')
        return 1;
    if (/^hola_updater/.test(e.exe))
        return 1;
    if (/^hola_svc/.test(e.exe))
        return 2;
    if (/^hola_plugin/.test(e.exe))
        return 3;
    return 0;
}

function cache_str_fn2(fn){
    var cache = {};
    return function(s1, s2){
        var cache2 = cache[s1] = cache[s1]||{};
        if (s2 in cache2)
            return cache2[s2];
        return cache2[s2] = fn(s1, s2);
    };
}
var version_cmp = cache_str_fn2(function(v1, v2){
    if (!v1 || !v2)
        return +!!v1 - +!!v2;
    var _v1 = v1.split('.'), _v2 = v2.split('.'), i;
    for (i = 0; i<_v1.length && i<_v2.length && +_v1[i] == +_v2[i]; i++);
    if (_v1.length==i || _v2.length==i)
        return _v1.length - _v2.length;
    return +_v1[i] - +_v2[i];
});

var sp_find_port;
E.find_port = function(up){
    var opt = {dataType: 'json', cache: false, no_throw: 1,
        timeout: is_ie || is_firefox ? 2000 : 500};
    var q = [];
    return etask({cancel: true}, [function(){
        if (sp_find_port)
            return this.loop(sp_find_port);
        sp_find_port = this;
    }, function try_catch$(){
        if (Eport(up))
            return this.return(Eport(up));
    }, function try_catch$(){
        var _this = this;
        _.each(Eports(up), function(port){
            var sp;
            _this.spawn((sp=post(get_url('callback.json?find_port=1',
                {port: port, up: up}), opt)));
            sp.data = sp.data ? sp.data : {};
            sp.data.port = port;
            q.push(sp);
        });
        return etask.all(q);
    }, function(arr){
        var best, port;
        _.each(arr, function(e, i){
            if (!e.ret || e.ret.error)
                return;
            if (!best)
            {
                best = e;
                port = q[i].data.port;
                return;
            }
            var e_order = exe2order(e.ret);
            var best_order = exe2order(best.ret);
            if (e_order<best_order || e_order==best_order
                && version_cmp(e.ret.ver, best.ret.ver)<=0)
            {
                return;
            }
            best = e;
            port = q[i].data.port;
        });
        port_set(port, up, best&&best.ret);
        if (!best)
            return this.return(undefined);
        return this.return(port);
    }, function finally$(){
        if (this==sp_find_port)
            sp_find_port = null;
    }]);
};

E.init = function(port){
    return etask([function(){
        if (port)
        {
            port_set(port);
            return port;
        }
        return E.find_port();
    }, function(port){
        if (!port)
            return -1;
        return 0;
    }]);
};

function post(url, opt){
    opt = opt||{};
    if (typeof url==='object')
        opt = url;
    else if (typeof url==='string')
    {
        opt = zutil.clone(opt);
        opt.url = url;
    }
    var xhr;
    return etask([function(){
        return xhr = $.ajax(assign({}, opt, {method: 'POST'}));
    }, function catch$(err){
        if (opt.no_throw)
        {
            return this.return({xhr: xhr,
                ret: {error: xhr.statusText||'no_status'}});
        }
        throw new Error(xhr.statusText);
    }, function(ret){
        if (this.error)
            return this.throw(this.error);
        return {xhr: xhr, ret: ret};
    }]);
}

E.ajax = function(_opt){
    var cmd, timeout = 500, up;
    var opt = {dataType: 'json', cache: false, no_throw: 1};
    if (typeof _opt=='string')
        cmd = _opt;
    else if (typeof _opt=='object')
    {
        cmd = _opt.cmd;
        opt.data = _opt.data;
        timeout = _opt.timeout||timeout;
        up = _opt.up;
    }
    var tested, q = [];
    if (timeout>-1)
        opt.timeout = timeout;
    return etask([function try_catch$ajax(){
        if (Eport(up))
            return post(get_url(cmd, {up: up}), opt);
        return this.goto('find_port');
    }, function(res){
        var error = res.ret && res.ret.error;
        if (error && tested)
            throw new Error(error);
        if (error)
        {
            port_set(0);
            return this.goto('find_port');
        }
        return this.return(res);
    }, function try_catch$find_port(){
        return E.find_port(up);
    }, function(port){
        if (!port)
            throw new Error('none_found');
        tested = 1;
        return this.goto('ajax');
    }]);
};

E.hola_br_start = function(opt){
    return E.ajax({cmd: 'hola_browser_start.json',
        data: {args: '"'+(opt.url||'https://hola.org')+'"'}});
};

E.ext = {};
function test_img(links){
    return etask([function(){
        var _this = this, errs = 0;
        _.each(links, function(e, i){
            $('<img>').load(function(){ this.return(); }.bind(_this))
            .error(function(){
                errs++;
                if (errs==links.length)
                    this.throw('ext not found'); }.bind(_this))
            .attr('src', e+'?rc='+Date.now());
        });
        return this.wait(1000);
    }]);
}

E.ext.lean_ping = function(){
    if (!window.chrome)
    {
        return test_img(['resource://ff_ext-at-hola-dot-org/'
            +'hola_firefox_ext/data/img/logo.png',
            'resource://jid1-4p0kohsjxu1qgg-at-jetpack/'
            +'hola_firefox_ext/data/img/logo.png',
            'resource://jid1-4p0kohsjxu1qgg-at-jetpack/icon.png',
            ]);
    }
    var old = 'chrome-extension://gkojfkhlekighikafcpjkiklfbnlmeio/icon.png';
    var _new = 'chrome-extension://mhcmfkkjmkcfgelgdpndepmimbmkbpfp/icon.png';
    return etask({name: 'lean_check_ext'}, [function(){
        return etask.all({allow_fail: true},
            {old: test_img([old]), _new: test_img([_new])});
    }, function(e){
        if (etask.is_err(e.old) && etask.is_err(e._new))
            throw e._new.error;
    }]);
};

return E; }); }());
