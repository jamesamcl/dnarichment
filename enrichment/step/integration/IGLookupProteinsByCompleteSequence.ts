
import Integration from "./Integration";
import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import Protein from "enrichment/nodes/Protein";
import ORF from "enrichment/nodes/ORF";
import fmaseq from "enrichment/service/fmaseq";
import NProteinHasUniprotMatch from "enrichment/nuggets/NProteinHasUniprotMatch";

export default class IGLookupProteinsByCompleteSequence extends Integration {

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


            let res = await fmaseq(this.context, protein.aa)

            for(let r of res) {

                let nugget:NProteinHasUniprotMatch = new NProteinHasUniprotMatch(this.kb, protein)

                nugget.accession = r.accession
                nugget.name = r.name
                nugget.database = r.database
                nugget.organism = r.organism
                nugget.proteinExistence = r.proteinExistence

                this.kb.add(nugget)
            }

        }

    }




}