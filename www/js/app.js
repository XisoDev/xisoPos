var xpos = angular.module('xisoPos', ['ionic', 'ionicMultipleViews'])

	.run(function ($ionicPlatform) {
		$ionicPlatform.ready(function () {
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			}
			
			if (window.StatusBar) {
				StatusBar.styleDefault();
			}
		});
	})

	.config(function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('masterDetail', {
				url: '/masterDetail',
				templateUrl: 'templates/master-detail-layout.html',
				abstract: true
			})
			//입출차 기록
			.state('masterDetail.currentCars', { 
				url: '/currentCars',
				views: {
					'screen': {
						templateUrl: 'templates/current_cars.html',
						controller: 'CurrentCarsCtrl'
					},

					'fixed-panel': {
						templateUrl: 'templates/panel.html',
						controller: 'PanelCtrl'
					}
				}
			})
			//월차
			.state('masterDetail.monthCars', {
				url: '/monthCars',
				views: {
					'screen': {
						templateUrl: 'templates/month_cars.html',
						controller: 'MonthCarsCtrl'
					},

					'fixed-panel': {
						templateUrl: 'templates/panel.html',
						controller: 'PanelCtrl'
					}
				}
			})
			//지정주차
			.state('masterDetail.cooperCars', {
				url: '/cooperCars',
				views: {
					'screen': {
						templateUrl: 'templates/cooper_cars.html',
						controller: 'CooperCarsCtrl'
					},

					'fixed-panel': {
						templateUrl: 'templates/panel.html',
						controller: 'PanelCtrl'
					}
				}
			})
			//정산
			.state('masterDetail.calcu', {
				url: '/calcu',
				views: {
					'screen': {
						templateUrl: 'templates/calcu.html',
						controller: 'CalcuCtrl'
					},

					'fixed-panel': {
						templateUrl: 'templates/panel.html',
						controller: 'PanelCtrl'
					}
				}
			})
			//설정
			.state('masterDetail.setting', {
				url: '/setting',
				views: {
					'screen': {
						templateUrl: 'templates/setting.html',
						controller: 'SettingCtrl'
					},

					'fixed-panel': {
						templateUrl: 'templates/panel.html',
						controller: 'PanelCtrl'
					}
				}
			});

		$urlRouterProvider.otherwise('/masterDetail/currentCars');
	});

