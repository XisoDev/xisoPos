//require("cordova-plugin-serial");
xpos.factory('xSerial', function($cordovaToast,$ionicLoading) {
    var self = this;
    var show = function(message) {
        $ionicLoading.show({
            template: message ? message : '단말입력 대기중..'
        });
    };
    var hide = function(){
        $ionicLoading.hide();
    };
    var inited = false;

    var receive = "";
    var timeID;

    self.init = function(){
        if (window.cordova) {
            serial.requestPermission({},
                function success(success) {
                    console.log(success);
                    var opts = {
                        baudRate: '115200'
                    };
                    serial.open(opts, function success() {
                        $cordovaToast.showShortBottom("카드단말기가 연결 되었습니다.");
                        hide();
                        inited = true;
                        serial.registerReadCallback(
                            function success(data){
                                var view = new Uint8Array(data);
                                if(view.length >= 1) {
                                    clearTimeout(timeID);
                                    var ksc = new TextDecoder('KSC5601').decode(view);
                                    receive = receive + ksc.toString();

                                    timeID = setTimeout(function(){
                                        //반환되는 전문코드
                                        var code = receive.substr(5,2);
                                        //승인성공일때
                                        if(code == "I1"){
                                            var success_code = receive.substr(86,8);
                                            var success_date = receive.substr(98,12);
                                            $cordovaToast.showShortBottom("카드결제 성공 : 승인번호 " + success_code);
                                        }else if(code == "I2"){
                                            var success_code = receive.substr(82,8);
                                            $cordovaToast.showShortBottom("직전거래 취소 : 마지막 결제가 취소되었습니다. / 승인번호 " + success_code);
                                        }else if(code == "I4"){
                                            var success_code = receive.substr(86,8);
                                            $cordovaToast.showShortBottom("거래 취소 : 선택한 거래가 취소되었습니다. / 승인번호 " + success_code);
                                        }
                                        console.log("receive : " + receive);
                                        console.log("code : " + code);
                                        receive = "";
                                    },500);
                                }
                            });
                    }, function error() {
                        $cordovaToast.showShortBottom("카드단말기가 연결되지 않았습니다.");
                        inited = false;
                    });
                },
                function error(error) {
                    console.log(error);
                    $cordovaToast.showShortBottom("카드단말기에 접근권한을 부여해야합니다. \n" + error);
                });
        }
    }

    self.Sender = function(content, is_init){
        if(!inited){
            show("아직 단말기가 연결되지않아 먼저 연결을 시도합니다. 연결이 성공하면 재시도 해주세요.");
            setTimeout(function(){
                self.init();
            },1000);
            return true;
        }
        if(is_init){
            $cordovaToast.showShortBottom("단말기를 초기화 한 다음 호출합니다. 잠시만 기다려주세요.");
            serial.writeHex("02000604FD544D0378EF");
            setTimeout(function(){
                self.write(content);
            },1000);
        }else{
            self.write(content);
        }
    };

    self.write = function(content){
        serial.writeHex(content,
            function sr(success){
                console.log("Put : " + success);
            },
            function er(error){
                console.log("error:" + error);
            }
        );
    }
    self.stringToByteHex = function(str){
        var bytes = []; // char codes
        var bytesv2 = []; // char codes

        for (var i = 0; i < str.length; ++i) {
            var code = str.charCodeAt(i);

            bytes = bytes.concat([code]);

            bytesv2 = bytesv2.concat([code & 0xff, code / 256 >>> 0]);
        }

        // 72, 101, 108, 108, 111, 31452
        //console.log('bytes', bytes.join(', '));

        // 72, 0, 101, 0, 108, 0, 108, 0, 111, 0, 220, 122
        //console.log('bytesv2', bytesv2.join(', '));
        return bytes.map(function(byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }

    self.LPAD = function(s, padLength, padString){

        while(s.length < padLength) s = padString + s;
        //console.log("run LPAD : " + s.length + " -> " + padLength);
        return s;
    }

    self.payCard = function(amount,is_cancel,sequence){
        //stx, len, cnt, cmd, data, ext, crc
        var stx = "02";
        var lentocmd = "006F04FD";

        //코드2, WCC1, 카드번호 40,          할부현금영수증2, 승인일시yymmdd(6), 승인번호 12, 금액 8, 봉사료8, VAT 8, 거래번호 20
        //D1                                         00                      1004       0      9100000000000000000000
        var card = (is_cancel) ? "D4" : "D1";
        var data = card + "                                         00                  ";
        data += self.LPAD(amount.toString(),8," ");
        data += "       0      91";
        data += self.LPAD(sequence.toString(),20,"0");
        var datahex = self.stringToByteHex(data);

        var ext = "03";

        serial.getCRC("$" + lentocmd + datahex + ext,function(success){
            str = stx + lentocmd + datahex + ext + success;
            self.Sender(str, true);
        });
        //console.log(str);
    }

    self.payCash = function(amount,cash_type,sequence){
        //stx, len, cnt, cmd, data, ext, crc
        var stx = "02";
        var lentocmd = "006F04FD";

        //코드2, WCC1, 카드번호 40,          할부현금영수증2, 승인일시yymmdd(6), 승인번호 12, 금액 8, 봉사료8, VAT 8, 거래번호 20
        //B1                                         00                      1004       0      9100000000000000000000
        var data = "B1                                         ";
        data += cash_type;
        data += "                  ";
        data += self.LPAD(amount.toString(),8," ");
        data += "       0      91";
        data += self.LPAD(sequence.toString(),20,"0");
        var datahex = self.stringToByteHex(data);

        var ext = "03";

        serial.getCRC("$" + lentocmd + datahex + ext,function(success){
            str = stx + lentocmd + datahex + ext + success;
            self.Sender(str, true);
        });
    }
    self.openCash = function() {
        self.Sender("02000604FD4344039EA6", false);
    };

    return self;
});