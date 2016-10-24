xpos
//-------------------
//입차목록
//-------------------
.controller('currentCtrl', function ($scope, $stateParams, $ionicModal, $ionicPopup, MultipleViewsManager, $cordovaToast, Garage) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.current'){
            $scope.initCurrent();
        }
    });

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

    $scope.initCurrent = function(){
        $scope.garage = '';
        $scope.offset = 0;
        $scope.moredata = false;
        $scope.getGarageList(false);
        // console.log('current page initialized!!');
    };
    
    $scope.getGarageList = function(is_load_more){
        // console.log('is_load_more = '+is_load_more);
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

    $scope.refresh = function(){
        $scope.offset = 0;
        $scope.moredata = false;
        $scope.getGarageList(false);
    };

    $scope.loadMore = function(){
        $scope.getGarageList(true);
    };

    //출차 버튼
    $scope.outCar = function(garage){
        var tempGarage = angular.copy(garage);
        tempGarage.end_date = new Date().getTime();
        tempGarage.total_amount = cal_garage(tempGarage);
        $ionicPopup.confirm({
            title: '출차 - '+tempGarage.car_num,
            template: '요금 : '+ tempGarage.total_amount +' 원<br/>입차시간 : ' + formatted_date(new Date(garage.start_date)) + '<br/>출차시간 : ' + formatted_date(new Date(tempGarage.end_date)) + '<br/>출차 하시겠습니까?'
        }).then(function (res) {
            if(res){
                //
                // 이 구문 전체는 결제 프로세스 이후에 동작해야함
                //
                Garage.outCar(tempGarage).then(function(res2){
                    $cordovaToast.showShortBottom('차량번호 [ '+ tempGarage.car_num +' ]의 출차가 완료 되었습니다');
                    $scope.closeGarageView();
                    $scope.initCurrent();
                },function(err){
                    console.log(err);
                });
            }else{

            }
        });
    };

    //입차취소 버튼
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
})

//-------------------
//입출차기록
//-------------------
.controller('historyCtrl', function ($scope, $stateParams, $ionicModal, Garage, $ionicPopup, $cordovaToast, MultipleViewsManager) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.history'){
            $scope.initHistory();
        }
    });

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

    //출차 버튼
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

    //입차취소 버튼
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
})

//-------------------
// 월차
//-------------------
.controller('monthCtrl', function ($scope, $state,$stateParams,$ionicModal,$ionicPopup, Month,MultipleViewsManager, xSerial, $compile, uiCalendarConfig) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.month'){
            $scope.initMonth();
        }
    });

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
            height: 650,
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

    $scope.eventSources = [];

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

    $scope.initMonth = function(){
        $scope.status = 'all';

        Month.all().then(function(result){
            if(result.length > 0) $scope.monthList = result;
        });
    };

    $scope.changeStatus = function(stat){
        $scope.status = stat;   //all, expired, calendar
        if(stat=='calendar') $scope.eventSources = [];
    };

    //월차 추가 모달
    $ionicModal.fromTemplateUrl('templates/month.addmonth.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalMonth = modal;
    });
    $scope.openAddMonth = function(){
        $scope.params = {};
        $scope.temp_start_date = new Date();
        $scope.temp_end_date = new Date(Date.parse($scope.temp_start_date) + 30 * 1000 * 60 * 60 * 24);

        $scope.modalMonth.show();
    };
    $scope.closeMonth = function(){
        $scope.params = {};
        $scope.modalMonth.hide();
    };

    $scope.openEditMonth = function(month){
        $scope.params = month;
        $scope.temp_start_date = new Date(month.start_date);
        $scope.temp_end_date = new Date(month.end_date);

        $scope.modalMonth.show();
    };
    //달력에서 빈칸을 클릭했을때 등록화면으로
    $scope.openAddMonthCal = function(start_date){
        $scope.params = {};
        $scope.temp_start_date = new Date(start_date);
        $scope.temp_end_date = new Date(Date.parse($scope.temp_start_date) + 30 * 1000 * 60 * 60 * 24);

        $scope.modalMonth.show();
    };
    //달력에서 일정을 클릭했을때 수정화면으로
    $scope.openEditMonthCal = function(idx){
        Month.getByIdx(idx).then(function(result){
            if(result) {
                $scope.params = result;
                $scope.temp_start_date = new Date(result.start_date);
                $scope.temp_end_date = new Date(result.end_date);

                $scope.modalMonth.show();
            }
        });
    };

    //월차 등록, 수정
    $scope.insertMonth = function(){
        var start_date = angular.copy($scope.temp_start_date);
        var end_date  = angular.copy($scope.temp_end_date);

        $scope.params.start_date = getStartDate(start_date);    //시작일 00:00:00
        $scope.params.end_date = getEndDate(end_date);          //종료일 23:59:59

        if(!$scope.params.car_num) return $ionicPopup.alert({title: '알림',template: '차량번호를 입력하지 않았습니다.'});
        if(!$scope.params.car_name) return $ionicPopup.alert({title: '알림',template: '차종을 입력하지 않았습니다.'});
        if(!$scope.params.car_type_title) return $ionicPopup.alert({title: '알림',template: '구분을 입력하지 않았습니다.'});
        if(!$scope.params.start_date) return $ionicPopup.alert({title: '알림',template: '시작날짜를 입력하지 않았습니다.'});
        if(!$scope.params.end_date) return $ionicPopup.alert({title: '알림',template: '종료날짜를 입력하지 않았습니다.'});
        if($scope.params.start_date >= $scope.params.end_date)
            return $ionicPopup.alert({title: '알림',template: '시작날짜가 종료날짜보다 크거나 같을 수 없습니다.'});
        if(!$scope.params.amount) return $ionicPopup.alert({title: '알림',template: '월차금액을 입력하지 않았습니다.'});
        if(!$scope.params.user_name) return $ionicPopup.alert({title: '알림',template: '차주명을 입력하지 않았습니다.'});
        if(!$scope.params.mobile) return $ionicPopup.alert({title: '알림',template: '연락처를 입력하지 않았습니다.'});

        if(!$scope.params.idx) {
            Month.insert($scope.params).then(function (res) {
                console.log("insertId: " + res.insertId);
                $state.go($state.current, {}, {reload: true});
                $scope.closeMonth();
            }, function (err) {
                console.log(err);
            });
        }else{
            Month.update($scope.params).then(function(res){
                $state.go($state.current, {}, {reload: true});
                $scope.closeMonth();
            },function(err){
                console.log(err);
            });
        }
    };

    $scope.initMonthModal = function(){
        console.log('month modal initialized');
    };

    // $scope.serial_test = function(){
    //     xSerial.openCash();
    // };

})

