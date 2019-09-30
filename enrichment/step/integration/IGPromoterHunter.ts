
import Integration from "./Integration";
import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import DNASequence from "enrichment/nodes/DNASequence";
import PromoterHunter, { PromoterHunterResult } from "enrichment/service/PromoterHunter";
import Promoter from "enrichment/nodes/Promoter";
import SequenceRange from "enrichment/SequenceRange";
import NSequenceHasPossiblePromoter from "enrichment/nuggets/NSequenceHasPossiblePromoter";
import * as config from 'enrichment/config'

export default class IGPromoterHunter extends Integration {

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        super(context, kb)

    }

    async perform():Promise<void> {

        for(let node of this.kb.entries) {

            if(node.getType() !== 'DNASequence')
                continue

            let seq:DNASequence = node as DNASequence

            let results:Array<PromoterHunterResult> = await PromoterHunter.hunt(seq.na)

            console.log(JSON.stringify(results, null, 2))

            let minScore1 = config.getRequiredNumber('IGPromoterHunter', 'minScore1')
            let minScore2 = config.getRequiredNumber('IGPromoterHunter', 'minScore2')
            let minSummaryScore = config.getRequiredNumber('IGPromoterHunter', 'minSummaryScore')
            let minEnergyScore = config.getRequiredNumber('IGPromoterHunter', 'minEnergyScore')
            let minFinalScore = config.getRequiredNumber('IGPromoterHunter', 'minFinalScore')

            for(let result of results) {

                let minus10 = new SequenceRange(
                    result.begin1,
                    result.begin1.downstream(6)
                )

                let minus35 = new SequenceRange(
                    result.begin2,
                    result.begin2.downstream(6)
                )

                let tss = new SequenceRange(
                    result.begin1.downstream(15),
                    result.begin1.downstream(18)
                )

                if(result.score1 < minScore1 ||
                    result.score2 < minScore2 ||
                    result.summaryScore < minSummaryScore ||
                    result.energyScore < minEnergyScore ||
                    result.finalScore < minFinalScore)
                {
                    continue
                }

                let promoter:Promoter = new Promoter(this.kb, seq, minus10, minus35, tss)
                this.kb.add(promoter)

                let nug:NSequenceHasPossiblePromoter = new NSequenceHasPossiblePromoter(this.kb, seq, promoter)
                this.kb.add(nug)

                promoter.addDerived(nug)
                nug.addDerived(promoter)

                nug.addProvenance('PromoterHunter;' + JSON.stringify(result))
            }


        }
    }
}

