// LICENSE_CODE ZON
'use strict'; 
(function(){
let define;
const is_node = typeof module=='object' && module.exports && module.children;
if (!is_node)
    define = self.define;
else
    define = require('../../../util/require_node.js').define(module, '../');
define(['/util/etask.js', '/util/url.js', '/util/util.js'],
    (etask, zurl, zutil)=>{
const E = {}, assign = Object.assign;
const is_force_rule_for_country = (rule, country)=>{
    if (!country)
        return true;
    if (rule.countries)
        return rule.countries.includes(country);
    if (rule.exclude_countries)
        return !rule.exclude_countries.includes(country);
    return true;
};

E.convert_blob2check = (conf, name)=>{
    const rules = conf && conf[name] && conf[name].rules;
    if (!rules)
        return;
    conf[name].rules = rules.map(rule=>assign({}, rule, {
            domain: new RegExp('^'+zurl.http_glob_host(rule.domain)+'$')}));
};

E.find_rule = (root_url, conf, name, src_country)=>{
    const rules = conf && conf[name] && conf[name].rules;
    if (!rules || !root_url)
        return;
    return rules.find(rule=>{
        if (!rule.domain.test(root_url))
            return false;
        return is_force_rule_for_country(rule, src_country);
    });
};
return E; }); }());
