const util = require('util');
const { S3 } = require('aws-sdk');
const promisify = require('util.promisify');
const co = require('co');

const { assign } = Object;

function configureS3(defaults = {}, options = {}) {
  let s3 = new S3(options);
  for (let key in s3) {
    let prop = s3[key];
    // look for methods with an arity > 1, which should be (params, ..., callback)
    if (typeof prop === `function` && prop.length > 1) {
      // make a promisified version of the method, bound to our s3 context
      let promisified = promisify(prop).bind(s3);
      // attach the promisified method to the s3 context
      assign(s3, { [`${key}Async`](inputs, ...args) {
        // assign defaults to the input params
        let params = assign({}, defaults, inputs);
        return promisified(params, ...args).catch((err) => {
          // append the method and params then rethrow the error
          err.message += ` s3.${key}(${util.inspect(params)})`;
          throw err;
        });
      } });
    }
  }

  assign(s3, {
    listAllObjectsAsync: co.wrap(function* listAll(params) {
      let out = [];
      let { MaxKeys = Infinity } = params;
      let res = yield s3.listObjectsV2Async(params);
      out.push(...res.Contents);
      while (res && res.IsTruncated && out.length < MaxKeys) {
        res = yield s3.listObjectsV2Async(
          Object.assign({ ContinuationToken: res.NextContinuationToken }, params)
        );
        out.push(...res.Contents);
      }
      return out;
    })
  });

  return s3;
}

module.exports = configureS3;
