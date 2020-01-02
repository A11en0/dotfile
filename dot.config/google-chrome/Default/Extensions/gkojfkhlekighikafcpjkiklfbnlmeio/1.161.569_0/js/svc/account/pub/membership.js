// LICENSE_CODE ZON
'use strict'; 
(function(){
var define;
var is_node = typeof module=='object' && module.exports;
if (!is_node)
    define = self.define;
else
    define = require('../../../util/require_node.js').define(module, '../');
define(['/util/date.js'], function(zdate){
var E = {};

E.grace = 1;

function get_end_by_period(membership, opt){
    opt = opt||{};
    var end = new Date(membership.start);
    if (membership.period=='1 M')
        end.setUTCMonth(end.getUTCMonth()+1);
    else if (membership.period=='6 M')
        end.setUTCMonth(end.getUTCMonth()+6);
    else if (membership.period=='1 Y')
        end.setUTCFullYear(end.getUTCFullYear()+1);
    else if (membership.period=='2 Y')
        end.setUTCFullYear(end.getUTCFullYear()+2);
    else if (membership.period=='3 Y')
        end.setUTCFullYear(end.getUTCFullYear()+3);
    else if (membership.period=='1 D')
        end.setUTCDate(end.getUTCDate()+1);
    else
        throw 'Unexpected period: '+membership.period;
    if (!opt.disable_grace)
        end.setUTCDate(end.getUTCDate()+E.grace);
    return end;
}

E.get_end_by_period = get_end_by_period;

E.get_end_date = function(membership){
    var end = membership && (membership.end || membership.trial_end ||
        membership.grace_end || membership.start && membership.period &&
        get_end_by_period(membership));
    return end ? new Date(end) : null;
};

E.is_active = function(membership){
    if (!membership)
        return false;
    if (membership.trial_end && Date.now()<=new Date(membership.trial_end))
        return true;
    if (membership.grace_end && Date.now()<=new Date(membership.grace_end))
        return true;
    if (membership.end && Date.now()<=new Date(membership.end))
        return true;
    if (membership.start && membership.period &&
        Date.now()<=get_end_by_period(membership) && !E.is_trial(membership))
    {
        return !membership.cancelled || !membership.end;
    }
    return false;
};

E.is_in_trial = function(membership){
    return E.is_trial(membership)
        && Date.now()<new Date(membership.trial_end||membership.end);
};

E.is_trial = function(membership, type){
    return !!membership && (!!membership.trial_end &&
        (!type || type==(membership.type||'start'))
        || !!(membership.plan=='trial') && !!membership.end);
};

E.is_in_grace = function(membership){
    return E.is_grace(membership) && Date.now()<new Date(membership.grace_end);
};

E.is_grace = function(membership, type){
    return !!membership && !!membership.grace_end &&
        (!type || type==(membership.type||'start'));
};

E.had_premium = function(history){
    return !!history && history.some(function(h){ return !E.is_trial(h); });
};

E.had_trial = function(history, type){
    return !!history && history.some(function(h){
        return E.is_trial(h, type); });
};

E.had_grace = function(history, type){
    return !!history && history.some(function(h){
        return E.is_grace(h, type); });
};

E.trial_forbidden = function(membership, history, type){
    if (E.is_in_trial(membership))
        return 'trial exists';
    if (E.is_trial(membership, type))
        return 'trial expired';
    if (E.is_active(membership))
        return 'already premium';
    if (E.had_premium(history))
        return 'had premium';
    if (E.had_trial(history, type))
        return 'had trial';
    return false;
};

E.grace_period_forbidden = function(membership, history, type){
    if (E.is_in_grace(membership))
        return 'grace exists';
    if (E.is_grace(membership, type))
        return 'grace expired';
    if (E.is_active(membership))
        return 'already premium';
    if (E.had_grace(history, type))
        return 'had grace';
    return false;
};

E.is_paid = function(membership){
    return !!membership && !!membership.gateway; };

E.is_expired = function(membership){
    var end_date = E.get_end_date(membership);
    return !!end_date && Date.now()>end_date;
};

E.classify = function(membership){
    if (E.is_active(membership))
        return E.is_in_trial(membership) ? 'trial' : 'premium';
    if (E.is_expired(membership))
        return E.is_trial(membership) ? 'trial_expired' : 'premium_expired';
    return 'free';
};

E.gen_email_hash = function(email, md5){
    return md5('hola unsubscribe '+email).substr(0, 8);
};

function date2display(d){
    return d ? zdate.strftime('%o %B %Y', zdate(d)) : '-';
}

E.is_ios = function(membership){
    return membership.gateway=='apple' || membership.product=='ios';
};

E.is_mobile = function(membership){
    var gtw = ['paypal', 'paymill', 'avangate', 'bluesnap', 'paypal2'];
    return E.is_ios(membership) ||
        membership.gateway && !gtw.includes(membership.gateway);
};

E.period_str = function(membership){
    var price = membership.currency=='USD' && membership.amount;
    var show_price = function(name, default_price, periods, period_name){
        var p = +((price||default_price)/periods).toFixed(2);
        return name + ', $' + p + '/' + period_name;
    };
    switch (membership.period)
    {
    case '1 M': return show_price('Monthly', 11.95, 1, 'month');
    case '6 M': return show_price('Half-yearly', 54, 6, 'month');
    case '1 Y': return show_price('Yearly', 83.88, 1, 'year');
    case '2 Y': return show_price('2-year', 95.75, 2, 'year');
    case '3 Y': return show_price('3-year', 107.55, 3, 'year');
    case '1 D': return show_price('1-day', 1, 1, 'day');
    }
    if (!membership.end)
        return membership.grace_end ? 'updating' : '-';
    return (membership.gateway ? 'Till ' : 'Manual till ')
        +date2display(membership.end);
};

E.period_start_str = function(membership){
    return date2display(membership.start);
};

E.period_end_str = function(membership){
    if (E.is_in_trial(membership))
        return 'Trial valid until '+date2display(membership.trial_end);
    var period = membership.cancelled ? null :
        membership.period=='1 D' ? {day: 1} :
        membership.period=='1 M' ? {month: 1} :
        membership.period=='6 M' ? {month: 6} :
        membership.period=='1 Y' ? {year: 1} :
        membership.period=='2 Y' ? {year: 2} :
        membership.period=='3 Y' ? {year: 3} : null;
    if (!period)
        return membership.grace_end ? 'updating' : '-';
    return date2display(zdate.add(zdate(membership.start), period));
};

E.is_unassoc_trial = function(membership){
    return E.is_trial(membership) && E.is_ios(membership);
};

E.payment_label = function(membership){
    if (E.is_unassoc_trial(membership))
        return '-';
    switch (membership.gateway)
    {
    case 'paypal':
    case 'paypal2':
        return 'PayPal';
    case 'paymill':
        return 'Credit card ************'
        +(((membership.paymill|{}).payment||{}).last4||'****');
    case 'avangate':
    case 'bluesnap':
        return 'Credit card';
    case 'apple': return 'App Store';
    default: return membership.grace_end ? 'updating' : 'Google Play';
    }
};

E.get_id = function(m){
    switch (m.gateway)
    {
    case 'paypal': return m.paypal.subscr_id;
    case 'paypal2': return m.paypal2.subscr_id;
    case 'bluesnap': return m.bluesnap.subscr_id;
    case 'apple': return m.apple_ios.original_transaction_id;
    case 'android': return m.google_apk.purchase_token;
    case 'avangate': return m.avangate.subscr_ref;
    case 'paymill': return m.paymill.subscription_id;
    default: return 'UNKNOWN';
    }
};

E.is_cancellable_mobile = function(membership){
    return E.is_mobile(membership) &&
        !E.is_unassoc_trial(membership) &&
        (membership.cancelled || membership.cancellation_reason);
};

E.is_cancellable = function(membership){
    return !membership.cancelled && !E.is_cancellable_mobile(membership) &&
        !E.is_unassoc_trial(membership) && !membership.grace_end;
};

return E; }); }());
