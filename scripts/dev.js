const { execFileSync, spawn } = require("node:child_process");
const path = require("node:path");

const rootDirectory = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const processCommand = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : npmCommand;
const processArguments = process.platform === "win32"
  ? ["/d", "/s", "/c", `${npmCommand} run dev`]
  : ["run", "dev"];
const children = new Set();
let shuttingDown = false;

function startProcess(name, workingDirectory) {
  const child = spawn(processCommand, processArguments, {
    cwd: path.join(rootDirectory, workingDirectory),
    stdio: "inherit",
    env: process.env,
  });

  children.add(child);
  child.on("error", (error) => {
    console.error(`[${name}] failed to start: ${error.message}`);
    if (!shuttingDown) shutdown(1);
  });
  child.on("exit", (code, signal) => {
    children.delete(child);
    if (shuttingDown) return;
    const result = signal ? `signal ${signal}` : `code ${code}`;
    console.error(`[${name}] exited unexpectedly with ${result}`);
    shutdown(code || 1);
  });
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (process.platform === "win32" && child.pid) {
      try {
        execFileSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
      } catch {
        // The child may have exited before forced cleanup.
      }
    } else {
      child.kill("SIGINT");
    }
  }
  setTimeout(() => {
    for (const child of children) {
      if (process.platform !== "win32" && !child.killed) {
        child.kill("SIGTERM");
      }
    }
    process.exit(exitCode);
  }, 500);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("exit", () => {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
});

startProcess("backend", "backend");
startProcess("frontend", "frontend");
