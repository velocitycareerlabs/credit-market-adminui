(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewAccountTransferDetailsController: function (scope, resourceFactory, location, routeParams, VEL_DECIMAL_POINTS) {

            scope.vel_decimal_points = VEL_DECIMAL_POINTS;

            resourceFactory.accountTransferResource.get({transferId: routeParams.id}, function (data) {
                scope.transferData = data;
            });
        }
    });
    mifosX.ng.application.controller('ViewAccountTransferDetailsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'VEL_DECIMAL_POINTS', mifosX.controllers.ViewAccountTransferDetailsController]).run(function ($log) {
        $log.info("ViewAccountTransferDetailsController initialized");
    });
}(mifosX.controllers || {}));
