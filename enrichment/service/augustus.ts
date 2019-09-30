
/**
 *# AUGUSTUS is a gene prediction tool written by M. Stanke (mario.stanke@uni-greifswald.de),         
# O. Keller, S. König, L. Gerischer and L. Romoth.                                                              
# Please cite: Mario Stanke, Mark Diekhans, Robert Baertsch, David Haussler (2008),                                       
# Using native and syntenically mapped cDNA alignments to improve de novo gene finding                                    
# Bioinformatics 24: 637-644, doi 10.1093/bioinformatics/btn013       
**/


import Taxonomy from '../Taxonomy'

import LogInterface from '../LogInterface'

import ORF from '../nodes/ORF'

import request = require('request-promise')
import SequenceRange from "../SequenceRange";
import SequenceOffset from '../SequenceOffset';
import DNASequence from 'enrichment/nodes/DNASequence';
import KnowledgeBase from 'enrichment/KnowledgeBase';


export default async function augustus(kb:KnowledgeBase, log:LogInterface, taxID:number, seq:DNASequence):Promise<{ ORFs:Array<ORF>, usedStrategy:string }> {

    const id:string|undefined = taxIDToAugustusIdentifier(taxID)

    if(id === undefined) {
        log.log('warning', 'Cannot map taxID to augustus identifier; unable to search for ORFs')
        return { ORFs: new Array<ORF>(), usedStrategy: 'tried to use augustus but couldn\'t' }
    }

    let body = await request({
        method: 'post',
        url: 'http://localhost:6662',
        qs: {
            species: id
        },
        body: seq.na
    })

    let ORFs:Array<any> = JSON.parse(body)
        
    return {
        ORFs: ORFs.map((augOrf:any) => {

            let startCodonForward = augOrf.startCodon.forward 
            let startCodonStart = SequenceOffset.from1BasedInteger(augOrf.startCodon.start, startCodonForward)
            let startCodonEnd = SequenceOffset.from1BasedInteger(augOrf.startCodon.end, startCodonForward)

            let startCodon = new SequenceRange(startCodonStart, startCodonEnd)


            let stopCodonForward = augOrf.stopCodon.forward 
            let stopCodonStart = SequenceOffset.from1BasedInteger(augOrf.stopCodon.start, stopCodonForward)
            let stopCodonEnd = SequenceOffset.from1BasedInteger(augOrf.stopCodon.end, stopCodonForward)

            let stopCodon = new SequenceRange(stopCodonStart, stopCodonEnd)


            var orf: ORF = new ORF(kb, seq, startCodon, stopCodon)

            augOrf.CDSes.forEach((cds) => {

                let forward = cds.forward 
                let start = SequenceOffset.from1BasedInteger(cds.start, forward)
                let end = SequenceOffset.from1BasedInteger(cds.end, forward)

                orf.CDSes.push(new SequenceRange(start, end))
            })

            augOrf.introns.forEach((intron) => {

                let forward = intron.forward 
                let start = SequenceOffset.from1BasedInteger(intron.start, forward)
                let end = SequenceOffset.from1BasedInteger(intron.end, forward)

                orf.introns.push(new SequenceRange(start, end))
            })

            augOrf.exons.forEach((exon) => {

                let forward = exon.forward 
                let start = SequenceOffset.from1BasedInteger(exon.start, forward)
                let end = SequenceOffset.from1BasedInteger(exon.end, forward)

                orf.exons.push(new SequenceRange(start, end))
            })

            return orf
        }),

        usedStrategy: 'Augustus ' + id
    }

}





