/**
 * BComeSafe, http://bcomesafe.com
 * Copyright 2015 Magenta ApS, http://magenta.dk
 * Licensed under MPL 2.0, https://www.mozilla.org/MPL/2.0/
 * Developed in co-op with Baltic Amadeus, http://baltic-amadeus.lt
 */

var Storage = {
    set: function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        return value;
    },
    get: function (key) {
        var value = localStorage.getItem(key);
        try {
            if (value) {
                return JSON.parse(value);
            }
        } catch(e) {}
        return value;
    },
    remove: function(key){
        localStorage.removeItem(key);
    },
    clear: function(resetCount) {
        var id = Storage.get('id');
        var count = Storage.get('registerCount');
        localStorage.clear();

        if(id) {
            Storage.set('id', id);
        }
        if(resetCount){
            Storage.set('registerCount', 0);
        }
        else {
            Storage.set('registerCount', count);
        }
    },
    appendMessage: function(type, message, timestamp) {
        var messages = this.getMessages();
        messages.push({type: type, message: message, timestamp: timestamp});
        this.set('messages', messages);
    },
    getMessages: function() {
        return this.get('messages') || [];
    }
};