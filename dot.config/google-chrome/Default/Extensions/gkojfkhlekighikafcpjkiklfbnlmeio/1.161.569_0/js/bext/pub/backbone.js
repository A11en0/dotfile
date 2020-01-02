// LICENSE_CODE ZON
'use strict'; 
define(['underscore', 'backbone', '/bext/vpn/util/util.js', 'zon_config',
    '/util/etask.js', '/util/util.js'],
    function(_, Backbone, be_vpn_util, zconf, etask, zutil){
const listener_prefix = 'l'+(be_vpn_util.is_bg() ? 'b' : 'p');
const E = {};

function _destroy(o){
    try { o.destroy(); }
    catch(err){
        try { console.error('error in destroy %s', err.stack||err); }
        catch(_err){}
        throw err;
    }
}

E.model = Backbone.Model.extend({
    defaults: function(){
        this._listenerId = _.uniqueId(listener_prefix);
        if (this._defaults)
            this._defaults.call(this);
        this.on('destroy', function(){
            this.off();
            this.stopListening();
            this.destroyed = true;
        });
    },
    _destroy: function(){ _destroy(this); },
    sync: function(){},
    assert_inited: function(){
        be_vpn_util.assert(this.get('inited'), new Error('not inited'));
    },
    on_init: function(events, cb){
        this.on(events, cb);
        cb.call(this);
    },
    listen_to: function(other, events, cb){
        this.listenTo(other, events, cb);
        cb.call(this);
    },
    fcall: function(a0, a1){ return this[a0].apply(this, a1); },
    ecall: function(a0, a1){ return this[a0].apply(this, a1); },
    safe_set: function(change){
        var diff = this.changedAttributes(change);
        if (!diff)
            return;
        this.set(diff, {silent: true});
        _.each(diff, function(val, key){
            try { this.trigger('change:'+key); }
            catch(err){
                if (this.perr)
                {
                    this.perr({id: 'be_safe_set_err', err, info: {key, val},
                        rate_limit: {count: 1}});
                }
                console.error('error in change listener %s', err.stack||err);
            }
        }, this);
        try { this.trigger('change'); }
        catch(e){
            if (this.perr)
            {
                this.perr({id: 'be_safe_set_err', err: e,
                    rate_limit: {count: 1}});
            }
            console.error('error in change listener %s', e.stack||e);
        }
    },
    set: function(attributes, options){
        if (typeof options == 'object')
            options = _.clone(options);
        Backbone.Model.prototype.set.apply(this, [attributes, options]);
    },
    set_perr: function(func){ this.perr = func; },
    assert_no_listeners: function(){
        if (!this._events || !Object.keys(this._events).length)
            return;
        if (Object.keys(this._events).length>1 ||
          Object.keys(this._events)[0]!='destroy')
        {
            console.error('%s: assert_no_listeners _events %s',
                this.model_name, Object.keys(this._events));
            if (zutil.is_mocha())
                throw new Error('has listeners');
        }
    },
});

if (zconf && !zconf._RELEASE)
{
    E.model.prototype.on = function(events, cb){
        leak_warn(this, events, cb);
        return Backbone.Model.prototype.on.apply(this, arguments);
    };
    E.model.prototype.listenTo = function(other, events, cb){
        leak_warn(other, events, cb);
        return Backbone.Model.prototype.listenTo.apply(this, arguments);
    };
}

function leak_warn(obj, events, cb){
    if (!obj._events)
        return;
    var es = events.split(/\s+/);
    for (var i=0, l=es.length; i<l; i++)
    {
        var a = obj._events[es[i]];
        if (a && a.length>8)
        {
            console.error('%s: too many event listeners %s %s',
                obj.model_name, a.length, es[i]);
            if (zutil.is_mocha())
                throw new Error(obj.model_name+' too many listeners');
        }
    }
}

E.task_model = E.model.extend({
    defaults: function(){
        if (this._defaults)
            this._defaults.call(this);
        this.queue = [];
        this.on('destroy', function(){
            clearTimeout(this.queue_timer);
            delete this.queue;
            this.off();
            this.stopListening();
            this.destroyed = true;
        });
    },
    assert_inited: function(){
        be_vpn_util.assert(this.get('inited'), new Error('not inited'));
        be_vpn_util.assert(this.queue, new Error('in destroy'));
    },
    set_busy: function(opt){
        this.assert_inited();
        be_vpn_util.assert(this.get('status')!='error',
            new Error('set_busy in error'));
        if (this.get('status')=='ready' || !this.get('status') ||
            this.in_clr_busy)
        {
            this.in_clr_busy = false;
            this.set('status_opt', opt);
            this.set('status', 'busy');
            return true;
        }
        return false;
    },
    update_progress: function(opt){ this.set('status_opt', opt); },
    clr_busy: function(){
        this.assert_inited();
        be_vpn_util.assert(this.get('status')!='error',
            new Error('clr_busy in error'));
        if (!this.queue.length)
        {
            this.unset('status_opt');
            return this.set('status', 'ready');
        }
        this.queue_timer = setTimeout(function(){
            this.in_clr_busy = true;
            this.trigger.apply(this, this.queue.shift());
        }.bind(this), 0);
    },
    clr_task: function(task){
        this.assert_inited();
        this.queue = _.filter(this.queue, function(o){
            return !_.isEqual(o, task); });
    },
    clr_task_by_id: function(id){
        this.assert_inited();
        this.queue = _.filter(this.queue, function(o){ return o[0]!=id; });
    },
    set_err: function(){
        this.assert_inited();
        be_vpn_util.assert(this.get('status')=='busy',
            new Error('set_err but not busy'));
        clearTimeout(this.queue_timer);
        this.queue = [];
        this.in_clr_busy = 0;
        this.unset('status_opt');
        return this.set('status', 'error');
    },
    schedule: function(task){
        this.assert_inited();
        be_vpn_util.assert(this.get('status')=='busy',
            new Error('schedule but not busy'));
        this.queue.push(task);
    },
    schedule_clr: function(task){
        this.clr_task(task);
        return this.schedule(task);
    },
    recover: function(){
        this.assert_inited();
        be_vpn_util.assert(this.get('status')=='error',
            new Error('recover but not in error'));
        this.unset('status_opt');
        this.set('status', '', {silent: true});
        return this.trigger('recover');
    },
});

return E; });
