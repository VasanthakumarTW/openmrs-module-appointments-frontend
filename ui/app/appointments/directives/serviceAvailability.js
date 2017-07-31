'use strict';

angular.module('bahmni.appointments')
    .directive('serviceAvailability', ['$window', '$translate', 'appService', function ($window, $translate, appService) {
        var states = {NEW: 0, EDIT: 1, READONLY: 2};

        var link = function (scope) {
            var init = function () {
                scope.availability = scope.availability || {};
                scope.startOfWeek = appService.getAppDescriptor().getConfigValue('startOfWeek') || 2;
            };

            scope.add = function () {
                if (addOrUpdateToIndex(scope.availabilityList.length)) {
                    scope.availability = {};
                }
            };

            scope.update = function () {
                var index = scope.availabilityList.indexOf(scope.backUpAvailability);
                if (addOrUpdateToIndex(index)) {
                    scope.state = states.READONLY;
                }
            };

            var addOrUpdateToIndex = function (index) {
                if (!overlapsWithExisting(index)) {
                    scope.availabilityList[index] = scope.availability;
                    scope.doesOverlap = false;
                    return true;
                }
                scope.doesOverlap = true;
            };

            scope.isValid = function () {
                var startTime = scope.availability.startTime;
                var endTime = scope.availability.endTime;
                return startTime &&
                       endTime && startTime < endTime &&
                        scope.availability.days;
            };

            var overlapsWithExisting = function (index) {
                var avb = scope.availability;
                return !_.isEmpty(scope.availabilityList) && _.some(scope.availabilityList, function (currAvb, currIndex) {
                    if (index !== currIndex) {
                        return hasCommonDays(avb, currAvb) && hasOverlappingTimes(avb, currAvb);
                    }
                });
            };

            var convertDaysToBinary = function(days){
                return parseInt(days.map(function(day){
                    return day.isSelected? 1: 0;
                }).reverse().join(''), 2)
            };

            var hasCommonDays = function (avb1, avb2) {
               var days1InBinary = convertDaysToBinary(avb1.days);
               var days2InBinary = convertDaysToBinary(avb2.days);
               return (days1InBinary & days2InBinary) !== 0;
            };

            var hasOverlappingTimes = function (avb1, avb2) {
                return (avb1.startTime < avb2.endTime) && (avb2.startTime < avb1.endTime);
            };

            scope.delete = function () {
                var confirmed = $window.confirm($translate.instant('CONFIRM_DELETE_AVAILABILITY'));
                if (confirmed) {
                    var index = scope.availabilityList.indexOf(scope.availability);
                    scope.availabilityList.splice(index, 1);
                }
            };

            scope.cancel = function () {
                scope.availability = scope.backUpAvailability;
                scope.doesOverlap = false;
                scope.state = states.READONLY;
            };

            scope.enableEdit = function () {
                scope.backUpAvailability = scope.availability;
                scope.availability = angular.copy(scope.availability);
                scope.state = states.EDIT;
            };

            scope.isNew = function () {
                return scope.state === states.NEW;
            };

            scope.isEdit = function () {
                return scope.state === states.EDIT;
            };

            scope.isReadOnly = function () {
                return scope.state === states.READONLY;
            };

            init();
        };

        return {
            restrict: 'AE',
            scope: {
                availability: '=?',
                availabilityList: '=',
                state: '='
            },
            link: link,
            templateUrl: '../appointments/views/admin/appointmentServiceAvailability.html'
        };
    }]);