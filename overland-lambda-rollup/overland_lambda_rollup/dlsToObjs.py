import json
from pathlib import Path
import concurrent.futures as futures
from tqdm import tqdm
from typing import List, Dict, Any

def loadAllFiles(path: Path) -> List[Dict[str, Any]]:
    """
    Reads all overland jsons in a directory
    """
    json_files = list(path.glob("*.json"))
    print(f"loading {len(json_files)} files")
    results = []
    with tqdm(total=len(json_files)) as pbar:
        with futures.ProcessPoolExecutor() as pool:
            for future in futures.as_completed(pool.submit(overlandJSONToObjs, path) for path in json_files):
                results.extend(future.result())
                pbar.update(1)
    return [obj for obj in results if obj is not None]

def overlandJSONToObjs(filepath: str) -> List[Dict[str, Any]]:
    """
    Reads an overland JSON file and transforms it into an array of objects
    """

    with open(filepath, 'r') as f:
        return [_transformJSONtoobj(json.loads(line)) for line in f]

def _transformJSONtoobj(obj) -> Dict[str, Any]:
    if "geometry" not in obj:
        print("Missing geom?")
        print(obj)
        return None
    props = obj["properties"]
    geom = obj["geometry"]
    return {
        'ts': props["timestamp"],
        'alt': props["altitude"] if 'altitude' in props else None,
        'vacc': props["vertical_accuracy"] if 'vertical_accuracy' in props else None,
        'hacc': props["horizontal_accuracy"] if "horizontal_accuracy" in props else None,
        'wifi': props["wifi"] if props["wifi"] != "" else None,
        'batt': props["battery_level"] if "battery_level" in props else None,
        'batt_state': props["battery_state"] if "battery_state" in props else "unknown",
        # 'mot': props["motion"] if "motion" in props else [],
        'speed': props["speed"] if "speed" in props else None,
        'lat': geom["coordinates"][1],
        'lon': geom["coordinates"][0],
    }
