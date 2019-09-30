import Protein from "enrichment/nodes/Protein";

export default interface HMMHit {
    targetName: string
    accession: string
    tlen: number
    queryName: string
    accession2: string
    qlen: number
    fullSequenceEvalue: number
    fullSequenceScore: number
    fullSequenceBias: number
    domainNum: number
    domainNumOutOf: number
    domainCEvalue: number
    domainIEvalue: number
    domainScore: number
    domainBias: number
    hmmFrom: number
    hmmTo: number
    aliFrom: number
    aliTo: number
    envFrom: number
    envTo: number
    accuracy: number
    description: string

}