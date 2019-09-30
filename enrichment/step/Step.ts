
import KnowledgeBase from "../KnowledgeBase";
import AutoEnrichmentContext from "../AutoEnrichmentContext";

export default abstract class Integration {

    context:AutoEnrichmentContext
    kb:KnowledgeBase

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        this.context = context
        this.kb = kb

    }

    async init():Promise<void> {
    }

    abstract async perform():Promise<void>

}