# s3-promises

```
let { getObjectAsync } = require(`s3-promises`)({ Bucket: `default-bucket` }, { maxRetries: 3 });

async function() {
  let result = await getObjectAsync({ Key: `foo` });
}
```
