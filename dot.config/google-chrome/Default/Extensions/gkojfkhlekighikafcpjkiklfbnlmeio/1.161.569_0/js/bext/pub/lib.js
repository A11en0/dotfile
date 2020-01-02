// LICENSE_CODE ZON
'use strict'; 
define(['underscore', '/util/etask.js', '/bext/pub/browser.js',
    '/util/zerr.js', '/bext/pub/util.js', '/bext/vpn/util/util.js',
    '/util/escape.js', '/util/storage.js', 'conf'],
    function(_, etask, B, zerr, be_util, be_vpn_util, zescape, storage, conf){
be_vpn_util.assert_bg('be_lib');
const E = {};
const assign = Object.assign;

E.reload_ext = opt=>{
    zerr.notice('reload_ext '+zerr.json(opt));
    if (opt && opt.force)
        return E.reload_ext.force();
    return be_util.reload_ext(E.reload_ext.force);
};

E.reload_ext.force = ()=>{
    try { zerr.notice('going for full reload'); } catch(e){}
    be_util.reload_ext_native();
};

var drop_perr = (opt, new_name)=>{
    var be_ext, bext_config, perr_sample, bg_main = window.be_bg_main;
    var id = be_util.perr_id(opt.id, new_name);
    if (conf.check_agree_ts && !(bg_main && bg_main.get('agree_ts')))
    {
        zerr('user forbade sending privacy data for perr %s', id);
        return true;
    }
    if ((be_ext = window.be_bg_main&&window.be_bg_main.be_ext) &&
        (bext_config = be_ext.get('bext_config')))
    {
        if (!(perr_sample = bext_config.perr_sample))
            return storage.clr('perr_sample');
        storage.set_json('perr_sample', perr_sample);
    }
    else if (!(perr_sample = storage.get_json('perr_sample')))
        return;
    if (!perr_sample[id])
        return;
    if (Math.random()>=perr_sample[id])
        return true;
    opt.id = opt.id+'_sample';
    opt.info = assign(opt.info||{}, {sample: perr_sample[id]});
};

E.perr_opt = (level, opt, new_name)=>{
    let bg_main, ver;
    let id = opt.id, info = opt.info, bt = opt.bt, filehead = opt.filehead;
    let qs = {ext_ver: be_util.version(), product: be_util.get_product()};
    if (opt.with_log)
        filehead = (filehead||'')+'\n'+be_util.get_log();
    bg_main = window.be_bg_main;
    ver = be_util.version();
    opt.data = {bt, info, filehead, ver, build: be_util.build()};
    if (bg_main)
    {
        qs.uuid = bg_main.get('uuid');
        qs.browser = be_util.browser();
    }
    else
        zerr('cannot get information for perr %s %s', id, info);
    qs.id = be_util.perr_id(id, new_name);
    opt.qs = qs;
    opt.level = level;
    return {id: qs.id, info, opt};
};
E.perr = (level, opt, new_name)=>{
    if (drop_perr(opt, new_name))
        return;
    var perr_opt = E.perr_opt(level, opt, new_name);
    return zerr.perr(perr_opt.id, perr_opt.info, perr_opt.opt);
};

E.ok = (id, info)=>E.perr_ok({id, info});
E.perr_ok = (opt, new_name)=>E.perr(zerr.L.NOTICE, opt, new_name);
E.stats = (id, info)=>
    E.perr(zerr.L.NOTICE, {id, info, rate_limit: {count: 20}});
E.err = (id, info, err)=>E.perr_err({id, info, err});
E.perr_err = (opt, new_name)=>{
    var err = opt.err;
    opt.bt = err ? zerr.e2s(err) : opt.bt;
    if (err && err.hola_info)
    {
        opt.bt = 'status '+err.hola_info.status+
            ' '+err.hola_info.method+' '+err.hola_info.url+
            ' text '+(''+err.hola_info.response_text).substr(0, 256)+'\n'+
            opt.bt;
    }
    if (err && !opt.info && err.etask)
        opt.err = _.omit(err, 'etask');
    return E.perr(zerr.L.ERR, opt, new_name);
};

return E; });
