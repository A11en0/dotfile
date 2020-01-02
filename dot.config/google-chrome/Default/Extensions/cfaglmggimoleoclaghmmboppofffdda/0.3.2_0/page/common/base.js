var siteConfig = {
    site_name: "",
    site_logo: "网盘助手",
    menu_list: [
        {
            title: "控制面板",
            icon: "layui-icon layui-icon-home",
            list: [
                {
                    title: "插件信息",
                    url: "/page/wpzs/info.html",
                    name: "addon_info"
                },
                {
                    title: "功能配置",
                    url: "/page/wpzs/option.html",
                    name: "wpzs_option"
                },
                {
                    title: "我的分享",
                    url: "/page/wpzs/share.html",
                    name: "wpzs_share"
                }
            ]
        }
    ]
};
var siteUi = (function () {
    var obj = {};

    obj.initTitle = function () {
        if (siteConfig.site_name) {
            document.title = document.title + " - " + siteConfig.site_name;
        }
    };

    obj.initLogo = function () {
        $(".layui-logo").html(siteConfig.site_logo);
    };

    obj.initMenu = function (menuCurrent) {
        new Vue({
            el: "#sider-menu",
            data: {
                menu_current: menuCurrent,
                menu_list: siteConfig.menu_list
            }
        });
    };

    obj.addonReady = function (callback) {
        var readyInt = setInterval(function () {
            if ($("body").hasClass("nd-addon-ready")) {
                callback && callback();
                clearInterval(readyInt);
            }
        }, 500);
    };

    obj.init = function () {
        obj.initTitle();
        obj.initLogo();
    };

    return obj.init(), obj;
})();