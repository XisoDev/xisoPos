//-------------------
//입차목록
//-------------------
xpos.controller('currentCtrl', function ($scope, $state, $stateParams, $ionicModal, $ionicPopup, MultipleViewsManager, $cordovaToast, Garage, xSerial, Cooper, Payment, xisoService) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.current'){
            $scope.initCurrent();
        }
    });

    $scope.xiso = xisoService;
    $scope.xiso.init($scope);

    //입차목록 초기화
    $scope.initCurrent = function(){
        $scope.garage = '';
        $scope.offset = 0;
        $scope.moredata = false;
        $scope.getGarageList(false);
    };

    // 상세정보 Modal
    $scope.openGarageView = function(garage){
        $scope.xiso.setGarage(garage);
        $scope.xiso.mdGarageView.show();
    };

    // 할인하기 Modal
    $scope.openDcInput = function(garage){
        $scope.payGarage = garage;  //출차버튼 누른순간부터 가지고 있음 (출차시간과 총금액이 만들어져있음)
        $scope.payGarage.dc_money = 0;    //할인금액 기본값세팅
        $scope.modalDcInput.show();
    };
    $scope.closeDcInput = function(){
        $scope.modalDcInput.hide();
    };

    // 결제하기 Modal
    $scope.openPayInput = function(){
        var pay_money = onum($scope.payGarage.total_amount) - onum($scope.payGarage.pay_amount) - onum($scope.payGarage.discount_cooper) - onum($scope.payGarage.discount_self);
        $scope.payGarage.pay_money = pay_money; //결제할 금액 세팅

        $scope.modalPayInput.show();
    };
    $scope.closePayInput = function(){
        $scope.modalPayInput.hide();
    };

    // 지정할인 리스트 Modal
    $ionicModal.fromTemplateUrl('templates/payment.cooper.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalCooperList = modal;
    });
    $scope.openCooper = function(){
        Cooper.current().then(function(result){
            if(result.length > 0) $scope.cooperList = result;
        });
        // var pay_money = onum($scope.payGarage.total_amount) - onum($scope.payGarage.pay_amount) - onum($scope.payGarage.discount_cooper) - onum($scope.payGarage.discount_self);
        // $scope.payGarage.pay_money = pay_money; //결제할 금액 세팅

        $scope.modalCooperList.show();
    };
    $scope.closeCooper = function(){
        $scope.modalCooperList.hide();
    };
    
    //입차목록 리스트 불러오기
    $scope.getGarageList = function(is_load_more){
        var limit = 100;

        Garage.allForCurrent(limit, $scope.offset).then(function(result){
            if(result.length > 0) {
                if(!is_load_more) {
                    $scope.garageList = result;
                }else{
                    for(var key in result) {
                        $scope.garageList.push(result[key]);
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
        tempGarage.end_date = new Date().getTime();
        tempGarage.total_amount = cal_garage(tempGarage);

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
                    $scope.initCurrent();
                },function(err){
                    console.log(err);
                });
            }else{

            }
        });

    };
    
    // 상세정보 Modal - 영수증 재출력 버튼
    $scope.rePrint = function(garage){
        
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

    $scope.procCooperDc = function(coop){
        console.log(coop);
        console.log($scope.payGarage);
        // garage 재세팅
        // cooper_idx
        // discount_cooper 이거 계산하는거 물어보고 해야됨


        // DB에 garage update 완료되면 결제 화면으로 넘어감
        $scope.closeCooper();
        $scope.openPayInput();
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
});







