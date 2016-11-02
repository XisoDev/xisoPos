xpos

.factory('xisoService', function($rootScope, $ionicModal, $ionicPopup, $ionicLoading, $cordovaToast, $state, $injector, CarType, Month, Garage, Cooper, Payment, ShopInfo) {
    var self = this;
    self.timeID2;
    
    self.offset = 0;
    self.moredata = false;
    self.search = {};

    self.mainField = '';
    self.garage = {};
    self.tempGarage = {};
    self.tempDayCar = {};   // 결제후에 적용될 일차정보
    self.month = {};
    self.dates = {};    // 단순히 start_date, end_date 검색을 위해서 씀
    self.before_is_stop = '';

    //list
    self.monthList = {};
    self.carTypeList = {};
    self.garageList = {};
    self.cooperList = {};
    self.payList = {};
    self.dayCarList = {};
    
    //view's list
    self.vGarageList = {};
    self.vHistoryList = {};
    self.vMonthList = {};

    //modals
    self.mdGarageView = {};
    self.mdDcInput = {};
    self.mdPayInput = {};
    self.mdCarTypeList = {};
    self.mdMonthList = {};
    self.mdGarageList = {};
    self.mdOutList = {};
    self.mdCooperList = {};
    self.mdPayCancel = {};
    self.mdMonthPay = {};
    self.mdMonth = {};
    self.mdDayCarList = {};
    
    //serial
    self.pay_location = '';
    self.pay_success = 'N'; // N 실패, Y 성공, C 취소
    self.payObj = {};

    self.initPayVariables = function() {    // pay 관련 전역 변수 초기화
        self.pay_location = '';
        self.pay_success = 'N';
        self.payObj = {};
    };
    
    var reload = function(){
        var state_name = $injector.get('$state').current.name;
        console.log('state_name = '+state_name);

        self.offset = 0;
        self.moredata = false;
        
        switch (state_name){
            case 'mainLayout.tabs.current':
                self.getGarageList(false);
                break;
            case 'mainLayout.tabs.history':
                self.getHistoryList(false);
                break;
            case 'mainLayout.tabs.month':
                self.getMonthList(false);
                break;
        }
        // $state.reload();
    };


    // scope 로 modal initialize
    self.init = function($scope) {
        $scope = $scope || $rootScope.$new();

        //modals
        self.mdGarageView = {};
        self.mdDcInput = {};
        self.mdPayInput = {};
        self.mdCarTypeList = {};
        self.mdMonthList = {};
        self.mdGarageList = {};
        self.mdOutList = {};
        self.mdCooperList = {};
        self.mdPayCancel = {};
        self.mdMonthPay = {};
        self.mdMonth = {};
        self.mdDayCarList = {};

        // 차량상세 Modal
        $ionicModal.fromTemplateUrl('templates/garage_view.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdGarageView = modal;
        });

        // 열람시 여러개일때 차량 선택 리스트 표시 Modal
        $ionicModal.fromTemplateUrl('templates/panel.garageList.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdGarageList = modal;
        });

        // 할인하기 Modal
        $ionicModal.fromTemplateUrl('templates/payment.discount.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdDcInput = modal;
        });

        // 결제하기 Modal
        $ionicModal.fromTemplateUrl('templates/payment.input.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdPayInput = modal;
        });

        // 차종 선택 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/panel.cartypeList.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdCarTypeList = modal;
        });

        // 차종 선택 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/payment.daycar.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdDayCarList = modal;
        });

        // 월차 선택 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/panel.monthList.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdMonthList = modal;
        });

        // 출차 선택 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/panel.outList.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdOutList = modal;
        });

        // 지정할인 리스트 Modal
        $ionicModal.fromTemplateUrl('templates/payment.cooper.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdCooperList = modal;
        });

        // 결제취소 Modal - (상세정보 Modal - 결제 취소 버튼)
        $ionicModal.fromTemplateUrl('templates/payment.cancel.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdPayCancel = modal;
        });

        // 월차 결제 Modal
        $ionicModal.fromTemplateUrl('templates/month.pay.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdMonthPay = modal;
        });

        // 월차 추가 Modal
        $ionicModal.fromTemplateUrl('templates/month.addmonth.html', {
            scope: $scope
        }).then(function(modal) {
            self.mdMonth = modal;
        });
    };
    
    // 모든 modal 을 닫는다
    self.closeModal = function(){
        self.mdGarageView.hide();
        self.mdDcInput.hide();
        self.mdPayInput.hide();
        self.mdCarTypeList.hide();
        self.mdMonthList.hide();
        self.mdGarageList.hide();
        self.mdOutList.hide();
        self.mdCooperList.hide();
        self.mdPayCancel.hide();
        self.mdMonth.hide();
        self.mdMonthPay.hide();
        self.mdDayCarList.hide();
    };
    
    self.addMF = function(str){
        self.mainField += str;
    };
    
    self.clearMF = function(){
        self.mainField = '';
    };
    
    self.setGarage = function(garage){
        self.garage = garage;
    };
    self.copyGarage = function(){
        self.tempGarage = angular.copy(self.garage);
    };
    self.calDiscount = function(){
        var pay_money = onum(self.tempGarage.total_amount) - onum(self.tempGarage.pay_amount) - onum(self.tempGarage.discount_cooper) - onum(self.tempGarage.discount_self);
        self.tempGarage.pay_money = pay_money; //결제할 금액 세팅
    };

    //입차목록 리스트 불러오기
    self.getGarageList = function(is_load_more, $scope){
        $scope = $scope || $rootScope.$new();
        var limit = 100;

        Garage.allForCurrent(limit, self.offset).then(function(result){
            if(result.length > 0) {
                if(!is_load_more) {
                    self.vGarageList = result;
                }else{
                    for(var key in result) {
                        self.vGarageList.push(result[key]);
                    }
                }
                self.offset += limit;
                self.moredata = true;
            }else{
                self.moredata = false;    // 더이상 추가로드 할게 없음
            }

            $scope.$broadcast('scroll.refreshComplete');
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    //입출차 목록 불러오기
    self.getHistoryList = function(is_load_more, $scope){
        $scope = $scope || $rootScope.$new();
        var limit = 100;

        Garage.allForHistory(limit, self.offset).then(function(result){
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
                    self.vHistoryList = result;
                }else{
                    //추가 로드일때
                    for(var key in result) {
                        self.vHistoryList.push(result[key]);    // 기존 배열에 추가
                    }
                }
                self.offset += limit;
                self.moredata = true;
            }else{
                self.moredata = false;    // 더이상 추가로드 할게 없음
            }
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    self.getMonthList = function(is_load_more, $scope){
        $scope = $scope || $rootScope.$new();
        var limit = 100;
        
        Month.all(limit, self.offset).then(function(result){
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

                if(!is_load_more){
                    self.vMonthList = result;
                }else{
                    //추가 로드일때
                    for(var key in result) {
                        self.vMonthList.push(result[key]);    // 기존 배열에 추가
                    }
                }
                self.offset += limit;
                self.moredata = true;
            }else{
                self.moredata = false;
            }
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
    

    // 패널 - 입차 버튼 클릭시 체크
    self.inCarChk = function(){
        if(!self.mainField) return $ionicPopup.alert({title:'알림', template:'관리 번호를 입력해주세요'});

        CarType.all().then(function(result){
            //등록된 차종이 있으면
            if(result.length > 0) {
                self.compareMonth();
            }else{
                $ionicPopup.alert({title: '알림', template: '등록된 차종이 없습니다.<br>먼저 설정에서 차종을 추가해주세요.'});
            }
        },function (err){ console.log(err); });
    };
    
    // 패널 - 디비에서 현재 차번호를 검색하여 월차에 있는지 판단하여 있으면 컨펌을 띄움
    self.compareMonth = function(){
        Month.getByCarNum('%'+self.mainField+'%').then(function(result){
            if(result.length > 0){
                self.monthList = result;

                $ionicPopup.confirm({
                    title: '월차 확인',
                    template: '월차에 '+self.mainField + '(으)로 시작되는 차량번호가 있습니다.<br/>어떻게 입차할까요?',
                    okText: '월차로 입차',
                    cancelText: '다른 번호 입력'
                }).then(function (res) {
                    if (res) {
                        self.mdMonthList.show();    //월차로 입차시에 월차 목록을 띄움
                    } else {
                        $cordovaToast.showShortBottom('다른 차량번호를 입력하고 입차버튼을 누르세요');
                    }
                });
            }else{
                self.normalInCar();  //월차목록에 없으면 다른 차량으로 입차
            }
        },function (err){ console.log(err); });
    };
    
    // 패널 - 디비에서 현재 차번호를 검색하여 같은 번호가 있는지 검색 후 없으면 차종 선택 모달을 띄움
    self.normalInCar = function(){
        Garage.getByCarNum(self.mainField).then(function(result){
            if(result){
                return $ionicPopup.alert({
                    title: '알림',
                    template: '같은 차번호가 입차되어있습니다.<br/>다른 번호를 입력해주세요.'
                });
            }else{
                CarType.all().then(function(result2){
                    if(result2.length > 0) self.carTypeList = result2;
                });

                self.mdCarTypeList.show();
            }
        },function(err){ console.log(err); });
    };

    // 패널 - 차종 선택 화면에서 선택하면 입차시킴
    self.inCar = function(cartype){
        self.garage = {
            start_date : new Date().getTime(),
            car_num : self.mainField,
            car_type_title : cartype.car_type_title,
            minute_unit : cartype.minute_unit,
            minute_free : cartype.minute_free,
            amount_unit : cartype.amount_unit,
            basic_amount : cartype.basic_amount,
            basic_minute : cartype.basic_minute,
            month_idx : 0,
            cooper_idx : 0,
            discount_cooper : 0,
            discount_self : 0
        };

        Garage.insert(self.garage).then(function(result) {
            // console.log("insertId: " + result.insertId);
            self.garage.idx = result.insertId;

            self.printInCar();  //영수증 출력

            self.mdCarTypeList.hide();
            reload();
            $cordovaToast.showShortBottom('[ '+ self.mainField +' ] - 입차되었습니다');
            self.clearMF();
        }, function (err) { console.error(err); });
    };

    // 패널 - 월차 선택 화면에서 선택하면 월차로 입차
    self.monthIn = function (month) {
        if(month.is_view){
            self.openEditMonth(month);
            self.mdMonthList.hide();
            self.clearMF();
            return ;
        }
        Garage.getByCarNum(month.car_num).then(function(result){
            if(result){
                $ionicPopup.alert({
                    title: '알림',
                    template: '같은 차번호가 입차되어있습니다.'
                });
            }else{
                self.garage = {
                    start_date: new Date().getTime(),
                    car_num: month.car_num,
                    car_type_title: month.car_type_title,
                    minute_unit: 0,
                    minute_free: 0,
                    amount_unit: 0,
                    basic_amount: 0,
                    basic_minute: 0,
                    month_idx: month.idx,
                    cooper_idx: 0,
                    discount_cooper: 0,
                    discount_self: 0
                };

                Garage.insert(self.garage).then(function (result) {
                    // console.log("insertId: " + result.insertId);
                    self.garage.idx = result.insertId;

                    self.printInCar();

                    self.mdMonthList.hide();
                    $cordovaToast.showShortBottom('[ '+ month.car_num +' ] - 월차로 입차되었습니다');
                    reload();
                    self.clearMF();
                }, function (err) { console.error(err); });
            }
        },function(err){ console.log(err); });
    };

    // 입차 영수증 출력
    self.printInCar = function() {
        var date = getHanDate(self.garage.start_date);   //"2016년 10월 13일 목요일"
        var time = getHanTime(self.garage.start_date);   //"11시 50분"
        var carnum = self.garage.car_num;
        var srl = self.garage.idx;
        var message = "* 오늘도 좋은 하루 되세요.";
        message += "\r\n* 협력업체 방문시 뒷면에 꼭 도장을 받아주세요.";
        message += "\r\n* 영수중 분실시 차량출고가 불가 할 수 있습니다.";
        self.doPrint(date, time, carnum, srl, message);
    };

    // 패널 - 월차 버튼 클릭
    self.openMonthChk = function(){
        if(!self.mainField) return $ionicPopup.alert({title:'알림',template:'차 번호를 먼저 입력하세요.'});

        Month.getByCarNum('%'+self.mainField+'%').then(function(result){
            $state.go('mainLayout.tabs.month');

            show('요청중입니다...',2000);
            setTimeout(function(){  // view 의 init 시간과 맞추기 위함
                if(result.length > 0){
                    self.monthList = result;
                    for(var key in self.monthList){
                        self.monthList[key].is_view = true;
                    }
                    self.mdMonthList.show();
                }else{
                    self.month = {};
                    self.month.car_num = self.mainField;

                    self.dates.start_date = new Date();
                    self.dates.end_date = new Date(Date.parse(self.dates.start_date) + 30 * 1000 * 60 * 60 * 24);

                    console.log('start = ' + self.dates.start_date);
                    console.log('end = ' + self.dates.end_date);

                    self.mdMonth.show();
                }
            },2000);
        },function (err){ console.log(err); });
    };
    
    // 열람
    self.openGarageView = function(garage){
        self.setGarage(garage);
        self.mdGarageView.show();
        self.mdGarageList.hide();
    };

    // 패널 - 출차 버튼 클릭시 체크
    self.outCarChk = function(){
        if(!self.mainField) return $ionicPopup.alert({title:'알림',template:'출차할 차 번호를 먼저 입력하세요.'});
        Garage.getCurrentByCarNum('%'+self.mainField+'%').then(function(result){
            if(result.length == 1) {
                self.setGarage(result[0]);
                self.outCar();
            }else if(result.length > 1) {
                self.outList = result;
                self.mdOutList.show();
            }else {
                $ionicPopup.alert({title:'알림',template:'입차된 차중에 [ '+self.mainField+' ]로 시작되는 차번호가 없습니다.'});
            }
        });
    };

    // 공용 - 출차
    self.outCar = function(){
        self.copyGarage();   //garage 를 tempGarage 에 copy
        
        // 이미 출차된 차량이 아닐때만 출차시간 및 가격 세팅
        if(self.tempGarage.is_out=='N') {
            self.tempGarage.end_date = new Date().getTime();
            self.tempGarage.total_amount = cal_garage(self.tempGarage);
        }

        //월차 차량이면 바로 출차
        if(self.garage.month_idx > 0) return outCarMonth();
        
        self.tempDayCar = {};   // 일차로 변경될 정보 초기화

        self.mdDcInput.show();
        self.mdGarageView.hide();   //현재창 닫음
    };

    // 월차일때 바로 출차
    var outCarMonth = function(){
        $ionicPopup.confirm({
            title: '출차 - '+ self.garage.car_num,
            template: '월차 차량입니다. 출차 하시겠습니까?',
            okText: '예', cancelText: '아니오'
        }).then(function (res) {
            if(res) {
                self.copyGarage();   //garage 를 tempGarage 에 copy
                self.tempGarage.end_date = new Date().getTime();
                self.procOutCar();   //출차처리
            }
        });
    };

    // DB에서 출차처리
    self.procOutCar = function(){
        Garage.outCar(self.tempGarage).then(function(res){
            $cordovaToast.showShortBottom('차량번호 [ '+ self.tempGarage.car_num +' ]의 출차가 완료 되었습니다');
            self.closeModal();  //모든창 닫음
            reload();
        },function(err){
            console.log(err);
        });
    };

    // 상세정보 Modal - 입차 취소 버튼
    self.cancelCar = function(){
        $ionicPopup.confirm({
            title: '입차 취소 - '+ self.garage.car_num,
            template: '입차를 취소 하시겠습니까?',
            okText: '예', cancelText: '아니오'
        }).then(function (res) {
            if(res){
                Garage.cancelCar(self.garage).then(function(result){
                    self.mdGarageView.hide();
                    $cordovaToast.showShortBottom('차량번호 [ '+ self.garage.car_num +' ]의 입차취소가 완료 되었습니다');
                    reload();
                },function(err){ console.log(err); });
            }
        });

    };

    // 할인 Modal - 바로 결제 버튼
    self.dcSkip = function(){
        self.calDiscount();     //결제해야될 금액 계산 (미리세팅용)
        self.mdPayInput.show(); //결제화면으로 넘김
        self.mdDcInput.hide();
    };

    // 할인 Modal - 지정 할인 버튼
    self.dcCooper = function(){
        Cooper.current().then(function(result){
            if(result.length > 0) {
                self.cooperList = result;

                self.mdCooperList.show();
                self.mdDcInput.hide();
            }else{
                $cordovaToast.showShortBottom('지정 할인 업체가 등록되어 있지 않습니다.');
            }
        });
    };

    // 할인 Modal - 임의 할인 버튼
    self.dcSelf = function(){
        if(!self.tempGarage.dc_money || self.tempGarage.dc_money == 0) return $ionicPopup.alert({title:'알림',template:'할인 금액을 입력해주세요.'});
        if(self.tempGarage.dc_money > self.tempGarage.total_amount) return $ionicPopup.alert({title:'알림',template:'할인 금액이 총 금액 보다 큽니다.'});

        $ionicPopup.confirm({
            title: '할인금액 '+ self.tempGarage.dc_money.num_format() +'원',
            template: self.tempGarage.dc_money.num_format() +'원을 할인하시겠습니까?',
            okText: '예',cancelText: '아니오'
        }).then(function (res) {
            if(res){
                self.tempGarage.discount_self = self.tempGarage.discount_self + self.tempGarage.dc_money;
                $cordovaToast.showShortBottom('임의 할인이 적용되었습니다');
                self.calDiscount();     //결제해야될 금액 계산 (미리세팅용)
                self.mdPayInput.show();  //결제화면으로 넘김
            }
        });
    };

    // 할인 Modal - 일차로 변경
    self.dcDayCar = function(){
        CarType.allDayCar().then(function(result){
            if(result.length > 0) {
                self.dayCarList = result;
                self.mdDayCarList.show();
            }else{
                $cordovaToast.showShortBottom('등록된 일차가 없습니다.');
            }
        });
    };

    // 지정 할인 선택 Modal - 업체 선택 클릭
    self.procCooperDc = function(coop){
        var result = cal_cooper(self.tempGarage, coop);
        self.tempGarage.total_amount = result.total_amount;
        self.tempGarage.discount_cooper = result.discount_cooper;
        if(result.discount_cooper < result.total_amount){
            // 남은 금액 결제
            self.calDiscount();     //결제해야될 금액 계산 (미리세팅용)
            self.mdPayInput.show();
            self.mdDcInput.hide();
        }else{
            // 바로 출차
            self.procOutCar();
            self.mdDcInput.hide();
        }
    };

    // 일차 요금으로 변경
    self.dayCar = function(cartype){
        self.tempGarage.car_type_title = cartype.car_type_title;
        self.tempGarage.minute_unit = cartype.minute_unit;
        self.tempGarage.minute_free = cartype.minute_free;
        self.tempGarage.amount_unit = cartype.amount_unit;
        self.tempGarage.basic_amount = cartype.basic_amount;
        self.tempGarage.basic_minute = cartype.basic_minute;
        self.tempGarage.total_amount = cal_garage(self.tempGarage);

        self.tempDayCar = {};
        self.tempDayCar.idx = self.tempGarage.idx;
        self.tempDayCar.car_type_title = cartype.car_type_title;
        self.tempDayCar.minute_unit = cartype.minute_unit;
        self.tempDayCar.minute_free = cartype.minute_free;
        self.tempDayCar.amount_unit = cartype.amount_unit;
        self.tempDayCar.basic_amount = cartype.basic_amount;
        self.tempDayCar.basic_minute = cartype.basic_minute;

        $cordovaToast.showShortBottom('일차 요금이 적용되었습니다.');

        self.calDiscount();     //결제해야될 금액 계산 (미리세팅용)

        self.mdPayInput.show();
        self.mdDayCarList.hide();   //현재창 닫음
    };

    // 결제 Modal - 결제없이 출차 처리 버튼
    self.forceOut = function(){
        $ionicPopup.confirm({
            title: '출차', template: '출차 하시겠습니까?', okText: '예',cancelText: '아니오' 
        }).then(function (res) {
            if(res) {
                self.procOutCar();   //출차
            }
        });
    };
    
    // month 결제 화면 닫기
    self.closePayMonth = function(){
        self.mdMonthPay.hide();
        self.month = {};
        reload();
    };

    self.openAddMonth = function(){
        self.month = {};
        self.dates.start_date = new Date();
        self.dates.end_date = new Date(Date.parse(self.dates.start_date) + 30 * 1000 * 60 * 60 * 24);

        self.mdMonth.show();
    };

    //월차 등록, 수정
    self.insertMonth = function(){
        console.log('insert month start');

        self.month.start_date = getStartDate(self.dates.start_date);    //시작일 00:00:00
        self.month.end_date = getEndDate(self.dates.end_date);          //종료일 23:59:59

        if(!self.month.car_num) return $ionicPopup.alert({title: '알림',template: '차량번호를 입력하지 않았습니다.'});
        if(!self.month.car_name) return $ionicPopup.alert({title: '알림',template: '차종을 입력하지 않았습니다.'});
        if(!self.month.car_type_title) return $ionicPopup.alert({title: '알림',template: '구분을 입력하지 않았습니다.'});
        if(!self.month.start_date) return $ionicPopup.alert({title: '알림',template: '시작날짜를 입력하지 않았습니다.'});
        if(!self.month.end_date) return $ionicPopup.alert({title: '알림',template: '종료날짜를 입력하지 않았습니다.'});
        if(self.month.start_date >= self.month.end_date)
            return $ionicPopup.alert({title: '알림',template: '시작날짜가 종료날짜보다 크거나 같을 수 없습니다.'});
        if(!self.month.amount) return $ionicPopup.alert({title: '알림',template: '월차금액을 입력하지 않았습니다.'});
        if(!self.month.user_name) return $ionicPopup.alert({title: '알림',template: '차주명을 입력하지 않았습니다.'});
        if(!self.month.mobile) return $ionicPopup.alert({title: '알림',template: '연락처를 입력하지 않았습니다.'});

        if(!self.month.idx) {
            Month.insert(self.month).then(function (res) {
                console.log("insertId: " + res.insertId);
                self.month.idx = res.insertId;

                self.mdMonth.hide();

                self.openPayMonth();
                reload();

                if(!self.month.is_ext){
                    $cordovaToast.showShortBottom("차량번호 ["+ self.month.car_num +"] 새로운 월차가 추가되었습니다.");
                }else{
                    $cordovaToast.showShortBottom("차량번호 ["+ self.month.car_num +"] 연장된 월차가 추가되었습니다.");
                }
            }, function (err) {
                console.log(err);
            });
        }else{
            if(self.before_is_stop=='N' && self.month.is_stop=='Y'){
                self.month.stop_date = new Date().getTime();
            }
            Month.update(self.month).then(function(res){

                $cordovaToast.showShortBottom("차량번호 ["+ self.month.car_num +"] 월차가 수정되었습니다.");
                self.mdMonth.hide();
                reload();
            },function(err){
                console.log(err);
            });
        }
    };

    //월차 결제 Modal
    self.openPayMonth = function(){
        if(!self.month.pay_amount) self.month.pay_amount = 0;
        self.month.pay_money = self.month.amount - self.month.pay_amount;
        self.mdMonthPay.show();
        self.mdMonth.hide();
    };

    //월차 수정
    self.openEditMonth = function(month){
        self.month = angular.copy(month);
        self.before_is_stop = month.is_stop;
        self.dates.start_date = new Date(self.month.start_date);
        self.dates.end_date = new Date(self.month.end_date);

        self.mdMonth.show();
    };

    //월차 연장
    self.openExtMonth = function(){
        delete self.month.idx;
        self.month.is_ext = true;

        var end_date = self.month.end_date;
        if(getStartDate(new Date(end_date)) < getStartDate(new Date())){
            self.dates.start_date = new Date();
            self.dates.end_date = new Date(Date.parse(self.dates.start_date) + 30 * 1000 * 60 * 60 * 24);
        }else{
            self.dates.start_date = new Date(end_date + 1000 * 60 * 60 * 24);
            self.dates.end_date = new Date(Date.parse(self.dates.start_date) + 30 * 1000 * 60 * 60 * 24);
        }
    };
    

    // 결제Modal - 카드 결제 버튼
    self.doCard = function(view){
        if(view=='garage') {
            $ionicPopup.confirm({
                title: '카드 결제',
                template: self.tempGarage.pay_money.num_format() + '원을 카드 결제 하시겠습니까?',
                okText: '예', cancelText: '아니오'
            }).then(function (res) {
                if (res) {
                    // 결제 실행
                    self.payCard(self.tempGarage.idx, 'garage', self.tempGarage.pay_money, 'outCar');
                }
            });
        }else if(view=='month'){
            $ionicPopup.confirm({
                title: '월차 카드 결제',
                template: self.month.pay_money.num_format() + '원을 카드 결제 하시겠습니까?'
            }).then(function (res) {
                if(res){
                    self.payCard(self.month.idx, 'month', self.month.pay_money, 'month');
                }
            });    
        }else{
            $cordovaToast.showShortBottom('카드 결제 위치 에러');
        }
    };

    // 결제Modal - 현금 결제 버튼
    self.doCash = function(view){
        if(view=='garage') {
            $ionicPopup.confirm({
                title: '현금 결제',
                template: self.tempGarage.pay_money.num_format() + '원을 현금 결제 하시겠습니까?'
            }).then(function (res) {
                if (res) {
                    var params = {
                        lookup_idx: self.tempGarage.idx,
                        lookup_type: 'garage',
                        pay_type: 'cash',
                        pay_amount: self.tempGarage.pay_money
                    };

                    if(self.tempDayCar.idx){
                        Garage.updateDayCar(self.tempDayCar);
                    }

                    Payment.insert(params).then(function (res2) {
                        $cordovaToast.showShortBottom('현금 결제처리 완료되었습니다.');
                        self.openCash();

                        self.procOutCar();
                    });
                }
            });
        }else if(view=='month'){
            $ionicPopup.confirm({
                title: '현금 결제',
                template: self.month.pay_money.num_format() + '원을 현금 결제 하시겠습니까?'
            }).then(function (res) {
                if (res) {
                    var params = {
                        lookup_idx: self.month.idx,
                        lookup_type: 'month',
                        pay_type: 'cash',
                        pay_amount: self.month.pay_money
                    };

                    if(self.tempDayCar.idx){
                        Garage.updateDayCar(self.tempDayCar);
                    }

                    Payment.insert(params).then(function (res2) {

                        self.openCash();
                        self.closeModal();

                        reload();
                        $cordovaToast.showShortBottom('현금 결제처리 완료되었습니다.');
                    });
                }
            });
        }else{
            $cordovaToast.showShortBottom('현금 결제 위치 에러');
        }
    };
    
    // 상세정보 Modal - 결제 취소 버튼 
    self.openPayCancel = function(view){
        if(view=='garage') {
            Payment.allForGarage(self.garage).then(function (result) {
                if (result.length > 0) {
                    self.payList = result;
                    self.mdPayCancel.show();
                } else {
                    $ionicPopup.alert({title: '알림', template: '결제내역이 존재하지 않습니다.'});
                }
            }, function (err) {
                console.log(err);
            });
        }else if(view=='month'){
            Payment.allForMonth(self.month).then(function (result) {
                if (result.length > 0) {
                    self.payList = result;
                    self.mdPayCancel.show();
                } else {
                    $ionicPopup.alert({title: '알림', template: '결제내역이 존재하지 않습니다.'});
                }
            }, function (err) {
                console.log(err);
            });
        }else if(view=='temp'){
            Payment.allForTemp().then(function(result){
                if(result.length > 0){
                    self.payList = result;
                    self.mdPayCancel.show();
                }else {
                    $ionicPopup.alert({title: '알림', template: '결제내역이 존재하지 않습니다.'});
                }
            });
        }else{
            $cordovaToast.showShortBottom('카드 결제취소 위치 에러');
        }
    };

    // 상세정보 Modal - 출차 취소 버튼
    self.cancelOutCar = function(){
        $ionicPopup.confirm({
            title: '확인',
            template: '출차 취소 하시겠습니까?',
            okText: '예', cancelText: '아니오'
        }).then(function (res) {
            if (res) {
                var params = angular.copy(self.garage);
                Garage.cancelOutCar(params).then(function(result){
                    self.mdGarageView.hide();
                    $cordovaToast.showShortBottom('차량번호 [ '+ self.garage.car_num +' ]의 출차취소가 완료 되었습니다');
                    reload();
                },function(err){console.log(err);});
            }
        });

    };

    // 결체 취소 리스트에서 선택했을때 DB에서 결제취소
    self.procPayCancel = function(pay){
        if(pay.pay_type == 'card'){
            self.payCardCancel(pay.idx, 'garage');
        }else{
            //현금일때 돈통 열어줌
            Payment.cancelPay(pay).then(function(result){
                self.openCash();
                self.closeModal();
                $cordovaToast.showShortBottom('현금 취소처리 완료되었습니다.');
                reload();
            });
        }
    };

    //---------------------------------------
    // 이하는 xSerial
    //---------------------------------------

    // 단말기에서 결제 신호가 들어오면 처리
    self.complete = function(res){
        console.log('self.complete start');
        if(self.pay_success == 'Y'){    //결제 성공일때

            self.payObj.code = res.code;
            self.payObj.ret_code = res.ret_code;
            self.payObj.success_code = res.success_code;
            self.payObj.success_date = res.success_date;
            self.payObj.is_cancel = 'N';
            
            if(self.tempDayCar.idx){
                Garage.updateDayCar(self.tempDayCar);
            }

            Payment.update(self.payObj).then(function(res2){
                if(self.pay_location == 'outCar'){
                    self.procOutCar();
                }else if(self.pay_location == 'month'){
                    self.closeModal();
                    self.month = {};
                }

                self.initPayVariables();
                hide();
                reload();
            },function(err){ console.log('DB error! payment.update'); });

        }else if(self.pay_success == 'C'){      //결제 취소 성공일때
            // DB 상의 결제를 취소로 전환
            self.payObj.idx = res.seq;
            Payment.cancelPay(self.payObj).then(function(){
                self.initPayVariables();
                hide();
                self.closeModal();
                reload();
            }, function(err){ console.log(err); });
        }else if(self.pay_success == 'N'){      //결제 실패일때
            self.initPayVariables();
            hide();
        }
        clearTimeout(self.timeID2);
        console.log('self.complete end');
    };
    
    var show = function(message, duration) {
        $ionicLoading.show({
            template: message ? message : '단말입력 대기중..',
            duration: duration ? duration : 5000
        });
    };
    var hide = function(){
        $ionicLoading.hide();
    };
    var inited = false;

    var receive = "";
    var timeID;

    self.initX = function(){
        if (window.cordova && !inited) {
            serial.requestPermission({},
                function success(success) {
                    console.log(success);
                    var opts = {
                        baudRate: '115200'
                    };
                    serial.open(opts, function success() {
                        $cordovaToast.showShortBottom("카드단말기가 연결 되었습니다.");
                        hide();
                        inited = true;
                        serial.registerReadCallback(
                            function success(data){
                                var view = new Uint8Array(data);
                                if(view.length >= 1) {
                                    clearTimeout(timeID);
                                    var ksc = new TextDecoder("ASCII").decode(view);
                                    receive = receive + ksc.toString();
                                    //receive = encodeURI(receive);
                                    timeID = setTimeout(function(){
                                        //반환되는 전문코드
                                        var res = {
                                            code : receive.substr(5, 2),
                                            ret_code : receive.substr(7, 4),
                                            success_code : receive.substr(86, 8),
                                            success_date : receive.substr(98, 12),
                                            seq : receive.substr(168, 20)
                                        };

                                        //성공일때
                                        if(res.code == "I1" || res.code == "I2" || res.code == "I4"){
                                            if(res.ret_code == "0000"){
                                                if(res.code == "I1"){
                                                    self.pay_success = 'Y';    //결제 성공시
                                                    $cordovaToast.showShortBottom("카드결제 성공 : 승인번호 " + res.success_code);
                                                }else if(res.code == "I2"){
                                                    self.pay_success = 'C';    //취소 성공시
                                                    $cordovaToast.showShortBottom("직전거래 취소 : 마지막 결제가 취소되었습니다. / 승인번호 " + res.success_code);
                                                }else if(res.code == "I4"){
                                                    self.pay_success = 'C';    //취소 성공시
                                                    $cordovaToast.showShortBottom("거래 취소 : 선택한 거래가 취소되었습니다. / 승인번호 " + res.success_code);
                                                }
                                            }else if(res.ret_code == "8433"){
                                                self.pay_success = 'N';
                                                $cordovaToast.showShortBottom("사용자취소");
                                            }else if(res.ret_code == "8313"){
                                                self.pay_success = 'N';
                                                $cordovaToast.showShortBottom("한도초과");
                                            }else{
                                                self.pay_success = 'N';
                                                $cordovaToast.showShortBottom("거래실패 : 코드 - " + res.ret_code);
                                                clearTimeout(self.timeID2);
                                            }

                                            self.complete(res);    //결제 종료
                                        }else if(res.code == 'D1'){
                                            if(res.ret_code == '9998'){
                                                $cordovaToast.showShortBottom("거래실패 : IC 카드 빠짐");
                                            }else{
                                                self.pay_success = 'N';
                                                $cordovaToast.showShortBottom("거래실패 : 코드 - " + res.ret_code);
                                            }
                                            self.complete(res);    //결제 종료

                                        }else if(res.code == 'D4'){
                                            if(res.ret_code == '9999'){
                                                $cordovaToast.showShortBottom("입력 취소하였습니다");
                                                hide();
                                            }else if(res.ret_code == '9998'){
                                                $cordovaToast.showShortBottom("거래실패 : IC 카드 빠짐");
                                                hide();
                                            }else {
                                                $cordovaToast.showShortBottom("거래실패 : 코드 - " + res.ret_code);
                                                clearTimeout(self.timeID2);
                                            }
                                        }
                                        console.log("receive : " + res.receive);
                                        console.log("seq : " + res.seq + "(" + parseInt(res.seq) + ")");
                                        console.log("ret_code : " + res.ret_code);
                                        console.log("success_code : " + res.success_code);
                                        console.log("success_date : " + res.success_date);
                                        console.log("code : " + res.code);
                                        receive = "";
                                    },500);
                                }
                            });
                    }, function error() {
                        $cordovaToast.showShortBottom("카드단말기가 연결되지 않았습니다.");
                        inited = false;
                    });
                },
                function error(error) {
                    console.log(error);
                    $cordovaToast.showShortBottom("카드단말기에 접근권한을 부여해야합니다. \n" + error);
                });
        }else{
            $cordovaToast.showShortBottom("이미 단말기가 연결되어 있거나, 단말기를 사용할 수 있는 환경이 아닙니다.");
        }
    };

    self.Sender = function(content, is_init){
        if(!inited){
            hide();
            show("아직 단말기가 연결되지않아 먼저 연결을 시도합니다. 연결이 성공하면 재시도 해주세요.", 3000);
            setTimeout(function(){
                self.initX();
            },500);
            return;
        }
        if(is_init){
            $cordovaToast.showShortBottom("단말기를 초기화 한 다음 호출합니다. 잠시만 기다려주세요.");
            serial.writeHex("02000604FD544D0378EF");
            setTimeout(function(){
                self.write(content);
            },500);
        }else{
            self.write(content);
        }
    };

    self.doPrint = function(date,time,carnum,srl,message){
        var shopname = "화 진 S";
        var shopaddr = "중구 부평동 3가 62-2.7.8";
        var shoptel = "051-333-5646";

        ShopInfo.all().then(function(result){
            if(result.length > 0){
                shopname = result[0].shop_name;
                shopaddr = result[0].address;
                shoptel = result[0].tel;
            }

            var str = "\x1D!\x01           [ ";
            str += shopname;
            str += " 주 차 영 수 증 ]\x1D!\0\r\n             " + shopaddr;
            str += "\r\n               (전화) " + shoptel;
            str += "\r\n 입차년월 : " + date;
            str += "\r\n\r\n\x1D!\x01  입차시간 :                " + time;
            str += "\x1D!\0\x1D!\x01  차량번호 :                " + carnum;
            str += "\x1D!\0\r\n#seq : " + srl;
            str += "\r\n" + message + "\r\n===============================================\r\n맞춤형 POS,웹/앱 개발,기업 디자인 문의\r\nhttp://xiso.co.kr \r\n\r\n\r\n\r\n\r\n\x1Bi\r\n";

            if(!inited){
                show("아직 단말기가 연결되지않아 먼저 연결을 시도합니다. 연결이 성공하면 재시도 해주세요.");
                setTimeout(function(){
                    self.initX();
                },500);
            }else{
                serial.write(str);
            }
        });
    };

    self.write = function(content){
        serial.writeHex(content,
            function sr(success){
                console.log("Put : " + success);
            },
            function er(error){
                console.log("error:" + error);
            }
        );
    };
    
    self.stringToByteHex = function(str){
        var bytes = []; // char codes
        var bytesv2 = []; // char codes

        for (var i = 0; i < str.length; ++i) {
            var code = str.charCodeAt(i);

            bytes = bytes.concat([code]);

            bytesv2 = bytesv2.concat([code & 0xff, code / 256 >>> 0]);
        }

        // 72, 101, 108, 108, 111, 31452
        //console.log('bytes', bytes.join(', '));

        // 72, 0, 101, 0, 108, 0, 108, 0, 111, 0, 220, 122
        //console.log('bytesv2', bytesv2.join(', '));
        return bytes.map(function(byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    };

    self.LPAD = function(s, padLength, padString){

        while(s.length < padLength) s = padString + s;
        //console.log("run LPAD : " + s.length + " -> " + padLength);
        return s;
    };

    self.payCard = function(lookup_idx, lookup_type, pay_amount, pay_location){
        //단말기 연결 확인
        if(!inited){
            $cordovaToast.showShortBottom('결제 실패 - 카드단말이 연결되지 않았습니다. 재접속 후 다시 시도해주세요.');
            return false;
        }

        show('카드 결제를 요청중입니다..', 50000);
        self.timeID2 = setTimeout(function(){
            hide();
            serial.writeHex("02000604FD544D0378EF");
        }, 40000);
        self.initPayVariables();
        self.pay_location = pay_location;   //결제 요청한 위치를 저장

        self.payObj.lookup_idx = lookup_idx;
        self.payObj.lookup_type = lookup_type;
        self.payObj.pay_type = 'card';
        self.payObj.pay_amount = pay_amount;

        Payment.insertFirst(self.payObj).then(function(result){ //빈 payment insert
            if(result.insertId) {
                self.payObj.idx = result.insertId;

                //stx, len, cnt, cmd, data, ext, crc
                var stx = "02";
                var lentocmd = "006F04FD";
                //코드2, WCC1, 카드번호 40,          할부현금영수증2, 승인일시yymmdd(6), 승인번호 12, 금액 8, 봉사료8, VAT 8, 거래번호 20
                //D1                                         00yymmdd    00000000    1004       0      9100000000000000000000
                var card = "D1";
                var data = card + "                                         00                  ";
                data += self.LPAD(pay_amount.toString(),8," ");
                data += "       0      91";
                data += self.LPAD(result.insertId.toString(),20,"0");

                var datahex = self.stringToByteHex(data);
                var ext = "03";

                serial.getCRC("$" + lentocmd + datahex + ext,function(success){
                    str = stx + lentocmd + datahex + ext + success;
                    self.Sender(str, true);
                });
            }
            else{
                hide();
                $cordovaToast.showShortBottom('결제 실패 - 결제 데이터를 DB에 넣는데 실패하였습니다. -1');
            }
        }, function(err){ hide(); $cordovaToast.showShortBottom('결제 실패 - 결제 데이터를 DB에 넣는데 실패하였습니다. -2'); });
    };

    self.payCardCancel = function(pay_idx, pay_location){
        //단말기 연결 확인
        if(!inited){
            self.closeModal();
            $cordovaToast.showShortBottom('취소 실패 - 카드단말이 연결되지 않았습니다. 재접속 후 다시 시도해주세요.');
            reload();
            return false;
        }

        show('카드 결제 취소를 요청중입니다..', 50000);
        self.timeID2 = setTimeout(function(){
            hide();
            serial.writeHex("02000604FD544D0378EF");
        }, 40000);

        self.initPayVariables();
        self.pay_location = pay_location;   //결제 요청한 위치를 저장
        self.payObj.idx = pay_idx;

        Payment.getByIdx(pay_idx).then(function (result) {
            if (result) {
                //stx, len, cnt, cmd, data, ext, crc
                var stx = "02";
                var lentocmd = "006F04FD";
                //코드2, WCC1, 카드번호 40,          할부현금영수증2, 승인일시yymmdd(6), 승인번호 12, 금액 8, 봉사료8, VAT 8, 거래번호 20
                //D1                                         00yymmdd    00000000    1004       0      9100000000000000000000
                var card = "D4";   // D4 : 취소, D1 : 결제
                var data = card + "                                         00";
                data += result.success_date.substr(0,6) + "    " + result.success_code;
                data += self.LPAD(result.pay_amount.toString(),8," ");
                data += "       0      91";
                data += self.LPAD(pay_idx.toString(),20,"0");
                var datahex = self.stringToByteHex(data);
                var ext = "03";

                serial.getCRC("$" + lentocmd + datahex + ext,function(success){
                    str = stx + lentocmd + datahex + ext + success;
                    self.Sender(str, true);
                });
            } else {
                hide();
                $cordovaToast.showShortBottom('결제 취소 실패 - DB에서 해당하는 Sequence를 찾지 못했습니다');
            }
        });
    };

    self.payCash = function(amount,cash_type,sequence){
        //stx, len, cnt, cmd, data, ext, crc
        var stx = "02";
        var lentocmd = "006F04FD";

        //코드2, WCC1, 카드번호 40,          할부현금영수증2, 승인일시yymmdd(6), 승인번호 12, 금액 8, 봉사료8, VAT 8, 거래번호 20
        //B1                                         00                      1004       0      9100000000000000000000
        var data = "B1                                         ";
        data += cash_type;
        data += "                  ";
        data += self.LPAD(amount.toString(),8," ");
        data += "       0      91";
        data += self.LPAD(sequence.toString(),20,"0");
        var datahex = self.stringToByteHex(data);

        var ext = "03";

        serial.getCRC("$" + lentocmd + datahex + ext,function(success){
            str = stx + lentocmd + datahex + ext + success;
            self.Sender(str, true);
        });
    };
    
    self.openCash = function() {
        self.Sender("02000604FD4344039EA6", false);
    };
    
    

    return self;

});