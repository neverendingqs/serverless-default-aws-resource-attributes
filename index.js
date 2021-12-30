'use strict';

const _ = {
  merge: require('lodash.merge')
}

class DefaultAwsAttributes {
  constructor(serverless) {
    this.provider = serverless.getProvider('aws');
    this.serverless = serverless.service;
    this.hooks = {
      'aws:package:finalize:mergeCustomProviderResources': this.addDefaults.bind(this)
    };
  }

  getDefaults() {
    return this.serverless.custom.defaultAwsAttributes || {};
  }

  mergeAttributes({ original, additional }) {
    // Do not override anything in original
    return _.merge({}, additional, original);
  }

  addDefaults() {
    const defaults = this.getDefaults()
      .reduce(
        (acc, d) => {
          acc[d.Type] = (acc[d.Type] || []).concat([d]);
          return acc;
        },
        {}
      );

    const resources = this.serverless.provider.compiledCloudFormationTemplate.Resources;

    for(const logicalId of Object.keys(resources)) {
      const { Type } = resources[logicalId];
      const defaultsForType = defaults[Type];

      if(defaultsForType) {
        for(const defaults of defaultsForType) {
          const {
            Exclude: exclude
          } = defaults;

          if(!exclude || !exclude.includes(logicalId)) {
            resources[logicalId] = this.mergeAttributes({
              original: resources[logicalId],
              additional: { ...defaults, Exclude: undefined }
            });
          }
        }
      }
    }
  }
}

module.exports = DefaultAwsAttributes;
