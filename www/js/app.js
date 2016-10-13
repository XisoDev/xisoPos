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
			.state('mainLayout', {
				url: '/mainLayout',
				templateUrl: 'templates/main_layout.html',
				abstract: true
			})
			//입출차 기록
			.state('mainLayout.tabs', {
				url: '/tabs',
				views: {
					'screen': {
						templateUrl: 'templates/tabs.html'
					},

					'fixed-panel': {
						templateUrl: 'templates/panel.html',
						controller: 'PanelCtrl'
					}
				}
			})
			.state('mainLayout.tabs.current', {
				url: '/currentCars',
				views: {
					'tab-current': {
						templateUrl: 'templates/current_cars.html',
						controller: 'CurrentCarsCtrl'
					}
				}
			})
			.state('mainLayout.tabs.history', {
				url: '/historyCars',
				views: {
					'tab-history': {
						templateUrl: 'templates/history_cars.html',
						controller: 'HistoryCarsCtrl'
					}
				}
			})
			.state('mainLayout.tabs.config', {
				url: '/config',
				views: {
					'tab-config': {
						templateUrl: 'templates/config.html',
						controller: 'CurrentCarsCtrl'
					}
				}
			});

		$urlRouterProvider.otherwise('/mainLayout/tabs/currentCars');
	});

