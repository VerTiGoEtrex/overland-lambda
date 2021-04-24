from .dlsToObjs import loadAllFiles
from pathlib import Path
import pandas as pd
import logging
import os
import pyarrow as pa
from tqdm import tqdm

# logging.setLevel(logging.DEBUG)
logging.basicConfig(level=logging.INFO)


def main():
    logging.info("loading all files")
    entries = loadAllFiles(Path('./dl'))
    logging.info(f"got {len(entries)} entries")
    logging.info(entries[0])
    logging.info("df from records")
    df = pd.DataFrame.from_records(entries)
    logging.info("ts to datetime")
    df['ts'] = pd.to_datetime(df['ts'])
    logging.info("sort")
    df.sort_values('ts', ignore_index=True, inplace=True)
    logging.info("ts to epoch")
    df["ts"] = df["ts"].astype('int64')//1e9
    print(df)
    print(df.dtypes)
    print(df.describe())

    logging.info("df to arrow table")
    filename = "out.arrow"
    table = pa.Table.from_pandas(df)
    schema = table.schema

    logging.info("table to batches")
    batches = table.to_batches(100000)
    del table
    print(schema)

    logging.info("batches to file")
    assert not os.path.isfile(filename), f"{filename} already exists"
    with pa.ipc.new_file(filename, schema) as writer:
        for batch in tqdm(batches):
            writer.write_batch(batch)
    
    logging.info("done")


if __name__ == '__main__':
    main()