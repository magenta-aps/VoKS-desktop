/**
 * BComeSafe, http://bcomesafe.com
 * Copyright 2015 Magenta ApS, http://magenta.dk
 * Licensed under MPL 2.0, https://www.mozilla.org/MPL/2.0/
 * Developed in co-op with Baltic Amadeus, http://baltic-amadeus.lt
 */

var WebRTC = {
    RTCPeerConnection: window.mozRTCPeerConnection || window.RTCPeerConnection || window.webkitRTCPeerConnection,
    RTCSessionDescription: window.mozRTCSessionDescription || window.RTCSessionDescription || window.webkitRTCSessionDescription,
    RTCIceCandidate: window.mozRTCIceCandidate || window.RTCIceCandidate || window.webkitRTCIceCandidate,
};

if(navigator.webkitGetUserMedia) {
    WebRTC.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
} else if(navigator.mozGetUserMedia) {
    WebRTC.getUserMedia = navigator.mozGetUserMedia.bind(navigator);
} else {
    WebRTC.getUserMedia = navigator.getUserMedia.bind(navigator);
}