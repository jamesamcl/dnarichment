

import { SXComponent, SXSequence, node, triple } from "sbolgraph";

import Taxonomy from './Taxonomy'
import Nugget from 'enrichment/nuggets/Nugget';

import crypto = require('crypto')
import colors = require('colors')

export class LogItem {

    constructor(level:string, message:string) {
        this.level = level
        this.message = message
    }

    level:string
    message:string

}

export default class AutoEnrichmentContext {

    uid:string

    logItems:Array<LogItem>

    constructor() {

        this.uid = 'results/' + crypto.randomBytes(16).toString("hex")
        this.logItems = []
        
    }

    log(level:string, message:string) {

        if(level === 'warning') {
            console.warn(colors.yellow(level + ': ' + message))
        } else if(level === 'error') {
            console.error(colors.red(level + ': ' + message))
        } else {
            console.log(level + ': ' + message)
        }


        this.logItems.push(new LogItem(level, message))

    }




}
