import "source-map-support/register";

import { APIGatewayProxyHandler } from "aws-lambda";
import { S3 } from "aws-sdk";
import { Feature, Point } from "geojson";
import * as HttpStatus from "http-status-codes";

const s3 = new S3();

type OverlandProperties = {
  timestamp: String; // ISO8601
  altitude: number; // meters
  speed: number; // meters per second
  horizontal_accuracy: number; // in meters
  vertical_accuracy: number; // in meters
  motion: [string]; //"driving", "walking", "running", "cycling", "stationary"
  battery_state: string; //"unknown", "charging", "full", "unplugged"
  wifi: string; // If the device is connected to a wifi hotspot, the name of the SSID will be included
  device_id: string; // The device ID configured in the settings, or an empty string
} | null;

export const submitBatch: APIGatewayProxyHandler = async (event, _context) => {
  const confToken = process.env.TOKEN;
  const token =
    event.queryStringParameters && event.queryStringParameters["token"];

  const makeError = (msg: String, code: number) => {
    return {
      statusCode: code,
      body: JSON.stringify({ message: msg, input: event }, null, 2)
    };
  };

  if (!token)
    return makeError(
      "Must specify an authorization token",
      HttpStatus.UNAUTHORIZED
    );
  if (confToken !== token)
    return makeError("Specified auth token forbidden", HttpStatus.FORBIDDEN);

  const locations: Array<Feature<Point, OverlandProperties>> = JSON.parse(
    event.body
  ).locations;

  const normalizedLocations = locations.map(x => JSON.stringify(x)).join("\n");
  const key = "history/" + new Date().toISOString() + ".json";

  await s3
    .putObject({
      Bucket: process.env.BUCKET,
      Key: key,
      Body: normalizedLocations
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ result: "ok" })
  };
};
