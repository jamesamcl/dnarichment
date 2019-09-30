
import Integration from "./Integration";
import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import Protein from "enrichment/nodes/Protein";
import ORF from "enrichment/nodes/ORF";

import NProteinHasPfamHits from "enrichment/nuggets/NProteinHasPfamHits";
import HMMScanner from "enrichment/service/HMMScanner";

import fs = require('fs')



let clans = new Map<string,string[]>()

for(let line of fs.readFileSync('Pfam-A.clans.tsv').toString().split('\n')) {
    let toks = line.split(/\t+/g)
    clans.set(toks[0], toks)
}



export default class IGSearchPfam extends Integration {

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

            let scanner: HMMScanner = new HMMScanner()

            scanner.setDB('Pfam-A.hmm')

            let results = await scanner.scan(proteins)


            for (let res of results) {

                let { protein, hits } = res

                let nugget: NProteinHasPfamHits = new NProteinHasPfamHits(this.kb, protein)

                for(let hit of hits) {

                    let clan = clans.get(hit.accession.split('.')[0])

                    protein.addName(hit.targetName, 5)
                    protein.addDescription(hit.description)

                    if(clan) {
                        for(let i = 0; i < clan.length; ++ i) {
                            if(clan[i] !== '') {
                                protein.addName(clan[i], 6 + i)
                            }
                        }
                    }
                }

                nugget.results = hits

                this.kb.add(nugget)
            }
        }


    }


}