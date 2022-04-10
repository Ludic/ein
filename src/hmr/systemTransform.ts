const containsSystem = new RegExp(/class (\w+) extends System/,'mg')

export function transformSystem(code: string, id: string){
  const matches = code.match(containsSystem) ?? []
  if(matches.length){
    const [ _, systemName ] = containsSystem.exec(matches[0]) ?? []
    console.log('transform system', systemName, id)

    code += `\n
    if (__HOT__) {
      ${systemName}.__id = '${id}'
      console.log('hot: ${systemName}', ${systemName}.__id)

      __HOT__.accept(({default: updatedSystem}) => {
        console.log('updated: ${systemName}')
        typeof __EIN_HMR_RUNTIME__ !== 'undefined' && __EIN_HMR_RUNTIME__.reloadSystem(${systemName}.__id, updatedSystem)
      })
      // __HOT__.send('ludic:register-system', '${id}')
    }
    `
  }
  return code
}