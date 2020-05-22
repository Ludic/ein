const path = require('path')

module.exports = {
  root: '..',
  port: 8080,
  resolvers: [
    {
      requestToFile(publicPath, root){
        if(publicPath.includes('/dist')){
          // allows vite to access dist which is outside of root
          return path.join(__dirname, publicPath)
        }
        return undefined
      },
      fileToRequest(){},
    }
  ],
}
