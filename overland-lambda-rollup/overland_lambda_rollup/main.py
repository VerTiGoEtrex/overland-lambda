from dataclasses import dataclass
from .dlsToObjs import loadAllFiles
from pathlib import Path
import pandas as pd
import logging
import os
import pyarrow as pa
# from tqdm import tqdm
from tqdm.rich import tqdm
import click
import filetype
from rich.logging import RichHandler
from rich.prompt import Confirm
import ffmpeg
from PIL import Image
from PIL.ExifTags import TAGS

FORMAT = "%(message)s"
logging.basicConfig(
    level=logging.INFO,
    handlers=[RichHandler(rich_tracebacks=True)],
    format=FORMAT,
    datefmt="[%X]",
)


@dataclass
class TimelineEntry:
    ts: int
    path: Path


@click.command()
@click.argument('media-tree-dir')
def handle_media(media_tree_dir):
    """
    Enumerates media locally or on S3, converts to p-dash, creates timeline, and optionally uploads to S3
    """

    logging.info("enumerating all media")
    source_path = Path(media_tree_dir)
    other_types = {}
    videos = []
    images = []
    total = 0
    for file in (f for f in source_path.glob("**/*") if f.is_file()):
        total += 1
        file_type = filetype.guess(file.as_posix())
        if file_type == None:
            other_types["unknown"] = other_types.get("unknown", 0) + 1
            logging.info(f"UNKNOWN {file}")
        elif file_type.mime in {'image/tiff', 'image/heic', 'image/jpeg', 'image/png', 'image/x-canon-cr2'}:
            images.append(file)
        elif file_type.mime in {'video/quicktime', 'video/mp4'}:
            videos.append(file)
        else:
            other_types[file_type.mime] = other_types.get(file_type.mime, 0) + 1

    for k, v in other_types.items():
        logging.info(f"{k}: {v}")

    logging.info("")
    logging.info(f"videos, {len(videos)}")
    logging.info(f"images {len(images)}")

    assert Confirm.ask("Continue?")

    # Create a timeline
    timeline = []
    for image in tqdm(images, desc="Probing photos"):
        logging.info(image)
        im = Image.open(image)
        exifdata = im.getexif()
        # iterating over all EXIF data fields
        for tag_id in exifdata:
            # get the tag name, instead of human unreadable tag id
            tag = TAGS.get(tag_id, tag_id)
            data = exifdata.get(tag_id)
            # decode bytes 
            # if isinstance(data, bytes):
                # data = data.decode()
            # logging.info(f"{tag:25}: {data}")

    # for video in tqdm(videos, desc="Probing videos"):
    #     x = ffmpeg.probe(video)
    #     logging.info(x['format']['tags'].keys())
    #     if 'com.apple.quicktime.creationdate' in x['format']['tags']:
    #         logging.info(x['format']['tags']['com.apple.quicktime.creationdate'])
    #     if 'creation_time' in x['format']['tags']:
    #         logging.info(x['format']['tags']['creation_time'])
    #     else:
    #         logging.info(f"MISSING CREATION TIME: {video}")




def location_data_to_arrow():
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
    # logging.info("ts to epoch")
    # df["ts"] = df["ts"].astype('int64')//1e9
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