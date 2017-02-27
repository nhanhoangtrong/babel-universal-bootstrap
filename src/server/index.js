let server
if (process.env.NODE_ENV === 'production') {
	server = require('./server')
} else {
	server = require('./dev-server')
}

server.listen(process.env.PORT || 8080)