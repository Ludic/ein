/// <reference path="../../node_modules/vite/client.d.ts" />
import { PluginOption } from 'vite'
import { transformSystem } from './systemTransform'

export default function(): PluginOption {
  console.log('ludic plugin')

  const systemIds = new Set<string>()
  
  return {
    name: 'ludic-plugin',
    // configureServer(server){
    //   // server.ws.on('ludic:register-system', (id)=>{
    //   //   console.log('server::ludic:register-system', id)
    //   //   systemIds.add(id)
    //   // })
    // },
    // handleHotUpdate(ctx){
    //   console.log('handle update', ctx.file, systemIds.has(ctx.file))
    //   if(systemIds.has(ctx.file)){
    //     console.log('update system', ctx.modules)
    //     ctx.server.ws.send({
    //       type: 'custom',
    //       event: 'ludic:update-system',
    //       // data: ctx.modules[0],
    //       data: 'test',
    //     })
    //     return []
    //   }
    //   return ctx.modules
    // },
    transform(code, id, options){
      if(id.indexOf('node_modules') == -1){
        code = transformSystem(code, id)
        console.log('transformed code', id, code)
      }
      return code
    },
  }
}