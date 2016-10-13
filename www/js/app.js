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
			.state('masterDetail', {
				url: '/masterDetail',
				templateUrl: 'templates/master-detail-layout.html',
				abstract: true
			})
			
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
			});

		$urlRouterProvider.otherwise('/masterDetail/currentCars');
	});

