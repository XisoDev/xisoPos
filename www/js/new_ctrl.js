xpos.controller('xisoCtrl', function ($rootScope, $state, $ionicModal, $ionicPopup, $ionicLoading, $cordovaToast, CarType, Month, Garage, Cooper, Payment) {

    $rootScope.inited = false;

    $rootScope.receive = "";
    $rootScope.timeID;
    $rootScope.timeID2;

    // initialize
    $rootScope.offset = 0;
    $rootScope.moredata = false;
    $rootScope.search = {};
    
    $rootScope.mainField = '';
    $rootScope.garage = {};
    $rootScope.tempGarage = {};
    $rootScope.tempDayCar = {}; // 결제후에 적용될 일차정보
    $rootScope.month = {};
    $rootScope.dates = {};
    $rootScope.before_is_stop = '';
    
    //modal's list
    $rootScope.monthList = {};
    $rootScope.carTypeList = {};
    $rootScope.garageList = {};
    $rootScope.cooperList = {};
    $rootScope.payList = {};
    $rootScope.dayCarList = {};

    //view's list
    $rootScope.vGarageList = {};
    $rootScope.vHistoryList = {};
    $rootScope.vMonthList = {};

    //modals
    $rootScope.mdGarageView = {};
    $rootScope.mdDcInput = {};
    $rootScope.mdPayInput = {};
    $rootScope.mdCarTypeList = {};
    $rootScope.mdMonthList = {};
    $rootScope.mdGarageList = {};
    $rootScope.mdOutList = {};
    $rootScope.mdCooperList = {};
    $rootScope.mdPayCancel = {};
    $rootScope.mdMonthPay = {};
    $rootScope.mdMonth = {};
    $rootScope.mdDayCarList = {};

    //serial
    $rootScope.pay_location = '';
    $rootScope.pay_success = 'N'; // N 실패, Y 성공, C 취소
    $rootScope.payObj = {};

    $rootScope.initPayVariables = function() {    // pay 관련 전역 변수 초기화
        $rootScope.pay_location = '';
        $rootScope.pay_success = 'N';
        $rootScope.payObj = {};
    };
    
    $rootScope.init = function(){
        // initialize
        $rootScope.offset = 0;
        $rootScope.moredata = false;
        $rootScope.search = {};

        $rootScope.mainField = '';
        $rootScope.garage = {};
        $rootScope.tempGarage = {};
        $rootScope.tempDayCar = {}; // 결제후에 적용될 일차정보
        $rootScope.month = {};
        $rootScope.dates = {};
        $rootScope.before_is_stop = '';

        //modal's list
        $rootScope.monthList = {};
        $rootScope.carTypeList = {};
        $rootScope.garageList = {};
        $rootScope.cooperList = {};
        $rootScope.payList = {};
        $rootScope.dayCarList = {};

        //view's list
        $rootScope.vGarageList = {};
        $rootScope.vHistoryList = {};
        $rootScope.vMonthList = {};

        //modals
        $rootScope.mdGarageView = {};
        $rootScope.mdDcInput = {};
        $rootScope.mdPayInput = {};
        $rootScope.mdCarTypeList = {};
        $rootScope.mdMonthList = {};
        $rootScope.mdGarageList = {};
        $rootScope.mdOutList = {};
        $rootScope.mdCooperList = {};
        $rootScope.mdPayCancel = {};
        $rootScope.mdMonthPay = {};
        $rootScope.mdMonth = {};
        $rootScope.mdDayCarList = {};

        // 차량상세 Modal
        $ionicModal.fromTemplateUrl('templates/garage_view.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.mdGarageView = modal;
        });

        // 열람시 여러개일때 차량 선택 리스트 표시 Modal
        $ionicModal.fromTemplateUrl('templates/panel.garageList.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.mdGarageList = modal;
        });

        // 할인하기 Modal
        $ionicModal.fromTemplateUrl('templates/payment.discount.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.mdDcInput = modal;
        });

        // 결제하기 Modal
        $ionicModal.fromTemplateUrl('templates/payment.input.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.mdPayInput = modal;
        });

        // 차종 선택 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/panel.cartypeList.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.mdCarTypeList = modal;
        });

        // 차종 선택 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/payment.daycar.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.mdDayCarList = modal;
        });

        // 월차 선택 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/panel.monthList.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.mdMonthList = modal;
        });

        // 출차 선택 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/panel.outList.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.mdOutList = modal;
        });

        // 지정할인 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/payment.cooper.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.mdCooperList = modal;
        });

        // 결제취소 Modal - (상세정보 Modal - 결제 취소 버튼)
        $ionicModal.fromTemplateUrl('templates/payment.cancel.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.mdPayCancel = modal;
        });

        // 월차 결제 Modal
        $ionicModal.fromTemplateUrl('templates/month.pay.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.mdMonthPay = modal;
        });

        // 월차 추가 Modal
        $ionicModal.fromTemplateUrl('templates/month.addmonth.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.mdMonth = modal;
        });
    };

    // 모든 modal 을 닫는다
    $rootScope.closeModal = function(){
        $rootScope.mdGarageView.hide();
        $rootScope.mdDcInput.hide();
        $rootScope.mdPayInput.hide();
        $rootScope.mdCarTypeList.hide();
        $rootScope.mdMonthList.hide();
        $rootScope.mdGarageList.hide();
        $rootScope.mdOutList.hide();
        $rootScope.mdCooperList.hide();
        $rootScope.mdPayCancel.hide();
        $rootScope.mdMonth.hide();
        $rootScope.mdMonthPay.hide();
        $rootScope.mdDayCarList.hide();
    };



    $rootScope.addMF = function(str){ $rootScope.mainField += str; };

    $rootScope.clearMF = function(){ $rootScope.mainField = ''; };

    $rootScope.copyGarage = function(){
        $rootScope.tempGarage = angular.copy($rootScope.garage);
    };
    $rootScope.calDiscount = function(){
        var pay_money = onum($rootScope.tempGarage.total_amount) - onum($rootScope.tempGarage.pay_amount) - onum($rootScope.tempGarage.discount_cooper) - onum($rootScope.tempGarage.discount_self);
        $rootScope.tempGarage.pay_money = pay_money; //결제할 금액 세팅
    };

    //당겨서 새로고침
    $rootScope.refresh = function(view){
        // init functions load
        $rootScope.init();
        $rootScope.initPayVariables();
        $rootScope.initX();

        $rootScope.offset = 0;
        $rootScope.moredata = false;

        switch (view){
            case 'garage':
                $rootScope.xiso.getGarageList(false);
                break;
            case 'history':
                $rootScope.getHistoryList(false);
                break;
            case 'month':
                $rootScope.getMonthList(false);
                break;
        }
    };
    //스크롤 내릴시 Load More
    $rootScope.loadMore = function(view){
        switch (view){
            case 'garage':
                $rootScope.xiso.getGarageList(true);
                break;
            case 'history':
                $rootScope.getHistoryList(true);
                break;
            case 'month':
                $rootScope.getMonthList(true);
                break;
        }
    };

    var reload = function(){
        $state.reload();
    };
    
    //-------------------
    // 패널
    //-------------------

    // 카드 임의결제
    $rootScope.panelDoCard = function(){
        $rootScope.data = {};
        $ionicPopup.show({
            template: ' 임의결제 금액을 입력합니다. <input type="number" ng-model="data.amount" autofocus="autofocus" style="color:#FFF;background:transparent;font-size:30px;text-align:center;border-bottom:1px solid #aaa;">',
            title: '카드결제',
            scope: $rootScope,
            buttons: [{ text: '취소' }, { text: '<b>결제</b>', type: 'button-positive' }]
        }).then(function() {
            if($rootScope.data.amount > 0) $rootScope.payCard(0, 'temp', $rootScope.data.amount, 'temp');
            else $cordovaToast.showLongBottom('결제 금액을 정확히 입력해주세요.');
        });
    };

    // 현금 임의결제
    $rootScope.panelPayCash = function(cash_type){
        $rootScope.data = {};
        $rootScope.data.cash_type = cash_type;
        $ionicPopup.show({
            template: ' 임의의 현금영수증을 발행합니다. <input type="number" ng-model="data.amount" autofocus="autofocus" style="color:#FFF;background:transparent;font-size:30px;text-align:center;border-bottom:1px solid #aaa;">',
            title: '현금영수증',
            scope: $rootScope,
            buttons: [{ text: '취소' }, { text: '<b>결제</b>', type: 'button-positive' }]
        }).then(function() {
            if($rootScope.data.amount > 0) $rootScope.payCash($rootScope.data.amount, $rootScope.data.cash_type ,0);
        });
    };

    // 단말기 초기화
    $rootScope.doConnect = function(){
        // $state.go($state.current, {}, {reload: true});
        $rootScope.xiso.initX();
    };

    // 패널 - 입차 버튼 클릭시 체크
    $rootScope.inCarChk = function(){
        if(!$rootScope.mainField) return $ionicPopup.alert({title:'알림', template:'관리 번호를 입력해주세요'});

        CarType.all().then(function(result){
            //등록된 차종이 있으면
            if(result.length > 0) {
                $rootScope.compareMonth();
            }else{
                $ionicPopup.alert({title: '알림', template: '등록된 차종이 없습니다.<br>먼저 설정에서 차종을 추가해주세요.'});
            }
        },function (err){ console.log(err); });
    };

    // 패널 - 디비에서 현재 차번호를 검색하여 월차에 있는지 판단하여 있으면 컨펌을 띄움
    $rootScope.compareMonth = function(){
        Month.getByCarNum('%'+$rootScope.mainField+'%').then(function(result){
            if(result.length > 0){
                $rootScope.monthList = result;

                $ionicPopup.confirm({
                    title: '월차 확인',
                    template: '월차에 '+ $rootScope.mainField + '(으)로 시작되는 차량번호가 있습니다.<br/>어떻게 입차할까요?',
                    okText: '월차로 입차',
                    cancelText: '다른 번호 입력'
                }).then(function (res) {
                    if (res) {
                        $rootScope.mdMonthList.show();    //월차로 입차시에 월차 목록을 띄움
                    } else {
                        $cordovaToast.showShortBottom('다른 차량번호를 입력하고 입차버튼을 누르세요');
                    }
                });
            }else{
                $rootScope.normalInCar();  //월차목록에 없으면 다른 차량으로 입차
            }
        },function (err){ console.log(err); });
    };

    // 패널 - 디비에서 현재 차번호를 검색하여 같은 번호가 있는지 검색 후 없으면 차종 선택 모달을 띄움
    $rootScope.normalInCar = function(){
        Garage.getByCarNum($rootScope.mainField).then(function(result){
            if(result){
                return $ionicPopup.alert({
                    title: '알림',
                    template: '같은 차번호가 입차되어있습니다.<br/>다른 번호를 입력해주세요.'
                });
            }else{
                CarType.all().then(function(result2){
                    if(result2.length > 0) $rootScope.carTypeList = result2;
                });

                $rootScope.mdCarTypeList.show();
            }
        },function(err){ console.log(err); });
    };

    // 패널 - 차종 선택 화면에서 선택하면 입차시킴
    $rootScope.inCar = function(cartype){
        $rootScope.garage = {
            start_date : new Date().getTime(),
            car_num : $rootScope.mainField,
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

        Garage.insert($rootScope.garage).then(function(result) {
            // console.log("insertId: " + result.insertId);
            $rootScope.garage.idx = result.insertId;

            $rootScope.printInCar();  //영수증 출력

            $rootScope.mdCarTypeList.hide();
            reload();
            $cordovaToast.showShortBottom('[ '+ $rootScope.mainField +' ] - 입차되었습니다');
            $rootScope.clearMF();
        }, function (err) { console.error(err); });
    };

    // 패널 - 월차 선택 화면에서 선택하면 월차로 입차
    $rootScope.monthIn = function (month) {
        if(month.is_view){
            $rootScope.openEditMonth(month);
            $rootScope.mdMonthList.hide();
            $rootScope.clearMF();
            return ;
        }
        Garage.getByCarNum(month.car_num).then(function(result){
            if(result){
                $ionicPopup.alert({
                    title: '알림',
                    template: '같은 차번호가 입차되어있습니다.'
                });
            }else{
                $rootScope.garage = {
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

                Garage.insert($rootScope.garage).then(function (result) {
                    // console.log("insertId: " + result.insertId);
                    $rootScope.garage.idx = result.insertId;

                    $rootScope.printInCar();

                    $rootScope.mdMonthList.hide();
                    $cordovaToast.showShortBottom('[ '+ month.car_num +' ] - 월차로 입차되었습니다');
                    reload();
                    $rootScope.clearMF();
                }, function (err) { console.error(err); });
            }
        },function(err){ console.log(err); });
    };

    // 입차 영수증 출력
    $rootScope.printInCar = function() {
        var date = getHanDate($rootScope.garage.start_date);   //"2016년 10월 13일 목요일"
        var time = getHanTime($rootScope.garage.start_date);   //"11시 50분"
        var carnum = $rootScope.garage.car_num;
        var srl = $rootScope.garage.idx;
        var message = "* 오늘도 좋은 하루 되세요.";
        message += "\r\n* 협력업체 방문시 뒷면에 꼭 도장을 받아주세요.";
        message += "\r\n* 영수중 분실시 차량출고가 불가 할 수 있습니다.";
        $rootScope.doPrint(date, time, carnum, srl, message);
    };

    // 패널 - 월차 버튼 클릭
    $rootScope.openMonthChk = function(){
        if(!$rootScope.mainField) return $ionicPopup.alert({title:'알림',template:'차 번호를 먼저 입력하세요.'});

        Month.getByCarNum('%'+$rootScope.mainField+'%').then(function(result){
            $state.go('mainLayout.tabs.month');

            show('요청중입니다...',2000);
            setTimeout(function(){  // view 의 init 시간과 맞추기 위함
                if(result.length > 0){
                    $rootScope.monthList = result;
                    for(var key in $rootScope.monthList){
                        $rootScope.monthList[key].is_view = true;
                    }
                    $rootScope.mdMonthList.show();
                }else{
                    $rootScope.month = {};
                    $rootScope.month.car_num = $rootScope.mainField;

                    $rootScope.dates.start_date = new Date();
                    $rootScope.dates.end_date = new Date(Date.parse($rootScope.dates.start_date) + 30 * 1000 * 60 * 60 * 24);

                    console.log('start = ' + $rootScope.dates.start_date);
                    console.log('end = ' + $rootScope.dates.end_date);

                    $rootScope.mdMonth.show();
                }
            },2000);
        },function (err){ console.log(err); });
    };

    // 패널 - 출차 버튼 클릭시 체크
    $rootScope.outCarChk = function(){
        if(!$rootScope.mainField) return $ionicPopup.alert({title:'알림',template:'출차할 차 번호를 먼저 입력하세요.'});
        Garage.getCurrentByCarNum('%'+$rootScope.mainField+'%').then(function(result){
            if(result.length == 1) {
                $rootScope.garage = result[0];
                $rootScope.outCar();
            }else if(result.length > 1) {
                $rootScope.outList = result;
                $rootScope.mdOutList.show();
            }else {
                $ionicPopup.alert({title:'알림',template:'입차된 차중에 [ '+$rootScope.mainField+' ]로 시작되는 차번호가 없습니다.'});
            }
        });
    };

    // 열람
    $rootScope.openGarageView = function(garage){
        $rootScope.garage = garage;
        $rootScope.mdGarageView.show();
        $rootScope.mdGarageList.hide();
    };

    // 공용 - 출차
    $rootScope.outCar = function(){
        $rootScope.copyGarage();   //garage 를 tempGarage 에 copy

        // 이미 출차된 차량이 아닐때만 출차시간 및 가격 세팅
        if($rootScope.tempGarage.is_out=='N') {
            $rootScope.tempGarage.end_date = new Date().getTime();
            $rootScope.tempGarage.total_amount = cal_garage($rootScope.tempGarage);
        }

        //월차 차량이면 바로 출차
        if($rootScope.garage.month_idx > 0) return outCarMonth();

        $rootScope.tempDayCar = {};   // 일차로 변경될 정보 초기화

        $rootScope.mdDcInput.show();
        $rootScope.mdGarageView.hide();   //현재창 닫음
    };

    // 월차일때 바로 출차
    var outCarMonth = function(){
        $ionicPopup.confirm({
            title: '출차 - '+ $rootScope.garage.car_num,
            template: '월차 차량입니다. 출차 하시겠습니까?',
            okText: '예', cancelText: '아니오'
        }).then(function (res) {
            if(res) {
                $rootScope.copyGarage();   //garage 를 tempGarage 에 copy
                $rootScope.tempGarage.end_date = new Date().getTime();
                $rootScope.procOutCar();   //출차처리
            }
        });
    };

    // DB에서 출차처리
    $rootScope.procOutCar = function(){
        Garage.outCar($rootScope.tempGarage).then(function(res){
            $cordovaToast.showShortBottom('차량번호 [ '+ $rootScope.tempGarage.car_num +' ]의 출차가 완료 되었습니다');
            $rootScope.closeModal();  //모든창 닫음
            reload();
        },function(err){ console.log(err); });
    };

    // 상세정보 Modal - 입차 취소 버튼
    $rootScope.cancelCar = function(){
        $ionicPopup.confirm({
            title: '입차 취소 - '+ $rootScope.garage.car_num,
            template: '입차를 취소 하시겠습니까?',
            okText: '예', cancelText: '아니오'
        }).then(function (res) {
            if(res){
                Garage.cancelCar($rootScope.garage).then(function(result){
                    $rootScope.mdGarageView.hide();
                    $cordovaToast.showShortBottom('차량번호 [ '+ $rootScope.garage.car_num +' ]의 입차취소가 완료 되었습니다');
                    reload();
                },function(err){ console.log(err); });
            }
        });
    };

    // 할인 Modal - 바로 결제 버튼
    $rootScope.dcSkip = function(){
        $rootScope.calDiscount();     //결제해야될 금액 계산 (미리세팅용)
        $rootScope.mdPayInput.show(); //결제화면으로 넘김
        $rootScope.mdDcInput.hide();
    };

    // 할인 Modal - 지정 할인 버튼
    $rootScope.dcCooper = function(){
        Cooper.current().then(function(result){
            if(result.length > 0) {
                $rootScope.cooperList = result;

                $rootScope.mdCooperList.show();
                $rootScope.mdDcInput.hide();
            }else{
                $cordovaToast.showShortBottom('지정 할인 업체가 등록되어 있지 않습니다.');
            }
        });
    };

    // 할인 Modal - 임의 할인 버튼
    $rootScope.dcSelf = function(){
        if(!$rootScope.tempGarage.dc_money || $rootScope.tempGarage.dc_money == 0) return $ionicPopup.alert({title:'알림',template:'할인 금액을 입력해주세요.'});
        if($rootScope.tempGarage.dc_money > $rootScope.tempGarage.total_amount) return $ionicPopup.alert({title:'알림',template:'할인 금액이 총 금액 보다 큽니다.'});

        $ionicPopup.confirm({
            title: '할인금액 '+ $rootScope.tempGarage.dc_money.num_format() +'원',
            template: $rootScope.tempGarage.dc_money.num_format() +'원을 할인하시겠습니까?',
            okText: '예',cancelText: '아니오'
        }).then(function (res) {
            if(res){
                $rootScope.tempGarage.discount_self = $rootScope.tempGarage.discount_self + $rootScope.tempGarage.dc_money;
                $cordovaToast.showShortBottom('임의 할인이 적용되었습니다');
                $rootScope.calDiscount();     //결제해야될 금액 계산 (미리세팅용)
                $rootScope.mdPayInput.show();  //결제화면으로 넘김
            }
        });
    };

    // 할인 Modal - 일차로 변경
    $rootScope.dcDayCar = function(){
        CarType.allDayCar().then(function(result){
            if(result.length > 0) {
                $rootScope.dayCarList = result;
                $rootScope.mdDayCarList.show();
            }else{
                $cordovaToast.showShortBottom('등록된 일차가 없습니다.');
            }
        });
    };

    // 지정 할인 선택 Modal - 업체 선택 클릭
    $rootScope.procCooperDc = function(coop){
        var result = cal_cooper($rootScope.tempGarage, coop);
        $rootScope.tempGarage.total_amount = result.total_amount;
        $rootScope.tempGarage.discount_cooper = result.discount_cooper;
        if(result.discount_cooper < result.total_amount){
            // 남은 금액 결제
            $rootScope.calDiscount();     //결제해야될 금액 계산 (미리세팅용)
            $rootScope.mdPayInput.show();
            $rootScope.mdDcInput.hide();
        }else{
            // 바로 출차
            $rootScope.procOutCar();
            $rootScope.mdDcInput.hide();
        }
    };

    // 일차 요금으로 변경
    $rootScope.dayCar = function(cartype){
        $rootScope.tempGarage.car_type_title = cartype.car_type_title;
        $rootScope.tempGarage.minute_unit = cartype.minute_unit;
        $rootScope.tempGarage.minute_free = cartype.minute_free;
        $rootScope.tempGarage.amount_unit = cartype.amount_unit;
        $rootScope.tempGarage.basic_amount = cartype.basic_amount;
        $rootScope.tempGarage.basic_minute = cartype.basic_minute;
        $rootScope.tempGarage.total_amount = cal_garage($rootScope.tempGarage);

        $rootScope.tempDayCar = {};
        $rootScope.tempDayCar.idx = $rootScope.tempGarage.idx;
        $rootScope.tempDayCar.car_type_title = cartype.car_type_title;
        $rootScope.tempDayCar.minute_unit = cartype.minute_unit;
        $rootScope.tempDayCar.minute_free = cartype.minute_free;
        $rootScope.tempDayCar.amount_unit = cartype.amount_unit;
        $rootScope.tempDayCar.basic_amount = cartype.basic_amount;
        $rootScope.tempDayCar.basic_minute = cartype.basic_minute;

        $cordovaToast.showShortBottom('일차 요금이 적용되었습니다.');

        $rootScope.calDiscount();     //결제해야될 금액 계산 (미리세팅용)

        $rootScope.mdPayInput.show();
        $rootScope.mdDayCarList.hide();   //현재창 닫음
    };

    // 결제 Modal - 결제없이 출차 처리 버튼
    $rootScope.forceOut = function(){
        $ionicPopup.confirm({
            title: '출차', template: '출차 하시겠습니까?', okText: '예',cancelText: '아니오'
        }).then(function (res) {
            if(res) {
                $rootScope.procOutCar();   //출차
            }
        });
    };

    // month 결제 화면 닫기
    $rootScope.closePayMonth = function(){
        $rootScope.mdMonthPay.hide();
        $rootScope.month = {};
        reload();
    };

    $rootScope.openAddMonth = function(){
        $rootScope.month = {};
        $rootScope.dates.start_date = new Date();
        $rootScope.dates.end_date = new Date(Date.parse($rootScope.dates.start_date) + 30 * 1000 * 60 * 60 * 24);

        $rootScope.mdMonth.show();
    };

    //월차 등록, 수정
    $rootScope.insertMonth = function(){
        console.log('insert month start');

        $rootScope.month.start_date = getStartDate($rootScope.dates.start_date);    //시작일 00:00:00
        $rootScope.month.end_date = getEndDate($rootScope.dates.end_date);          //종료일 23:59:59

        if(!$rootScope.month.car_num) return $ionicPopup.alert({title: '알림',template: '차량번호를 입력하지 않았습니다.'});
        if(!$rootScope.month.car_name) return $ionicPopup.alert({title: '알림',template: '차종을 입력하지 않았습니다.'});
        if(!$rootScope.month.car_type_title) return $ionicPopup.alert({title: '알림',template: '구분을 입력하지 않았습니다.'});
        if(!$rootScope.month.start_date) return $ionicPopup.alert({title: '알림',template: '시작날짜를 입력하지 않았습니다.'});
        if(!$rootScope.month.end_date) return $ionicPopup.alert({title: '알림',template: '종료날짜를 입력하지 않았습니다.'});
        if($rootScope.month.start_date >= $rootScope.month.end_date)
            return $ionicPopup.alert({title: '알림',template: '시작날짜가 종료날짜보다 크거나 같을 수 없습니다.'});
        if(!$rootScope.month.amount) return $ionicPopup.alert({title: '알림',template: '월차금액을 입력하지 않았습니다.'});
        if(!$rootScope.month.user_name) return $ionicPopup.alert({title: '알림',template: '차주명을 입력하지 않았습니다.'});
        if(!$rootScope.month.mobile) return $ionicPopup.alert({title: '알림',template: '연락처를 입력하지 않았습니다.'});

        if(!$rootScope.month.idx) {
            Month.insert($rootScope.month).then(function (res) {
                console.log("insertId: " + res.insertId);
                $rootScope.month.idx = res.insertId;

                $rootScope.mdMonth.hide();

                $rootScope.openPayMonth();
                reload();

                if(!$rootScope.month.is_ext){
                    $cordovaToast.showShortBottom("차량번호 ["+ $rootScope.month.car_num +"] 새로운 월차가 추가되었습니다.");
                }else{
                    $cordovaToast.showShortBottom("차량번호 ["+ $rootScope.month.car_num +"] 연장된 월차가 추가되었습니다.");
                }
            }, function (err) {
                console.log(err);
            });
        }else{
            if($rootScope.before_is_stop=='N' && $rootScope.month.is_stop=='Y'){
                $rootScope.month.stop_date = new Date().getTime();
            }
            Month.update($rootScope.month).then(function(res){

                $cordovaToast.showShortBottom("차량번호 ["+ $rootScope.month.car_num +"] 월차가 수정되었습니다.");
                $rootScope.mdMonth.hide();
                reload();
            },function(err){
                console.log(err);
            });
        }
    };

    //월차 결제 Modal
    $rootScope.openPayMonth = function(){
        if(!$rootScope.month.pay_amount) $rootScope.month.pay_amount = 0;
        $rootScope.month.pay_money = $rootScope.month.amount - $rootScope.month.pay_amount;
        $rootScope.mdMonthPay.show();
        $rootScope.mdMonth.hide();
    };

    //월차 수정
    $rootScope.openEditMonth = function(month){
        $rootScope.month = angular.copy(month);
        $rootScope.before_is_stop = month.is_stop;
        $rootScope.dates.start_date = new Date($rootScope.month.start_date);
        $rootScope.dates.end_date = new Date($rootScope.month.end_date);

        $rootScope.mdMonth.show();
    };

    //월차 연장
    $rootScope.openExtMonth = function(){
        delete $rootScope.month.idx;
        $rootScope.month.is_ext = true;

        var end_date = $rootScope.month.end_date;
        if(getStartDate(new Date(end_date)) < getStartDate(new Date())){
            $rootScope.dates.start_date = new Date();
            $rootScope.dates.end_date = new Date(Date.parse($rootScope.dates.start_date) + 30 * 1000 * 60 * 60 * 24);
        }else{
            $rootScope.dates.start_date = new Date(end_date + 1000 * 60 * 60 * 24);
            $rootScope.dates.end_date = new Date(Date.parse($rootScope.dates.start_date) + 30 * 1000 * 60 * 60 * 24);
        }
    };

    // 결제Modal - 카드 결제 버튼
    $rootScope.doCard = function(view){
        if(view=='garage') {
            $ionicPopup.confirm({
                title: '카드 결제',
                template: $rootScope.tempGarage.pay_money.num_format() + '원을 카드 결제 하시겠습니까?',
                okText: '예', cancelText: '아니오'
            }).then(function (res) {
                if (res) {
                    // 결제 실행
                    $rootScope.payCard($rootScope.tempGarage.idx, 'garage', $rootScope.tempGarage.pay_money, 'outCar');
                }
            });
        }else if(view=='month'){
            $ionicPopup.confirm({
                title: '월차 카드 결제',
                template: $rootScope.month.pay_money.num_format() + '원을 카드 결제 하시겠습니까?'
            }).then(function (res) {
                if(res){
                    $rootScope.payCard($rootScope.month.idx, 'month', $rootScope.month.pay_money, 'month');
                }
            });
        }else{
            $cordovaToast.showShortBottom('카드 결제 위치 에러');
        }
    };

    // 결제Modal - 현금 결제 버튼
    $rootScope.doCash = function(view){
        if(view=='garage') {
            $ionicPopup.confirm({
                title: '현금 결제',
                template: $rootScope.tempGarage.pay_money.num_format() + '원을 현금 결제 하시겠습니까?'
            }).then(function (res) {
                if (res) {
                    var params = {
                        lookup_idx: $rootScope.tempGarage.idx,
                        lookup_type: 'garage',
                        pay_type: 'cash',
                        pay_amount: $rootScope.tempGarage.pay_money
                    };

                    if($rootScope.tempDayCar.idx){
                        Garage.updateDayCar($rootScope.tempDayCar);
                    }

                    Payment.insert(params).then(function (res2) {
                        $cordovaToast.showShortBottom('현금 결제처리 완료되었습니다.');
                        $rootScope.openCash();

                        $rootScope.procOutCar();
                    });
                }
            });
        }else if(view=='month'){
            $ionicPopup.confirm({
                title: '현금 결제',
                template: $rootScope.month.pay_money.num_format() + '원을 현금 결제 하시겠습니까?'
            }).then(function (res) {
                if (res) {
                    var params = {
                        lookup_idx: $rootScope.month.idx,
                        lookup_type: 'month',
                        pay_type: 'cash',
                        pay_amount: $rootScope.month.pay_money
                    };

                    if($rootScope.tempDayCar.idx){
                        Garage.updateDayCar($rootScope.tempDayCar);
                    }

                    Payment.insert(params).then(function (res2) {

                        $rootScope.openCash();
                        $rootScope.closeModal();

                        reload();
                        $cordovaToast.showShortBottom('현금 결제처리 완료되었습니다.');
                    });
                }
            });
        }else{
            $cordovaToast.showShortBottom('현금 결제 위치 에러');
        }
    };

    // 상세정보 Modal - 결제 취소 버튼 
    $rootScope.openPayCancel = function(view){
        if(view=='garage') {
            Payment.allForGarage($rootScope.garage).then(function (result) {
                if (result.length > 0) {
                    $rootScope.payList = result;
                    $rootScope.mdPayCancel.show();
                } else {
                    $ionicPopup.alert({title: '알림', template: '결제내역이 존재하지 않습니다.'});
                }
            }, function (err) {
                console.log(err);
            });
        }else if(view=='month'){
            Payment.allForMonth($rootScope.month).then(function (result) {
                if (result.length > 0) {
                    $rootScope.payList = result;
                    $rootScope.mdPayCancel.show();
                } else {
                    $ionicPopup.alert({title: '알림', template: '결제내역이 존재하지 않습니다.'});
                }
            }, function (err) {
                console.log(err);
            });
        }else if(view=='temp'){
            Payment.allForTemp().then(function(result){
                if(result.length > 0){
                    $rootScope.payList = result;
                    $rootScope.mdPayCancel.show();
                }else {
                    $ionicPopup.alert({title: '알림', template: '결제내역이 존재하지 않습니다.'});
                }
            });
        }else{
            $cordovaToast.showShortBottom('카드 결제취소 위치 에러');
        }
    };

    // 상세정보 Modal - 출차 취소 버튼
    $rootScope.cancelOutCar = function(){
        $ionicPopup.confirm({
            title: '확인',
            template: '출차 취소 하시겠습니까?',
            okText: '예', cancelText: '아니오'
        }).then(function (res) {
            if (res) {
                var params = angular.copy($rootScope.garage);
                Garage.cancelOutCar(params).then(function(result){
                    $rootScope.mdGarageView.hide();
                    $cordovaToast.showShortBottom('차량번호 [ '+ $rootScope.garage.car_num +' ]의 출차취소가 완료 되었습니다');
                    reload();
                },function(err){console.log(err);});
            }
        });

    };

    // 결체 취소 리스트에서 선택했을때 DB에서 결제취소
    $rootScope.procPayCancel = function(pay){
        if(pay.pay_type == 'card'){
            $rootScope.payCardCancel(pay.idx, 'garage');
        }else{
            //현금일때 돈통 열어줌
            Payment.cancelPay(pay).then(function(result){
                $rootScope.openCash();
                $rootScope.closeModal();
                $cordovaToast.showShortBottom('현금 취소처리 완료되었습니다.');
                reload();
            });
        }
    };
    

    //-------------------
    // 입차목록
    //-------------------

    //입차목록 초기화
    $rootScope.initCurrent = function(){
        console.log('current init func');
        $rootScope.refresh('garage');
    };

    //입차목록 리스트 불러오기
    $rootScope.getGarageList = function(is_load_more){
        var limit = 100;

        Garage.allForCurrent(limit, $rootScope.offset).then(function(result){
            if(result.length > 0) {
                if(!is_load_more) {
                    $rootScope.vGarageList = result;
                }else{
                    for(var key in result) {
                        $rootScope.vGarageList.push(result[key]);
                    }
                }
                $rootScope.offset += limit;
                $rootScope.moredata = true;
            }else{
                $rootScope.moredata = false;    // 더이상 추가로드 할게 없음
            }

            $rootScope.$broadcast('scroll.refreshComplete');
            $rootScope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    //-------------------
    //입출차기록
    //-------------------
    
    //입출차목록 초기화
    $rootScope.initHistory = function(){
        console.log('history init func');
        $rootScope.status = 'all';
        $rootScope.search = {};
        $rootScope.refresh('history');
    };

    // 탭 변경
    $rootScope.changeStatusHis = function(stat){
        $rootScope.status = stat;   //all, in, out, no_pay, cancel
        $rootScope.search = {};
        switch(stat){
            case 'in':  //입차중
                $rootScope.search.is_out = 'N';
                $rootScope.search.is_cancel = 'N';
                break;
            case 'out': //정상출차
                $rootScope.search.is_out = 'Y';
                $rootScope.search.is_cancel = 'N';
                $rootScope.search.is_paid = 'Y';
                break;
            case 'no_pay':  //미결제
                $rootScope.search.is_out = 'Y';
                $rootScope.search.is_cancel = 'N';
                $rootScope.search.is_paid = 'N';
                break;
            case 'cancel':  //입차취소
                $rootScope.search.is_cancel = 'Y';
                break;
        }
    };

    //입출차 목록 불러오기
    $rootScope.getHistoryList = function(is_load_more){
        var limit = 100;

        Garage.allForHistory(limit, $rootScope.offset).then(function(result){
            if(result.length > 0) {
                for (var key in result) {
                    if (result[key].month_idx > 0) {  //월차차량은 내부적으로 결제됨으로 저장(월차로 표시)
                        result[key].is_paid = 'Y';
                    } else if (result[key].pay_amount < (result[key].total_amount - result[key].discount_cooper - result[key].discount_self)) {
                        //결제 금액 < (총 요금 - 지정주차할인 - 셀프할인)
                        result[key].is_paid = 'N';
                    } else if (!result[key].end_date) {
                        //출차 하기 전엔 결제를 할수 없으므로
                        result[key].is_paid = 'N';
                    } else {
                        result[key].is_paid = 'Y';
                    }
                }

                if(!is_load_more) {
                    //추가 로드가 아닐때
                    $rootScope.vHistoryList = result;
                }else{
                    //추가 로드일때
                    for(var key in result) {
                        $rootScope.vHistoryList.push(result[key]);    // 기존 배열에 추가
                    }
                }
                $rootScope.offset += limit;
                $rootScope.moredata = true;
            }else{
                $rootScope.moredata = false;    // 더이상 추가로드 할게 없음
            }
            $rootScope.$broadcast('scroll.refreshComplete');
            $rootScope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    //-------------------
    // 월차
    //-------------------
    $rootScope.eventSources = [];

    $rootScope.initMonth = function(){
        $rootScope.dates = {};

        $rootScope.status = 'all';
        $rootScope.search = {};
        $rootScope.search.is_expired = 'N';

        $rootScope.getMonthList(false);
    };

    // 월차 탭변경
    $rootScope.changeStatusMon = function(stat){
        $rootScope.status = stat;   //all, expired, calendar

        switch(stat){
            case 'all':
                $rootScope.search.is_expired = 'N';
                break;
            case 'expired':
                $rootScope.search.is_expired = 'Y';
                break;
            case 'wait':
                $rootScope.search.is_expired = 'W';
                break;
            default:
                $rootScope.eventSources = [];
        }
    };

    // 월차 목록 불러오기
    $rootScope.getMonthList = function(is_load_more){
        var limit = 100;

        Month.all(limit, $rootScope.offset).then(function(result){
            if(result.length > 0) {
                var msec = new Date().getTime();  // 현재 시간
                for(var key in result){
                    // 만료 설정
                    if(msec > result[key].end_date || result[key].is_stop == 'Y') {
                        result[key].is_expired = 'Y';
                    }else{
                        if(msec < result[key].start_date) {
                            result[key].is_expired = 'W';
                        }else{
                            result[key].is_expired = 'N';
                        }
                    }
                }

                if(!is_load_more){
                    $rootScope.vMonthList = result;
                }else{
                    //추가 로드일때
                    for(var key in result) {
                        $rootScope.vMonthList.push(result[key]);    // 기존 배열에 추가
                    }
                }
                $rootScope.offset += limit;
                $rootScope.moredata = true;
            }else{
                $rootScope.moredata = false;
            }
            $rootScope.$broadcast('scroll.refreshComplete');
            $rootScope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    /* Start Of Calendar */
    //달력의 등록된 일정클릭
    $rootScope.alertOnEventClick = function(date, jsEvent, view){
        $rootScope.openEditMonthCal(date.id);
    };
    //달력의 빈 칸 클릭
    $rootScope.dayClick = function(date, jsEvent, view){
        $rootScope.openAddMonthCal(date);
    };

    $rootScope.uiConfig = {

        calendar:{
            titleFormat : 'YYYY 년 MMMM',
            height: 735,
            header:{
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            dayClick: $rootScope.dayClick,
            eventClick: $rootScope.alertOnEventClick,
            dayNamesShort : ["일", "월", "화", "수", "목", "금", "토"],
            monthNames : ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
            viewRender: function(view, element) {
                $rootScope.makeEvents(view.start, view.end);
            }
        }

    };

    // 캘린더 변동 이벤트 발생시 달력에 월차 데이터를 뿌려줌
    $rootScope.makeEvents = function(start,end){
        Month.allForCalendar(start,end).then(function(result){

            if(result.length > 0){
                var tempArr = [];

                for(var key in result){
                    var s_color = '#3a87ad';
                    var s_textColor = '#fff';
                    var e_color = '#f00';
                    var e_textColor = 'yellow';

                    if(result[key].is_stop=='Y'){   // 중단된 월차일때
                        e_color = s_color = '#ffc900';
                        e_textColor = s_textColor = '#000';
                    }else if(result[key].end_date < new Date().getTime()){ // 만료된 월차일때
                        e_color = s_color = '#777';
                        e_textColor = '#fff';
                    }

                    if (result[key].start_date >= start) {
                        tempArr.push({
                            color: s_color,
                            textColor: s_textColor,
                            title: result[key].car_num + ' - 월차시작',
                            start: new Date(result[key].start_date),
                            allDay: true,
                            id : result[key].idx
                        });
                    }

                    if (result[key].end_date <= end) {
                        tempArr.push({
                            color: e_color,
                            textColor: e_textColor,
                            title: result[key].car_num + ' - 월차종료',
                            start: new Date(result[key].end_date),
                            allDay: true,
                            id : result[key].idx
                        });
                    }
                }

                $rootScope.eventSources.splice(0,$rootScope.eventSources.length);   // 일정 비워줌

                $rootScope.eventSources.push(tempArr);
            }
        },function(err){
            console.log(err);
        });
    };
    /* End Of Calendar */

    //달력에서 빈칸을 클릭했을때 등록화면으로
    $rootScope.openAddMonthCal = function(start_date){
        $rootScope.month = {};
        $rootScope.dates.start_date = new Date(start_date);
        $rootScope.dates.end_date = new Date(Date.parse($rootScope.dates.start_date) + 30 * 1000 * 60 * 60 * 24);

        $rootScope.mdMonth.show();
    };
    //달력에서 일정을 클릭했을때 수정화면으로
    $rootScope.openEditMonthCal = function(idx){
        Month.getByIdx(idx).then(function(result){
            if(result) {
                $rootScope.month = angular.copy(result);
                $rootScope.dates.start_date = new Date($rootScope.month.start_date);
                $rootScope.dates.end_date = new Date($rootScope.month.end_date);

                $rootScope.mdMonth.show();
            }
        });
    };

    //-------------------
    // 지정주차
    //-------------------

    $rootScope.initCooper = function(){
        $rootScope.dates = {};
        $rootScope.status = 'cooper';
        $rootScope.getCooperList();
    };
    
    $rootScope.changeStatus = function(stat){
        $rootScope.status = stat;   //cooper, period, day
        switch(stat){
            case 'period':
                $rootScope.dates = {};
                $rootScope.dates.start_date = getStartEndDate().start_date;
                $rootScope.dates.end_date = getStartEndDate().end_date;
                $rootScope.getGarageList();
                break;
            case 'day':
                $rootScope.dates = {};
                $rootScope.dates.start_date = new Date();
                $rootScope.getGarageList();
                break;
            default:
                $rootScope.getCooperList();
        }
    };

    $rootScope.refresh = function(){
        $rootScope.$broadcast('scroll.refreshComplete');
    };

    $rootScope.getCooperList = function(){
        Cooper.all().then(function(result){
            if(result.length > 0) $rootScope.cooperList = result;
        });

    };

    $rootScope.getGarageList = function(){
        $rootScope.garageList = {};
        Garage.allForCooper($rootScope.dates).then(function(result){
            if(result.length > 0) $rootScope.garageList = result;
        });
    };

    //업체 추가 Modal
    $ionicModal.fromTemplateUrl('templates/cooper.addcooper.html', {
        scope: $rootScope
    }).then(function(modal) {
        $rootScope.modalCooper = modal;
    });
    $rootScope.openAddCooper = function(){
        $rootScope.params = {};
        $rootScope.modalCooper.show();
    };
    $rootScope.closeCooper = function(){
        $rootScope.params = {};
        $rootScope.modalCooper.hide();
    };
    $rootScope.openEditCooper = function(cooper){
        $rootScope.params = cooper;
        $rootScope.modalCooper.show();
    };

    //지정주차 등록, 수정
    $rootScope.insertCooper = function(){
        if(!$rootScope.params.coop_title) return $ionicPopup.alert({title: '알림',template: '업체명을 입력하지 않았습니다.'});
        if(!$rootScope.params.coop_tel) return $ionicPopup.alert({title: '알림',template: '전화번호를 입력하지 않았습니다.'});
        if(!$rootScope.params.coop_address) return $ionicPopup.alert({title: '알림',template: '주소를 입력하지 않았습니다.'});
        if(!$rootScope.params.coop_user_name) return $ionicPopup.alert({title: '알림',template: '대표자 명을 입력하지 않았습니다.'});
        if(!$rootScope.params.minute_max && $rootScope.params.minute_max!==0) return $ionicPopup.alert({title: '알림',template: '최대 지원 시간을 입력하지않았습니다.'});
        if(!$rootScope.params.amount_unit && $rootScope.params.amount_unit!==0) return $ionicPopup.alert({title: '알림',template: '추가요금을 입력하지않았습니다.'});
        if(!$rootScope.params.minute_unit && $rootScope.params.minute_unit!==0) return $ionicPopup.alert({title: '알림',template: '추가요금 단위를 입력하지않았습니다.'});

        if(!$rootScope.params.idx){
            Cooper.insert($rootScope.params).then(function(res){
                console.log("insertId: " + res.insertId);
                $state.go($state.current, {}, {reload: true});
                $rootScope.closeCooper();
            },function(err){
                console.log(err);
            });
        }else{
            Cooper.update($rootScope.params).then(function(res){
                $state.go($state.current, {}, {reload: true});
                $rootScope.closeCooper();
            },function(err){
                console.log(err);
            });
        }
    };

    //---------------------------------------
    // 이하는 xSerial
    //---------------------------------------

    var show = function(message, duration) {
        $ionicLoading.show({
            template: message ? message : '단말입력 대기중..',
            duration: duration ? duration : 5000
        });
    };
    var hide = function(){
        $ionicLoading.hide();
    };

    // 단말기에서 결제 신호가 들어오면 처리
    $rootScope.complete = function(res){
        console.log('self.complete start');
        if($rootScope.pay_success == 'Y'){    //결제 성공일때

            $rootScope.payObj.code = res.code;
            $rootScope.payObj.ret_code = res.ret_code;
            $rootScope.payObj.success_code = res.success_code;
            $rootScope.payObj.success_date = res.success_date;
            $rootScope.payObj.is_cancel = 'N';

            if($rootScope.tempDayCar.idx){
                Garage.updateDayCar($rootScope.tempDayCar);
            }

            Payment.update($rootScope.payObj).then(function(res2){
                if($rootScope.pay_location == 'outCar'){
                    $rootScope.procOutCar();
                }else if($rootScope.pay_location == 'month'){
                    $rootScope.closeModal();
                    $rootScope.month = {};
                }

                $rootScope.initPayVariables();
                hide();
                reload();
            },function(err){ console.log('DB error! payment.update'); });

        }else if($rootScope.pay_success == 'C'){      //결제 취소 성공일때
            // DB 상의 결제를 취소로 전환
            $rootScope.payObj.idx = res.seq;
            Payment.cancelPay($rootScope.payObj).then(function(){
                $rootScope.initPayVariables();
                hide();
                $rootScope.closeModal();
                reload();
            }, function(err){ console.log(err); });

        }else if($rootScope.pay_success == 'N'){      //결제 실패일때
            $rootScope.initPayVariables();
            hide();
        }
        clearTimeout($rootScope.timeID2);
        console.log('$rootScope.complete end');
    };

    $rootScope.initX = function(){
        if (window.cordova && !$rootScope.inited) {
            serial.requestPermission({},
                function success(success) {
                    console.log(success);
                    var opts = {
                        baudRate: '115200'
                    };
                    serial.open(opts, function success() {
                        $cordovaToast.showShortBottom("카드단말기가 연결 되었습니다.");
                        hide();
                        $rootScope.inited = true;
                        serial.registerReadCallback(
                            function success(data){
                                var view = new Uint8Array(data);
                                if(view.length >= 1) {
                                    clearTimeout($rootScope.timeID);
                                    var ksc = new TextDecoder("ASCII").decode(view);
                                    $rootScope.receive = $rootScope.receive + ksc.toString();
                                    //receive = encodeURI(receive);
                                    $rootScope.timeID = setTimeout(function(){
                                        //반환되는 전문코드
                                        var res = {
                                            code : $rootScope.receive.substr(5, 2),
                                            ret_code : $rootScope.receive.substr(7, 4),
                                            success_code : $rootScope.receive.substr(86, 8),
                                            success_date : $rootScope.receive.substr(98, 12),
                                            seq : $rootScope.receive.substr(168, 20)
                                        };

                                        //성공일때
                                        if(res.code == "I1" || res.code == "I2" || res.code == "I4"){
                                            if(res.ret_code == "0000"){
                                                if(res.code == "I1"){
                                                    $rootScope.pay_success = 'Y';    //결제 성공시
                                                    $cordovaToast.showShortBottom("카드결제 성공 : 승인번호 " + res.success_code);
                                                }else if(res.code == "I2"){
                                                    $rootScope.pay_success = 'C';    //취소 성공시
                                                    $cordovaToast.showShortBottom("직전거래 취소 : 마지막 결제가 취소되었습니다. / 승인번호 " + res.success_code);
                                                }else if(res.code == "I4"){
                                                    $rootScope.pay_success = 'C';    //취소 성공시
                                                    $cordovaToast.showShortBottom("거래 취소 : 선택한 거래가 취소되었습니다. / 승인번호 " + res.success_code);
                                                }
                                            }else if(res.ret_code == "8433"){
                                                $rootScope.pay_success = 'N';
                                                $cordovaToast.showShortBottom("사용자취소");
                                            }else if(res.ret_code == "8313"){
                                                $rootScope.pay_success = 'N';
                                                $cordovaToast.showShortBottom("한도초과");
                                            }else{
                                                $rootScope.pay_success = 'N';
                                                $cordovaToast.showShortBottom("거래실패 : 코드 - " + res.ret_code);
                                                clearTimeout($rootScope.timeID2);
                                            }

                                            $rootScope.complete(res);    //결제 종료
                                        }else if(res.code == 'D1'){
                                            if(res.ret_code == '9998'){
                                                $cordovaToast.showShortBottom("거래실패 : IC 카드 빠짐");
                                            }else{
                                                $rootScope.pay_success = 'N';
                                                $cordovaToast.showShortBottom("거래실패 : 코드 - " + res.ret_code);
                                            }
                                            $rootScope.complete(res);    //결제 종료

                                        }else if(res.code == 'D4'){
                                            if(res.ret_code == '9999'){
                                                $cordovaToast.showShortBottom("입력 취소하였습니다");
                                                hide();
                                            }else if(res.ret_code == '9998'){
                                                $cordovaToast.showShortBottom("거래실패 : IC 카드 빠짐");
                                                hide();
                                            }else {
                                                $cordovaToast.showShortBottom("거래실패 : 코드 - " + res.ret_code);
                                                clearTimeout($rootScope.timeID2);
                                            }
                                        }
                                        console.log("receive : " + res.receive);
                                        console.log("seq : " + res.seq + "(" + parseInt(res.seq) + ")");
                                        console.log("ret_code : " + res.ret_code);
                                        console.log("success_code : " + res.success_code);
                                        console.log("success_date : " + res.success_date);
                                        console.log("code : " + res.code);
                                        $rootScope.receive = "";
                                    },500);
                                }
                            });
                    }, function error() {
                        $cordovaToast.showShortBottom("카드단말기가 연결되지 않았습니다.");
                        $rootScope.inited = false;
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

    $rootScope.Sender = function(content, is_init){
        if(!$rootScope.inited){
            hide();
            show("아직 단말기가 연결되지않아 먼저 연결을 시도합니다. 연결이 성공하면 재시도 해주세요.", 3000);
            setTimeout(function(){
                $rootScope.initX();
            },500);
            return;
        }
        if(is_init){
            $cordovaToast.showShortBottom("단말기를 초기화 한 다음 호출합니다. 잠시만 기다려주세요.");
            serial.writeHex("02000604FD544D0378EF");
            setTimeout(function(){
                $rootScope.write(content);
            },500);
        }else{
            $rootScope.write(content);
        }
    };

    $rootScope.doPrint = function(date,time,carnum,srl,message){
        var shopname = "화 진 S";
        var shopaddr = "중구 부평동 3가 62-2.7.8";
        var shoptel = "051-333-5646";

        ShopInfo.all().then(function(result){
            if(result.length > 0){
                shopname = result[0].shop_name;
                shopaddr = result[0].address;
                shoptel = result[0].tel;
            }

            var str = "\x1D!\x01           [ ";
            str += shopname;
            str += " 주 차 영 수 증 ]\x1D!\0\r\n             " + shopaddr;
            str += "\r\n               (전화) " + shoptel;
            str += "\r\n 입차년월 : " + date;
            str += "\r\n\r\n\x1D!\x01  입차시간 :                " + time;
            str += "\x1D!\0\x1D!\x01  차량번호 :                " + carnum;
            str += "\x1D!\0\r\n#seq : " + srl;
            str += "\r\n" + message + "\r\n===============================================\r\n맞춤형 POS,웹/앱 개발,기업 디자인 문의\r\nhttp://xiso.co.kr \r\n\r\n\r\n\r\n\r\n\x1Bi\r\n";

            if(!$rootScope.inited){
                show("아직 단말기가 연결되지않아 먼저 연결을 시도합니다. 연결이 성공하면 재시도 해주세요.");
                setTimeout(function(){
                    $rootScope.initX();
                },500);
            }else{
                serial.write(str);
            }
        });
    };

    $rootScope.write = function(content){
        serial.writeHex(content,
            function sr(success){
                console.log("Put : " + success);
            },
            function er(error){
                console.log("error:" + error);
            }
        );
    };

    $rootScope.stringToByteHex = function(str){
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

    $rootScope.LPAD = function(s, padLength, padString){

        while(s.length < padLength) s = padString + s;
        //console.log("run LPAD : " + s.length + " -> " + padLength);
        return s;
    };

    $rootScope.payCard = function(lookup_idx, lookup_type, pay_amount, pay_location){
        //단말기 연결 확인
        if(!$rootScope.inited){
            $cordovaToast.showShortBottom('결제 실패 - 카드단말이 연결되지 않았습니다. 재접속 후 다시 시도해주세요.');
            return false;
        }

        show('카드 결제를 요청중입니다..', 50000);
        $rootScope.timeID2 = setTimeout(function(){
            hide();
            serial.writeHex("02000604FD544D0378EF");
        }, 40000);
        $rootScope.initPayVariables();
        $rootScope.pay_location = pay_location;   //결제 요청한 위치를 저장

        $rootScope.payObj.lookup_idx = lookup_idx;
        $rootScope.payObj.lookup_type = lookup_type;
        $rootScope.payObj.pay_type = 'card';
        $rootScope.payObj.pay_amount = pay_amount;

        Payment.insertFirst($rootScope.payObj).then(function(result){ //빈 payment insert
            if(result.insertId) {
                $rootScope.payObj.idx = result.insertId;

                //stx, len, cnt, cmd, data, ext, crc
                var stx = "02";
                var lentocmd = "006F04FD";
                //코드2, WCC1, 카드번호 40,          할부현금영수증2, 승인일시yymmdd(6), 승인번호 12, 금액 8, 봉사료8, VAT 8, 거래번호 20
                //D1                                         00yymmdd    00000000    1004       0      9100000000000000000000
                var card = "D1";
                var data = card + "                                         00                  ";
                data += $rootScope.LPAD(pay_amount.toString(),8," ");
                data += "       0      91";
                data += $rootScope.LPAD(result.insertId.toString(),20,"0");

                var datahex = $rootScope.stringToByteHex(data);
                var ext = "03";

                serial.getCRC("$" + lentocmd + datahex + ext,function(success){
                    str = stx + lentocmd + datahex + ext + success;
                    $rootScope.Sender(str, true);
                });
            }
            else{
                hide();
                $cordovaToast.showShortBottom('결제 실패 - 결제 데이터를 DB에 넣는데 실패하였습니다. -1');
            }
        }, function(err){ hide(); $cordovaToast.showShortBottom('결제 실패 - 결제 데이터를 DB에 넣는데 실패하였습니다. -2'); });
    };

    $rootScope.payCardCancel = function(pay_idx, pay_location){
        //단말기 연결 확인
        if(!$rootScope.inited){
            $rootScope.closeModal();
            $cordovaToast.showShortBottom('취소 실패 - 카드단말이 연결되지 않았습니다. 재접속 후 다시 시도해주세요.');
            reload();
            return false;
        }

        show('카드 결제 취소를 요청중입니다..', 50000);
        $rootScope.timeID2 = setTimeout(function(){
            hide();
            serial.writeHex("02000604FD544D0378EF");
        }, 40000);

        $rootScope.initPayVariables();
        $rootScope.pay_location = pay_location;   //결제 요청한 위치를 저장
        $rootScope.payObj.idx = pay_idx;

        Payment.getByIdx(pay_idx).then(function (result) {
            if (result) {
                //stx, len, cnt, cmd, data, ext, crc
                var stx = "02";
                var lentocmd = "006F04FD";
                //코드2, WCC1, 카드번호 40,          할부현금영수증2, 승인일시yymmdd(6), 승인번호 12, 금액 8, 봉사료8, VAT 8, 거래번호 20
                //D1                                         00yymmdd    00000000    1004       0      9100000000000000000000
                var card = "D4";   // D4 : 취소, D1 : 결제
                var data = card + "                                         00";
                data += result.success_date.substr(0,6) + "    " + result.success_code;
                data += $rootScope.LPAD(result.pay_amount.toString(),8," ");
                data += "       0      91";
                data += $rootScope.LPAD(pay_idx.toString(),20,"0");
                var datahex = $rootScope.stringToByteHex(data);
                var ext = "03";

                serial.getCRC("$" + lentocmd + datahex + ext,function(success){
                    str = stx + lentocmd + datahex + ext + success;
                    $rootScope.Sender(str, true);
                });
            } else {
                hide();
                $cordovaToast.showShortBottom('결제 취소 실패 - DB에서 해당하는 Sequence를 찾지 못했습니다');
            }
        });
    };

    $rootScope.payCash = function(amount,cash_type,sequence){
        //stx, len, cnt, cmd, data, ext, crc
        var stx = "02";
        var lentocmd = "006F04FD";

        //코드2, WCC1, 카드번호 40,          할부현금영수증2, 승인일시yymmdd(6), 승인번호 12, 금액 8, 봉사료8, VAT 8, 거래번호 20
        //B1                                         00                      1004       0      9100000000000000000000
        var data = "B1                                         ";
        data += cash_type;
        data += "                  ";
        data += $rootScope.LPAD(amount.toString(),8," ");
        data += "       0      91";
        data += $rootScope.LPAD(sequence.toString(),20,"0");
        var datahex = $rootScope.stringToByteHex(data);

        var ext = "03";

        serial.getCRC("$" + lentocmd + datahex + ext,function(success){
            str = stx + lentocmd + datahex + ext + success;
            $rootScope.Sender(str, true);
        });
    };

    $rootScope.openCash = function() {
        $rootScope.Sender("02000604FD4344039EA6", false);
    };

    // init functions load
    $rootScope.init();
    $rootScope.initPayVariables();
    $rootScope.initX();
})

//-------------------
// 정산
//-------------------
.controller('calcuCtrl', function ($rootScope, Garage, $stateParams, MultipleViewsManager) {
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.calcu'){
            $rootScope.initCalcu();
        }
    });

    $rootScope.eventSources = [];

    setTimeout(function(){
        $rootScope.initCalcu();
    },1000);

    $rootScope.initCalcu = function(){
        $rootScope.makeEvents();
    };

    $rootScope.makeEvents = function(dt){

        if(!dt) dt = new Date();
        var tmpParams = getStartEndDate(dt);
        var params = {};
        params.start_date = new Date(tmpParams.start_date).getTime();
        params.end_date = new Date(tmpParams.end_date).getTime();

        Garage.allForCal(params).then(function(result){
            if(result){
                Garage.getInCount(params).then(function(result2){
                    // console.log(result2);
                    if(result2){
                        for(var key in result2){
                            result[key].inCnt = result2[key].inCnt;
                        }
                    }
                    var tempArr = [];
                    var inCarCount = 0; //총입차
                    var outCarCount = 0;    //총출차

                    for(var key in result) {
                        inCarCount += onum(result[key].inCnt);
                        outCarCount += onum(result[key].outCnt);
                        var start = new Date(result[key].gdate);
                        tempArr.push({
                            title: '입차 : ' + onum(result[key].inCnt) + ' / 출차 : ' + onum(result[key].outCnt),
                            start: start, allDay: true
                        });
                        tempArr.push({
                            title: '매출 : ' + onum(result[key].pay_amounts),
                            start: start, allDay: true
                        });
                        tempArr.push({
                            title: '할인 : ' + (onum(result[key].dc_coopers) + onum(result[key].dc_selfs)),
                            start: start, allDay: true
                        });
                        tempArr.push({
                            title: '미수금 : ' + (onum(result[key].total_amounts) - onum(result[key].dc_coopers) - onum(result[key].dc_selfs) - onum(result[key].pay_amounts)),
                            start: start, allDay: true
                        });
                    }
                    // console.log(tempArr);

                    $rootScope.eventSources.splice(0,$rootScope.eventSources.length);   // 일정 비워줌
                    $rootScope.eventSources.push(tempArr);

                    Garage.allTotCal(params).then(function(result3){
                        if(result3) {
                            // console.log(result3);
                            $rootScope.total = result3;
                            $rootScope.total.inCarCount = inCarCount;
                            $rootScope.total.outCarCount = outCarCount;
                        }
                    }, function(err){ console.log(err); });

                },function(err){
                    console.log(err);
                });
            }
        },function(err){
            console.log(err);
        });
    };

    $rootScope.uiConfig = {

        calendar:{
            titleFormat : 'YYYY 년 MMMM',
            height: 800,
            header:{
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            eventOrder: 'id',
            dayNamesShort : ["일", "월", "화", "수", "목", "금", "토"],
            monthNames : ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
            viewRender: function(view, element) {
                $rootScope.makeEvents(new Date(view.intervalStart));
            }
        }

    };
})

//-------------------
// 설정
//-------------------
.controller('configCtrl', function ($rootScope, $ionicModal, $ionicLoading, ShopInfo, CarType,$ionicPopup,$cordovaToast, DB, $http) {

    $rootScope.initConfigParams = function(){
        $rootScope.defaultParams = {};
    };
    $rootScope.initConfigDefault = function(){
        $rootScope.initConfigParams();

        ShopInfo.all().then(function(result){
            if(result.length > 0) $rootScope.defaultParams = result[0];
        });
        console.log('Shop Info loaded!!');
    };

    $rootScope.initCartypeParams = function(){
        $rootScope.carTypeList = {};
        $rootScope.params = {};
    };
    $rootScope.initCartype = function(){
        $rootScope.initCartypeParams();

        CarType.all().then(function(result){
            if(result.length > 0) $rootScope.carTypeList = result;
        });

        console.log('Car Type loaded!!');
    };
    $rootScope.initDayCar = function(){
        $rootScope.initCartypeParams();

        CarType.allDayCar().then(function(result){
            if(result.length > 0) $rootScope.carTypeList = result;
        });

        console.log('Day Car loaded!!');
    };

    $rootScope.shouldShowDelete = false;
    $rootScope.showDelete = function(){
        $rootScope.shouldShowDelete = true;
    };
    $rootScope.hideDelete = function(){
        $rootScope.shouldShowDelete = false;
    };

    $ionicModal.fromTemplateUrl('templates/config.addcartype.html', {
        scope: $rootScope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $rootScope.addCartypeWindow = modal;
    });
    $rootScope.openCartype = function(is_daycar) {
        $rootScope.params = {};
        $rootScope.params.is_daycar = is_daycar;
        $rootScope.addCartypeWindow.show();
    };
    $rootScope.closeCartype = function() {
        if($rootScope.params.is_daycar == 'N') {
            $rootScope.initCartype();
        }else{
            $rootScope.initDayCar();
        }
        $rootScope.addCartypeWindow.hide();
    };

    $rootScope.insertShopInfo = function(){
        if(!$rootScope.defaultParams.shop_name) return $ionicPopup.alert({title: '알림',template: '주차장명을 입력하지 않았습니다.'});
        if(!$rootScope.defaultParams.mobile) return $ionicPopup.alert({title: '알림',template: '휴대전화를 입력하지 않았습니다.'});
        if(!$rootScope.defaultParams.tel) return $ionicPopup.alert({title: '알림',template: '유선전화를 입력하지 않았습니다.'});
        // if(!$rootScope.defaultParams.fax) return $ionicPopup.alert({title: '알림',template: 'FAX를 입력하지 않았습니다.'});
        if(!$rootScope.defaultParams.user_name) return $ionicPopup.alert({title: '알림',template: '대표자 명을 입력하지 않았습니다.'});
        if(!$rootScope.defaultParams.address) return $ionicPopup.alert({title: '알림',template: '주소를 입력하지 않았습니다.'});

        ShopInfo.delete().then(function(res) {
            console.log(res);

            ShopInfo.insert($rootScope.defaultParams).then(function(res) {
                $cordovaToast.showShortBottom("저장되었습니다.");
                // console.log("insertId: " + res.insertId);
                $rootScope.initConfigDefault();
            }, function (err) {
                console.error(err);
            });
        }, function (err) {
            console.error(err);
        });
    };

    $rootScope.insertCartype = function(){
        if(!$rootScope.params.car_type_title) return $ionicPopup.alert({title: '알림',template: '차종명을 입력하지 않았습니다.'});
        if(!$rootScope.params.minute_free && $rootScope.params.minute_free!==0) return $ionicPopup.alert({title: '알림',template: '최초 무료시간을 입력하지 않았습니다.'});
        if(!$rootScope.params.basic_amount && $rootScope.params.basic_amount!==0) return $ionicPopup.alert({title: '알림',template: '기본요금을 입력하지 않았습니다.'});
        if(!$rootScope.params.basic_minute && $rootScope.params.basic_minute!==0) return $ionicPopup.alert({title: '알림',template: '기본시간을 입력하지 않았습니다.'});
        if(!$rootScope.params.amount_unit && $rootScope.params.amount_unit!==0) return $ionicPopup.alert({title: '알림',template: '추가요금을 입력하지 않았습니다.'});
        if(!$rootScope.params.minute_unit && $rootScope.params.minute_unit!==0) return $ionicPopup.alert({title: '알림',template: '추가요금 단위를 입력하지 않았습니다.'});

        CarType.insert($rootScope.params).then(function(res) {
            console.log("insertId: " + res.insertId);

            $rootScope.closeCartype();
            if($rootScope.params.is_daycar == 'N') {
                $rootScope.initCartype();
            }else{
                $rootScope.initDayCar();
            }
        }, function (err) {
            console.error(err);
        });
    };

    $rootScope.openUpdateCartype = function(cartype){
        $rootScope.openCartype();
        $rootScope.params = cartype;
    };

    $rootScope.updateCartype = function(){
        if(!$rootScope.params.car_type_title) return $ionicPopup.alert({title: '알림',template: '차종명을 입력하지 않았습니다.'});
        if(!$rootScope.params.minute_free && $rootScope.params.minute_free!==0) return $ionicPopup.alert({title: '알림',template: '최초 무료시간을 입력하지 않았습니다.'});
        if(!$rootScope.params.basic_amount && $rootScope.params.basic_amount!==0) return $ionicPopup.alert({title: '알림',template: '기본요금을 입력하지 않았습니다.'});
        if(!$rootScope.params.basic_minute && $rootScope.params.basic_minute!==0) return $ionicPopup.alert({title: '알림',template: '기본시간을 입력하지 않았습니다.'});
        if(!$rootScope.params.amount_unit && $rootScope.params.amount_unit!==0) return $ionicPopup.alert({title: '알림',template: '추가요금을 입력하지 않았습니다.'});
        if(!$rootScope.params.minute_unit && $rootScope.params.minute_unit!==0) return $ionicPopup.alert({title: '알림',template: '추가요금 단위를 입력하지 않았습니다.'});

        CarType.update($rootScope.params).then(function(res){
            $rootScope.closeCartype();
            $rootScope.initCartype();
        }, function (err) {
            console.error(err);
        });
        console.log('updateCarType');
    };

    $rootScope.deleteCartype = function(idx){
        var confirmPopup = $ionicPopup.confirm({
            title: '차종 삭제 확인',
            template: '정말로 삭제 하시겠습니까?',
            okText:'예',cancelText:'아니오'
        });

        confirmPopup.then(function(res) {
            if(res) {
                CarType.delete(idx).then(function(res){
                    $rootScope.initCartype();
                }, function (err) {
                    console.error(err);
                });
            }
        });
    };

    $rootScope.initConfigDb = function(){
        $rootScope.getDbList();
    };

    $rootScope.getDbList = function(){
        $http({
            method: 'POST',
            url: 'http://xpos.xiso.co.kr/disp.php?mClass=hwajin&act=dispList',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json'
            }
        })
            .success(function (responsive, status, headers, config) {
                console.log(responsive);
                if(responsive != 'null'){
                    $rootScope.dbList = responsive;
                }else{
                    $rootScope.dbList = {};
                    $cordovaToast.showShortBottom('DB 목록이 없습니다.');
                }
            })
            .error(function (data, status, headers, config) {
                $rootScope.dbList = {};
                $cordovaToast.showShortBottom('DB 목록을 불러오는데 실패했습니다.');
            });
    };

    // DB 백업
    $rootScope.backup = function(){
        var successFn = function(json, count){
            // console.log("Exported JSON: "+json);
            console.log("Exported JSON contains equivalent of "+count+" SQL statements");

            $http({
                method: 'POST',
                url: 'http://xpos.xiso.co.kr/proc.php?mClass=hwajin&act=procInsert',
                data: {
                    pos_json : json
                },
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'application/json'
                }
            })
                .success(function (responsive, status, headers, config) {
                    $ionicLoading.hide();
                    $cordovaToast.showShortBottom(responsive);
                    $rootScope.getDbList();
                })
                .error(function (data, status, headers, config) {
                    $ionicLoading.hide();
                    $cordovaToast.showShortBottom('서버에 DB 백업을 실패하였습니다.');
                    console.log(data);
                    console.log(status);
                    console.log(headers);
                });

        };

        $ionicPopup.confirm({
            title: '확인',
            template: '현재 시점으로 디비를 백업합니다',
            okText:'예',cancelText:'아니오'
        }).then(function(res){
            if(res){
                $ionicLoading.show({
                    template: '서버와 통신중입니다.',
                    duration: 10000
                });
                cordova.plugins.sqlitePorter.exportDbToJson(DB.db, {
                    successFn: successFn,
                    errorFn: errorFn
                });
            }
        });

    };

    // DB 복구
    $rootScope.restore = function(database){
        $ionicPopup.confirm({
            title: '확인',
            template: '선택한 시점으로 디비를 복구합니다',
            okText:'예',cancelText:'아니오'
        }).then(function(res){
            if(res){
                $http({
                    method: 'POST',
                    url: 'http://xpos.xiso.co.kr/disp.php?mClass=hwajin&act=dispView',
                    data: {
                        pos_srl : database.pos_srl
                    },
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/json'
                    }
                })
                    .success(function (responsive, status, headers, config) {
                        if(responsive.pos_json){
                            // cordova.plugins.sqlitePorter.wipeDb(DB.db, {
                            //     successFn: dbSwipeSuccess,
                            //     errorFn: errorFn
                            // });

                            cordova.plugins.sqlitePorter.importJsonToDb(DB.db, responsive.pos_json,{
                                successFn: successFn,
                                errorFn: errorFn,
                                batchInsertSize: 500
                            });

                        }else{
                            console.log('복구할 DB 를 로드하지 못했습니다.');
                        }
                    })
                    .error(function (data, status, headers, config) {
                        console.log(data);
                        console.log(status);
                        console.log(headers);
                    });
            }
        });

        var dbSwipeSuccess = function(json){
            console.log(json);
            console.log('DB 삭제 성공');

            cordova.plugins.sqlitePorter.importJsonToDb(DB.db, pos_json,{
                successFn: successFn,
                errorFn: errorFn,
                batchInsertSize: 500
            });
        };

        var successFn = function(){
            $cordovaToast.showShortBottom('DB 복구를 성공하였습니다.');
        };

    };

    var errorFn = function(error){
        $cordovaToast.showShortBottom('실패 : '+error.message);
        console.log("The following error occurred: "+error.message);
    };

});