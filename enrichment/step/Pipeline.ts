
import Step from './Step'

export default class Pipeline {

    steps:Array<Step>

    constructor() {
        this.steps = []
    }

    addStep(step:Step) {
        this.steps.push(step)
    }

    async runOnce():Promise<void> {

        for(let step of this.steps) {
            await step.init()
        }

        for(let step of this.steps) {
            await step.perform()
        }

    }

    


}