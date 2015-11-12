/**
 * BComeSafe, http://bcomesafe.com
 * Copyright 2015 Magenta ApS, http://magenta.dk
 * Licensed under MPL 2.0, https://www.mozilla.org/MPL/2.0/
 * Developed in co-op with Baltic Amadeus, http://baltic-amadeus.lt
 */

UI = {
    sizes: {
        inactive: {
            height: 90
        },
        activated: {
            height: 200
        },
        chat: {
            height: 360
        }
    },
    newMessages: 0,
    elements: {
        body: $("body"),
        confirm: {
            alarm: $(".confirm-alarm"),
            aruba: $(".connect-aruba"),
            yes: $("#yes"),
            no: $("#no, .close-window:not(.close-police)")
        },
        window: $("#alarm-activated-window"),
        closeWindow: $("#close-alarm-window"),
        hideActiveWindowButton: $(".hide-chat-button"),
        police: {
            buttons: $('.call-the-police'),
            message: $('.alerting-police'),
            popupButton: $(".close-police"),
            closeNotice: $("#close-police-notice")
        },
        chat: {
            box: $("#chatwin"),
            feed: $(".chat-window"),
            showChatButton: $(".show-chat-button"),
            form: $("#chat-form"),
            input: $(".chat-input"),
            hide: $('.close-window.but'),
            submit: $('#submit-button'),
            systemButton: $('.system__button')
        },
        call: {
            button: $("#call-crisis-team")
        }
    }
};
