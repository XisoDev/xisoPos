//var db = null;
var xpos = angular.module('xisoPos', ['ionic', 'ngCordova','ionicMultipleViews','ion-floating-menu'])

	.run(function ($ionicPlatform,DB,xSerial,$ionicHistory,$ionicPopup,$rootScope,$document,$window) {
		$ionicPlatform.ready(function () {
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			}

			if (window.StatusBar) {
				StatusBar.styleDefault();
			}
			DB.init();
			xSerial.init();
		});

		//back button action
		$ionicPlatform.registerBackButtonAction(function(e) {

		  e.preventDefault();

			$rootScope.exitApp = function() {
		    $ionicPopup.confirm({
		      title: "<strong>앱을 종료할까요?</strong>",
		      template: '확인하시면 앱을 종료할 수 있습니다.',
		      buttons: [
		        { text: '취소' },
		        {
		          text: '<b>종료</b>',
		          type: 'button-positive',
		          onTap: function(e) {
		            ionic.Platform.exitApp();
		          }
		        }
		      ]
		    });
		  }

		  if ($ionicHistory.backView().stateName ==  'mainLayout.tabs.current'){
			  $rootScope.exitApp();
		  } else {
			$ionicHistory.goBack();
		  }
		  return false;
		  }, 101);

		//fake backbutton
		var document = $document[0];

		function triggerBackButton() {
			var backButtonEvent = document.createEvent('Events');
			backButtonEvent.initEvent('backbutton', false, false);
			document.dispatchEvent(backButtonEvent);
		}

		function registerBackButtonFake() {
			document.addEventListener('keyup', function (event) {
				// Alt+Ctrl+<
				if (event.altKey && event.ctrlKey && event.keyCode === 188) {
					triggerBackButton();
				}
			});
		}

		if (!$window.cordova) {
			$ionicPlatform.ready(registerBackButtonFake);
		}
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
						controller: 'cooperCtrl'
					}
				}
			})
			.state('mainLayout.tabs.calcu', {
				url: '/calcu',
				views: {
					'tab-calcu': {
						templateUrl: 'templates/calcu.html',
						controller: 'calcuCtrl'
					}
				}
			})
			.state('mainLayout.tabs.config', {
				url: '/config',
				views: {
					'tab-config': {
						templateUrl: 'templates/config.html',
						controller: 'configCtrl'
					}
				}
			})
			.state('mainLayout.tabs.configDefault', {
				url: '/configDefault',
				views: {
					'tab-config': {
						templateUrl: 'templates/config.default.html',
						controller: 'configCtrl'
					}
				}
			})
			.state('mainLayout.tabs.configCartype', {
				url: '/configCartype',
				views: {
					'tab-config': {
						templateUrl: 'templates/config.cartype.html',
						controller: 'configCtrl'
					}
				}
			});

		$urlRouterProvider.otherwise('/mainLayout/tabs/current');
	});

