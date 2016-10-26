//-------------------
// 월차
//-------------------
xpos.controller('monthCtrl', function ($scope, $state,$stateParams,$ionicModal,$ionicPopup, Month,MultipleViewsManager, xSerial, $compile, uiCalendarConfig) {
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

    //월차 추가 Modal
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

});