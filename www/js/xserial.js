//require("cordova-plugin-serial");
xpos.factory('xSerial', function($cordovaToast,$ionicLoading) {
    var self = this;
    var show = function(message) {
        $ionicLoading.show({
            template: message ? message : '단말입력 대기중..'
        });
        setTimeout(function(){
            hide();
        },5000);
    };
    var hide = function(){
        $ionicLoading.hide();
    };
    var inited = false;

    var receive = "";
    var timeID;

    self.init = function(){
        if (window.cordova && !inited) {
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
                                    var ksc = new TextDecoder("ASCII").decode(view);
                                    receive = receive + ksc.toString();
                                    //receive = encodeURI(receive);
                                    timeID = setTimeout(function(){
                                        //반환되는 전문코드
                                        var code = receive.substr(5,2);
                                        var ret_code = receive.substr(7,4);
                                        var success_code = receive.substr(86,8);
                                        var success_date = receive.substr(98,12);
                                        var seq = receive.substr(168,20);

                                        //성공일때
                                        if(code == "I1" || code == "I2" || code == "I4"){
                                            if(ret_code == "0000"){
                                                $cordovaToast.showShortBottom("카드결제 성공 : 승인번호 " + success_code);
                                                if(code == "I1"){
                                                }else if(code == "I2"){
                                                    $cordovaToast.showShortBottom("직전거래 취소 : 마지막 결제가 취소되었습니다. / 승인번호 " + success_code);
                                                }else if(code == "I4"){
                                                    $cordovaToast.showShortBottom("거래 취소 : 선택한 거래가 취소되었습니다. / 승인번호 " + success_code);
                                                }
                                            }else if(ret_code == "8313"){
                                                $cordovaToast.showShortBottom("한도초과");
                                            }else{
                                                $cordovaToast.showShortBottom("거래실패 : 코드 - " + ret_code);
                                            }
                                        }
                                        console.log("receive : " + receive);
                                        console.log("seq : " + seq + "(" + parseInt(seq) + ")");
                                        console.log("ret_code : " + ret_code);
                                        console.log("success_code : " + success_code);
                                        console.log("success_date : " + success_date);
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
        }else{
            $cordovaToast.showShortBottom("이미 단말기가 연결되어 있거나, 단말기를 사용할 수 있는 환경이 아닙니다.");
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

    self.doPrint = function(date,time,carnum,srl,message){
        var shopname = "화 진 S";
        var shopaddr = "중구 부평동 3가 62-2.7.8";
        var shoptel = "051-333-5646";
        var str = "\x1D!\x01           [ ";
        str += shopname;
        str += " 주 차 영 수 증 ]\x1D!\0\r\n             " + shopaddr;
        str += "\r\n               (전화) " + shoptel;
        str += "\r\n 입차년월 : " + date;
        str += "\r\n\r\n\x1D!\x01  입차시간 :                " + time;
        str += "\x1D!\0\x1D!\x01  차량번호 :                " + carnum;
        str += "\x1D!\0\r\n#seq : " + srl;
        str += "\r\n" + message + "\r\n===============================================\r\n맞춤형 POS,웹/앱 개발,기업 디자인 문의\r\nhttp://xiso.co.kr \r\n\r\n\r\n\r\n\r\n\x1Bi\r\n";

        if(!inited){
            show("아직 단말기가 연결되지않아 먼저 연결을 시도합니다. 연결이 성공하면 재시도 해주세요.");
            setTimeout(function(){
                self.init();
            },1000);
            return true;
        }else{
            serial.write(str);
        }

    }

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