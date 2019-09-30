
import KnowledgeBase from "enrichment/KnowledgeBase";
import { Graph, serialize, node } from "sbolgraph";
import Protein from "enrichment/nodes/Protein";
import { Predicates, Prefixes } from "bioterms";
import DNASequence from "enrichment/nodes/DNASequence";
import ORF from "enrichment/nodes/ORF";
import NORFMakesProtein from "../nuggets/NORFMakesProtein";
import NProteinIsTF from "../nuggets/NProteinIsTF";
import Node from 'enrichment/nodes/Node'
import Nugget from "enrichment/nuggets/Nugget";
import TFBS from "enrichment/nodes/TFBS";
import NTFBindsToTFBS from "enrichment/nuggets/NTFBindsToTFBS";



let eroPrefix = 'http://BioEnrichment.github.io/enrichment-ontology/core#'
let eroBioPrefix = 'http://BioEnrichment.github.io/enrichment-ontology/bio#'

export default class KnowledgeBaseToERO {

    kb:KnowledgeBase
    uriPrefix:string
    graph:Graph

    constructor(kb:KnowledgeBase) {
        this.kb = kb
        this.graph = new Graph()
        this.uriPrefix = 'http://enrichment/'
    }

    async convert():Promise<string> {

        for(let node of this.kb.entries) {
            switch(node.getType()) {
                case 'DNASequence':
                    this.convertSequence(node as DNASequence)
                    break
                case 'ORF':
                    this.convertORF(node as ORF)
                    break
                case 'Protein':
                    this.convertProtein(node as Protein)
                    break
                case 'TFBS':
                    this.convertTFBS(node as TFBS)
                    break
            }
        }

        for(let nugget of this.kb.entries) {
            switch(nugget.getType()) {
                case 'ORFMakesProtein':
                    this.convertNORFMakesProtein(nugget as NORFMakesProtein)
                    break
                case 'ProteinIsTF':
                    this.convertNProteinIsTF(nugget as NProteinIsTF)
                    break
                case 'TFBindsToTFBS':
                    this.convertNTFBindsToTFBS(nugget as NTFBindsToTFBS)
                    break
            }
        }

        let defaultPrefixes:Array<[string,string]> = [
            [ 'rdf', Prefixes.rdf ],
            [ 'dcterms', Prefixes.dcterms ],
            [ 'prov', Prefixes.prov ],
            [ 'sbol', Prefixes.sbol2 ],
            [ 'owl', 'http://www.w3.org/2002/07/owl#' ],
            [ 'ebio', 'http://BioEnrichment.github.io/enrichment-ontology/bio#' ],
            [ 'enrichment', 'http://BioEnrichment.github.io/enrichment-ontology/core#' ],
        ]

        let ownershipPredicates:Array<string> = [
            'http://BioEnrichment.github.io/enrichment-ontology/bio#hasORF',
            'http://BioEnrichment.github.io/enrichment-ontology/bio#hasCDS',
            'http://BioEnrichment.github.io/enrichment-ontology/bio#hasTFBS',
            'http://BioEnrichment.github.io/enrichment-ontology/core#enrichedBy'
        ]

        return serialize(this.graph, new Map(defaultPrefixes), isOwnershipPredicate)

        function isOwnershipPredicate(triple) {
            return ownershipPredicates.indexOf(triple.predicate.toString()) !== -1
        }
    }

