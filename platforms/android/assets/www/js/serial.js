xpos.factory('xSerial', function() {
    var self = this;

    self.init = function() {
        // Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production
        if (window.cordova) {
            var getPermission = serial.requestPermission();
            console.log(getPermission);

            var opts = {
                baudRate: '115200',
                dataBits: '8',
                stopBits: '1',
                parity: '0',
                dtr: 'false',
                rts: false,
                sleepOnPause : false
            }
            serial.open(opts, function success(success){alert(success)}, function error(error){alert(error)});
        }
    };

    self.query = function(query, bindings) {
    };

    return self;
});