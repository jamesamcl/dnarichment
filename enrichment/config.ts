
import fs = require('fs')
import path = require('path')

let staticConfig = JSON.parse(
    fs.readFileSync(path.resolve(path.basename(__filename) + '/../config.json')).toString()
)

export function get(section:string, key:string):any {
    let s = staticConfig[section]
    if(!s) {
        return undefined
    }
    return s[key]
}

export function getRequired(section:string, key:string):any {
    let v = get(section, key)
    if(v === undefined) {
        throw new Error('missing required config option: ' + section + ' ' + key)
    }
    return v
}

export function getRequiredNumber(section:string, key:string):number {
    let v = getRequired(section, key)
    if(typeof(v) !== 'number') {
        throw new Error('expected number for config option: ' + section + ' ' + key)
    }
    return v
}

export function getRequiredBool(section:string, key:string):boolean {
    let v = getRequired(section, key)
    if(typeof(v) !== 'boolean') {
        throw new Error('expected boolean for config option: ' + section + ' ' + key)
    }
    return v
}


