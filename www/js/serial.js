xpos.factory('xSerial', function($cordovaToast) {
    var self = this;
    self.init = function() {
        if (window.cordova) {
            serial.requestPermission({
                // vid: '0x0403',
                // pid: '0x6001',
                // driver: 'FtdiSerialDriver'
            },
            function success(success){
                console.log(success);
            },
            function error(error){
                $cordovaToast("카드단말기에 접근권한을 부여해야합니다. \n" + error);
            });
        }
    };

    self.Sender = function(content){
        var opts = {baudRate: '9600'};
        serial.open(opts, function success(){
            serial.write(content,
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
    };

    self.openCash = function() {
        self.Sender("S01=EX;S02=D1;S03= ;S04=40;S05=0700081;S08=A;S09=SECU301M00012200055184800048A00001NkNyt05B0YHBP/MvFwvzTohARZ46IUfaTQv2zVnal4vuyTiKtZJOLcQFNvUUzHRd;S11=00;S12=1000;S17=0;S18=91;S19=N;S29=EASYPOS0002");
    };

    return self;
});