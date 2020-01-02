// LICENSE_CODE ZON
'use strict'; 
(function(){
var allowed_origin = /^https:\/\/(www\.)?hola\.org$/;
var origin = document.location.origin;
if (!origin.match(allowed_origin))
    return;

var chrome = window.chrome, firefox = window.self, got_info, tries = 0;
var web_ext = firefox && !firefox.port;
firefox = web_ext ? false : firefox;

function hola_ext_present(){
    document.documentElement.setAttribute('hola_ext_present', 'true');
}
hola_ext_present();

function resp_cb(resp){
    if (!resp)
        return;
    resp.src = chrome ? 'hola_chrome' : 'hola_firefox';
    document.defaultView.postMessage(resp, origin);
}

function embed_info(resp){
    if (!resp)
        return console.error('ipc got empty response');
    if (!chrome && !web_ext)
    {
        if (resp.id!='ping' && resp.id!='callback' || got_info)
            return;
        got_info = true;
        firefox.port.removeListener('resp', embed_info);
    }
    resp.data = JSON.stringify(resp.data);
    document.documentElement.setAttribute('hola_extension_info', resp.data);
}

function message_cb(e){
    if (!(e.origin||'').match(allowed_origin))
        return;
    if (e.data.src!='hola_ccgi')
        return;
    if (e.data.id=='cs_ping')
        return resp_cb(Object.assign({pong: 1}, e.data));
    if (chrome)
        return chrome.runtime.sendMessage(e.data, resp_cb);
    if (web_ext)
        return browser.runtime.sendMessage(e.data, resp_cb);
    firefox.port.emit('req', e.data);
}
window.addEventListener('message', message_cb, false);
if (chrome)
    return chrome.runtime.sendMessage({id: 'ping'}, embed_info);
if (web_ext)
    return browser.runtime.sendMessage({id: 'ping'}, embed_info);

function get_info_ff(){
    if (got_info)
        return;
    if (tries++>10)
        return console.error('failed to get info from extensions');
    firefox.port.emit('req', {id: 'ping'});
    setTimeout(get_info_ff, 200);
}

function uninit(){
    try {
        window.removeEventListener('message', message_cb);
    } catch(e){}
    firefox.port.removeListener('resp', resp_cb);
    firefox.port.removeListener('resp', embed_info);
    firefox.removeListener('detach', uninit);
    firefox.port.removeListener('detach', uninit);
}
firefox.port.on('resp', resp_cb);
firefox.port.on('resp', embed_info);
firefox.on('detach', uninit); 
firefox.port.on('detach', uninit); 
get_info_ff();

})();
