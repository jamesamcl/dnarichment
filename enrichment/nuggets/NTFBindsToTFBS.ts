import Protein from "enrichment/nodes/Protein";
import TFBS from "enrichment/nodes/TFBS";
import Nugget from "enrichment/nuggets/Nugget";
import KnowledgeBase from "enrichment/KnowledgeBase";

export default class NTFBindsToTFBS extends Nugget {

    tf:Protein
    tfbs:TFBS

    constructor(kb:KnowledgeBase, tf:Protein, tfbs:TFBS) {

        super(kb)

        this.tf = tf
        this.tfbs = tfbs
    }


    getType():string {
        return 'TFBindsToTFBS'
    }

    serialize():any {

        return {
            type: this.getType()
        }

    }

    getSummary():string {
        return this.getType() + ': ' + this.tf.tempID () + ' binds to ' + this.tfbs.tempID()
    }

    dump(stream:NodeJS.WritableStream):void {

        stream.write(this.getSummary())

    }







}