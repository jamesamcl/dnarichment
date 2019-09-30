import KnowledgeBase from "./KnowledgeBase";

export default abstract class KBEntry {

    kb:KnowledgeBase
    private _derivedFromThis:Set<KBEntry>
    private _properties:Map<string, any>
    private _tempID:string

    constructor(kb:KnowledgeBase, id?:string) {
        this.kb = kb
        this._properties = new Map()
        this._derivedFromThis = new Set()
        this._tempID = kb.makeID(id || this.getType().toLowerCase())
    }

    abstract getType():string

    tempID():string {
        return this._tempID
    }

    setStringProperty(key:string, value:string) {
        this._properties.set(key, value)
    }

    getStringProperty(key:string):string {
        return this._properties.get(key)
    }

    addDerived(other:KBEntry) {
        this._derivedFromThis.add(other)
    }

    getDerived():KBEntry[] {
        return Array.from(this._derivedFromThis)
    }

}