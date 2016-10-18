xpos
//입차목록
.controller('currentCtrl', function ($scope, $stateParams, $ionicModal, MultipleViewsManager, $cordovaToast, Garage) {
    $scope.garage = '';
    
    $scope.getGarageList = function(){
        Garage.current().then(function(result){
            if(result.length > 0) {
                $scope.garageList = result;
                $scope.$broadcast('scroll.refreshComplete');
            }
        });
    };

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
    
    $scope.outCar = function(garage){
        //
        // 이 구문 전체는 결제 프로세스 이후에 동작해야함
        //
        Garage.outCar(garage.idx).then(function(res){
            $cordovaToast.showShortBottom('차량번호 [ '+ garage.car_num +' ]의 출차가 완료 되었습니다');
            $scope.closeGarageView();
            $scope.getGarageList();
        },function(err){
            console.log(err);
        });
    };

    $scope.cancelCar = function(garage){
        Garage.cancelCar(garage.idx).then(function(res){
            $cordovaToast.showShortBottom('차량번호 [ '+ garage.car_num +' ]의 입차취소가 완료 되었습니다');
            $scope.closeGarageView();
            $scope.getGarageList();
        },function(err){
            console.log(err);
        });
    };
})
    
.controller('historyCtrl', function ($scope, $stateParams, MultipleViewsManager) {

})
    
.controller('monthCtrl', function ($scope, $stateParams, MultipleViewsManager, xSerial) {

    $scope.serial_test = function(){
        xSerial.openCash();
    };

})
    
.controller('cooperCtrl', function ($scope, $stateParams, MultipleViewsManager) {

})
    
.controller('calcuCtrl', function ($scope, $stateParams, MultipleViewsManager) {

});