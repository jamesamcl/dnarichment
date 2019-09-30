

import PWM from '../PWM'
import tmp = require('tmp-promise')
import { Writable } from 'stream';
import fs = require('mz/fs')
import { ChildProcess, exec } from 'child_process';
import SeqUtils from '../SeqUtils';
import SequenceRange from '../SequenceRange';
import SequenceOffset from '../SequenceOffset';

export interface TransTermResult {
    num:number
    range:SequenceRange
    loc:string
    conf:number
    hp:number
    tail:number
    notes:string
}

export default class TransTerm {

    static async transterm(
        sequence:string,
    )
    {
        if(sequence.length <= 74) {
            // Error: input sequences must have length > 74
            return []
        }

        let seqFilename = await tmp.tmpName({ postfix: '.fasta' })
        let coordsFilename = await tmp.tmpName({ postfix: '.coords' })

        let coordsFile:Writable = fs.createWriteStream(coordsFilename)

        coordsFile.write([
            'fakegene1	1 2	seq',
            'fakegene2	' + (sequence.length - 1) + ' ' + (sequence.length) + '	seq'
        ].join('\n'))

        let seqFile:Writable = fs.createWriteStream(seqFilename)

        seqFile.write('>seq\n')
        seqFile.write(sequence)
        seqFile.write('\n')

        await seqFile.end()
        await coordsFile.end()
        //await new Promise((resolve, reject) => { seqFile.on('finish', resolve) }) 
        //await new Promise((resolve, reject) => { matricesFile.on('finish', resolve) }) 

        let cmd = 'transterm'

        cmd += ' -p expterm.dat'
        cmd += ' ' + seqFilename
        cmd += ' ' + coordsFilename

        console.log(cmd)

        let output = await new Promise<string>((resolve, reject) => {

           let cp:ChildProcess = exec(cmd, {
               maxBuffer: 1024 * 1024 * 100,
               cwd: process.cwd() + '/data'
           }, (err, stdout, stderr) => {

               console.log(stdout)
               console.log(stderr)

               if (err)
                   reject(err)
               else
                   resolve(stdout + '')

           })

           cp.stdin.end()
       })

       await fs.unlink(seqFilename)
       await fs.unlink(coordsFilename)

       let results:Array<TransTermResult> = []

        let re = /TERM (\d+)\s+(\d+)\s+-\s+(\d+)\s+([+-])\s+([GFRTHN])\s+(\d+)\s+([\d-.]+)\s+([\d-.]+)\s+\|(.*)/

        for (let line of output.split('\n')) {

            let match = re.exec(line)

            if(!match)
                continue

            let forward = match[4] === '+' ? true : false

            results.push({
                num: parseInt(match[1]),
                range: new SequenceRange(
                    SequenceOffset.from1BasedInteger(parseInt(match[2]), forward),
                    SequenceOffset.from1BasedInteger(parseInt(match[3]), forward)
                ),
                loc: match[5],
                conf: parseInt(match[6]),
                hp: parseFloat(match[7]),
                tail: parseFloat(match[8]),
                notes: match[9]
            })

        }

       return results
    }

}