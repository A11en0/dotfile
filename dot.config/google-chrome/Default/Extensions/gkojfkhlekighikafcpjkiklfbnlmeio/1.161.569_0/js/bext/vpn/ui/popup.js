// LICENSE_CODE ZON
'use strict'; 
(()=>{
const chrome = window.chrome;

const _init = opt=>{
    opt = opt||{};
    window.hola.t = {l_start: Date.now()};
    window.hola.tpopup_opt = opt;
    if (performance.mark)
        performance.mark('popup_init');
    require(['config'], be_config=>{
        require(['/bext/vpn/ui/popup_main.js'],
            popup_main=>popup_main.default.init());
    });
};

const perr = window.hola && window.hola.base && window.hola.base.perr ||
    (()=>{});

const conf_by_msg = ()=>{
    let qs = location.search.substring(1), params = {};
    qs.split('&').forEach(arg=>{
        let pair = arg.split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    });
    let tab_id = +params.tab_id, connection_id = params.connection_id;
    if (!tab_id || !connection_id)
        return perr({id: 'be_tpopup_init_err', info: 'invalid params: '+qs});
    let t = setTimeout(()=>perr({id: 'be_tpopup_init_err',
        info: 'tpopup.init msg timeout'}), 20000);
    chrome.runtime.onMessage.addListener(function cb(msg){
        if (!msg || msg.id!='cs_tpopup.init' ||
            msg._connection_id!=connection_id)
        {
            return;
        }
        clearTimeout(t);
        chrome.runtime.onMessage.removeListener(cb);
        _init(msg);
    });
    let msg = {id: 'tpopup.init', _type: 'tpopup',
        _tab_id: tab_id, _connection_id: connection_id};
    chrome.runtime.sendMessage({type: 'be_msg_req', _type: 'tpopup',
        _tab_id: tab_id, context: {rmt: true},
        msg: {msg: 'call_api', obj: 'tpopup', func: 'send_tpopup_msg',
        args: [tab_id, msg]}});
};

const is_iframe = ()=>{
    try { return window!=window.top; }
    catch(e){ return true; }
};

const init = ()=>{
    require.config({waitSeconds: 0, enforceDefine: true});
    require.onError = window.hola.base.require_on_error;
    if (is_iframe())
        conf_by_msg();
    else if (document.readyState=='complete')
        _init();
    else
        window.addEventListener('load', _init);
};
init();
})();
