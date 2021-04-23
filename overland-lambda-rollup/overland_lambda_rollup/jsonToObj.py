
def transform(obj):
    if "geometry" not in obj:
        print("Missing geom?")
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
        'mot': props["motion"] if "motion" in props else [],
        'speed': props["speed"] if "speed" in props else None,
        'lat': geom["coordinates"][1],
        'lon': geom["coordinates"][0],
    }