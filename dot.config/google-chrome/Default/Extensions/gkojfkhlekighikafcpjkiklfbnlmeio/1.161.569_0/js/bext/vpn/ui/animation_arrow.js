// LICENSE_CODE ZON
'use strict'; 

function init(){
    const qs = location.search.substring(1);
    const opt = {};
    qs.split('&').forEach(arg=>{
        const pair = arg.split('=');
        opt[pair[0]] = decodeURIComponent(pair[1]);
    });
    const root = document.querySelector('.moving-anim');
    const arrow = document.querySelector('.arrow');
    const image = document.querySelector('.watermark-image');
    root.classList.add(opt.direction);
    arrow.classList.add('arrow-'+opt.direction);
    image.style.width = opt.width+'px';
    image.style.height = opt.height+'px';
}

document.addEventListener('DOMContentLoaded', init);
