from .dlsToObjs import loadAllFiles
from pathlib import Path
import pandas as pd


def main():
    print("loading all files")
    entries = loadAllFiles(Path('./dl'))
    print(f"got {len(entries)} entries")
    print(entries[0])
    df = pd.DataFrame.from_records(entries)
    df.sort_values('ts', ignore_index=True, inplace=True)
    print(df)
    print(df.dtypes)
    print(df.describe())


if __name__ == '__main__':
    main()