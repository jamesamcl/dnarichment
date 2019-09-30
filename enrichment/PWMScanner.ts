
import fs = require('mz/fs')
import PWM from './PWM';

export default class PWMScanner {

    PWMs:Array<PWM>
    gcContent:number

    constructor(gcContent:number) {

        this.PWMs = []
        this.gcContent = gcContent

    }


    async loadPWMsFromFile(filename:string) {

        let pwmInfos:Array<any> = JSON.parse(await fs.readFile(filename))

        for(let pwmInfo of pwmInfos) {

            let pwm:PWM = new PWM()

            if(pwmInfo.a.length === 0)
                continue

            // 0.25 if equal
            // 

            let backgroundFreq = {
                a: (1.0 - this.gcContent) / 2.0,
                t: (1.0 - this.gcContent) / 2.0,
                c: this.gcContent / 2.0,
                g: this.gcContent / 2.0
            }

            pwm.id = pwmInfo.factor
            pwm.a = pwmInfo.a.map((n) => calcScoringMatrixEntry(n, backgroundFreq.a))
            pwm.t = pwmInfo.t.map((n) => calcScoringMatrixEntry(n, backgroundFreq.t))
            pwm.c = pwmInfo.c.map((n) => calcScoringMatrixEntry(n, backgroundFreq.c))
            pwm.g = pwmInfo.g.map((n) => calcScoringMatrixEntry(n, backgroundFreq.g))

            this.PWMs.push(pwm)

            function calcScoringMatrixEntry(n, background) {

                let freq = n + (Math.sqrt(n) / 0.25) / pwmInfo.motifs.length
                let freq2 = freq / background

                let log2 = Math.log2(freq2)

                return (freq * 1.0) * log2

                //return logNormal( logNormal((n * 1.0) / pwmInfo.motifs.length) )

            }

            function logNormal(n:number) {

                if(n === 0)
                    return 0

                let inLog2Range = n * 1024

                let log = Math.log2(inLog2Range)

                let renormalized = log / 10.0

                return renormalized
            }
        }

    }

    scan(na:string):void {

        console.log('scan ' + na.length + ' bp')

        for(let i = 0; i < na.length; ++ i) {

            for(let pwm of this.PWMs) {

                let score: number = 0

                if (i + pwm.length >= na.length)
                    continue

                for(let n = 0; n < pwm.length; ++ n) {

                    if(i + n >= na.length)
                        break
                    
                    let base:string = na[i + n]

                    let deltaScore:number = 0

                    switch(base) {
                        case 'a': deltaScore = pwm.a[n]; break
                        case 't': deltaScore = pwm.t[n]; break
                        case 'c': deltaScore = pwm.c[n]; break
                        case 'g': deltaScore = pwm.g[n]; break
                    }

                    score = score + deltaScore
                }

                let normalizedScore = score / pwm.length

                    if(normalizedScore > 2) {
                    console.log('PWM ' + normalizedScore + ' ' + pwm.id + ' ' + i + ' ' + na.substr(i, pwm.length))
                    }

            }

        }

    }


}
