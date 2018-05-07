const fs = require('fs')
const path = require('path')
const yazl = require("yazl")
const yauzl = require("yauzl")

exports.zip = function (source, target, cb) {
  const promiseCallback = (resolve, reject) => {
    if (!fs.existsSync(path.dirname(target))) mdSync(path.dirname(target))
    let called = false
    let zipfile = new yazl.ZipFile();

    if (fs.statSync(source).isFile()) {
      zipfile.addFile(source, path.basename(source))
    } else {
      const entries = walkDirectory(source)
      for (const entry of entries) {
        const item = path.join(source, entry)
        const stats = fs.statSync(item)
        if (stats.isFile()) {
          zipfile.addFile(item, entry)
        }
        else if (stats.isDirectory()) zipfile.addEmptyDirectory(entry)
      }
    }
    function walkDirectory (dir, root = '.') {
      let filesAndDirectories = []
      const items = fs.readdirSync(dir)
      if (items.length === 0) filesAndDirectories.push(path.join(root).replace(/\\/g, '/'))
      for (const item of items) {
        const realPath = path.join(dir, item)
        if (fs.statSync(realPath).isFile()) filesAndDirectories.push(path.join(root, item).replace(/\\/g, '/'));
        else filesAndDirectories = [...filesAndDirectories, ...walkDirectory(realPath, path.join(root, item).replace(/\\/g, '/'))]
      }
      return filesAndDirectories
    }

    let ws = fs.createWriteStream(target)

    ws.on('close', () => {
      if (cb) {
        if (!called) {
          cb(null, zipfile.outputStreamCursor)
          called = true
        }
      } else resolve(zipfile.outputStreamCursor)
    })

    zipfile.outputStream.pipe(ws)
    
    zipfile.on('error', err => {
      if (cb) {
        if (!called) {
          cb(err)
          called = true
        }
      } else reject(err)
    })

    zipfile.end()
  }
  return cb ? promiseCallback() : new Promise(promiseCallback)
}

exports.unzip = function (zip, target = ".", cb) {
  if (typeof cb !== 'function') cb = void 0
  const promiseCallback = (resolve, reject) => {
    if (!fs.existsSync(path.dirname(target))) mdSync(path.dirname(target))
    let called = false
    yauzl.open(zip, { lazyEntries: true }, function (err, zipfile) {
      if (err) throw err;
      let size = 0
      zipfile.readEntry();
      zipfile.on("entry", function (entry) {
        const fileName = entry.fileName
        if (/\/$/.test(entry.fileName)) {
          zipfile.readEntry();
        } else {
          zipfile.openReadStream(entry, function (err, readStream) {
            if (err) throw err;
            const absolute = path.join(target, fileName)
            const dir = path.dirname(absolute)
            if (!fs.existsSync(dir)) mdSync(dir)
            let ws = fs.createWriteStream(absolute)
            ws.on('close', () => {
              zipfile.readEntry();
            })
            readStream.on('data', chunk => size += chunk.length)
            readStream.pipe(ws);
          });
        }
      });
      zipfile.on('close', () => {
        if (cb) {
          if (!called) {
            cb(null, size)
            called = true
          }
        } else resolve(size)
      })
      zipfile.on('error', err => {
        if (cb) {
          if (!called) {
            cb(err)
            called = true
          }
        } else reject(err)
      })
    });
  }
  return cb ? promiseCallback() : new Promise(promiseCallback)
}

function mdSync (p) {
  const dir = path.dirname(p)
  if (!fs.existsSync(dir)) mkdir(dir)
  else {
    if (!fs.statSync(dir).isDirectory()) throw new Error(`"${path.resolve(dir)}" is not a directory.`)
    fs.mkdirSync(p)
  }
}
