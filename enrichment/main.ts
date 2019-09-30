

import express = require('express')
import bodyParser = require('body-parser')
import { SBOLXGraph } from 'sbolgraph'
import AutoEnrichmentContext from './AutoEnrichmentContext'

import fs = require('mz/fs')
import printNuggetsToStdout from './printNuggetsToStdout';
import KnowledgeBase from './KnowledgeBase';
import IntegrationPipeline from './step/Pipeline';
import IGFindORFs from 'enrichment/step/integration/IGFindORFs';
import IGCreateProteinsForORFs from './step/integration/IGCreateProteinsForORFs';
import IGLookupProteinsByCompleteSequence from './step/integration/IGLookupProteinsByCompleteSequence';
import IGFindDegradationTags from 'enrichment/step/integration/IGFindDegradationTags';
import IGGuessPromotersFromORFs from './step/integration/IGGuessPromotersFromORFs';
import IGSearchPfam from './step/integration/IGSearchPfam';
import IGSearchHAMAP from './step/integration/IGSearchHAMAP';
import IGFindTFBSsBlast from './step/integration/IGFindTFBSsBlast';
import IGFindTFBSsPWM from './step/integration/IGFindTFBSsPWM';
import IGCreateTFsFromPfamHits from './step/integration/IGCreateTFsFromPfamHits';
import IGLinkTFsToTFBSs from './step/integration/IGLinkTFsToTFBSs';
import IGPromoterHunter from './step/integration/IGPromoterHunter';
import IGTransTerm from './step/integration/IGTransTerm';
import RLongestORF from './step/rule/RLongestORF';
import RCompleteTUsOnly from './step/rule/RCompleteTUsOnly';
import RForwardOnly from './step/rule/RForwardOnly'
import RReverseOnly from './step/rule/RReverseOnly'
import RMergeAdjacentTerminators from './step/rule/RMergeAdjacentTerminators'
import KnowledgeBaseToSBOL from './sbol/KnowledgeBaseToSBOL';

let steps = {
    IGFindORFs,
    IGCreateProteinsForORFs,
    IGLookupProteinsByCompleteSequence,
    IGFindDegradationTags,
    IGGuessPromotersFromORFs,
    IGSearchPfam,
    IGSearchHAMAP,
    IGFindTFBSsBlast,
    IGFindTFBSsPWM,
    IGCreateTFsFromPfamHits,
    IGLinkTFsToTFBSs,
    IGTransTerm,
    IGPromoterHunter,
    RLongestORF,
    RCompleteTUsOnly,
    RForwardOnly,
    RReverseOnly,
    RMergeAdjacentTerminators
}

import yargs = require('yargs')
import KnowledgeBaseToERO from 'enrichment/sbol/KnowledgeBaseToERO';

let argv = yargs
.option('taxid', {
    alias: 't',
    description: 'Taxon ID',
    demandOption: false
})
.option('in', {
    alias: 'i',
    description: 'Input filename FASTA/GenBank/SBOL',
    demandOption: true
})
.option('out', {
    alias: 'o',
    description: 'Output filename',
    demandOption: true
})
.option('outfmt', {
    alias: 'f',
    description: 'Output format',
    demandOption: true,
    choices: [ 'enrichment-rdfxml', 'sbol2', 'sbolx' ],
    default: 'enrichment-rdfxml'
})
.option('enable', {
    alias: 'e',
    description: 'Enable a step',
    choices: Object.keys(steps)
})
.argv

console.log(JSON.stringify(argv))




main()

async function main() {

    let graph = await SBOLXGraph.loadString(fs.readFileSync(argv.in).toString(), 'application/rdf+xml')

    let context:AutoEnrichmentContext = new AutoEnrichmentContext()

    let taxID = 2

    if(argv.taxid) {
        taxID = parseInt(argv.taxid)
        console.log('Using taxID ' + taxID + ' from command line')
    } else {
        context.log('warning', 'No taxID specified; defaulting to generic bacteria')
        context.log('warning', 'You REALLY SHOULD specify an organism taxID from the NCBI taxonomy tree using -t')
    }

    let kb:KnowledgeBase = new KnowledgeBase(context, taxID)
    kb.importSBOL(graph)

    let ip:IntegrationPipeline = new IntegrationPipeline()


    // BLAST DNA against sections to find provenance
    // apache NLP

    let enable = argv.enable ?
        (Array.isArray(argv.enable) ? argv.enable : [ argv.enable ]) : []

    let enabledIntegrations = enable.map((k) => steps[k])

    for(let integration of enabledIntegrations) {
        ip.addStep(new integration(context, kb))
    }

    await ip.runOnce()



    if(argv.outfmt === 'sbolx') {

        console.log('sbol time')

        let sbol:KnowledgeBaseToSBOL = new KnowledgeBaseToSBOL(kb)

        sbol.blah()

        let xml = await sbol.graph.serializeXML()

        await fs.writeFile(argv.out, xml)

    } else if(argv.outfmt === 'enrichment-rdfxml') {

        let ero:KnowledgeBaseToERO = new KnowledgeBaseToERO(kb)

        let xml = await ero.convert()

        await fs.writeFile(argv.out, xml)

    }


}

