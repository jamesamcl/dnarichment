
import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import Rule from './Rule'
import SequenceFeature from "enrichment/nodes/SequenceFeature";

export default class RForwardOnly extends Rule {

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {
        super(context, kb)
    }

    async perform():Promise<void> {

        for(let node of this.kb.entries.slice(0)) {
            if(node instanceof SequenceFeature) {
                if(node.isForward()) {
                    this.kb.prune(node)
                }
            }
        }
    }
}

