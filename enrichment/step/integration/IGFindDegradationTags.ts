import Integration from "./Integration";
import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import Protein from "enrichment/nodes/Protein";
import NProteinHasDegradationTag from "enrichment/nuggets/NProteinHasDegradationTag";

export default class IGFindDegradationTags extends Integration {

    visitedProteins:Set<string>

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        super(context, kb)

        this.visitedProteins = new Set()

    }

    async perform():Promise<void> {

        for(let node of this.kb.entries) {

            if(node.getType() !== 'Protein')
                continue

            let protein:Protein = node as Protein

            let id:string = node.tempID()


            if(this.visitedProteins.has(id))
                continue

            this.visitedProteins.add(id)


            let aa = protein.aa

            if (aa.match(/AANDENYA...$/)) {

                let aaWithoutTag = aa.substr(0, aa.length - 11)

                let protHasDegTag:NProteinHasDegradationTag = new NProteinHasDegradationTag(this.kb, protein)
                protHasDegTag.addProvenance('Looked for suffix matching AANDENYA***')

                this.kb.add(protHasDegTag)


                let protWithoutTag:Protein = new Protein(this.kb, aaWithoutTag)
                protWithoutTag.setStringProperty('provenance', protein.tempID() + ' without degradation tag')
                this.kb.add(protWithoutTag)


            }

            

        }

    }




}