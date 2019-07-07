// Storing and editing data.

var fs = require('fs');
var path = require('path');

var lib = {}

// Base Directory
lib.baseDir = path.join(__dirname, '../.data/')
lib.create = function(dir, file, data, callback) {
  fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(err, fileDescriptor) {
    if(!err && fileDescriptor) {
      var stringData = JSON.stringify(data)
      // write to file and close it.
      fs.writeFile(fileDescriptor, stringData, function(err) {
        if(!err) {
          fs.close(fileDescriptor, function(err) {
            if(!err) {
              callback(false)
            } else {
              callback('Error closing new file.')
            }
          })
        } else {
          callback('Error writing to file.')
        }
      })
    } else {
      callback('Could not create new file. it may already exist.')
    }
  })
}

lib.read = function(dir, file, callback) {
  fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', function(err, data) {
    callback(err, data)
  })
}

lib.update = function(dir, file, data, callback) {
  fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err, fileDescriptor) {
    if(!err && fileDescriptor) {
      var stringData = JSON.stringify(data)
      fs.ftruncate(fileDescriptor, function(err) {
        if(!err) {
          fs.writeFile(fileDescriptor, stringData, function(err) {
            if(!err) {
              fs.close(fileDescriptor, function(err) {
                if(!err) {
                  callback(false)
                } else {
                  callback('Error closing the file.')
                }
              })
            } else {
              callback('Error writing to file.')
            }
          })
        } else {
          callback('Error truncation file.')
        }
      })
    } else {
      callback('Could not open the file to update.')
    }
  })
}

lib.delete = function(dir, file, callback) {
  fs.unlink(lib.baseDir+dir+"/"+file+'.json', function(err) {
    if(!err) {
      callback(false)
    } else {
      callback('Trouble delinking the file.')
    }
  })
}

module.exports = lib;