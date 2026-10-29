"""Run a real command and retain its unedited stdout/stderr and exit metadata."""
import datetime
import json
import os
import pathlib
import subprocess
import sys

target = pathlib.Path(sys.argv[1]).resolve()
command = sys.argv[2:]
target.parent.mkdir(parents=True, exist_ok=True)
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
environment = dict(os.environ, NO_COLOR="1", FORCE_COLOR="0")
result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=environment)
target.write_bytes(result.stdout)
target.with_suffix(".meta.json").write_text(json.dumps({
    "command": command, "cwd": os.getcwd(), "startedAtUTC": started,
    "completedAtUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "exitCode": result.returncode,
}, indent=2) + "\n")
sys.stdout.buffer.write(result.stdout)
sys.exit(result.returncode)
