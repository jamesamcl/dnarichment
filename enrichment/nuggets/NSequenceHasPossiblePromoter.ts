
import Nugget from "./Nugget";
import ORF from 'enrichment/nodes/ORF'

import colors = require('colors/safe')
import KnowledgeBase from "enrichment/KnowledgeBase";
import DNASequence from "../nodes/DNASequence";
import Promoter from "enrichment/nodes/Promoter";

export default class NSequenceHasPossiblePromoter extends Nugget {

    sequence:DNASequence
    promoter:Promoter

    constructor(kb:KnowledgeBase, sequence:DNASequence, promoter:Promoter) {

        super(kb)

        this.sequence = sequence
        this.promoter = promoter

    }

    getType():string {
        return 'SequenceHasPossiblePromoter'
    }

    serialize():any {

        return {
            type: this.getType(),
            sequence: this.sequence.tempID(),
            promoter: this.promoter.serialize()
        }

    }

    dump(stream:NodeJS.WritableStream):void {

        stream.write(colors.green(this.getType()) + ' ' + this.sequence.tempID() + ' ' + this.promoter.toString() + '\n')


    }


}