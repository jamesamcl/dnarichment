
import { SBOLXGraph, SXComponent, SXIdentified, SXSequence, SXSubComponent, SXInteraction } from 'sbolgraph'
import KnowledgeBase from '../KnowledgeBase';
import Protein from 'enrichment/nodes/Protein';
import Node from 'enrichment/nodes/Node'
import NORFMakesProtein from '../nuggets/NORFMakesProtein';
import ORF from 'enrichment/nodes/ORF';
import TFBS from 'enrichment/nodes/TFBS';
import { Specifiers, Prefixes } from 'bioterms';
import DNASequence from 'enrichment/nodes/DNASequence';
import NTFBindsToTFBS from 'enrichment/nuggets/NTFBindsToTFBS';
import NSequenceHasPossiblePromoter from 'enrichment/nuggets/NSequenceHasPossiblePromoter';
import Promoter from 'enrichment/nodes/Promoter';
import Terminator from 'enrichment/nodes/Terminator';

export default class KnowledgeBaseToSBOL {

    kb:KnowledgeBase
    graph:SBOLXGraph
    uriPrefix:string


    cacheNodeToSBOL:Map<Node, SXIdentified>


    container:SXComponent


    constructor(kb:KnowledgeBase) {
        this.kb = kb
        this.graph = new SBOLXGraph()
        this.uriPrefix = 'http://enrichment/'
        this.cacheNodeToSBOL = new Map()
    }

    blah() {

        this.container = this.graph.createComponent(this.uriPrefix, 'enrichmentResults', '1')

        for(let _node of this.kb.entries) {
            if(_node instanceof Node) {
                this.nodeToSBOL(_node)
            }
        }

        for(let _nugget of this.kb.entries) {

            if(_nugget instanceof NORFMakesProtein) {

                let nugget:NORFMakesProtein = _nugget as NORFMakesProtein

                let orf:SXIdentified = this.nodeToSBOL(nugget.orf)
                let protein:SXIdentified = this.nodeToSBOL(nugget.protein)

                let interaction:SXInteraction = this.container.createInteraction(
                    nugget.orf.tempID() + '_encodes_' + nugget.protein.tempID(), '1')

                interaction.type = 'http://identifiers.org/biomodels.sbo/SBO:0000589'

                interaction.createParticipationWithParticipantAndRole('orf', orf as SXSubComponent, 'http://identifiers.org/biomodels.sbo/SBO:0000645', '1')
                interaction.createParticipationWithParticipantAndRole('protein', protein as SXSubComponent, 'http://identifiers.org/biomodels.sbo/SBO:0000011', '1')

                continue
            }

            if(_nugget instanceof NTFBindsToTFBS) {

                let nugget:NTFBindsToTFBS = _nugget as NTFBindsToTFBS

                let tf:SXIdentified = this.nodeToSBOL(nugget.tf)
                let tfbs:SXIdentified = this.nodeToSBOL(nugget.tfbs)

                let interaction:SXInteraction = this.container.createInteraction(
                    nugget.tf.tempID() + '_bindsto_' + nugget.tfbs.tempID(), '1')

                interaction.type = 'http://identifiers.org/biomodels.sbo/SBO:0000168'

                interaction.createParticipationWithParticipantAndRole('tf', tf as SXSubComponent, 'http://identifiers.org/biomodels.sbo/SBO:0000019', '1')
                interaction.createParticipationWithParticipantAndRole('tfbs', tfbs as SXSubComponent, 'http://identifiers.org/biomodels.sbo/SBO:0000644', '1')

                continue
            }

            if(_nugget instanceof NSequenceHasPossiblePromoter) {

                let nugget:NSequenceHasPossiblePromoter = _nugget as NSequenceHasPossiblePromoter

                let promoter:SXIdentified = this.nodeToSBOL(nugget.promoter)

            }

        }
    }

