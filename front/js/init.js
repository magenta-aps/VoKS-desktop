/**
 * BComeSafe, http://bcomesafe.com
 * Copyright 2015 Magenta ApS, http://magenta.dk
 * Licensed under MPL 2.0, https://www.mozilla.org/MPL/2.0/
 * Developed in co-op with Baltic Amadeus, http://baltic-amadeus.lt
 */

$(document).ready(function () {

    if(Storage.get('wasReset')){
        Storage.set('wasReset', false);
        app.hide();
    }

    $(document).keypress(function (e) {

        if (e.which == 13) {
            if(Storage.get('state') == Alarm.INACTIVE || Storage.get('state')===null) {
                UI.elements.confirm.yes.click();
            }
        }
    });


    $(".but").hover(function(){
        $(this).addClass('hover');
    }, function(){
        $(this).removeClass('hover');
    });

    UIEvents.onClick(UI.elements.confirm.yes, function () {
            UIHelper.hostReachable().done(function() {
                    UIHelper.hideConfirmation();
                    UIHelper.showActivatedWindow();
                    Alarm.trigger(false);
                    Alarm.setState(Alarm.ACTIVE);
                    Alarm.hideTimer();

            }).fail(function(jqXHR, textStatus, errorThrown) {
            });
    });

    UIEvents.onClick(UI.elements.confirm.no, function () {
        app.hide();
    });

    UIEvents.onClick(UI.elements.hideActiveWindowButton, function(){
        clearTimeout(Alarm.hideTimeout);
        app.hide();
    });

    UIEvents.onClick(UI.elements.police.buttons, function () {
        UIHelper.hostReachable().done(function() {
            UIHelper.showPoliceMessage();
            UIHelper.hidePoliceButtons();
            Alarm.askToCallPolice();
            Storage.set('police', true);
        }).fail(function(jqXHR, textStatus, errorThrown) {
        });
    });

    UIEvents.onClick(UI.elements.police.popupButton, function () {
        UIHelper.hidePoliceMessage();
    });

    UIEvents.onClick(UI.elements.chat.showChatButton, function () {
        Alarm.removeHideTimer();
        UIHelper.showChat();
    });


    /**
     * Call shelter
     */
    UIEvents.onClick(UI.elements.call.button, function () {
        if(!Storage.get('wsConnected') || Storage.get('noAudio') || Storage.get('shelter_on')===0)  {
            return;
        }

        if(!Storage.get('calling')) {
            UIHelper.callShelter();
            WebSockets.sendMessage(config['shelterId'], 'REQUEST_CALL', 1);
            Alarm.sendSystemMessage('calling');
            Storage.set('calling', true);
        } else {
            UIHelper.hangupOnShelter();
            WebSockets.sendMessage(config['shelterId'], 'REQUEST_CALL', 0);
            Alarm.sendSystemMessage('hangup');
            Alarm.unmuteAudio(RTCConnection.remoteStream, false);
            Storage.set('calling', false);
        }
    });


    $(document).on('click', '.system__button', function() {

        Alarm.gotIt($(this).parent().attr('data-notificationid'));
        $(this).remove();
    });



    /**
     * Send message to shelter
     */
    UIEvents.onSubmit(UI.elements.chat.form, function () {
        var input = UI.elements.chat.input,
            value = $.trim(input.val());

        if (value.length > 0) {
            WebSockets.sendChatMessage(value);
            UIHelper.addMessage('client', value);
            Storage.appendMessage('client', value);
            input.val('');
            UIHelper.scrollToBottom();
        }
    });

    /**
     * Initialize stuff
     **/
    if(Storage.get('registerCount') === null){
        Storage.set('registerCount', 0);
    }

    Storage.set('showDisconnectedMessage',false);

    UIHelper.getTranslations(function(){
        if(!Alarm.connecting){
            Alarm.connecting=true;
            Alarm.sendSystemMessage('connecting');
        }
    });

    // Used in case RTC event was not fired
    setInterval(function(){
        if(typeof RTCConnection.connections[config['shelterId']] !="undefined"){
            switch(RTCConnection.connections[config['shelterId']].connection.iceConnectionState){
                case 'failed':
                case 'disconnected':
                case 'closed':
                    RTCConnection.destroyConnections(1);
                    break;
                case 'new':
                    var time=Storage.get('inCheckingStateFor');
                    if(time == null){
                        Storage.set('inCheckingStateFor', 0);
                    }else {
                        Storage.set('inCheckingStateFor', time + config['rtcStateCheckDelay']);
                    }

                    if(Storage.get('inCheckingStateFor') > 2000){
                        RTCConnection.destroyConnections(2);
                        Storage.remove('inCheckingStateFor');
                    }
                    break;
                case 'checking':
                    var time=Storage.get('inNewStateFor');
                    if(time == null){
                        Storage.set('inNewStateFor', 0);
                    }else {
                        Storage.set('inNewStateFor', time + config['rtcStateCheckDelay']);
                    }

                    if(Storage.get('inNewStateFor') > 2000){
                        RTCConnection.destroyConnections(3);
                        Storage.remove('inNewStateFor');
                    }
                    break;
            }
        }
        else {
            RTCConnection.destroyConnections(4);
        }
    }, config['rtcStateCheckDelay']);

    // Restore connection when peer connection disconnected for reasons
    // other than server sending PEER_CONNECTION 0
    setInterval(function(){
        if(!Storage.get('connected') && !Storage.get('sendingOffer') && Storage.get('PEER_CONNECTION') === 1 &&
            Storage.get('shelter_on') && Storage.get('state') > Alarm.INACTIVE && !Storage.get('noInternet')){
            Alarm.startConnection();
        }
    }, 1000);

    UIHelper.showArubaNotice();
    UIHelper.reset(true);
    UIHelper.loadMessages(Storage.getMessages());
    UIHelper.disableShelterCall();
    Alarm.init();
});