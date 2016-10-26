xpos.controller('PanelCtrl', function ($scope, $state, $ionicModal, $ionicPopup, $cordovaToast, CarType, Garage, Month, xSerial) {

    $scope.mainField = '';

    $scope.addMainField = function(num){
        $scope.mainField = $scope.mainField + num;
    };
    $scope.clearMainField = function(){
        $scope.mainField = '';
    };

    // 입차버튼 클릭시 체크
    $scope.inCarChk = function(){
        if(!$scope.mainField) return $ionicPopup.alert({title: '알림', template: '관리 번호를 입력해주세요'});


        CarType.all().then(function(result){
            if(result.length > 0) {
                $scope.inCar();
            }else{
                $ionicPopup.alert({title: '알림', template: '등록된 차종이 없습니다.<br>먼저 설정에서 차종을 추가해주세요.'});
            }
        });
    };

    //입차 전 월차 검사
    $scope.inCar = function(){

        //디비에서 현재 차번호를 검색하여 월차에 있는지 판단하여 있으면 컨펌을 띄움
        Month.getByCarNum($scope.mainField).then(function(result){
            if(result.length > 0){
                $scope.monthList = result;

                $ionicPopup.confirm({
                    title: '월차 확인',
                    template: '월차에 '+$scope.mainField + '(으)로 시작되는 차량번호가 있습니다.<br/>어떻게 입차할까요?',
                    okText: '월차로 입차',
                    cancelText: '다른 번호 입력'
                }).then(function (res) {
                    if (res) {
                        //월차로 입차시에 월차 목록을 띄움
                        $scope.openMonthModal();
                    } else {
                        $cordovaToast.showShortBottom('다른 차량번호를 입력하고 입차버튼을 누르세요');
                    }
                });
            }else{
                //월차목록에 없으면 다른 차량으로 입차
                $scope.openCartypeList();
            }
        },function (err){ console.log(err); });
    };

    //차종 선택되면 입차시킴
    $scope.selectCartype = function(cartype){
        var params = {
            start_date : new Date().getTime(),
            car_num : $scope.mainField,
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
        
        Garage.insert(params).then(function(res) {
            console.log("insertId: " + res.insertId);

            var date = getHanDate(params.start_date);   //"2016년 10월 13일 목요일"
            var time = getHanTime(params.start_date);   //"11시 50분"
            var carnum = params.car_num;
            var srl = res.insertId;
            var message = "* 오늘도 좋은 하루 되세요.";
            message += "\r\n* 협력업체 방문시 뒷면에 꼭 도장을 받아주세요.";
            message += "\r\n* 영수중 분실시 차량출고가 불가 할 수 있습니다.";
            xSerial.doPrint(date,time,carnum,srl,message);

            $state.go($state.current, {}, {reload: true});
            $scope.closeCartypeList();
            $cordovaToast.showShortBottom('[ '+ $scope.mainField +' ] - 입차되었습니다');
            $scope.clearMainField();
        }, function (err) {
            console.error(err);
        });
    };

    //월차로 입차시에
    $scope.monthIn = function (month) {
        var params = {
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

        Garage.insert(params).then(function (res) {
            console.log("insertId: " + res.insertId);
            $state.go($state.current, {}, { reload: true });
            $scope.closeMonthModal();
            $cordovaToast.showShortBottom('[ '+ month.car_num +' ] - 월차로 입차되었습니다');
            $scope.clearMainField();
        }, function (err) {
            console.error(err);
        });
    };

    //차종선택 리스트 모달
    $ionicModal.fromTemplateUrl('templates/panel.cartypeList.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalCartypeList = modal;
    });
    $scope.openCartypeList = function() {

        Garage.getByCarNum($scope.mainField).then(function(result){
            if(result){
                return false, $ionicPopup.alert({
                    title: '알림',
                    template: '같은 차번호가 입차되어있습니다.<br/>다른 번호를 입력해주세요.'
                });
            }else{
                CarType.all().then(function(result){
                    if(result.length > 0) $scope.carTypeList = result;
                });

                $scope.modalCartypeList.show();
            }
        },function(err){ console.log(err); });

    };
    $scope.closeCartypeList = function() {
        $scope.modalCartypeList.hide();
    };

    //월차 선택 리스트 모달
    $ionicModal.fromTemplateUrl('templates/panel.monthList.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalMonthList = modal;
    });
    $scope.openMonthModal = function(){
        $scope.modalMonthList.show();
    };
    $scope.closeMonthModal = function(){
        $scope.modalMonthList.hide();
    };

    //출차 선택 리스트 모달
    $ionicModal.fromTemplateUrl('templates/panel.outList.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalOutList = modal;
    });
    $scope.openOutModal = function(){
        $scope.modalOutList.show();
    };
    $scope.closeOutModal = function(){
        $scope.modalOutList.hide();
    };

    //입차 열람 모달
    $ionicModal.fromTemplateUrl('templates/garage_view.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalGarageView = modal;
    });
    $scope.openGarageView = function(garage){
        $scope.modalGarageViewList.hide();  //리스트가 열려있을수도 있으므로
        $scope.garage = garage;
        $scope.modalGarageView.show();
    };
    $scope.closeGarageView = function(){
        $scope.modalGarageView.hide();
    };

    //열람 여러개일때 표시 모달
    $ionicModal.fromTemplateUrl('templates/panel.garageList.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalGarageViewList = modal;
    });
    $scope.openGarageViewList = function(){
        $scope.modalGarageViewList.show();
    };
    $scope.closeGarageViewList = function(){
        $scope.modalGarageViewList.hide();
    };

    // 출차 버튼 클릭
    $scope.outCarChk = function(){
        if(!$scope.mainField) return $ionicPopup.alert({title:'알림',template:'출차할 차 번호를 먼저 입력하세요.'});
        Garage.getCurrentByCarNum($scope.mainField+'%').then(function(result){
            if(result.length == 1) {
                $scope.outCar(result[0]);
            }else if(result.length > 1) {
                $scope.outList = result;
                $scope.openOutModal();
            }else {
                $ionicPopup.alert({title:'알림',template:'입차된 차중에 [ '+$scope.mainField+' ]로 시작되는 차번호가 없습니다.'});
            }
        });
    };

    //출차처리
    $scope.outCar = function(garage){
        var tempGarage = angular.copy(garage);
        tempGarage.end_date = new Date().getTime();
        tempGarage.total_amount = cal_garage(tempGarage);
        $ionicPopup.confirm({
            title: '출차 - '+tempGarage.car_num,
            template: '요금 : '+ tempGarage.total_amount +' 원<br/>입차시간 : ' + formatted_date(new Date(garage.start_date)) + '<br/>출차시간 : ' + formatted_date(new Date(tempGarage.end_date)) + '<br/>출차 하시겠습니까?'
        }).then(function (res) {
            if(res){
                //
                // 이 구문 전체는 결제 프로세스 이후에 동작해야함
                //
                Garage.outCar(tempGarage).then(function(res2){
                    $cordovaToast.showShortBottom('차량번호 [ '+ tempGarage.car_num +' ]의 출차가 완료 되었습니다');
                    $scope.closeGarageView();
                    $state.go($state.current, {}, {reload: true});
                    $scope.mainField = '';
                },function(err){
                    console.log(err);
                });
            }else{

            }
        });
    };
    
    //열람 버튼 클릭
    $scope.openGarageChk = function(){
        if(!$scope.mainField) return $ionicPopup.alert({title:'알림',template:'열람할 차 번호를 먼저 입력하세요.'});
        Garage.getCurrentByCarNum($scope.mainField+'%').then(function(result){
            // console.log(result);
            if(result.length == 1) {
                $scope.openGarageView(result[0]);
            }else if(result.length > 1) {
                $scope.garageList = result;
                $scope.openGarageViewList();
            }else {
                $ionicPopup.alert({title:'알림',template:'입차된 차중에 [ '+$scope.mainField+' ]로 시작되는 차번호가 없습니다.'});
            }
        },function(err){console.log(err);});
    };

    $scope.doCard = function(is_cancel){
        $scope.data = {};
        //$scope.data.amount = 0;
        $ionicPopup.show({
            template: ' 임의결제 금액을 입력합니다. <input type="number" ng-model="data.amount" autofocus="autofocus" style="color:#FFF;background:transparent;font-size:30px;text-align:center;border-bottom:1px solid #aaa;">',
            title: '카드결제',
            scope: $scope,
            buttons: [{
                text: '취소'
            }, {
                text: '<b>결제</b>',
                type: 'button-positive',
                onTap: function(e) {
                    return $scope.amount;
                }
            }, ]
        }).then(function() {
            if($scope.data.amount > 0){
                xSerial.payCard($scope.data.amount,is_cancel,0);
            }
        });
    };

    $scope.doPayCash = function(cash_type){
        $scope.data = {}
        $scope.data.cash_type = cash_type;
        $ionicPopup.show({
            template: ' 임의의 현금영수증을 발행합니다. <input type="number" ng-model="data.amount" autofocus="autofocus" style="color:#FFF;background:transparent;font-size:30px;text-align:center;border-bottom:1px solid #aaa;">',
            title: '현금영수증',
            scope: $scope,
            buttons: [{
                text: '취소'
            }, {
                text: '<b>결제</b>',
                type: 'button-positive',
                onTap: function(e) {
                    return $scope.amount;
                }
            }, ]
        }).then(function() {
            if($scope.data.amount > 0){
                xSerial.payCash($scope.data.amount, $scope.data.cash_type ,0);
            }
        });
    };

    $scope.doCash = function(){
        xSerial.openCash();
    };

    $scope.doConnect = function(){
        $state.go($state.current, {}, {reload: true});
        xSerial.init();
    };
});