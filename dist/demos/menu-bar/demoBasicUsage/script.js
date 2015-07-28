angular
  .module('menuBarDemoBasic', ['ngMaterial'])
  .config(function($mdIconProvider) {
    $mdIconProvider
      .defaultIconSet('/dist/docs/img/icons/sets/core-icons.svg', 24)
      .iconSet('call', '/dist/docs/img/icons/sets/communication-icons.svg', 24);
  })
  .controller('DemoBasicCtrl', function DemoCtrl() {
    this.settings = {
      printLayout: true,
      showRuler: true,
      showSpellingSuggestions: true
    };

    this.toggleSetting = function(name) {
      this.settings[name] = !this.settings[name];
    };
  });

