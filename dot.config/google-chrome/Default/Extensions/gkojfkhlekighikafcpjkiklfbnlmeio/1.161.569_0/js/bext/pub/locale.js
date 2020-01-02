// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', '/bext/vpn/ui/locale/en.js', 'lang'], function (exports, _en, _lang) {Object.defineProperty(exports, "__esModule", { value: true });var _en2 = _interopRequireDefault(_en);var _lang2 = _interopRequireDefault(_lang);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}



        function require_err(locale, err) {
            try {localStorage.setItem('locale', 'en');}
            catch (e) {console.error('failed set localStorage.locale ' + e.stack);}
            if (window.hola && window.hola.base)
            {
                window.hola.base.perr({ id: 'be_lang_err', info: '' + locale + err,
                    bt: err.stack, filehead: 'userAgent: ' + navigator.userAgent });
            }
        }
        const E = get_message;
        E.locale = 'en';
        E.locales = _lang2.default.lang.slice();
        E.locale_curr = E.locale_en = _en2.default;

        try {E.locale = localStorage.getItem('locale');}
        catch (e) {console.error('failed to read locale ' + (e.stack || e));}
        if (!E.locales.includes(E.locale))
        {
            var navlang = (navigator.language || '').replace('-', '_');
            var choices = [navlang, navlang.substr(0, navlang.indexOf('_')), 'en'];
            for (var i = 0; i < choices.length; i++)
            {
                if (E.locales.includes(choices[i]))
                {
                    E.locale = choices[i];
                    break;
                }
            }
        }

        require(['/bext/vpn/ui/locale/' + E.locale + '.js'], locale_curr => {
            E.locale_curr = locale_curr;
            try {localStorage.setItem('locale', E.locale);}
            catch (e) {console.error('failed to setup locale ' + (e.stack || e));}
        }, err => {
            require_err(E.locale, err);
            E.locale = 'en';
        });

        E.is_rtl = () => /^(ar|he|fa|ur)$/.test(E.locale);

        function get_message(id, vals, locale) {
            var s,o = E.locale_curr[id] || _en2.default[id];
            if (locale)
            o = E.locale == locale && E.locale_curr[id] || _en2.default[id];
            if (!o)
            {
                if (false && window.hola.base.perr_once)
                {
                    window.hola.base.perr_once({ id: 'be_lang_missing',
                        info: '' + E.locale + '|' + id.substr(0, 512),
                        rate_limit: { count: 3 } });
                }
                s = id;
            } else

            s = o.message;
            if (!vals)
            return s;
            for (var i = 0; i < vals.length; i++)
            s = s.replace('$' + (i + 1), vals[i]);
            return s;
        }exports.default =

        E;});})();
//# sourceMappingURL=locale.js.map
