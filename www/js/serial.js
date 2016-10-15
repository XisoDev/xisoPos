xpos.factory('xSerial', function($cordovaToast) {
    var self = this;
    var opts = {
        baudRate: '9600',
        dataBits: '8',
        sleepOnPause : false
    }
    self.init = function() {
        if (window.cordova) {
            serial.requestPermission();
            serial.open(opts, function success(){
                $cordovaToast.showShortBottom("카드단말기가 정상적으로 연결되었습니다.");
            }, function error(){
                $cordovaToast.showShortBottom("카드단말기가 연결되지 않았습니다.");
            });
        }
    };
    self.close = function(){
        serial.close();
    }
    self.openCash = function() {
        self.init();
        serial.write("ABCD");
        serial.read(function success(buffer){
            alert(buffer);
        }, function error(error){
            console.log(error);
        });
        console.log("매번열고닫기");
        self.close();
    };

    return self;
});