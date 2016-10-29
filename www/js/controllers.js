//-------------------
// 패널
//-------------------
xpos.controller('PanelCtrl', function ($scope, $state, $ionicPopup, xisoService, $cordovaToast, Payment) {

    $scope.xiso = xisoService;
    $scope.xiso.init($scope);

    $scope.doCard = function(){
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
                type: 'button-positive'
            }]
        }).then(function() {
            if($scope.data.amount > 0){
                $scope.xiso.payCard(0, 'temp', $scope.data.amount, 'temp');
            }else{
                $cordovaToast.showLongBottom('결제 금액을 정확히 입력해주세요.');
            }
        });
    };
    
    $scope.cancelCard = function(){
        // 임의 결제 리스트 Modal을 띄운담에 골라서 취소
        $scope.xiso.openPayCancel('temp');
    };

    $scope.doPayCash = function(cash_type){
        $scope.data = {};
        $scope.data.cash_type = cash_type;
        $ionicPopup.show({
            template: ' 임의의 현금영수증을 발행합니다. <input type="number" ng-model="data.amount" autofocus="autofocus" style="color:#FFF;background:transparent;font-size:30px;text-align:center;border-bottom:1px solid #aaa;">',
            title: '현금영수증',
            scope: $scope,
            buttons: [{
                text: '취소'
            }, {
                text: '<b>결제</b>',
                type: 'button-positive'
            }]
        }).then(function() {
            if($scope.data.amount > 0){
                $scope.xiso.payCash($scope.data.amount, $scope.data.cash_type ,0);
            }
        });
    };

    $scope.doConnect = function(){
        $state.go($state.current, {}, {reload: true});
        $scope.xiso.initX();
    };
})

//-------------------
// 입차목록
//-------------------
.controller('currentCtrl', function ($scope, $state, $stateParams, Garage, xisoService) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.current'){
            $scope.initCurrent();
        }
    });

    setTimeout(function(){
        $scope.initCurrent();
        $scope.xiso = xisoService;
        $scope.xiso.init($scope);
    },1000);

    //입차목록 초기화
    $scope.initCurrent = function(){
        $scope.offset = 0;
        $scope.moredata = false;
        $scope.getGarageList(false);
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
})

//-------------------
//입출차기록
//-------------------
.controller('historyCtrl', function ($scope, $state, $stateParams, Garage, xisoService) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.history'){
            $scope.initHistory();
        }
    });

    setTimeout(function(){
        $scope.xiso = xisoService;
        $scope.xiso.init($scope);
        $scope.initHistory();
    },1000);

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
                $scope.search.is_cancel = 'N';
                $scope.search.is_paid = 'N';
                break;
            case 'cancel':  //입차취소
                $scope.search.is_cancel = 'Y';
                break;
        }
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

})

