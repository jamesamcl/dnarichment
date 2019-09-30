import Nugget from "./nuggets/Nugget";


import { SBOLXGraph, SXComponent, SXSequence, node, triple } from "sbolgraph";


import Taxonomy from './Taxonomy'
import AutoEnrichmentContext from "./AutoEnrichmentContext";



import { Specifiers } from 'bioterms'
import DNASequence from "enrichment/nodes/DNASequence";
import KBEntry from "./KBEntry";

// I keep a set of nodes (e.g. Sequence, ORF, Protein) and a set of nuggets (e.g. NORFEncodesProtein)
// I'm not strictly a graph as in an RDF graph, because Nuggets aren't simple edges. They can refer
// to multiple nodes and they can have additional metadata.

export default class KnowledgeBase {

    context:AutoEnrichmentContext

    entries:Array<KBEntry>

    taxID:number
    gcContent:number


    constructor(context:AutoEnrichmentContext, taxID:number) {

        this.context = context

        this.entries = []

        this.usedIDs = new Set()

        this.taxID = taxID
        this.gcContent = 0.51 // TODO
    }


    add(entry:KBEntry) {

        this.context.log('info', 'KnowledgeBase: add entry: ' + entry.getType() + ' ' + entry.tempID())

        this.entries.push(entry)
    }

    prune(entry:KBEntry) {

        let that = this

        doPrune(entry, new Set())

        function doPrune(entry:KBEntry, visited:Set<KBEntry>) {

            if(visited.has(entry))
                return

            visited.add(entry)

            //that.context.log('info', 'KnowledgeBase: prune entry: ' + entry.getType() + ' ' + entry.tempID())

            for(let d of entry.getDerived()) {
                doPrune(d, visited)
            }

            for(let i = 0; i < that.entries.length; ++ i) {
                if(that.entries[i] === entry) {
                    that.entries.splice(i, 1)
                    return
                }
            }

            throw new Error('entry ' + entry.tempID() + ' not found to prune')
        }

    }

    importSBOL(graph:SBOLXGraph) {

        console.log(graph.topLevels.length + ' toplevel(s) to import')

        console.log(graph.topLevels.map((topLevel) => topLevel.uri))

        graph.sequences.forEach((sequence) => {

            if(sequence.encoding === Specifiers.SBOL2.SequenceEncoding.NucleicAcid) {

                let elements = sequence.elements

                if(sequence.elements !== undefined) {

                    let sequenceNode = new DNASequence(this, sequence.elements)
                    sequenceNode.setStringProperty('sbolURI', sequence.uri)
                    this.add(sequenceNode)

                    this.context.log('info', 'importSBOL: created DNASequence node ' + sequenceNode.tempID() + ' for ' + sequence.uri)

                }

            }

        })

    }


    getTaxId():number {

        return this.taxID


    }


    isEukaryotic():boolean|undefined {

        let taxId = this.getTaxId()

        return Taxonomy.isChildOf(taxId, /* Eukaryota */ 2759)

    }

    usedIDs:Set<string>

    makeID(from:string):string {

        let id = from
        let n = 2

        while(this.usedIDs.has(id)) {
            id = from + n
            ++ n
        }

        this.usedIDs.add(id)

        return id

    }





}