const util = require('util');
const { S3 } = require('aws-sdk');
const promisify = require('util.promisify');

const { assign } = Object;

function configureS3(defaults = {}, options = {}) {
  let s3 = new S3(options);
  for (let key in s3) {
    let prop = s3[key];
    // look for methods with an arity of 2, which should be (params, callback)
    if (typeof prop === `function` && prop.length === 2) {
      // make a promisified version of the method, bound to our s3 context
      let promisified = promisify(prop).bind(s3);
      // attach the promisified method to the s3 context
      assign(s3, { [`${key}Async`](inputs) {
        // assign defaults to the input params
        let params = assign({}, defaults, inputs);
        return promisified(params).catch((err) => {
          // append the method and params then rethrow the error
          err.message += ` s3.${key}(${util.inspect(params)})`;
          throw err;
        });
      } });
    }
  }

  return s3;
}

module.exports = configureS3;
