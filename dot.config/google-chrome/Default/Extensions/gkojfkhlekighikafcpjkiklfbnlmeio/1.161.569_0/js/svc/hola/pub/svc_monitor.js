// LICENSE_CODE ZON
'use strict'; 
(function(){
var define;
var is_node = typeof module=='object' && module.exports;
if (!is_node)
    define = self.define;
else
    define = require('../../../util/require_node.js').define(module, '../');
define(['/util/zerr.js', '/util/etask.js', '/util/util.js', '/util/date.js',
    '/util/ws.js', '/util/events.js', '/util/rate_limit.js', '/util/escape.js',
    '/svc/hola/pub/svc_ipc.js', '/util/version_util.js'],
    function(zerr, etask, zutil, date, zws, zevents, rate_limit, zescape,
    svc_ipc, version_util){
const E = {}, assign = Object.assign, noop = ()=>{};

class State_machine {
    constructor(){}
    start(opt){
        if (this.et)
            return;
        this.rl_ctx = {};
        this.events = new zevents.EventEmitter();
        this.events.on('data', data=>{
            if (zutil.equal_deep(this.svc_info, data))
                return;
            this.svc_info = data;
            if (data)
                this.last_svc_info = data;
            if (opt.watch)
                opt.watch(data);
        });
        this.events.on('datapart', part=>
            this.events.emit('data', assign({}, this.last_svc_info, part)));
        this.opt = assign({components: ['client']}, opt, {
            log: this.proxy_log(opt.log),
            perr: this.proxy_perr(opt.perr),
            events: this.events,
        });
        this.state = {name: 'polling', opt: assign({startup: true}, this.opt)};
        this.states = {
            polling: this.state_polling,
            listening: this.state_listening,
        };
        this.opt.log('starting svc detection');
        this.et = etask({cancel: true, state0_args: [this]}, function*(_this){
            this.on('uncaught', e=>
                _this.opt.log('exception in main etask:'+zerr.e2s(e)));
            while (true)
            {
                let r = yield _this.states[_this.state.name](_this.state.opt);
                _this.state = _this.change_state(r);
            }
        });
        return this.et;
    }
    stop(){
        if (!this.et)
            return;
        this.opt.log('svc detection shutdown');
        this.state.opt.shutdown = true;
        this.et.return();
        this.et = this.events = this.opt = this.state = this.rl_ctx =
            this.svc_info = this.last_svc_info = undefined;
    }
    proxy_log(fn){
        fn = fn||noop;
        this.log_tail = [];
        return str=>{
            this.log_tail.push(str);
            this.log_tail.splice(0, this.log_tail.length-100);
            return fn(str);
        };
    }
    proxy_perr(fn){
        fn = fn||noop;
        return (id, info)=>{
            info = assign({log_tail: this.log_tail.join('\n')}, info);
            return fn(id, info);
        };
    }
    reconf(opt){
        let changes = zutil.pick(opt, 'monitoring_interval',
            'detecting_interval', 'state_toggle_rl_n', 'state_toggle_rl_sec');
        if (!Object.keys(changes).find(k=>changes[k]!=this.opt[k]))
            return;
        assign(this.opt, changes);
        assign(this.state.opt, changes);
        setTimeout(()=>this.events.emit('wakeup'), 0);
    }
    change_state(res){
        if (this.state.name=='listening' && res.next=='polling')
        {
            let rl_n = this.opt.state_toggle_rl_n||5;
            let rl_ms = (this.opt.state_toggle_rl_sec||60)*date.ms.SEC;
            if (!rate_limit(this.rl_ctx, rl_ms, rl_n))
            {
                this.opt.log('reconnect loop detected, disabling ws');
                this.opt.perr('svc_monitor_reconnect_loop');
                assign(res, {next: 'polling', ignore_ws: true});
            }
        }
        this.opt.log(`changing state to ${res.next}`);
        this.opt.perr('svc_monitor_changeto_'+res.next);
        return {name: res.next, opt: zutil.omit(res, 'next')};
    }
    state_polling(opt){ return etask({cancel: true}, function*(){
        this.on('uncaught', e=>{
            opt.log('exception in polling state: '+zerr.e2s(e));
            opt.perr('svc_monitor_etask_err', {err: zerr.e2s(e),
                source: 'state_polling'});
        });
        let data, waiting_sec, fail_count = 0;
        let qs = opt.components.includes('vpn') ? '?vpn=1' : '';
        let on_wakeup = ()=>waiting_sec&&this.continue();
        opt.events.on('wakeup', on_wakeup);
        this.finally(()=>opt.events.off('wakeup', on_wakeup));
        while (true)
        {
            try { data = (yield svc_ipc.ajax('callback.json'+qs)).ret; }
            catch(e){ data = undefined; }
            if (data && !opt.is_connected || !data && opt.is_connected)
            {
                opt.startup = false;
                opt.is_connected = !!data;
                opt.log(`svc ${opt.is_connected ? 'found' : 'disappeared'}`);
            }
            if (data)
            {
                opt.events.emit('data', data);
                if (!opt.ignore_ws && data.ws_port_js)
                    break;
            }
            else
            {
                fail_count++;
                opt.events.emit('data', undefined);
            }
            let is_start = opt.startup && opt.detecting_start_retries &&
                fail_count<opt.detecting_start_retries;
            waiting_sec = opt.is_connected ? opt.monitoring_interval :
                is_start ? opt.detecting_start_interval :
                opt.detecting_interval;
            opt.events.emit('sleep');
            try { yield this.wait(waiting_sec*date.ms.SEC); } catch(e){}
            waiting_sec = 0;
        }
        opt.log(`detected ws server on port ${data.ws_port_js}, switching to `+
            `listening mode`);
        return assign(opt, {next: 'listening', ws_port: data.ws_port_js,
            svc_ver: data.ver}); });
    }
    state_listening(opt){ return etask({cancel: true}, function*(){
        let _this = this;
        this.on('uncaught', e=>{
            opt.log('exception in listening state: '+zerr.e2s(e));
            opt.perr('svc_monitor_etask_err', {err: zerr.e2s(e),
                source: 'state_listening'});
        });
        this.finally(()=>client.close());
        let ws_url = version_util.cmp(opt.svc_ver, '1.155.300')<=0 ?
            `wss://localhost.h-local.org:${opt.ws_port}` :
            `ws://127.0.0.1:${opt.ws_port}`;
        let client = opt.client = new zws.Client(ws_url, {
            ipc_client: {
                vpn_connect: 'post',
                vpn_disconnect: 'post',
                vpn_change_agent: 'post',
                vpn_status: 'call',
                push_subscribe: 'call',
            },
            ipc_server: {
                push_notify: msg=>{
                    opt.log(msg.init ? 'received initial status update' :
                        'received status update'+((msg.changed||[]).length ?
                        ' for '+msg.changed.join(',') : ''));
                    opt.log(JSON.stringify(msg.data));
                    opt.events.emit('datapart', msg.data);
                },
            },
            mux: true,
        });
        opt.log(`connecting to ${ws_url}`);
        client.on('connected', ()=>etask(function*(){
            opt.log(`connected to ${ws_url}`);
            let sub_res = {}, sub_opt = {components: opt.components};
            try { sub_res = yield client.ipc.push_subscribe(sub_opt); }
            catch(e){}
            if (sub_res.status!='success')
            {
                opt.log('failed to subscribe for svc push notifications, '+
                    'switching back to polling mode');
                opt.perr('svc_monitor_subscribe_failed', {ret: sub_res});
                return _this.continue({next: 'polling', ignore_ws: true});
            }
            opt.log('svc push notifications enabled');
            opt.ws_client = client;
        }));
        client.on('disconnected', ()=>{
            opt.ws_client = null;
            if (opt.shutdown)
                return;
            opt.log(`disconnected from ${ws_url}, switching to polling mode`);
            this.continue({next: 'polling'});
        });
        return assign(opt, yield this.wait()); });
    }
    exec(cmd, params){ return etask({state0_args: [this]}, function*(_this){
        if (cmd=='callback')
        {
            let data = yield _this.refresh_info();
            return data ? {ret: data} : undefined;
        }
        let ws_client;
        if ((ws_client = _this.state.opt.ws_client) && ws_client.ipc[cmd] &&
            !_this.opt.prefer_http_exec)
        {
            try { return {ret: yield ws_client.ipc[cmd](params)}; }
            catch(e){
                _this.opt.perr('svc_monitor_ws_err', {err: zerr.e2s(e), cmd});
            }
        }
        params = params ? `?${zescape.qs(params)}` : '';
        return svc_ipc.ajax(`${cmd}.json${params}`); });
    }
    get_info() { return this.svc_info; }
    get_last_info() { return this.last_svc_info; }
    refresh_info(){
        if (!this.et)
            return;
        if (this.state.name=='listening')
            return this.get_info();
        let _this = this;
        return etask(function*(){
            this.on('uncaught', e=>{
                _this.opt.log('refresh_info exception: '+zerr.e2s(e));
                _this.opt.perr('svc_monitor_etask_err', {err: zerr.e2s(e),
                    source: 'refresh_info'});
            });
            let continue_fn = ()=>this.continue();
            _this.events.on('data', continue_fn);
            _this.events.on('sleep', continue_fn);
            setTimeout(()=>_this.events.emit('wakeup'), 0);
            yield this.wait(60*date.ms.SEC);
            _this.events.off('data', continue_fn);
            _this.events.off('sleep', continue_fn);
            return _this.get_info();
        });
    }
}

let sm = new State_machine();
E.init = sm.start.bind(sm);
E.exec = sm.exec.bind(sm);
E.reconf = sm.reconf.bind(sm);
E.uninit = sm.stop.bind(sm);
E.get_info = sm.get_info.bind(sm);
E.get_last_info = sm.get_last_info.bind(sm);
E.refresh_info = sm.refresh_info.bind(sm);
E.t = {State_machine};

return E; }); }());
