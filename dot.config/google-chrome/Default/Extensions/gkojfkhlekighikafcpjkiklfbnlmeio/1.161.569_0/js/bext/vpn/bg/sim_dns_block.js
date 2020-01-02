// LICENSE_CODE ZON
'use strict'; 
(()=>{

const param = /[?]orig_url=([^&]+)/.exec(location.search);
const link = decodeURIComponent(param ? param[1] : '');
if (link)
{
    const a = document.getElementById('link');
    a.href = link;
    a.style.display = 'inline';
}

})();