    nodeToSBOL(_node:Node):SXIdentified {

        if (_node instanceof Protein) {
            return this.proteinNodeToSBOL(_node as Protein)
        }

        if (_node instanceof ORF) {
            return this.orfNodeToSBOL(_node as ORF)
        }

        if (_node instanceof DNASequence) {
            return this.sequenceNodeToSBOL(_node as DNASequence)
        }

        if (_node instanceof TFBS) {
            return this.tfbsNodeToSBOL(_node as TFBS)
        }

        if (_node instanceof Promoter) {
            return this.promoterNodeToSBOL(_node as Promoter)
        }

        if (_node instanceof Terminator) {
            return this.terminatorNodeToSBOL(_node as Terminator)
        }

        return new SXIdentified(this.graph, '')
    }

    proteinNodeToSBOL(node:Protein):SXSubComponent {

        let cached = this.cacheNodeToSBOL.get(node)

        if(cached)
            return cached as SXSubComponent

        let sbolProtein:SXComponent = this.graph.createComponent(this.uriPrefix, node.tempID(), '1')
        sbolProtein.addType(Specifiers.SBOL2.Type.Protein)

        let bestName = node.getBestName()

        if(bestName)
            sbolProtein.name = bestName

        let n = 0
        for(let desc of node.getDescriptions()) {
            if(n ++ === 0) {
                sbolProtein.description = desc
            }
        }

        let sequence:SXSequence = sbolProtein.createSequence()
        sequence.encoding = Specifiers.SBOL2.SequenceEncoding.AminoAcid
        sequence.elements = node.aa

        let fc:SXSubComponent = this.container.createSubComponent(sbolProtein)

        this.cacheNodeToSBOL.set(node, fc)

        return fc

    }

    orfNodeToSBOL(node:ORF):SXSubComponent {

        let cached = this.cacheNodeToSBOL.get(node)

        if(cached)
            return cached as SXSubComponent

        let seq = this.sequenceNodeToSBOL(node.sequence)

        let sbolORF:SXComponent = this.graph.createComponent(this.uriPrefix, node.tempID(), '1')
        sbolORF.addType(Specifiers.SBOL2.Type.DNA)
        sbolORF.addRole(Specifiers.SO.CDS)

        let sequence:SXSequence = sbolORF.createSequence()
        sequence.encoding = Specifiers.SBOL2.SequenceEncoding.NucleicAcid
        sequence.elements = node.getCodingDNA()


        let bestName = node.getBestName()

        if(bestName) {
            sbolORF.name = bestName
            sequence.name = bestName + ' sequence'
        }

        sbolORF.addSequence(sequence)

        let fc:SXSubComponent = this.container.createSubComponent(sbolORF)

        for(let cds of node.CDSes) {

            let range = fc.addRange(cds.start.to1BasedInteger(), cds.end.to1BasedInteger())

            range.orientation = cds.forward ?
                Specifiers.SBOLX.Orientation.Inline : Specifiers.SBOLX.Orientation.ReverseComplement

        }

        this.cacheNodeToSBOL.set(node, fc)

        return fc

    }

