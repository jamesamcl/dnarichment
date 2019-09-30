
import Integration from "./Integration";
import KnowledgeBase from "enrichment/KnowledgeBase";
import AutoEnrichmentContext from "enrichment/AutoEnrichmentContext";
import DNASequence from "enrichment/nodes/DNASequence";

import SeqUtils from 'enrichment/SeqUtils'
import SequenceRange from "enrichment/SequenceRange";
import ORF from "enrichment/nodes/ORF";
import augustus from "enrichment/service/augustus";
import SequenceOffset from "enrichment/SequenceOffset";
import NSequenceHasPossibleORF from "enrichment/nuggets/NSequenceHasPossibleORF";
import * as config from 'enrichment/config'

export default class IGFindORFs extends Integration {

    visitedSequences:Set<string>

    constructor(context:AutoEnrichmentContext, kb:KnowledgeBase) {

        super(context, kb)

        this.visitedSequences = new Set()

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

            

            let isEukaryotic: boolean | undefined = this.kb.isEukaryotic()

            if (isEukaryotic === undefined) {
                throw new Error('need a tax ID to decide which ORF finder to use')
            }

            let res = isEukaryotic ?
                await this.findORFs_eukaryota(seq) :
                await this.findORFs_prokaryota(seq)


            console.log(res.ORFs.length + ' total ORF(s)')

            for(let orf of res.ORFs) {

                let na = orf.getCodingDNA()

                let aa = SeqUtils.dnaToAA(na)

                // Fan, K., & Wang, W. (2003). What is the minimum number of letters required to fold a protein?. Journal of molecular biology, 328(4), 921-926.
                if(aa.length < config.getRequiredNumber('IGFindORFs', 'minAALength')) {
                    console.log('Skipping ' + aa + ' (too short)')
                    continue
                }

                if(aa.indexOf('*') !== -1) {
                    console.log('Skipping ' + aa + ' (incomplete translation)')
                    continue
                }

                if(config.getRequiredBool('IGFindORFs', 'mustBeginWithM')) {
                    if(aa[0] !== 'M') {
                        console.log('Skipping ' + aa + ' (does not start with M)')
                        continue
                    }
                }

                let nug:NSequenceHasPossibleORF = new NSequenceHasPossibleORF(this.kb, seq, orf)

                this.kb.add(nug)
                this.kb.add(orf)

                seq.addDerived(nug)
                nug.addDerived(orf)
                orf.addDerived(nug)

            }
            
        }

    }



    private async findORFs_prokaryota(seq:DNASequence):Promise<{ ORFs:Array<ORF>, usedStrategy: string}> {

        this.context.log('info', 'Using prokaryotic strategy to find ORFs')

        const forwardVeORFs:Array<any> = SeqUtils.getORFsFromSequence(seq.na, 30, true, false)
        const reverseVeORFs:Array<any> = SeqUtils.getORFsFromSequence(seq.na, 30, false, false)

        this.context.log('info', 'Found ' + forwardVeORFs.length + ' +ORF(s) and ' + reverseVeORFs.length + ' -ORF(s) using prokaryotic strategy')

        let kb = this.kb

        return {
            ORFs: forwardVeORFs.map((veOrf:any) => convertORFforward(veOrf))
                               .concat(reverseVeORFs.map(((veOrf:any) => convertORFreverse(veOrf)))),
            usedStrategy: 'prokaryotic (looked for start and stop codons)'
        }

        function convertORFforward(veORF:any) {

            let start: SequenceOffset = SequenceOffset.from0BasedInteger(veORF.start, true)
            let end: SequenceOffset = SequenceOffset.from0BasedInteger(veORF.end, true)

            let startCodon = new SequenceRange(start, start.downstream(3))
            let stopCodon = new SequenceRange(end, end.downstream(3))

            const orf: ORF = new ORF(kb, seq, startCodon, stopCodon)

            orf.CDSes.push(new SequenceRange(start, end))

            return orf

        }

        function convertORFreverse(veORF:any) {

            let start: SequenceOffset = SequenceOffset.from0BasedInteger(veORF.end, false)
            let end: SequenceOffset = SequenceOffset.from0BasedInteger(veORF.start, false)

            let startCodon = new SequenceRange(start.upstream(1), start)
            let stopCodon = new SequenceRange(end.upstream(1), end.upstream(4))

            const orf: ORF = new ORF(kb, seq, startCodon, stopCodon)

            orf.CDSes.push(new SequenceRange(start, end))

            return orf
        }

    }

    private async findORFs_eukaryota(seq:DNASequence):Promise<{ ORFs:Array<ORF>, usedStrategy:string }> {

        this.context.log('info', 'Using eukaryotic strategy to find ORFs')

        let taxID = this.kb.getTaxId()

        if(taxID === undefined) {
            throw new Error('need a tax ID to use eurokaryotic orf finder')
        }

        return await augustus(this.kb, this.context, taxID, seq)

    }


}


