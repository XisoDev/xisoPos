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
    
.controller('monthCtrl', function ($scope, $state,$stateParams,$ionicModal,$ionicPopup, Month,MultipleViewsManager, xSerial) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.month'){
            $scope.initMonth();
        }
    });

    $scope.initMonth = function(){
        Month.all().then(function(result){
            if(result.length > 0) $scope.monthList = result;
        });
    };

    //월차 추가 모달
    $ionicModal.fromTemplateUrl('templates/month.addmonth.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalMonth = modal;
    });
    $scope.openAddMonth = function(){
        $scope.params = {};
        $scope.temp_start_date = new Date();
        $scope.temp_end_date = new Date(Date.parse($scope.temp_start_date) + 30 * 1000 * 60 * 60 * 24);

        $scope.modalMonth.show();
    };
    $scope.closeMonth = function(){
        $scope.params = {};
        $scope.modalMonth.hide();
    };

    $scope.openEditMonth = function(month){
        $scope.params = month;
        $scope.temp_start_date = new Date(month.start_date);
        $scope.temp_end_date = new Date(month.end_date);

        $scope.modalMonth.show();
    };

    //월차 등록, 수정
    $scope.insertMonth = function(){
        var start_date = angular.copy($scope.temp_start_date);
        var end_date  = angular.copy($scope.temp_end_date);

        $scope.params.start_date = getStartDate(start_date);    //시작일 00:00:00
        $scope.params.end_date = getEndDate(end_date);          //종료일 23:59:59

        if(!$scope.params.car_num) return $ionicPopup.alert({title: '알림',template: '차량번호를 입력하지 않았습니다.'});
        if(!$scope.params.car_name) return $ionicPopup.alert({title: '알림',template: '차종을 입력하지 않았습니다.'});
        if(!$scope.params.car_type_title) return $ionicPopup.alert({title: '알림',template: '구분을 입력하지 않았습니다.'});
        if(!$scope.params.start_date) return $ionicPopup.alert({title: '알림',template: '시작날짜를 입력하지 않았습니다.'});
        if(!$scope.params.end_date) return $ionicPopup.alert({title: '알림',template: '종료날짜를 입력하지 않았습니다.'});
        if($scope.params.start_date >= $scope.params.end_date)
            return $ionicPopup.alert({title: '알림',template: '시작날짜가 종료날짜보다 크거나 같을 수 없습니다.'});
        if(!$scope.params.amount) return $ionicPopup.alert({title: '알림',template: '월차금액을 입력하지 않았습니다.'});
        if(!$scope.params.user_name) return $ionicPopup.alert({title: '알림',template: '차주명을 입력하지 않았습니다.'});
        if(!$scope.params.mobile) return $ionicPopup.alert({title: '알림',template: '연락처를 입력하지 않았습니다.'});

        if(!$scope.params.idx) {
            Month.insert($scope.params).then(function (res) {
                console.log("insertId: " + res.insertId);
                $state.go($state.current, {}, {reload: true});
                $scope.closeMonth();
            }, function (err) {
                console.log(err);
            });
        }else{
            Month.update($scope.params).then(function(res){
                $state.go($state.current, {}, {reload: true});
                $scope.closeMonth();
            },function(err){
                console.log(err);
            });
        }
    };

    $scope.initMonthModal = function(){
        console.log('month modal initialized');
    };

    // $scope.serial_test = function(){
    //     xSerial.openCash();
    // };

})
    
.controller('cooperCtrl', function ($scope, $state, $stateParams, $ionicModal, $ionicPopup, Cooper, MultipleViewsManager) {
    $scope.initCooper = function(){
        $scope.getCooperList();
    };
    $scope.getCooperList = function(){
        Cooper.all().then(function(result){
            if(result.length > 0) $scope.cooperList = result;
        });

    };

    //업체 추가 모달
    $ionicModal.fromTemplateUrl('templates/cooper.addcooper.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalCooper = modal;
    });
    $scope.openAddCooper = function(){
        $scope.params = {};

        $scope.modalCooper.show();
    };
    $scope.closeCooper = function(){
        $scope.params = {};
        $scope.modalCooper.hide();
    };

    $scope.openEditCooper = function(cooper){
        $scope.params = cooper;

        $scope.modalCooper.show();
    };


    //지정주차 등록, 수정
    $scope.insertCooper = function(){

        if(!$scope.params.coop_title) return $ionicPopup.alert({title: '알림',template: '업체명을 입력하지 않았습니다.'});
        if(!$scope.params.coop_tel) return $ionicPopup.alert({title: '알림',template: '전화번호를 입력하지 않았습니다.'});
        if(!$scope.params.coop_address) return $ionicPopup.alert({title: '알림',template: '주소를 입력하지 않았습니다.'});
        if(!$scope.params.coop_user_name) return $ionicPopup.alert({title: '알림',template: '대표자 명을 입력하지 않았습니다.'});
        if(!$scope.params.minute_free && $scope.params.minute_free!==0) return $ionicPopup.alert({title: '알림',template: '무료 시간을 입력하지않았습니다.'});
        if(!$scope.params.minute_max && $scope.params.minute_max!==0) return $ionicPopup.alert({title: '알림',template: '최대 지원 시간을 입력하지않았습니다.'});
        if(!$scope.params.amount_unit && $scope.params.amount_unit!==0) return $ionicPopup.alert({title: '알림',template: '추가요금을 입력하지않았습니다.'});
        if(!$scope.params.minute_unit && $scope.params.minute_unit!==0) return $ionicPopup.alert({title: '알림',template: '추가요금 단위를 입력하지않았습니다.'});

        if(!$scope.params.idx){
            Cooper.insert($scope.params).then(function(res){
                console.log("insertId: " + res.insertId);
                $state.go($state.current, {}, {reload: true});
                $scope.closeCooper();
            },function(err){
                console.log(err);
            });
        }else{
            Cooper.update($scope.params).then(function(res){
                $state.go($state.current, {}, {reload: true});
                $scope.closeCooper();
            },function(err){
                console.log(err);
            });
        }
    };
})
    
.controller('calcuCtrl', function ($scope, $stateParams, MultipleViewsManager) {

});