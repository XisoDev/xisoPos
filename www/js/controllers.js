xpos
//입차목록
.controller('currentCtrl', function ($scope, $stateParams, $ionicModal, $ionicPopup, MultipleViewsManager, $cordovaToast, Garage) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.current'){
            $scope.initCurrent();
        }
    });

    $ionicModal.fromTemplateUrl('templates/garage_view.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalGarageView = modal;
    });

    $scope.openGarageView = function(garage){
        $scope.garage = garage;
        $scope.modalGarageView.show();
    };
    $scope.closeGarageView = function(){
        $scope.modalGarageView.hide();
    };

    $scope.initCurrent = function(){
        $scope.garage = '';
        $scope.getGarageList();
        // console.log('current page initialized!!');
    };
    
    $scope.getGarageList = function(){

        Garage.current().then(function(result){
            if(result.length > 0) {
                $scope.garageList = result;
                $scope.$broadcast('scroll.refreshComplete');
            }
        });
    };
    
    $scope.outCar = function(garage){
        var tempGarage = angular.copy(garage);
        tempGarage.end_date = new Date().getTime();
        tempGarage.total_amount = cal_garage(tempGarage);
        $ionicPopup.confirm({
            title: '출차 - '+tempGarage.car_num,
            template: '요금 : '+ tempGarage.total_amount +' 원<br/>출차시간 : ' + formatted_date(new Date(tempGarage.end_date)) + '<br/>출차 하시겠습니까?'
        }).then(function (res) {
            if(res){
                //
                // 이 구문 전체는 결제 프로세스 이후에 동작해야함
                //
                Garage.outCar(tempGarage).then(function(res){
                    $cordovaToast.showShortBottom('차량번호 [ '+ tempGarage.car_num +' ]의 출차가 완료 되었습니다');
                    $scope.closeGarageView();
                    $scope.getGarageList();
                },function(err){
                    console.log(err);
                });
            }else{

            }
        });

        
    };

    $scope.cancelCar = function(garage){
        var tempGarage = angular.copy(garage);
        tempGarage.end_date = new Date().getTime();
        $ionicPopup.confirm({
            title: '입차 취소 - '+tempGarage.car_num,
            template: '취소시간 : ' + formatted_date(new Date(tempGarage.end_date)) + '<br/>취소 하시겠습니까?'
        }).then(function (res) {
            if(res){
                Garage.cancelCar(tempGarage).then(function(res){
                    $cordovaToast.showShortBottom('차량번호 [ '+ tempGarage.car_num +' ]의 입차취소가 완료 되었습니다');
                    $scope.closeGarageView();
                    $scope.getGarageList();
                },function(err){
                    console.log(err);
                });
            }else{

            }
        });

    };
})
    
.controller('historyCtrl', function ($scope, $stateParams, $ionicModal, Garage, MultipleViewsManager) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.history'){
            $scope.initHistory();
        }
    });

    $ionicModal.fromTemplateUrl('templates/garage_view.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalGarageView = modal;
    });

    $scope.openGarageView = function(garage){
        $scope.garage = garage;
        $scope.modalGarageView.show();
    };
    $scope.closeGarageView = function(){
        $scope.modalGarageView.hide();
    };
    
    $scope.initHistory = function(){
        $scope.status = 'all';  //all, in, out, no_pay, cancel

        $scope.getGarageList();
        // console.log('history page initialized!!');
    };

    $scope.getGarageList = function(){
        Garage.allForHistory().then(function(result){
            if(result.length > 0) {
                $scope.garageList = result;
                $scope.$broadcast('scroll.refreshComplete');
            }
        });
    };

    $scope.changeStatus = function(stat){
        $scope.status = stat;
    };
})
    
.controller('monthCtrl', function ($scope, $stateParams,$ionicModal, MultipleViewsManager, xSerial) {
    $ionicModal.fromTemplateUrl('templates/month.addmonth.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalMonth = modal;
    });
    $scope.openMonth = function(){
        $scope.params = {};
        // $scope.params.start_date = new Date().toDateInputValue();
        // $scope.params.end_date = new Date().toDateInputValue();
        $scope.modalMonth.show();
        // console.log(new Date().toDateInputValue());
    };
    $scope.closeMonth = function(){
        $scope.modalMonth.hide();
    };


    $scope.initMonthModal = function(){
        console.log('month modal initialized');
    };

    // $scope.serial_test = function(){
    //     xSerial.openCash();
    // };

})
    
.controller('cooperCtrl', function ($scope, $stateParams, MultipleViewsManager) {

})
    
.controller('calcuCtrl', function ($scope, $stateParams, MultipleViewsManager) {

});