//-------------------
// 월차
//-------------------
.controller('monthCtrl', function ($scope, $state,$stateParams,$ionicModal,$ionicPopup, Month, $compile, uiCalendarConfig, xisoService, Payment, $cordovaToast) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.month'){
            $scope.initMonth();
        }
    });

    $scope.eventSources = [];

    setTimeout(function(){
        $scope.initMonth();
        $scope.xiso = xisoService;
        $scope.xiso.dates = {};
    },1000);

    $scope.initMonth = function(){
        $scope.status = 'all';
        $scope.search = {};
        $scope.search.is_expired = 'N';

        $scope.getMonthList();
    };

    $scope.changeStatus = function(stat){
        $scope.status = stat;   //all, expired, calendar

        switch(stat){
            case 'all':
                $scope.search.is_expired = 'N';
                break;
            case 'expired':
                $scope.search.is_expired = 'Y';
                break;
            case 'wait':
                $scope.search.is_expired = 'W';
                break;
            default:
                $scope.eventSources = [];
        }
    };

    $scope.getMonthList = function(){
        Month.all().then(function(result){
            if(result.length > 0) {
                var msec = new Date().getTime();  // 현재 시간
                for(var key in result){
                    // 만료 설정
                    if(msec > result[key].end_date || result[key].is_stop == 'Y') {
                        result[key].is_expired = 'Y';
                    }else{
                        if(msec < result[key].start_date) {
                            result[key].is_expired = 'W';
                        }else{
                            result[key].is_expired = 'N';
                        }
                    }
                }
                $scope.monthList = result;
            }
        });
    };

    /* Start Of Calendar */
    //달력의 등록된 일정클릭
    $scope.alertOnEventClick = function(date, jsEvent, view){
        $scope.openEditMonthCal(date.id);
    };
    //달력의 빈 칸 클릭
    $scope.dayClick = function(date, jsEvent, view){
        $scope.openAddMonthCal(date);
    };

    $scope.uiConfig = {

        calendar:{
            titleFormat : 'YYYY 년 MMMM',
            height: 735,
            header:{
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            dayClick: $scope.dayClick,
            eventClick: $scope.alertOnEventClick,
            dayNamesShort : ["일", "월", "화", "수", "목", "금", "토"],
            monthNames : ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
            viewRender: function(view, element) {
                $scope.makeEvents(view.start, view.end);
            }
        }

    };

    // 캘린더 변동 이벤트 발생시 달력에 월차 데이터를 뿌려줌
    $scope.makeEvents = function(start,end){
        Month.allForCalendar(start,end).then(function(result){

            if(result.length > 0){
                var tempArr = [];

                for(var key in result){
                    var s_color = '#3a87ad';
                    var s_textColor = '#fff';
                    var e_color = '#f00';
                    var e_textColor = 'yellow';

                    if(result[key].is_stop=='Y'){   // 중단된 월차일때
                        e_color = s_color = '#ffc900';
                        e_textColor = s_textColor = '#000';
                    }else if(result[key].end_date < new Date().getTime()){ // 만료된 월차일때
                        e_color = s_color = '#777';
                        e_textColor = '#fff';
                    }

                    if (result[key].start_date >= start) {
                        tempArr.push({
                            color: s_color,
                            textColor: s_textColor,
                            title: result[key].car_num + ' - 월차시작',
                            start: new Date(result[key].start_date),
                            allDay: true,
                            id : result[key].idx
                        });
                    }

                    if (result[key].end_date <= end) {
                        tempArr.push({
                            color: e_color,
                            textColor: e_textColor,
                            title: result[key].car_num + ' - 월차종료',
                            start: new Date(result[key].end_date),
                            allDay: true,
                            id : result[key].idx
                        });
                    }
                }

                $scope.eventSources.splice(0,$scope.eventSources.length);   // 일정 비워줌

                $scope.eventSources.push(tempArr);
            }
        },function(err){
            console.log(err);
        });
    };
    /* End Of Calendar */

    //달력에서 빈칸을 클릭했을때 등록화면으로
    $scope.openAddMonthCal = function(start_date){
        $scope.xiso.month = {};
        $scope.xiso.dates.start_date = new Date(start_date);
        $scope.xiso.dates.end_date = new Date(Date.parse($scope.xiso.dates.start_date) + 30 * 1000 * 60 * 60 * 24);

        $scope.xiso.mdMonth.show();
    };
    //달력에서 일정을 클릭했을때 수정화면으로
    $scope.openEditMonthCal = function(idx){
        Month.getByIdx(idx).then(function(result){
            if(result) {
                $scope.xiso.month = angular.copy(result);
                $scope.xiso.dates.start_date = new Date($scope.xiso.month.start_date);
                $scope.xiso.dates.end_date = new Date($scope.xiso.month.end_date);

                $scope.xiso.mdMonth.show();
            }
        });
    };

    

})

//-------------------
// 지정주차
//-------------------
.controller('cooperCtrl', function ($scope, $state, $stateParams, $ionicModal, $ionicPopup, Cooper, Garage, xisoService) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.cooper'){
            $scope.initCooper();
        }
    });

    setTimeout(function(){
        $scope.initCooper();
        $scope.xiso = xisoService;
        $scope.xiso.dates = {};
    },1000);

    $scope.initCooper = function(){
        $scope.status = 'cooper';
        $scope.getCooperList();
    };
    $scope.changeStatus = function(stat){
        $scope.status = stat;   //cooper, period, day
        switch(stat){
            case 'period':
                $scope.xiso.dates = {};
                $scope.xiso.dates.start_date = getStartEndDate().start_date;
                $scope.xiso.dates.end_date = getStartEndDate().end_date;
                $scope.getGarageList();
                break;
            case 'day':
                $scope.xiso.dates = {};
                $scope.xiso.dates.start_date = new Date();
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
        // console.log($scope.xiso.dates);
        Garage.allForCooper($scope.xiso.dates).then(function(result){
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


})

//-------------------
// 정산
//-------------------
.controller('calcuCtrl', function ($scope, Garage, $stateParams, MultipleViewsManager) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.calcu'){
            $scope.initCalcu();
        }
    });

    $scope.eventSources = [];

    setTimeout(function(){
        $scope.initCalcu();
    },1000);

    $scope.initCalcu = function(){
        $scope.makeEvents();
    };

    $scope.makeEvents = function(dt){

        if(!dt) dt = new Date();
        var tmpParams = getStartEndDate(dt);
        var params = {};
        params.start_date = new Date(tmpParams.start_date).getTime();
        params.end_date = new Date(tmpParams.end_date).getTime();

        Garage.allForCal(params).then(function(result){
            if(result){
                Garage.getInCount(params).then(function(result2){
                    // console.log(result2);
                    if(result2){
                        for(var key in result2){
                            result[key].inCnt = result2[key].inCnt;
                        }
                    }
                    var tempArr = [];
                    var inCarCount = 0; //총입차
                    var outCarCount = 0;    //총출차

                    for(var key in result) {
                        inCarCount += onum(result[key].inCnt);
                        outCarCount += onum(result[key].outCnt);
                        var start = new Date(result[key].gdate);
                        tempArr.push({
                            title: '입차 : ' + onum(result[key].inCnt) + ' / 출차 : ' + onum(result[key].outCnt),
                            start: start, allDay: true
                        });
                        tempArr.push({
                            title: '매출 : ' + onum(result[key].pay_amounts),
                            start: start, allDay: true
                        });
                        tempArr.push({
                            title: '할인 : ' + (onum(result[key].dc_coopers) + onum(result[key].dc_selfs)),
                            start: start, allDay: true
                        });
                        tempArr.push({
                            title: '미수금 : ' + (onum(result[key].total_amounts) - onum(result[key].dc_coopers) - onum(result[key].dc_selfs) - onum(result[key].pay_amounts)),
                            start: start, allDay: true
                        });
                    }
                    // console.log(tempArr);

                    $scope.eventSources.splice(0,$scope.eventSources.length);   // 일정 비워줌
                    $scope.eventSources.push(tempArr);

                    Garage.allTotCal(params).then(function(result3){
                        if(result3) {
                            // console.log(result3);
                            $scope.total = result3;
                            $scope.total.inCarCount = inCarCount;
                            $scope.total.outCarCount = outCarCount;
                        }
                    }, function(err){ console.log(err); });

                },function(err){
                    console.log(err);
                });
            }
        },function(err){
            console.log(err);
        });
    };

    $scope.uiConfig = {

        calendar:{
            titleFormat : 'YYYY 년 MMMM',
            height: 800,
            header:{
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            eventOrder: 'id',
            dayNamesShort : ["일", "월", "화", "수", "목", "금", "토"],
            monthNames : ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
            viewRender: function(view, element) {
                $scope.makeEvents(new Date(view.intervalStart));
            }
        }

    };
})

