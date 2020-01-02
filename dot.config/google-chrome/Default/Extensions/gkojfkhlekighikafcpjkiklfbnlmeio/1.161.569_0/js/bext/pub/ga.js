// LICENSE_CODE ZON
'use strict'; 
define(['/util/hash.js', '/util/escape.js'], (hash, zescape)=>{
const E = {};
const GA_POST_URL = 'https://www.google-analytics.com/collect';
let xhr_send_t;

let proc_msg = (ga_msg, ec)=>{
    let t, targs;
    let defaults = {dp: '%2F'};
    switch (ga_msg[0])
    {
    case 'event': t = 'event'; targs = ['ec', 'ea', 'el']; break;
    case 'ec_checkout':
    case 'ec_impression_view':
    case 'pageview': t = 'pageview'; targs = ['dh', 'dp', 'dt']; break;
    default: return;
    }
    let args = targs.map((v, i)=>{
            let arg = ga_msg[i+1]||defaults[v];
            return arg && v+'='+arg;
        }).filter(v=>!!v).join('&');
    let ga_params = Object.assign({v: 1, t}, E.xhr_opt);
    let ec_params = ec ? zescape.qs(ec) : '';
    return zescape.qs(ga_params)+'&'+args+ec_params;
};

E.inited = {};

E.init = (id, opt = {})=>{
    if (E.inited[id])
        return;
    E.inited[id] = true;
    E.xhr_opt = Object.assign({tid: id}, opt);
    if (opt.pageview)
        E.qpush(['pageview']);
};

E.pageview = (hostname, page, title)=>{
    E.qpush(['pageview', hostname, page, title]);
};

E.event = (category, action, label, id)=>{
    E.qpush(['event', category, action, label]);
};

E.ec_checkout = (step, option)=>{
    E.qpush(['ec_checkout'], {pa: 'checkout', cos: step, col: option});
};

E.ec_impression_view = (list_name, products)=>{
    let prod_keys = {id: 'id', name: 'nm', category: 'ca'};
    let opt = products.reduce((a, p, i)=>{
        Object.keys(p).forEach((k, v)=>{
            a[`il1pi${i+1}${prod_keys[k]||k}`] = v;
        });
        return a;
    }, {il1nm: list_name});
    E.qpush(['ec_impression_view'], opt);
};

E.qpush = ar=>{
    let _gaq = window._gaq = window._gaq || [];
    _gaq.push(ar);
    if (!E.xhr_opt)
        return;
    if (xhr_send_t)
        clearTimeout(xhr_send_t);
    xhr_send_t = setTimeout(E.send_gaq, 1);
};

E.send_gaq = ()=>{
    xhr_send_t = 0;
    let _gaq = window._gaq = window._gaq || [];
    window._gaq = [];
    let messages = _gaq.map(proc_msg).filter(msg=>!!msg);
    if (!messages.length)
        return;
    let request = new XMLHttpRequest();
    request.open('POST', GA_POST_URL, true);
    request.send(messages.join('\n'));
};

return E; });
