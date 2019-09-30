
import Nugget from "./Nugget";
import Protein from 'enrichment/nodes/Protein'
import KnowledgeBase from "enrichment/KnowledgeBase";

export default class NProteinHasDegradationTag extends Nugget {

    protein:Protein

    constructor(kb:KnowledgeBase, protein:Protein) {

        super(kb)

        this.protein = protein

    }

    getType():string {
        return 'ProteinHasDegradationTag'
    }

    serialize():any {

        return {
            type: this.getType(),
            protein: this.protein.tempID()
        }

    }


}