//-------------------
// 설정
//-------------------
.controller('configCtrl', function ($scope, $ionicModal, ShopInfo, CarType,$ionicPopup,$cordovaToast, DB, $http) {

    $scope.initConfigParams = function(){
        $scope.defaultParams = {};
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
    $scope.initDayCar = function(){
        $scope.initCartypeParams();
        
        CarType.allDayCar().then(function(result){
            if(result.length > 0) $scope.carTypeList = result;
        });

        console.log('Day Car loaded!!');
    };

    $scope.shouldShowDelete = false;
    $scope.showDelete = function(){
        $scope.shouldShowDelete = true;
    };
    $scope.hideDelete = function(){
        $scope.shouldShowDelete = false;
    };

    $ionicModal.fromTemplateUrl('templates/config.addcartype.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.addCartypeWindow = modal;
    });
    $scope.openCartype = function(is_daycar) {
        $scope.params = {};
        $scope.params.is_daycar = is_daycar;
        $scope.addCartypeWindow.show();
    };
    $scope.closeCartype = function() {
        if($scope.params.is_daycar == 'N') {
            $scope.initCartype();
        }else{
            $scope.initDayCar();
        }
        $scope.addCartypeWindow.hide();
    };

    $scope.insertShopInfo = function(){
        if(!$scope.defaultParams.shop_name) return $ionicPopup.alert({title: '알림',template: '주차장명을 입력하지 않았습니다.'});
        if(!$scope.defaultParams.mobile) return $ionicPopup.alert({title: '알림',template: '휴대전화를 입력하지 않았습니다.'});
        if(!$scope.defaultParams.tel) return $ionicPopup.alert({title: '알림',template: '유선전화를 입력하지 않았습니다.'});
        // if(!$scope.defaultParams.fax) return $ionicPopup.alert({title: '알림',template: 'FAX를 입력하지 않았습니다.'});
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
            if($scope.params.is_daycar == 'N') {
                $scope.initCartype();
            }else{
                $scope.initDayCar();
            }
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
/*
    // DB 백업
    $scope.backup = function(){
        var successFn = function(json, count){
            console.log("Exported JSON: "+json);
            console.log("Exported JSON contains equivalent of "+count+" SQL statements");

            $http({
                method: 'POST',
                url: 'http://xpos.xiso.co.kr/proc.php?mClass=hwajin&act=procInsert',
                data: {
                    pos_json : json
                },
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'application/json'
                }
            })
            .success(function (responsive, status, headers, config) {
                console.log('success');
                console.log(responsive);
            })
            .error(function (data, status, headers, config) {
                console.log('error');
                console.log(data);
                console.log(status);
                console.log(headers);
                $scope.print_r(config.data.pos_json.data.inserts);
            });

        };
        cordova.plugins.sqlitePorter.exportDbToJson(DB.db, {
            successFn: successFn
        });
    };

    // DB 복구
    $scope.restore = function(){

    };
*/

});