function taxIDToAugustusIdentifier(taxID:number):string|undefined {

    const parents:Array<number> = Taxonomy.getParents(taxID)

    if(parents.indexOf(9606) !== -1)
        return 'human'

    if(parents.indexOf(7215) !== -1)
        return 'fly'

    if(parents.indexOf(3701) !== -1)
        return 'arabidopsis'

    if(parents.indexOf(6279) !== -1)
        return 'brugia'

    if(parents.indexOf(7159) !== -1)
        return 'aedes'

    if(parents.indexOf(7070) !== -1)
        return 'tribolium'

    if(parents.indexOf(6183) !== -1)
        return 'schistosoma'

    if(parents.indexOf(5911) !== -1)
        return 'tetrahymena'

    if(parents.indexOf(130081) !== -1)
        return 'galdieria'

    if(parents.indexOf(4577) !== -1)
        return 'maize'

    if(parents.indexOf(5811) !== -1)
        return 'toxoplasma'

    if(parents.indexOf(6239) !== -1)
        return 'caenorhabditis'

    if(parents.indexOf(746128) !== -1)
        return 'aspergillus_fumigatus'

    if(parents.indexOf(162425) !== -1)
        return 'aspergillus_nidulans'

    if(parents.indexOf(5062) !== -1)
        return 'aspergillus_oryzae'

    if(parents.indexOf(33178) !== -1)
        return 'aspergillus_terreus'

    if(parents.indexOf(40559) !== -1)
        return 'botrytis_cinerea'

    if(parents.indexOf(5476) !== -1)
        return 'candida_albicans'

    if(parents.indexOf(4929) !== -1)
        return 'candida_guilliermondii'

    if(parents.indexOf(5482) !== -1)
        return 'candida_tropicalis'

    if(parents.indexOf(38033) !== -1)
        return 'chaetomium_globosum'

    if(parents.indexOf(5501) !== -1)
        return 'coccidioides_immitis'

    if(parents.indexOf(5346) !== -1)
        return 'coprinus_cinereus'

    if(parents.indexOf(37769) !== -1)
        return 'cryptococcus_neoformans_gattii'


// cryptococcus_neoformans_neoformans_B     | Cryptococcus neoformans neoformans

    if(parents.indexOf(214684) !== -1)
        return 'cryptococcus_neoformans_neoformans_JEC21'

    if(parents.indexOf(4959) !== -1)
        return 'debaryomyces_hansenii'

    if(parents.indexOf(6035) !== -1)
        return 'encephalitozoon_cuniculi_GB'

    if(parents.indexOf(33169) !== -1)
        return 'eremothecium_gossypii'

    if(parents.indexOf(5518) !== -1)
        return 'fusarium_graminearum'

    if(parents.indexOf(5037) !== -1)
        return 'histoplasma_capsulatum'

    if(parents.indexOf(28985) !== -1)
        return 'kluyveromyces_lactis'

    if(parents.indexOf(29883) !== -1)
        return 'laccaria_bicolor'

    if(parents.indexOf(36914) !== -1)
        return 'lodderomyces_elongisporus'

    if(parents.indexOf(148305) !== -1)
        return 'magnaporthe_grisea'

    if(parents.indexOf(5141) !== -1)
        return 'neurospora_crassa'

    if(parents.indexOf(5306) !== -1)
        return 'phanerochaete_chrysosporium'

    if(parents.indexOf(4924) !== -1)
        return 'pichia_stipitis'

    if(parents.indexOf(64495) !== -1)
        return 'rhizopus_oryzae'

    if(parents.indexOf(559292) !== -1)
        return 'saccharomyces_cerevisiae_S288C'

    if(parents.indexOf(285006) !== -1)
        return 'saccharomyces_cerevisiae_rm11'

    if(parents.indexOf(4932) !== -1)
        return 'saccharomyces'

    if(parents.indexOf(4896) !== -1)
        return 'schizosaccharomyces_pombe'

    if(parents.indexOf(5270) !== -1)
        return 'ustilago_maydis'

    if(parents.indexOf(4952) !== -1)
        return 'yarrowia_lipolytica'

    if(parents.indexOf(7424) !== -1)
        return 'nasonia'

    if(parents.indexOf(4081) !== -1)
        return 'tomato'

    if(parents.indexOf(3052) !== -1)
        return 'chlamydomonas'

    if(parents.indexOf(400682) !== -1)
        return 'amphimedon'

    if(parents.indexOf(7029) !== -1)
        return 'pea_aphid'

    return undefined
}