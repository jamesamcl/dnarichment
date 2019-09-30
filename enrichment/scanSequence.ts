import SequenceOffset from "./SequenceOffset";


export interface Match {
    offset:SequenceOffset
    score:number
}

export default function scanSequence(seq:string, startOffset:SequenceOffset, endOffset:SequenceOffset, motif:string, expectedOffset:SequenceOffset, distancePenalty:number):Array<Match> {

    let motifElements:Array<MotifElement> = parseMotif(motif)

    let forward:boolean = endOffset.to0BasedInteger() > startOffset.to0BasedInteger()


    let offset:number = startOffset.to0BasedInteger()

    let matches:Array<Match> = []

    while(offset >= 0 && offset < seq.length) {

        let subseq:string = seq.substr(offset, motifElements.length)

        let score:number = match(subseq, motifElements)

        let distance = Math.abs(offset - expectedOffset.to0BasedInteger())
        let penalty = distance * distancePenalty
        let effectiveScore = score  - penalty

        if(score > 0) {
            matches.push({ offset: SequenceOffset.from0BasedInteger(offset, forward), score: effectiveScore })
        }

        if(forward) {

            ++ offset

            if(offset > endOffset.to0BasedInteger())
                break

        } else {

            -- offset

            if(offset < endOffset.to0BasedInteger())
                break
        }
    }

    matches.sort((a, b) => b.score - a.score)

    let results:Array<Match> = [ matches[0] ]

    let bestScore = matches[0].score

    for(let i:number = 1; i < matches.length; ++ i) {

        if(matches[i].score === bestScore) {
            results.push(matches[i])
        } else {
            break
        }
    }

    return results

}


function parseMotif(motif:string):Array<MotifElement> {

    return motif.split(' ').map((token:string) => {
        return { letter: token.substr(0, 1), importance: parseInt(token.slice(1)) }
    })
}

function match(subseq:string, motif:Array<MotifElement>):number {

    let score:number = 0

    for(let i:number = 0; i < motif.length; ++ i) {
        if(subseq[i] === motif[i].letter) {
            score += motif[i].importance
        }
    }

    return score

}

interface MotifElement {
    letter:string
    importance:number
}
