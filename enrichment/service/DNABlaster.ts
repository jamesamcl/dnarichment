import { exec, ChildProcess } from "child_process";

export default class DNABlaster {

   db:string
   task:string

   constructor() {
   }

   setDB(db:string) {
       this.db = db
   }

   setTask(task:string) {
       this.task = task
   }

   async blast(na:string):Promise<BlastResult[]> {

       let cmd = 'blastn'

       if(this.task) {
           cmd += ' -task "' + this.task + '"'
       }

       if(this.db) {
           cmd += ' -db ' + this.db
       } else {
           throw new Error('need a db!')
       }

       cmd += ' -outfmt "6 salltitles length evalue qstart qend sstart send"'
       cmd += ' -query -'

       console.log(cmd)

       let output:string = await new Promise<string>((resolve, reject) => {

           let cp: ChildProcess = exec(cmd, {
               maxBuffer: 1024 * 1024 * 100,
               cwd: process.cwd() + '/data'
           }, (err, stdout, stderr) => {

               if (err)
                   reject(err)
               else
                   resolve(stdout + '')

           })

           cp.stdin.write('>query\n')
           cp.stdin.write(na)
           cp.stdin.write('\n')
           cp.stdin.write(new Buffer([ 0x0A, 0x04 ]))
           cp.stdin.end()
       })

       let results:Array<BlastResult> = output.split('\n').filter((line) => {

           return line !== ''
           
       }).map((line) => {

            let tokens:any[] = line.match(/(.*)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)$/) as any[]

            return {
                fastaHeader: tokens[1],
                length: parseInt(tokens[2]),
                eValue: parseFloat(tokens[3]),
                startInQuery: parseFloat(tokens[4]),
                endInQuery: parseFloat(tokens[5]),
                startInSubject: parseFloat(tokens[6]),
                endInSubject: parseFloat(tokens[7]),
            }

       })

       return results
   }




}

export interface BlastResult {
    fastaHeader:string
    length:number
    eValue:number
    startInQuery:number
    endInQuery:number
    startInSubject:number
    endInSubject:number
}


