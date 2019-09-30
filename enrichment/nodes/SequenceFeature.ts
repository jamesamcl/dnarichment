import SequenceRange from "enrichment/SequenceRange";
import KnowledgeBase from "enrichment/KnowledgeBase";
import DNASequence from "./DNASequence";
import Node from './Node'

export default abstract class SequenceFeature extends Node {

    sequence:DNASequence

    constructor(kb:KnowledgeBase, seq:DNASequence) {

        super(kb)

        this.sequence = seq
    }

    abstract getRanges():SequenceRange[]

    getRange():SequenceRange {

        let ranges = this.getRanges()

        if(ranges.length === 0) {
            throw new Error('no ranges?')
        }

        let r = ranges[0]

        for(let n = 1; n < ranges.length; ++ n) {
            r = r.join(ranges[n])
        }

        return r
    }

    isForward():boolean {
        return this.getRanges()[0].forward
    }

    overlaps(otherFeature:SequenceFeature):boolean {

        return this.getRange().overlapsRange(otherFeature.getRange())

    }

}