
import Nugget from "./Nugget";
import ORF from 'enrichment/nodes/ORF'
import Protein from 'enrichment/nodes/Protein'
import KnowledgeBase from "enrichment/KnowledgeBase";

export default class NORFMakesProtein extends Nugget {

    orf:ORF
    protein:Protein

    constructor(kb:KnowledgeBase, orf:ORF, protein:Protein) {

        super(kb)

        this.orf = orf
        this.protein = protein

    }

    getType():string {
        return 'ORFMakesProtein'
    }

    serialize():any {

        return {
            type: this.getType(),
            orf: this.orf.tempID(),
            protein: this.protein.tempID()
        }

    }


}