import json
import mitmproxy.http
from mitmproxy import ctx, http
from functools import reduce

PIN_MAP = {
  "0": "b",
  "1": "F",
  "2": "7",
  "3": "A",
  "4": "1",
  "5": "e",
  "6": "K",
  "7": "1",
  "8": "Z",
  "9": "c",
}

def request(flow):
  if flow.request.pretty_url.endswith("api.sipapp.io/2.0/trial"):
    ctx.log.info("😀 Catch it!")
    pin = json.loads(flow.request.content)["pin"]
    match = reduce(lambda x, y: x + PIN_MAP[y], str(pin), "")
    body = {
      "build": 200,
      "environment": "production",
      "match": match,
      "status": 200,
      "success": True,
      "trial": {
        "days": 15,
        "remaining": 15,
        "date": "2020-02-23",
        "name": "FaiChou-MBP",
        "id": json.loads(flow.request.content)["id"]
      },
      "version": "2.0"
    }
    flow.response = http.HTTPResponse.make(
      200,
      json.dumps(body, separators=(',', ':')),
      {"content-type": "application/json"}
    )

