import { ContainerGroupViewModel, CreateContainerGroupRequest } from '../models/container_group';

angular.module('portainer.azure').factory('ContainerGroupService', [
  '$q',
  'ContainerGroup',
  function ContainerGroupServiceFactory($q, ContainerGroup) {
    'use strict';
    var service = {};

    service.containerGroups = function (subscriptionId) {
      var deferred = $q.defer();

      ContainerGroup.query({ subscriptionId: subscriptionId })
        .$promise.then(function success(data) {
          var containerGroups = data.value.map(function (item) {
            return new ContainerGroupViewModel(item);
          });
          deferred.resolve(containerGroups);
        })
        .catch(function error(err) {
          deferred.reject({ msg: '无法检索容器组', err: err });
        });

      return deferred.promise;
    };

    service.containerGroup = containerGroup;
    async function containerGroup(subscriptionId, resourceGroupName, containerGroupName) {
      const containerGroup = await ContainerGroup.get({ subscriptionId, resourceGroupName, containerGroupName }).$promise;
      return new ContainerGroupViewModel(containerGroup);
    }

    service.create = function (model, subscriptionId, resourceGroupName) {
      var payload = new CreateContainerGroupRequest(model);
      return ContainerGroup.create(
        {
          subscriptionId: subscriptionId,
          resourceGroupName: resourceGroupName,
          containerGroupName: model.Name,
        },
        payload
      ).$promise;
    };

    return service;
  },
]);
