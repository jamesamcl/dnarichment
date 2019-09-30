

import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import Rule from './Rule'
import ORF from "enrichment/nodes/ORF";
import Node from "enrichment/nodes/Node";
import Promoter from "enrichment/nodes/Promoter";
import Terminator from "enrichment/nodes/Terminator";
import SequenceFeature from "enrichment/nodes/SequenceFeature";

export default class RCompleteTUsOnly extends Rule {

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        super(context, kb)

    }

    async perform():Promise<void> {

        let forward:Array<SequenceFeature> = []
        let reverse:Array<SequenceFeature> = []

        for(let node of this.kb.entries) {
            if(node instanceof ORF || node instanceof Promoter || node instanceof Terminator) {
                if(node.isForward()) {
                    forward.push(node)
                } else {
                    reverse.push(node)
                }
            }
        }

        for(let strand of [ forward, reverse ]) {

            strand.sort((a, b) => {
                return a.getRange().isDownstreamOf(b.getRange()) ? 1 : -1
            })

            let promoted = false
            let terminated = false
            let ORFs:Array<ORF> = []

            for(let n = 0; n < strand.length; ++ n) {

                let feature = strand[n]
                
                if(!promoted) {
                    if(feature instanceof Promoter) {
                        promoted = true
                        continue
                    }
                    if (feature instanceof Terminator) {
                        this.kb.prune(feature)
                        continue
                    }
                } else {
                    if (feature instanceof Terminator) {
                        promoted = false
                        ORFs = []
                        continue
                    }

                }

                if(feature instanceof ORF) {
                    if(!promoted) {
                        this.kb.prune(feature)
                        continue
                    } else {
                        ORFs.push(feature)
                    }
                }
            }

            if(promoted) {
                for(let orf of ORFs) {
                    this.kb.prune(orf)
                }
            }
        }
    }



}