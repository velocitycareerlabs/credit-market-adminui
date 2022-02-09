(function (module) {
    mifosX.services = _.extend(module, {
        LockAuthenticationProvider: function (localStorageService, authenticationService, resourceFactory, httpService, $interval, scope, webStorage, $window, location) {

            var domain = '$AUTH0_SERVER_URL';
            var clientID = '$AUTH0_CLIENT_ID';
            var connection = '$AUTH0_CONNECTION_ID';

            function redirectToAuth0(){
                 window.location.href = 'https://'+
                         domain+'/authorize?response_type=token&client_id='+
                         clientID+'&connection='+
                         connection+'&redirect_uri='+window.location.href+'&display=popup';
            }

            //initialise application
            this.initialiseAuth0 =  function() {
                var routeParams = parseQueryString(window.location.search + window.location.hash.replace('#','').replace('/',''));

                if(routeParams.access_token){
                    httpService.setAuthorization(routeParams.access_token, true);
                    localStorageService.addToCookies('X-Authorization-Token', routeParams.access_token);
                    localStorageService.addToLocalStorage('tokendetails', {
                        "accessToken" : routeParams.access_token,
                        "expiresIn": routeParams.expires_in
                    });

                    var tokensObject = tokensInFineractLocalStorageStandard(routeParams);
                    updateAccessDetails(tokensObject);

                    //fetch user details and redirect after
                    resourceFactory.userTokenDetails.get(function (response) {
                        localStorageService.addToLocalStorage('userData', response);
                        scope.$broadcast("UserAuthenticationSuccessEvent", response);
                    });

                }else{
                    redirectToAuth0();
                }
            }

            var tokensInFineractLocalStorageStandard = function(routeParams){
                var response =  {
                      "data":{
                          "access_token" : routeParams.access_token,
                          "expires_in": routeParams.expires_in
                      }
               }
               return response;
            }

            var updateAccessDetails = function(response){
               var data = response.data;
               localStorageService.addToLocalStorage('tokendetails', data);
            }


            scope.$on("OnUserPreLogout", function (event) {
               localStorageService.removeFromCookies('X-Authorization-Token');
               this.initialiseAuth0();
            });

            var parseQueryString = function(str){
                var objURL = {};
                str.replace(
                    new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
                    function( $0, $1, $2, $3 ){ objURL[ $1 ] = $3; }
                );
                return objURL;
            }

        }
    });
    mifosX.ng.services.service('lockAuthenticationProvider', ['localStorageService', 'AuthenticationService', 'ResourceFactory', 'HttpService', '$interval', '$rootScope', 'webStorage', '$window', '$location', mifosX.services.LockAuthenticationProvider])
    .run(function ($log) {
        $log.info("LockAuthenticationProvider initialized");
    });
}(mifosX.services || {}));