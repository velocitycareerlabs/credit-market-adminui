angular.module('configurations', ['auth0.auth0'])
    .config(function(angularAuth0Provider){
        var domain = 'vnf-dev.us.auth0.com';
        var clientID = 'RtFUVDUH9oWRVnCS0S5XkDFhZThX141w';
        var connection = 'vnf-dev-users-connection';
        var audience = 'https://fineract.velocitycareerlabs.io';
        var redirecturi = window.location.origin;

        angularAuth0Provider.init({
                client_id: clientID,
                domain: domain,
                redirect_uri: redirecturi,
                connection: connection,
                responseType: 'token id_token',
                audience: audience,
                scope: 'openid profile fineract:super_user fineract:operations'
        });
    })
    .constant('API_VERSION', '/fineract-provider/api/v1')
    .constant('SCOPES', 'openid profile fineract:super_user fineract:operations')
    .constant('FINERACT_BASE_URL', 'https://localhost:8443')
    .constant('AUDIENCE', 'https://fineract.velocitycareerlabs.io')
    .constant('IDLE_DURATION', 30 * 60)
    .constant('WARN_DURATION', 10)
    .constant('KEEPALIVE_INTERVAL', 15 * 60)
    .constant('SECURITY', 'oauth');

// Use SECURITY constant as 'oauth' to enable Oauth2 on community app
