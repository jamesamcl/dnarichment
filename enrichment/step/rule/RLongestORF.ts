

import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import Rule from './Rule'
import ORF from "enrichment/nodes/ORF";
import Node from "enrichment/nodes/Node";

export default class RLongestORF extends Rule {

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        super(context, kb)

    }

    async perform():Promise<void> {

        console.log('RLongestORF', 'starting with ' + this.kb.entries.length + ' entries in the kb')

        let nodeToMergeGroup:Map<ORF, Set<ORF>> = new Map()

        let alreadyPruned:Set<Node> = new Set()

        for(let node of this.kb.entries) {

            if(! (node instanceof ORF))
                continue

            for(let otherNode of this.kb.entries) {

                if(node === otherNode || ! (otherNode instanceof ORF))
                    continue

                if(node.sequence === otherNode.sequence && node.overlaps(otherNode)) {
                    group(node, otherNode)
                }
            }

        }

        // I mean could have just put them all in groups on their own and merged
        // knowing they'd already be in groups...
        // but this is another way of doing it I suppose ¯\_(ツ)_/¯

        for(let node of this.kb.entries) {

            if(! (node instanceof ORF))
                continue

            if(!nodeToMergeGroup.has(node)) {
                nodeToMergeGroup.set(node, new Set([ node ]))
            }

        }


        let distinctValues = new Set(nodeToMergeGroup.values()).keys()

        for(let g of distinctValues) {

            console.log('merging group ' + g.size)

            let bigOrf:ORF|undefined = undefined

            for(let orf of g.values()) {

                if(!bigOrf) {
                    bigOrf = new ORF(this.kb, orf.sequence, orf.startCodon, orf.stopCodon)
                    this.kb.add(bigOrf)
                }


                for(let cds of orf.CDSes) {

                    let hadOverlappingCds = false

                    for(let existingCds of bigOrf.CDSes) {

                        if(existingCds.overlapsRange(cds)) {
                            existingCds.start = existingCds.start.upstreammost(cds.start)
                            existingCds.end = existingCds.end.downstreammost(cds.end)
                            hadOverlappingCds = true
                            break
                        }
                    }

                    if(!hadOverlappingCds)
                        bigOrf.CDSes.push(cds)
                }

                bigOrf.startCodon = bigOrf.startCodon.upstreammost(orf.startCodon)
                bigOrf.stopCodon = bigOrf.stopCodon.downstreammost(orf.stopCodon)

                if(!alreadyPruned.has(orf)) {
                    this.kb.prune(orf)
                    alreadyPruned.add(orf)
                }
            }

        }

        console.log('RLongestORF', 'now have ' + this.kb.entries.length + ' entries in the kb')

        function group(nA:ORF, nB:ORF) {

            let gA = nodeToMergeGroup.get(nA)
            let gB = nodeToMergeGroup.get(nB)

            if(gA && !gB) {
                gA.add(nB)
                nodeToMergeGroup.set(nB, gA)
                return
            } else if(!gA && gB) {
                gB.add(nA)
                nodeToMergeGroup.set(nA, gB)
                return
            } else if(!gA && !gB) {
                let newGroup = new Set<ORF>()
                newGroup.add(nA)
                newGroup.add(nB)
                nodeToMergeGroup.set(nA, newGroup)
                nodeToMergeGroup.set(nB, newGroup)
                return newGroup
            }

            if(!gA || !gB) {
                throw new Error('my logic was incorrect')
            }

            for (let node of gB) {
                gA.add(node)
                nodeToMergeGroup.set(node, gA)
            }

            gA.add(nA)
            gA.add(nB)

            return gA
        }

    }


}