(function (angular) {
    'use strict';

    angular.module('auction')
        .config(i18nConfig);

    i18nConfig.$inject = ['$translateProvider'];

    function i18nConfig($translateProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: 'languages/',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en_US');
        $translateProvider.useSanitizeValueStrategy('escaped');
    }

}(angular));