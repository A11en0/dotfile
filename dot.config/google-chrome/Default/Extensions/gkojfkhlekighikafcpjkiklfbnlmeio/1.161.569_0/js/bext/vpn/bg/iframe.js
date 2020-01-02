// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', '/util/etask.js', '/bext/vpn/bg/util.js'], function (exports, _etask, _util) {Object.defineProperty(exports, "__esModule", { value: true });var _etask2 = _interopRequireDefault(_etask);var _util2 = _interopRequireDefault(_util);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}


        const E = {},assign = Object.assign,chrome = window.chrome;

        function iframe_int() {
            let E_int = {},frame,fade,arrow_anim;

            const auto_px = { width: 1, height: 1, top: 1, left: 1, right: 1, bottom: 1,
                'max-width': 1, 'max-height': 1, 'min-width': 1, 'min-height': 1 };
            const is_number = n => !isNaN(parseFloat(n)) && isFinite(n);
            const set_css = (el, css_styles) => {
                Object.entries(css_styles).forEach(prop => {
                    var name = prop[0],value = prop[1];
                    if (value && is_number(value) && auto_px[name])
                    value += 'px';
                    el.style.setProperty(name, value, 'important');
                });
                return el;
            };

            const rm_element = el => {
                if (el && el.parentNode)
                el.parentNode.removeChild(el);
            };

            const append_element = el => {
                if (frame && frame.parentNode)
                frame.parentNode.appendChild(el);
            };

            const rm_fade = () => {
                fade = rm_element(fade);
            };

            const set_fade = show => {
                if (!show)
                {
                    if (!fade)
                    return;
                    if (fade.animate)
                    {
                        fade.animate([{ opacity: '1' }, { opacity: '0' }],
                        { duration: 300, easing: 'ease-in' }).
                        addEventListener('finish', rm_fade);
                    } else

                    rm_fade();
                    return;
                }
                if (fade)
                return;
                fade = set_css(document.createElement('div'), { position: 'fixed',
                    border: 'none', top: '0', left: '0', width: '100%', height: '100%',
                    'background-color': 'rgba(0, 0, 0, 0.3)', visibility: 'visibile',
                    'z-index': 2147483646 });
                append_element(fade);
                if (fade.animate)
                {
                    fade.animate([{ opacity: '0' }, { opacity: '1' }],
                    { duration: 300, easing: 'ease-in' });
                }
            };

            const animate = (el, css, time, cb) => {
                if (!el.animate)
                {
                    set_css(el, css);
                    if (cb)
                    cb();
                    return;
                }
                var first = el.getBoundingClientRect();
                set_css(el, Object.assign({ 'transform-origin': 'top left' }, css));
                var last = el.getBoundingClientRect();
                var scale_x = first.width / last.width;
                var scale_y = first.height / last.height;
                var dx = first.left - last.left;
                var dy = first.top - last.top;
                if (!dx && !dy && scale_x == 1 && scale_y == 1)
                return void cb && cb();
                var translate = 'translate(' + dx + 'px, ' + dy + 'px)';
                var scale = 'scale(' + scale_x + ', ' + scale_y + ')';
                el.animate([
                { transform: translate + ' ' + scale },
                { transform: 'translate(0, 0) scale(1, 1)' }],
                { duration: time || 200, easing: 'ease-in' }).
                addEventListener('finish', () => {
                    if (cb)
                    cb();
                });
            };

            E_int.add = (opt, styles) => {
                if (frame)
                return frame;
                let css = Object.assign({ position: 'absolute', border: 'none',
                    overflow: 'hidden', visibility: 'visibile', 'z-index': 100000 },
                styles || {});
                frame = set_css(document.createElement('iframe'), css);
                (opt.parent || document.body).appendChild(frame);
                if (opt.url)
                frame.setAttribute('src', opt.url);
                return frame;
            };

            E_int.resize = opt => {
                if (!frame)
                return;
                var css = { width: opt.width, height: opt.height,
                    margin: opt.margin || '' };
                if (opt.top !== undefined)
                css.top = opt.top;
                if (opt.left !== undefined)
                css.left = opt.left;
                if (opt.right !== undefined)
                css.right = opt.right;
                if (opt.bottom !== undefined)
                css.bottom = opt.bottom;
                if (opt.animate)
                animate(frame, css, opt.animation_time);else

                set_css(frame, opt);
                if (opt.fade !== undefined)
                set_fade(opt.fade);
            };

            E_int.show_arrow_anim = opt => {
                rm_element(arrow_anim);
                arrow_anim = set_css(document.createElement('iframe'), Object.assign({
                    position: 'fixed',
                    border: 'none',
                    overflow: 'hidden',
                    visibility: 'visibile',
                    'z-index': 2147483647,
                    'pointer-events': 'none' },
                opt.css));
                arrow_anim.setAttribute('src', opt.url);
                append_element(arrow_anim);
            };

            E_int.hide_arrow_anim = () => {
                arrow_anim = rm_element(arrow_anim);
            };

            E_int.remove = () => {
                if (!frame)
                return;
                rm_fade();
                frame = rm_element(frame);
                E_int.hide_arrow_anim();
            };
            E_int.css = set_css;

            return E_int;
        }

        E.get_inject_code = (func, opt) => {
            if (opt.no_func_wrap)
            return opt.func_is_str ? func : func.toString();
            return '(' + func.toString() + ')((' + iframe_int.toString() + ')(),' +
            JSON.stringify(opt || {}) + ')';
        };

        E.inject = (tab_id, func, opt, details) => {
            details = details || {};
            var tabapi = _util2.default.tabid2api(tab_id);
            var code = E.get_inject_code(func, opt);
            details.matchAboutBlank = true;
            return _etask2.default.cb_apply(chrome.tabs, '.executeScript',
            [tabapi, assign({ code }, details)]);
        };

        E.execute = (tab_id, func, opt) => {
            chrome.tabs.executeScript(_util2.default.tabid2api(tab_id), { allFrames: true,
                code: '(' + func.toString() + ')(' + JSON.stringify(opt || {}) + ')' });
        };exports.default =

        E;});})();
//# sourceMappingURL=iframe.js.map
