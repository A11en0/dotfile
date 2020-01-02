// LICENSE_CODE ZON
'use strict'; 
define(['underscore', '/util/etask.js', '/bext/pub/backbone.js',
    '/util/zerr.js', '/util/util.js', '/util/user_agent.js', 'conf',
    '/bext/vpn/util/util.js'],
    function(_, etask, be_backbone, zerr, zutil, user_agent, conf, be_vpn_util)
{
const chrome = !be_vpn_util.is_tpopup() && window.chrome;
const noop = ()=>{};
const E = new (be_backbone.model.extend({
    model_name: 'chrome',
    _defaults: function(){ this.on('destroy', function(){ E.uninit(); }); },
}))();

E.init = msg=>{
    if (E.inited || !be_vpn_util.is_bg())
        return;
    E.inited = true;
    E.listeners = {'': {}};
    E.msg = msg;
    E.msg.on_req = on_req;
    E.msg.on_add_listener = on_add_listener;
    E.msg.on_del_listener = on_del_listener;
    E.msg.on_connect = on_connect;
    E.msg.on_disconnect = on_disconnect;
};

E.uninit = ()=>{
    if (!E.inited)
        return;
    E.msg.on_req = undefined;
    E.msg.on_add_listener = undefined;
    E.msg.on_del_listener = undefined;
    E.msg.on_connect = undefined;
    E.msg.on_disconnect = undefined;
};

function on_req(j){
    var req = j.msg;
    switch (req.msg)
    {
    case 'call_api':
	var cb = !req.has_cb ? null : function(){
	    E.msg.resp(j, {args: _.toArray(arguments),
		last_error: !chrome ? 0 : chrome.runtime.lastError});
	};
	E.impl.call_api(req.obj, req.sub, req.func, req.args, cb, j);
	if (!req.has_cb)
	    E.msg.resp(j, {args: []});
	break;
    }
}

function on_add_listener(j){
    var req = j.msg, id = j.id, cid = j._connection_id||'';
    var cb = function(){ E.msg.send_event(j, _.toArray(arguments)); };
    cb.__j = j;
    var l = E.listeners[cid];
    if (!l)
        return zerr('add: listeners for '+cid+' not inited');
    zerr.assert(!l[id], 'add: listener '+id+' already exists');
    l[id] = cb;
    E.impl.add_listener(req.obj, req.sub, cb);
}

function on_del_listener(j){
    var req = j.msg, id = j.id, cid = j._connection_id||'';
    var l = E.listeners[cid];
    if (!l)
        return zerr('del: listeners for '+cid+' not inited');
    var cb = l[id];
    zerr.assert(cb, 'del: listener '+id+' not found');
    E.impl.del_listener(req.obj, req.sub, cb);
    delete l[id];
}

function on_connect(cid){
    if (E.listeners[cid])
        return zerr('connect: listeners for '+cid+' already inited');
    E.listeners[cid] = {};
}

function on_disconnect(cid){
    var l = E.listeners[cid];
    if (!l)
        return zerr('disc: listeners for '+cid+' not inited');
    _.each(zutil.clone(l), function(e, i){
        var t;
        if (t = e.__j)
            on_del_listener(t);
        else if (t = e.__backbone)
            del_backbone_listener(t.id, cid, t.backbone_client_id);
    });
    zerr.assert(_.isEmpty(l), 'listeners not empty');
    delete E.listeners[cid];
}

function del_backbone_listener(id, connection_id, backbone_client_id){
    var o = get_backbone_obj(id);
    var l = E.listeners[connection_id];
    if (!l)
    {
        return zerr('del_backbone: listeners for '+connection_id+
            ' not inited');
    }
    var cb = l[backbone_client_id];
    delete l[backbone_client_id];
    if (!o)
        return;
    E.stopListening(o, 'all', cb);
}

function join_dot(obj, sub, func){ return _.compact(arguments).join('.'); }

function get_obj(root, obj, sub){
    let a = obj.split('.').concat(sub||[]), o = root, i;
    for (i=0; i<a.length && o; i++)
        o = o[a[i]];
    return i<a.length ? null : o;
}

function get_backbone_obj(id){
    var main = window.be_bg_main;
    return main && main.be_browser.backbone.server.obj[id];
}

function perr(opt, new_name){
    let perr_func = zutil.get(window, 'be_bg_main.be_lib.perr_err');
    if (perr_func)
	return perr_func(opt, new_name);
    zerr('perr '+opt.id+' '+(opt.info ? opt.info : '')+
        (opt.err ? '\n'+zerr.e2s(opt.err) : ''));
}

let sent;
function _perr(obj, sub, func, args, err){
    if (sent)
        return console.error('skip be_msg_err %s', err);
    var err_info = err ? err.hola_info : undefined;
    perr({id: 'be_msg_err', info: {method: join_dot(obj, sub, func),
            args: args, err_info: err_info}, err: err});
    sent = true;
}

E.impl = {};
E.impl.init = function(){
    if (this.inited)
        return;
    this.inited = true;
    if (!chrome)
        return;
    this.id = chrome.runtime.id;
    this.url = chrome.runtime.getURL('').slice(0, -1);
    this.manifest = chrome.runtime.getManifest();
};
E.impl['impl.init'] = chrome && function(args, cb){
    this.init(); 
    if (cb)
        cb({id: this.id, url: this.url, manifest: this.manifest});
};
E.impl['tpopup.set_dont_show_again'] = function(args){
    if (!window.be_bg_main || !window.be_bg_main.be_info)
        return zerr('no be_bg_main or be_info');
    window.be_bg_main.be_info.set_dont_show_again(args[0]);
};
E.impl['tpopup.send_tpopup_msg'] = function(args){
    chrome.tabs.sendMessage(args[0], args[1]);
};
E.impl['tpopup.trigger'] = function(args){
    if (!window.be_bg_main || !window.be_bg_main.be_tpopup)
        return;
    window.be_bg_main.be_tpopup.trigger(args[0], args[1]);
};
E.impl['tpopup.perr'] = function(args){ perr(args[1], true); };
E.impl['backbone.server.connect'] = function(args, cb, j){
    cb = cb||noop;
    var id = args[0], o = get_backbone_obj(id), cid = j._connection_id||'';
    if (!o)
        return;
    var attr = o.attributes;
    var bcid = attr._backbone_client_id = _.uniqueId('bbl');
    var l = E.listeners[cid];
    if (!l)
        return zerr('connect: listeners for '+cid+' not inited');
    zerr.assert(!l[bcid], 'backbone listener for'+bcid+' already exists');
    var _cb = l[bcid] = function(ename){
        var _args = [];
        if (ename.includes('change:'))
            _args = [o.get(ename.replace('change:', ''))];
        else if (ename!='change')
            _args = [].slice.call(arguments, 1);
        E.msg.send_backbone_event(j, {id, ename, args: _args});
    };
    _cb.__backbone = {id: id, backbone_client_id: bcid};
    E.listenTo(o, 'all', _cb);
    cb({attributes: attr});
};
E.impl['backbone.server.disconnect'] = function(args, cb, j){
    del_backbone_listener(args[0], j._connection_id||'', args[1]);
    if (cb)
        cb({});
};
E.impl['backbone.server.ping'] = function(args, cb, j){
    cb = cb||noop;
    var id = args[0], o = get_backbone_obj(id);
    if (o)
        cb({});
};
E.impl.call_api = function(obj, sub, func, args, cb, j){
    try {
	var o;
	if (obj.startsWith('backbone.server.obj.'))
	{
            cb = cb||noop;
	    var id = obj.replace('backbone.server.obj.', '');
	    o = get_backbone_obj(id);
	    if (!o)
		return;
	    if (sub=='ecall')
	    {
		return etask([function(){ return o.ecall(func, args);
		}, function(){ cb.apply(null, arguments);
		}, function catch$(err){
                    cb({_error: ''+err});
                    _perr(obj, sub, func, args, err);
                }]);
	    }
	    o[sub].call(o, func, args);
            cb({});
	    return;
	}
        var s = join_dot(obj, sub, func);
        if (_.isFunction(this[s]))
        {
            if (zerr.is.info())
                zerr.info(s+'('+zerr.json(args).substr(0, 100)+')');
            return void this[s].call(this, args, cb, j);
        }
        o = get_obj(chrome, obj, sub);
        if (!o || !o[func])
            return _perr(obj, sub, func, args, new Error('not found'));
	return o[func].apply(o, args.concat(cb||[]));
    } catch(e){ _perr(obj, sub, func, args, e); }
};
E.impl.add_listener = function(obj, sub, cb, opt, extra){
    try {
        var s = join_dot(obj, sub, 'add_listener');
        if (_.isFunction(this[s]))
        {
            zerr.info(s+'()');
            return void this[s].call(this, cb, opt, extra);
        }
        var o = get_obj(chrome, obj, sub);
        if (!o || !o.addListener)
            return _perr(obj, sub, 'add_listener', new Error('not found'));
        if (!opt)
            return o.addListener(cb);
        o.addListener(cb, opt, extra);
    } catch(e){
        _perr(obj, sub, 'add_listener', {opt, extra}, e); }
};
E.impl.del_listener = function(obj, sub, cb){
    try {
        var s = join_dot(obj, sub, 'del_listener');
        if (_.isFunction(this[s]))
        {
            zerr.info(s+'()');
            return void this[s].call(this, cb);
        }
        var o = get_obj(chrome, obj, sub);
        if (!o || !o.removeListener)
            return _perr(obj, sub, 'del_listener');
        o.removeListener(cb);
    } catch(e){ _perr(obj, sub, 'del_listener', [], e); }
};

return E; });
