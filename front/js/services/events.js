/**
 * BComeSafe, http://bcomesafe.com
 * Copyright 2015 Magenta ApS, http://magenta.dk
 * Licensed under MPL 2.0, https://www.mozilla.org/MPL/2.0/
 * Developed in co-op with Baltic Amadeus, http://baltic-amadeus.lt
 */

var EventManager = function () {
    var self = this;

    this.timeout = null;

    this.TYPE = {
        START_CONNECTION: 'start connection',
        MESSAGE_TO_SHELTER: 'message to shelter',
        MESSAGE_TO_CLIENT: 'message to client',
        CALL_SHELTER: 'call shelter'
    };

    this.WebRTC = {
        ANSWER: 'ANSWER',
        OFFER: 'OFFER',
        CANDIDATE: 'CANDIDATE'
    };

};

Events = new EventManager();