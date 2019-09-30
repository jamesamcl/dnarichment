
import Node from './Node';
import SequenceRange from 'enrichment/SequenceRange';
import KnowledgeBase from 'enrichment/KnowledgeBase';
import DNASequence from './DNASequence';
import SequenceFeature from './SequenceFeature';

export default class Terminator extends SequenceFeature {

    range:SequenceRange

    constructor(kb:KnowledgeBase, sequence:DNASequence, range:SequenceRange) {

        super(kb, sequence)

        this.range = range

    }

    getType():string {
        return 'Terminator'
    }

    getRanges():SequenceRange[] {
        return [ this.range ]
    }

    serialize():any {

        return {
            id: this.tempID()
        }
    }



}

