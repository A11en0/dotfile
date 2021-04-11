'use strict';

let copytext = document.getElementById('copytext');
copytext.addEventListener('click', function() {
  const el = document.createElement('textarea');
  el.value = copytext.getAttribute('copytext');
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  return false;
});