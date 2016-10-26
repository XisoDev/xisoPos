//-------------------
//입차목록
//-------------------
xpos.controller('currentCtrl', function ($scope, $state, $stateParams, $ionicModal, $ionicPopup, MultipleViewsManager, $cordovaToast, Garage, xSerial, Cooper, Payment, xisoService) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name == 'mainLayout.tabs.current'){
            $scope.initCurrent();
        }
    });
    setTimeout(function(){
        $scope.initCurrent();
    },1100);

    $scope.xiso = xisoService;
    $scope.xiso.init($scope);

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
});







