// LICENSE_CODE ZON
'use strict'; 
define(['/bext/pub/backbone.js', '/bext/pub/browser.js', '/bext/pub/util.js',
    '/bext/pub/lib.js', '/bext/vpn/util/util.js'],
    (be_backbone, B, be_util, be_lib, be_vpn_util)=>{
be_vpn_util.assert_bg('be_ext');
const assign = Object.assign;
const E = new (be_backbone.model.extend({
    model_name: 'ext',
    _defaults: function(){ this.on('destroy', ()=>E.uninit()); },
}))();

E.init = ()=>{
    if (E.inited)
        return;
    E.inited = true;
    E.set_perr(opt=>be_lib.perr_err(opt));
};

E.uninit = ()=>{
    if (!E.inited)
        return;
    E.stopListening();
    E.clear();
    E.inited = false;
};

E.auth = o=>{
    const info = be_util.qs_ajax();
    info.uuid = E.get('uuid');
    info.session_key = E.get('session_key')||0;
    return assign(info, o);
};

return E; });
