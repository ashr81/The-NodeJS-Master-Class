const http = require("http");
var url = require("url");
const StringDecoder = require("string_decoder").StringDecoder

const server = http.createServer(function(req, res) {
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
      res.writeHead(statusCode)
      res.end(payloadString)
      console.log(`request received on path: ${trimmedPath}
      with method: ${method} 
      and query parameters: ${JSON.stringify(queryStringObj)}
      with headers: ${JSON.stringify(headers)} and payload is: ${buffer} and response values are: 
      ${statusCode} and payload: ${payloadString}`);
    })
  })
})

server.listen(3000, function() {
  console.log("Server is listening on port 3000 now.")
})

// Define handlers
const handlers = {}

handlers.sample = function(data, callback) {
  callback(406, { name: 'Sample Handler' })
}

// Not Found Handler
handlers.notFound = function(data, callback) {
  callback(404);
}
// Defining request router
const router = {
  'sample': handlers.sample
}