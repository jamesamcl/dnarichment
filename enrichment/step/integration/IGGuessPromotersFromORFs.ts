
import Integration from "./Integration";
import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import Protein from "enrichment/nodes/Protein";
import NProteinHasDegradationTag from "enrichment/nuggets/NProteinHasDegradationTag";
import ORF from "enrichment/nodes/ORF";
import DNASequence from "enrichment/nodes/DNASequence";
import scanSequence, { Match } from "enrichment/scanSequence";

export default class IGGuessPromotersFromORFs extends Integration {

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


            if(orf.startCodon === null)
                continue


            let sequence:DNASequence = orf.sequence


            // Harley et al. (1987) Analysis of E. coli promoter sequences
            let motif:string = 't82 a89 t52 a59 a49 t89'

            let matches:Array<Match> = scanSequence(
                sequence.na,
                /* startOffset */ orf.startCodon.start,
                /* endOffset */ orf.startCodon.start.upstream(18),
                motif,
                /* expectedOffset */ orf.startCodon.start.upstream(10),
                /* distancePenalty */ 1
            )

            if(matches.length > 0) {
                console.log('-10 from start codon at ' + orf.startCodon.start)
                console.log(JSON.stringify(matches) + ' ' + sequence.na.substr(matches[0].offset.to0BasedInteger(), 6))
            }




            let motif2:string = 't69 t79 g61 a56 c54 a54'

            let matches2:Array<Match> = scanSequence(
                sequence.na,
                /* startOffset */ orf.startCodon.start.upstream(10),
                /* endOffset */ orf.startCodon.start.upstream(50),
                motif,
                /* expectedOffset */ orf.startCodon.start.upstream(35),
                /* distancePenalty */ 1
            )

            if(matches2.length > 0) {
                console.log('-35 from start codon at ' + orf.startCodon.start)
                console.log(JSON.stringify(matches2) + ' ' + sequence.na.substr(matches2[0].offset.to0BasedInteger(), 6))
            }
        }

    }




}