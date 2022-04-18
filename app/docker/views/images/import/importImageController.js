import { PorImageRegistryModel } from 'Docker/models/porImageRegistry';

angular.module('portainer.docker').controller('ImportImageController', [
  '$scope',
  '$state',
  'ImageService',
  'Notifications',
  'HttpRequestHelper',
  'Authentication',
  'ImageHelper',
  'endpoint',
  function ($scope, $state, ImageService, Notifications, HttpRequestHelper, Authentication, ImageHelper, endpoint) {
    $scope.state = {
      actionInProgress: false,
    };

    $scope.endpoint = endpoint;

    $scope.isAdmin = Authentication.isAdmin();

    $scope.formValues = {
      UploadFile: null,
      NodeName: null,
      RegistryModel: new PorImageRegistryModel(),
    };

    $scope.setPullImageValidity = setPullImageValidity;
    function setPullImageValidity(validity) {
      $scope.state.pullImageValidity = validity;
    }

    async function tagImage(id) {
      const registryModel = $scope.formValues.RegistryModel;
      if (registryModel.Image) {
        const image = ImageHelper.createImageConfigForContainer(registryModel);
        try {
          await ImageService.tagImage(id, image.fromImage);
        } catch (err) {
          Notifications.error('失败', err, '无法创建镜像标签');
        }
      }
    }

    $scope.uploadImage = async function () {
      $scope.state.actionInProgress = true;

      var nodeName = $scope.formValues.NodeName;
      HttpRequestHelper.setPortainerAgentTargetHeader(nodeName);
      var file = $scope.formValues.UploadFile;
      try {
        const { data } = await ImageService.uploadImage(file);
        if (data.error) {
          Notifications.error('Failure', data.error, 'Unable to upload image');
        } else if (data.stream) {
          var regex = /Loaded.*?: (.*?)\n$/g;
          var imageIds = regex.exec(data.stream);
          if (imageIds && imageIds.length == 2) {
            await tagImage(imageIds[1]);
            $state.go('docker.images.image', { id: imageIds[1] }, { reload: true });
          }
          Notifications.success('镜像上传成功');
        } else {
          Notifications.success('上载的tar文件包含多个镜像。因此，提供的标签已被忽略。');
        }
      } catch (err) {
        Notifications.error('失败', err, '无法上载镜像');
      } finally {
        $scope.state.actionInProgress = false;
      }
    };
  },
]);
