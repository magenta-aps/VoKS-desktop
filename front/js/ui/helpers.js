/**
 * BComeSafe, http://bcomesafe.com
 * Copyright 2015 Magenta ApS, http://magenta.dk
 * Licensed under MPL 2.0, https://www.mozilla.org/MPL/2.0/
 * Developed in co-op with Baltic Amadeus, http://baltic-amadeus.lt
 */

UIHelper = {
    getTranslations: function (callback){
        $.getJSON('front/languages/' + config['lang'] + '.json', function (data) {
            Storage.set('translations', data);
            callback(data);
        });
    },
    showConfirmation: function () {
        UI.elements.body.css(UI.sizes.inactive);
        UI.elements.confirm.alarm.show();
    },
    hideConfirmation: function () {
        UI.elements.body.css(UI.sizes.activated);
        UI.elements.confirm.alarm.hide();
    },
    hideArubaNotice: function(){
        UI.elements.confirm.aruba.hide();
    },
    showArubaNotice: function(){
        UI.elements.confirm.aruba.show();
    },
    showOtherMessage: function(text){
        $("[data-lang=connect_to_aruba]").html(text);
    },
    showActivatedWindow: function () {
        UI.elements.window.show();
    },
    hideActivatedWindow: function () {
        UI.elements.window.hide();
    },
    hidePoliceButtons: function () {
        UI.elements.police.buttons.prop('disabled', true);
    },
    showPoliceMessage: function () {
        UI.elements.police.message.show();
        setTimeout(function () {
            UI.elements.police.message.hide();
        }, 3000);
    },
    hidePoliceMessage: function () {
        UI.elements.police.message.hide();
    },
    showChat: function () {
        this.hideActivatedWindow();
        UI.elements.chat.box.show();
    },
    sortMessages: function () {
        UI.elements.chat.feed.children("p").sort(function (a, b) {
            var upA = $(a).data('timestamp');
            var upB = $(b).data('timestamp');
            return (upA < upB) ? -1 : (upA > upB) ? 1 : 0;
        }).appendTo( UI.elements.chat.feed);
    },
    updateTranslations: function () {
        var translations = Storage.get("translations");

        if (translations) {
            // Updating all html UI elements
            $("[data-lang]").each(function () {
                $(this).html(translations[$(this).data('lang')])
            });

            // Updating placeholders and titles
            UI.elements.chat.input.attr("placeholder", translations['type_text']);
            UI.elements.chat.hide.attr("title", translations['hide_tooltip']);
            UI.elements.chat.showChatButton.attr("title", translations["show_tooltip"]);
            UI.elements.police.closeNotice.attr("title", translations["close_notice_tooltip"]);
            UI.elements.closeWindow.attr("title", translations["close_tooltip"]);
            UI.elements.call.button.attr("title", translations["call_tooltip"]);
            UI.elements.police.buttons.attr("title", translations["notify_tooltip"]);
            UI.elements.chat.submit.attr("title", translations["send"]);

            UI.elements.hideActiveWindowButton.attr("title", translations['hide_tooltip']);
            UI.elements.closeWindow.attr("title", translations['close_tooltip']);


            // update tray menu items
            for (var i=0; i<menu.items.length; i++){
                if(menu.items[i].label){
                    switch(menu.items[i].label){
                        case 'Open App':
                            menu.items[i].label=translations['open_app'];
                            break;
                        case 'Quit Alarm':
                            menu.items[i].label=translations['quit_alarm'];
                            break;
                    }
                }
            }

        }

    },
    hostReachable: function() {
        return $.ajax({
            url:config['connectionCheckUrl'],
            success: function(){},
            cache: false
        });
},
    addMessage: function (type, content, timestamp, html, notificationId) {
        if (!timestamp) {
            timestamp = Date.now();
        }



        if(!html) {
            var message = $('<p data-timestamp="' + timestamp + '" />').text(content || '');
        } else {
            content = "<span>" + content + "</span>";
            var message = $('<p data-timestamp="' + timestamp + '" />').html(content || '');
        }

        switch (type) {
            case 'system':
                message.addClass('system').addClass('system_color');
                break;
            case 'client':
                message.addClass('me')
                    .append('<span class="speech-arrow" />');
                break;
            case 'shelter_pre':
            case 'shelter':
                var crisisTeamName=Storage.get('translations')['crisis_team'];
                message.addClass('ct')
                    .append('<span class="speech-arrow" />')
                    .prepend('<em>' + crisisTeamName + '</em>');
                break;
            case 'reset':
                message.addClass('system');
                message.html('<a href="#" class="reset-plugin">Reset</a>');
                message.click(function () {
                    UIHelper.reset();
                });
                break;
            case 'notification':
                var translations = Storage.get("translations");
                message.attr('data-notificationId', notificationId).addClass('system')
                    .append('<button class="system__button">' + translations['got_it'] + '</button>');
                break;
        }

        if(type==='shelter_pre'){
            UI.elements.chat.feed.prepend(message);
        }
        else {
            UI.elements.chat.feed.append(message);
        }
        UIHelper.sortMessages();
    },
    scrollToBottom: function () {
        var elem = document.getElementById('scrollable-chat');
        elem.scrollTop = elem.scrollHeight;
    },
    reset: function(noReload){
        if(!noReload){
            tray.remove();
            tray = null;
            window.location.reload(true);
            Storage.clear(true);
            Storage.set('wasReset', true);
        }
        else {
            Storage.clear();
        }
    },
    disableShelterCall: function() {
        UI.elements.call.button.addClass('disabled');
    },
    enableShelterCall: function() {
        UI.elements.call.button.removeClass('disabled');
    },
    callShelter: function () {
        UI.elements.call.button.addClass('close');
    },
    hangupOnShelter: function () {
        UI.elements.call.button.removeClass('close');
    },
    loadMessages: function (messages) {
        for (var i in messages) {
            UIHelper.addMessage(messages[i].type, messages[i].message);
        }

        UIHelper.scrollToBottom();
    }
}
;