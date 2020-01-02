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

    container.define("message_web", [], function () {
        var obj = {
            message_listeners: {},
            message_callbacks: {},
            message_format: "nd_message_v1",
            message_name_callback: "message_callback"
        };

        obj.onMessage = function (name, listener) {
            obj.message_listeners[name] = listener;
        };

        obj.postMessage = function (messageName, messageData, callback) {
            var requestId = obj.generateMessageId();
            if (callback) {
                obj.message_callbacks[requestId] = callback;
            }
            obj.postMessageRaw(requestId, messageName, messageData);
        };

        obj.postMessageRaw = function (requestId, messageName, messageData) {
            window.postMessage({
                id: requestId,
                name: messageName,
                data: messageData,
                format: obj.message_format
            }, "*");
        };

        obj.handleMessage = function (event) {
            var message = event.data;
            if (message && message.format == obj.message_format) {
                var requestId = message.id;
                if (message.name == obj.message_name_callback) {
                    obj.handleMessageCallback(message);
                }
                else {
                    obj.handleMessageListener(message);
                }
            }
        };

        obj.handleMessageCallback = function (message) {
            var requestId = message.id;
            if (obj.message_callbacks.hasOwnProperty(requestId)) {
                var callback = obj.message_callbacks[requestId];
                callback && callback(message.data);
                delete obj.message_callbacks[requestId];
            }
        };

        obj.handleMessageListener = function (message) {
            if (obj.message_listeners.hasOwnProperty(message.name)) {
                var listener = obj.message_listeners[message.name];
                var callback = function (response) {
                    obj.postMessageRaw(message.id, obj.message_name_callback, response);
                };
                listener && listener(message.data, callback);
            }
        };

        obj.generateMessageId = function () {
            var d = new Date().getTime();
            var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == "x" ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        };

        obj.init = function () {
            window.addEventListener("message", obj.handleMessage, false);
        };

        return obj.init(), {
            format: obj.message_format,
            onMessage: obj.onMessage,
            postMessage: obj.postMessage
        };
    });

    container.define("bridge", ["message_addon", "message_web"], function (messageAddon, messageWeb) {
        var obj = {};

        obj.proxyMessage = function (name) {
            messageWeb.onMessage(name, function (data, callback) {
                messageAddon.postMessage(name, data, callback);
            });
        };

        obj.proxyMessageBatch = function (nameList) {
            nameList.forEach(function (name) {
                obj.proxyMessage(name);
            });
        };

        obj.init = function (callback) {
            obj.proxyMessageBatch([
                "gm_init",
                "set_value",
                "open_tab",
                "ajax_request"
            ]);
        };

        return {
            init: obj.init
        };
    });

    container.define("core", ["bridge"], function (bridge) {
        var obj = {};

        obj.initBridge = function () {
            bridge.init();
        };

        obj.ready = function (callback) {
            obj.initBridge();

            window.addEventListener("DOMContentLoaded", function () {
                callback && callback();
            });
        };

        return obj;
    });

    container.define("app", ["message_addon", "runner"], function (messageAddon, runner) {
        var obj = {};

        obj.run = function () {
            messageAddon.postMessage("build_script", injectConfig, function (response) {
                obj.runCode(response.content);
            });
        };

        obj.runCode = function (script) {
            var node = document.createElementNS(document.lookupNamespaceURI(null) || "http://www.w3.org/1999/xhtml", "script");
            node.textContent = script;
            (document.head || document.body || document.documentElement || document).appendChild(node);
            node.parentNode.removeChild(node)
        };

        return obj;
    });

    container.use(["core", "app"], function (core, app) {
        core.ready(function () {
            app.run();
        });
    });
})();