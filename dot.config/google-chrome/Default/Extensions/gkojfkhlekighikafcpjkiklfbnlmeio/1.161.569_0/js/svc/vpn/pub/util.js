// LICENSE_CODE ZON
'use strict'; 
(function(){
let define;
const is_node = typeof module=='object' && module.exports && module.children;
if (!is_node)
    define = self.define;
else
    define = require('../../../util/require_node.js').define(module, '../');
define(['/util/sprintf.js', '/util/util.js', '/util/url.js'],
    function(sprintf, zutil, zurl)
{
const E = {};

E.get_root_domain = zurl.get_root_domain;

const cctld_2ld_commercial = zutil.bool_lookup(
    'af dz as ao an am aw ac az bh bd '+
    'bj bm bt bo ba bw bv io bn bg bi cm '+
    'ca cv cf td cl km cc km cg cd ci cz '+
    'dk dj dm ie gq er et fo fi fr fx gf '+
    'pf tf ga de gi gl gp gt gw gy ht hm '+
    'hn is iq it ki kp ls li lt lu mk mw '+
    'mv ml mh mq mr mu yt fm md mc mn ms '+
    'mz np nl nc ne mp pw pe pt re ru rw '+
    'sh vc sm st sn sl sk si so gs es sd '+
    'sr ch tj tg tk to tt tm tc tv us uz '+
    'va vn vg wf eh ye');
E.get_root_domain_any = domain=>{
    var s = domain.split('.'), len = s.length, specific = -1, s0;
    if (len<=1)
        return domain;
    s0 = s[len-1];
    if (s0.length>=3) 
        specific = 1;
    else if (s0.length==2) 
        specific = cctld_2ld_commercial[s0] ? 1 : 2;
    if (specific>0)
        s = s.slice(len-specific-1);
    return s.join('.');
};

E.get_root_url = url=>{
    const n = (url||'').match(/^https?:\/\/([^\/]+)(\/.*)?$/);
    if (!n)
        return null;
    return E.get_root_domain(n[1]);
};

E.ends_in_root_url = pattern=>{
    const n = pattern.match(/^((.*):\/\/)?([^\/]+)(\/.*)?$/);
    if (!n)
        return false;
    const h = n[3].match(/[A-Za-z0-9-]+\.([A-Za-z0-9-]+)$/);
    if (h && (h[1].length>2 || cctld_2ld_commercial[h[1]]))
        return true;
    return !!n[3].match(/[A-Za-z0-9-]+\.[A-Za-z0-9-]+\.[A-Za-z0-9-]+$/);
};

E.find_rule = (rules, opt)=>{
    if (!rules)
        return;
    for (let i in rules)
    {
        const r = rules[i];
        if (opt.name==r.name
            && (opt.type===undefined || opt.type==r.type)
            && (opt.md5===undefined || opt.md5==r.md5)
            && (opt.country===undefined
            || opt.country.toLowerCase()==r.country.toLowerCase()))
        {
            return r;
        }
    }
    return null;
};

E.gen_route_str_lc = (route_opt, opt)=>
    E.gen_route_str(route_opt, opt).toLowerCase();
E.gen_route_str = (route_opt, opt)=>{
    opt = opt||{};
    if (route_opt.direct)
        return opt.lowercase ? 'direct' : 'DIRECT';
    let s = route_opt.country.toUpperCase(), r = [];
    if (route_opt.peer)
        r.push('PEER');
    if (route_opt.pool)
    {
        r.push('pool'+(typeof route_opt.pool=='string' ?
            '_'+route_opt.pool : ''));
    }
    if (!opt.no_algo && route_opt.algo)
        r.push(route_opt.algo);
    if (r.length)
        s += '.'+r.join(',');
    return opt.lowercase ? s.toLowerCase() : s;
};

function ip_list_to_agents(ip_list){
    return fix_zagent(Object.keys(ip_list).join(','));
}
function fix_zagent(s){
    return s.replace(/.hola.org/g, '').replace(/zagent/g, 'za');
}

function pad(num, size){ return ('000'+num).slice(-size); }
function time_str(d){
    d = new Date(d);
    if (isNaN(d))
        return '00:00:00.000';
    return pad(d.getUTCHours(), 2)+':'+pad(d.getUTCMinutes(), 2)
    +':'+pad(d.getUTCSeconds(), 2)
    +'.'+pad(d.getUTCMilliseconds(), 3);
}

E.events_enabled = false;
E.events = [];
E.events_n = {};
E.reset_events = ()=>{
    E.events = [];
    E.events_n = {};
};
E.push_event = (name, opt)=>{
    try {
        if (!E.events_enabled)
            return;
        if (E.events.length > 512)
            E.events.splice(0, E.events.length/2);
        E.events.push({name, ts: Date.now(), opt});
        E.events_n[name] = (E.events_n[name]||0)+1;
    } catch(err){ console.error('push_event error %s', err&&err.stack); }
};
E.enable_events_logging = enabled=>{
    E.events_enabled = !!enabled;
    if (!enabled)
        E.reset_events();
};
E.get_event_n = e=>(E.events_n[e]);
E.events_to_str = ()=>{
    let s = '', a =[];
    E.events.forEach(e=>{
        let s = time_str(e.ts)+' '+e.name, o = e.opt;
        switch (e.name)
        {
        case '>zgettunnels':
            s += sprintf(' %s%s', o.country,
                (o.exclude ? ' exclude '+fix_zagent(o.exclude) : ''));
            break;
        case '<zgettunnels':
            s += sprintf(' %s%s', o.country,
                ' agents '+ip_list_to_agents(o.ip_list));
            break;
        case 'set_rule':
            s += sprintf(' %s%s%s%s%s', o.name,
                o.enabled ? ' '+o.country : ' off',
                o.del ? ' del' : '',
                o.src ? ' src '+o.src : '',
                !o.full_vpn ? ' !full_vpn' : '',
                o.mode=='unblock' ? '' : ' mode '+o.mode);
            break;
        case '<verify_err':
            s += sprintf(' %s %s', o.host ? fix_zagent(o.host) : o.ip,
                ' '+o.err);
            break;
        case '<verify':
            s += sprintf(' %s %s', o.host ? fix_zagent(o.host) : o.ip,
                o.rtt ?o.rtt+'ms' : '!rtt');
            break;
        case '>verify':
            s += sprintf(' %s', o.host ? fix_zagent(o.host) : o.ip);
            break;
        case '>stuck':
        case '>stuck_long':
           break;
        case '<stuck_end':
            s += sprintf(' %sms', o.duration);
           break;
        case 'pac_miss':
            s += sprintf(' %s!=%s %s', o.req_ip, o.agent_ip, o.url);
            break;
        case 'navgiate': s += sprintf(' tab %s %s', o.tab_id, o.url); break;
        case 'popup_render':
        case 'tpopup_render':
            break;
        case 'set_pac_slow': s += sprintf(' %dms %s', o.dur, o.url); break;
        default: s += JSON.stringify(o); break;
        }
        a.push(s);
    });
    return a.join('\n');
};

class Domain_tree {
    constructor(){
        this.clear();
    }
    *[Symbol.iterator](){
        let parts = [];
        for (let item of Domain_tree.iterate_subtree(parts, this.tree))
            yield item;
    }
    clear(){
        this.tree = {};
    }
    get_value(domain){
        if (!domain)
            return;
        let parts = domain.split('.');
        let leaf = this.tree, value = leaf[Domain_tree.VALUE];
        for (let i = parts.length-1; leaf && i>=0; i--)
        {
            leaf = leaf[parts[i]];
            value = leaf && (Domain_tree.VALUE in leaf) ?
                leaf[Domain_tree.VALUE] : value;
        }
        return value;
    }
    set_value(domain, value){
        if (!domain)
            return void (this.tree[Domain_tree.VALUE] = value);
        let parts = domain.split('.');
        let leaf = this.tree;
        for (let i = parts.length-1; i>=0; i--)
            leaf = leaf[parts[i]] = leaf[parts[i]]||{};
        leaf[Domain_tree.VALUE] = value;
    }
}
Domain_tree.VALUE = Symbol.for('value');
Domain_tree.iterate_subtree = function*(parts, leaf){
    if (Domain_tree.VALUE in leaf)
        yield [parts.slice().reverse().join('.'), leaf[Domain_tree.VALUE]];
    for (let key in leaf)
    {
        parts.push(key);
        for (let item of Domain_tree.iterate_subtree(parts, leaf[key]))
            yield item;
        parts.pop();
    }
};

E.Domain_tree = Domain_tree;

return E; }); }());
