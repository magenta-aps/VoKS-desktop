/**
 * BComeSafe, http://bcomesafe.com
 * Copyright 2015 Magenta ApS, http://magenta.dk
 * Licensed under MPL 2.0, https://www.mozilla.org/MPL/2.0/
 * Developed in co-op with Baltic Amadeus, http://baltic-amadeus.lt
 */

var AlarmService = function () {
    var self = this;

    this.state = Storage.get('state') || 0;
    this.clientCameraState = true;
    this.clientCameraState2 = true;
    this.offerSent = false;
    this.connecting = false;
    this.forsingReconnection = false;
    this.micAvailable = true;
    this.camAvailable = true;
    this.cameraError=false;
    this.pushNotificationIdList = [];

    this.connectedToAruba=false;
    this.deviceCheckInterval=null;

    this.INACTIVE = 0;
    this.ACTIVE = 1;
    this.CHAT = 2;

    this.queuedMessages = [];

    this.CALLED_POLICE = Storage.get('police') || false;
    this.TRIGGERED_ALARM = Storage.get('alarm') || false;

    this.setState = function (status) {
        this.state = Storage.set('state', status);
        return this;
    };
    /**
     * Trigger alarm
     *
     * @param status - if calling police then 1, otherwise 0
     * @param callback - only called if shelter isn't on
     */
    this.trigger = function (status, callback) {
        $.get(config['api_url'] + 'trigger-alarm?device_id=' + config['id'] + '&call_police=' + (status ? 2 : 0).toString(), function (data) {
            if (typeof callback === 'function' && !Storage.get('shelter_on')) {
                callback(data);
            }
        });
        self.TRIGGERED_ALARM = Storage.set('alarm', true);
    };

    /**
     * Send error report to via the API
     * @param message
     */
    this.sendErrorReport = function(message){
        var errorData = {
            device_id : config['id'],
            device_type: 'desktop',
            message: JSON.stringify(message)
        };
        var url = config['api_url'] || config['default_api_url'] + 'logger';
        $.post(url, errorData, function(data){
        });
    };
    /**
     * Mute and un-mute remote stream
     * @param stream
     * @param enabled
     */
    this.unmuteAudio = function (stream, enabled) {
        if(!stream) return;
        var audioTracks = stream.getAudioTracks();
        for (var i = 0; i < audioTracks.length; i++) {
            audioTracks[i].enabled = enabled;
        }
    };
    /**
     * Send a request to call the police
     */
    this.askToCallPolice = function () {
        this.trigger(true);
        self.CALLED_POLICE = Storage.set('police', true);
    };

    /**
     * Checks if the VOKS server is reachable, registers a device,
     * and opens webSocket connection
     */
    this.initAndConnectionCheck=function(){
        UIHelper.hostReachable().done(function() {
            if(Storage.get('noInternet')){
                WebSockets.connection.onclose=function(){};
                WebSockets.connection.close();
                delete WebSockets.connection;
            }
            Storage.set('noInternet', false);
            // only execute if VOKS was not reachable before
            if(!self.connectedToAruba){
                self.connectedToAruba=true;
                if(Storage.get('wsConnected')){
                    UIHelper.hideArubaNotice();
                    UIHelper.showConfirmation();
                    Storage.set('arubaNoticeHidden', true);
                }
                else {
                    Storage.set('arubaNoticeHidden', false);
                }

                $.get(config['api_url'] + "register-device", {
                    device_id: config['id'],
                    device_type: 'desktop',
                    gcm_id: config['id'],
                    mac_address: config['mac'],
                    lang: config['lang']
                })
                    .done(function (settings) {
                    if(settings.success == false){
                        UIHelper.showOtherMessage(settings.message);
                        UIHelper.showArubaNotice();
                        UIHelper.hideConfirmation();
                        self.connectedToAruba = false;
                        setTimeout(self.initAndConnectionCheck, config['checkConnectionDelay']);
                        return false;
                    } else {
                        // Check how many times the device was registered
                        // (Used for detecting if the application was reset from shelter or closed by user [Quit app])
                        var count = Storage.get('registerCount') + 1;
                        Storage.set('registerCount', count);

                        // Set the configurations retrieved from the shelter
                        config['api_url'] = settings['api_url'];
                        config['ws_url'] = settings['ws_url'];
                        config['shelterId'] = settings['shelter_id'];
                        config['dev_mode'] = settings['dev_mode'];
                        WebSockets.init();
                    }
                })
                    .fail(function(){
                        self.connectedToAruba = false;
                        UIHelper.showOtherMessage(lang('crisis_team_disconnected'));
                    });
            }
            // Keep checking
            setTimeout(self.initAndConnectionCheck, config['checkConnectionDelay']);

        }).fail(function(jqXHR, textStatus, errorThrown) {
            // Catch error when WebSockets is not yet loaded, and ignore
            try{
                WebSockets.onDisconnected();
            }
            catch(e){

            }
            UIHelper.updateTranslations();

            // execute only if VOKS was reachable before
            if(self.connectedToAruba){
                self.connectedToAruba=false;
                Storage.set('connected', false);
                UIHelper.showArubaNotice();
                UIHelper.hideConfirmation();
            }
            // Keep checking
            setTimeout(self.initAndConnectionCheck, config['checkConnectionDelay'])

        });
    };

    this.init = function () {
        // make sure that localStorage data is cleared
        UIHelper.reset(true);
        $.getJSON('front/languages/' + config['lang'] + '.json', function (data) {
            localStorage.removeItem('translations');
            Storage.set('translations', data);
            UIHelper.updateTranslations();
            // try to initialize
            self.initAndConnectionCheck();
        });

    };

    this.gotIt = function(notificationId){
        $.post(config['api_url'] + "got-it?device_id=" + Storage.get('id') + '&notification_id=' + notificationId);
    };

    this.onNotificationClick = function(notificationId){
        var id = parseInt(notificationId);
        if(!Alarm.TRIGGERED_ALARM){
            $('[data-notificationid=' + id + ']').remove();
        }
        else{
            $('[data-notificationid=' + id + ']').children('.system__button').remove();
        }

        self.gotIt(id);
    };

    this.deviceCheck = function(callback){
        navigator.mediaDevices.enumerateDevices().then(function(sources){
            var hasAudio = false;
            var hasVideo = false;
            for (var i = 0; i < sources.length; i++) {
                if (sources[i].kind === 'audioinput') {
                    hasAudio = true;
                }
                else if (sources[i].kind === 'videoinput') {
                    hasVideo = true;
                }
            }
            //callback(true, true);
            callback(hasAudio, hasVideo);
        });
    };

    this.beginRTCConnection = function () {

        self.deviceCheck(function(hasAudio, hasVideo){
            if(Storage.get("hasAudio") != hasAudio && !hasAudio){
                self.sendSystemMessage('no_microphone');
                UIHelper.disableShelterCall();
            }
            Storage.set("hasAudio", hasAudio);
            if (hasAudio || hasVideo) {
                clearTimeout(self.rtctimeout);
                navigator.getUserMedia({audio: hasAudio, video: hasVideo}, function (event) {

                    RTCConnection.setStream(event);
                    if (!Storage.get('noInternet') && Storage.get('PEER_CONNECTION')) {
                        if(!self.connecting){
                            self.connecting=true;
                        }
                        if (!self.offerSent) {
                            // RTCConnection.destroyConnections();
                            self.offerSent = true;
                            try{
                                RTCConnection.sendOffer(config['shelterId']);

                            }catch(e){
                                self.offerSent=false;
                                Storage.set('sendingOffer', false);
                                return;
                            }
                            Storage.set('noDevices', false);
                            Storage.set('permissionsGranted', true);
                        }
                        // wait for camera to change the readyState
                        setTimeout(function () {
                            if (self.testVideoStream(event) === false) {
                                self.clientCameraState2 = false;
                                self.beginRTCConnection();
                            }
                            else if (self.clientCameraState2 === false) {
                                self.clientCameraState2 = true;
                                self.forsingReconnection=true;
                                RTCConnection.destroyConnections(5);
                                WebSockets.sendMessage(config['shelterId'],'PEER_RECONNECT',1);
                                if(!self.cameraError){
                                    self.sendSystemMessage('camera_available');
                                }
                                else {
                                    self.cameraError = false;
                                }
                                self.offerSent = false;
                                self.rtctimeout=setTimeout(function(){
                                    self.forsingReconnection=false;
                                    self.beginRTCConnection();
                                }, 3500);
                            }
                        }, 1300)
                    } else {
                        self.rtctimeout=setTimeout(self.startConnection, 1000);
                    }


                }, function (error) {
                    Storage.set('permissionsGranted', false);
                    Storage.set('noDevices', true);
                });

            }

            else {
                // Storage.set('permissionsGranted', false);
                Storage.set('noDevices', true);
                RTCConnection.sendOffer(config['shelterId']);

            }
        })
    };

    this.startConnection = function () {
        if (!RTCConnection.connectionActive(config['shelterId']) && Storage.get('shelter_on') && Storage.get('PEER_CONNECTION')===1 && Storage.get('state') > Alarm.INACTIVE) {
            self.beginRTCConnection();
        }
    };

    this.testVideoStream = function (stream) {
        var tracks = stream.getVideoTracks();
        var videoTrack = tracks[0];
        try{
            if (videoTrack.readyState == "ended") {
                if (this.clientCameraState) {
                    self.sendSystemMessage('camera_busy');
                    this.clientCameraState = false;
                }
                return false;
            }
            else {
                this.clientCameraState = true;
                return true;
            }
        } catch(err) {
            self.cameraError=true;
            return false;
        }

    };

    this.closeConnection = function () {
        RTCConnection.destroy(config['shelterId']);
    };


    this.hideTimer = function () {
        this.hideTimeout = setTimeout(function () {
            app.hide();
        }, 5000);
    };

    this.removeHideTimer = function () {
        clearTimeout(this.hideTimeout);
    };

    this.clearTimeout = function () {
        clearTimeout(self.timeout);
    };

    this.sendSystemMessage = function (key) {
        UIHelper.addMessage('system', lang(key));
        UIHelper.scrollToBottom();
        Storage.appendMessage('system', lang(key));
    };

    this.addQueueMessage = function (data) {
        this.queuedMessages.push(data);
    };

    this.sendQueuedMessages = function () {
        var messages = this.getQueuedMessages();
        for (var i in messages) {

            WebSockets.send(messages[i]);
            delete messages[i];
        }
    };

    this.getQueuedMessages = function () {
        return this.queuedMessages;
    };
};

Alarm = new AlarmService();
