/**
 * BComeSafe, http://bcomesafe.com
 * Copyright 2015 Magenta ApS, http://magenta.dk
 * Licensed under MPL 2.0, https://www.mozilla.org/MPL/2.0/
 * Developed in co-op with Baltic Amadeus, http://baltic-amadeus.lt
 */

var WebsocketConnection = function () {
    var self = this;
    var THIRTY_MINUTES=1000*60*30;

    this.reconnectionDelay = config['reconnectionDelay'];
    this.connection = null;

    this.close = function (callback) {
        callback();
    };

    this.init = function () {
        this.connection = new WebSocket(
            config['ws_url'] + '/' + (Alarm.TRIGGERED_ALARM?'1':'0')
        );

        this.connection.onopen = function (e) {
            if(Storage.get('showDisconnectedMessage')){
                self.setDisconnectionValues();
                Alarm.sendSystemMessage('connecting');
            }
            Storage.set('showDisconnectedMessage', true);
            Alarm.sendSystemMessage('connected');

            Alarm.deviceCheck(function(hasAudio, hasVideo){
               Storage.set('noAudio', !hasAudio);
            });

            Storage.set('wsConnected', true);

            if(!Storage.get('arubaNoticeHidden')){
                UIHelper.hideArubaNotice();
                UIHelper.showConfirmation();
            }

            Alarm.sendQueuedMessages();
        };

        this.connection.onerror = function (e) {
        };


        this.connection.onclose = function (e) {
            self.reinitializeObject();
        };

        this.onDisconnected=function(){
            if(!Storage.get('noInternet') ){
                Storage.set('noInternet', true);
                Storage.set('showDisconnectedMessage', false);
                self.setDisconnectionValues();
                RTCConnection.destroyConnections(6);
                Alarm.sendSystemMessage('connecting');

                setTimeout(function () {
                    if(!Storage.get('noInternet')){
                        self.init();
                    }
                }, self.reconnectionDelay);
            }
        };

        this.setDisconnectionValues = function(shelterStatusChange){
            if(!shelterStatusChange){
                Storage.set('wsConnected', false);
                Alarm.sendSystemMessage('crisis_team_disconnected');
                Alarm.sendSystemMessage('connect_to_aruba');
            }
            Storage.set('connected', false);
            Storage.set('calling', false);
            Alarm.connecting = false;

            UIHelper.hangupOnShelter();
            UIHelper.disableShelterCall();
            Alarm.offerSent = false;
        };

        this.connection.onmessage = function (e) {
            var json = JSON.parse(e.data);
                switch (json.type) {
                    case 'PING':
                        self.sendPongMessage();
                        break;
                    case 'SHELTER_STATUS':

                        if (json.data === 0) {
                            if(Storage.get('state') > Alarm.INACTIVE){
                                WebSockets.setDisconnectionValues(true);
                                RTCConnection.destroyConnections(7);
                            }

                        } else {
                            if(Storage.get('PEER_CONNECTION') === 1 && process.platform!='darwin'){
                                Alarm.startConnection();
                            }
                            if(!Storage.get('noAudio')){
                                UIHelper.enableShelterCall();
                            }
                            else {
                                UIHelper.disableShelterCall();
                            }
                        }
                        Storage.set('shelter_on', json.data);
                        break;
                    case 'PEER_CONNECTION':
                        Storage.set('PEER_CONNECTION', json.data);
                        if (json.data == 1 && !Storage.get('connected') && Storage.get('state') > Alarm.INACTIVE) {
                            Alarm.startConnection();
                        } else if (json.data == 0) {
                            Alarm.offerSent = false;
                            Storage.set('connected', false);
                            Alarm.closeConnection(config['shelterId']);
                        }
                        break;
                    case 'CALL_STATE':
                        if (json.data === 1) {
                            UIHelper.callShelter();
                            Storage.set('calling', true);
                            Alarm.unmuteAudio(RTCConnection.remoteStream, true);
                        } else {
                            UIHelper.hangupOnShelter();
                            Alarm.unmuteAudio(RTCConnection.remoteStream, false);
                            Storage.set('calling', false);
                        }
                        break;
                    case 'SHELTER_RESET':
                        if (json.data === 1) {
                            UIHelper.reset(false);
                        }
                        break;
                    case 'MESSAGE':
                        if (json.dst === config['id']) {
                            UIHelper.addMessage('shelter', json.data, json.timestamp);
                            UIHelper.scrollToBottom();
                            app.iconIndicator();
                            Storage.appendMessage('shelter', json.data, json.timestamp);
                        }
                        break;
                    case 'LISTENING':
                        if (json.data == 1) {
                            Alarm.sendSystemMessage('shelter_answered');
                            Alarm.unmuteAudio(RTCConnection.remoteStream, true);
                            // Change call button to calling shelter
                            UIHelper.callShelter();
                        } else {
                            if (Storage.get('calling')) {
                                Alarm.sendSystemMessage('on_hold');
                                Alarm.unmuteAudio(RTCConnection.remoteStream, false);
                            }
                        }
                        break;
                    case 'VIDEO':
                        if (RTCConnection.stream) {
                            var tracks = RTCConnection.stream.getVideoTracks();
                            for (var i = 0; i < tracks.length; i++) {
                                tracks[i].enabled = json.data === 1;
                            }
                        }
                        break;
                    case 'SEND_NOTIFICATION':

                        var now=Date.now();
                        if((now - json.payload.timestamp) < THIRTY_MINUTES){
                            UIHelper.addMessage('notification', json.payload.body, json.payload.timestamp, true, json.payload.id);
                            UIHelper.scrollToBottom();
                            var options = {
                                body: json.payload.body + "\n" + Storage.get('translations')['if_gotit']
                            };

                            if(!app.visible || !Alarm.TRIGGERED_ALARM){
                                nwNotify.notify({
                                    title: json.payload.title,
                                    text: json.payload.body + "<br /> <br />" + Storage.get('translations')['if_gotit'],
                                    onClickFunc: function(event) {
                                        Alarm.onNotificationClick(json.payload.id);
                                        event.closeNotification();
                                    },
                                    onCloseFunc: function(event) {
                                        Alarm.onNotificationClick(json.payload.id);
                                    }
                                });
                            }
                        }
                        break;

                    // WebRTC messages
                    case Events.WebRTC.CANDIDATE:
                        RTCConnection.processIce(json.src, json.payload);
                        break;
                    case Events.WebRTC.OFFER:
                        RTCConnection.processOffer(json.src, json.payload);
                        break;
                    case Events.WebRTC.ANSWER:
                        RTCConnection.processAnswer(json.src, json.payload);
                        break;
                }

        };

    };

    this.reinitializeObject = function(){
        delete self.connection;
        delete WebSockets;
        WebSockets = new WebsocketConnection();
        WebSockets.init();
    };

    this.sendChatMessage = function(message){
        var data = {
            dst: config["shelterId"],
            src: config["id"],
            type: "MESSAGE",
            data: message,
            timestamp: Date.now()
        };

        if (Storage.get('wsConnected') && !Storage.get('noInternet')) {
            self.send(data);
        } else {
            Alarm.addQueueMessage(data);
        }
    };

    this.sendPongMessage = function(){
        var data = {
            type: "PONG"
        };
        this.send(data);
    };

    this.sendMessage = function (to, type, payload, from) {
        var data = {
            src: from || config.id,
            dst: to,
            type: type
        };

        if (payload) {
            data.payload = payload;
            data.data = payload;
        }

        this.send(data);
    };

    this.send = function (data) {
        try{
            this.connection.send(JSON.stringify(data));
        }catch(e){
            Alarm.offerSent=false;
            Storage.set('sendingOffer', false);
        }
    };
};

WebSockets = new WebsocketConnection();