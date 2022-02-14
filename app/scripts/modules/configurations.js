angular.module('configurations', ['auth0.auth0'])
    .config(function(angularAuth0Provider){
        var domain = '$AUTH0_SERVER_URL';
        var clientID = '$AUTH0_CLIENT_ID';
        var connection = '$AUTH0_CONNECTION_ID';
        var audience = '$AUTH0_AUDIENCE';
        var redirecturi = window.location.origin;
        angularAuth0Provider.init({
                client_id: clientID,
                domain: domain,
                redirect_uri: redirecturi,
                connection: connection,
                scope: 'fineract:operation fineract:super_user'
        });
    })
    .constant('API_VERSION', '/fineract-provider/api/v1')
    .constant('IDLE_DURATION', 30 * 60)
    .constant('WARN_DURATION', 10)
    .constant('KEEPALIVE_INTERVAL', 15 * 60)
    .constant('SECURITY', 'oauth');

// Use SECURITY constant as 'oauth' to enable Oauth2 on community app
