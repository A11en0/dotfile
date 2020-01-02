const script = document.createElement('script');
script.type = 'application/javascript';
script.src = URL_SRC;
document.body.appendChild(script);
const dpb = document.createElement('distill-page-btn');
dpb.setAttribute('data-src', IFRAME_SRC);
dpb.setAttribute('data-base', URL_BASE);
dpb.setAttribute('data-pos', DOCK_POS);
document.body.appendChild(dpb);
