(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'analytics.js', 'ga');

ga('create', 'UA-149768454-1', 'auto'); // Replace with your property ID.
ga('set', 'checkProtocolTask', function () {});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'GA_PAGE':
            var title = request.data.title || 'title';
            var page = request.data.page || '/default';
            ga('send', 'pageview', {
                title: title,
                page: page
            });
            break;
        case 'GA_EVENT':
            var category = request.data.category || 'extention';
            var action = request.data.action || 'action';
            var label = request.data.label || 'label';
            ga('send', 'event', category, action, label);
            break;
    }
    return true;
});