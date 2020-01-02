(function(){
var define;
var is_node = typeof module=='object' && module.exports && module.children;
var is_rn = (typeof global=='object' && !!global.nativeRequire) ||
    (typeof navigator=='object' && navigator.product=='ReactNative');
if (!is_node && !is_rn)
    define = self.define;
else
    define = require('./require_node.js').define(module, '../');
define([], function(){

function EventEmitter(){ this._events = {}; }

EventEmitter.prototype.listeners = function listeners(name){
    var events = this._events && this._events[name] || [];
    var length = events.length, listeners = [], event;
    for (var i = 0; i<length; event = events[++i])
        listeners.push(events[i].fn);
    return listeners;
};

EventEmitter.prototype.emit = function emit(name, a1, a2, a3, a4, a5){
    if (!this._events || !this._events[name])
        return false;
    var listeners = this._events[name], length = listeners.length;
    var len = arguments.length, event = listeners[0], args, i;
    if (length===1)
    {
        switch (len)
        {
        case 1:
            event.fn.call(event.context||this);
            break;
        case 2:
            event.fn.call(event.context||this, a1);
            break;
        case 3:
            event.fn.call(event.context||this, a1, a2);
            break;
        case 4:
            event.fn.call(event.context||this, a1, a2, a3);
            break;
        case 5:
            event.fn.call(event.context||this, a1, a2, a3, a4);
            break;
        case 6:
            event.fn.call(event.context||this, a1, a2, a3, a4, a5);
            break;
        default:
            for (i = 1, args = new Array(len-1); i<len; i++)
                args[i-1] = arguments[i];
            event.fn.apply(event.context||this, args);
        }
        if (event.once)
            remove_listener.apply(this, [name, event]);
    }
    else
    {
        for (i = 1, args = new Array(len-1); i<len; i++)
            args[i-1] = arguments[i];
        for (i = 0; i<length; event = listeners[++i])
        {
            event.fn.apply(event.context||this, args);
            if (event.once)
                remove_listener.apply(this, [name, event]);
        }
    }
    return true;
};

function add_listener(name, fn, opt){
    opt = opt||{};
    if (!this._events)
        this._events = {};
    if (!this._events[name])
        this._events[name] = [];
    var event = {fn: fn};
    if (opt.context)
        event.context = opt.context;
    if (opt.once)
        event.once = opt.once;
    if (opt.prepend)
        this._events[name].unshift(event);
    else
        this._events[name].push(event);
    return this;
}

function remove_listener(name, listener){
    if (!this._events || !this._events[name])
        return this;
    var listeners = this._events[name], events = [];
    var is_fn = typeof listener=='function';
    for (var i = 0, length = listeners.length; i<length; i++){
        if (!listener)
            continue;
        if (is_fn && listeners[i].fn!==listener ||
            !is_fn && listeners[i]!==listener)
        {
            events.push(listeners[i]);
        }
    }
    if (events.length)
        this._events[name] = events;
    else
        this._events[name] = null;
    return this;
}

EventEmitter.prototype.on = function on(name, fn, context){
    return add_listener.apply(this, [name, fn, {context: context}]); };

EventEmitter.prototype.once = function once(name, fn, context){
    return add_listener.apply(this, [name, fn,
        {context: context, once: true}]);
};

EventEmitter.prototype.prependListener = function prependListener(name, fn,
    context)
{
    return add_listener.apply(this, [name, fn, {context: context,
        prepend: true}]);
};

EventEmitter.prototype.prependOnceListener = function prependOnceListener(
    name, fn, context)
{
    return this.prependListener(name, fn, {context: context, prepend: true,
        once: true});
};

EventEmitter.prototype.removeListener = function removeListener(name, fn){
    return remove_listener.apply(this, [name, fn]); };

EventEmitter.prototype.removeAllListeners = function removeAllListeners(name){
  if (!this._events)
      return this;
  if (name)
      this._events[name] = null;
  else
      this._events = {};
  return this;
};

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

EventEmitter.prototype.setMaxListeners = function setMaxListeners(){
  return this; };

EventEmitter.prototype.eventNames = function eventNames(){
    var _this = this;
    return Object.keys(this._events).filter(function(e){
        return _this._events[e]!==null; });
};

EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

return EventEmitter; }); })();
