const spawn = require('cross-spawn');

const { expect } = require('chai');
const sinon = require('sinon');

describe('samples/basic', function() {
  ['2'].forEach(slsVersion => {
    describe(`serverless@${slsVersion}`, function() {
      it('outputs expected CloudFormation template', function() {
        this.timeout(60 * 1000);
        const { status } = spawn.sync(
          'npx', [`serverless@${slsVersion}`, 'package'],
          { cwd: `${__dirname}/../../samples/basic`, stdio: 'inherit' },
        );

        expect(status).to.equal(0);

        const cfn = require(`${__dirname}/../../samples/basic/.serverless/cloudformation-template-update-stack.json`);

        expect(cfn.Resources.ABucket).to.deep.equal({
          'Type': 'AWS::S3::Bucket',
          'Properties': {
            'LoggingConfiguration': {
              'DestinationBucketName': {
                'Ref': 'LoggingBucket'
              }
            },
            'BucketEncryption': {
              'ServerSideEncryptionConfiguration': [
                {
                  'ServerSideEncryptionByDefault': {
                    'SSEAlgorithm': 'AES256'
                  }
                }
              ]
            },
            'PublicAccessBlockConfiguration': {
              'BlockPublicAcls': true,
              'BlockPublicPolicy': true,
              'IgnorePublicAcls': true,
              'RestrictPublicBuckets': true
            }
          },
          'DeletionPolicy': 'Retain'
        });

        expect(cfn.Resources.ABucket).to.deep.equal({
          'Type': 'AWS::S3::Bucket',
          'Properties': {
            'LoggingConfiguration': {
              'DestinationBucketName': {
                'Ref': 'LoggingBucket'
              }
            },
            'BucketEncryption': {
              'ServerSideEncryptionConfiguration': [
                {
                  'ServerSideEncryptionByDefault': {
                    'SSEAlgorithm': 'AES256'
                  }
                }
              ]
            },
            'PublicAccessBlockConfiguration': {
              'BlockPublicAcls': true,
              'BlockPublicPolicy': true,
              'IgnorePublicAcls': true,
              'RestrictPublicBuckets': true
            }
          },
          'DeletionPolicy': 'Retain'
        });

        expect(cfn.Resources.LoggingBucket).to.deep.equal({
          'Type': 'AWS::S3::Bucket',
          'DeletionPolicy': 'Retain',
          'Properties': {
            'BucketEncryption': {
              'ServerSideEncryptionConfiguration': [
                {
                  'ServerSideEncryptionByDefault': {
                    'SSEAlgorithm': 'AES256'
                  }
                }
              ]
            },
            'PublicAccessBlockConfiguration': {
              'BlockPublicAcls': true,
              'BlockPublicPolicy': true,
              'IgnorePublicAcls': true,
              'RestrictPublicBuckets': true
            }
          }
        });
      });
    });
  });
});
