
import Nugget from "./Nugget";
import Operator from 'enrichment/nodes/TFBS'

import colors = require('colors/safe')
import TFBS from "enrichment/nodes/TFBS";
import DNASequence from "enrichment/nodes/DNASequence";
import KnowledgeBase from "enrichment/KnowledgeBase";

export default class NSequenceHasPossibleTFBS extends Nugget {

    seq:DNASequence
    tfbs:TFBS

    constructor(kb:KnowledgeBase, seq:DNASequence, tfbs:TFBS) {

        super(kb)

        this.seq = seq
        this.tfbs = tfbs

    }

    getType():string {
        return 'SequenceHasPossibleTFBS'
    }

    serialize():any {

        return {
            type: this.getType(),
            seq: this.seq.tempID(),
            tfbs: this.tfbs.serialize()
        }

    }

    getSummary():string {
        return this.getType() + ': ' + this.seq.tempID () + ' has tfbs for ' + this.tfbs
    }

    dump(stream:NodeJS.WritableStream):void {

        stream.write(colors.green(this.getType()) + ' ' + this.seq.tempID() + ' ' + this.tfbs.toString() + '\n')


    }


}