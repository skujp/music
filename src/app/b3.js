const b3 = require('bass-sequencer');
const readline = require("readline");
const fs = require("fs");

const shellName = 'b3';

const T_READ = '.read';
const T_STOP = '.stop';
const T_EXIT = '.exit';
const T_HELP = '.help';
const T_LOAD = '.load';
const T_SAVE = '.save';
const T_EMPTY = '';
const T_EDITOR = '.editor';
const T_CTRL_C = 'Ctrl+C';
const T_CTRL_D = 'Ctrl+D';


const helpMsg =
`
  ${T_READ}   Read the bass musical notation guide
  ${T_STOP}   Stop playback
  ${T_EXIT}   Exit the REPL
  ${T_HELP}   Show this help message
  ${T_LOAD}   Load sheet music from a file
  ${T_SAVE}   Save the current session to a file
  ${T_EDITOR} Enter editor mode

  ${T_CTRL_C}   Cancel the current expression
  ${T_CTRL_D}   Exit the REPL
`

const welcomeMsg =
`
  Welcome to ${shellName.toUpperCase()} Shell v${b3.getVersion()}, the Bass Boom Box for musicians.  
  Type "${T_HELP}" for more information.
`

let editorMode = false;
let editorBuffer = [];
let sigIntCount = 0;
let history = [];

function repl(i=0) {

  if (i == 0) {
    console.log(welcomeMsg);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "? ",
  });

  rl.prompt();

  rl.on("line", (line) => {
    if (editorMode) {
      editorBuffer.push(line);
      return;
    }
    line = line.trim();
    try {
      if (line === `${T_EDITOR}`) {
        editorMode = true;
        editorBuffer = [];
        console.log(`// Entering editor mode (${T_CTRL_D} to finish, ${T_CTRL_C} to cancel)`);
        return;
      } else if (line.startsWith(`${T_LOAD} `)) {
        const filename = line.slice(5).trim();
        const sheetMusic = fs.readFileSync(filename, "utf8");
        console.log(sheetMusic);
        const s = b3.buildSequencer(sheetMusic);
        if (!s) {
          console.log(b3.getErrorMsg());
        } else {
          history.push(sheetMusic);
          b3.playSequencer(s).then(() => {rl.prompt();}).catch((e)=> {
            if (b3.isPlaying()) {
              b3.stopSequencer();
            }
            if (e.message !== 'PLAY_IN_PROGRESS') {
              console.error(`[SYSTEM ERROR][1] ${e.message}`);
            }
          });
        }
      } else if (line === `${T_READ}`) {
        console.log("",b3.help());
      } else if (line === `${T_STOP}`) {
        b3.stopSequencer();
      } else if (line === `${T_EMPTY}`) {
        ;
      } else if (line === `${T_EXIT}`) {
        process.exit(0);
      } else if (line === `${T_HELP}`) {
        console.log(helpMsg);
      } else if (line.startsWith(`${T_SAVE} `)) {
        const filename = line.slice(5).trim();
        fs.writeFileSync(filename, history.join("\n\n"), "utf8");
        console.log(`Session saved to ${filename}`);
      } else {
        const s = b3.buildSequencer(line);
        if (!s) {
          console.log(b3.getErrorMsg());
        } else {
          history.push(line);
          b3.playSequencer(s).then(() => {rl.prompt();}).catch((e)=> {
            if (b3.isPlaying()) {
              b3.stopSequencer();
            }
            if (e.message !== 'PLAY_IN_PROGRESS') {
              console.error(`[SYSTEM ERROR][2] ${e.message}`);
            }
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
    rl.prompt();
  });

  rl.on("close", () => {
    if (editorMode) {
      editorMode = false;
      const source = editorBuffer.join("\n");
      const s = b3.buildSequencer(source);
      if (!s) {
        console.log(b3.getErrorMsg());
      } else {
        history.push(source);
        b3.playSequencer(s).then(() => {rl.prompt();}).catch((e)=> {
          if (b3.isPlaying()) {
            b3.stopSequencer();
          }
          if (e.message !== 'PLAY_IN_PROGRESS') {
            console.error(`[SYSTEM ERROR][3] ${e.message}`);
          }
        });
      }
      editorMode = false;
      editorBuffer = [];
      i += 1;
      repl(i);
      return;
    }
    process.exit(0);
  });

  rl.on("SIGINT", () => {
    if (editorMode) {
      editorMode = false;
      editorBuffer = [];
      console.log("\n// Canceled editor mode");
      // rl.setPrompt("? ");
      rl.prompt();
      return;
    }
    if (b3.isPlaying()) {
        b3.stopSequencer();
        sigIntCount = 0;
    } else {
      sigIntCount += 1;
      if (sigIntCount < 2) {
        console.log(`(To exit, press ${T_CTRL_C} again or ${T_CTRL_D} or type ${T_EXIT})`);
      } else {
        process.exit(0);
      }
    }
  });

}

// command line interface 

function readStdin() {
    if (process.stdin.isTTY) {
        return null;
    }
    try {
        return fs.readFileSync(0, "utf-8").trim();
    } catch (e) {
        console.error(e);
        return null;
    }
}
const [, , command, ...args] = process.argv;
const CLI_MESSAGE = 
`Usage:
  ${shellName} [options] [file] [params]

Options:
  -p --play "<sheetmusic>"
  -r --read
  -v --version
  -h --help

Examples:
  ${shellName} -p "| A B C D ||"
  ${shellName} music.txt
  ${shellName}

Note:
  Use ./${shellName} or .\\${shellName}.exe if needed.
  No arguments start the ${shellName.toUpperCase()} Shell.
  Press ${T_CTRL_C} to stop.`
switch (command) {
  case "-p":
  case "--play":
    try {
        const sheetMusic = (args?.length > 0 ? args.join(" ") : readStdin()) ?? "";        
        const s = b3.buildSequencer(sheetMusic);
        if (!s) {
            console.log(b3.getErrorMsg());
            process.exit(1);
        }
        b3.playSequencer(s).then(() => {process.exit(0)}).catch((e)=> {
          if (b3.isPlaying()) {
            b3.stopSequencer();
          }
          if (e.message !== 'PLAY_IN_PROGRESS') {
            console.error(`[SYSTEM ERROR][4] ${e.message}`);
          }
        });
    } catch (e) {
        console.error(e);
        process.exit(2);
    }
    break;
  case "-r":
  case "--read":
    console.log('',b3.help());
    break;
  case "-h":
  case "--help":
    console.log(CLI_MESSAGE);
    break;
  case "-v":
  case "--version":
    console.log(`v${b3.getVersion()}`);
    break;
  case undefined:
    repl(0);
    break;
  default:
    try {
      const sheetMusic = fs.readFileSync(command, "utf8");
      const s = b3.buildSequencer(sheetMusic);
      if (!s) {
        console.log(b3.getErrorMsg());
      } else {
        b3.playSequencer(s).then(() => {process.exit(0)}).catch((e)=> {
          if (b3.isPlaying()) {
            b3.stopSequencer();
          }
          if (e.message !== 'PLAY_IN_PROGRESS') {
            console.error(`[SYSTEM ERROR][5] ${e.message}`);
          }
        });
      }
    } catch (e) {
      console.error(e);
      process.exit(3);
    }    
}