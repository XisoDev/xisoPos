xpos.controller('PanelCtrl', function ($scope, $state, $ionicPopup, xSerial, xisoService) {

    $scope.xiso = xisoService;
    $scope.xiso.init($scope);

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