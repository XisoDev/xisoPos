//-------------------
// 지정주차
//-------------------
xpos.controller('cooperCtrl', function ($scope, $state, $stateParams, $ionicModal, $ionicPopup, Cooper, Garage, MultipleViewsManager) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.cooper'){
            $scope.initCooper();
        }
    });

    $scope.initCooper = function(){
        $scope.status = 'cooper';
        $scope.getCooperList();
    };
    $scope.changeStatus = function(stat){
        $scope.status = stat;   //cooper, period, day
        switch(stat){
            case 'period':
                $scope.gParams = {};
                $scope.gParams.start_date = getStartEndDate().start_date;
                $scope.gParams.end_date = getStartEndDate().end_date;
                $scope.getGarageList();
                break;
            case 'day':
                $scope.gParams = {};
                $scope.gParams.start_date = new Date();
                $scope.getGarageList();
                break;
            default:
                $scope.getCooperList();
        }
    };

    $scope.refresh = function(){
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.getCooperList = function(){
        Cooper.all().then(function(result){
            if(result.length > 0) $scope.cooperList = result;
        });

    };

    $scope.getGarageList = function(){
        $scope.garageList = {};
        Garage.allForCooper($scope.gParams).then(function(result){
            if(result.length > 0) $scope.garageList = result;
        });
    };

    //업체 추가 Modal
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


});