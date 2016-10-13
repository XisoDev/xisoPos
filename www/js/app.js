var db = null;
var xpos = angular.module('xisoPos', ['ionic', 'ngCordova','ionicMultipleViews'])

	.run(function ($ionicPlatform,$cordovaSQLite) {
		$ionicPlatform.ready(function () {
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			}
			
			if (window.StatusBar) {
				StatusBar.styleDefault();
			}
			if (window.cordova) {
				db = $cordovaSQLite.openDB("xpos.db");
			}else{
				db = window.openDatabase("xpos.db", '1', 'my', 1024 * 1024 * 100);

			}
			$query = "CREATE TABLE IF NOT EXISTS config (id integer primary key, firstname text, lastname text)";
			$cordovaSQLite.execute(db,$query);
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
				url: '/current',
				views: {
					'tab-current': {
						templateUrl: 'templates/current.html',
						controller: 'currentCtrl'
					}
				}
			})
			.state('mainLayout.tabs.history', {
				url: '/history',
				views: {
					'tab-history': {
						templateUrl: 'templates/history.html',
						controller: 'historyCtrl'
					}
				}
			})
			.state('mainLayout.tabs.month', {
				url: '/month',
				views: {
					'tab-month': {
						templateUrl: 'templates/month.html',
						controller: 'monthCtrl'
					}
				}
			})
			.state('mainLayout.tabs.cooper', {
				url: '/cooper',
				views: {
					'tab-cooper': {
						templateUrl: 'templates/cooper.html',
						controller: 'HistoryCarsCtrl'
					}
				}
			})
			.state('mainLayout.tabs.calcu', {
				url: '/calcu',
				views: {
					'tab-calcu': {
						templateUrl: 'templates/calcu.html',
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

