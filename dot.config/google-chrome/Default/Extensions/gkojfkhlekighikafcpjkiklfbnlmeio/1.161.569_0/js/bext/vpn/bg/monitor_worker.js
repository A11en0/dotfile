// LICENSE_CODE ZON
'use strict'; 
(function(){
    var ping_delay = 5000, pong_delay = 10000, pong_long_delay = 30000;
    importScripts('../../../require.js');
    self.conf = {};
    var _define = define;
    self.define = function(deps, fun){
        deps = deps.map(function(d){
            return /\.js$/.test(d) && !/^\.\./.test(d) ? '/js'+d : d; });
        return _define(deps, fun);
    };
    require(['/js/util/zerr.js', '/js/util/util.js'], function(zerr, zutil){
        var ping_timeout, pong_timeout, val, perr_opt, stuck, ping_time;
        var send_perr = function(suffix, info){
            if (!perr_opt)
                return;
            var id = perr_opt.id+(suffix ? '_'+suffix : '');
            var _info = perr_opt.info, opt = zutil.clone_deep(perr_opt.opt);
            if (suffix)
                zutil.extend_deep(opt, {id, qs: {id}});
            if (info)
                _info = Object.assign(_info||{}, info);
            zerr.perr(id, _info, opt);
            self.postMessage({type: 'push_event', ts: Date.now(), name:
                (suffix=='end' ? '<' : '>')+'stuck'+(suffix ? '_'+suffix : ''),
                duration: zutil.get(info, 'duration')});
        };
        self.onmessage = function(e){
            var data = e.data, opt = data&&data.opt;
            if (!val || data.type!='pong' || !opt || opt.val!=val)
                return;
            perr_opt = opt.perr;
            self.conf.url_perr = opt.url;
            ping_delay = opt.ping_delay||ping_delay;
            pong_delay = opt.pong_delay||pong_delay;
            pong_long_delay = opt.pong_long_delay||pong_long_delay;
            if (stuck)
                send_perr('end', {duration: new Date()-ping_time});
            clearTimeout(pong_timeout);
            submit_ping();
        };
        var no_message = function(){
            stuck = true;
            send_perr();
            pong_timeout = setTimeout(function(){ send_perr('long'); },
                pong_long_delay);
        };
        var ping = function(){
            val = Math.random();
            ping_time = new Date();
            self.postMessage({type: 'ping', val: val});
            pong_timeout = setTimeout(no_message, pong_delay);
        };
        var submit_ping = function(delay){
            clearTimeout(ping_timeout);
            ping_time = null;
            stuck = false;
            ping_timeout = setTimeout(ping, delay||ping_delay);
        };
        submit_ping(5*ping_delay);
    });
})();
