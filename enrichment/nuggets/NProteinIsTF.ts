
import Nugget from "./Nugget";
import Protein from 'enrichment/nodes/Protein'
import HMMHit from "../service/HMMHit";
import KnowledgeBase from "enrichment/KnowledgeBase";

export default class NProteinIsTF extends Nugget {

    protein:Protein
    tf:string

    constructor(kb:KnowledgeBase, protein:Protein) {

        super(kb)

        this.protein = protein

    }

    getType():string {
        return 'ProteinIsTF'
    }

    getSummary():string {
        return this.getType() + ': ' + this.protein.tempID () + ' is tf ' + this.tf
    }

    serialize():any {

        return {
            type: this.getType(),
            protein: this.protein.tempID()
        }

    }


}