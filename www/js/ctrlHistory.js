//-------------------
//입출차기록
//-------------------
xpos.controller('historyCtrl', function ($scope, $state, $stateParams, Garage, xSerial, xisoService) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.history'){
            $scope.initHistory();
        }
    });

    setTimeout(function(){
        $scope.initHistory();
    },1100);

    $scope.xiso = xisoService;
    $scope.xiso.init($scope);

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

});