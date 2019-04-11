const fs = require('fs')
const path = require('path')

const __root = path.resolve(__dirname, '../')
const pageDir = path.resolve(__root, 'src/pages')

let template = fs.readFileSync(path.resolve(__dirname, './template_entry.js'), 'utf-8')

// template
const insertReg = /<%(.+?)%>/ig
// genarage the name of buildJs
const buildJsName = 'index.build.js'
// the entry of building
const buildIndexName = 'index.vue'

// genarage code as a entry file
function genCode(template, value) {
  return template.replace(insertReg, (match, key) => {
    if (key && (key = key.trim()) && value[key]) {
      return value[key]
    } else {
      return match
    }
  })
}

// genarage entry as a webpack'entry
function mkBuildDir(buildEntry) {
  let pageList = []
  let errMap = {}
  // custom entries for building
  if (buildEntry && Array.isArray(buildEntry) && buildEntry.length) {
    buildEntry.reduce((pageList, pageName) => {
      if (fs.existsSync(path.join(pageDir, pageName))) {
        pageList.push(pageName) 
      } else {
        let errWord = `
        找不到目录: ${pageName}
        Page not found: ${pageName}
        `
        errMap[pageName] || (errMap[pageName] = [])
        errMap[pageName].push(errWord)
        throw new Error(errWord)
      }
      return pageList
    }, pageList)
  } else {
    // get all
    pageList = fs.readdirSync(pageDir)
  }
  let dirMap = {}
  // 
  pageList.forEach(pageName => {
    const _buildIndex = path.join(pageDir, pageName, buildIndexName)
    const hasIndex = fs.existsSync(_buildIndex)
    // check that if there is index.vue
    // if (!hasIndex) {
    //   let errWord = `
    //     ${pageName} 目录没有入口 index.vue
    //     there is no index.vue as a entry in ${pageName}
    //     `
    //   errMap[pageName] || (errMap[pageName] = [])
    //   errMap[pageName].push(errWord)
    //   throw new Error(errWord)
    // }
    
    const _buildJs = path.join(pageDir, pageName, buildJsName)
    const hasBuild = fs.existsSync(_buildJs)
    dirMap[pageName] = _buildJs
    // check that if a build.js had existed
    if (!hasBuild) {
      try {
        const fd = fs.openSync(_buildJs, 'w', 0o666)
        if (fd) {
          const code = genCode(template, {
            entry: pageName
          })
          const bf = Buffer.from(code)
          fs.writeSync(fd, bf)
        }
      } catch (error) {
        console.warn('error in building build.js !!')
        console.warn(error)
        delete dirMap[pageName]
      }
    }
  })
  return dirMap
}

module.exports = mkBuildDir