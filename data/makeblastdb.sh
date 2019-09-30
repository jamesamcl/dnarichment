#!/usr/bin/env bash

#makeblastdb [-h] [-help] [-in input_file] [-input_type type]
#-dbtype molecule_type [-title database_title] [-parse_seqids]
#[-hash_index] [-mask_data mask_data_files] [-mask_id mask_algo_ids]
#[-mask_desc mask_algo_descriptions] [-gi_mask]
#[-gi_mask_name gi_based_mask_names] [-out database_name]
#[-max_file_sz number_of_bytes] [-logfile File_Name] [-taxid TaxID]
#[-taxid_map TaxIDMapFile] [-version]
#

cat prodoric.fasta igem.fasta | makeblastdb -in - -dbtype nucl -title tfbs -out tfbs


