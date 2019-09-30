
import Integration from "./Integration";
import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import Protein from "enrichment/nodes/Protein";
import ORF from "enrichment/nodes/ORF";
import fmaseq from "enrichment/service/fmaseq";
import NProteinHasUniprotMatch from "enrichment/nuggets/NProteinHasUniprotMatch";
import NProteinHasPfamHits from "enrichment/nuggets/NProteinHasPfamHits";
import TFMapper from "enrichment/TFMapper";
import NProteinIsTF from "enrichment/nuggets/NProteinIsTF";

export default class IGCreateTFsFromPfamHits extends Integration {

    visited:Set<NProteinHasPfamHits>

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        super(context, kb)

        this.visited = new Set()

    }

    async perform():Promise<void> {

        for(let nugget of this.kb.entries) {

            if(nugget.getType() !== 'ProteinHasPfamHits')
                continue

            let hits:NProteinHasPfamHits = nugget as NProteinHasPfamHits

            if(this.visited.has(hits))
                continue

            this.visited.add(hits)


            let protein:Protein = hits.protein

            let seen = new Set<string>()

            for(let hit of hits.results) {

                let acc = hit.accession
                let fam = acc.split('.')[0]

                if(seen.has(acc))
                    continue

                seen.add(acc)

                let tf = TFMapper.pfamToTF(fam)

                if(tf === undefined)
                    continue

                let nugget:NProteinIsTF = new NProteinIsTF(this.kb, protein)
                nugget.tf = tf
                nugget.addProvenance('mapped from Pfam hit ' + acc)

                protein.addName(tf, 20)

                this.kb.add(nugget)
            }


        }

    }




}