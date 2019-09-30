
import SequenceRange from "../SequenceRange";

import SeqUtils from 'enrichment/SeqUtils'
import Protein from "./Protein";
import Node from './Node';
import DNASequence from "./DNASequence";
import KnowledgeBase from "enrichment/KnowledgeBase";
import SequenceOffset from "enrichment/SequenceOffset";
import SequenceFeature from "./SequenceFeature";

export default class ORF extends SequenceFeature {

    introns:Array<SequenceRange>
    exons:Array<SequenceRange>
    CDSes:Array<SequenceRange>
    startCodon:SequenceRange
    stopCodon:SequenceRange

    constructor(kb:KnowledgeBase, sequence:DNASequence, startCodon:SequenceRange, stopCodon:SequenceRange) {

        super(kb, sequence)

        this.introns = []
        this.exons = []
        this.CDSes = []
        
        this.startCodon = startCodon
        this.stopCodon = stopCodon
    }


    getType():string {
        return 'ORF'
    }


    getCodingDNA():string {

        if(this.startCodon === null)
            throw new Error('ORF has no start codon specified')

        if(this.stopCodon === null)
            throw new Error('ORF has no stop codon specified')

        var fragments:Array<string> = []

        var cursor:SequenceOffset = this.startCodon.start

        let forward = this.startCodon.forward

        for(let intronRange of this.introns) {

            fragments.push(this.sequence.read(new SequenceRange(cursor, intronRange.start)))

            cursor = intronRange.end
        }

        if(forward) {
            if(cursor.to1BasedInteger() < this.stopCodon.start.to1BasedInteger()) {
                fragments.push(this.sequence.read(new SequenceRange(cursor, this.stopCodon.start)))
            }
        } else {
            console.log('Reverse; cursor is at ' + cursor + ', stop codon is ' + this.stopCodon)
            if(cursor.to1BasedInteger() > this.stopCodon.start.to1BasedInteger()) {
                fragments.push(this.sequence.read(new SequenceRange(cursor, this.stopCodon.start)))
            }
        }

        return fragments.join('')

    }

    getRanges():SequenceRange[] {

        return this.CDSes.concat([ new SequenceRange(this.startCodon.start, this.stopCodon.end) ])

    }

    toAA():string {

        return SeqUtils.dnaToAA(this.getCodingDNA())

    }

    toProtein():Protein {

        return new Protein(this.kb, this.toAA())


    }


    serialize():any {

        return {
            id: this.tempID(),
            introns: this.introns,
            exons: this.exons,
            CDSes: this.CDSes,
            startCodon: this.startCodon,
            stopCodon: this.stopCodon
        }
    }

    toString():string {

        return this.CDSes.map((cds) => cds.toString()).join(';')
    }


}

