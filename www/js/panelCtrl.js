xpos.controller('PanelCtrl', function ($scope, $state, MultipleViewsManager, MessageService) {
    $scope.messages = MessageService.all();
    $scope.selectedMessageId = 0;

    if (MultipleViewsManager.isActive()) {
        MultipleViewsManager.updateView('view-message', { messageId: $scope.selectedMessageId });
    }

    $scope.changeMessage = function (message) {
        $scope.selectedMessageId = message.id;
        console.log(MultipleViewsManager.isActive());
        if (MultipleViewsManager.isActive()) {
            MultipleViewsManager.updateView('view-message', { messageId: message.id });
        } else {
            $state.go('viewMessage', { messageId: message.id });
        }
    };
})