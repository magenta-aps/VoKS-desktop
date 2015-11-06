/**
 * BComeSafe, http://bcomesafe.com
 * Copyright 2015 Magenta ApS, http://magenta.dk
 * Licensed under MPL 2.0, https://www.mozilla.org/MPL/2.0/
 * Developed in co-op with Baltic Amadeus, http://baltic-amadeus.lt
 */

UIEvents = {
    onClick: function(element, callback) {
        element.click(function(e) {
            e.preventDefault();

            callback.call(this);
        });
    },
    onSubmit: function(element, callback) {
        element.submit(function(e) {
            e.preventDefault();

            callback.call(this);
        });
    }
};