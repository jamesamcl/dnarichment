

import Integration from "./Integration";
import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import DNASequence from "enrichment/nodes/DNASequence";
import TransTerm, { TransTermResult } from "enrichment/service/TransTerm";
import Promoter from "enrichment/nodes/Promoter";
import SequenceRange from "enrichment/SequenceRange";
import NSequenceHasPossiblePromoter from "enrichment/nuggets/NSequenceHasPossiblePromoter";
import Terminator from "enrichment/nodes/Terminator";

export default class IGTransTerm extends Integration {

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        super(context, kb)

    }

    async perform():Promise<void> {

        for(let node of this.kb.entries) {

            if(node.getType() !== 'DNASequence')
                continue

            let seq:DNASequence = node as DNASequence

            let results:Array<TransTermResult> = await TransTerm.transterm(seq.na)

            for(let result of results) {

                let terminator:Terminator = new Terminator(this.kb, seq, result.range)
                this.kb.add(terminator)

                //let nug:NSequenceHasPossibleTerminator = new NSequenceHasPossiblePromoter(this.kb, seq, terminator)
                //this.kb.addNugget(nug)

                //nug.addProvenance('PromoterHunter;' + JSON.stringify(result))
            }


        }
    }
}

