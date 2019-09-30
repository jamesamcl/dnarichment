
import SequenceOffset from "./SequenceOffset";

export default class SequenceRange {

    start:SequenceOffset
    end:SequenceOffset


    constructor(start:SequenceOffset, end:SequenceOffset) {

        if(start.forward !== end.forward) {
            throw new Error('strand mismatch')
        }

        this.start = start
        this.end = end

    }

    get forward():boolean {
        return this.start.forward
    }

    includesOffset(offset:SequenceOffset) {

        if(offset.forward !== this.forward) {
            return false
        }

        if(this.forward) {
            return offset.to0BasedInteger() >= this.start.to0BasedInteger() &&
                        offset.to0BasedInteger() <= this.end.to0BasedInteger()
        } else {
            return offset.to0BasedInteger() >= this.end.to0BasedInteger() &&
                        offset.to0BasedInteger() <= this.start.to0BasedInteger()
        }
    }

    overlapsRange(other:SequenceRange) {

        if(this.forward !== other.forward)
            return false

        return this.includesOffset(other.start) ||
                    this.includesOffset(other.end) ||
                    other.includesOffset(this.start) ||
                    other.includesOffset(this.end)
    }

    upstreammost(other:SequenceRange) {

        if(other.start.isSameAsOrUpstreamOf(this.start)) {
            return other
        }

        return this
    }

    downstreammost(other:SequenceRange) {

        if(other.end.isSameAsOrDownstreamOf(this.end)) {
            return other
        }

        return this
    }

    join(other:SequenceRange):SequenceRange {

        if(this.forward !== other.forward)
            throw new Error('different orientation')

        if(this.forward) {
            return new SequenceRange(
                SequenceOffset.from0BasedInteger(Math.min(this.start.to0BasedInteger(), other.start.to0BasedInteger()), true),
                SequenceOffset.from0BasedInteger(Math.max(this.end.to0BasedInteger(), other.end.to0BasedInteger()), true)
            )
        } else {
            return new SequenceRange(
                SequenceOffset.from0BasedInteger(Math.max(this.start.to0BasedInteger(), other.start.to0BasedInteger()), false),
                SequenceOffset.from0BasedInteger(Math.min(this.end.to0BasedInteger(), other.end.to0BasedInteger()), false)
            )
        }
    }

    isDownstreamOf(other:SequenceRange) {

        if(this.forward !== other.forward)
            return false

        if(this.forward)
            return this.start.to0BasedInteger() >= other.start.to0BasedInteger()
        else
            return this.start.to0BasedInteger() <= other.start.to0BasedInteger()
    }

    isUptreamOf(other:SequenceRange) {

        if(this.forward !== other.forward)
            return false

        if(this.forward)
            return this.start.to0BasedInteger() <= other.start.to0BasedInteger()
        else
            return this.start.to0BasedInteger() >= other.start.to0BasedInteger()
    }

    toString():string {

        if(this.forward)
            return this.start + '..' + this.end
        else
            return this.end + '..' + this.start

    }
}
