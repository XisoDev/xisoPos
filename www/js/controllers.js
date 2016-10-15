xpos
.controller('currentCtrl', function ($scope, $stateParams, MultipleViewsManager, Garage) {
    
    $scope.getGarageList = function(){
        Garage.all().then(function(result){
            if(result.length > 0) {
                $scope.garageList = result;
                $scope.$broadcast('scroll.refreshComplete');
            }
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