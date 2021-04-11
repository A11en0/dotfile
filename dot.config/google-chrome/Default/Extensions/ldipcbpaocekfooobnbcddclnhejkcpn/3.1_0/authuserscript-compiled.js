(function(){/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
class c{get(a,b){chrome.storage.local.get(a,d=>{b(chrome.runtime.lastError?null:d)})}set(a){chrome.storage.local.set(a,function(){})}remove(a){chrome.storage.local.remove(a)}};{var e=new c;const a=new URLSearchParams(window.location.search),b=(parseInt(a.get("authuser"),10)||"0")+"";e.set({authuser:b})};}).call(this);
