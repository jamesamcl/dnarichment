

import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import Rule from './Rule'
import Terminator from "enrichment/nodes/Terminator";
import Node from "enrichment/nodes/Node";
import SequenceFeature from "enrichment/nodes/SequenceFeature";
import DNASequence from "enrichment/nodes/DNASequence";

export default class RMergeAdjacentTerminators extends Rule {

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        super(context, kb)

    }

    async perform():Promise<void> {

        console.log('RMergeAdjacentTerminators', 'starting with ' + this.kb.entries.length + ' entries in the kb')
        
        let features:Map<DNASequence, SequenceFeature[]> = new Map()

        for(let entry of this.kb.entries) {
            if(entry instanceof SequenceFeature) {

                let list = features.get(entry.sequence)

                if(!list) {
                    features.set(entry.sequence, (list = []))
                }

                list.push(entry)
            }
        }

        for(let [ sequence, list ] of features) {
            list.sort((a, b) => {
                return a.getRange().isDownstreamOf(b.getRange()) ? 1 : -1
            })
        }



        let killList:SequenceFeature[] = []
        let newList:SequenceFeature[] = []

        for(let [ sequence, list ] of features) {


            console.log('RMergeAdjacentTerminators', 'sequence ' + sequence.tempID() + ' has ' + list.length + ' features')
            console.log('RMergeAdjacentTerminators', list.map((f) => f.getType()).join(','))

            for(let i = 0; i < list.length; ++ i) {

                if(list[i] instanceof Terminator &&
                        list[i + 1] instanceof Terminator) {

                    let newRange = list[i].getRange().join(list[i+1].getRange())

                    killList.push(list[i])

                    while(i < list.length - 1) {

                        if(! (list[i+1] instanceof Terminator)) {
                            break
                        }

                        ++ i

                        newRange = newRange.join(list[i].getRange())
                        killList.push(list[i])
                    }

                    let newTerm = new Terminator(this.kb, sequence, newRange)
                    newList.push(newTerm)
                }
            }
        }

        for(let kill of killList) {
            this.kb.prune(kill)
        }

        for(let newT of newList) {
            this.kb.add(newT)
        }

        console.log('RMergeAdjacentTerminators', 'now have ' + this.kb.entries.length + ' entries in the kb')
    }


}