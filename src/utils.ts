export function spawn(cmd: string, opt = {}) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const child_process = require("child_process");
  return new Promise((resolve, reject) => {
    const p = child_process.spawn(
      cmd,
      Object.assign(
        {
          shell: process.platform !== "win32",
          env: process.env,
        },
        opt
      )
    );
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
    p.on("error", reject);
    p.on("exit", (code: number) => (code === 0 ? resolve(0) : reject(code)));
  });
}
