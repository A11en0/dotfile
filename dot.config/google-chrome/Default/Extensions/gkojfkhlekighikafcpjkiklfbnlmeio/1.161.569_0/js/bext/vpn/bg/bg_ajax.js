// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', '/bext/pub/lib.js', '/bext/pub/backbone.js', '/bext/pub/browser.js', '/util/etask.js', '/bext/pub/ext.js', '/util/ajax.js', '/svc/vpn/pub/unblocker_lib.js', '/util/zerr.js', '/util/escape.js', '/util/url.js', '/bext/pub/util.js', '/util/date.js', '/util/version_util.js', '/bext/vpn/util/util.js', '/util/util.js', '/util/storage.js', '/util/rand.js', '/bext/vpn/bg/util.js', 'conf'], function (exports, _underscore, _lib, _backbone, _browser, _etask, _ext, _ajax2, _unblocker_lib, _zerr, _escape, _url, _util, _date, _version_util, _util3, _util5, _storage, _rand, _util7, _conf) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _lib2 = _interopRequireDefault(_lib);var _backbone2 = _interopRequireDefault(_backbone);var _browser2 = _interopRequireDefault(_browser);var _etask2 = _interopRequireDefault(_etask);var _ext2 = _interopRequireDefault(_ext);var _ajax3 = _interopRequireDefault(_ajax2);var _unblocker_lib2 = _interopRequireDefault(_unblocker_lib);var _zerr2 = _interopRequireDefault(_zerr);var _escape2 = _interopRequireDefault(_escape);var _url2 = _interopRequireDefault(_url);var _util2 = _interopRequireDefault(_util);var _date2 = _interopRequireDefault(_date);var _version_util2 = _interopRequireDefault(_version_util);var _util4 = _interopRequireDefault(_util3);var _util6 = _interopRequireDefault(_util5);var _storage2 = _interopRequireDefault(_storage);var _rand2 = _interopRequireDefault(_rand);var _util8 = _interopRequireDefault(_util7);var _conf2 = _interopRequireDefault(_conf);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}




















        _util4.default.assert_bg('be_bg_ajax');
        const chrome = window.chrome;
        const assign = Object.assign;
        let bg_ajax,rand_subset = _rand2.default.rand_subset;
        const E = new (_backbone2.default.task_model.extend({
            model_name: 'bg_ajax',
            _defaults: function () {this.on('destroy', () => E.uninit());} }))();

        let bext_config = {},cloud_agents = { url: '', agents: [] };
        const cookies = {
            hola: { name: 'connect.sid', url: 'https://hola.org/' },
            svd: { name: 'connect.sid', url: 'https://svd-cdn.com/' } };

        const tests = ['ccgi_check', 'hola_check', 'perr_check'];
        const ZG = _util6.default.get,ZS = _util6.default.set;
        function CGA(path, def) {return ZG(bext_config.bg_ajax, path, def);}
        function CSA(path, val) {return ZS(bext_config.bg_ajax, path, val);}

        _ajax3.default.events.on('timeout', () => {
            _storage2.default.set('ajax_timeout', _storage2.default.get_int('ajax_timeout') + 1);
        });

        function BgAjax() {}

        BgAjax.prototype.init = function () {
            var copy = opt => {
                opt.mem_agents = (opt.mem_agents || []).map(a => (
                { port: 22224, ip: a.ip }));
                opt.build_agents = (opt.build_agents || []).map(a =>
                _underscore2.default.pick(a, 'ip', 'port'));
                return opt;
            };
            var def = { ignore: [], api: { perr: _lib2.default.perr_ok,
                    ajax_via_proxy: E.be_tab_unblocker.ajax_via_proxy },
                dbg_logs: CGA('dbg_logs') };
            var agents_opt = { mem_agents: E.be_tab_unblocker.get_all_agents(),
                build_agents: rand_subset(_conf2.default.agents, _conf2.default.agents.length),
                cloud_agents: this.load_agents.bind(this) };
            var agents = Object.keys(agents_opt),direct = ['hola', 'svd'];
            direct.concat(agents).forEach(name => {
                if (CGA('disable_' + name))
                def.ignore.push(name);
            });
            if (CGA('disable_agents'))
            def.ignore = def.ignore.concat(agents).concat('common_agents');
            var client_uri = CGA('client_uri', ''); 
            var opt = assign({ def_url: _conf2.default.url_ccgi,
                hola: 'client.hola.org' + client_uri,
                svd: 'client.svd-cdn.com' + client_uri }, def, agents_opt,
            { ignore: def.ignore.concat(direct).concat('common_agents') });
            this.agents_check = new _unblocker_lib2.default.ConnectivityCheck(copy(opt));
            def.common_agents = this.agents_check;
            opt = assign({ def_url: _conf2.default.url_ccgi, hola: 'client.hola.org' + client_uri,
                svd: 'client.svd-cdn.com' + client_uri }, def);
            this.ccgi_check = new _unblocker_lib2.default.ConnectivityCheck(copy(opt));
            opt = assign({ def_url: 'https://hola.org/', hola: 'hola.org',
                svd: 'svd-cdn.com' }, def);
            this.hola_check = new _unblocker_lib2.default.ConnectivityCheck(copy(opt));
            opt = assign({ def_url: _conf2.default.url_perr, hola: 'perr.hola.org/perr',
                svd: 'perr.svd-cdn.com/perr' }, def);
            this.perr_check = new _unblocker_lib2.default.ConnectivityCheck(copy(opt));
        };

        BgAjax.prototype.uninit = function () {
            var _this = this;
            tests.forEach(function (name) {
                if (_this[name])
                _this[name] = _this[name].uninit();
            });
            if (this.agents_check)
            this.agents_check = this.agents_check.uninit();
            if (cloud_agents.et)
            cloud_agents.et.return();
            if (this.cookies_et)
            this.cookies_et.return();
            E.be_tab_unblocker.uninit_ajax_via_proxy();
            _ext2.default.set('bg_ajax.is_active', false);
        };

        BgAjax.prototype.load_agents = function () {
            var url = CGA('agents_url',
            'https://www.dropbox.com/s/gax1dzeite0b2x7/cloud_agents.conf?dl=1');
            if (!url || url == cloud_agents.url && !cloud_agents.et)
            return cloud_agents.agents;
            return (0, _etask2.default)({ name: 'load_agents', cancel: true, async: true },
            function* load_agents_() {
                this.finally(() => delete cloud_agents.et);
                let res;
                if (cloud_agents.et)
                res = yield this.wait_ext(cloud_agents.et);else

                {
                    assign(cloud_agents, { agents: [], url, et: this });
                    res = yield (0, _ajax3.default)({ url, text: 1 });
                }
                if (!res || cloud_agents.agents.length)
                return cloud_agents.agents;
                try {
                    res = res.substr(res.length - 4) + res.substr(0, res.length - 4);
                    res = JSON.parse(atob(res));
                    res = res instanceof Array ? res : res.agents;
                    cloud_agents.agents = rand_subset(res, res.length);
                } catch (e) {}
                return cloud_agents.agents;
            });
        };

        BgAjax.prototype._ajax = function (bg_info, req) {
            var burl = _url2.default.parse(bg_info.url),rurl = _url2.default.parse(req.url);
            var url = 'https://' + burl.hostname + rurl.path;
            if (req.qs)
            url = _url2.default.qs_add(url, req.qs);
            if (!bg_info.agent)
            {
                req = _underscore2.default.omit(req, 'url', 'qs');
                req.url = url;
                return (0, _ajax3.default)(req);
            }
            var opt = assign({ always: true, ignore_redir: true,
                hdrs: { 'Cache-Control': 'no-cache,no-store,must-revalidate,' +
                    'max-age=-1' }, force_headers: true, fix_307: true, src: 'bg_ajax',
                agent: bg_info.agent, force: 'proxy', prot: 'proxy' }, _underscore2.default.pick(req,
            'data', 'with_credentials'));
            var method = req.method || 'GET';
            if (opt.data)
            {
                if (method == 'GET')
                {
                    var qs = typeof opt.data == 'object' ? opt.data :
                    _url2.default.qs_parse(opt.data);
                    url = _url2.default.qs_add(url, qs);
                    delete opt.data;
                } else

                {
                    if (typeof opt.data == 'object')
                    opt.data = _escape2.default.qs(opt.data);
                    opt.hdrs['Content-Type'] = 'application/x-www-form-urlencoded; ' +
                    'charset=UTF-8';
                }
            }
            var t = _util4.default.set_timeout(() => et.throw(new Error('timeout')),
            req.timeout || 20 * _date2.default.ms.SEC);
            var et = (0, _etask2.default)({ cancel: true }, function* ajax_via_proxy_() {
                this.finally(() => _util4.default.clear_timeout(t));
                let res = yield E.be_tab_unblocker.ajax_via_proxy(
                { url, type: method }, opt);
                res = (res || {}).data;
                try {res = res && req.json ? JSON.parse(res) : res;
                } catch (e) {(0, _zerr2.default)(_zerr2.default.e2s(e));}
                return res;
            });
            return et;
        };

        BgAjax.prototype.update_cookies = function () {
            var _this = this;
            return (0, _etask2.default)({ name: 'update_cookies', cancel: true }, function* () {
                if (_this.cookies_et)
                return yield this.wait_ext(_this.cookies_et);
                _this.cookies_et = (0, _etask2.default)(function* cookies_et_() {
                    try {
                        const res = yield _etask2.default.all({ allow_fail: true }, {
                            hola: _etask2.default.cb_apply(chrome.cookies, '.get',
                            [cookies.hola]),
                            svd: _etask2.default.cb_apply(chrome.cookies, '.get', [cookies.svd]) });

                        if (!res.hola && !res.svd)
                        return this.return();
                        if (res.hola && res.svd)
                        {
                            if (res.hola.value == res.svd.value)
                            return this.return();
                            if (res.hola.expirationDate > res.svd.expirationDate)
                            res.svd = undefined;else

                            res.hola = undefined;
                        }
                        const name = res.svd ? { t: 'hola', s: 'svd' } :
                        { t: 'svd', s: 'hola' };
                        return yield _etask2.default.cb_apply(chrome.cookies, '.set',
                        [assign(_util6.default.pick(res[name.s], 'expirationDate',
                        'sameSite', 'value', 'httpOnly'), cookies[name.t])]);
                    } catch (e) {(0, _zerr2.default)(_zerr2.default.e2s(e));} finally
                    {delete _this.cookies_et;}
                });
                return yield _this.cookies_et;
            });
        };

        BgAjax.prototype.make_ajax = function (e, req) {
            var link;
            if (e.selected && (link = e.get_backend_link()))
            return this._ajax(link, req);
            _ext2.default.set('bg_ajax.is_active', true);
            var _this = this;
            return (0, _etask2.default)(function* make_ajax_() {
                this.finally(() => e.connecting = false);
                yield E.be_tab_unblocker.init_ajax_via_proxy();
                e.connecting = true;
                yield e.run();
                e.connecting = false;
                return yield _this._ajax(e.get_backend_link(), req);
            });
        };

        BgAjax.prototype.ccgi_ajax = function (req) {
            return this.make_ajax(this.ccgi_check, req);};

        BgAjax.prototype.hola_ajax = function (req) {
            const _this = this,hc = this.hola_check;
            return (0, _etask2.default)(function* hola_ajax_() {
                let link;
                if (hc.selected && (link = hc.get_backend_link()) && !link.agent)
                yield _this.update_cookies();
                return yield _this.make_ajax(hc, req);
            });
        };

        BgAjax.prototype.perr_ajax = function (req) {
            return this.make_ajax(this.perr_check, req);};

        BgAjax.prototype.is_proxy_selected = c => {
            let link;
            return c && c.selected && (link = c.get_backend_link()) && link.agent;
        };

        function _ajax(req, type) {
            req = assign({ json: !req.text }, req);
            return (0, _etask2.default)(function* _ajax_() {
                try {
                    return bg_ajax && bg_ajax[type] ? yield bg_ajax[type](req) :
                    yield (0, _ajax3.default)(req);
                } catch (e) {
                    let now = Date.now(),is_on = CGA('enable');
                    if (is_on && (!_ajax.error_ts ||
                    now - _ajax.error_ts >= 5 * _date2.default.ms.MIN))
                    {
                        E.reset(true);
                        _ajax.error_ts = now;
                    } else
                    if (!is_on)
                    {
                        if (bg_ajax)
                        bg_ajax = bg_ajax.uninit();
                    }
                    throw e;
                }
            });
        }

        E.ccgi_ajax = req => _ajax(req, 'ccgi_ajax');
        E.hola_ajax = req => _ajax(req, 'hola_ajax');
        E.perr_ajax = req => _ajax(req, 'perr_ajax');
        E.ajax = (req, type) => {
            type = type || (_url2.default.parse(req.url).hostname || '').split('.')[0] + '_ajax';
            if (type == 'client_ajax')
            type = 'ccgi_ajax';
            return _ajax(req, type);
        };

        function update_config() {
            bext_config = _ext2.default.get('bext_config') || {};
            var s;
            if ((s = CGA('on')) && _util8.default.is_conf_allowed(s))
            CSA('enable', true);
            if ((s = CGA('min_version')) && _version_util2.default.cmp(_util2.default.version(), s) < 0)
            CSA('enable', false);
            if (CGA('enable'))
            init();else

            uninit();
        }

        E.init = function (be_tab_unblocker) {
            E.uninit();
            E.on('reset', on_reset);
            if (E.be_tab_unblocker = be_tab_unblocker)
            E.be_tab_unblocker.be_bg_ajax = this;
            E.listen_to(_ext2.default, 'change:bext_config', update_config);
            update_config();
        };

        E.is_hola_via_proxy = function () {
            return bg_ajax && bg_ajax.is_proxy_selected(bg_ajax.hola_check);};

        function on_reset() {
            if (!bg_ajax)
            return;
            var connecting;
            for (var t, i = 0; i < tests.length; i++)
            {
                if ((t = bg_ajax[tests[i]]) && t.connecting)
                {
                    connecting = true;
                    break;
                }
            }
            if (connecting)
            E.reset();
        }

        E.reset = function (force) {
            if (!bg_ajax && !force)
            return;
            if (bg_ajax)
            bg_ajax.uninit();
            bg_ajax = new BgAjax();
            bg_ajax.init();
        };

        function init() {
            if (bg_ajax || !CGA('enable'))
            return;
            bg_ajax = new BgAjax();
            bg_ajax.init();
            _util2.default.set_ajax_cb(req => E.perr_ajax(req));
        }

        function is_dev_build() {
            return _util2.default.browser() == 'chrome' &&
            _browser2.default.runtime.id != 'gkojfkhlekighikafcpjkiklfbnlmeio' ||
            _util2.default.browser() == 'opera' &&
            _browser2.default.runtime.id != 'ekmmelpnmfdegjhnmadddcfjcahpajnm' ||
            _util2.default.browser() == 'edge' &&
            _browser2.default.runtime.id != 'nfjgmgjhcihmkobljembcfodkajehoej';
        }

        E.hola_api_call = (path, opt) => {
            opt = opt || {};
            opt.method = opt.method || 'GET';
            const xsrf_header = (_conf2.default.firefox_web_ext || is_dev_build()) &&
            !['GET', 'HEAD', 'OPTIONS'].includes(opt.method);
            return (0, _etask2.default)(function* hola_api_call_() {
                const c = !xsrf_header ? undefined :
                yield _etask2.default.cb_apply(chrome.cookies,
                '.get', [{ url: 'https://hola.org/', name: 'XSRF-TOKEN' }]);
                return yield E.hola_ajax({
                    url: 'https://hola.org/' + path,
                    data: opt.data,
                    method: opt.method,
                    headers: c && { 'x-xsrf-token': c.value },
                    text: opt.text,
                    json: !opt.text,
                    with_credentials: true });

            });
        };

        let old_xhr = window.XMLHttpRequest;
        E.simulate_ajax = opt => {
            if (!opt)
            return;
            let rgx = Object.keys(opt).map(key => ({ r: new RegExp(key), v: opt[key] }));
            const get_sim = url => {
                let match = rgx.find(({ r }) => r.test(url));
                let res = {};
                if (match)
                {
                    let [act, val] = match.v.split(':');
                    if (act == 'delay')
                    {
                        res.send = function (...args) {
                            setTimeout(() => {this.send(...args);}, +val);};
                    }
                    if (act == 'fail')
                    {
                        res.status = +val;
                        res.response = res.responseText = 'Fail';
                        res.statusText = 'Error';
                    }
                    if (act == 'timeout')
                    {
                        res.send = function (...args) {
                            this.timeout = 1;
                            setTimeout(() => {this.send(...args);}, +val);
                        };
                    }
                }
                return res;
            };
            window.XMLHttpRequest = function () {
                let actual = new old_xhr();
                let self = this;
                let sim = {};
                this.onreadystatechange = null;
                Object.defineProperty(self, 'open', { value: (...args) => {
                        sim = get_sim(args[1]);
                        return actual.open(...args);
                    } });
                ['statusText', 'responseType', 'readyState', 'responseXML', 'upload',
                'response', 'responseText', 'status'].forEach(item => {
                    Object.defineProperty(self, item, {
                        get: () => sim[item] || actual[item] });

                });
                ['ontimeout', 'timeout', 'withCredentials', 'onload', 'onerror',
                'onprogress'].forEach(item => {
                    Object.defineProperty(self, item, {
                        get: () => sim[item] || actual[item],
                        set: val => actual[item] = val });

                });
                ['addEventListener', 'send', 'abort', 'getAllResponseHeaders',
                'getResponseHeader', 'overrideMimeType', 'setRequestHeader',
                'onreadystatechange'].forEach(item => {
                    Object.defineProperty(self, item, {
                        value: (...args) => (sim[item] || actual[item]).apply(actual,
                        args) });

                });
            };
        };
        E.reset_ajax_simulation = () => {window.XMLHttpRequest = old_xhr;};


        function uninit() {
            if (bg_ajax)
            bg_ajax = bg_ajax.uninit();
            _util2.default.set_ajax_cb();
        }

        E.uninit = () => {
            uninit();
            E.off('reset', on_reset);
            E.stopListening();
        };exports.default =

        E;});})();
//# sourceMappingURL=bg_ajax.js.map
