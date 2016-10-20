xpos.factory('xSerial', function($cordovaToast) {
    var self = this;
    self.Sender = function(content){
        if (window.cordova) {
            serial.requestPermission({
                vid: '0403',
                pid: '03ee',
                driver: 'ProlificSerialDriver'
            },
                function success(success){
                    console.log(success);
                    var opts = {
                        baudRate: '115200'
                    };
                    serial.open(opts, function success(){
                        serial.writeHex(content,
                            function sr(success){
                                console.log(success);
                            },
                            function er(error){
                                console.log("error:" + error);
                            }
                        );
                        console.log(content);
                        serial.close();
                    }, function error(){
                        $cordovaToast.showShortBottom("카드단말기가 연결되지 않았습니다.");
                    });
                },
                function error(error){
                    $cordovaToast("카드단말기에 접근권한을 부여해야합니다. \n" + error);
                });
        }
    };

    self.openCash = function() {
        self.Sender("02 00 06 04 FD 43 44 03 9E A6");
    };

    return self;
});