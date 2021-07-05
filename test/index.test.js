const chai = require('chai');
const sinon = require('sinon');

const should = chai.should();

const DefaultAwsAttributes = require('../index');

describe('defaultAwsAttributes', function() {
  beforeEach(function() {
    this.sandbox = sinon.createSandbox();

    this.serverless = {
      custom: {},
      resources: {}
    };
    this.defaultAwsAttributes = new DefaultAwsAttributes({
      getProvider: this.sandbox.stub(),
      service: this.serverless
    });
  });

  afterEach(function() {
    this.sandbox.verifyAndRestore();
  });

  describe('constructor()', function() {
    it('hooks are set properly', function() {
      should.exist(this.defaultAwsAttributes.hooks);

      const hook = this.defaultAwsAttributes.hooks['before:package:finalize'];
      should.exist(hook);

      hook.should.be.a('function');
      hook.name.should.equal('bound addDefaults');
    });
  });

  describe('getDefaults()', function() {
    it('returns empty object if no defaults are configured', function() {
      this.defaultAwsAttributes.getDefaults()
        .should.deep.equal({});
    });

    it('returns defaults if configured', function() {
      const defaults = [
        {
          Type: 'AWS::S3::Bucket',
          DeletionPolicy: 'Retain',
          Properties: {
            BucketEncryption: {
              ServerSideEncryptionConfiguration: [
                {
                  ServerSideEncryptionByDefault: {
                    SSEAlgorithm: 'AES256'
                  }
                }
              ]
            },
            PublicAccessBlockConfiguration: {
              BlockPublicAcls: true,
              BlockPublicPolicy: true,
              IgnorePublicAcls: true,
              RestrictPublicBuckets: true
            }
          }
        }
      ];

      this.serverless.custom.defaultAwsAttributes = defaults

      this.defaultAwsAttributes.getDefaults()
        .should.deep.equal(defaults);
    });
  });

  describe('mergeAttributes()', function() {
    it('priorities original properties over new ones', function() {
      const original = {
        inBoth: {
          inAdditionalAsWell: 'original',
          inOriginal: 'only',
          inOriginalAsWell: 'original'
        }
      };

      const additional = {
        inBoth: {
          inAdditional: 'only',
          inAdditionalAsWell: 'additional',
          inOriginalAsWell: 'additional'
        }
      }

      this.defaultAwsAttributes.mergeAttributes({ original, additional })
        .should.deep.equal({
          inBoth: {
            inAdditional: 'only',
            inAdditionalAsWell: 'original',
            inOriginal: 'only',
            inOriginalAsWell: 'original'
          }
        });
    });
  });

  describe('addDefaults()', function() {
    it('excludes resources based on type or logical ID', function() {
      const defaultProperties = {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'AES256'
              }
            }
          ]
        },
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true
        }
      };

      this.serverless.custom.defaultAwsAttributes = [
        {
          Type: 'AWS::S3::Bucket',
          Exclude: [
            'IgnoredBucket'
          ],
          Properties: defaultProperties
        }
      ];

      this.serverless.resources.Resources = {
        IgnoredBucket: {
          Type: 'AWS::S3::Bucket',
          Properties: {}
        },
        NotABucket: {
          Type: 'AWS::DynamoDB::Table',
          Properties: {}
        },
        RegularBucket: {
          Type: 'AWS::S3::Bucket',
          Properties: {}
        }
      };

      this.defaultAwsAttributes.addDefaults();

      this.serverless.resources.Resources.IgnoredBucket.Properties
        .should.not.have.property('BucketEncryption');

      this.serverless.resources.Resources.NotABucket.Properties
        .should.not.have.property('BucketEncryption');

      this.serverless.resources.Resources.RegularBucket.Properties
        .should.deep.include(defaultProperties);
    });
  });
});
