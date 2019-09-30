
import Nugget from "./nuggets/Nugget";

import colors = require('colors/safe')

export default function printNuggetsToStdout(nuggets:Array<Nugget>) {

    for(let nugget of nuggets) {
        nugget.dump(process.stdout)
    }

}