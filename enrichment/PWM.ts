
export default class PWM {

    id:string
    a:Array<number>
    t:Array<number>
    c:Array<number>
    g:Array<number>

    get length() {
        return this.a.length
    }
}