    tfbsNodeToSBOL(node:TFBS):SXSubComponent {

        let cached = this.cacheNodeToSBOL.get(node)

        if(cached)
            return cached as SXSubComponent

        let seq = this.sequenceNodeToSBOL(node.sequence)

        let sbolTFBS:SXComponent = this.graph.createComponent(this.uriPrefix, node.tempID(), '1')
        sbolTFBS.addType(Specifiers.SBOL2.Type.DNA)
        sbolTFBS.addRole(Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000057')



        let bestName = node.getBestName()

        if(bestName)
            sbolTFBS.name = bestName


        let sequence:SXSequence = sbolTFBS.createSequence()
        sequence.encoding = Specifiers.SBOL2.SequenceEncoding.NucleicAcid

        if(node.location)
            sequence.elements = node.sequence.read(node.location)

        sbolTFBS.addSequence(sequence)

        let fc:SXSubComponent = this.container.createSubComponent(sbolTFBS)

        if(node.location) {

            let range = fc.addRange(node.location.start.to1BasedInteger(), node.location.end.to1BasedInteger())

            range.orientation = node.location.forward ?
                Specifiers.SBOLX.Orientation.Inline : Specifiers.SBOLX.Orientation.ReverseComplement

        }

        this.cacheNodeToSBOL.set(node, fc)

        return fc

    }

    sequenceNodeToSBOL(node:DNASequence):SXSequence {

        let cached = this.cacheNodeToSBOL.get(node)

        if(cached)
            return cached as SXSequence

        let sbolSeq:SXSequence = this.graph.createSequence(this.uriPrefix, node.tempID(), '1')
        sbolSeq.encoding = Specifiers.SBOLX.SequenceEncoding.NucleicAcid
        sbolSeq.elements = node.na

        this.container.addSequence(sbolSeq)

        this.cacheNodeToSBOL.set(node, sbolSeq)

        return sbolSeq

    }

    promoterNodeToSBOL(node:Promoter):SXSubComponent {

        let cached = this.cacheNodeToSBOL.get(node)

        if(cached)
            return cached as SXSubComponent

        let seq = this.sequenceNodeToSBOL(node.sequence)

        let sbolProm:SXComponent = this.graph.createComponent(this.uriPrefix, node.tempID(), '1')
        sbolProm.addType(Specifiers.SBOL2.Type.DNA)
        sbolProm.addRole(Specifiers.SO.Promoter)

        let bestName = node.getBestName()

        if(bestName)
            sbolProm.name = bestName

        //sbolProm.createFeatureWithRange(0, node.minus35.getLength(), '-35').addRole(Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000175')

        let range = node.minus35.join(node.minus10).join(node.tss)

        let sequence:SXSequence = sbolProm.createSequence()
        sequence.encoding = Specifiers.SBOL2.SequenceEncoding.NucleicAcid
        sequence.elements = node.sequence.read(range)
        sequence.name = node.tempID()

        sbolProm.addSequence(sequence)

        let fc:SXSubComponent = this.container.createSubComponent(sbolProm)

        let sbolRange = fc.addRange(range.start.to1BasedInteger(), range.end.to1BasedInteger())

        sbolRange.orientation = range.forward ?
            Specifiers.SBOLX.Orientation.Inline : Specifiers.SBOLX.Orientation.ReverseComplement

        this.cacheNodeToSBOL.set(node, fc)

        return fc

    }

    terminatorNodeToSBOL(node:Terminator):SXSubComponent {

        let cached = this.cacheNodeToSBOL.get(node)

        if(cached)
            return cached as SXSubComponent

        let seq = this.sequenceNodeToSBOL(node.sequence)

        let sbolTerm:SXComponent = this.graph.createComponent(this.uriPrefix, node.tempID(), '1')
        sbolTerm.addType(Specifiers.SBOL2.Type.DNA)
        sbolTerm.addRole(Specifiers.SO.Terminator)

        //sbolProm.createFeatureWithRange(0, node.minus35.getLength(), '-35').addRole(Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000175')

        let range = node.range

        let sequence:SXSequence = sbolTerm.createSequence()
        sequence.encoding = Specifiers.SBOL2.SequenceEncoding.NucleicAcid
        sequence.elements = node.sequence.read(range)
        sequence.name = node.tempID()

        sbolTerm.addSequence(sequence)

        let fc:SXSubComponent = this.container.createSubComponent(sbolTerm)

        let sbolRange = fc.addRange(range.start.to1BasedInteger(), range.end.to1BasedInteger())

        sbolRange.orientation = range.forward ?
            Specifiers.SBOLX.Orientation.Inline : Specifiers.SBOLX.Orientation.ReverseComplement

        this.cacheNodeToSBOL.set(node, fc)

        return fc

    }







}