//-------------------
// 지정주차
//-------------------
.controller('cooperCtrl', function ($scope, $state, $stateParams, $ionicModal, $ionicPopup, Cooper, Garage, MultipleViewsManager) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.cooper'){
            $scope.initCooper();
        }
    });

    $scope.initCooper = function(){
        $scope.status = 'cooper';
        $scope.getCooperList();
    };
    $scope.changeStatus = function(stat){
        $scope.status = stat;   //cooper, period, day
        switch(stat){
            case 'period':
                $scope.gParams = {};
                $scope.gParams.start_date = getStartEndDate().start_date;
                $scope.gParams.end_date = getStartEndDate().end_date;
                $scope.getGarageList();
                break;
            case 'day':
                $scope.gParams = {};
                $scope.gParams.start_date = new Date();
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
        Garage.allForCooper($scope.gParams).then(function(result){
            if(result.length > 0) $scope.garageList = result;
        });
    };

    //업체 추가 모달
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
        if(!$scope.params.minute_free && $scope.params.minute_free!==0) return $ionicPopup.alert({title: '알림',template: '무료 시간을 입력하지않았습니다.'});
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
        
        



        // for(var key in calObj){
        //     if(key==20) {
        //         Garage.allForCal(calObj[key]).then(function (result) {
        //             tempArr.push({
        //                 title: ['입차 : '+result.inCnt,'출차 : '+result.outCnt],
        //                 start: calObj[key].start,
        //                 allDay: true
        //             });
        //             tempArr.push({
        //                 title: '총매출 : '+result.total_amounts+'원',
        //                 start: calObj[key].start,
        //                 allDay: true
        //             });
        //         }, function (err) {
        //             console.log(err);
        //         });
        //     }
        // }
        // $scope.eventSources.splice(0,$scope.eventSources.length);   // 일정 비워줌
        //
        // $scope.eventSources.push(tempArr);

        //입차, 출차, 총 매출, 총 할인, 총 미수금

        // Garage.allForCalcu(start,end).then(function(result){
        //
        //     if(result.length > 0){
        //         var tempArr = [];
        //
        //         for(var key in result){
        //             var s_color = '#3a87ad';
        //             var s_textColor = '#fff';
        //             var e_color = '#f00';
        //             var e_textColor = 'yellow';
        //
        //             if(result[key].is_stop=='Y'){   // 중단된 월차일때
        //                 e_color = s_color = '#ffc900';
        //                 e_textColor = s_textColor = '#000';
        //             }else if(result[key].end_date < new Date().getTime()){ // 만료된 월차일때
        //                 e_color = s_color = '#777';
        //                 e_textColor = '#fff';
        //             }
        //
        //             if (result[key].start_date >= start) {
        //                 tempArr.push({
        //                     color: s_color,
        //                     textColor: s_textColor,
        //                     title: result[key].car_num + ' - 월차시작',
        //                     start: new Date(result[key].start_date),
        //                     allDay: true,
        //                     id : result[key].idx
        //                 });
        //             }
        //
        //             if (result[key].end_date <= end) {
        //                 tempArr.push({
        //                     color: e_color,
        //                     textColor: e_textColor,
        //                     title: result[key].car_num + ' - 월차종료',
        //                     start: new Date(result[key].end_date),
        //                     allDay: true,
        //                     id : result[key].idx
        //                 });
        //             }
        //         }
        //
        //         $scope.eventSources.splice(0,$scope.eventSources.length);   // 일정 비워줌
        //
        //         $scope.eventSources.push(tempArr);
        //     }
        // },function(err){
        //     console.log(err);
        // });
    };

    $scope.uiConfig = {

        calendar:{
            titleFormat : 'YYYY 년 MMMM',
            height: 600,
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
});