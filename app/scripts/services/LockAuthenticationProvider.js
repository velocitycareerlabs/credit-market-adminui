(function (module) {
    mifosX.services = _.extend(module, {
        LockAuthenticationProvider: function (localStorageService, authenticationService, resourceFactory, httpService, $interval, scope, webStorage, $window, location, angularAuth0, SCOPES) {

            var accessToken;
            var idToken;
            var expiresAt;

            var scopes = {scope: SCOPES};

            function redirectToAuth0(){
               angularAuth0.loginWithRedirect();
            }

            function renewAccessToken() {
              angularAuth0.getTokenSilently().then(result => {
                  console.log("getTokenSilently: " + result);
                  accessToken = result;
              });
            }

            //initialise application
            this.initialiseAuth0 =  function() {
                var routeParams = parseQueryString(window.location.search + window.location.hash.replace('#','').replace('/',''));
                if(routeParams.code){
                    angularAuth0.handleRedirectCallback().then(redirectResult => {
                            angularAuth0.getIdTokenClaims().then(id_token => {
                              expiresAt = new Date(id_token.exp * 1000);
                              idToken = id_token.__raw;
                              angularAuth0.getTokenSilently().then(result => {
                                accessToken = result;
                                angularAuth0.isAuthenticated().then(
                                  result => {
                                    if (result) {
                                        handleLoginSuccess(idToken, expiresAt);
                                    } else {
                                      localStorage.setItem('isLoggedIn', 'false');
                                      redirectToAuth0();
                                    }
                                  }
                                )
                              })
                            });
                          }).catch(error => {
                            console.log(error);
                            localStorage.clear();
                            redirectToAuth0();
                          });
                }else if(routeParams.error){
                     var errorMsg = routeParams.error_description;
                     alert(errorMsg);
                     redirectToAuth0();
                }
                else{
                     redirectToAuth0();
                }
            }

            function handleLoginSuccess(idToken, expiresAt){
              httpService.setAuthorization(idToken, true);
              localStorageService.addToCookies('X-Authorization-Token', idToken);
              localStorageService.addToLocalStorage('tokendetails', {
                  "accessToken" : idToken,
                  "expiresIn": expiresAt
              });

              var response =  {
               "access_token" : idToken,
               "expires_in": expiresAt
              }
              localStorageService.addToLocalStorage('tokendetails', response);

              resourceFactory.userTokenDetails.get(function (data) {
                  data['accessToken'] = idToken;
                  localStorageService.addToLocalStorage('userData', data);
                  scope.$broadcast("UserAuthenticationSuccessEvent", data);
              });
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

             scope.$on("OnUserPreLogout", function (event) {
               logout();
             });

            function logout() {
                  // Remove isLoggedIn flag from localStorage
                  localStorage.removeItem('isLoggedIn');
                  localStorageService.removeFromCookies('X-Authorization-Token');
                  // Remove tokens and expiry time
                  accessToken = '';
                  idToken = '';
                  expiresAt = 0;
                  angularAuth0.logout({
                    returnTo: window.location.origin
                  });

                  location.path('/login').replace();
            }

        }
    });
    mifosX.ng.services.service('lockAuthenticationProvider', ['localStorageService', 'AuthenticationService', 'ResourceFactory', 'HttpService', '$interval', '$rootScope', 'webStorage', '$window', '$location', 'angularAuth0', 'SCOPES', mifosX.services.LockAuthenticationProvider])
    .run(function ($log) {
        $log.info("LockAuthenticationProvider initialized");
    });
}(mifosX.services || {}));