xpos
    .controller('configCtrl', function ($scope, $ionicModal, ShopInfo, CarType,$ionicPopup) {

        $scope.initConfigParams = function(){
            $scope.defaultParams = {};
            $scope.defaultParams.shop_name = "";
            $scope.defaultParams.mobile = "";
            $scope.defaultParams.tel = "";
            $scope.defaultParams.fax = "";
            $scope.defaultParams.user_name = "";
            $scope.defaultParams.address = "";
        };
        $scope.initConfigDefault = function(){
            $scope.initConfigParams();

            ShopInfo.all().then(function(result){
                if(result) $scope.defaultParams = result[0];
            });
            console.log('Shop Info loaded!!');
        };

        $scope.initCartypeParams = function(){
            $scope.carTypeList = {};
            $scope.params = {};
        };
        $scope.initCartype = function(){
            $scope.initCartypeParams();

            CarType.all().then(function(result){
                if(result) $scope.carTypeList = result;
            });

            console.log('Car Type loaded!!');
        };

        $scope.shouldShowDelete = false;
        $scope.showDelete = function(){
            $scope.shouldShowDelete = true;
        }
        $scope.hideDelete = function(){
            $scope.shouldShowDelete = false;
        }

        $ionicModal.fromTemplateUrl('templates/config.addcartype.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.addCartypeWindow = modal;
        });
        $scope.openCartype = function() {
            $scope.addCartypeWindow.show();
        };
        $scope.closeCartype = function() {
            $scope.initCartype();
            $scope.addCartypeWindow.hide();
        };
        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.addCartypeWindow.remove();
        });
        // Execute action on hide modal
        $scope.$on('addCartypeWindow.hidden', function() {
            console.log('hidden cartype');
        });
        // Execute action on remove modal
        $scope.$on('addCartypeWindowZ.removed', function() {
            console.log('removed cartype');
        });

        $scope.insertShopInfo = function(){
            ShopInfo.delete().then(function(res) {
                console.log(res);

                ShopInfo.insert($scope.defaultParams).then(function(res) {
                    // console.log("insertId: " + res.insertId);
                    $scope.initConfigDefault();
                }, function (err) {
                    console.error(err);
                });
            }, function (err) {
                console.error(err);
            });
        };
        
        $scope.insertCartype = function(){
            CarType.insert($scope.params).then(function(res) {
                console.log("insertId: " + res.insertId);

                $scope.closeCartype();
                $scope.initCartype();
            }, function (err) {
                console.error(err);
            });
        };

        $scope.openUpdateCartype = function(cartype){
            $scope.openCartype();
            $scope.params = cartype;
        };

        $scope.updateCartype = function(){
            CarType.update($scope.params).then(function(res){
                $scope.closeCartype();
                $scope.initCartype();
            }, function (err) {
                console.error(err);
            });
            console.log('updateCarType');
        };

        $scope.deleteCartype = function(idx){
            var confirmPopup = $ionicPopup.confirm({
                title: '차종 삭제 확인',
                template: '정말로 삭제 하시겠습니까?'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    CarType.delete(idx).then(function(res){
                        $scope.initCartype();
                    }, function (err) {
                        console.error(err);
                    });
                }
            });
        };
    });