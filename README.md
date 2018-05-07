# zauz

Usage

``` javascript
const { zip, unzip } = require('zauz')
zip('path/to/directory', 'path/to/zipfile.zip', (err, zipfileSize) => {})
zip('path/to/directory', 'path/to/zipfile.zip').then(zipfileSize => {}).catch(err => {});
(async function () {
  try {
    const zipfileSize = await zip('path/to/directory', 'path/to/zipfile.zip')
    // ...
  } catch (err) {
    // ...
  }
})()

unzip('path/to/zipfile.zip', 'path/to/directory', (err, totalSize) => {})
unzip('path/to/zipfile.zip', 'path/to/directory').then(totalSize => {}).catch(err => {});
(async function () {
  try {
    const totalSize = await unzip('path/to/zipfile.zip', 'path/to/directory')
    // ...
  } catch (err) {
    // ...
  }
})()
```
