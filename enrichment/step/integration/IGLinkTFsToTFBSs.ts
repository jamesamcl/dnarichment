

import Integration from "./Integration";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import KnowledgeBase from "enrichment/KnowledgeBase";
import Protein from "enrichment/nodes/Protein";
import TFBS from "enrichment/nodes/TFBS";
import NProteinIsTF from "enrichment/nuggets/NProteinIsTF";
import NTFBindsToTFBS from "enrichment/nuggets/NTFBindsToTFBS";

export default class IGLinkTFsToTFBSs extends Integration {

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        super(context, kb)


    }

    async perform():Promise<void> {

        // yay O(n^2) check of all pairs

        let donePairs = new Set<string>()

        for(let nA of this.kb.entries) {

            for(let nug of this.kb.entries) {

                if(nA.getType() === 'TFBS' && nug.getType() === 'ProteinIsTF') {

                    let tfbs = nA as TFBS
                    let pIsTF = nug as NProteinIsTF

                    if(tfbs.tf === pIsTF.tf) {

                        let protein = pIsTF.protein

                        let id = protein.tempID() + ',' + tfbs.tempID()

                        if(donePairs.has(id)) {
                            continue
                        }

                        donePairs.add(id)

                        let nug = new NTFBindsToTFBS(this.kb, pIsTF.protein, tfbs)

                        tfbs.addName(tfbs.tf, 10)

                        this.kb.add(nug)

                    }
                }

            }

        }




    }



    private visitedPairs:Set<string>

    private checkPair(a:Protein, b:TFBS):boolean {

        let ids = [ a.tempID(), b.tempID() ]
        ids.sort()

        if(this.visitedPairs.has(ids.join('_')))
            return true

        this.visitedPairs.add(ids.join('_'))

        return false
    }


}