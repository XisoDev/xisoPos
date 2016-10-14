xpos.controller('PanelCtrl', function ($scope, $cordovaSQLite, $state, MultipleViewsManager) {
    $scope.mainField = "";

    $scope.inputField = function(data){
        $scope.mainField = $scope.mainField + data;
    }

    $scope.mainFieldInit = function(){
        delete $scope.mainField;
        $scope.mainField = "";
    }

    // if (MultipleViewsManager.isActive()) {
    //     MultipleViewsManager.updateView('view-message', { messageId: $scope.selectedMessageId });
    // }
    //
    // $scope.changeMessage = function (message) {
    //     $scope.selectedMessageId = message.id;
    //     console.log(MultipleViewsManager.isActive());
    //     if (MultipleViewsManager.isActive()) {
    //         MultipleViewsManager.updateView('view-message', { messageId: message.id });
    //     } else {
    //         $state.go('viewMessage', { messageId: message.id });
    //     }
    // };
});