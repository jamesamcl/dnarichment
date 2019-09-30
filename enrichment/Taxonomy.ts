
const taxIds = require(process.cwd() + '/taxonomy.json')

export default class Taxonomy {

    static isChildOf(taxId:number, parent:number):boolean {

        var iter = 0

        for(;;) {

            if(++ iter > 50)
                throw new Error('too much recursion looking up tax ID')

            if(taxId === parent)
                return true

            let next:number|undefined = Taxonomy.getParent(taxId)

            if(next === undefined)
                return false

            if(next === taxId)
                return taxId === parent

            taxId = next
        }


    }

    static getParent(taxId:number):number|undefined {

        return taxIds[taxId]

    }

    static getParents(taxId:number):Array<number> {

        var parents:Array<number> = []

        var iter = 0

        for(;;) {

            if(++ iter > 50)
                throw new Error('too much recursion looking up tax ID')

            let next:number|undefined = Taxonomy.getParent(taxId)

            if(next === undefined)
                return parents

            if(next === taxId)
                return parents

            taxId = next

            parents.push(next)
        }
    }



}

