const yosay = require('yosay');
const chalk = require('chalk');
const process = require('process');
const mkdirp = require('mkdirp');
const fs = require('fs');
const rimraf = require('rimraf');
const fsExtra = require('fs-extra');

const pluginsInfo = require('./pluginsInfo');

/**
 * This module includes common functions, or functions which can be used in different subgenerators
 *
 */
module.exports = {

  /**
   * This function redirects generator to the non-core plugins storage directory
   */
  goToPluginsDirectory: function() {
    const themeDirectoryPath = 'PulseTile-React-Core/src/components/theme/plugins';
    process.chdir(themeDirectoryPath);
    return true;
  },

  /**
   * This function redirects generator to the theme features storage directory
   */
  goToFeaturesDirectory: function() {
    const themeDirectoryPath = 'PulseTile-React-Core/src/components/theme/components/features';
    process.chdir(themeDirectoryPath);
    return true;
  },

  /**
   * This function clones Core project from GitHub
   *
   * @param el
   * @param {string} projectName
   * @param {string} branchName
   * @param {string} repositoryName
   * @param {string} pluginName
   * @return {boolean}
   */
  cloneProject: function(el, projectName, branchName, repositoryName, pluginName) {
    console.log(
      yosay(
        `${chalk.yellow('Step 1:')} Now we are clonning ${chalk.green(
          projectName
        )} from GitHub...`
      )
    );
    el.spawnCommandSync('git', ['clone', '-b', branchName, repositoryName, pluginName]);
    return true;
  },

  /**
   * This function checks content of plugins directory and returns plugins list
   *
   * @return {array}
   */
  getPluginsInformation: function() {
    const pluginsList = [];
    fs.readdirSync(process.cwd()).forEach(function(file) {
      pluginsList.push(file);
    });
    return pluginsList;
  },

  /**
   * This function checks content of features directory and returns features list
   *
   * @return {array}
   */
  getFeaturesInformation: function(dirName = null) {
    const featuresList = [];
    var dir = dirName ? dirName : process.cwd();
    fs.readdirSync(dir).forEach(function(file) {
      featuresList.push(file);
    });
    return featuresList;
  },

  /**
   * This function updates config files
   *
   * @return {boolean}
   */
  updateConfigFiles: function(el) {
    console.log(yosay(`${chalk.yellow('Step 3:')} Config files updating...`));

    const pluginsList = this.getPluginsInformation();

    var clientUrlsArray = [];
    var pluginsArray = [];
    var synopsisRequestsArray = [];
    var themeSelectorsArray = [];
    pluginsList.forEach(function(item) {
      if (pluginsInfo[item]) {
        clientUrlsArray.push(pluginsInfo[item].clientsUrl);
        pluginsArray.push(pluginsInfo[item].plugins);
        synopsisRequestsArray.push(pluginsInfo[item].synopsisRequests);
        themeSelectorsArray.push(pluginsInfo[item].themeSelectors);
      } else {
        console.log('WARNING!');
        console.log(
          'Information about plugin ' + item + ' is absent in file pluginInfo.js'
        );
      }
    });

    const configDirectoryPath = '../config';
    process.chdir(configDirectoryPath);

    el.fs.copyTpl(el.templatePath('clientUrls.txt'), 'clientUrls.js', {
      plugins: clientUrlsArray
    });

    el.fs.copyTpl(el.templatePath('plugins.txt'), 'plugins.js', {
      plugins: pluginsArray
    });

    el.fs.copyTpl(el.templatePath('synopsisRequests.txt'), 'synopsisRequests.js', {
      plugins: synopsisRequestsArray
    });

    el.fs.copyTpl(el.templatePath('themeSelectors.txt'), 'themeSelectors.js', {
      plugins: themeSelectorsArray
    });

    return true;
  },

  /**
   * This function removes Theme directory
   *
   * @return {boolean}
   */
  removePluginDirectory: function(dirName) {
    console.log(yosay(`${chalk.yellow('Step 3:')} Removing plugin directory...`));
    rimraf(dirName, function(err) {
      if (err) throw err;
    });
    return true;
  },

  /**
   * This function adds importing of theme to main CSS file
   *
   * @return {boolean}
   */
  removeExcessFiles: function(dirName, excessFiles) {
    console.log(
      yosay(`${chalk.yellow('Step 2:')} Removing excess files and directories...`)
    );
    process.chdir(dirName);
    excessFiles.forEach(function(item) {
      rimraf(item, function(err) {
        if (err) throw err;
      });
    });
    return true;
  },

  /**
   *
   */
  extractPlugins: function(dirName) {
    console.log(yosay(`${chalk.yellow('Step 3:')} Extracting plugins directories...`));
    const pluginsList = this.getPluginsInformation();
    const srcPath = '../..';
    process.chdir(srcPath);
    pluginsList.forEach(function(item) {
      fsExtra.moveSync(dirName + item, 'plugins/' + item, {
        overwrite: true
      });
    });
    return true;
  }
};
