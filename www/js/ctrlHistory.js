//-------------------
//입출차기록
//-------------------
xpos.controller('historyCtrl', function ($scope, $state, $stateParams, $ionicModal, Garage, $ionicPopup, $cordovaToast, xSerial, Payment, MultipleViewsManager) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.history'){
            $scope.initHistory();
        }
    });

    $scope.initHistory = function(){
        $scope.status = 'all';
        $scope.search = {};
        $scope.offset = 0;
        $scope.moredata = false; //추가로드 여부
        $scope.getGarageList(false);
    };

    // 탭 변경
    $scope.changeStatus = function(stat){
        $scope.status = stat;   //all, in, out, no_pay, cancel
        $scope.search = {};
        switch(stat){
            case 'in':  //입차중
                $scope.search.is_out = 'N';
                $scope.search.is_cancel = 'N';
                break;
            case 'out': //정상출차
                $scope.search.is_out = 'Y';
                $scope.search.is_cancel = 'N';
                $scope.search.is_paid = 'Y';
                break;
            case 'no_pay':  //미결제
                $scope.search.is_out = 'Y';
                $scope.search.is_paid = 'N';
                break;
            case 'cancel':  //입차취소
                $scope.search.is_cancel = 'Y';
                break;
        }
    };

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

    // 할인하기 Modal
    $ionicModal.fromTemplateUrl('templates/payment.discount.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalDcInput = modal;
    });
    $scope.openDcInput = function(garage){
        $scope.payGarage = garage;  //출차버튼 누른순간부터 가지고 있음 (출차시간과 총금액이 만들어져있음)
        $scope.payGarage.dc_money = 0;    //할인금액 기본값세팅
        $scope.modalDcInput.show();
    };
    $scope.closeDcInput = function(){
        $scope.modalDcInput.hide();
    };

    // 결제하기 Modal
    $ionicModal.fromTemplateUrl('templates/payment.input.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalPayInput = modal;
    });
    $scope.openPayInput = function(){
        var pay_money = onum($scope.payGarage.total_amount) - onum($scope.payGarage.pay_amount) - onum($scope.payGarage.discount_cooper) - onum($scope.payGarage.discount_self);
        $scope.payGarage.pay_money = pay_money; //결제할 금액 세팅

        $scope.closeGarageView();
        $scope.modalPayInput.show();
    };
    $scope.closePayInput = function(){
        $scope.modalPayInput.hide();
    };

    // 결제취소 Modal - (상세정보 Modal - 결제 취소 버튼)
    $ionicModal.fromTemplateUrl('templates/payment.cancel.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalPayCancel = modal;
    });
    $scope.openPayCancel = function(garage){
        console.log(garage);
        Payment.allForGarage(garage).then(function(result){
            if(result.length > 0) $scope.payList = result;

            $scope.modalPayCancel.show();
        },function(err){console.log(err);});
    };
    $scope.closePayCancel = function(){
        $scope.modalPayCancel.hide();
    };

    //입출차 목록 불러오기
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

    //당겨서 새로고침
    $scope.refresh = function(){
        $scope.offset = 0;
        $scope.moredata = false;
        $scope.getGarageList(false);
    };
    //스크롤 내릴시 Load More
    $scope.loadMore = function(){
        $scope.getGarageList(true);
    };

    // 상세정보 Modal - 출차 버튼
    $scope.outCar = function(garage){
        // 월차 일땐 바로 출차처리
        if(garage.month_idx > 0) return $scope.monthOutCar(garage);

        var tempGarage = angular.copy(garage);
        if(tempGarage.is_out=='N') {
            tempGarage.end_date = new Date().getTime();
            tempGarage.total_amount = cal_garage(tempGarage);
        }

        $scope.closeGarageView();
        $scope.openDcInput(tempGarage);    // 할인 modal
    };

    // 월차일때 바로 출차
    $scope.monthOutCar = function(garage){
        var tempGarage = angular.copy(garage);
        tempGarage.end_date = new Date().getTime();
        $scope.procOutCar(tempGarage);
    };

    // 출차 프로세스 (DB에서 출차처리)
    $scope.procOutCar = function(garage){
        Garage.outCar(garage).then(function(res){
            $cordovaToast.showShortBottom('차량번호 [ '+ garage.car_num +' ]의 출차가 완료 되었습니다');
            $state.go($state.current, {}, {reload: true});
            $scope.closeGarageView();
            $scope.closePayInput(); //혹시 열려있을 결제 Modal 닫음
            $scope.initCurrent();
        },function(err){
            console.log(err);
        });
    };

    // 상세정보 Modal - 입차 취소 버튼
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

    // 상세정보 Modal - 영수증 재출력 버튼
    $scope.rePrint = function(garage){
        var date = getHanDate(garage.start_date);   //"2016년 10월 13일 목요일"
        var time = getHanTime(garage.start_date);   //"11시 50분"
        var carnum = garage.car_num;
        var srl = garage.idx;
        var message = "* 오늘도 좋은 하루 되세요.";
        message += "\r\n* 협력업체 방문시 뒷면에 꼭 도장을 받아주세요.";
        message += "\r\n* 영수중 분실시 차량출고가 불가 할 수 있습니다.";
        xSerial.doPrint(date,time,carnum,srl,message);
    };

    // 상세정보 Modal - 출차 취소 버튼
    $scope.cancelOutCar = function(garage){
        Garage.cancelOutCar(garage).then(function(res){
            $cordovaToast.showShortBottom('차량번호 [ '+ garage.car_num +' ]의 출차취소가 완료 되었습니다');
            $scope.closeGarageView();
            $state.go($state.current, {}, {reload: true});
        },function(err){console.log(err);});
    };

    // 할인Modal - 임의 할인 버튼
    $scope.selfDc = function(){
        if(!$scope.payGarage.dc_money || $scope.payGarage.dc_money == 0) return $ionicPopup.alert({title:'알림',template:'할인 금액을 입력해주세요.'});
        if($scope.payGarage.dc_money > $scope.payGarage.total_amount) return $ionicPopup.alert({title:'알림',template:'할인 금액이 총 금액 보다 큽니다.'});

        $ionicPopup.confirm({
            title: '할인금액 '+ $scope.payGarage.dc_money.num_format() +'원',
            template: $scope.payGarage.dc_money.num_format() +'원을 할인하시겠습니까?'
        }).then(function (res) {
            if(res){    //ok
                Garage.selfDiscount($scope.payGarage).then(function(res2){
                    if(res2) {
                        $scope.payGarage.discount_self = $scope.payGarage.discount_self + $scope.payGarage.dc_money;
                        $state.go($state.current, {}, {reload: true});

                        $cordovaToast.showShortBottom('임의 할인이 적용되었습니다');

                        $scope.closeDcInput();  //현재 modal 닫음
                        $scope.openPayInput();  //결제화면으로 넘김
                    }
                });
            }
        });
    };

    // 할인Modal - 지정 할인 버튼
    $scope.cooperDc = function(){
        $scope.closeDcInput();  //현재 modal 닫음
        $scope.openCooper();
    };

    // 할인Modal - 바로 결제 버튼
    $scope.skipDc = function(){
        $scope.closeDcInput();  //현재 modal 닫음
        $scope.openPayInput();  //결제화면으로 넘김
    };

    // 결제Modal - 카드 결제 버튼
    $scope.doCard = function(payGarage){
        $ionicPopup.confirm({
            title: '카드 결제',
            template: payGarage.pay_money.num_format() + '원을 카드 결제 하시겠습니까?'
        }).then(function (res) {
            if(res){
                var params = {
                    lookup_idx: payGarage.idx,
                    lookup_type: 'garage',
                    pay_type: 'card',
                    pay_amount: payGarage.pay_money,
                    return_data: ''
                };

                // 먼저 저장하고?
                Payment.insert(params).then(function(res2){
                    console.log("insertId: " + res2.insertId);
                    //결제 처리?

                    //실패하면 update? delete?

                    // 결제 처리 잘되면 출차
                    $scope.procOutCar(payGarage);
                });


            }
        });
    };

    // 결제Modal - 현금 결제 버튼
    $scope.doCash = function(payGarage){
        $ionicPopup.confirm({
            title: '현금 결제',
            template: payGarage.pay_money.num_format() + '원을 현금 결제 하시겠습니까?'
        }).then(function (res) {
            if(res){
                var params = {
                    lookup_idx: payGarage.idx,
                    lookup_type: 'garage',
                    pay_type: 'cash',
                    pay_amount: payGarage.pay_money,
                    return_data: ''
                };

                // 먼저 저장하고?
                Payment.insert(params).then(function(res2){
                    console.log("insertId: " + res2.insertId);
                    //결제 처리?

                    //실패하면 update? delete?

                    // 결제 처리 잘되면 출차
                    $scope.procOutCar(payGarage);
                });


            }
        });
    };

    // 결제Modal - 출차 처리 버튼
    $scope.forceOut = function(payGarage){
        $ionicPopup.confirm({
            title: '출차',
            template: '출차 하시겠습니까?'
        }).then(function (res) {
            if(res){
                $scope.procOutCar(payGarage);
            }
        });
    };

    // 결체 취소 리스트에서 선택했을때 DB에서 결제취소
    $scope.procPayCancel = function(pay){
        Payment.cancelPay(pay).then(function(res){
            if(pay.pay_type == 'card'){
                //카드일때 카드 처리

            }else{
                //현금일때 돈통 열어줌
            }
        });
        $scope.closePayCancel();
    };
});