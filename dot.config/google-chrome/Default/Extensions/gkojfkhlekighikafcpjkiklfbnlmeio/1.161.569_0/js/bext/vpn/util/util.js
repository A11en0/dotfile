// LICENSE_CODE ZON
'use strict'; 
(function(){
let define;
const is_node = typeof module=='object' && module.exports && module.children;
if (!is_node)
    define = self.define;
else
    define = require('../../../util/require_node.js').define(module, '../');
define(['underscore', '/util/etask.js', '/util/url.js', '/util/util.js',
    '/protocol/pub/countries.js', '/util/zerr.js', '/util/storage.js',
    '/util/escape.js'],
    function(_, etask, zurl, zutil, pcountries, zerr, storage, zescape)
{
const E = {};
const assign = Object.assign;

E.assert = (exp, err, msg)=>{
    if (exp)
        return;
    zerr('assert failed exp %s err %s msg %s', exp, err, msg);
    err = err||exp;
    throw err instanceof Error ? err : new Error(err);
};

E.assert_bg = f=>
    zerr.assert(E.is_bg(), `file ${f} can only be included in background`);

E.assert_ui = f=>
    zerr.assert(!E.is_bg(), `file ${f} can only be included in ui`);

E.new_etask = n=>etask(n, function*new_etask(){ yield this.wait(); });

E.set_timeout = (cb, t, opt)=>{
    opt = opt||{};
    const name = 'set_timeout_'+(opt.name||cb.name||'unknown');
    const sp = etask(function*set_timeout(){
        this.name = name;
        yield etask.sleep(t);
        cb();
    });
    if (opt.sp)
        opt.sp.spawn(sp);
    return sp;
};

E.set_interval = (cb, t, opt)=>{
    opt = opt||{};
    const name = 'set_interval_'+(opt.name||cb.name||'unknown');
    const sp = etask(function*set_interval(){
        this.name = name;
        while (true)
        {
            yield etask.sleep(t);
            cb();
        }
    });
    if (opt.sp)
        opt.sp.spawn(sp);
    return sp;
};

E.clear_timeout = E.clear_interval = et=>{
    if (et)
        et.return();
};

E.is_all_browser = rule=>rule && rule.name=='all_browser';

E.is_skip_url = url=>{
    if (!url)
        return true;
    const protocol = zurl.get_proto(url), host = zurl.get_host(url);
    return host.search(/^(.*\.)?hola.org$/)!=-1 &&
        url.search(/(access|unblock)\/([^/]*)\/using\/.*/)==-1 ||
        zurl.is_ip_port(host) || protocol.search(/^(http|https)$/)==-1 ||
        host=='localhost' || !zurl.is_valid_domain(host);
};

E.get_rules = (_rules, url, ignore)=>{
    url = url||'';
    var _r, rules, ret = [], r_enabled = null;
    if (!_rules || !(rules = _rules.unblocker_rules))
        return [];
    for (_r in rules)
    {
        var r = rules[_r];
        if (!r.supported)
            continue;
        if (!ignore && r.enabled && E.is_all_browser(r))
            return [r];
        var urls = r.root_url;
        if (urls && urls.some(rurl=>{
            try { return url.match(rurl); } catch(e){} }))
        {
            if (r.enabled)
                r_enabled = r;
            else
                ret.push(r);
        }
    }
    if (r_enabled)
        ret.unshift(r_enabled);
    return ret;
};

E.get_tld_country = host=>{
    if (!host)
        return '';
    var tld = zurl.get_top_level_domain(host);
    if (!tld)
        return '';
    tld = tld.toUpperCase();
    if (tld=='COM')
        return 'US';
    if (tld=='UK')
        tld = 'GB';
    var skip_domain = ['TV', 'FM', 'IO', 'AM'];
    if (skip_domain.includes(tld))
        return '';
    if (!_.find(pcountries.proxy_countries.bext, c=>c==tld))
        return '';
    return tld;
};

E.get_popular_country = opt=>{
    var c0, c1, tld = E.get_tld_country(opt.host);
    var p = {};
    c0 = tld||'US';
    c1 = c0=='US' ? 'GB' : 'US';
    p[c0] = {proxy_country: c0, rating: 0.02};
    p[c1] = {proxy_country: c1, rating: 0.01};
    var rule_ratings = opt.rule_ratings||[];
    rule_ratings.forEach(country_ratings=>{
        if (country_ratings.rating<0.1)
            return;
        var country = country_ratings.proxy_country.toUpperCase();
        var ratings = {proxy_country: country,
            rating: country_ratings.rating};
        p[country] = ratings;
    });
    var popular_array = [];
    zutil.forEach(p, r=>{ popular_array.push(r); });
    popular_array.sort((a, b)=>a.rating-b.rating > 0 ? -1 : 1);
    return popular_array;
};

E.set_dbg_conf = (path, value)=>{
    const conf = storage.get_json('hola_conf')||{};
    zutil.set(conf, path, value);
    storage.set_json('hola_conf', conf);
};

E.get_dbg_conf = path=>
    zutil.get(storage.get_json('hola_conf'), path);

E.plus_ref = (ref, extra)=>zescape.uri('https://hola.org/plus',
    assign({ref, uuid: storage.get('uuid')}, extra));

E.must_verify_email = user=>user && user.emails && !user.verified;

E.get_rule_min_fmt = rule=>_.pick(rule||{}, 'name', 'country');

E.is_tpopup = ()=>{
    try { return window!=window.top; }
    catch(e){ return true; }
};

E.is_bg = ()=>location.pathname=='/js/bg.html';

E.is_new_tab = url=>url=='chrome://newtab/';

E.root2url = root_url=>'http://'+root_url+'/';

E.get_tpopup_type = ()=>zutil.get(window, 'hola.tpopup_opt.type');

return E;
}); }());
