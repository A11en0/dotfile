(function () {
    var container = (function () {
        var obj = {
            module_defines: {},
            module_objects: {}
        };

        obj.define = function (name, requires, callback) {
            name = obj.processName(name);
            obj.module_defines[name] = {
                requires: requires,
                callback: callback
            };
        };

        obj.require = function (name, cache) {
            if (typeof cache == "undefined") {
                cache = true;
            }

            name = obj.processName(name);
            if (cache && obj.module_objects.hasOwnProperty(name)) {
                return obj.module_objects[name];
            }
            else if (obj.module_defines.hasOwnProperty(name)) {
                var requires = obj.module_defines[name].requires;
                var callback = obj.module_defines[name].callback;

                var module = obj.use(requires, callback);
                cache && obj.register(name, module);
                return module;
            }
        };

        obj.use = function (requires, callback) {
            var module = {
                exports: {}
            };
            var params = obj.buildParams(requires, module);
            var result = callback.apply(this, params);
            if (typeof result != "undefined") {
                return result;
            }
            else {
                return module.exports;
            }
        };

        obj.register = function (name, module) {
            name = obj.processName(name);
            obj.module_objects[name] = module;
        };

        obj.buildParams = function (requires, module) {
            var params = [];
            requires.forEach(function (name) {
                params.push(obj.require(name));
            });
            params.push(obj.require);
            params.push(module.exports);
            params.push(module);
            return params;
        };

        obj.processName = function (name) {
            return name.toLowerCase();
        };

        return {
            define: obj.define,
            use: obj.use,
            register: obj.register,
            modules: obj.module_objects
        };
    })();

    container.define("addon", [], function () {
        if (typeof browser == "undefined") {
            return chrome;
        }
        else {
            return browser;
        }
    });

    container.define("message_addon", ["addon"], function (addon) {
        var obj = {
            message_listeners: {}
        };

        obj.onMessage = function (name, listener) {
            obj.message_listeners[name] = listener;
        };

        obj.postMessage = function (name, data, callback) {
            var port = addon.runtime.connect({ name: name });
            callback && port.onMessage.addListener(callback);
            port.postMessage(data);
        };

        obj.handleMessage = function (port) {
            if (obj.message_listeners.hasOwnProperty(port.name)) {
                var connected = true;
                var listener = obj.message_listeners[port.name];
                var callback = function (response) {
                    connected && port.postMessage(response);
                };
                port.onMessage.addListener(function (data) {
                    listener && listener(data, callback);
                });
                port.onDisconnect.addListener(function () {
                    connected = false;
                });
            }
        };

        obj.init = function () {
            addon.runtime.onConnect.addListener(obj.handleMessage);
        };

        return obj.init(), {
            onMessage: obj.onMessage,
            postMessage: obj.postMessage
        };
    });

    container.define("bridge", ["message_addon"], function (messageAddon) {
        var obj = {
            gm_info: {},
            gm_values: {}
        };

        obj.setValue = function (name, value) {
            obj.gm_values[name] = value;
            var data = {
                name: name,
                value: value
            };
            messageAddon.postMessage("set_value", data);
        };

        obj.getValue = function (name, defaultValue) {
            if (obj.gm_values.hasOwnProperty(name)) {
                return obj.gm_values[name];
            }
            else {
                return defaultValue;
            }
        };

        obj.listValues = function () {
            return Object.keys(obj.getValueList());
        };

        obj.openTab = function (url, active) {
            var data = {
                url: url,
                active: !active
            };
            messageAddon.postMessage("open_tab", data);
        };

        obj.ajaxRequest = function (details) {
            var data = {
                mode: "gm"
            };
            for (var i in details) {
                if (details[i] instanceof Function) {
                    continue;
                }

                if (details[i] instanceof FormData) {
                    var object = {};
                    details[i].forEach(function (value, name) {
                        object[name] = value;
                    });
                    data[i] = object;
                }
                else {
                    data[i] = details[i];
                }
            }
            messageAddon.postMessage("ajax_request", data, function (response) {
                if (response) {
                    details.onload && details.onload({
                        response: response
                    });
                }
                else {
                    details.onerror && details.onerror({
                        error: ""
                    });
                }
            });
        };

        obj.init = function (callback) {
            messageAddon.postMessage("gm_init", {}, function (response) {
                obj.gm_info = response.gm_info;
                obj.gm_values = response.gm_values;
                callback && callback();
            });
        };

        return obj;
    });

    container.define("core", ["bridge"], function (bridge) {
        var obj = {};

        obj.initBridge = function () {
            return new Promise(function (resolve) {
                bridge.init(function () {
                    resolve();
                });
            });
        };

        obj.ready = function (callback) {
            var promiseList = [
                obj.initBridge()
            ];
            Promise.all(promiseList).then(function () {
                callback && callback();
            });
        };

        return obj;
    });

    container.define("app", ["bridge"], function (bridge) {
        var obj = {};

        obj.run = function () {
            window.GM_info = bridge.gm_info;
            window.GM_getValue = bridge.getValue;
            window.GM_setValue = bridge.setValue;
            window.GM_listValues = bridge.listValues;
            window.GM_openInTab = bridge.openTab;
            window.GM_xmlhttpRequest = bridge.ajaxRequest;
        };

        return obj;
    });

    container.use(["core", "app"], function (core, app) {
        core.ready(function () {
            app.run();
        });
    });
})();