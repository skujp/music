const bass = require('bass-sequencer');
const { AudioContext } = require('node-web-audio-api');
const readline = require("readline");
const fs = require("fs");
const { readFileSync } = require('node:fs');
const chardet = require('chardet');
const iconv = require('iconv-lite');

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
  Welcome to ${shellName.toUpperCase()} Shell v${bass.getVersion()}, the Bass Boom Box for musicians.  
  Type "${T_HELP}" for more information.
`

const cliMsg = 
` 
  Usage:
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

  Notes:
    Use ./${shellName} or .\\${shellName}.exe if needed.
    No arguments start the ${shellName.toUpperCase()} Shell.
    Press ${T_CTRL_C} to stop.
`

var editorMode = false;
var editorBuffer = [];
var sigIntCount = 0;
var history = [];
const [, , command, ...args] = process.argv;


function readAnyTextFileSync(filePath) {
  const buffer = readFileSync(filePath);

  if (buffer.length === 0) return '';

  try {
    const utf8Text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    return utf8Text.replace(/^\uFEFF/, '');
  } catch {
    ;
  }

  const detected = chardet.detect(buffer);
  const encoding = detected && iconv.encodingExists(detected) ? detected : 'win1252';
  const text = iconv.decode(buffer, encoding);

  return text.replace(/^\uFEFF/, '');
}

function readStdin() {
    if (process.stdin.isTTY) { return null; }

    try {
        return fs.readFileSync(0, "utf-8").trim();
    } catch (e) {
        console.error(e);
        return null;
    }
}

function repl(i=0) {

  if (i == 0) {
    console.log(welcomeMsg);
  } else if (i == 2500) {
    i = 1;
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
        const sheetMusic = readAnyTextFileSync(filename);
        console.log(sheetMusic);
        const s = bass.buildSequencer(sheetMusic);
        if (!s) {
          console.log(bass.getErrorMsg());
        } else {
          history.push(sheetMusic);
          bass.playSequencer(s).then(() => {rl.prompt();}).catch((e)=> {
            if (bass.isPlaying()) {
              bass.stopSequencer();
            }
            if (e.message !== 'PLAY_IN_PROGRESS') {
              console.error(`[1] ${e.message}`);
            }
          });
        }
      } else if (line === `${T_READ}`) {
        console.log("",bass.help());
      } else if (line === `${T_STOP}`) {
        bass.stopSequencer();
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
        const s = bass.buildSequencer(line);
        if (!s) {
          console.log(bass.getErrorMsg());
        } else {
          history.push(line);
          bass.playSequencer(s).then(() => {rl.prompt();}).catch((e)=> {
            if (bass.isPlaying()) {
              bass.stopSequencer();
            }
            if (e.message !== 'PLAY_IN_PROGRESS') {
              console.error(`[2] ${e.message}`);
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
      const s = bass.buildSequencer(source);
      if (!s) {
        console.log(bass.getErrorMsg());
      } else {
        history.push(source);
        bass.playSequencer(s).then(() => {rl.prompt();}).catch((e)=> {
          if (bass.isPlaying()) {
            bass.stopSequencer();
          }
          if (e.message !== 'PLAY_IN_PROGRESS') {
            console.error(`[3] ${e.message}`);
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
      rl.prompt();
      return;
    }
    if (bass.isPlaying()) {
        bass.stopSequencer();
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

async function BassBoomBox() {

  bass.ssup(AudioContext, process.platform === 'linux').then(()=>{}).catch((e)=>{console.error(`[Audio Setup Error] ${e}`)}); 

  switch (command) {
    case "-p":
    case "--play":
      try {
          process.on('SIGINT',() => {process.exit(-1)});
          const sheetMusic = (args?.length > 0 ? args.join(" ") : readStdin()) ?? "";        
          const s = bass.buildSequencer(sheetMusic);
          if (!s) {
              console.log(bass.getErrorMsg());
              process.exit(1);
          }
          bass.playSequencer(s).then(() => {process.exit(0)}).catch((e)=> {
            if (bass.isPlaying()) {
              bass.stopSequencer();
            }
            if (e.message !== 'PLAY_IN_PROGRESS') {
              console.error(`[4] ${e.message}`);
            }
          });
      } catch (e) {
          console.error(e);
          process.exit(2);
      }
      break;
    case "-r":
    case "--read":
      console.log('',bass.help());
      process.exit(0);
    case "-h":
    case "--help":
      console.log(cliMsg);
      process.exit(0);
    case "-v":
    case "--version":
      console.log(`v${bass.getVersion()}`);
      process.exit(0);
    case undefined:
      repl(0);
      break;
    default:
      try {
        process.on('SIGINT',() => {process.exit(-2)});
        const sheetMusic = readAnyTextFileSync(command);
        const s = bass.buildSequencer(sheetMusic);
        if (!s) {
          console.log(bass.getErrorMsg());
          process.exit(3);
        } else {
          bass.playSequencer(s).then(() => {process.exit(0)}).catch((e)=> {
            if (bass.isPlaying()) {
              bass.stopSequencer();
            }
            if (e.message !== 'PLAY_IN_PROGRESS') {
              console.error(`[5] ${e.message}`);
            }
          });
        }
      } catch (e) {
        console.error(e);
        process.exit(4);
      }    
  }
}

BassBoomBox().then(() => {}).catch((e) => {console.error(e); process.exit(5);});