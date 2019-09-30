
If you have biological parts represented in SBOL and you want to know more about them, you're in the right place.

Depends: fmaseq service
Will depend on later: enrichment itself

sbol-enrichment "boils down" the rich information from enrichment/sybiont into concise indications that can be attached to an SBOL design.

    apt install hmmer ncbi-blast+

Also need:

* `Pfam-A.hmm.gz` from [Pfam](ftp://ftp.ebi.ac.uk/pub/databases/Pfam/current_release), pressed with hmmpress.
* A blast db of TFBSs (run `./makeblastdb.sh` in the `data` directory)