    convertSequence(sequence:DNASequence) {

        let uri = this.uriForNode(sequence)

        this.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(eroBioPrefix + 'DNASequence')
        })

        let sbolURI = sequence.getStringProperty('sbolURI')

        if(sbolURI) {
            this.graph.insertProperties(uri, {
                ['http://www.w3.org/2002/07/owl#sameAs']: node.createUriNode(sbolURI)
            })
        }

    }

    convertORF(orf:ORF) {

        let uri = this.uriForNode(orf)

        this.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(eroBioPrefix + 'ORF')
        })

        if(orf.startCodon !== null) {
            this.graph.insertProperties(uri, {
                [eroBioPrefix + 'startCodonStart']: node.createIntNode(orf.startCodon.start.to1BasedInteger()),
                [eroBioPrefix + 'startCodonEnd']: node.createIntNode(orf.startCodon.end.to1BasedInteger()),
                [eroBioPrefix + 'startCodonDirection']: node.createIntNode(orf.startCodon.forward ? 1 : -1)
            })
        }

        if(orf.stopCodon !== null) {
            this.graph.insertProperties(uri, {
                [eroBioPrefix + 'stopCodonStart']: node.createIntNode(orf.stopCodon.start.to1BasedInteger()),
                [eroBioPrefix + 'stopCodonEnd']: node.createIntNode(orf.stopCodon.end.to1BasedInteger()),
                [eroBioPrefix + 'stopCodonDirection']: node.createIntNode(orf.stopCodon.forward ? 1 : -1)
            })
        }

        for(let n = 0; n < orf.CDSes.length; ++ n) {

            let cds = orf.CDSes[n]

            let cdsUri = uri + '_cds' + (n + 1)

            this.graph.insertProperties(uri, {
                [eroBioPrefix + 'hasCDS']: node.createUriNode(cdsUri)
            })

            this.graph.insertProperties(cdsUri, {
                [Predicates.a]: node.createUriNode(eroBioPrefix + 'CDS'),
                [eroBioPrefix + 'cdsStart']: node.createIntNode(cds.start.to1BasedInteger()),
                [eroBioPrefix + 'cdsEnd']: node.createIntNode(cds.end.to1BasedInteger()),
                [eroBioPrefix + 'cdsDirection']: node.createIntNode(cds.forward ? 1 : -1)
            })
        }

        let seqURI = this.uriForNode(orf.sequence)

        this.graph.insertProperties(seqURI, {
            [eroBioPrefix + 'hasORF']: node.createUriNode(uri)
        })

    }

    convertProtein(protein:Protein) {

        let uri = this.uriForNode(protein)

        this.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(eroBioPrefix + 'Protein'),
            [eroBioPrefix + 'hasSequence']: node.createStringNode(protein.aa)
        })

        /*
        for(let name of protein.names) {
            this.graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }
        */
    }

    convertTFBS(tfbs:TFBS) {

        let uri = this.uriForNode(tfbs)

        this.graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(eroBioPrefix + 'TFBS'),
            [eroBioPrefix + 'hasTF']: node.createStringNode(tfbs.tf)
        })

        if(tfbs.location) {
            this.graph.insertProperties(uri, {
                [eroBioPrefix + 'tfbsStart']: node.createIntNode(tfbs.location.start.to1BasedInteger()),
                [eroBioPrefix + 'tfbsEnd']: node.createIntNode(tfbs.location.end.to1BasedInteger()),
                [eroBioPrefix + 'tfbsDirection']: node.createIntNode(tfbs.location.forward ? 1 : -1)
            })
        }

        let seqUri = this.uriForNode(tfbs.sequence)

        this.graph.insertProperties(seqUri, {
            [eroBioPrefix + 'hasTFBS']: node.createUriNode(uri)
        })

    }

    convertNORFMakesProtein(nugget:NORFMakesProtein) {

        let orfURI = this.uriForNode(nugget.orf)
        let proteinURI = this.uriForNode(nugget.protein)
        let nuggetURI = this.uriForNugget(nugget)

        this.graph.insertProperties(orfURI, {
            [eroBioPrefix + 'encodes']: node.createUriNode(proteinURI),
            [eroPrefix + 'enrichedBy']: node.createUriNode(nuggetURI)
        })

        this.graph.insertProperties(nuggetURI, {
            [Predicates.a]: node.createUriNode(eroPrefix + 'Nugget'),
            [eroPrefix + 'concernsPredicate']: node.createUriNode(eroBioPrefix + 'encodes'),
            [eroPrefix + 'concernsObject']: node.createUriNode(proteinURI),
            [Predicates.Dcterms.description]: node.createStringNode(nugget.getProvenance().join(';')),
        })

    }

    convertNProteinIsTF(nugget:NProteinIsTF) {

        let proteinURI = this.uriForNode(nugget.protein)
        let nuggetURI = this.uriForNugget(nugget)

        this.graph.insertProperties(proteinURI, {
            [eroBioPrefix + 'isTF']: node.createStringNode(nugget.tf),
            [eroPrefix + 'enrichedBy']: node.createUriNode(nuggetURI)
        })

        this.graph.insertProperties(nuggetURI, {
            [Predicates.a]: node.createUriNode(eroPrefix + 'Nugget'),
            [eroPrefix + 'concernsPredicate']: node.createUriNode(eroBioPrefix + 'isTF'),
            [eroPrefix + 'concernsObject']: node.createStringNode(nugget.tf),
            [Predicates.Dcterms.description]: node.createStringNode(nugget.getProvenance().join(';')),
        })


    }

    convertNTFBindsToTFBS(nugget:NTFBindsToTFBS) {

        let proteinURI = this.uriForNode(nugget.tf)
        let tfbsURI = this.uriForNode(nugget.tfbs)
        let nuggetURI = this.uriForNugget(nugget)

        this.graph.insertProperties(proteinURI, {
            [eroBioPrefix + 'bindsTo']: node.createUriNode(tfbsURI),
        })



    }

    uriForNode(node:Node) {
        return this.uriPrefix + node.tempID()
    }

    uriForNugget(nugget:Nugget) {
        return this.uriPrefix + nugget.tempID()
    }


}

