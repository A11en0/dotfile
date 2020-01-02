// LICENSE_CODE ZON
'use strict'; 
(()=>{
const chrome = window.chrome;
let be_bg_main, install_details;

const install_listener_add = ()=>{
    if (!chrome)
        return;
    if (!chrome.runtime)
    {
        window.hola.base.perr({id: 'be_no_runtime',
            info: location.href+' '+Object.keys(chrome)});
        return;
    }
    if (!chrome.runtime.onInstalled)
    {
        window.hola.base.perr({id: 'be_no_on_installed',
            info: location.href+' '+Object.keys(chrome)});
        return;
    }
    chrome.runtime.onInstalled.addListener(details=>{
        install_details = {reason: details.reason};
        if (be_bg_main)
            be_bg_main.set('install_reason', details.reason);
    });
};

const _init_ga = ga=>{
    const done = ()=>{
        chrome.cookies.getAll({domain: '.hola.org'}, cookies=>{
            let _ga, cid;
            if (_ga = cookies.find(c=>c.name=='_ga'))
                cid = _ga.value.match(/(\d+\.\d+)$/)[0];
            if (!cid)
                return;
            const gclid = cookies.find(c=>c.name=='gclid');
            ga.init('UA-36775596-1', {cid, gclid, cm: gclid&&'cpc',
                cs: gclid&&'google'});
            be_bg_main.set('ga_inited', true);
        });
    };
    if (be_bg_main.get('uuid'))
        done();
    else
        be_bg_main.listenTo(be_bg_main, 'change:uuid', done);
};

const init = ()=>{
    const now = Date.now();
    window.hola.t = {l_start: now};
    install_listener_add();
    require.config({waitSeconds: 0, enforceDefine: true});
    require.onError = window.hola.base.require_on_error;
    require(['config'], be_config=>{
        require(['/bext/vpn/bg/bg_main.js', '/bext/pub/ga.js'],
            (_be_bg_main, ga)=>{
                be_bg_main = _be_bg_main.default;
                window.be_bg_main = be_bg_main; 
                be_bg_main.init({install_details});
                if (be_bg_main.get('agree_ts'))
                    _init_ga(ga);
            }
        );
    });
};

init();

})();
