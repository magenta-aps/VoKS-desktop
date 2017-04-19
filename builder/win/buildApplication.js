var outputDir = '';
process.argv.forEach(function (val, index, array) {
    if(index == 2 )
    {
        outputDir = val;
    }
});

var NwBuilder = require('nw-builder');
var nwb = new NwBuilder({
    files: '../../source/**/**', // use the glob format
    version : '0.20.3',
    platforms: ['win32', 'win64', 'osx64'],
    flavor: 'normal',
    zip: false,
    buildDir: outputDir == ''? undefined : outputDir,
	macIcns: '../osx/files/nw.icns'

});


nwb.on('log',  console.log);

nwb.build().then(function () {
    console.log('all done!');
}).catch(function (error) {
    console.error(error);
});
