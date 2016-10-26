xpos

.factory('xisoService', function($rootScope, $ionicModal, $ionicPopup, $cordovaToast, $state, xSerial, CarType, Month, Garage, Cooper, Payment) {
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
        Month.getByCarNum(self.mainField).then(function(result){
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

            // self.printInCar();  //영수증 출력 overcode

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
        xSerial.doPrint(date, time, carnum, srl, message);
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

                // outcar 실행 overcode

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
            template: self.tempGarage.pay_money.num_format() + '원을 카드 결제 하시겠습니까?'
        }).then(function (res) {
            if(res){
                var params = {
                    lookup_idx: self.tempGarage.idx,
                    lookup_type: 'garage',
                    pay_type: 'card',
                    pay_amount: self.tempGarage.pay_money,
                    return_data: ''
                };

                // 먼저 저장하고?
                Payment.insert(params).then(function(res2){
                    console.log("insertId: " + res2.insertId);
                    //결제 처리?

                    //할인 금액에 변동이 있을 경우 update 후 출차

                    //실패하면 update? delete?

                    // 결제 처리 잘되면 출차
                    self.procOutCar();
                });


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
                    //결제 처리?

                    //할인 금액에 변동이 있을 경우 update 후 출차

                    //실패하면 update? delete?

                    // 결제 처리 잘되면 출차
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
    

    return self;


});