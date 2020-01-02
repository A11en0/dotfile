// LICENSE_CODE ZON
'use strict'; 
(()=>{
const about_init = ()=>{
    require(['/bext/vpn/ui/about.js'], about=>{ about.init(); }); };

const init = ()=>{
    require.config({waitSeconds: 0});
    require.onError = window.hola.base.require_on_error;
    window.hola.t = {l_start: Date.now()};
    require(['config'], be_config=>{ about_init(); });
};

init();
})();

