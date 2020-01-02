// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', '/util/util.js', '/util/url.js', '/util/zerr.js', '/util/storage.js', '/util/date.js', '/util/etask.js', '/svc/vpn/pub/util.js', '/svc/vpn/pub/unblocker_lib.js', '/bext/pub/browser.js', '/bext/pub/util.js', '/bext/vpn/util/util.js'], function (exports, _underscore, _util, _url2, _zerr, _storage, _date, _etask, _util3, _unblocker_lib, _browser, _util5, _util7) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _util2 = _interopRequireDefault(_util);var _url3 = _interopRequireDefault(_url2);var _zerr2 = _interopRequireDefault(_zerr);var _storage2 = _interopRequireDefault(_storage);var _date2 = _interopRequireDefault(_date);var _etask2 = _interopRequireDefault(_etask);var _util4 = _interopRequireDefault(_util3);var _unblocker_lib2 = _interopRequireDefault(_unblocker_lib);var _browser2 = _interopRequireDefault(_browser);var _util6 = _interopRequireDefault(_util5);var _util8 = _interopRequireDefault(_util7);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}













        const E = {};
        const chrome = window.chrome,assign = Object.assign;

        E.is_vpn_allowed = (_url, is_main, is_in_net, rule) => {
            let protocol,hostname,url = _url3.default.parse(_url),port = url.port;
            if (!(protocol = url.protocol) || !(hostname = url.hostname))
            return false;
            if (_util8.default.is_all_browser(rule))
            return true;
            if (!hostname.includes('.'))
            return false;
            const protocols = { 'http:': 1, 'https:': 1, 'wss:': 1, 'ws:': 1 };
            if (!protocols[protocol])
            return false;
            if (port && !{ 'http:80': 1, 'https:443': 1, 'ws:80': 1,
                'wss:443': 1 }[protocol + port])
            {
                return false;
            }
            if (_url3.default.is_ip(hostname))
            {
                if (is_main || !is_in_net)
                return false;
                if (is_in_net(hostname, '10.0.0.0', '255.0.0.0') ||
                is_in_net(hostname, '172.16.0.0', '255.240.0.0') ||
                is_in_net(hostname, '192.168.0.0', '255.255.0.0') ||
                is_in_net(hostname, '127.0.0.0', '255.0.0.0'))
                {
                    return false;
                }
            }
            if (_url3.default.get_top_level_domain(hostname) == 'localhost' ||
            _url3.default.is_hola_domain(hostname))
            {
                return false;
            }
            return true;
        };

        E.get_root_link = (rule, href) =>
        href && _url3.default.add_proto(_url3.default.get_host(href)) || rule.link;

        const add_rule_ratings = opt => {
            const proxy_country = opt.proxy_country,rules = opt.rules;
            const rule_ratings = opt.rule_ratings || [];
            const groups = opt.groups;
            const country_ratings = _underscore2.default.find(rule_ratings, cr =>
            cr.proxy_country == proxy_country);
            if (country_ratings)
            {
                _util2.default.forEach(country_ratings.rules, r => {
                    if (r.rating <= 0)
                    return;
                    let r_rule = _util2.default.clone(_util4.default.find_rule(rules, r) ||
                    _util4.default.find_rule(groups && groups.unblocker_rules, r));
                    if (!r_rule)
                    {
                        r_rule = _unblocker_lib2.default.gen_rule({ name: r.name, type: r.type,
                            country: r.country, supported: true });
                    }
                    let rule = _util4.default.find_rule(rules, r_rule);
                    if (!rule)
                    {
                        if (!r_rule.root_url)
                        return;
                        rule = _util2.default.clone(r_rule);
                        rules.push(rule);
                    }
                    rule.ratings = r;
                });
            }
            rules.forEach(r => {
                if (!r.ratings)
                r.ratings = { rating: 0, vote_up: 0, vote_down: 0 };
            });
            rules.sort((r1, r2) => r1.ratings.rating - r2.ratings.rating > 0 ? -1 : 1);
            return rules;
        };

        E.get_all_rules = opt => {
            const proxy_country = opt.proxy_country.toLowerCase();
            const rule_ratings = opt.rule_ratings;
            const all_rules = opt.rules,url = opt.url,root_url = opt.root_url;
            let rules = _util2.default.clone(_util8.default.get_rules(all_rules, url) || []);
            rules = _underscore2.default.filter(rules, r => r.country == proxy_country);
            rules = add_rule_ratings({ proxy_country: proxy_country, rules: rules,
                root_url: root_url, url: url, rule_ratings: rule_ratings,
                groups: opt.groups });
            if (!_underscore2.default.find(rules, r => r.type == 'url' && r.name == root_url &&
            r.md5 != 'premium'))
            {
                rules.push(_unblocker_lib2.default.gen_rule({ name: root_url,
                    country: proxy_country, supported: true,
                    ratings: { rating: 0, vote_up: 0, vote_down: 0 } }));
            }
            return rules;
        };

        E.is_conf_allowed = (on, id) => {
            let random;
            if (!on)
            return false;
            id = id || 'ext_rand_id';
            if (!(random = +_storage2.default.get(id)))
            _storage2.default.set(id, random = Math.random());
            return random < on;
        };

        const open_tab = opt => {
            const create_tab = url =>
            chrome.tabs.create({ url: url, active: !!opt.force_active });
            const url = opt.url;
            if (opt.force_new)
            return create_tab(url);
            chrome.tabs.query(assign({ lastFocusedWindow: true }, opt.tab_match), tabs => {
                if (!tabs || !tabs.length)
                return create_tab(url);
                if (opt.exclude_re && opt.exclude_re.exec(tabs[0].url))
                {
                    chrome.tabs.create({ url, active: opt.force_active || false });
                    return chrome.tabs.reload(tabs[0].id);
                }
                chrome.tabs.update(tabs[0].id, { url, active: true }, tab => {
                    if (!tab)
                    create_tab(url);
                });
            });
        };

        E.update_tab = (tab_id, url) => chrome.tabs.update(tab_id, { url, active: true });

        E.open_new_tab = opt => {
            const _opt = _util2.default.clone(opt);
            _opt.force_new = 1;
            return open_tab(_opt);
        };

        E.open_hola_tab = opt => {
            const _opt = _util2.default.clone(opt);
            _opt.tab_match = chrome ? { url: '*://hola.org/*' } :
            { url_re: '^https?:\\/\\/hola\\.org\\/' };
            _opt.exclude_re = /hola\.org\/unblock\/([^/]*)\/using\/vpn-([^?/]*)$/gi;
            if (_util6.default.browser() == 'chrome')
            {
                _opt.tab_match.url = [_opt.tab_match.url,
                '*://chrome.google.com/*/' + chrome.runtime.id + '*'];
            }
            return open_tab(_opt);
        };

        E.open_be_tab = opt => {
            opt = _util2.default.clone(opt);
            const url = chrome.runtime.getURL('').slice(0, -1);
            opt.tab_match = { url: url + '/*' };
            if (_util6.default.browser() != 'firefox')
            opt.url = 'js/' + opt.url;
            return open_tab(opt);
        };

        E.Rules_set = class Rules_set {
            constructor(host, invert) {
                this._data = {};
                this._invert = !!invert;
                if (!host)
                return;
                this.add(host);
                let id,sets_map = _storage2.default.get_json('be_rules_sets') || {};
                if (!(id = sets_map[host]))
                return;
                Object.entries(sets_map).forEach(e => {
                    if (e[1] == id)
                    this.add(e[0]);
                });
            }
            add(host) {
                if (!host)
                return;
                this._data[host] = 1;
            }
            to_array() {
                let data = this._data;
                return Object.keys(data).filter(k => data[k]);
            }
            save() {
                let sets_map = _storage2.default.get_json('be_rules_sets') || {};
                let id = +(0, _date2.default)();
                Object.keys(this._data).forEach(host => {
                    if (!!this._data[host] ^ this._invert)
                    sets_map[host] = id;else

                    delete sets_map[host];
                });
                _storage2.default.set_json('be_rules_sets', sets_map);
            }};


        E.tabid2api = tabid => {
            if (chrome && typeof tabid == 'string')
            tabid = +tabid;
            return tabid;
        };

        E.upgrade_ext = function upgrade_ext() {
            _zerr2.default.notice('upgrade_ext');
            if (!_util2.default.get(chrome, 'runtime.requestUpdateCheck'))
            return;
            chrome.runtime.requestUpdateCheck(
            status => _zerr2.default.notice('update check: ' + status));
        };

        const storage_get_fn = area => items => (0, _etask2.default)(function* _storage_get_fn() {
            try {
                const data = yield _etask2.default.cb_apply(chrome.storage[area], '.get',
                [items]);
                if (_browser2.default.runtime.last_error || !data)
                storage_err('storage_' + area + '_get', data, _browser2.default.runtime.last_error);
                return data;
            } catch (e) {storage_err('storage_' + area + '_get_catch', items, e);}
        });

        const storage_set_fn = area => items => (0, _etask2.default)(function* _storage_set_fn() {
            try {
                yield _etask2.default.cb_apply(chrome.storage[area], '.set', [items]);
                if (_browser2.default.runtime.last_error)
                storage_err('storage_' + area + '_set', items, _browser2.default.runtime.last_error);
                return items;
            } catch (e) {storage_err('storage_' + area + '_set_catch', items, e);}
        });

        const storage_remove_fn = area => items => (0, _etask2.default)(function* _storage_remove_fn() {
            yield _etask2.default.cb_apply(chrome.storage[area], '.remove', [items]);
            if (_browser2.default.runtime.last_error)
            storage_err('storage_' + area + '_remove', items, _browser2.default.runtime.last_error);
        });

        let perr_sent;
        const storage_err = (name, items, err) => {
            const s = _util2.default.get(err, 'message');
            const msg = name + ' ' + _zerr2.default.json(items) + ' failed ' + s + ' ' + (err && err.stack);
            if (!perr_sent)
            {
                perr_sent = true;
                const id = s == 'The browser is shutting down.' ?
                'storage_browser_shutdown' : 'storage_lib_err';
                _util6.default.perr(_zerr2.default.L.ERR, { id, info: { name, items,
                        err_str: err instanceof Error ? _zerr2.default.e2s(err) : _zerr2.default.json(err) },
                    err });
            }
            (0, _zerr2.default)(msg);
            throw new Error(msg);
        };

        E.storage_local_get = storage_get_fn('local');
        E.storage_local_set = storage_set_fn('local');
        E.storage_local_remove = storage_remove_fn('local');exports.default =

        E;});})();
//# sourceMappingURL=util.js.map
