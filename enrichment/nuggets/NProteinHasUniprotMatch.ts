
import Nugget from "./Nugget";
import Protein from 'enrichment/nodes/Protein'
import KnowledgeBase from "enrichment/KnowledgeBase";

export default class NProteinHasUniprotMatch extends Nugget {

    protein:Protein


    proteinExistence: string
    organism: string
    accession: string
    database: string
    name:string


    constructor(kb:KnowledgeBase, protein:Protein) {

        super(kb)

        this.protein = protein

    }

    getType():string {
        return 'ProteinHasUniprotMatch'
    }

    getSummary():string {
        return this.getType() + ': ' + this.protein.tempID() + ' is ' + this.name
    }

    serialize():any {

        return {
            type: this.getType(),
            protein: this.protein.tempID(),

            proteinExistence: this.proteinExistence,
            accession: this.accession,
            database: this.database,
            organism: this.organism,
            name: this.name
        }

    }


}