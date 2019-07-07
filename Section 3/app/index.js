const http = require("http");
const https = require("https");
var url = require("url");
const StringDecoder = require("string_decoder").StringDecoder
var config = require('./config');
var fs = require('fs');

const unifiedServer = function(req, res) {
  const { 
    pathname: path,
    query: queryStringObj
  } = url.parse(req.url, true);
  const headers = req.headers
  const method = req.method.toLowerCase();
  const trimmedPath = path.replace(/^\/+|\/+$/g,'');
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', function(data) {
    buffer += decoder.write(data);
  })
  req.on('end', function() {
    buffer += decoder.end()
    const choosenPath = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    var data = {
      trimmedPath,
      queryStringObj,
      method,
      headers,
      payload: buffer
    }

    choosenPath(data, function(statusCode, payload) {
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      payload = typeof(payload) == 'object' ? payload : {};
      var payloadString = JSON.stringify(payload)
      res.setHeader('Content-type', 'application/json');
      res.writeHead(statusCode)
      res.end(payloadString)
      console.log(`request received on path: ${trimmedPath}
      with method: ${method} 
      and query parameters: ${JSON.stringify(queryStringObj)}
      with headers: ${JSON.stringify(headers)} and payload is: ${buffer} and response values are: 
      ${statusCode} and payload: ${payloadString}`);
    })
  })
}

const httpServer = http.createServer(unifiedServer)

httpServer.listen(config.httpPort, function() {
  console.log(`Server is listening on port ${config.httpPort} in ${config.envName} mode.`)
})
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions, unifiedServer)

httpsServer.listen(config.httpsPort, function() {
  console.log(`Server is listening on port ${config.httpsPort} in ${config.envName} mode.`)
})

// Define handlers
const handlers = {}

handlers.ping = function(data, callback) {
  callback(200)
}

handlers.hello = function(data, callback) {
  callback(200, {message: `Welcome: ${data.queryStringObj.name ? data.queryStringObj.name : 'Home'}`})
}

// Not Found Handler
handlers.notFound = function(_data, callback) {
  callback(404);
}
// Defining request router
const router = {
  'ping': handlers.ping,
  'hello': handlers.hello
}