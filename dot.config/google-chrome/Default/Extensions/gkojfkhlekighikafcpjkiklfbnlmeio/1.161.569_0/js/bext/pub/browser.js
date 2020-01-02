// LICENSE_CODE ZON
'use strict'; 
define(['/util/etask.js', '/util/zerr.js', '/bext/pub/msg.js',
    '/bext/pub/backbone.js', '/bext/pub/chrome.js', 'underscore',
    '/util/version_util.js', '/bext/pub/transport.js',
    '/util/user_agent.js', '/util/util.js', '/bext/vpn/util/util.js'],
    function(etask, zerr, be_msg, be_backbone, be_chrome, _,
    version_util, be_transport, user_agent, zutil, be_vpn_util){
const chrome = window.chrome;
const is_tpopup = be_vpn_util.is_tpopup();
const use_msg = is_tpopup;
const use_backbone_over_msg = use_msg;
const bg = is_tpopup ? null : chrome.extension.getBackgroundPage();
const E = new (be_backbone.model.extend({
    model_name: 'browser',
    _defaults: function(){
        this.use_msg = use_msg;
        this.bg = bg;
        this.msg = new be_msg();
        this.on('destroy', ()=>E.uninit());
    },
}))();

if (zutil.is_mocha()) 
{
    chrome.browserAction = {setIcon: ()=>{}, setBadgeText: ()=>{},
        setBadgeBackgroundColor: ()=>{}};
    chrome.windows = {getLastFocused: ()=>{}, onFocusChanged: {
        addListener: ()=>{}, removeListener: ()=>{}}};
    chrome.storage = {local: {get: ()=>{}, set: ()=>{}, remove: ()=>{}}};
    chrome.tabs = {update: ()=>{}, reload: ()=>{}, query: ()=>{}, get: ()=>{},
        onFocusChanged: {addListener: ()=>{}, removeListener: ()=>{}},
        onCreated: {addListener: ()=>{}, removeListener: ()=>{}},
        onUpdated: {addListener: ()=>{}, removeListener: ()=>{}},
        onActivated: {addListener: ()=>{}, removeListener: ()=>{}},
        onRemoved: {addListener: ()=>{}, removeListener: ()=>{}},
        onReplaced: {addListener: ()=>{}, removeListener: ()=>{}},
    };
}

E.uninit = ()=>{
    if (!E.inited)
        return;
    if (zutil.is_mocha())
    {
        be_chrome.uninit();
        E.msg.uninit();
    }
    else
    {
        be_chrome._destroy();
        E.msg._destroy();
    }
    E.inited = false;
};

E.init = opt=>{
    if (E.inited)
        return;
    E.inited = true;
    E.browser_version = user_agent.guess_browser().version;
    E.os = user_agent.guess().os;
    opt = opt||{};
    E.msg.init(get_transport(),
        {context: opt.context!==undefined ? opt.context : {}});
    E.rpc = use_msg ? E.rpc_types.chrome_msg : E.rpc_types.chrome_native;
    E.rpc.init();
};

function get_transport(){
    if (is_tpopup)
    {
        return be_transport.tpopup(chrome,
            zutil.get(window, 'hola.tpopup_opt.tab_id'));
    }
    return be_transport.chrome_tabs(chrome);
}

function bvcmp(v){ return version_util.cmp(E.browser_version, v); }

E.rpc_types = {
    chrome_native: {
        init: function(){
            if (this.inited)
                return;
            this.inited = true;
            be_chrome.init(E.msg);
            be_chrome.impl.init();
            E.runtime.id = be_chrome.impl.id;
            E.runtime.url = be_chrome.impl.url;
            E.runtime.manifest = be_chrome.impl.manifest;
        },
        call_api: function(obj, sub, func, args, cb, ms, error_cb){
            var _this = this, _cb = !cb ? null : function(){
                E.runtime.last_error = _this.last_error =
                    chrome.runtime.lastError;
                return cb.apply(null, arguments);
            };
            return be_chrome.impl.call_api(obj, sub, func, args, _cb);
        },
        add_listener: (obj, sub, cb, opt, extra)=>
            be_chrome.impl.add_listener(obj, sub, cb, opt, extra),
        del_listener: (obj, sub, cb)=>
            be_chrome.impl.del_listener(obj, sub, cb),
    },
    chrome_msg: {
        init: function(){ 
            if (this.inited)
                return;
            this.inited = true;
            be_chrome.init(E.msg);
            E.rpc.call_api('impl', '', 'init', [], function(o){
                E.runtime.id = o.id;
                E.runtime.manifest = o.manifest;
                if (E.runtime.url = o.url)
                    return;
                E.runtime.url = chrome ? 'chrome-extension://'+o.id :
                    'resource://'+o.id.replace('@', '-at-').toLowerCase()
                    +'/hola_firefox_ext';
            });
        },
        call_api: function(obj, sub, func, args, cb, ms, error_cb){
            var _this = this;
            return E.msg.send({msg: 'call_api', obj: obj, sub: sub,
                func: func, args: args, has_cb: !!cb}, function(ret){
                if (!cb)
                    return;
                E.runtime.last_error = _this.last_error = ret.last_error;
                if (ret.error)
                {
                    if (error_cb)
                        error_cb(ret);
                    return;
                }
                cb.apply(null, ret.args);
            }, ms);
        },
        add_listener: (obj, sub, cb)=>E.msg.add_listener({obj, sub}, cb),
        del_listener: (obj, sub, cb)=>E.msg.del_listener({obj, sub}, cb),
    },
};
E.tabs = {
    disconnect: (tab_id, cb)=>{
        if (use_msg)
            return E.rpc.call_api('tabs', '', 'disconnect', [tab_id], cb);
        var m = E.msg;
        m.disconnect(tab_id);
        if (cb)
            cb();
    },
    is_connected: tab_id=>!!E.msg.tab_connections[tab_id],
    get_tab_connections: tab_id=>E.msg.tab_connections[tab_id],
};
E.runtime = {};

function get_backbone_obj(id){
    var main = bg && bg.be_bg_main; 
    return main && main.be_browser.backbone.server.obj[id];
}

E.backbone = {client: {obj: {}}, server: {obj: {}, cb: {}}};
E.backbone.client.ping = function(id, ms, cb){
    if (!use_backbone_over_msg)
    {
        if (get_backbone_obj(id))
            return be_vpn_util.set_timeout(()=>cb({}));
        be_vpn_util.set_timeout(()=>{
            const o = get_backbone_obj(id);
            cb(o ? {} : {error: 'no_object'});
        }, ms);
        return;
    }
    E.rpc.call_api('backbone', 'server', 'ping', [id], cb, ms, cb);
};
E.backbone.client.start = function(id){
    zerr.debug('backbone.client.start '+id);
    if (!use_backbone_over_msg)
        return get_backbone_obj(id);
    var o = this.obj[id], _this = this;
    zerr.assert(!o, 'client '+id+' already started');
    o = this.obj[id] = new be_backbone.model();
    E.msg.on_backbone_event = function(info){ 
        var o = _this.obj[info.id];
        if (!o)
            return;
        var ename = info.ename;
        if (ename.includes('change:'))
        {
            var attr = ename.replace('change:', ''), val = info.args[0];
            o.set(attr, val);
        }
        else
            o.trigger.apply(o, [ename].concat(info.args));
    };
    o.fcall = (func, args)=>E.rpc.call_api('backbone.server.obj.'+id,
        'fcall', func, args);
    o.ecall = (func, args)=>etask(function*(){
        const ret = yield etask.cb_apply(E.rpc, '.call_api',
            ['backbone.server.obj.'+id, 'ecall', func, args]);
        be_vpn_util.assert(!zutil.get(ret, '_error'),
            zutil.get(ret, '_error'));
        return ret;
    });
    E.rpc.call_api('backbone', 'server', 'connect', [id], function(ret){
        var o = _this.obj[id];
        if (!o)
            return zerr('client %s got connected after stop', id);
        if (ret.error)
            return zerr('backbone.client.start error: '+ret.error);
        o.set(ret.attributes);
        o.set('_backbone_client_started', true);
    });
    return o;
};
E.backbone.client.stop = function(id){
    zerr.debug('backbone.client.stop '+id);
    if (!use_backbone_over_msg)
        return;
    var o = this.obj[id];
    zerr.assert(o, 'client '+id+' not started');
    E.rpc.call_api('backbone', 'server', 'disconnect',
        [id, o.get('_backbone_client_id')]);
    o._destroy();
    delete this.obj[id];
};
E.backbone.server.start = function(obj, id){
    zerr.debug('backbone.server.start '+id+' cid '+obj.cid);
    zerr.assert(!this.obj[id], 'server '+id+' already started');
    this.obj[id] = obj;
};
E.backbone.server.stop = function(id){
    zerr.debug('backbone.server.stop '+id);
    var o = this.obj[id];
    zerr.assert(o, 'server '+id+' not started');
    delete this.obj[id];
};

return E; });
