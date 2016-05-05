module.exports = function (config) {
    var options = {
        basePath : './',
        frameworks : ['jasmine'],

        files : [
            'public/scripts/vendor.min.js',
            'bower_components/angular-mocks/angular-mocks.js',

            'src/angular/**/*.html',
            'src/angular/module.js',
            'src/angular/**/*.js'
        ],

        plugins: [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-ng-html2js-preprocessor'
        ],

        exclude : [],
        preprocessors : {
            'src/angular/**/*.html' : ['ng-html2js']
        },
        reporters : ['dots'],
        port : 9876,
        colors : true,
        logLevel : config.LOG_INFO,
        autoWatch : true,
        browsers : ['Chrome'],
        singleRun : true,

        ngHtml2JsPreprocessor : {
            moduleName : 'auction.tpls',
            stripPrefix : 'src/angular/'
        },

        coverageReporter : {
            type : 'html',
            dir : 'coverage/'
        }
    };

    /* Cobertura de código na variável de ambiente COVERAGE */
    if (process.env.COVERAGE) {
        options.plugins.push('karma-coverage');
        options.reporters.push('coverage');
        options.preprocessors['src/**/*.js'] = ['coverage'];
    }

    config.set(options);
};