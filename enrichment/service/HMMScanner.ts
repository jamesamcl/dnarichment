
import { exec, ChildProcess } from "child_process";
import Protein from "enrichment/nodes/Protein";

import tmp = require('tmp-promise')
import fs = require('mz/fs')
import { Writable } from "stream";

import Multimap = require('multimap')
import HMMHit from "enrichment/service/HMMHit";

export default class HMMScanner {

    db:string

    constructor() {

    }


    setDB(db:string) {

        this.db = db

        if(!fs.existsSync(db)) {
            throw new Error('HMM database ' + db + ' does not exist')
        }

    }

    async scan(proteins:Array<Protein>):Promise<Array<{protein:Protein, hits:HMMHit[]}>> {

        let inFilename = await tmp.tmpName()
        let outFilename = await tmp.tmpName()

        let inFile:Writable = fs.createWriteStream(inFilename)


        let n = 0

        for(let protein of proteins) {

            inFile.write('>input' + (n ++) + '\n')
            inFile.write(protein.aa)
            inFile.write('\n')

        }

        await inFile.end()

        await new Promise((resolve, reject) => {
            inFile.on('finish', resolve)
        })

        let cmd = 'hmmscan --domtblout ' + outFilename + ' ' + this.db + ' ' + inFilename

        console.log(cmd)

        console.time('hmmscan')

        let cp:ChildProcess = exec(cmd, {
            maxBuffer: 1024 * 1024 * 100
        })

        let errOutput = ''

        cp.stdout.on('data', (d) => {})
        cp.stderr.on('data', (d) => { errOutput += d })

        await new Promise((resolve, reject) => {
            cp.on('exit', (code, signal) => { 

                if(code !== 0) {
                    console.error(errOutput)
                    reject('hmmscan exited with code ' + code)
                } else {
                    console.timeEnd('hmmscan')
                    resolve()
                }
            })
        })

        let output = await fs.readFile(outFilename)

        fs.unlink(inFilename)
        fs.unlink(outFilename)

        let lines = output.toString().split('\n')

        let results = new Multimap()

        for(let line of lines) {

            if(line[0] === '#' || line.length === 0)
                continue

            let tokens = line.split(/ +/g)

            let result:HMMHit = {
                targetName: tokens[0],
                accession: tokens[1],
                tlen: parseInt(tokens[2]),
                queryName: tokens[3],
                accession2: tokens[4],
                qlen: parseInt(tokens[5]),
                fullSequenceEvalue: parseFloat(tokens[6]),
                fullSequenceScore: parseFloat(tokens[7]),
                fullSequenceBias: parseFloat(tokens[8]),
                domainNum: parseInt(tokens[9]),
                domainNumOutOf: parseInt(tokens[10]),
                domainCEvalue: parseFloat(tokens[11]),
                domainIEvalue: parseFloat(tokens[12]),
                domainScore: parseFloat(tokens[13]),
                domainBias: parseFloat(tokens[14]),
                hmmFrom: parseInt(tokens[15]),
                hmmTo: parseInt(tokens[16]),
                aliFrom: parseInt(tokens[17]),
                aliTo: parseInt(tokens[18]),
                envFrom: parseInt(tokens[19]),
                envTo: parseInt(tokens[20]),
                accuracy: parseFloat(tokens[21]),
                description: tokens.slice(22).join(' ')
            }

            console.log(JSON.stringify(result, null, 2))

            let idx = parseInt(result.queryName.split('input')[1])

            let protein = proteins[idx]

            results.set(protein, result)
        }

        let ret:Array<{protein:Protein, hits:HMMHit[]}> = []

        results.forEachEntry((entry, key) => {
            ret.push({protein: key as Protein, hits: entry as Array<HMMHit>})
        })

        return ret

    }

}
