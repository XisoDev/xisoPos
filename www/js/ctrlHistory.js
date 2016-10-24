//-------------------
//입출차기록
//-------------------
xpos.controller('historyCtrl', function ($scope, $state, $stateParams, $ionicModal, Garage, $ionicPopup, $cordovaToast, xSerial, MultipleViewsManager) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.history'){
            $scope.initHistory();
        }
    });

    // 상세정보 Modal
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
        $scope.status = 'all';
        $scope.search = {};
        $scope.offset = 0;
        $scope.moredata = false; //추가로드 여부
        $scope.getGarageList(false);
        // console.log('history page initialized!!');
    };

    $scope.getGarageList = function(is_load_more){
        var limit = 100;

        Garage.allForHistory(limit, $scope.offset).then(function(result){
            if(result.length > 0) {
                for (var key in result) {
                    if (result[key].month_idx > 0) {  //월차차량은 내부적으로 결제됨으로 저장(월차로 표시)
                        result[key].is_paid = 'Y';
                    } else if (result[key].pay_amount < (result[key].total_amount - result[key].discount_cooper - result[key].discount_self)) {
                        //결제 금액 < (총 요금 - 지정주차할인 - 셀프할인)
                        result[key].is_paid = 'N';
                    } else if (!result[key].end_date) {
                        //출차 하기 전엔 결제를 할수 없으므로
                        result[key].is_paid = 'N';
                    } else {
                        result[key].is_paid = 'Y';
                    }
                }

                if(!is_load_more) {
                    //추가 로드가 아닐때
                    $scope.garageList = result;
                }else{
                    //추가 로드일때
                    for(var key in result) {
                        $scope.garageList.push(result[key]);    // 기존 배열에 추가
                    }
                }
                $scope.offset += limit;
                $scope.moredata = true;
            }else{
                $scope.moredata = false;    // 더이상 추가로드 할게 없음
            }
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    $scope.refresh = function(){
        $scope.offset = 0;
        $scope.moredata = false;
        $scope.getGarageList(false);
    };

    $scope.loadMore = function(){
        $scope.getGarageList(true);
    };

    // 탭 변경
    $scope.changeStatus = function(stat){
        $scope.status = stat;   //all, in, out, no_pay, cancel
        $scope.search = {};
        switch(stat){
            case 'in':
                $scope.search.is_out = 'N';
                $scope.search.is_cancel = 'N';
                break;
            case 'out':
                $scope.search.is_out = 'Y';
                $scope.search.is_cancel = 'N';
                break;
            case 'no_pay':
                $scope.search.is_paid = 'N';
                break;
            case 'cancel':
                $scope.search.is_cancel = 'Y';
                break;
        }
    };

    // 상세정보 Modal - 출차 버튼
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
                Garage.outCar(tempGarage).then(function(res2){
                    $cordovaToast.showShortBottom('차량번호 [ '+ tempGarage.car_num +' ]의 출차가 완료 되었습니다');
                    $scope.closeGarageView();
                    $scope.refresh();
                },function(err){
                    console.log(err);
                });
            }else{

            }
        });
    };

    // 상세정보 Modal - 입차취소 버튼
    $scope.cancelCar = function(garage){
        var tempGarage = angular.copy(garage);
        tempGarage.end_date = new Date().getTime();
        $ionicPopup.confirm({
            title: '입차 취소 - '+tempGarage.car_num,
            template: '취소시간 : ' + formatted_date(new Date(tempGarage.end_date)) + '<br/>취소 하시겠습니까?'
        }).then(function (res) {
            if(res){
                Garage.cancelCar(tempGarage).then(function(res2){
                    $cordovaToast.showShortBottom('차량번호 [ '+ tempGarage.car_num +' ]의 입차취소가 완료 되었습니다');
                    $scope.closeGarageView();
                    $scope.refresh();
                },function(err){
                    console.log(err);
                });
            }else{

            }
        });

    };



    // 상세정보 Modal - 출차 취소 버튼
    $scope.cancelOutCar = function(garage){
        Garage.cancelOutCar(garage).then(function(res){
            $cordovaToast.showShortBottom('차량번호 [ '+ garage.car_num +' ]의 출차취소가 완료 되었습니다');
            $scope.closeGarageView();
            $state.go($state.current, {}, {reload: true});
        },function(err){console.log(err);});
    };
});