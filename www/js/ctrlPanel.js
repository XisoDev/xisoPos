xpos.controller('PanelCtrl', function ($scope, $state, $ionicModal, $ionicPopup, CarType, Garage, Month, MultipleViewsManager) {

    // 입차버튼 클릭시 체크
    $scope.inCarChk = function(mainField){
        if(!mainField) return $ionicPopup.alert({title: '알림', template: '관리 번호를 입력해주세요'});


        CarType.all().then(function(result){
            if(result.length > 0) {
                $scope.inCar(mainField);
            }else{
                $ionicPopup.alert({title: '알림', template: '등록된 차종이 없습니다.<br>먼저 설정에서 차종을 추가해주세요.'});
            }
        });
    };

    //입차 전 월차 검사
    $scope.inCar = function(mainField){
        $scope.carnum = mainField;

        //디비에서 현재 차번호를 검색하여 월차에 있는지 판단하여 있으면 컨펌을 띄움
        Month.getByCarNum(mainField).then(function(result){
            if(result.length > 1){
                //차량번호가 2개이상일떄
                $scope.monthList = result;

                $ionicPopup.confirm({
                    title: '월차 확인',
                    template: mainField + '로 시작되는 차량번호 2개 이상 있습니다.<br/>어떻게 입차할까요?',
                    cancelText: '월차목록에서 선택',
                    okText: '다른 차량으로 입차'
                }).then(function (res) {
                    if (res) {
                        //다른차량으로 입차시에 차종선택을 띄움
                        $scope.openCartypeList(mainField);
                    } else {
                        //월차로 입차시에 월차 목록을 띄움
                        $scope.openMonthModal();
                    }
                });
            }else if(result.length == 1){
                $ionicPopup.confirm({
                    title: '월차 확인',
                    template: mainField + '은(는) 월차등록된 차량입니다.<br/>어떻게 입차할까요?',
                    cancelText: '월차로 입차',
                    okText: '다른 차량으로 입차'
                }).then(function (res) {
                    if (res) {
                        //다른차량으로 입차시에 차종선택을 띄움
                        $scope.openCartypeList(mainField);
                    } else {
                        //월차로 입차
                        $scope.monthIn(result);
                    }
                });
            }else{
                //월차목록에 없으면 다른 차량으로 입차
                $scope.openCartypeList(mainField);
            }
        },function (err){ console.log(err); });
    };

    //차종 선택되면 입차시킴
    $scope.selectCartype = function(cartype){
        var params = {
            start_date : new Date().getTime(),
            car_num : $scope.carnum,
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
            $state.go($state.current, {}, {reload: true});
            $scope.closeCartypeList();
        }, function (err) {
            console.error(err);
        });
    };

    //월차로 입차시에
    $scope.monthIn = function(month){

    };

    //차종선택 리스트 모달
    $ionicModal.fromTemplateUrl('templates/panel.cartypeList.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalCartypeList = modal;
    });
    $scope.openCartypeList = function(mainField) {

        Garage.getByCarNum(mainField).then(function(result){
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


    // if (MultipleViewsManager.isActive()) {
    //     MultipleViewsManager.updateView('view-message', { messageId: $scope.selectedMessageId });
    // }
    //
    // $scope.changeMessage = function (message) {
    //     $scope.selectedMessageId = message.id;
    //     console.log(MultipleViewsManager.isActive());
    //     if (MultipleViewsManager.isActive()) {
    //         MultipleViewsManager.updateView('view-message', { messageId: message.id });
    //     } else {
    //         $state.go('viewMessage', { messageId: message.id });
    //     }
    // };
});