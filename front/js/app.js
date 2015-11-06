/**
 * BComeSafe, http://bcomesafe.com
 * Copyright 2015 Magenta ApS, http://magenta.dk
 * Licensed under MPL 2.0, https://www.mozilla.org/MPL/2.0/
 * Developed in co-op with Baltic Amadeus, http://baltic-amadeus.lt
 */


window.onerror = function (msg, url, line) {
    var data = {
        tag: url,
        message: msg + ' on line: ' + line,
        timestamp: Date.now()
    };

    if (localStorage == null) {
        Alarm.sendErrorReport([data]);
    }
    else {
        var errors = Storage.get('errors') || [];
        errors.push(data);
        if(errors.length >= config['numberOfErrorsToReport']){
            Alarm.sendErrorReport(errors);
            Storage.set('errors', []);
        } else {
            Storage.set('errors', errors);
        }
    }
};


var nwNotify = require('nw-notify');
// Change config options
nwNotify.setConfig({
    appIcon: nwNotify.getAppPath() + 'front/images/icon-64.png',
    height: 135,
    displayTime: 30*60*1000, //30min
    defaultStyleText: {
        'word-break': 'break-all'
    }
});

var gui = require('nw.gui');
// Ip is required to get mac address
var ip = require ('ip');
var os = require('os');
var currentIP= ip.address();
var interfaces = os.networkInterfaces();
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var currentInterface = interfaces[k][k2];
        if(currentInterface.address == currentIP){
            config['mac'] = currentInterface.mac;
        }
    }
}
var translations = null;
var win = gui.Window.get();

app = {
    onStartup: function () {
        var show = true;
        for (var i = 0; i < gui.App.argv.length; i++) {
            if (gui.App.argv[i] == '--show-window' && (process.platform == "win32" || process.platform == "win64")) {
                app.show();

            }
            if (gui.App.argv[i] == '--remain-hidden') {
                show = false;
            }
        }

        app.show();
        win.focus();
    },
    visible: false,
    newMessages: 0,
    iconIndicator: function () {
        if (app.visible) return;

        app.newMessages++;
        app.messageIndicator();
    },
    hide: function () {
        app.visible = false;
        win.hide();
    },
    show: function () {
        app.visible = true;
        app.newMessages = 0;
        win.show();
        app.messageIndicator();
    },
    messageIndicator: function () {
        var icon = '00';

        if (!app.visible) {
            icon = '0' + app.newMessages.toString();
            if (app.newMessages > 10) {
                icon = '10plus';
            }
            if (app.newMessages == 10) {
                icon = '10';
            }
        }

        var os = process.platform;
        switch (os) {
            case 'darwin':
                os = 'osx';
                break;
            case 'win32':
            case 'win64':
                os = 'win';
                break;
        }

        tray.icon = 'front/images/icons/' + os + '/' + icon + '.png';
    }
};


win.title = 'Alarm';
win.on('maximize', function () {
    win.unmaximize();
});

win.on('minimize', app.hide);

win.on('close', app.hide);
win.on('focus', function () {
    app.visible = true;
    app.newMessages = 0;
    app.messageIndicator();
});


if (process.platform === 'darwin') {
    tray = new gui.Tray({icon: 'front/images/icon_mac.png'});
}
else if (process.platform === 'linux') {
    tray = new gui.Tray({icon: 'front/images/icons/linux.png'});
}
else {
    tray = new gui.Tray({icon: 'front/images/icon-64.png'});
}

app.onStartup();

// Show window and remove tray when clicked
tray.on('click', function () {
    if (Storage.get('state') > Alarm.INACTIVE) {
        UIHelper.showChat();
    } else {
        UI.elements.confirm.yes.focus();
    }

    Alarm.removeHideTimer();
    win.focus();
    app.show();
});


window.addEventListener('focus', function (e) {
    app.visible = true;
    app.newMessages = 0;
    app.messageIndicator();
});

var menu = new gui.Menu();
menu.append(new gui.MenuItem({
    label: 'Open App',
    click: function () {
        if (Storage.get('state') > Alarm.INACTIVE) {
            UIHelper.showChat();
        } else {
            UI.elements.confirm.yes.focus();
        }

        Alarm.removeHideTimer();
        app.show();
        win.focus();
    }
}));

menu.append(new gui.MenuItem({type: 'separator'}));
menu.append(new gui.MenuItem({
    label: 'Quit Alarm',
    click: function () {
        nwNotify.closeAll();
        Storage.clear(true);
        gui.App.quit();
    }
}));

tray.menu = menu;

gui.App.on('open', function (cmdline) {
    app.show();
});

gui.App.on('reopen', function (cmdline) {
    app.show();
});

lang = function (key) {

    var translations = Storage.get('translations');
    if (typeof translations[key] !== 'undefined') {
        return translations[key];
    }

    return '';
};
