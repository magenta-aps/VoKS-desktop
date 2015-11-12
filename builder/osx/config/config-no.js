var id = getId(),
    shelterId = 'shelter';

config = {
    ssl: false,
    shelterId: shelterId,
    id: id,
    reconnectionDelay: 5000,
    domain: '<enter your domain>',
    stun: 'stun:stun.l.google.com:19302',
    checkConnectionDelay: 4000,
    lang: 'no',
	numberOfErrorsToReport: 10,
    rtcStateCheckDelay: 200
};


config['ws_url'] = '';
config['api_url'] = (config['ssl']?'https://':'http://') + config['domain'] + '/api/device/';
config['default_api_url'] = config['api_url'];
config['connectionCheckUrl']= (config['ssl']?'https://':'http://') + config['domain'] + '/check_connection/check.txt';
