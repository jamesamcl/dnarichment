
import SeqUtils from 'enrichment/SeqUtils'
import Node from './Node';
import KnowledgeBase from 'enrichment/KnowledgeBase';
import SequenceRange from 'enrichment/SequenceRange';

export default class DNASequence extends Node {


    na:string

    constructor(kb:KnowledgeBase, na:string) {

        super(kb)

        this.na = na

    }

    getType():string {
        return 'DNASequence'
    }

    read(loc:SequenceRange):string {

        if(loc.forward) {
            if(loc.end.to0BasedInteger() < loc.start.to0BasedInteger()) {
                throw new Error('Wanted a forward sequence read, but end ' + loc.end + ' is before start ' + loc.start)
            }
            return this.na.substring(loc.start.to0BasedInteger(), loc.end.to0BasedInteger())
        } else {
            if(loc.end.to0BasedInteger() > loc.start.to0BasedInteger()) {
                throw new Error('Wanted a reverse sequence read, but end ' + loc.end + ' is after start ' + loc.start)
            }
            return SeqUtils.reverseDNA(this.na.substring(loc.end.to0BasedInteger(), loc.start.to0BasedInteger()))
        }

    }



}

