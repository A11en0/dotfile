// LICENSE_CODE ZON
'use strict'; 
(()=>{
const settings_init = ()=>{
    require(['/bext/vpn/ui/settings.js'], settings=>{ settings.init(); });
};

const init = ()=>{
    require.config({waitSeconds: 0});
    require.onError = window.hola.base.require_on_error;
    window.hola.t = {l_start: Date.now()};
    require(['config'], be_config=>{ settings_init(); });
};

init();
})();
