
import Integration from "./Integration";
import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import Protein from "enrichment/nodes/Protein";
import NProteinHasDegradationTag from "enrichment/nuggets/NProteinHasDegradationTag";
import DNASequence from "enrichment/nodes/DNASequence";
import PWMScanner from "enrichment/PWMScanner";

export default class IGFindTFBSsPWM extends Integration {

    visitedSequences:Set<string>

    pwmScanner:PWMScanner

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        super(context, kb)

        this.visitedSequences = new Set()


    }

    async init():Promise<void> {

        this.pwmScanner = new PWMScanner(this.kb.gcContent)
        await this.pwmScanner.loadPWMsFromFile('prodoric.json')

    }

    async perform():Promise<void> {

        for(let node of this.kb.entries) {

            if(node.getType() !== 'DNASequence')
                continue

            let seq:DNASequence = node as DNASequence

            let id:string = node.tempID()


            if(this.visitedSequences.has(id))
                continue

            this.visitedSequences.add(id)


            let na = seq.na

            this.pwmScanner.scan(na)

            

            

        }

    }




}