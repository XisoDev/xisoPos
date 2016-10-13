xpos.controller('CurrentCarsCtrl', function ($scope, $stateParams, MultipleViewsManager, MessageService) {
		$scope.message = MessageService.get($stateParams.messageId);

		MultipleViewsManager.updated('view-message', function (params) {
			$scope.message = MessageService.get(params.messageId);
		});
	});