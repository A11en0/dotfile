// LICENSE_CODE ZON
'use strict'; 
define(['underscore'], function(_){
const E = {errors: 0};

function wrap_cb(cb){
    return function(){
        try { return cb.apply(this, arguments);
        } catch(err){
            E.errors++;
            E.last_error = err;
            if (E.errors==1)
            {
                console.error('transport error %o', err);
                let perr = window.hola && window.hola.base &&
                    window.hola.base.perr;
                if (perr)
                    perr({id: 'be_transport_err', info: err.stack});
            }
        }
    };
}

E.chrome_tabs = chrome=>({
    add_connection_listener: wrap_cb(cb=>{
        if (chrome.runtime)
            chrome.runtime.onConnect.addListener(cb);
    }),
    remove_connection_listener: wrap_cb(cb=>{
        if (chrome.runtime)
            chrome.runtime.onConnect.removeListener(cb);
    }),
    add_listener: wrap_cb(cb=>{
        if (chrome.runtime)
            chrome.runtime.onMessage.addListener(cb);
    }),
    remove_listener: wrap_cb(cb=>{
        if (chrome.runtime)
            chrome.runtime.onMessage.removeListener(cb);
    }),
    send: wrap_cb(data=>{
        if (!data._tab_id)
            throw new Error('no _tab_id');
        data._type = 'tpopup';
        chrome.tabs.sendMessage(data._tab_id, data);
    }),
    get_data: e=>e,
    is_valid: e=>(e && e._tab_id && e._type=='tpopup'),
});

E.tpopup = (chrome, tab_id)=>{
    const connection_id = tab_id+':tpopup_int:'+
        _.random(Number.MAX_SAFE_INTEGER);
    let port = chrome.runtime.connect({name: connection_id});
    port.onDisconnect.addListener(function uninit(){
        port.onDisconnect.removeListener(uninit);
        port = null;
    });
    return {
        add_listener: wrap_cb(cb=>{
            if (chrome.runtime)
                chrome.runtime.onMessage.addListener(cb);
        }),
        remove_listener: wrap_cb(cb=>{
            if (chrome.runtime)
                chrome.runtime.onMessage.removeListener(cb);
        }),
        send: wrap_cb(data=>{
            if (!port)
                return;
            data._type = 'tpopup';
            data._tab_id = tab_id;
            if (chrome.runtime)
                chrome.runtime.sendMessage(data);
        }),
        get_data: e=>e,
        is_valid: e=>(e && e._tab_id==tab_id && e._type=='tpopup'),
    };
};

return E; });
