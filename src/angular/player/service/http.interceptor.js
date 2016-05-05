(function (angular) {
    'use strict';

    angular.module('auction.player')
        .factory('HttpInterceptor', HttpInterceptor)
        .config(interceptorConfig);

    HttpInterceptor.$inject = ['$q', '$translate', '$injector', 'playerSessionService'];
    function HttpInterceptor($q, $translate, $injector, playerSessionService) {
        return {
            request : function (config) {
                config.headers['Token'] = playerSessionService.token;
                return config;
            },
            responseError : function (response) {
                if (response.status === 500) {
                    $translate(response.data.message).then(function (message) {
                        var $mdToast = $injector.get('$mdToast');
                        $mdToast.show($mdToast.simple().textContent(message));
                    });
                }
                if (response.status === 401) {
                    location.href = '';
                }
                return $q.reject(response);
            }
        };
    }

    interceptorConfig.$inject = ['$httpProvider'];
    function interceptorConfig($httpProvider) {
        $httpProvider.interceptors.push('HttpInterceptor');
    }

}(angular));