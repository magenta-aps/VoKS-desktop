/**
 * BComeSafe, http://bcomesafe.com
 * Copyright 2015 Magenta ApS, http://magenta.dk
 * Licensed under MPL 2.0, https://www.mozilla.org/MPL/2.0/
 * Developed in co-op with Baltic Amadeus, http://baltic-amadeus.lt
 */

var Connection = function () {

    var connection = {
        optional: [
            {internalSctpDataChannels: true}
        ]
    };

    var error = function (e) {
        if (e.type === 'close'  && Storage.get('PEER_CONNECTION') === 1 ) { //&& !Alarm.forsingReconnection
            Storage.set('connected', false);
            Storage.set('sendingOffer', true); // false
            Alarm.offerSent=false;
        }
    };

    var self = this;

    this.stream = null;
    this.remoteStream = null;

    this.connections = {};

    this.setStream = function (stream) {
        this.stream = stream;
    };


    this.getConnection = function (id) {

        if (typeof self.connections[id] === 'undefined') {
            this.connections[id] = this.createConnection(id);
        }

        return this.connections[id].connection;
    };

    this.createConnection = function (id) {
        var connection = new RTCPeerConnection({'iceServers': [{'url': config['stun']}]}, connection);

        //add local stream
        var noDevices = Storage.get('noDevices');
        if (!noDevices) {

            connection.addStream(self.stream);
        }

        connection.onaddstream = function (event) {
            event.stream.onended = function () {
                Storage.set('connected', false);
                Storage.set('sendingOffer', false);
                Alarm.offerSent=false;
            };

            if (!document.getElementById('audio')) {
                var audio = document.createElement('audio');
                audio.id = 'audio';
                audio.src = URL.createObjectURL(event.stream);
                audio.autoplay = true;
                audio.controls = true;
                document.body.appendChild(audio);
            } else {
                var audio = document.getElementById('audio');
                audio.src = URL.createObjectURL(event.stream);
            }

            self.remoteStream = event.stream;
        };

        connection.oniceconnectionstatechange = function () {
            switch (connection.iceConnectionState) {
                case 'disconnected':
                case 'failed':
                    Storage.set('connected', false);
                    Storage.set('sendingOffer', false);
                    Alarm.offerSent=false;
                    break;
                case 'completed':
                case 'connected':
                    Storage.set('connected', true);
                    Storage.set('sendingOffer', false);
                    break;
            }
        };

        connection.onremovestream = function (e) {
            Storage.set('sendingOffer', false);
        };

        connection.onclose = function (e) {
            Storage.set('sendingOffer', false);
        };

        connection.onicecandidate = function (e) {
            if (!connection || !e || !e.candidate)
                return;
            var candidate = e.candidate;
            self.sendMessage(id, Events.WebRTC.CANDIDATE, candidate);
        };

        return {
            connection: connection
        };
    };

    self.processOffer = function (id, offer) {
        var connection = self.getConnection(id);
        connection.setRemoteDescription(new RTCSessionDescription(offer), function () {

        }, error);

        connection.createAnswer(function (sdp) {
            connection.setLocalDescription(sdp, function () {
            }, error);
            self.sendMessage(id, Events.WebRTC.ANSWER, sdp);
        }, error);
    };

    self.sendOffer = function (id) {
        Storage.set('sendingOffer', true);
        var connection = self.getConnection(id);
        connection.createOffer(function (sdp) {
            connection.setLocalDescription(sdp, function () {
            }, error);
            self.sendMessage(id, Events.WebRTC.OFFER, sdp);
        }, error);
    };

    self.processAnswer = function (id, answer) {
        var connection = self.getConnection(id);
        connection.setRemoteDescription(new RTCSessionDescription(answer), function () {
        }, error);
    };

    self.processIce = function (id, ice) {
        var connection = self.getConnection(id);
        connection.addIceCandidate(new RTCIceCandidate(ice), function () {
        }, error);
    };


    self.sendMessage = function (to, type, sdp) {
        var dataPacket;
        if (sdp) {
            dataPacket = {
                src: config['id'],
                dst: config['shelterId'],
                type: type,
                payload: sdp
            };
        } else {
            dataPacket = {
                src: config['id'],
                dst: config['shelterId'],
                type: type
            };
        }

        WebSockets.send(dataPacket);
    };

    self.connectionActive = function (id) {
        try{
            if (typeof self.connections[id] !== 'undefined'
                && typeof self.connections[id].connection !== 'undefined'
                && self.connections[id].connection.signalingState !== 'closed') {
                Storage.set('connected', true)
                return true;
            }
        }catch(e) {
            Alarm.offerSent=false;
            self.destroy(id, 8);
            return false;
        }
        Storage.set('connected', false);
        return false;
    };

    self.sendRawMessage = function (id, data) {
        if (self.connectionActive(id)) {
            self.connections[id].connection.data.send(data);
        }
    };

    self.destroy = function (id, state) {
        if (typeof self.connections[id] !== 'undefined') {
            try {
                self.connections[id].connection.close();
            } catch (e) {
                if (e.code === 11) {
                    delete self.connections[id];
                }
            }

            delete self.connections[id];
        }
    };

    self.destroyConnections = function (from) {
        Storage.set('calling', false);
        Storage.set('connected', false);
        Storage.set('sendingOffer', false);
        Alarm.offerSent=false;

        for (var id in self.connections) {
            self.destroy(id, 6);
        }
    };

};

RTCConnection = new Connection();