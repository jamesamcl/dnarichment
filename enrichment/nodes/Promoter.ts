
import Node from './Node';
import SequenceRange from 'enrichment/SequenceRange';
import KnowledgeBase from 'enrichment/KnowledgeBase';
import DNASequence from './DNASequence';
import SequenceFeature from './SequenceFeature';

export default class Promoter extends SequenceFeature {

    minus10:SequenceRange
    minus35:SequenceRange
    tss:SequenceRange

    constructor(kb:KnowledgeBase, sequence:DNASequence, minus10:SequenceRange, minus35:SequenceRange, tss:SequenceRange) {

        super(kb, sequence)

        this.minus10 = minus10
        this.minus35 = minus35
        this.tss = tss

    }

    getType():string {
        return 'Promoter'
    }

    serialize():any {

        return {
            id: this.tempID()
        }
    }

    getRanges() {
        return [ this.minus10, this.minus35, this.tss ]

    }


}

