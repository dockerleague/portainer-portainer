import angular from 'angular';

class ConfigsController {
  /* @ngInject */
  constructor($state, ConfigService, Notifications, $async) {
    this.$state = $state;
    this.ConfigService = ConfigService;
    this.Notifications = Notifications;
    this.$async = $async;

    this.removeAction = this.removeAction.bind(this);
    this.removeActionAsync = this.removeActionAsync.bind(this);
    this.getConfigs = this.getConfigs.bind(this);
    this.getConfigsAsync = this.getConfigsAsync.bind(this);
  }

  getConfigs() {
    return this.$async(this.getConfigsAsync);
  }

  async getConfigsAsync() {
    try {
      this.configs = await this.ConfigService.configs();
    } catch (err) {
      this.Notifications.error('失败', err, '无法检索配置');
    }
  }

  async $onInit() {
    this.configs = [];
    this.getConfigs();
  }

  removeAction(selectedItems) {
    return this.$async(this.removeActionAsync, selectedItems);
  }

  async removeActionAsync(selectedItems) {
    let actionCount = selectedItems.length;
    for (const config of selectedItems) {
      try {
        await this.ConfigService.remove(config.Id);
        this.Notifications.success('配置移出成功', config.Name);
        const index = this.configs.indexOf(config);
        this.configs.splice(index, 1);
      } catch (err) {
        this.Notifications.error('失败', err, '无法移出配置');
      } finally {
        --actionCount;
        if (actionCount === 0) {
          this.$state.reload();
        }
      }
    }
  }
}
export default ConfigsController;
angular.module('portainer.docker').controller('ConfigsController', ConfigsController);
