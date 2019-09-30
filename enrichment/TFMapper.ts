
import fs = require('fs')

let tfs = JSON.parse(fs.readFileSync('data/transcription_factors.json') + '')

let pfamToTF = new Map<string,string>()
let prodoricToTF = new Map<string,string>()

for(let tf of tfs) {

    for(let fam of tf.pfam) {
        pfamToTF.set(fam, tf.tf)
    }

    if(tf.prodoric) {
        prodoricToTF.set(tf.prodoric, tf.tf)
    }
}


export default class TFMapper {

    static pfamToTF(pfam:string):string|undefined {

        return pfamToTF.get(pfam)

    }

    static prodoricToTF(matrix:string):string|undefined {

        return prodoricToTF.get(matrix)

    }


}

