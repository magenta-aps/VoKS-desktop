/**
 * BComeSafe, http://bcomesafe.com
 * Copyright 2015 Magenta ApS, http://magenta.dk
 * Licensed under MPL 2.0, https://www.mozilla.org/MPL/2.0/
 * Developed in co-op with Baltic Amadeus, http://baltic-amadeus.lt
 */

MediaStreamTrack.getSources(function (sources) {
    var hasAudio = false;
    var hasVideo = false;
    for (var i = 0; i < sources.length; i++) {
        if (sources[i].kind === 'audio') {
            hasAudio = true;
        }
        else if (sources[i].kind === 'video') {
            hasVideo = true;
        }
    }

    WebRTC.getUserMedia({audio: hasVideo, video: hasAudio}, function(event){
        Storage.set('permissionsGranted', true);
    }, function(error) {
        Storage.set('permissionsGranted', false);
    });
});