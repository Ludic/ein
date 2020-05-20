// @ts-check
import { createServer } from 'vite'

/** @type {import('http').Server} */
let server

/**
 * @param {(import('vite').ServerConfig)&{port?: number}} options
 */
function vite (options = {port: 8080}) {

  if (server) {
    server.close()
  } else {
    closeServerOnTermination()
  }

  const { port, ...config } = options
  server = createServer(config).listen(port)


  return {
    name: 'vite',
    generateBundle () {
      // noop
    }
  }
}


function closeServerOnTermination() {
  const terminationSignals = ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP']
  terminationSignals.forEach(signal => {
    process.on(signal, () => {
      if (server) {
        server.close()
        process.exit()
      }
    })
  })
}

export default vite
