
export default class SequenceOffset {

    private n:number // 1-based
    private _forward:boolean

    private constructor(n:number, forward:boolean) {
        this.n = n
        this._forward = forward
    }

    static from0BasedInteger(n:number, forward:boolean) {
        return new SequenceOffset(n + 1, forward)
    }

    static from1BasedInteger(n:number, forward:boolean) {
        return new SequenceOffset(n, forward)
    }

    to0BasedInteger():number {
        return this.n - 1
    }

    to1BasedInteger():number {
        return this.n
    }

    downstream(d:number):SequenceOffset {
        if(this._forward)
            return new SequenceOffset(this.n + d, true)
        else
            return new SequenceOffset(this.n - d, false)
    }

    upstream(d:number):SequenceOffset {
        if(this._forward)
            return new SequenceOffset(this.n - d, true)
        else
            return new SequenceOffset(this.n + d, false)
    }

    upstreammost(other:SequenceOffset) {

        if(other.forward !== this.forward) {
            throw new Error('strand mismatch')
        }

        if(this._forward) {
            return SequenceOffset.from1BasedInteger(Math.min(this.n, other.n), true)
        } else {
            return SequenceOffset.from1BasedInteger(Math.max(this.n, other.n), false)
        }
    }

    downstreammost(other:SequenceOffset) {

        if(other.forward !== this.forward) {
            throw new Error('strand mismatch')
        }

        if(this._forward) {
            return SequenceOffset.from1BasedInteger(Math.max(this.n, other.n), true)
        } else {
            return SequenceOffset.from1BasedInteger(Math.min(this.n, other.n), false)
        }

    }

    get forward() {
        return this._forward
    }

    toString() {
        return this.n.toString()
    }

    isSameAsOrUpstreamOf(other:SequenceOffset) {

        if(this.forward !== other.forward)
            return false

        if(this.forward) {
            return this.n <= other.n
        } else {
            return this.n >= other.n
        }
    }

    isSameAsOrDownstreamOf(other:SequenceOffset) {

        if(this.forward !== other.forward)
            return false

        if(this.forward) {
            return this.n >= other.n
        } else {
            return this.n <= other.n
        }
    }

}
