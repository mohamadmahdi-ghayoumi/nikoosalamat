from __future__ import annotations

import os
import signal
import subprocess
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / "frontend"


def stop_process(process: subprocess.Popen[bytes]) -> None:
    if process.poll() is not None:
        return
    if os.name == "nt":
        process.send_signal(signal.CTRL_BREAK_EVENT)
    else:
        process.terminate()


def main() -> int:
    npm = "npm.cmd" if os.name == "nt" else "npm"
    creation_flags = subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0

    backend = subprocess.Popen(
        [
            sys.executable,
            "-m",
            "uvicorn",
            "app.main:app",
            "--app-dir",
            str(ROOT / "backend"),
            "--reload",
            "--port",
            "8011",
        ],
        cwd=ROOT,
        creationflags=creation_flags,
    )
    frontend = subprocess.Popen(
        [npm, "--prefix", str(FRONTEND), "run", "dev"],
        cwd=ROOT,
        creationflags=creation_flags,
    )

    processes = [backend, frontend]
    print("\nSovara is starting:")
    print("  Frontend: http://127.0.0.1:5173 (or the next free port)")
    print("  API docs: http://127.0.0.1:8011/docs")
    print("  Press Ctrl+C to stop both servers.\n")

    try:
        while True:
            for process in processes:
                exit_code = process.poll()
                if exit_code is not None:
                    return exit_code
            time.sleep(0.4)
    except KeyboardInterrupt:
        return 0
    finally:
        for process in processes:
            stop_process(process)
        for process in processes:
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()


if __name__ == "__main__":
    raise SystemExit(main())
