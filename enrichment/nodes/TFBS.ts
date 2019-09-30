
import SequenceRange from "../SequenceRange";

import SeqUtils from 'enrichment/SeqUtils'
import Protein from "./Protein";
import Node from './Node';
import DNASequence from "./DNASequence";
import KnowledgeBase from "enrichment/KnowledgeBase";
import SequenceFeature from "./SequenceFeature";

export default class TFBS extends SequenceFeature {

    location:SequenceRange
    tf:string

    constructor(kb:KnowledgeBase, sequence:DNASequence) {

        super(kb, sequence)

        this.sequence = sequence
        this.tf = ''
    }


    getType():string {
        return 'TFBS'
    }

    getRanges() {
        return [ this.location ]

    }


    serialize():any {

        return {
        }
    }

    toString():string {

        return this.tf
    }


}

