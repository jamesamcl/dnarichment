
import Integration from "./Integration";
import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import Protein from "enrichment/nodes/Protein";
import ORF from "enrichment/nodes/ORF";

import NProteinHasPfamHits from "enrichment/nuggets/NProteinHasPfamHits";
import HMMScanner from "enrichment/service/HMMScanner";
import NProteinHasHAMAPHits from "enrichment/nuggets/NProteinHasHAMAPHits";

export default class IGSearchHAMAP extends Integration {

    visitedProteins:Set<string>

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        super(context, kb)

        this.visitedProteins = new Set()

    }

    async perform():Promise<void> {

        let proteins:Array<Protein> = []

        for(let node of this.kb.entries) {

            if(node.getType() !== 'Protein')
                continue

            let protein:Protein = node as Protein

            let id:string = node.tempID()


            if(this.visitedProteins.has(id))
                continue

            this.visitedProteins.add(id)


            proteins.push(protein)

        }


        if(proteins.length > 0) {

            let scanner:HMMScanner = new HMMScanner()

            scanner.setDB('HAMAP.hmm')

            let results = await scanner.scan(proteins)


            for(let res of results) {

                let { protein, hits } = res

                let nugget: NProteinHasHAMAPHits = new NProteinHasHAMAPHits(this.kb, protein)

                nugget.results = hits
                
                this.kb.add(nugget)
            }
        }


    }


}