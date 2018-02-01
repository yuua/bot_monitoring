import * as child_process from "child_process";

exports.exec = (cmd,cd) => {
  const parts = cmd.split(/\s+/g)
  let p = child_process.spawn(parts[0], parts.slice(1), {stdio: 'inherit'});
  p.on('exit', (code) => {
    let err = null
    if (code) {
      err = new Error(`command ${cmd} exited with wrong status code ${code}`)
      err.code = code
      err.cmd = cmd
    }
    if (cd) cd(err)
  })
}

exports.series = (cmds, cb) => {
  let execNext = async () => {
    let a = await exports.exec(cmds.shift())
    if (a) {
      cb(a)
    } else {
      if (cmds.length) execNext()
      else cb(null)
    }
  }
  execNext();
};
