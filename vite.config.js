// @ts-check
const path = require('path')


/** @type {(import('vite').UserConfig)} */
const config = {
  root: '..',
  server: {
    port: 3000,
  },
  plugins: [
    // {
    //   name: 'examples',
    //   resolveId(id){
    //     console.log('resovle:', id)
    //     if(id.includes('/dist')){
    //       // allows vite to access dist which is outside of root
    //       console.log('> ', path.join(__dirname, id))
    //       return path.join(__dirname, id)
    //     }
    //     return undefined
    //   },
    //   // transform(code, id){
    //   //   if(id.includes('?raw')){
    //   //     const [filename] = id.split('?')
    //   //     const file = fs.readFileSync(filename, {encoding: 'utf-8'})
    //   //     return `export default ${JSON.stringify({contents: file})}`
    //   //   }
    //   //   return code
    //   // },
    // },
  ],
}

module.exports = config

// import { Plugin } from 'vite';
// import * as  path from 'path'
// import * as fs from 'fs'

// const srcPath = path.resolve(__dirname, './src')

// resolvers: [
//   {
//     requestToFile(publicPath, root){
//       if(publicPath.includes('/dist')){
//         // allows vite to access dist which is outside of root
//         return path.join(__dirname, publicPath)
//       }
//       return undefined
//     },
//     fileToRequest(){},
//   }
// ],