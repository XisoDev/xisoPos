xpos
    .controller('configCtrl', function ($scope, $ionicModal, ShopInfo, CarType,$ionicPopup,$cordovaToast) {

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
                if(result.length > 0) $scope.defaultParams = result[0];
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
                if(result.length > 0) $scope.carTypeList = result;
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
            $scope.params = {};
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
            if(!$scope.defaultParams.shop_name) return $ionicPopup.alert({title: '알림',template: '주차장명을 입력하지 않았습니다.'});
            if(!$scope.defaultParams.mobile) return $ionicPopup.alert({title: '알림',template: '휴대전화를 입력하지 않았습니다.'});
            if(!$scope.defaultParams.tel) return $ionicPopup.alert({title: '알림',template: '유선전화를 입력하지 않았습니다.'});
            if(!$scope.defaultParams.fax) return $ionicPopup.alert({title: '알림',template: 'FAX를 입력하지 않았습니다.'});
            if(!$scope.defaultParams.user_name) return $ionicPopup.alert({title: '알림',template: '대표자 명을 입력하지 않았습니다.'});
            if(!$scope.defaultParams.address) return $ionicPopup.alert({title: '알림',template: '주소를 입력하지 않았습니다.'});

            ShopInfo.delete().then(function(res) {
                console.log(res);

                ShopInfo.insert($scope.defaultParams).then(function(res) {
                    $cordovaToast.showShortBottom("저장되었습니다.");
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
            if(!$scope.params.car_type_title) return $ionicPopup.alert({title: '알림',template: '차종명을 입력하지 않았습니다.'});
            if(!$scope.params.minute_free && $scope.params.minute_free!==0) return $ionicPopup.alert({title: '알림',template: '최초 무료시간을 입력하지 않았습니다.'});
            if(!$scope.params.basic_amount && $scope.params.basic_amount!==0) return $ionicPopup.alert({title: '알림',template: '기본요금을 입력하지 않았습니다.'});
            if(!$scope.params.basic_minute && $scope.params.basic_minute!==0) return $ionicPopup.alert({title: '알림',template: '기본시간을 입력하지 않았습니다.'});
            if(!$scope.params.amount_unit && $scope.params.amount_unit!==0) return $ionicPopup.alert({title: '알림',template: '추가요금을 입력하지 않았습니다.'});
            if(!$scope.params.minute_unit && $scope.params.minute_unit!==0) return $ionicPopup.alert({title: '알림',template: '추가요금 단위를 입력하지 않았습니다.'});

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
            if(!$scope.params.car_type_title) return $ionicPopup.alert({title: '알림',template: '차종명을 입력하지 않았습니다.'});
            if(!$scope.params.minute_free && $scope.params.minute_free!==0) return $ionicPopup.alert({title: '알림',template: '최초 무료시간을 입력하지 않았습니다.'});
            if(!$scope.params.basic_amount && $scope.params.basic_amount!==0) return $ionicPopup.alert({title: '알림',template: '기본요금을 입력하지 않았습니다.'});
            if(!$scope.params.basic_minute && $scope.params.basic_minute!==0) return $ionicPopup.alert({title: '알림',template: '기본시간을 입력하지 않았습니다.'});
            if(!$scope.params.amount_unit && $scope.params.amount_unit!==0) return $ionicPopup.alert({title: '알림',template: '추가요금을 입력하지 않았습니다.'});
            if(!$scope.params.minute_unit && $scope.params.minute_unit!==0) return $ionicPopup.alert({title: '알림',template: '추가요금 단위를 입력하지 않았습니다.'});

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