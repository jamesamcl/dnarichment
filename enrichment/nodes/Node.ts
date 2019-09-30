import KnowledgeBase from "../KnowledgeBase";
import KBEntry from "enrichment/KBEntry";

export default abstract class Node extends KBEntry {

    constructor(kb:KnowledgeBase, id?:string) {

        super(kb, id)

        this.names = []
        this.descriptions = []
    }


    private names:Array<{ name:string, goodness:number }>
    private descriptions:Array<string>

    addName(name:string, goodness:number) {
        this.names.push({ name, goodness })
    }

    getBestName():string|null {
        if(this.names.length === 0) {
            return null
        }
        return this.names.sort((a, b) => b.goodness - a.goodness)[0].name
    }

    addWasInformedBy(node:Node) {

    }

    addDescription(desc:string) {
        this.descriptions.push(desc)
    }

    getDescriptions():Array<string> {
        return this.descriptions.slice(0)
    }

}