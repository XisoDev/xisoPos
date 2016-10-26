//-------------------
// 정산
//-------------------
xpos.controller('calcuCtrl', function ($scope, Garage, $stateParams, MultipleViewsManager) {
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