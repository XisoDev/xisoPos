xpos
    .controller('configCtrl', function ($scope, $ionicModal, ShopInfo) {
        $scope.defaultParams = {};

        $scope.config_default_init = function(){
            $scope.defaultParams.shop_name = "";
            $scope.defaultParams.mobile = "";
            $scope.defaultParams.tel = "";
            $scope.defaultParams.fax = "";
            $scope.defaultParams.user_name = "";
            $scope.defaultParams.address = "";

            ShopInfo.all().then(function(result){
                if(result) $scope.defaultParams = result[0];
            });
            console.log('shop info loaded!!');
        };

        $scope.shouldShowDelete = false;
        $scope.showDelete = function(){
            $scope.shouldShowDelete = true;
        }
        $scope.hideDelete = function(){
            $scope.shouldShowDelete = false;
        }

        $ionicModal.fromTemplateUrl('templates/config.addcartype.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.addCartypeWindow = modal;
        });
        $scope.openCartype = function() {
            $scope.addCartypeWindow.show();
        };
        $scope.closeCartype = function() {
            $scope.addCartypeWindow.hide();
        };
        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.addCartypeWindow.remove();
        });
        // Execute action on hide modal
        $scope.$on('addCartypeWindow.hidden', function() {
            console.log('hidden cartype');
        });
        // Execute action on remove modal
        $scope.$on('addCartypeWindowZ.removed', function() {
            console.log('removed cartype');
        });
        // $scope.documents = [];
        // $scope.document = null;
        // // Get all the documents
        // Document.all().then(function(documents){
        //     $scope.documents = documents;
        // });
        // // Get one document, example with id = 2
        // Document.getById(2).then(function(document) {
        //     $scope.document = document;
        // });

        $scope.insertShopInfo = function(){
            ShopInfo.delete().then(function(res) {
                console.log(res);

                ShopInfo.insert($scope.defaultParams).then(function(res) {
                    console.log("insertId: " + res.insertId);
                    $scope.config_default_init();
                }, function (err) {
                    console.error(err);
                });
            }, function (err) {
                console.error(err);
            });
        };
    });