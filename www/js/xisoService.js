xpos

.factory('xisoService', function($rootScope, $ionicModal, $ionicPopup, $ionicLoading, $cordovaToast, $state, CarType, Month, Garage, Cooper, Payment) {
    var self = this;

    self.mainField = '';
    self.garage = {};
    self.tempGarage = {};
    self.dates = {};    // 단순히 start_date, end_date 검색을 위해서 씀

    //lists
    self.monthList = {};
    self.carTypeList = {};
    self.garageList = {};
    self.cooperList = {};
    self.payList = {};

    //modals
    self.mdGarageView = {};
    self.mdDcInput = {};
    self.mdPayInput = {};
    self.mdCarTypeList = {};
    self.mdMonthList = {};
    self.mdGarageList = {};
    self.mdOutList = {};
    self.mdCooperList = {};
    self.mdPayCancel = {};
    
    //serial
    self.pay_location = '';
    self.pay_success = false;
    self.payObj = {};

    self.initPayVariables = function() {    // pay 관련 전역 변수 초기화
        self.pay_location = '';
        self.pay_success = false;
        self.payObj = {};
    }

    // scope 로 modal initialize
    self.init = function($scope) {
        $scope = $scope || $rootScope.$new();

        // 차량상세 Modal
        $ionicModal.fromTemplateUrl('templates/garage_view.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdGarageView = modal;
        });

        // 열람시 여러개일때 차량 선택 리스트 표시 Modal
        $ionicModal.fromTemplateUrl('templates/panel.garageList.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdGarageList = modal;
        });

        // 할인하기 Modal
        $ionicModal.fromTemplateUrl('templates/payment.discount.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdDcInput = modal;
        });

        // 결제하기 Modal
        $ionicModal.fromTemplateUrl('templates/payment.input.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdPayInput = modal;
        });

        // 차종 선택 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/panel.cartypeList.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdCarTypeList = modal;
        });

        // 월차 선택 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/panel.monthList.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdMonthList = modal;
        });

        // 출차 선택 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/panel.outList.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdOutList = modal;
        });

        // 지정할인 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/payment.cooper.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdCooperList = modal;
        });

        // 결제취소 Modal - (상세정보 Modal - 결제 취소 버튼)
        $ionicModal.fromTemplateUrl('templates/payment.cancel.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdPayCancel = modal;
        });
    };
    
    // 모든 modal 을 닫는다
    self.closeModal = function(){
        self.mdGarageView.hide();
        self.mdDcInput.hide();
        self.mdPayInput.hide();
        self.mdCarTypeList.hide();
        self.mdMonthList.hide();
        self.mdGarageList.hide();
        self.mdOutList.hide();
        self.mdCooperList.hide();
        self.mdPayCancel.hide();
    };
    
    self.addMF = function(str){
        self.mainField += str;
    };
    
    self.clearMF = function(){
        self.mainField = '';
    };
    
    self.setGarage = function(garage){
        self.garage = garage;
    };
    self.copyGarage = function(){
        self.tempGarage = angular.copy(self.garage);
    };
    self.calDiscount = function(){
        var pay_money = onum(self.tempGarage.total_amount) - onum(self.tempGarage.pay_amount) - onum(self.tempGarage.discount_cooper) - onum(self.tempGarage.discount_self);
        self.tempGarage.pay_money = pay_money; //결제할 금액 세팅
    };

    // 패널 - 입차 버튼 클릭시 체크
    self.inCarChk = function(){
        if(!self.mainField) return $ionicPopup.alert({title:'알림', template:'관리 번호를 입력해주세요'});

        CarType.all().then(function(result){
            //등록된 차종이 있으면
            if(result.length > 0) {
                compareMonth();
            }else{
                $ionicPopup.alert({title: '알림', template: '등록된 차종이 없습니다.<br>먼저 설정에서 차종을 추가해주세요.'});
            }
        },function (err){ console.log(err); });
    };
    
    // 패널 - 디비에서 현재 차번호를 검색하여 월차에 있는지 판단하여 있으면 컨펌을 띄움
    var compareMonth = function(){
        Month.getByCarNum('%'+self.mainField+'%').then(function(result){
            if(result.length > 0){
                self.monthList = result;

                $ionicPopup.confirm({
                    title: '월차 확인',
                    template: '월차에 '+self.mainField + '(으)로 시작되는 차량번호가 있습니다.<br/>어떻게 입차할까요?',
                    okText: '월차로 입차',
                    cancelText: '다른 번호 입력'
                }).then(function (res) {
                    if (res) {
                        self.mdMonthList.show();    //월차로 입차시에 월차 목록을 띄움
                    } else {
                        $cordovaToast.showShortBottom('다른 차량번호를 입력하고 입차버튼을 누르세요');
                    }
                });
            }else{
                normalInCar();  //월차목록에 없으면 다른 차량으로 입차
            }
        },function (err){ console.log(err); });
    };
    
    // 패널 - 디비에서 현재 차번호를 검색하여 같은 번호가 있는지 검색 후 없으면 차종 선택 모달을 띄움
    var normalInCar = function(){
        Garage.getByCarNum(self.mainField).then(function(result){
            if(result){
                return $ionicPopup.alert({
                    title: '알림',
                    template: '같은 차번호가 입차되어있습니다.<br/>다른 번호를 입력해주세요.'
                });
            }else{
                CarType.all().then(function(result2){
                    if(result2.length > 0) self.carTypeList = result2;
                });

                self.mdCarTypeList.show();
            }
        },function(err){ console.log(err); });
    };

    // 패널 - 차종 선택 화면에서 선택하면 입차시킴
    self.inCar = function(cartype){
        self.garage = {
            start_date : new Date().getTime(),
            car_num : self.mainField,
            car_type_title : cartype.car_type_title,
            minute_unit : cartype.minute_unit,
            minute_free : cartype.minute_free,
            amount_unit : cartype.amount_unit,
            basic_amount : cartype.basic_amount,
            basic_minute : cartype.basic_minute,
            month_idx : 0,
            cooper_idx : 0,
            discount_cooper : 0,
            discount_self : 0
        };

        Garage.insert(self.garage).then(function(result) {
            // console.log("insertId: " + result.insertId);
            self.garage.idx = result.insertId;

            self.printInCar();  //영수증 출력

            $cordovaToast.showShortBottom('[ '+ self.mainField +' ] - 입차되었습니다');
            $state.go($state.current, {}, {reload: true});
            self.mdCarTypeList.hide();
            self.clearMF();
        }, function (err) { console.error(err); });
    };

    // 패널 - 월차 선택 화면에서 선택하면 월차로 입차
    self.monthIn = function (month) {
        Garage.getByCarNum(month.car_num).then(function(result){
            if(result){
                $ionicPopup.alert({
                    title: '알림',
                    template: '같은 차번호가 입차되어있습니다.'
                });
            }else{
                self.garage = {
                    start_date: new Date().getTime(),
                    car_num: month.car_num,
                    car_type_title: month.car_type_title,
                    minute_unit: 0,
                    minute_free: 0,
                    amount_unit: 0,
                    basic_amount: 0,
                    basic_minute: 0,
                    month_idx: month.idx,
                    cooper_idx: 0,
                    discount_cooper: 0,
                    discount_self: 0
                };

                Garage.insert(self.garage).then(function (result) {
                    // console.log("insertId: " + result.insertId);
                    self.garage.idx = result.insertId;

                    self.printInCar();

                    $cordovaToast.showShortBottom('[ '+ month.car_num +' ] - 월차로 입차되었습니다');
                    $state.go($state.current, {}, { reload: true });
                    self.mdMonthList.hide();
                    self.clearMF();
                }, function (err) { console.error(err); });
            }
        },function(err){ console.log(err); });
    };

    // 입차 영수증 출력
    self.printInCar = function() {
        var date = getHanDate(self.garage.start_date);   //"2016년 10월 13일 목요일"
        var time = getHanTime(self.garage.start_date);   //"11시 50분"
        var carnum = self.garage.car_num;
        var srl = self.garage.idx;
        var message = "* 오늘도 좋은 하루 되세요.";
        message += "\r\n* 협력업체 방문시 뒷면에 꼭 도장을 받아주세요.";
        message += "\r\n* 영수중 분실시 차량출고가 불가 할 수 있습니다.";
        self.doPrint(date, time, carnum, srl, message);
    };

    // 패널 - 열람 버튼 클릭
    self.openGarageChk = function(){
        if(!self.mainField) return $ionicPopup.alert({title:'알림',template:'열람할 차 번호를 먼저 입력하세요.'});

        Garage.getCurrentByCarNum('%'+ self.mainField +'%').then(function(result){
            if(result.length == 1) {
                self.setGarage(result[0]);
                self.mdGarageView.show();
            }else if(result.length > 1) {
                self.garageList = result;
                self.mdGarageList.show();
            }else {
                $ionicPopup.alert({title:'알림',template:'입차된 차중에 [ '+self.mainField+' ]로 시작되는 차번호가 없습니다.'});
            }
        },function(err){console.log(err);});
    };
    
    // 패널 - 열람 차량 리스트 선택 화면에서 차량을 클릭
    self.openGarageView = function(garage){
        self.setGarage(garage);
        self.mdGarageView.show();
        self.mdGarageList.hide();
    };

    // 패널 - 출차 버튼 클릭시 체크
    self.outCarChk = function(){
        if(!self.mainField) return $ionicPopup.alert({title:'알림',template:'출차할 차 번호를 먼저 입력하세요.'});
        Garage.getCurrentByCarNum('%'+self.mainField+'%').then(function(result){
            if(result.length == 1) {
                self.setGarage(result[0]);
                self.outCar();
            }else if(result.length > 1) {
                self.outList = result;
                self.mdOutList.show();
            }else {
                $ionicPopup.alert({title:'알림',template:'입차된 차중에 [ '+self.mainField+' ]로 시작되는 차번호가 없습니다.'});
            }
        });
    };

    // 공용 - 출차
    self.outCar = function(){
        if(self.garage.month_idx > 0) return outCarMonth();

        self.copyGarage();   //garage 를 tempGarage 에 copy
        
        // 이미 출차된 차량이 아닐때만 출차시간 및 가격 세팅
        if(self.tempGarage.is_out=='N') {
            self.tempGarage.end_date = new Date().getTime();
            self.tempGarage.total_amount = cal_garage(self.tempGarage);
        }

        self.mdDcInput.show();
        self.mdGarageView.hide();   //현재창 닫음
    };

    // 월차일때 바로 출차
    var outCarMonth = function(){
        $ionicPopup.confirm({
            title: '출차 - '+ self.garage.car_num,
            template: '월차 차량입니다. 출차 하시겠습니까?',
            okText: '예', cancelText: '아니오'
        }).then(function (res) {
            if(res) {
                self.copyGarage();   //garage 를 tempGarage 에 copy
                self.tempGarage.end_date = new Date().getTime();
                self.procOutCar();   //출차처리
            }
        });
    };

    // DB에서 출차처리
    self.procOutCar = function(){
        Garage.outCar(self.tempGarage).then(function(res){
            $cordovaToast.showShortBottom('차량번호 [ '+ self.tempGarage.car_num +' ]의 출차가 완료 되었습니다');
            self.closeModal();  //모든창 닫음
            $state.go($state.current, {}, {reload: true});
        },function(err){
            console.log(err);
        });
    };

    // 상세정보 Modal - 입차 취소 버튼
    self.cancelCar = function(){
        $ionicPopup.confirm({
            title: '입차 취소 - '+ self.garage.car_num,
            template: '입차를 취소 하시겠습니까?',
            okText: '예', cancelText: '아니오'
        }).then(function (res) {
            if(res){
                Garage.cancelCar(self.garage).then(function(result){
                    $cordovaToast.showShortBottom('차량번호 [ '+ self.garage.car_num +' ]의 입차취소가 완료 되었습니다');
                    $state.go($state.current, {}, {reload: true});
                    self.mdGarageView.hide();
                },function(err){ console.log(err); });
            }
        });

    };

    // 할인 Modal - 바로 결제 버튼
    self.dcSkip = function(){
        self.calDiscount();     //결제해야될 금액 계산 (미리세팅용)
        self.mdPayInput.show(); //결제화면으로 넘김
        self.mdDcInput.hide();
    };

    // 할인 Modal - 지정 할인 버튼
    self.dcCooper = function(){
        Cooper.current().then(function(result){
            if(result.length > 0) self.cooperList = result;
        });
        self.mdCooperList.show();
        self.mdDcInput.hide();
    };

    // 할인 Modal - 임의 할인 버튼
    self.dcSelf = function(){
        if(!self.tempGarage.dc_money || self.tempGarage.dc_money == 0) return $ionicPopup.alert({title:'알림',template:'할인 금액을 입력해주세요.'});
        if(self.tempGarage.dc_money > self.tempGarage.total_amount) return $ionicPopup.alert({title:'알림',template:'할인 금액이 총 금액 보다 큽니다.'});

        $ionicPopup.confirm({
            title: '할인금액 '+ self.tempGarage.dc_money.num_format() +'원',
            template: self.tempGarage.dc_money.num_format() +'원을 할인하시겠습니까?',
            okText: '예',cancelText: '아니오'
        }).then(function (res) {
            if(res){
                self.tempGarage.discount_self = self.tempGarage.discount_self + self.tempGarage.dc_money;
                $cordovaToast.showShortBottom('임의 할인이 적용되었습니다');
                self.calDiscount();     //결제해야될 금액 계산 (미리세팅용)
                self.mdPayInput.show();  //결제화면으로 넘김
            }
        });
    };

    // 지정 할인 선택 Modal - 업체 선택 클릭
    self.procCooperDc = function(coop){
        var result = cal_cooper(self.tempGarage, coop);
        self.tempGarage.total_amount = result.total_amount;
        self.tempGarage.discount_cooper = result.discount_cooper;
        if(result.discount_cooper < result.total_amount){
            // 남은 금액 결제
            self.calDiscount();     //결제해야될 금액 계산 (미리세팅용)
            self.mdPayInput.show();
            self.mdDcInput.hide();
        }else{
            // 바로 출차
            self.procOutCar();
            self.mdDcInput.hide();
        }
    };

    // 결제 Modal - 결제없이 출차 처리 버튼
    self.forceOut = function(){
        $ionicPopup.confirm({
            title: '출차', template: '출차 하시겠습니까?', okText: '예',cancelText: '아니오' 
        }).then(function (res) {
            if(res) {
                self.procOutCar();   //출차
            }
        });
    };

    // 결제Modal - 카드 결제 버튼
    self.doCard = function(){
        $ionicPopup.confirm({
            title: '카드 결제',
            template: self.tempGarage.pay_money.num_format() + '원을 카드 결제 하시겠습니까?',
            okText:'예', cancelText:'아니오'
        }).then(function (res) {
            if(res){
                // 결제후에 update될 Object
                self.payObj = {
                    lookup_idx: self.tempGarage.idx,
                    lookup_type: 'garage',
                    pay_type: 'card',
                    pay_amount: self.tempGarage.pay_money
                };
                
                var params = {
                    lookup_idx: self.tempGarage.idx,
                    lookup_type: 'garage',
                    pay_type: 'card'
                };

                // 먼저 저장하고?
                Payment.insert(params).then(function(res2){
                    if(res2) {
                        console.log("Payment insertId: " + res2.insertId);
                        self.payObj.idx = res2.insertId;
                        self.pay_location='beforeOut';  // 출차 전 결제
                        
                        $ionicLoading.show({
                            template: '결제를 요청중입니다..',
                            duration: 60000 // 대기시간 60초
                        });

                        self.payCard(self.payObj.pay_amount, false, self.payObj.idx);
                    }
                },function(err){ console.log(err); });


            }
        });
    };

    // 결제Modal - 현금 결제 버튼
    self.doCash = function(){
        $ionicPopup.confirm({
            title: '현금 결제',
            template: self.tempGarage.pay_money.num_format() + '원을 현금 결제 하시겠습니까?'
        }).then(function (res) {
            if(res){
                var params = {
                    lookup_idx: self.tempGarage.idx,
                    lookup_type: 'garage',
                    pay_type: 'cash',
                    pay_amount: self.tempGarage.pay_money,
                    return_data: ''
                };

                // 먼저 저장하고?
                Payment.insert(params).then(function(res2){
                    console.log("insertId: " + res2.insertId);

                    self.openCash();

                    self.procOutCar();
                });


            }
        });
    };
    
    // 상세정보 Modal - 결제 취소 버튼 
    self.openPayCancel = function(){
        Payment.allForGarage(self.garage).then(function(result){
            if(result.length > 0) {
                self.payList = result; 
                self.mdPayCancel.show();
            }else{
                $ionicPopup.alert({title:'알림',template:'결제내역이 존재하지 않습니다.'});
            }
        },function(err){console.log(err);});
    };

    // 상세정보 Modal - 출차 취소 버튼
    self.cancelOutCar = function(){
        Garage.cancelOutCar(self.garage).then(function(result){
            $cordovaToast.showShortBottom('차량번호 [ '+ self.garage.car_num +' ]의 출차취소가 완료 되었습니다');
            
            $state.go($state.current, {}, {reload: true});
            self.mdGarageView.hide();
        },function(err){console.log(err);});
    };

    // 결체 취소 리스트에서 선택했을때 DB에서 결제취소
    self.procPayCancel = function(pay){
        Payment.cancelPay(pay).then(function(result){
            if(pay.pay_type == 'card'){
                //카드일때 카드 처리

            }else{
                //현금일때 돈통 열어줌
            }
            $state.go($state.current, {}, {reload: true});

            $cordovaToast.showShortBottom('[ '+ self.garage.car_num +' ] - 결제가 취소되었습니다');

            self.copyGarage();  //temp garage 를 초기화 함

            self.closeModal();
        });
    };

    //---------------------------------------
    // 이하는 xSerial
    //---------------------------------------

    // 카드 성공 후 처리
    self.complete = function(res){
        if(self.pay_location=='beforeOut'){ //출차전 결제
            
            if(self.pay_success) {  //결제성공시
                self.payObj.code = res.code;
                self.payObj.ret_code = res.ret_code;
                self.payObj.success_code = res.success_code;
                self.payObj.success_date = res.success_date;

                console.log('self.payObj.code = ' + self.payObj.code);
                console.log('self.payObj.ret_code = '+self.payObj.ret_code);
                console.log('self.payObj.success_code = '+self.payObj.success_code);
                console.log('self.payObj.success_date = '+self.payObj.success_date);

                $cordovaToast.showShortBottom("카드 결제를 성공하였습니다.");

                Payment.update(self.payObj).then(function(res2){
                    self.procOutCar();
                },function(err){ console.log('DB error! payment.update'); });
            }else{
                Payment.cancelPay(self.payObj).then(function(res2){ //결제 실패시 취소

                },function(err){ console.log('DB error! payment.cancelPay'); });
            }

            self.initPayVariables();    // pay 관련 전역 변수 초기화

            self.pay_location = '';
            self.payObj = {};
            self.pay_success = false;
        }else{
            
        }
        hide();
    };
    
    self.pays = {};
    
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

    self.initX = function(){
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
                                        var res = {
                                            code : receive.substr(5, 2),
                                            ret_code : receive.substr(7, 4),
                                            success_code : receive.substr(86, 8),
                                            success_date : receive.substr(98, 12),
                                            seq : receive.substr(168, 20)
                                        };

                                        //성공일때
                                        if(res.code == "I1" || res.code == "I2" || res.code == "I4"){
                                            if(res.ret_code == "0000"){

                                                self.pay_success = true;    //결제 성공시에만

                                                $cordovaToast.showShortBottom("카드결제 성공 : 승인번호 " + res.success_code);
                                                if(res.code == "I1"){
                                                    
                                                }else if(res.code == "I2"){
                                                    $cordovaToast.showShortBottom("직전거래 취소 : 마지막 결제가 취소되었습니다. / 승인번호 " + res.success_code);
                                                }else if(res.code == "I4"){
                                                    $cordovaToast.showShortBottom("거래 취소 : 선택한 거래가 취소되었습니다. / 승인번호 " + res.success_code);
                                                }
                                            }else if(res.ret_code == "8313"){
                                                $cordovaToast.showShortBottom("한도초과");
                                            }else{
                                                $cordovaToast.showShortBottom("거래실패 : 코드 - " + res.ret_code);
                                            }

                                            self.complete(res);    //결제 종료
                                        }
                                        console.log("receive : " + res.receive);
                                        console.log("seq : " + res.seq + "(" + parseInt(res.seq) + ")");
                                        console.log("ret_code : " + res.ret_code);
                                        console.log("success_code : " + res.success_code);
                                        console.log("success_date : " + res.success_date);
                                        console.log("code : " + res.code);
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
    };

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
    };
    
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
    };

    self.LPAD = function(s, padLength, padString){

        while(s.length < padLength) s = padString + s;
        //console.log("run LPAD : " + s.length + " -> " + padLength);
        return s;
    };

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
    };

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
    };
    
    self.openCash = function() {
        self.Sender("02000604FD4344039EA6", false);
    };
    
    

    return self;

});