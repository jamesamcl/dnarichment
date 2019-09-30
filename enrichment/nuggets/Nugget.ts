
import colors = require('colors/safe')
import KnowledgeBase from '../KnowledgeBase';
import KBEntry from 'enrichment/KBEntry';

export default abstract class Nugget extends KBEntry {

    private provenance:string[]

    abstract getType():string
    abstract serialize():any

    constructor(kb:KnowledgeBase, id?:string) {
        super(kb, id)
        this.provenance = []
    }

    addProvenance(prov:string) {
        this.provenance.push(prov)
    }

    getProvenance():string[] {
        return this.provenance
    }

    getSummary():string {

        return this.getType()

    }

    dump(stream:NodeJS.WritableStream):void {

        stream.write(colors.green(this.getType()))

    }






}