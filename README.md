[![CircleCI](https://circleci.com/gh/neverendingqs/serverless-default-aws-resource-attributes.svg?style=svg)](https://circleci.com/gh/neverendingqs/serverless-default-aws-resource-attributes)
[![Coverage Status](https://coveralls.io/repos/github/neverendingqs/serverless-default-aws-resource-attributes/badge.svg?branch=master)](https://coveralls.io/github/neverendingqs/serverless-default-aws-resource-attributes?branch=main)
[![npm version](https://badge.fury.io/js/serverless-default-aws-resource-attributes.svg)](https://badge.fury.io/js/serverless-default-aws-resource-attributes)

# serverless-default-aws-resource-attributes

This plugin allows you to set default attributes a given CloudFormation resource
should have based on type.

This plugin **affects resources generated by Serverless**.
For example, any default attributes defined for S3 buckets will be applied to the Serverless-generated `ServerlessDeploymentBucket` bucket.
You are, however, able to exclude Serverless-generated resources using `Exclude:` (see below).

## Usage

Install the plugin:

```sh
npm install -D serverless-default-aws-resource-attributes
```

Register the plugin in `serverless.yml`:

```yaml
plugins:
  - serverless-default-aws-resource-attributes
```

Example:

```yaml
custom:
  defaultAwsAttributes:
    # Enable SSE and block public access for all S3 buckets
    # Also set a DeletionPolicy for all S3 buckets
    - Type: AWS::S3::Bucket
      DeletionPolicy: Retain
      Properties:
        BucketEncryption:
          ServerSideEncryptionConfiguration:
            - ServerSideEncryptionByDefault:
                SSEAlgorithm: AES256
        PublicAccessBlockConfiguration:
          BlockPublicAcls: true
          BlockPublicPolicy: true
          IgnorePublicAcls: true
          RestrictPublicBuckets: true
    # Add logging configuration to all S3 buckets except resource with
    # logical ID 'LoggingBucket'
    - Type: AWS::S3::Bucket
      Exclude:
        - LoggingBucket
      Properties:
        LoggingConfiguration:
          DestinationBucketName:
            Ref: LoggingBucket
```
