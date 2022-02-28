(function (module) {
    mifosX.services = _.extend(module, {
        LockAuthenticationProvider: function (localStorageService, authenticationService, resourceFactory, httpService, $interval, scope, webStorage, $window, location, angularAuth0, SCOPES, AUDIENCE) {

            var accessToken;
            var idToken;
            var expiresAt;
            var username;

            function redirectToAuth0(){
               angularAuth0.loginWithRedirect({
                  scope: SCOPES,
                  audience : AUDIENCE
                });
            }

            function renewAccessToken() {
              angularAuth0.getTokenSilently().then(result => {
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
                      var jwtData = parseJwt(idToken);
                      username =  jwtData.name;
                      getTokenSilentlyLocal(idToken);
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
                  data['username'] = username;
                  localStorageService.addToLocalStorage('userData', data);
                  scope.$broadcast("UserAuthenticationSuccessEvent", data);
              });
            }

            function getTokenSilentlyLocal(idToken){
                 try {
                  angularAuth0.getTokenSilently({
                    scope: SCOPES,
                    audience : AUDIENCE
                  }).then(result => {
                    accessToken = result;
                    idToken = accessToken;
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
                });
                } catch (e) {
                      if (e.error === 'login_required') {
                        redirectToAuth0();
                      }
                      if (e.error === 'consent_required') {
                        redirectToAuth0();
                      }
                      throw e;
                }
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

            function parseJwt (token) {
                var base64Url = token.split('.')[1];
                var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                return JSON.parse(jsonPayload);
            }

        }
    });
    mifosX.ng.services.service('lockAuthenticationProvider', ['localStorageService', 'AuthenticationService', 'ResourceFactory', 'HttpService', '$interval', '$rootScope', 'webStorage', '$window', '$location', 'angularAuth0', 'SCOPES', 'AUDIENCE', mifosX.services.LockAuthenticationProvider])
    .run(function ($log) {
        $log.info("LockAuthenticationProvider initialized");
    });
}(mifosX.services || {}));