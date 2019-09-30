
import PWM from '../PWM'
import tmp = require('tmp-promise')
import { Writable } from 'stream';
import fs = require('mz/fs')
import { ChildProcess, exec } from 'child_process';
import SeqUtils from '../SeqUtils';
import SequenceRange from '../SequenceRange';
import SequenceOffset from '../SequenceOffset';

export interface PromoterHunterResult {
    forward:boolean
    begin1:SequenceOffset,
    score1:number
    begin2:SequenceOffset,
    score2:number,
    summaryScore:number
    energyScore:number,
    finalScore:number
}

export default class PromoterHunter {

    static async hunt(
        sequence:string,
        minus35Pwm?:PWM,
        minus10Pwm?:PWM,
        spacerMax?:number,
        spacerMin?:number,
        globalGc?:number,
        limit?:number)
    {

        if(minus35Pwm === undefined)
            minus35Pwm = PromoterHunter.getDefaultMinus35Matrix()

        if(minus10Pwm === undefined)
            minus10Pwm = PromoterHunter.getDefaultMinus10Matrix()

        if(spacerMax === undefined)
            spacerMax = 18

        if(spacerMin === undefined)
            spacerMin = 15

        if(limit === undefined)
            limit = 10

        if(globalGc === undefined) {
            globalGc = SeqUtils.calculatePercentGC(sequence)
        }

        let matricesFilename = await tmp.tmpName()
        let seqFilename = await tmp.tmpName()
        let outFilename = await tmp.tmpName()

        let matricesFile:Writable = fs.createWriteStream(matricesFilename)

        matricesFile.write([
            'A: ' + minus35Pwm.a.join(' '),
            'C: ' + minus35Pwm.c.join(' '),
            'G: ' + minus35Pwm.g.join(' '),
            'T: ' + minus35Pwm.t.join(' '),
            '/////',
            'A: ' + minus10Pwm.a.join(' '),
            'C: ' + minus10Pwm.c.join(' '),
            'G: ' + minus10Pwm.g.join(' '),
            'T: ' + minus10Pwm.t.join(' '),
            ''
        ].join('\n'))

        let seqFile:Writable = fs.createWriteStream(seqFilename)

        seqFile.write('>seq\n')
        seqFile.write(sequence)
        seqFile.write('\n')

        await seqFile.end()
        await matricesFile.end()
        //await new Promise((resolve, reject) => { seqFile.on('finish', resolve) }) 
        //await new Promise((resolve, reject) => { matricesFile.on('finish', resolve) }) 

        let cmd = './promoterhunter.pl'

        cmd += ' -i ' + seqFilename
        cmd += ' -m ' + matricesFilename
        cmd += ' -x ' + spacerMax
        cmd += ' -n ' + spacerMin
        cmd += ' -g ' + globalGc
        cmd += ' -e T'
        cmd += ' -s B'
        cmd += ' -l ' + limit
        cmd += ' -o ' + outFilename

        console.log(cmd)

        await new Promise<string>((resolve, reject) => {

           let cp:ChildProcess = exec(cmd, {
               maxBuffer: 1024 * 1024 * 100,
               cwd: process.cwd() + '/bin'
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

       let output = (await fs.readFile(outFilename)) + ''

       await fs.unlink(outFilename)
       await fs.unlink(seqFilename)
       await fs.unlink(matricesFilename)
       await fs.unlink(matricesFilename + '_f')

       console.log(output)

       let results:Array<PromoterHunterResult> = []

        for(let line of output.split('\n')) {

            if(line[0] === '#')
                continue

            let tokens = line.split(',')

            if(tokens.length < 8) {
                continue
            }

            if(tokens[0] !== '+' && tokens[0] !== '-')
                continue

            let forward = tokens[0] === '+'

            console.log(JSON.stringify(tokens))

            results.push({
                forward: forward,
                begin1: SequenceOffset.from1BasedInteger(parseInt(tokens[1]), forward),
                score1: parseFloat(tokens[2]),
                begin2: SequenceOffset.from1BasedInteger(parseInt(tokens[3]), forward),
                score2: parseFloat(tokens[4]),
                summaryScore: parseFloat(tokens[5]),
                energyScore: parseFloat(tokens[6]),
                finalScore: parseFloat(tokens[7])
            })

       }

       return results
    }

    static getDefaultMinus35Matrix():PWM {

        let pwm = new PWM()

        pwm.a = [10, 6, 9, 56, 21, 54]
        pwm.c = [10, 7, 12, 17, 54, 13]
        pwm.g = [10, 8, 61, 11, 9, 16]
        pwm.t = [70, 79, 18, 16, 16, 17]

        return pwm
    }

    static getDefaultMinus10Matrix():PWM {

        let pwm = new PWM()

        pwm.a = [5, 76, 15, 61, 56, 6]
        pwm.c = [10, 6, 11, 13, 20, 7]
        pwm.g = [8, 6, 14, 14, 8, 5]
        pwm.t = [77, 12, 60, 12, 15, 82]

        return pwm
    }


}