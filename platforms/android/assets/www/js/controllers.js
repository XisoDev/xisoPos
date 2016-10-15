xpos
.controller('currentCtrl', function ($scope, $stateParams, MultipleViewsManager) {

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