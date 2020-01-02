// LICENSE_CODE ZON
;(function () {
    'use strict'; var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}
    var define = void 0;
    var is_node = (typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module.exports && module.children;
    if (is_node)
    define = require('../../../util/require_node.js').define(module, '..');else

    define = self.define;
    define(['react', 'react-dom', 'classnames', '/util/etask.js', '/util/url.js',
    'react-transition-group'],
    function (React, ReactDOM, classnames, etask, zurl, rtg) {var
        useState = React.useState,useRef = React.useRef,memo = React.memo;var
        CSSTransition = rtg.CSSTransition;
        var E = {};
        var T = function T(props) {
            return typeof props == 'string' ? props : props.children;
        };

        E.Search_field = function (_React$Component) {_inherits(Search_field, _React$Component);function Search_field() {var _ref;var _temp, _this, _ret;_classCallCheck(this, Search_field);for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Search_field.__proto__ || Object.getPrototypeOf(Search_field)).call.apply(_ref, [this].concat(args))), _this), _this.
                state = { variants: [], search_str: '' }, _this.
                on_focus = function () {
                    if (_this.props.on_focus)
                    _this.props.on_focus();
                    _this.setState({ show_dropdown: true });
                }, _this.
                on_blur = function () {
                    setTimeout(function () {return _this.setState({ show_dropdown: false });}, 100);
                }, _this.
                on_key_press = function (e) {
                    if (e.key != 'Enter')
                    return;
                    _this.on_search();
                }, _this.
                on_change = function (e) {
                    e.preventDefault();
                    var search_str = e.target.value;var _this$props$top_urls =
                    _this.props.top_urls,top_urls = _this$props$top_urls === undefined ? [] : _this$props$top_urls;
                    var variants = top_urls.filter(function (r) {return r.startsWith(search_str);});
                    if (!variants.length)
                    variants = top_urls.filter(function (r) {return r.includes(search_str);});
                    variants = variants.slice(0, 1);
                    _this.setState({ search_str: search_str, variants: variants });
                }, _this.
                on_search = function (e) {var _this$state =
                    _this.state,search_str = _this$state.search_str,variants = _this$state.variants;var
                    on_redirect = _this.props.on_redirect;
                    var res = variants.find(function (r) {return r.startsWith(search_str);});
                    if (res)
                    search_str = res;
                    var redirect_url = zurl.is_valid_url(search_str) ?
                    zurl.add_proto(search_str) :
                    'https://google.com/search?q=' + encodeURIComponent(search_str);
                    on_redirect(redirect_url);
                }, _this.
                on_dd_select = function (v) {
                    _this.setState({ show_dropdown: true, search_str: v }, _this.on_search);
                }, _temp), _possibleConstructorReturn(_this, _ret);}_createClass(Search_field, [{ key: 'render', value: function render()
                {var _this2 = this;var _state =
                    this.state,variants = _state.variants,show_dropdown = _state.show_dropdown,search_str = _state.search_str;
                    return React.createElement('div', { className: 'search-field' },
                    React.createElement('input', { type: 'text', onFocus: this.on_focus,
                        onBlur: this.on_blur, placeholder: 'Enter site to unblock',
                        onKeyPress: this.on_key_press, onChange: this.on_change,
                        value: search_str }),
                    React.createElement('button', { onClick: this.on_search }),
                    search_str && show_dropdown && React.createElement('ul', { className: 'dropdown' },
                    variants.map(function (v) {return (
                            React.createElement('li', { key: v, onClick: function onClick() {return _this2.on_dd_select(v);} }, v));})));


                } }]);return Search_field;}(React.Component);


        E.format_time = function (ms) {
            var pad = function pad(num) {return ('000' + num).slice(-2);};
            var sec = Math.floor(ms / 1000);
            var days = Math.floor(sec / (60 * 60 * 24));
            sec -= days * 60 * 60 * 24;
            var hours = Math.floor(sec / (60 * 60));
            sec -= hours * 60 * 60;
            var mins = Math.floor(sec / 60);
            sec -= mins * 60;
            if (days == 1 && hours == 0)
            {
                days = 0;
                hours = 24;
            }
            return (days ? days + 'd ' : '') + (hours || days ? hours + 'h ' : '') + pad(mins) +
            'm ' + pad(sec) + 's';
        };

        E.Payment_methods = function Payment_methods() {
            return React.createElement('div', { className: 'payment-methods' },
            React.createElement('div', { className: 'mastercard' }),
            React.createElement('div', { className: 'visa' }),
            React.createElement('div', { className: 'paypal' }));

        };

        E.Plan = function (_React$PureComponent) {_inherits(Plan, _React$PureComponent);function Plan() {_classCallCheck(this, Plan);return _possibleConstructorReturn(this, (Plan.__proto__ || Object.getPrototypeOf(Plan)).apply(this, arguments));}_createClass(Plan, [{ key: 'render', value: function render()
                {
                    var props = this.props,plan = props.plan;
                    var cls = 'plan-btn' + (props.selected ? ' plan-btn-selected' : '');
                    var regular = plan.regular_price && plan.regular_price != plan.price ?
                    React.createElement('span', { className: 'regular-price' }, '$', plan.regular_price.toFixed(2)) :
                    null;
                    return (
                        React.createElement('a', { className: cls, 'data-testid': 'plan_btn',
                            href: props.href, target: '_blank', rel: 'noopener noreferrer',
                            onClick: function onClick() {return props.on_click(plan);} },
                        React.createElement('div', { className: 'plan-btn-inner' },
                        !!plan.discount_percent && React.createElement('div', { className: 'plan-discount' },
                        React.createElement(T, null, 'Save ', React.createElement('span', null, plan.discount_percent), '%')),

                        React.createElement('div', { className: 'plan-img plan-img-' + plan.img_index }),
                        React.createElement('div', { className: 'plan-name' }, React.createElement(T, null, props.plan.name)),
                        React.createElement('div', { className: 'price' }, '$',
                        React.createElement('span', { className: 'amount' }, plan.month_price.toFixed(2)),
                        React.createElement(T, null, '/mo')),

                        React.createElement('div', { className: 'sub-title' },
                        regular, ' $', plan.price.toFixed(2), ' ', React.createElement(T, null, 'billed every ',
                        plan.every)),

                        React.createElement('ul', null,
                        React.createElement('li', null, React.createElement(T, null, 'Unlimited HD streaming')),
                        React.createElement('li', null, React.createElement(T, null, '10 connected devices')),
                        React.createElement('li', null, React.createElement(T, null, 'Split tunneling proxy')),
                        React.createElement('li', null, React.createElement(T, null, 'IKEv2/IPsec')),
                        React.createElement('li', null, React.createElement(T, null, 'Privacy & security'))),

                        React.createElement('div', { className: 'moneyback' },
                        React.createElement(T, null, '30-day money-back guarantee')),

                        React.createElement(E.Payment_methods, null))));



                } }]);return Plan;}(React.PureComponent);


        E.Free_plan = function (_React$PureComponent2) {_inherits(Free_plan, _React$PureComponent2);function Free_plan() {_classCallCheck(this, Free_plan);return _possibleConstructorReturn(this, (Free_plan.__proto__ || Object.getPrototypeOf(Free_plan)).apply(this, arguments));}_createClass(Free_plan, [{ key: 'render', value: function render()
                {var _props =
                    this.props,on_click = _props.on_click,title = _props.sub_title,list = _props.list;
                    return (
                        React.createElement('a', { className: 'plan-btn plan-btn-free', 'data-testid': 'plan_btn_free',
                            onClick: function onClick() {return on_click({ id: 'free' });} },
                        React.createElement('div', { className: 'plan-btn-inner' },
                        React.createElement('div', { className: 'plan-img plan-img-2' }),
                        React.createElement('div', { className: 'plan-name' }, React.createElement(T, null, 'Free')),
                        React.createElement('div', { className: 'price' },
                        React.createElement('span', { className: 'amount' }, React.createElement(T, null, 'Free'))),

                        title && React.createElement('div', { className: 'sub-title' }, React.createElement(T, null, title)),
                        React.createElement('ul', null, list.map(function (v, i) {return React.createElement('li', { key: i }, React.createElement(T, null, v));})))));



                } }]);return Free_plan;}(React.PureComponent);


        E.fill_plans_info = function (plan_ids, all_plans) {
            var regular_monthly = (all_plans.find(function (p) {return (
                    p.period.match(/1\s?m/i) && plan_ids.includes(p.id));}) || {}).price;
            var img_map = plan_ids.includes('free') ?
            { '1 D': 1, '1 M': 3, '6 M': 4, '1 Y': 5, '2 Y': 5, '3 Y': 5 } :
            { '1 D': 1, '1 M': 1, '6 M': 2, '1 Y': 3, '2 Y': 4, '3 Y': 5 };
            var plans = plan_ids.map(function (id) {
                if (id == 'free')
                return { period: 'free', id: 'free', name: 'Free', price: 'Free' };
                var plan = all_plans.find(function (p) {return p.id == id;});
                if (!plan)
                return;
                var m = void 0;
                if (!(m = plan.period.match(/(\d)\s?([dmy])/i)))
                return;
                var period_type = m[2].toUpperCase();
                var period_name = { D: 'day', M: 'month', Y: 'year' }[period_type];
                var period_count = m[1];
                var months = period_type == 'M' ? +period_count : period_type == 'Y' ?
                12 * period_count : 0;
                var regular_price = months && regular_monthly ?
                regular_monthly * months : null;
                var discount = regular_price ? regular_price - plan.price : null;
                return {
                    id: id,
                    period: plan.period,
                    img_index: img_map[period_count + ' ' + period_type],
                    name: period_count + '-' + period_name,
                    every: period_count > 1 ? period_count + ' ' + period_name + 's' :
                    period_name,
                    price: plan.price,
                    regular_price: regular_price,
                    month_price: months ? plan.price / months : null,
                    discount: discount,
                    discount_percent: discount ?
                    Math.floor(100 * discount / regular_price) : null,
                    avangate_id: plan.avangate_id,
                    paypal_id: plan.paypal_id,
                    paypal_test_id: plan.paypal_test_id };

            });
            return plans.filter(function (p) {return !!p;});
        };

        E.Sitepic = function (_React$PureComponent3) {_inherits(Sitepic, _React$PureComponent3);function Sitepic() {var _ref2;var _temp2, _this5, _ret2;_classCallCheck(this, Sitepic);for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {args[_key2] = arguments[_key2];}return _ret2 = (_temp2 = (_this5 = _possibleConstructorReturn(this, (_ref2 = Sitepic.__proto__ || Object.getPrototypeOf(Sitepic)).call.apply(_ref2, [this].concat(args))), _this5), _this5.
                state = { no_image: false }, _this5.
                on_img_error = function (event) {
                    event.target.onerror = null;
                    _this5.setState({ no_image: true });
                }, _this5.
                on_click = function (event) {return _this5.props.activate(event, _this5.props);}, _temp2), _possibleConstructorReturn(_this5, _ret2);}_createClass(Sitepic, [{ key: 'render', value: function render()
                {var
                    state = this.state,props = this.props;
                    var src = props.image || '';
                    if (props.is_landing)
                    {
                        src = /netflix\.com\.jpg/.test(props.image) ?
                        props.sitepic_netflix : /fubo\.tv\.png/.test(props.image) ?
                        props.sitepic_fubo : /france\.tv\.png/.test(props.image) ?
                        props.sitepic_france : props.image;
                    }
                    var sitepic_cls = classnames('ui_sitepic2',
                    props.sitepic_class, { ui_sitepic2_noimage: state.no_image,
                        premium_site: props.premium_site !== undefined && props.premium_site,
                        free_site: props.premium_site !== undefined && !props.premium_site,
                        ui_sitepic2_unblocking: props.unblocking,
                        ui_sitepic2_active: props.unblocking,
                        ui_sitepic_disabled: props.disabled });
                    var is_shaded = props.is_shaded || state.no_image;
                    return React.createElement('div', { className: sitepic_cls },
                    React.createElement('a', { className: 'ui_sitepic2_body', onClick: this.on_click },
                    React.createElement('div', { className: 'ui_status', style: { display: 'none' } },
                    React.createElement('div', { className: 'ui_status_label' })),

                    is_shaded && React.createElement('div', {
                        className: 'ui_sitepic2_shade ui_sitepic2_shade_bg_1' },
                    React.createElement('span', { className: 'ui_sitepic2_shade_siteurl' },
                    props.link),
                    React.createElement('div', { className: 'ui_sitepic2_shade_sitename' },
                    React.createElement('span', { className: 'ui_sitepic2_shade_sitename_img' },
                    React.createElement('img', { src: '//favicon.yandex.net/favicon/test.com' })),
                    React.createElement('span', { className: 'ui_sitepic2_shade_sitename_title' },
                    props.title))),


                    React.createElement('div', { className: 'ui_sitepic2_overlay' },
                    React.createElement('div', { className: 'sprite' }),
                    React.createElement('div', { className: 'status' }, 'Unblocking ', props.title)),

                    React.createElement('div', { className: 'ui_sitepic2_promotion' }, 'Add Hola to unblock ',
                    props.title),

                    React.createElement('div', { className: 'ui_sitepic2_img' },
                    React.createElement('img', { src: src, onError: this.on_img_error,
                        alt: props.title + ' website image' }))));



                } }]);return Sitepic;}(React.PureComponent);


        E.Popular_sitepics = function (_React$PureComponent4) {_inherits(Popular_sitepics, _React$PureComponent4);function Popular_sitepics() {_classCallCheck(this, Popular_sitepics);return _possibleConstructorReturn(this, (Popular_sitepics.__proto__ || Object.getPrototypeOf(Popular_sitepics)).apply(this, arguments));}_createClass(Popular_sitepics, [{ key: 'render', value: function render()
                {var _props2 =
                    this.props,active = _props2.active,sitepics = _props2.sitepics,activate = _props2.activate;
                    return React.createElement('div', { className: 'sitepics-container ui_sitepic2_transculent' },
                    React.createElement('div', { className: 'ui_sitepics' },
                    sitepics.map(function (s) {
                        var unblocking = active && active.link == s.link;
                        return React.createElement(E.Sitepic, _extends({ key: s.name }, s, { is_shaded: true,
                            activate: activate, unblocking: unblocking,
                            disabled: active && !unblocking }));})));


                } }]);return Popular_sitepics;}(React.PureComponent);


        E.Slides_switch = memo(function Slides_switch(props) {var
            slide =
            props.slide,entered_cb = props.entered_cb,exiting_cb = props.exiting_cb,exited_cb = props.exited_cb,children = props.children,pre_mount = props.pre_mount;var _useState =
            useState({ exiting: false }),_useState2 = _slicedToArray(_useState, 2),state = _useState2[0],set_state = _useState2[1];
            var curr_slide_ref = useRef(slide);
            var prev_slide_ref = useRef();
            if (!state.exiting && curr_slide_ref.current != slide)
            {
                prev_slide_ref.current = curr_slide_ref.current;
                curr_slide_ref.current = slide;
                set_state({ exiting: true });
            }
            var opt = {
                mountOnEnter: !pre_mount,
                unmountOnExit: !pre_mount,
                appear: !!pre_mount,
                timeout: { appear: 0, enter: 300, exit: 200 },
                classNames: 'slide',
                onEntered: entered_cb,
                onExiting: exiting_cb,
                onExited: function onExited() {
                    set_state(_extends({}, state, { exiting: false }));
                    exited_cb && exited_cb();
                } };

            var backward = void 0;
            if (prev_slide_ref.current)
            {
                React.Children.forEach(children, function (child) {
                    if (child.key == slide)
                    backward = false;else
                    if (child.key == prev_slide_ref.current)
                    backward = true;
                });
            }
            var cls = classnames('slides-switch', backward ? 'slide-backward' :
            'slide-forward', { 'pre-mount': pre_mount });
            return React.createElement('div', { className: cls },
            React.Children.map(children, function (child) {return React.createElement(CSSTransition, _extends({
                    key: 'transition_' + child.key,
                    'in': !state.exiting && slide == child.key }, opt),
                child);}));


        });

        return E;});})();
//# sourceMappingURL=common_ui.js.map
