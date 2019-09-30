
import ve_calculatePercentGC = require('ve-sequence-utils/src/calculatePercentGC')
import ve_calculateTm = require('ve-sequence-utils/src/calculateTm')
import ve_getAminoAcidStringFromSequenceString = require('ve-sequence-utils/src/getAminoAcidStringFromSequenceString')
import ve_getORFsFromSequence = require('ve-sequence-utils/src/getOrfsFromSequence')
import ve_getReverseComplementSequenceString = require('ve-sequence-utils/src/getReverseComplementSequenceString')

export enum TmTable {
    Breslauer = 'breslauer',
    Sugimoto = 'sugimoto',
    Unified = 'unified'
}

export interface ORF {

    start:number
    end:number
    length:number
    internalStartCodonIndices:Array<any>
    frame:number
    forward:boolean
    isOrf:boolean
    id:string

}

export default class SeqUtils {

    // % GC of a sequence string
    //
    static calculatePercentGC(bps:string):number {
        return ve_calculatePercentGC(bps)
    }


	/**
	 * Calculates temperature for DNA sequence using a given algorithm.
	 * @param  {string} sequence The DNA sequence to use.
	 * @param  {string} type Either Teselagen.bio.tools.TemperatureCalculator.TABLE_BRESLAUER, TABLE_SUGIMOTO, or TABLE_UNIFIED
	 * @param  {number} A Helix initation for deltaS. Defaults to -10.8.
	 * @param  {number} R The gas constant, in cal/(K*mol). Defaults to 0.5e-6M.
	 * @param  {number} Na THe monovalent salt concentration. Defaults to 50e-3M.
	 * @return {number} Temperature for the given sequence, in Celsius.
	 */
    static calculateTm(sequence:string, type:TmTable, A:number|null, R:number|null, C:number|null, Na:number|null):number {
        return ve_calculatePercentGC(sequence, type, A, R, C, Na)
    }




    static dnaToAA(sequence:string):string {

        return ve_getAminoAcidStringFromSequenceString(sequence)

    }

    static reverseDNA(sequence:string):string {
        return ve_getReverseComplementSequenceString(sequence)
    }

    /**
     * Finds ORFs in a given DNA forward in a given frame.
     * @param  {String}sequence The dna sequence.
     * @param  {Int} minimumOrfSize The minimum length of ORF to return.
     * @param  {boolean} forward Should we find forward facing orfs or reverse facing orfs
     * @return {Teselagen.bio.orf.ORF[]} The list of ORFs found.
     */
    static getORFsFromSequence(sequence:string, minimumOrfSize:number, forward:boolean, circular:boolean):Array<ORF> {

        return ve_getORFsFromSequence({
            sequence: sequence.toUpperCase(),
            minimumOrfSize: minimumOrfSize,
            forward: forward,
            circular: circular
        })





    }

}

