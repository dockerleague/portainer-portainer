import { SubscriptionViewModel } from '../models/subscription';

angular.module('portainer.azure').factory('SubscriptionService', [
  '$q',
  'Subscription',
  function SubscriptionServiceFactory($q, Subscription) {
    'use strict';
    var service = {};

    service.subscriptions = function () {
      var deferred = $q.defer();

      Subscription.query({})
        .$promise.then(function success(data) {
          var subscriptions = data.value.map(function (item) {
            return new SubscriptionViewModel(item);
          });
          deferred.resolve(subscriptions);
        })
        .catch(function error(err) {
          deferred.reject({ msg: '无法检索订阅', err: err });
        });

      return deferred.promise;
    };

    service.subscription = subscription;
    async function subscription(id) {
      const subscription = await Subscription.get({ id }).$promise;
      return new SubscriptionViewModel(subscription);
    }

    return service;
  },
]);
