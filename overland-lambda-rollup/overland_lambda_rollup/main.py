from .dlsToObjs import loadAllFiles
from pathlib import Path

def main():
    print("loading all files")
    entries = loadAllFiles(Path('./dl'))
    print(f"got {len(entries)} entries")
    print(entries[0])


if __name__ == '__main__':
    main()