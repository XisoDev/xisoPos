xpos.controller('PanelCtrl', function ($scope, $state, $ionicModal, $ionicPopup, CarType, Garage, MultipleViewsManager) {

    //입차버튼
    $scope.inCar = function(mainField){
        if(!mainField) return $ionicPopup.alert({title: '알림', template: '관리 번호를 입력해주세요'});

        $scope.carnum = mainField;

        Garage.getByCarNum(mainField).then(function(result){
            if(result){
                $ionicPopup.alert({
                    title: '알림',
                    template: '같은 차번호가 입차되어있습니다.<br/>다른 번호를 입력해주세요.'
                });
            }else{
                $scope.confirmMonth();
            }
        },function(err){
            console.log(err);
        });
        

    };
    $scope.confirmMonth = function(){
        //
        //디비에서 현재 차번호를 검색하여 월차에 있는지 판단하여 있으면 컨펌을 띄움
        //
        if(false) {
            $ionicPopup.confirm({
                title: '월차 확인',
                template: '으로 월차등록된 차량입니다. 그래도 입차할까요?',
                cancelText: '월차로 입차',
                okText: '다른차량으로 입차'
            }).then(function (res) {
                if (res) {
                    //다른차량으로 입차시에 차종선택을 띄움
                    $scope.openCartypeList();
                } else {
                    alert('월차로 입차');
                }
            });
        }
        else{
            $scope.openCartypeList();
        }
    };

    //차종 선택되면 입차시킴
    $scope.selectCartype = function(){

        // console.log($scope.carnum);
        // console.log($scope.selectedCartype);
        var cartype = $scope.selectedCartype;

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
            document.location.href="/";
        }, function (err) {
            console.error(err);
        });
    };

    //월차로 입차시에
    $scope.monthIn = function(){

    };

    //차종선택 리스트 모달
    $ionicModal.fromTemplateUrl('templates/panel.cartypeList.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalCartypeList = modal;
    });
    $scope.openCartypeList = function() {
        CarType.all().then(function(result){
            if(result.length > 0) $scope.carTypeList = result;
        });

        $scope.modalCartypeList.show();
    };
    $scope.closeCartypeList = function() {
        $scope.modalCartypeList.hide();
        $scope.selectedCartype = '';
    };

    $scope.showCartypeDetail = function(cartype){
       $scope.selectedCartype = cartype;
    };
    $scope.cancelCartype = function(){
      $scope.selectedCartype = '';
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