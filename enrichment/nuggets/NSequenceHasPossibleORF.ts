
import Nugget from "./Nugget";
import ORF from 'enrichment/nodes/ORF'

import colors = require('colors/safe')
import KnowledgeBase from "enrichment/KnowledgeBase";
import DNASequence from "../nodes/DNASequence";

export default class NSequenceHasPossibleORF extends Nugget {

    sequence:DNASequence
    orf:ORF

    constructor(kb:KnowledgeBase, sequence:DNASequence, orf:ORF) {

        super(kb)

        this.sequence = sequence
        this.orf = orf

    }

    getType():string {
        return 'SequenceHasPossibleORF'
    }

    serialize():any {

        return {
            type: this.getType(),
            sequence: this.sequence.tempID(),
            orf: this.orf.serialize()
        }

    }

    dump(stream:NodeJS.WritableStream):void {

        stream.write(colors.green(this.getType()) + ' ' + this.sequence.tempID() + ' ' + this.orf.toString() + '\n')


    }


}