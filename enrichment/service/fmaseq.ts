
import request = require('request-promise')

import LogInterface from '../LogInterface'

export default async function fmaseq(log:LogInterface, aaSeq:string):Promise<Array<any>> {

    let body = await request({
        method: 'post',
        url: 'http://api.synform.io/fmaseq',
        body: aaSeq
    })

    return JSON.parse(body)

}
