
import SeqUtils from 'enrichment/SeqUtils'
import Node from './Node';
import KnowledgeBase from 'enrichment/KnowledgeBase';
import ORF from './ORF';

export default class Protein extends Node {

    aa:string
    orf:ORF|undefined

    constructor(kb:KnowledgeBase, aa:string, orf?:ORF) {

        super(kb, aa.substr(0, 5))

        this.aa = aa
        this.orf = orf
    }

    getType():string {
        return 'Protein'
    }

    addName(name:string, goodness:number) {
        super.addName(name, goodness)

        if(this.orf) {
            this.orf.addName(name, goodness)
        }
    }



}

