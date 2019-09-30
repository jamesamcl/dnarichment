

import Integration from "./Integration";
import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import Protein from "enrichment/nodes/Protein";
import NProteinHasDegradationTag from "enrichment/nuggets/NProteinHasDegradationTag";
import DNASequence from "enrichment/nodes/DNASequence";
import DNABlaster, { BlastResult } from 'enrichment/service/DNABlaster'
import NSequenceHasPossibleTFBS from "enrichment/nuggets/NSequenceHasPossibleTFBS";
import TFBS from "enrichment/nodes/TFBS";
import TFMapper from "enrichment/TFMapper";
import SequenceRange from "enrichment/SequenceRange";
import SequenceOffset from "enrichment/SequenceOffset";
import * as config from 'enrichment/config'

export default class IGFindTFBSsBlast extends Integration {

    visitedSequences:Set<string>


    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        super(context, kb)

        this.visitedSequences = new Set()


    }

    async init():Promise<void> {


    }

    async perform():Promise<void> {

        for(let node of this.kb.entries) {

            if(node.getType() !== 'DNASequence')
                continue

            let seq:DNASequence = node as DNASequence

            let id:string = node.tempID()


            if(this.visitedSequences.has(id))
                continue

            this.visitedSequences.add(id)


            let na = seq.na


            let annotations:NSequenceHasPossibleTFBS[] = []


            let blast = new DNABlaster()
            blast.setTask('blastn-short')
            blast.setDB('tfbs')

            let results:Array<BlastResult> = await blast.blast(na)

            for(let result of results) {

                if(result.eValue > config.getRequiredNumber('IGFindTFBSsBlast', 'maxEValue'))
                    continue

                if(result.length < config.getRequiredNumber('IGFindTFBSsBlast', 'minLength'))
                    continue

                let tf:string|undefined = undefined

                if(result.fastaHeader.indexOf('MF') === 0) {

                    // prodoric

                    let tokens = result.fastaHeader.match(/(.*?) (.*?) (.*)$/)

                    if (tokens === null) {
                        //throw new Error('???')
                        continue
                    }

                    let motif = tokens[1]
                    let matrix = tokens[2]
                    let desc = tokens[3]

                    tf = TFMapper.prodoricToTF(matrix)

                } else {

                    // igem

                    tf = result.fastaHeader.split(' ')[0]
                }

                if (tf === undefined)
                    continue

                let location:SequenceRange|undefined = undefined
            
                if(result.startInQuery < result.endInQuery) {
                    location = new SequenceRange(
                        SequenceOffset.from1BasedInteger(result.startInQuery, true),
                        SequenceOffset.from1BasedInteger(result.endInQuery, true)
                    )
                } else {
                    location = new SequenceRange(
                        SequenceOffset.from1BasedInteger(result.endInQuery, false),
                        SequenceOffset.from1BasedInteger(result.startInQuery, false)
                    )
                }

                let skip = false

                for(let anno of annotations) {

                    // If we've already annotated this TF and the location
                    // overlaps with this location, extend its location rather
                    // than creating a new one

                    if(anno.tfbs.tf === tf) {

                        let otherLocation = anno.tfbs.location

                        if(otherLocation &&
                            otherLocation.overlapsRange(location)) {

                            anno.tfbs.location = otherLocation.join(location)

                            anno.addProvenance('blast;' + JSON.stringify(result))

                            skip = true
                            break

                        }
                    }

                }

                if(skip)
                    continue

                let tfbs: TFBS = new TFBS(this.kb, seq)
                tfbs.tf = tf
                tfbs.location = location
                tfbs.addName(tf, 1)


                this.kb.add(tfbs)

                let nugget: NSequenceHasPossibleTFBS = new NSequenceHasPossibleTFBS(this.kb, seq, tfbs)
                this.kb.add(nugget)

                nugget.addProvenance('blast;' + JSON.stringify(result))

                annotations.push(nugget)

            }
            

        }

    }




}