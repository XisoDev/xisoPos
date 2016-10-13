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

