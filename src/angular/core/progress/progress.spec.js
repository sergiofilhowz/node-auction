describe('ProgressDirective', function () {
    'use strict';

    var $compile,
        $q,
        $scope;

    beforeEach(module('auction.tpls', 'auction.core'));

    beforeEach(inject(function (_$compile_, _$q_, $rootScope) {
        $compile = _$compile_;
        $q = _$q_;
        $scope = $rootScope.$new();
    }));

    it('should compile', function () {
        var template = '<coa-progress promise="defer.promise"></coa-progress>',
            element;
        $scope.defer = $q.defer();

        element = $compile(template)($scope);
        $scope.$digest();
        expect(element.find('md-progress-circular').length).toBe(1);
        expect(element.find('button').length).toBe(0);

        $scope.defer.resolve();
        $scope.$digest();
        expect(element.find('md-progress-circular').length).toBe(0);
        expect(element.find('button').length).toBe(0);
    });

    it('should have reload button on error', function () {
        var template = '<coa-progress promise="defer.promise" retry="retry()"></coa-progress>',
            element;
        $scope.defer = $q.defer();
        $scope.retry = jasmine.createSpy();

        element = $compile(template)($scope);
        $scope.$digest();
        expect(element.find('md-progress-circular').length).toBe(1);

        $scope.defer.reject();
        $scope.$digest();
        expect(element.find('md-progress-circular').length).toBe(0);
        expect(element.find('md-button').length).toBe(1);

        expect($scope.retry).not.toHaveBeenCalled();
        element.find('md-button').triggerHandler('click');
        $scope.$digest();
        expect($scope.retry).toHaveBeenCalled();
    });

});