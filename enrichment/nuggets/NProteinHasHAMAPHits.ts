

import Nugget from "./Nugget";
import Protein from 'enrichment/nodes/Protein'
import HMMHit from "../service/HMMHit";
import KnowledgeBase from "enrichment/KnowledgeBase";

export default class NProteinHasHAMAPHits extends Nugget {

    protein:Protein
    results:Array<HMMHit>

    constructor(kb:KnowledgeBase, protein:Protein) {

        super(kb)

        this.protein = protein

    }

    getType():string {
        return 'ProteinHasHAMAPHits'
    }

    getSummary():string {
        return this.getType() + ': ' + this.protein.tempID () + ' has ' + this.results.length + ' result(s)'
    }

    serialize():any {

        return {
            type: this.getType(),
            protein: this.protein.tempID()
        }

    }


}