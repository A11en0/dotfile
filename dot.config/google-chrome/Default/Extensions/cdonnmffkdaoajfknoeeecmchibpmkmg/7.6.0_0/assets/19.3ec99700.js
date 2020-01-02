(window.saladictJSONP=window.saladictJSONP||[]).push([[19],{193:function(e,t,i){var r;
/*!
 * UAParser.js v0.7.20
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright © 2012-2019 Faisal Salman <f@faisalman.com>
 * Licensed under MIT License
 */!function(o,n){"use strict";var s="model",a="name",u="type",l="vendor",d="version",c="mobile",h="tablet",f={extend:function(e,t){var i={};for(var r in e)t[r]&&t[r].length%2==0?i[r]=t[r].concat(e[r]):i[r]=e[r];return i},has:function(e,t){return"string"==typeof e&&-1!==t.toLowerCase().indexOf(e.toLowerCase())},lowerize:function(e){return e.toLowerCase()},major:function(e){return"string"==typeof e?e.replace(/[^\d\.]/g,"").split(".")[0]:void 0},trim:function(e){return e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}},g={rgx:function(e,t){for(var i,r,o,n,s,a,u=0;u<t.length&&!s;){var l=t[u],d=t[u+1];for(i=r=0;i<l.length&&!s;)if(s=l[i++].exec(e))for(o=0;o<d.length;o++)a=s[++r],"object"==typeof(n=d[o])&&n.length>0?2==n.length?"function"==typeof n[1]?this[n[0]]=n[1].call(this,a):this[n[0]]=n[1]:3==n.length?"function"!=typeof n[1]||n[1].exec&&n[1].test?this[n[0]]=a?a.replace(n[1],n[2]):void 0:this[n[0]]=a?n[1].call(this,a,n[2]):void 0:4==n.length&&(this[n[0]]=a?n[3].call(this,a.replace(n[1],n[2])):void 0):this[n]=a||void 0;u+=2}},str:function(e,t){for(var i in t)if("object"==typeof t[i]&&t[i].length>0){for(var r=0;r<t[i].length;r++)if(f.has(t[i][r],e))return"?"===i?void 0:i}else if(f.has(t[i],e))return"?"===i?void 0:i;return e}},w={browser:{oldsafari:{version:{"1.0":"/8",1.2:"/1",1.3:"/3","2.0":"/412","2.0.2":"/416","2.0.3":"/417","2.0.4":"/419","?":"/"}}},device:{amazon:{model:{"Fire Phone":["SD","KF"]}},sprint:{model:{"Evo Shift 4G":"7373KT"},vendor:{HTC:"APA",Sprint:"Sprint"}}},os:{windows:{version:{ME:"4.90","NT 3.11":"NT3.51","NT 4.0":"NT4.0",2e3:"NT 5.0",XP:["NT 5.1","NT 5.2"],Vista:"NT 6.0",7:"NT 6.1",8:"NT 6.2",8.1:"NT 6.3",10:["NT 6.4","NT 10.0"],RT:"ARM"}}}},m={browser:[[/(opera\smini)\/([\w\.-]+)/i,/(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,/(opera).+version\/([\w\.]+)/i,/(opera)[\/\s]+([\w\.]+)/i],[a,d],[/(opios)[\/\s]+([\w\.]+)/i],[[a,"Opera Mini"],d],[/\s(opr)\/([\w\.]+)/i],[[a,"Opera"],d],[/(kindle)\/([\w\.]+)/i,/(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]*)/i,/(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,/(?:ms|\()(ie)\s([\w\.]+)/i,/(rekonq)\/([\w\.]*)/i,/(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon)\/([\w\.-]+)/i],[a,d],[/(konqueror)\/([\w\.]+)/i],[[a,"Konqueror"],d],[/(trident).+rv[:\s]([\w\.]+).+like\sgecko/i],[[a,"IE"],d],[/(edge|edgios|edga|edg)\/((\d+)?[\w\.]+)/i],[[a,"Edge"],d],[/(yabrowser)\/([\w\.]+)/i],[[a,"Yandex"],d],[/(puffin)\/([\w\.]+)/i],[[a,"Puffin"],d],[/(focus)\/([\w\.]+)/i],[[a,"Firefox Focus"],d],[/(opt)\/([\w\.]+)/i],[[a,"Opera Touch"],d],[/((?:[\s\/])uc?\s?browser|(?:juc.+)ucweb)[\/\s]?([\w\.]+)/i],[[a,"UCBrowser"],d],[/(comodo_dragon)\/([\w\.]+)/i],[[a,/_/g," "],d],[/(windowswechat qbcore)\/([\w\.]+)/i],[[a,"WeChat(Win) Desktop"],d],[/(micromessenger)\/([\w\.]+)/i],[[a,"WeChat"],d],[/(brave)\/([\w\.]+)/i],[[a,"Brave"],d],[/(qqbrowserlite)\/([\w\.]+)/i],[a,d],[/(QQ)\/([\d\.]+)/i],[a,d],[/m?(qqbrowser)[\/\s]?([\w\.]+)/i],[a,d],[/(BIDUBrowser)[\/\s]?([\w\.]+)/i],[a,d],[/(2345Explorer)[\/\s]?([\w\.]+)/i],[a,d],[/(MetaSr)[\/\s]?([\w\.]+)/i],[a],[/(LBBROWSER)/i],[a],[/xiaomi\/miuibrowser\/([\w\.]+)/i],[d,[a,"MIUI Browser"]],[/;fbav\/([\w\.]+);/i],[d,[a,"Facebook"]],[/safari\s(line)\/([\w\.]+)/i,/android.+(line)\/([\w\.]+)\/iab/i],[a,d],[/headlesschrome(?:\/([\w\.]+)|\s)/i],[d,[a,"Chrome Headless"]],[/\swv\).+(chrome)\/([\w\.]+)/i],[[a,/(.+)/,"$1 WebView"],d],[/((?:oculus|samsung)browser)\/([\w\.]+)/i],[[a,/(.+(?:g|us))(.+)/,"$1 $2"],d],[/android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)*/i],[d,[a,"Android Browser"]],[/(sailfishbrowser)\/([\w\.]+)/i],[[a,"Sailfish Browser"],d],[/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i],[a,d],[/(dolfin)\/([\w\.]+)/i],[[a,"Dolphin"],d],[/((?:android.+)crmo|crios)\/([\w\.]+)/i],[[a,"Chrome"],d],[/(coast)\/([\w\.]+)/i],[[a,"Opera Coast"],d],[/fxios\/([\w\.-]+)/i],[d,[a,"Firefox"]],[/version\/([\w\.]+).+?mobile\/\w+\s(safari)/i],[d,[a,"Mobile Safari"]],[/version\/([\w\.]+).+?(mobile\s?safari|safari)/i],[d,a],[/webkit.+?(gsa)\/([\w\.]+).+?(mobile\s?safari|safari)(\/[\w\.]+)/i],[[a,"GSA"],d],[/webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i],[a,[d,g.str,w.browser.oldsafari.version]],[/(webkit|khtml)\/([\w\.]+)/i],[a,d],[/(navigator|netscape)\/([\w\.-]+)/i],[[a,"Netscape"],d],[/(swiftfox)/i,/(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,/(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([\w\.-]+)$/i,/(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,/(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,/(links)\s\(([\w\.]+)/i,/(gobrowser)\/?([\w\.]*)/i,/(ice\s?browser)\/v?([\w\._]+)/i,/(mosaic)[\/\s]([\w\.]+)/i],[a,d]],cpu:[[/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i],[["architecture","amd64"]],[/(ia32(?=;))/i],[["architecture",f.lowerize]],[/((?:i[346]|x)86)[;\)]/i],[["architecture","ia32"]],[/windows\s(ce|mobile);\sppc;/i],[["architecture","arm"]],[/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i],[["architecture",/ower/,"",f.lowerize]],[/(sun4\w)[;\)]/i],[["architecture","sparc"]],[/((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+[;l]))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i],[["architecture",f.lowerize]]],device:[[/\((ipad|playbook);[\w\s\),;-]+(rim|apple)/i],[s,l,[u,h]],[/applecoremedia\/[\w\.]+ \((ipad)/],[s,[l,"Apple"],[u,h]],[/(apple\s{0,1}tv)/i],[[s,"Apple TV"],[l,"Apple"]],[/(archos)\s(gamepad2?)/i,/(hp).+(touchpad)/i,/(hp).+(tablet)/i,/(kindle)\/([\w\.]+)/i,/\s(nook)[\w\s]+build\/(\w+)/i,/(dell)\s(strea[kpr\s\d]*[\dko])/i],[l,s,[u,h]],[/(kf[A-z]+)\sbuild\/.+silk\//i],[s,[l,"Amazon"],[u,h]],[/(sd|kf)[0349hijorstuw]+\sbuild\/.+silk\//i],[[s,g.str,w.device.amazon.model],[l,"Amazon"],[u,c]],[/android.+aft([bms])\sbuild/i],[s,[l,"Amazon"],[u,"smarttv"]],[/\((ip[honed|\s\w*]+);.+(apple)/i],[s,l,[u,c]],[/\((ip[honed|\s\w*]+);/i],[s,[l,"Apple"],[u,c]],[/(blackberry)[\s-]?(\w+)/i,/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[\s_-]?([\w-]*)/i,/(hp)\s([\w\s]+\w)/i,/(asus)-?(\w+)/i],[l,s,[u,c]],[/\(bb10;\s(\w+)/i],[s,[l,"BlackBerry"],[u,c]],[/android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7|padfone|p00c)/i],[s,[l,"Asus"],[u,h]],[/(sony)\s(tablet\s[ps])\sbuild\//i,/(sony)?(?:sgp.+)\sbuild\//i],[[l,"Sony"],[s,"Xperia Tablet"],[u,h]],[/android.+\s([c-g]\d{4}|so[-l]\w+)(?=\sbuild\/|\).+chrome\/(?![1-6]{0,1}\d\.))/i],[s,[l,"Sony"],[u,c]],[/\s(ouya)\s/i,/(nintendo)\s([wids3u]+)/i],[l,s,[u,"console"]],[/android.+;\s(shield)\sbuild/i],[s,[l,"Nvidia"],[u,"console"]],[/(playstation\s[34portablevi]+)/i],[s,[l,"Sony"],[u,"console"]],[/(sprint\s(\w+))/i],[[l,g.str,w.device.sprint.vendor],[s,g.str,w.device.sprint.model],[u,c]],[/(htc)[;_\s-]+([\w\s]+(?=\)|\sbuild)|\w+)/i,/(zte)-(\w*)/i,/(alcatel|geeksphone|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]*)/i],[l,[s,/_/g," "],[u,c]],[/(nexus\s9)/i],[s,[l,"HTC"],[u,h]],[/d\/huawei([\w\s-]+)[;\)]/i,/(nexus\s6p)/i],[s,[l,"Huawei"],[u,c]],[/(microsoft);\s(lumia[\s\w]+)/i],[l,s,[u,c]],[/[\s\(;](xbox(?:\sone)?)[\s\);]/i],[s,[l,"Microsoft"],[u,"console"]],[/(kin\.[onetw]{3})/i],[[s,/\./g," "],[l,"Microsoft"],[u,c]],[/\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?:?(\s4g)?)[\w\s]+build\//i,/mot[\s-]?(\w*)/i,/(XT\d{3,4}) build\//i,/(nexus\s6)/i],[s,[l,"Motorola"],[u,c]],[/android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i],[s,[l,"Motorola"],[u,h]],[/hbbtv\/\d+\.\d+\.\d+\s+\([\w\s]*;\s*(\w[^;]*);([^;]*)/i],[[l,f.trim],[s,f.trim],[u,"smarttv"]],[/hbbtv.+maple;(\d+)/i],[[s,/^/,"SmartTV"],[l,"Samsung"],[u,"smarttv"]],[/\(dtv[\);].+(aquos)/i],[s,[l,"Sharp"],[u,"smarttv"]],[/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n\d+|sgh-t8[56]9|nexus 10))/i,/((SM-T\w+))/i],[[l,"Samsung"],s,[u,h]],[/smart-tv.+(samsung)/i],[l,[u,"smarttv"],s],[/((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-\w[\w\d]+))/i,/(sam[sung]*)[\s-]*(\w+-?[\w-]*)/i,/sec-((sgh\w+))/i],[[l,"Samsung"],s,[u,c]],[/sie-(\w*)/i],[s,[l,"Siemens"],[u,c]],[/(maemo|nokia).*(n900|lumia\s\d+)/i,/(nokia)[\s_-]?([\w-]*)/i],[[l,"Nokia"],s,[u,c]],[/android[x\d\.\s;]+\s([ab][1-7]\-?[0178a]\d\d?)/i],[s,[l,"Acer"],[u,h]],[/android.+([vl]k\-?\d{3})\s+build/i],[s,[l,"LG"],[u,h]],[/android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i],[[l,"LG"],s,[u,h]],[/(lg) netcast\.tv/i],[l,s,[u,"smarttv"]],[/(nexus\s[45])/i,/lg[e;\s\/-]+(\w*)/i,/android.+lg(\-?[\d\w]+)\s+build/i],[s,[l,"LG"],[u,c]],[/(lenovo)\s?(s(?:5000|6000)(?:[\w-]+)|tab(?:[\s\w]+))/i],[l,s,[u,h]],[/android.+(ideatab[a-z0-9\-\s]+)/i],[s,[l,"Lenovo"],[u,h]],[/(lenovo)[_\s-]?([\w-]+)/i],[l,s,[u,c]],[/linux;.+((jolla));/i],[l,s,[u,c]],[/((pebble))app\/[\d\.]+\s/i],[l,s,[u,"wearable"]],[/android.+;\s(oppo)\s?([\w\s]+)\sbuild/i],[l,s,[u,c]],[/crkey/i],[[s,"Chromecast"],[l,"Google"]],[/android.+;\s(glass)\s\d/i],[s,[l,"Google"],[u,"wearable"]],[/android.+;\s(pixel c)[\s)]/i],[s,[l,"Google"],[u,h]],[/android.+;\s(pixel( [23])?( xl)?)[\s)]/i],[s,[l,"Google"],[u,c]],[/android.+;\s(\w+)\s+build\/hm\1/i,/android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,/android.+(mi[\s\-_]*(?:a\d|one|one[\s_]plus|note lte)?[\s_]*(?:\d?\w?)[\s_]*(?:plus)?)\s+build/i,/android.+(redmi[\s\-_]*(?:note)?(?:[\s_]*[\w\s]+))\s+build/i],[[s,/_/g," "],[l,"Xiaomi"],[u,c]],[/android.+(mi[\s\-_]*(?:pad)(?:[\s_]*[\w\s]+))\s+build/i],[[s,/_/g," "],[l,"Xiaomi"],[u,h]],[/android.+;\s(m[1-5]\snote)\sbuild/i],[s,[l,"Meizu"],[u,c]],[/(mz)-([\w-]{2,})/i],[[l,"Meizu"],s,[u,c]],[/android.+a000(1)\s+build/i,/android.+oneplus\s(a\d{4})\s+build/i],[s,[l,"OnePlus"],[u,c]],[/android.+[;\/]\s*(RCT[\d\w]+)\s+build/i],[s,[l,"RCA"],[u,h]],[/android.+[;\/\s]+(Venue[\d\s]{2,7})\s+build/i],[s,[l,"Dell"],[u,h]],[/android.+[;\/]\s*(Q[T|M][\d\w]+)\s+build/i],[s,[l,"Verizon"],[u,h]],[/android.+[;\/]\s+(Barnes[&\s]+Noble\s+|BN[RT])(V?.*)\s+build/i],[[l,"Barnes & Noble"],s,[u,h]],[/android.+[;\/]\s+(TM\d{3}.*\b)\s+build/i],[s,[l,"NuVision"],[u,h]],[/android.+;\s(k88)\sbuild/i],[s,[l,"ZTE"],[u,h]],[/android.+[;\/]\s*(gen\d{3})\s+build.*49h/i],[s,[l,"Swiss"],[u,c]],[/android.+[;\/]\s*(zur\d{3})\s+build/i],[s,[l,"Swiss"],[u,h]],[/android.+[;\/]\s*((Zeki)?TB.*\b)\s+build/i],[s,[l,"Zeki"],[u,h]],[/(android).+[;\/]\s+([YR]\d{2})\s+build/i,/android.+[;\/]\s+(Dragon[\-\s]+Touch\s+|DT)(\w{5})\sbuild/i],[[l,"Dragon Touch"],s,[u,h]],[/android.+[;\/]\s*(NS-?\w{0,9})\sbuild/i],[s,[l,"Insignia"],[u,h]],[/android.+[;\/]\s*((NX|Next)-?\w{0,9})\s+build/i],[s,[l,"NextBook"],[u,h]],[/android.+[;\/]\s*(Xtreme\_)?(V(1[045]|2[015]|30|40|60|7[05]|90))\s+build/i],[[l,"Voice"],s,[u,c]],[/android.+[;\/]\s*(LVTEL\-)?(V1[12])\s+build/i],[[l,"LvTel"],s,[u,c]],[/android.+;\s(PH-1)\s/i],[s,[l,"Essential"],[u,c]],[/android.+[;\/]\s*(V(100MD|700NA|7011|917G).*\b)\s+build/i],[s,[l,"Envizen"],[u,h]],[/android.+[;\/]\s*(Le[\s\-]+Pan)[\s\-]+(\w{1,9})\s+build/i],[l,s,[u,h]],[/android.+[;\/]\s*(Trio[\s\-]*.*)\s+build/i],[s,[l,"MachSpeed"],[u,h]],[/android.+[;\/]\s*(Trinity)[\-\s]*(T\d{3})\s+build/i],[l,s,[u,h]],[/android.+[;\/]\s*TU_(1491)\s+build/i],[s,[l,"Rotor"],[u,h]],[/android.+(KS(.+))\s+build/i],[s,[l,"Amazon"],[u,h]],[/android.+(Gigaset)[\s\-]+(Q\w{1,9})\s+build/i],[l,s,[u,h]],[/\s(tablet|tab)[;\/]/i,/\s(mobile)(?:[;\/]|\ssafari)/i],[[u,f.lowerize],l,s],[/[\s\/\(](smart-?tv)[;\)]/i],[[u,"smarttv"]],[/(android[\w\.\s\-]{0,9});.+build/i],[s,[l,"Generic"]]],engine:[[/windows.+\sedge\/([\w\.]+)/i],[d,[a,"EdgeHTML"]],[/webkit\/537\.36.+chrome\/(?!27)/i],[[a,"Blink"]],[/(presto)\/([\w\.]+)/i,/(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,/(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,/(icab)[\/\s]([23]\.[\d\.]+)/i],[a,d],[/rv\:([\w\.]{1,9}).+(gecko)/i],[d,a]],os:[[/microsoft\s(windows)\s(vista|xp)/i],[a,d],[/(windows)\snt\s6\.2;\s(arm)/i,/(windows\sphone(?:\sos)*)[\s\/]?([\d\.\s\w]*)/i,/(windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i],[a,[d,g.str,w.os.windows.version]],[/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i],[[a,"Windows"],[d,g.str,w.os.windows.version]],[/\((bb)(10);/i],[[a,"BlackBerry"],d],[/(blackberry)\w*\/?([\w\.]*)/i,/(tizen)[\/\s]([\w\.]+)/i,/(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|sailfish|contiki)[\/\s-]?([\w\.]*)/i],[a,d],[/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]*)/i],[[a,"Symbian"],d],[/\((series40);/i],[a],[/mozilla.+\(mobile;.+gecko.+firefox/i],[[a,"Firefox OS"],d],[/(nintendo|playstation)\s([wids34portablevu]+)/i,/(mint)[\/\s\(]?(\w*)/i,/(mageia|vectorlinux)[;\s]/i,/(joli|[kxln]?ubuntu|debian|suse|opensuse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?(?!chrom)([\w\.-]*)/i,/(hurd|linux)\s?([\w\.]*)/i,/(gnu)\s?([\w\.]*)/i],[a,d],[/(cros)\s[\w]+\s([\w\.]+\w)/i],[[a,"Chromium OS"],d],[/(sunos)\s?([\w\.\d]*)/i],[[a,"Solaris"],d],[/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]*)/i],[a,d],[/(haiku)\s(\w+)/i],[a,d],[/cfnetwork\/.+darwin/i,/ip[honead]{2,4}(?:.*os\s([\w]+)\slike\smac|;\sopera)/i],[[d,/_/g,"."],[a,"iOS"]],[/(mac\sos\sx)\s?([\w\s\.]*)/i,/(macintosh|mac(?=_powerpc)\s)/i],[[a,"Mac OS"],[d,/_/g,"."]],[/((?:open)?solaris)[\/\s-]?([\w\.]*)/i,/(aix)\s((\d)(?=\.|\)|\s)[\w\.])*/i,/(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms|fuchsia)/i,/(unix)\s?([\w\.]*)/i],[a,d]]},p=function(e,t){if("object"==typeof e&&(t=e,e=void 0),!(this instanceof p))return new p(e,t).getResult();var i=e||(o&&o.navigator&&o.navigator.userAgent?o.navigator.userAgent:""),r=t?f.extend(m,t):m;return this.getBrowser=function(){var e={name:void 0,version:void 0};return g.rgx.call(e,i,r.browser),e.major=f.major(e.version),e},this.getCPU=function(){var e={architecture:void 0};return g.rgx.call(e,i,r.cpu),e},this.getDevice=function(){var e={vendor:void 0,model:void 0,type:void 0};return g.rgx.call(e,i,r.device),e},this.getEngine=function(){var e={name:void 0,version:void 0};return g.rgx.call(e,i,r.engine),e},this.getOS=function(){var e={name:void 0,version:void 0};return g.rgx.call(e,i,r.os),e},this.getResult=function(){return{ua:this.getUA(),browser:this.getBrowser(),engine:this.getEngine(),os:this.getOS(),device:this.getDevice(),cpu:this.getCPU()}},this.getUA=function(){return i},this.setUA=function(e){return i=e,this},this};p.VERSION="0.7.20",p.BROWSER={NAME:a,MAJOR:"major",VERSION:d},p.CPU={ARCHITECTURE:"architecture"},p.DEVICE={MODEL:s,VENDOR:l,TYPE:u,CONSOLE:"console",MOBILE:c,SMARTTV:"smarttv",TABLET:h,WEARABLE:"wearable",EMBEDDED:"embedded"},p.ENGINE={NAME:a,VERSION:d},p.OS={NAME:a,VERSION:d},void 0!==t?(void 0!==e&&e.exports&&(t=e.exports=p),t.UAParser=p):void 0===(r=function(){return p}.call(t,i,t,e))||(e.exports=r);var v=o&&(o.jQuery||o.Zepto);if(void 0!==v&&!v.ua){var b=new p;v.ua=b.getResult(),v.ua.get=function(){return b.getUA()},v.ua.set=function(e){b.setUA(e);var t=b.getResult();for(var i in t)v.ua[i]=t[i]}}}("object"==typeof window?window:this)},799:function(e,t){e.exports={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8}},800:function(e,t){e.exports={L:1,M:0,Q:3,H:2}},801:function(e,t,i){var r=i(802);function o(e,t){if(null==e.length)throw new Error(e.length+"/"+t);for(var i=0;i<e.length&&0==e[i];)i++;this.num=new Array(e.length-i+t);for(var r=0;r<e.length-i;r++)this.num[r]=e[r+i]}o.prototype={get:function(e){return this.num[e]},getLength:function(){return this.num.length},multiply:function(e){for(var t=new Array(this.getLength()+e.getLength()-1),i=0;i<this.getLength();i++)for(var n=0;n<e.getLength();n++)t[i+n]^=r.gexp(r.glog(this.get(i))+r.glog(e.get(n)));return new o(t,0)},mod:function(e){if(this.getLength()-e.getLength()<0)return this;for(var t=r.glog(this.get(0))-r.glog(e.get(0)),i=new Array(this.getLength()),n=0;n<this.getLength();n++)i[n]=this.get(n);for(n=0;n<e.getLength();n++)i[n]^=r.gexp(r.glog(e.get(n))+t);return new o(i,0).mod(e)}},e.exports=o},802:function(e,t){for(var i={glog:function(e){if(e<1)throw new Error("glog("+e+")");return i.LOG_TABLE[e]},gexp:function(e){for(;e<0;)e+=255;for(;e>=256;)e-=255;return i.EXP_TABLE[e]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},r=0;r<8;r++)i.EXP_TABLE[r]=1<<r;for(r=8;r<256;r++)i.EXP_TABLE[r]=i.EXP_TABLE[r-4]^i.EXP_TABLE[r-5]^i.EXP_TABLE[r-6]^i.EXP_TABLE[r-8];for(r=0;r<255;r++)i.LOG_TABLE[i.EXP_TABLE[r]]=r;e.exports=i},869:function(e,t,i){"use strict";function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function o(){return(o=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var r in i)Object.prototype.hasOwnProperty.call(i,r)&&(e[r]=i[r])}return e}).apply(this,arguments)}function n(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{},r=Object.keys(i);"function"==typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(i).filter((function(e){return Object.getOwnPropertyDescriptor(i,e).enumerable})))),r.forEach((function(t){w(e,t,i[t])}))}return e}function s(e,t){if(null==e)return{};var i,r,o=function(e,t){if(null==e)return{};var i,r,o={},n=Object.keys(e);for(r=0;r<n.length;r++)i=n[r],t.indexOf(i)>=0||(o[i]=e[i]);return o}(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(r=0;r<n.length;r++)i=n[r],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(o[i]=e[i])}return o}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function u(e,t){for(var i=0;i<t.length;i++){var r=t[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function l(e,t,i){return t&&u(e.prototype,t),i&&u(e,i),e}function d(e,t){return!t||"object"!==r(t)&&"function"!=typeof t?g(e):t}function c(e){return(c=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function h(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&f(e,t)}function f(e,t){return(f=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function g(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function w(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}var m=i(0),p=i(1),v=i(941),b=i(800);function y(e){for(var t="",i=0;i<e.length;i++){var r=e.charCodeAt(i);r<128?t+=String.fromCharCode(r):r<2048?(t+=String.fromCharCode(192|r>>6),t+=String.fromCharCode(128|63&r)):r<55296||r>=57344?(t+=String.fromCharCode(224|r>>12),t+=String.fromCharCode(128|r>>6&63),t+=String.fromCharCode(128|63&r)):(i++,r=65536+((1023&r)<<10|1023&e.charCodeAt(i)),t+=String.fromCharCode(240|r>>18),t+=String.fromCharCode(128|r>>12&63),t+=String.fromCharCode(128|r>>6&63),t+=String.fromCharCode(128|63&r))}return t}var C={size:128,level:"L",bgColor:"#FFFFFF",fgColor:"#000000",includeMargin:!1},E={value:p.string.isRequired,size:p.number,level:p.oneOf(["L","M","Q","H"]),bgColor:p.string,fgColor:p.string,includeMargin:p.bool};function k(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,i=[];return e.forEach((function(e,r){var o=null;e.forEach((function(n,s){if(!n&&null!==o)return i.push("M".concat(o+t," ").concat(r+t,"h").concat(s-o,"v1H").concat(o+t,"z")),void(o=null);if(s!==e.length-1)n&&null===o&&(o=s);else{if(!n)return;null===o?i.push("M".concat(s+t,",").concat(r+t," h1v1H").concat(s+t,"z")):i.push("M".concat(o+t,",").concat(r+t," h").concat(s+1-o,"v1H").concat(o+t,"z"))}}))})),i.join("")}var B=function(){try{(new Path2D).addPath(new Path2D)}catch(e){return!1}return!0}(),T=function(e){function t(){var e,i;a(this,t);for(var r=arguments.length,o=new Array(r),n=0;n<r;n++)o[n]=arguments[n];return w(g(g(i=d(this,(e=c(t)).call.apply(e,[this].concat(o))))),"_canvas",void 0),i}return h(t,e),l(t,[{key:"componentDidMount",value:function(){this.update()}},{key:"componentDidUpdate",value:function(){this.update()}},{key:"update",value:function(){var e=this.props,t=e.value,i=e.size,r=e.level,o=e.bgColor,n=e.fgColor,s=e.includeMargin,a=new v(-1,b[r]);if(a.addData(y(t)),a.make(),null!=this._canvas){var u=this._canvas,l=u.getContext("2d");if(!l)return;var d=a.modules;if(null===d)return;var c=s?4:0,h=d.length+2*c,f=window.devicePixelRatio||1;u.height=u.width=i*f;var g=i/h*f;l.scale(g,g),l.fillStyle=o,l.fillRect(0,0,h,h),l.fillStyle=n,B?l.fill(new Path2D(k(d,c))):d.forEach((function(e,t){e.forEach((function(e,i){e&&l.fillRect(i+c,t+c,1,1)}))}))}}},{key:"render",value:function(){var e=this,t=this.props,i=(t.value,t.size),r=(t.level,t.bgColor,t.fgColor,t.style),a=(t.includeMargin,s(t,["value","size","level","bgColor","fgColor","style","includeMargin"])),u=n({height:i,width:i},r);return m.createElement("canvas",o({style:u,height:i,width:i,ref:function(t){return e._canvas=t}},a))}}]),t}(m.PureComponent);w(T,"defaultProps",C),w(T,"propTypes",E);var A=function(e){function t(){return a(this,t),d(this,c(t).apply(this,arguments))}return h(t,e),l(t,[{key:"render",value:function(){var e=this.props,t=e.value,i=e.size,r=e.level,n=e.bgColor,a=e.fgColor,u=e.includeMargin,l=s(e,["value","size","level","bgColor","fgColor","includeMargin"]),d=new v(-1,b[r]);d.addData(y(t)),d.make();var c=d.modules;if(null===c)return null;var h=u?4:0,f=k(c,h),g=c.length+2*h;return m.createElement("svg",o({shapeRendering:"crispEdges",height:i,width:i,viewBox:"0 0 ".concat(g," ").concat(g)},l),m.createElement("path",{fill:n,d:"M0,0 h".concat(g,"v").concat(g,"H0z")}),m.createElement("path",{fill:a,d:f}))}}]),t}(m.PureComponent);w(A,"defaultProps",C),w(A,"propTypes",E);var _=function(e){var t=e.renderAs,i=s(e,["renderAs"]),r="svg"===t?A:T;return m.createElement(r,i)};_.defaultProps=n({renderAs:"canvas"},C),e.exports=_},941:function(e,t,i){var r=i(942),o=i(943),n=i(944),s=i(945),a=i(801);function u(e,t){this.typeNumber=e,this.errorCorrectLevel=t,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}var l=u.prototype;l.addData=function(e){var t=new r(e);this.dataList.push(t),this.dataCache=null},l.isDark=function(e,t){if(e<0||this.moduleCount<=e||t<0||this.moduleCount<=t)throw new Error(e+","+t);return this.modules[e][t]},l.getModuleCount=function(){return this.moduleCount},l.make=function(){if(this.typeNumber<1){var e=1;for(e=1;e<40;e++){for(var t=o.getRSBlocks(e,this.errorCorrectLevel),i=new n,r=0,a=0;a<t.length;a++)r+=t[a].dataCount;for(a=0;a<this.dataList.length;a++){var u=this.dataList[a];i.put(u.mode,4),i.put(u.getLength(),s.getLengthInBits(u.mode,e)),u.write(i)}if(i.getLengthInBits()<=8*r)break}this.typeNumber=e}this.makeImpl(!1,this.getBestMaskPattern())},l.makeImpl=function(e,t){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var i=0;i<this.moduleCount;i++){this.modules[i]=new Array(this.moduleCount);for(var r=0;r<this.moduleCount;r++)this.modules[i][r]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(e,t),this.typeNumber>=7&&this.setupTypeNumber(e),null==this.dataCache&&(this.dataCache=u.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,t)},l.setupPositionProbePattern=function(e,t){for(var i=-1;i<=7;i++)if(!(e+i<=-1||this.moduleCount<=e+i))for(var r=-1;r<=7;r++)t+r<=-1||this.moduleCount<=t+r||(this.modules[e+i][t+r]=0<=i&&i<=6&&(0==r||6==r)||0<=r&&r<=6&&(0==i||6==i)||2<=i&&i<=4&&2<=r&&r<=4)},l.getBestMaskPattern=function(){for(var e=0,t=0,i=0;i<8;i++){this.makeImpl(!0,i);var r=s.getLostPoint(this);(0==i||e>r)&&(e=r,t=i)}return t},l.createMovieClip=function(e,t,i){var r=e.createEmptyMovieClip(t,i);this.make();for(var o=0;o<this.modules.length;o++)for(var n=1*o,s=0;s<this.modules[o].length;s++){var a=1*s;this.modules[o][s]&&(r.beginFill(0,100),r.moveTo(a,n),r.lineTo(a+1,n),r.lineTo(a+1,n+1),r.lineTo(a,n+1),r.endFill())}return r},l.setupTimingPattern=function(){for(var e=8;e<this.moduleCount-8;e++)null==this.modules[e][6]&&(this.modules[e][6]=e%2==0);for(var t=8;t<this.moduleCount-8;t++)null==this.modules[6][t]&&(this.modules[6][t]=t%2==0)},l.setupPositionAdjustPattern=function(){for(var e=s.getPatternPosition(this.typeNumber),t=0;t<e.length;t++)for(var i=0;i<e.length;i++){var r=e[t],o=e[i];if(null==this.modules[r][o])for(var n=-2;n<=2;n++)for(var a=-2;a<=2;a++)this.modules[r+n][o+a]=-2==n||2==n||-2==a||2==a||0==n&&0==a}},l.setupTypeNumber=function(e){for(var t=s.getBCHTypeNumber(this.typeNumber),i=0;i<18;i++){var r=!e&&1==(t>>i&1);this.modules[Math.floor(i/3)][i%3+this.moduleCount-8-3]=r}for(i=0;i<18;i++){r=!e&&1==(t>>i&1);this.modules[i%3+this.moduleCount-8-3][Math.floor(i/3)]=r}},l.setupTypeInfo=function(e,t){for(var i=this.errorCorrectLevel<<3|t,r=s.getBCHTypeInfo(i),o=0;o<15;o++){var n=!e&&1==(r>>o&1);o<6?this.modules[o][8]=n:o<8?this.modules[o+1][8]=n:this.modules[this.moduleCount-15+o][8]=n}for(o=0;o<15;o++){n=!e&&1==(r>>o&1);o<8?this.modules[8][this.moduleCount-o-1]=n:o<9?this.modules[8][15-o-1+1]=n:this.modules[8][15-o-1]=n}this.modules[this.moduleCount-8][8]=!e},l.mapData=function(e,t){for(var i=-1,r=this.moduleCount-1,o=7,n=0,a=this.moduleCount-1;a>0;a-=2)for(6==a&&a--;;){for(var u=0;u<2;u++)if(null==this.modules[r][a-u]){var l=!1;n<e.length&&(l=1==(e[n]>>>o&1)),s.getMask(t,r,a-u)&&(l=!l),this.modules[r][a-u]=l,-1==--o&&(n++,o=7)}if((r+=i)<0||this.moduleCount<=r){r-=i,i=-i;break}}},u.PAD0=236,u.PAD1=17,u.createData=function(e,t,i){for(var r=o.getRSBlocks(e,t),a=new n,l=0;l<i.length;l++){var d=i[l];a.put(d.mode,4),a.put(d.getLength(),s.getLengthInBits(d.mode,e)),d.write(a)}var c=0;for(l=0;l<r.length;l++)c+=r[l].dataCount;if(a.getLengthInBits()>8*c)throw new Error("code length overflow. ("+a.getLengthInBits()+">"+8*c+")");for(a.getLengthInBits()+4<=8*c&&a.put(0,4);a.getLengthInBits()%8!=0;)a.putBit(!1);for(;!(a.getLengthInBits()>=8*c||(a.put(u.PAD0,8),a.getLengthInBits()>=8*c));)a.put(u.PAD1,8);return u.createBytes(a,r)},u.createBytes=function(e,t){for(var i=0,r=0,o=0,n=new Array(t.length),u=new Array(t.length),l=0;l<t.length;l++){var d=t[l].dataCount,c=t[l].totalCount-d;r=Math.max(r,d),o=Math.max(o,c),n[l]=new Array(d);for(var h=0;h<n[l].length;h++)n[l][h]=255&e.buffer[h+i];i+=d;var f=s.getErrorCorrectPolynomial(c),g=new a(n[l],f.getLength()-1).mod(f);u[l]=new Array(f.getLength()-1);for(h=0;h<u[l].length;h++){var w=h+g.getLength()-u[l].length;u[l][h]=w>=0?g.get(w):0}}var m=0;for(h=0;h<t.length;h++)m+=t[h].totalCount;var p=new Array(m),v=0;for(h=0;h<r;h++)for(l=0;l<t.length;l++)h<n[l].length&&(p[v++]=n[l][h]);for(h=0;h<o;h++)for(l=0;l<t.length;l++)h<u[l].length&&(p[v++]=u[l][h]);return p},e.exports=u},942:function(e,t,i){var r=i(799);function o(e){this.mode=r.MODE_8BIT_BYTE,this.data=e}o.prototype={getLength:function(e){return this.data.length},write:function(e){for(var t=0;t<this.data.length;t++)e.put(this.data.charCodeAt(t),8)}},e.exports=o},943:function(e,t,i){var r=i(800);function o(e,t){this.totalCount=e,this.dataCount=t}o.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],o.getRSBlocks=function(e,t){var i=o.getRsBlockTable(e,t);if(null==i)throw new Error("bad rs block @ typeNumber:"+e+"/errorCorrectLevel:"+t);for(var r=i.length/3,n=new Array,s=0;s<r;s++)for(var a=i[3*s+0],u=i[3*s+1],l=i[3*s+2],d=0;d<a;d++)n.push(new o(u,l));return n},o.getRsBlockTable=function(e,t){switch(t){case r.L:return o.RS_BLOCK_TABLE[4*(e-1)+0];case r.M:return o.RS_BLOCK_TABLE[4*(e-1)+1];case r.Q:return o.RS_BLOCK_TABLE[4*(e-1)+2];case r.H:return o.RS_BLOCK_TABLE[4*(e-1)+3];default:return}},e.exports=o},944:function(e,t){function i(){this.buffer=new Array,this.length=0}i.prototype={get:function(e){var t=Math.floor(e/8);return 1==(this.buffer[t]>>>7-e%8&1)},put:function(e,t){for(var i=0;i<t;i++)this.putBit(1==(e>>>t-i-1&1))},getLengthInBits:function(){return this.length},putBit:function(e){var t=Math.floor(this.length/8);this.buffer.length<=t&&this.buffer.push(0),e&&(this.buffer[t]|=128>>>this.length%8),this.length++}},e.exports=i},945:function(e,t,i){var r=i(799),o=i(801),n=i(802),s=0,a=1,u=2,l=3,d=4,c=5,h=6,f=7,g={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(e){for(var t=e<<10;g.getBCHDigit(t)-g.getBCHDigit(g.G15)>=0;)t^=g.G15<<g.getBCHDigit(t)-g.getBCHDigit(g.G15);return(e<<10|t)^g.G15_MASK},getBCHTypeNumber:function(e){for(var t=e<<12;g.getBCHDigit(t)-g.getBCHDigit(g.G18)>=0;)t^=g.G18<<g.getBCHDigit(t)-g.getBCHDigit(g.G18);return e<<12|t},getBCHDigit:function(e){for(var t=0;0!=e;)t++,e>>>=1;return t},getPatternPosition:function(e){return g.PATTERN_POSITION_TABLE[e-1]},getMask:function(e,t,i){switch(e){case s:return(t+i)%2==0;case a:return t%2==0;case u:return i%3==0;case l:return(t+i)%3==0;case d:return(Math.floor(t/2)+Math.floor(i/3))%2==0;case c:return t*i%2+t*i%3==0;case h:return(t*i%2+t*i%3)%2==0;case f:return(t*i%3+(t+i)%2)%2==0;default:throw new Error("bad maskPattern:"+e)}},getErrorCorrectPolynomial:function(e){for(var t=new o([1],0),i=0;i<e;i++)t=t.multiply(new o([1,n.gexp(i)],0));return t},getLengthInBits:function(e,t){if(1<=t&&t<10)switch(e){case r.MODE_NUMBER:return 10;case r.MODE_ALPHA_NUM:return 9;case r.MODE_8BIT_BYTE:case r.MODE_KANJI:return 8;default:throw new Error("mode:"+e)}else if(t<27)switch(e){case r.MODE_NUMBER:return 12;case r.MODE_ALPHA_NUM:return 11;case r.MODE_8BIT_BYTE:return 16;case r.MODE_KANJI:return 10;default:throw new Error("mode:"+e)}else{if(!(t<41))throw new Error("type:"+t);switch(e){case r.MODE_NUMBER:return 14;case r.MODE_ALPHA_NUM:return 13;case r.MODE_8BIT_BYTE:return 16;case r.MODE_KANJI:return 12;default:throw new Error("mode:"+e)}}},getLostPoint:function(e){for(var t=e.getModuleCount(),i=0,r=0;r<t;r++)for(var o=0;o<t;o++){for(var n=0,s=e.isDark(r,o),a=-1;a<=1;a++)if(!(r+a<0||t<=r+a))for(var u=-1;u<=1;u++)o+u<0||t<=o+u||0==a&&0==u||s==e.isDark(r+a,o+u)&&n++;n>5&&(i+=3+n-5)}for(r=0;r<t-1;r++)for(o=0;o<t-1;o++){var l=0;e.isDark(r,o)&&l++,e.isDark(r+1,o)&&l++,e.isDark(r,o+1)&&l++,e.isDark(r+1,o+1)&&l++,0!=l&&4!=l||(i+=3)}for(r=0;r<t;r++)for(o=0;o<t-6;o++)e.isDark(r,o)&&!e.isDark(r,o+1)&&e.isDark(r,o+2)&&e.isDark(r,o+3)&&e.isDark(r,o+4)&&!e.isDark(r,o+5)&&e.isDark(r,o+6)&&(i+=40);for(o=0;o<t;o++)for(r=0;r<t-6;r++)e.isDark(r,o)&&!e.isDark(r+1,o)&&e.isDark(r+2,o)&&e.isDark(r+3,o)&&e.isDark(r+4,o)&&!e.isDark(r+5,o)&&e.isDark(r+6,o)&&(i+=40);var d=0;for(o=0;o<t;o++)for(r=0;r<t;r++)e.isDark(r,o)&&d++;return i+=10*(Math.abs(100*d/t/t-50)/5)}};e.exports=g}}]);