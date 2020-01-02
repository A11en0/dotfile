// LICENSE_CODE ZON
'use strict'; 
(function(){
var define;
var is_node = typeof module=='object' && module.exports && module.children;
if (!is_node)
    define = self.define;
else
    define = require('./require_node.js').define(module, '../');
define([], function(){
var E = {};

function imul64h(a, b){
    var ah = (a>>>16)&0xffff;
    var al = a&0xffff;
    var bh = (b>>>16)&0xffff;
    var bl = b&0xffff;
    return (ah*bh + (ah*bl+al*bh)>>16)|0;
}
E.hash_int = function(val){
    var xh = imul64h(val, 1103515245);
    var xl = Math.imul(val, 1103515245);
    return (xl-xh)>>>0;
};

E.hash_string = function(s){
    if (!s.length)
        return 0;
    var hash = E.hash_int(s.length);
    for (var i=0; i<s.length; i+=2)
    {
        hash = E.hash_int(
            (hash+(s.charCodeAt(i)<<16)+(s.charCodeAt(i+1)|0))>>>0);
    }
    return hash;
};

E.sum_parse = function(str){
    var parts = /([0-9a-f]+)\s+([ *]?)(.*)/i.exec(str);
    if (!parts)
        return null;
    return {hash: parts[1], type: parts[2]=='*' ? 'binary' : 'text',
        file: parts[3]};
};

return E; }); }());
