
import Integration from "./Integration";
import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import Protein from "enrichment/nodes/Protein";
import ORF from "enrichment/nodes/ORF";
import NORFMakesProtein from "enrichment/nuggets/NORFMakesProtein";

export default class IGCreateProteinsForORFs extends Integration {

    visitedORFs:Set<string>

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        super(context, kb)

        this.visitedORFs = new Set()

    }

    async perform():Promise<void> {

        for(let node of this.kb.entries) {

            if(node.getType() !== 'ORF')
                continue

            let orf:ORF = node as ORF

            let id:string = node.tempID()


            if(this.visitedORFs.has(id))
                continue

            this.visitedORFs.add(id)

            let protein:Protein = new Protein(this.kb, orf.toAA(), orf)
            this.kb.add(protein)

            let nugget:NORFMakesProtein = new NORFMakesProtein(this.kb, orf, protein)
            this.kb.add(nugget)

            orf.addDerived(nugget)
            nugget.addDerived(protein)

            nugget.addProvenance('inferred hypothetical protein from potential ORF identified in sequence')
        }

    }




}