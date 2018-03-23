const test = require(`tape`);
const sinon = require(`sinon`);

const promisifyS3 = require(`..`);

test(`promisifyS3 promisifies s3`, async function(assert) {
  let s3 = promisifyS3();
  assert.deepEqual(
    Object.keys(s3).filter((key) => key.endsWith(`Async`)),
    [
      'abortMultipartUploadAsync', 'completeMultipartUploadAsync',
      'copyObjectAsync', 'createMultipartUploadAsync', 'deleteBucketAsync',
      'deleteBucketAnalyticsConfigurationAsync', 'deleteBucketCorsAsync',
      'deleteBucketEncryptionAsync', 'deleteBucketInventoryConfigurationAsync',
      'deleteBucketLifecycleAsync', 'deleteBucketMetricsConfigurationAsync',
      'deleteBucketPolicyAsync', 'deleteBucketReplicationAsync',
      'deleteBucketTaggingAsync', 'deleteBucketWebsiteAsync',
      'deleteObjectAsync', 'deleteObjectTaggingAsync', 'deleteObjectsAsync',
      'getBucketAccelerateConfigurationAsync', 'getBucketAclAsync',
      'getBucketAnalyticsConfigurationAsync', 'getBucketCorsAsync',
      'getBucketEncryptionAsync', 'getBucketInventoryConfigurationAsync',
      'getBucketLifecycleAsync', 'getBucketLifecycleConfigurationAsync',
      'getBucketLocationAsync', 'getBucketLoggingAsync',
      'getBucketMetricsConfigurationAsync', 'getBucketNotificationAsync',
      'getBucketNotificationConfigurationAsync', 'getBucketPolicyAsync',
      'getBucketReplicationAsync', 'getBucketRequestPaymentAsync',
      'getBucketTaggingAsync', 'getBucketVersioningAsync',
      'getBucketWebsiteAsync', 'getObjectAsync', 'getObjectAclAsync',
      'getObjectTaggingAsync', 'getObjectTorrentAsync', 'headBucketAsync',
      'headObjectAsync', 'listBucketAnalyticsConfigurationsAsync',
      'listBucketInventoryConfigurationsAsync',
      'listBucketMetricsConfigurationsAsync', 'listBucketsAsync',
      'listMultipartUploadsAsync', 'listObjectVersionsAsync',
      'listObjectsAsync', 'listObjectsV2Async', 'listPartsAsync',
      'putBucketAccelerateConfigurationAsync', 'putBucketAclAsync',
      'putBucketAnalyticsConfigurationAsync', 'putBucketCorsAsync',
      'putBucketEncryptionAsync', 'putBucketInventoryConfigurationAsync',
      'putBucketLifecycleAsync', 'putBucketLifecycleConfigurationAsync',
      'putBucketLoggingAsync', 'putBucketMetricsConfigurationAsync',
      'putBucketNotificationAsync', 'putBucketNotificationConfigurationAsync',
      'putBucketPolicyAsync', 'putBucketReplicationAsync',
      'putBucketRequestPaymentAsync', 'putBucketTaggingAsync',
      'putBucketVersioningAsync', 'putBucketWebsiteAsync', 'putObjectAsync',
      'putObjectAclAsync', 'putObjectTaggingAsync', 'restoreObjectAsync',
      'uploadPartAsync', 'uploadPartCopyAsync', 'retryableErrorAsync',
      'updateReqBucketRegionAsync', 'requestBucketRegionAsync',
      'reqRegionForNetworkingErrorAsync', 'getSignedUrlAsync',
      'createPresignedPostAsync', 'preparePostFieldsAsync',
      'preparePostPolicyAsync', 'createBucketAsync', 'uploadAsync',
      'makeRequestAsync', 'makeUnauthenticatedRequestAsync', 'waitForAsync',
      'paginationConfigAsync'
    ],
    `...Async methods are defined`
  );
  assert.end();
});

test(`promisifyS3 promisifies s3 with defaults`, async function(assert) {
  assert.plan(3);
  let s3 = promisifyS3({ Bucket: `default-bucket` }, { maxRetries: 1 });
  sinon.stub(s3, `makeRequest`).callsFake((method, params, cb) => {
    assert.equal(method, `headObject`, `headObject is requested`);
    assert.deepEqual(params, { Bucket: `default-bucket`, Key: `foo` }, `default bucket is set`);
    cb(0, `success`);
  });
  let result = await s3.headObjectAsync({ Key: `foo` });
  assert.equal(result, `success`, `result is as expected`);
  assert.end();
});

test(`defaults are overridable`, async function(assert) {
  assert.plan(3);
  let s3 = promisifyS3({ Bucket: `default-bucket` });
  sinon.stub(s3, `makeRequest`).callsFake((method, params, cb) => {
    assert.equal(method, `getObject`, `getObject is requested`);
    assert.deepEqual(params, { Bucket: `not-default-bucket`, Key: `foo` }, `default bucket is not set`);
    cb(0, `success`);
  });
  let result = await s3.getObjectAsync({ Bucket: `not-default-bucket`, Key: `foo` });
  assert.equal(result, `success`, `result is as expected`);
  assert.end();
});

test(`methods can be destructured`, async function(assert) {
  assert.plan(2);
  let s3 = promisifyS3({ Bucket: `default-bucket` });
  sinon.stub(s3, `makeRequest`).callsFake((method, params, cb) => {
    assert.equal(method, `deleteObject`, `deleteObject is requested`);
    cb(0, `success`);
  });
  let { deleteObjectAsync } = s3;
  let result = await deleteObjectAsync({ Key: `foo` });
  assert.equal(result, `success`, `result is as expected`);
  assert.end();
});

test(`errors are informative`, async function(assert) {
  assert.plan(2);
  let s3 = promisifyS3({ Bucket: `default-bucket` });
  sinon.stub(s3, `makeRequest`).callsFake((method, params, cb) => {
    assert.equal(method, `listObjectsV2`, `listObjectsV2 is requested`);
    cb({ message: `fail` });
  });
  try {
    await s3.listObjectsV2Async({ Key: `foo` });
    assert.fail(`listObjectsV2 should not succeed`);
  } catch (err) {
    assert.equal(err.message, `fail s3.listObjectsV2({ Bucket: 'default-bucket', Key: 'foo' })`);
  }
  assert.end();
});

test(`config options are passed to S3`, function(assert) {
  let s3 = promisifyS3({}, { maxRetries: 1 });
  assert.equal(s3.config.maxRetries, 1, `maxRetries is set on the s3 instance`);
  assert.end();
});
