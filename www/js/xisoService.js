xpos

.factory('xisoService', function($rootScope, $ionicModal, $ionicPopup, $cordovaToast, $state, xSerial, CarType, Month, Garage) {
    var self = this;

    self.mainField = '';
    self.garage = {};

    //lists
    self.monthList = {};
    self.carTypeList = {};
    self.garageList = {};

    //modals
    self.mdGarageView = {};
    self.mdDcInput = {};
    self.mdPayInput = {};
    self.mdCarTypeList = {};
    self.mdMonthList = {};
    self.mdGarageList = {};
    self.mdOutList = {};

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
    };
    
    // 모든 modal 을 닫는다
    self.closeModal = function(){
        self.mdGarageView.hide();
        self.mdDcInput.hide();
        self.mdPayInput.hide();
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

    return self;


});