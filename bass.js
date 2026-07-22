(function(global) {

/* |||||||||||||||||||||||||||||||||||| library version setup  ||||||||||||||||||||||||||||||||||||||| */
     
const VERSION = "2.0.0";                                                // current library version                                              

/* |||||||||||||||||||||||||||||||||||| error message system setup ||||||||||||||||||||||||||||||||||| */

const error = {      
    _msg: EMPTY,
    get msg() {
        return this._msg;
    },
    set msg(val) {
        if (DEBUG_MODE) {
            console.log(val);
        }
        this._msg = val;
    }
}

var DEBUG_MODE = false;                                                   // show log in debug mode if true (synchronous functions only)
var FULL_ASYNC_DEBUG_MODE = false;                                        // show oops in debug mode if true (asynchronous functions only)


/* ||||||||||||||||||||||||||||||||||| external dependencies setup ||||||||||||||||||||||||||||||||||| */

var DEF_INST = "piano";
var DEF_SUPPORT_INST = new Set([DEF_INST, "drum", "guitar", "flute"]);
var instrument = DEF_INST; // hold default instrument in BASS system, currently it is a synthesizer sound
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain(); masterGain.gain.value = 0.22; masterGain.connect(audioCtx.destination);


/* |||||||||||||||||||||||||||||||||||| bass library API setup ||||||||||||||||||||||||||||||||||||||| */

const _oBass = global.bass;
const TheBass = {};
global.bass = TheBass;

function rename() {
    error.msg = 'Renaming library';
    if (global.bass === TheBass) {
        global.bass = _oBass;
    }
    return TheBass;
}

function bind(libObject, functionObj) {
    Object.assign(libObject, functionObj);
}

bind(TheBass, {rename, setDebug, help, getErrorMsg, getChordNotes, buildSequencer});  // core functions

bind(TheBass, {setFullAsyncDebug, getFullAsyncDebugMode, oops, 
                   playNote, playChord, playSequencer, stopSequencer, 
                   setTempo, setOctave, getOctave, getTempo, 
                   getSampleTestCase, getMaxSheetLength,
                   setSaveAs, setSustain, getSustain, 
                   getInstrument, setInstrument,
                   getDuration, getGuitarNote, getVersion 
              });    // addons functions

/* |||||||||||||||||||||||||||||||| core bass implementation ||||||||||||||||||||||||||||||||||||||||||| */

/* SYSTEM CONSTANTS */
const BPM = {                                                           /* beats per minute */
    _val: 90,                                                           /* default 90 beats per minute */
    get val() {
        return this._val;
    },
    set val(v) {
        this._val = v;
        let target_note_value = 1/beatType;
        let metronome_note_value = (beatType === 4) ? 0.25 : (beatType === 8 && [6, 9, 12].includes(beats)) ? 0.375 : (1 / beatType);
        DEF_DURATION = 60 / this._val * (target_note_value / metronome_note_value);
        DEF_MSEC = DEF_DURATION * 1000;
        error.msg = `reshaking for time signature ${beats}/${beatType} : one note now lasts ${DEF_DURATION} seconds`;
    }
}

/* SEQUENCER LITERALS */
const BAR = "|";
const DBL_BAR = "||";
const REP_START = "|:";
const REP_END = ":|";
const DBL_REP_START = "||:";
const DBL_REP_END = ":||";
const BAR_REPEAT = "%";
const BM = "/";                                                         // beat mark: pulse (default) or sustain
const REP_NUM = /\((\d+)x\)/;                                           // (2x), (3x), (4x), etc.
const BTB_REP = ":|:";                                                  // back to back repeat
const DBL_BTB_REP = ":||:";                                             // double back to back repeat :|:
const SKIP_NUM = /\[(\d+)\./;                                           // [1., [2., [3., etc.
const TIME_SIG = /^(\d+)\/(1|2|4|8|16|32|64|128|256|512|1024)$/;        // time signature
const AUX = /^\(([^)]+)\)$/;                                            // auxiliary tokens

/* SEQUENCER MODIFIERS */
var MAX_SHEET_LENGTH = 3000;                                            // maximum number characters allowed for a sheet music
var FAKE = "A";                                                         // a fake note to play for premilinary test
var DEF_OCTAVE = 4;                                                     // default octave
var MIN_OCTAVE = 0;                                                     // lowest octave
var MAX_OCTAVE = 8;                                                     // highest octave
var MIN_TEMPO  = 30;                                                    // minimum beats per minute BPM
var MAX_TEMPO  = 300;                                                   // maximum beats per minute BPM
var MIN_VOL = 0;                                                        // minimum volume means 0%
var MAX_VOL = 1;                                                        // maximium volume means 100%
var PULSE_FLAG = true;                                                  // play '/' as repeated from previous note
var END = false;                                                        // by default keep playing the piece in a loop, no ending
var SMP_SEQUENCER = [[['F','A','C'],'C'],[['A','C','E'],'E']];          // sample sequencer chord progression with base note
var SMP_SEQUENCER_CHORD = SMP_SEQUENCER[0];                             // one sample sequencer chord
var DEF_REP_NUM = 1;                                                    // default repetition is 1 in bar such as |: :|
var DEF_TIME_SIGNATURE = '4/4';                                         // default time signature is 4/4
var DEF_BEAT_JUMP = 1;                                                  // default beat jump (future CODA implementation)
var CLASSICAL_CHECK = true;                                             // lightly check opening bar + ending bar = beats
var LST_SKIPNUM = 1;                                                    // lowest skip number is 1 for [1. 
var OCTAVE_LENGTH = 12;                                                 // there are 12 notes in a piano octave
var EMPTY = "";                                                         // sheet music default value
var [beats, beatType] = DEF_TIME_SIGNATURE.split('/').map(Number);      // default beats and beatType, possible to change later
var DEF_DURATION = 60 / BPM.val;                                        // calculate one beat last in how many second?
var DEF_MSEC = DEF_DURATION * 1000;                                     // calculate one beat last in how many milliseconds?
var SMP_TESTCASE = "Title:Rhythmeus\nComposer:Chordius\nPerformer:Melodius\n\n3/4 |: F / F7 | % | [1. G D G/D :| [2. Bmaj7 Aaug Fdim ||";      // a sample test case
var SAVE_AS_TYPES = new Set(["PDF","BASS"]);                            // currently support these types for setSaveAs function
var BASSBOARD_DB_FIELD = new Set(["Contributor","Title"]);              // this is the minimum requirement to save as .bass, URL is optional. 
var CTRL_FUNCS = /^(Title|Contributor|Artist|Composer|Arranger|Singer|Writer|Author|Song|Performer|Cover|Remix|Original|Genre|Tempo|Octave|SaveAs|Sustain|URL|Misc|Derivative)(:)(.+)$/;

/* SYSTEM VARIABLES */
var taskDropper = null;                                                 // hold signal to interrupt sequencer playing
var validArgs = new WeakSet();                                          // to help decide argument for a function is valid
var _sheetMusic;                                                        // private variable which holds correct syntax sheetMusic, must reshake before each run buildSequencer
var notes = _initMusicMajorScale();                                     // [!important] notes object hold DS to for different instruments                                                        


function _initMusicMajorScale() {
// the function return a data structure
// which can be used across different instruments 
    const baseNotes = {1: 'C', 2: 'C#', 3: 'D', 4: 'D#', 5: 'E', 6: 'F', 7: 'F#', 8: 'G', 9: 'G#', 10: 'A', 11: 'A#', 12: 'B'};
    const notes = { ...baseNotes };
    for (const [key, value] of Object.entries(baseNotes)) {
        notes[value] = Number(key);
    }
    // Additionally, we can add the flat notes to the notes object
    const flatNotes = { 'Db': 2, 'Eb': 4, 'Gb': 7, 'Ab': 9, 'Bb': 11 };
    Object.assign(notes, flatNotes);
    return notes;
}

function setDebug(f) {
    DEBUG_MODE = f;
}

function setFullAsyncDebug(f) {
    FULL_ASYNC_DEBUG_MODE = f;
}

function help() {
    let manual = "";
    manual += "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n";
    manual += "" + "\n";
    manual += "I. INTRODUCTION" + "\n";
    manual += "" + "\n";
    manual += "BASS, pronounced /beɪs/, spelled /B-A-S-S/ all uppercase, is a musical chord" + "\n";
    manual += "notation system. Derived from the word 'bass clef' of a piano instrument, " + "\n";
    manual += "it uses common musical symbols often found in a sheet music." + "\n";
    manual += "Anyone can use the BASS system to try new chord progressions, compose, " + "\n";
    manual += "or learn music. The world is your oyster!!!" + "\n";
    manual += "" + "\n";
    manual += "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n";
    manual += "" + "\n";
    manual += "II. THE BASICS" + "\n";
    manual += "" + "\n";
    manual += "1. Note" + "\n";
    manual += "A musical note is a single, basic building block of music." + "\n";
    manual += "For a piano standard musical scale, it can be written as:" + "\n";
    manual += "C, C#, Db, D, D#, Eb, E, F, F#, Gb, G, G#, Ab, A, A#, Bb, B." + "\n";
    manual += "" + "\n";
    manual += "2. Chord" + "\n";
    manual += "A chord is a group of three or more notes played at the same time." + "\n";
    manual += "For example, chord F (F major) consists of F,A,C. " + "\n";
    manual += "chord F/A (F major / bass A) consists of F,A,C with a bass note A. " + "\n";
    manual += "Currently, the BASS system supports the following chord type notations: " + "\n";
    manual += "F (F Major), Fm (F Minor), Faug (F Augmented), Fdim (F Diminished), " + "\n";
    manual += "Fmaj7 (F Major 7), F7 (F Dominant 7), Fm7 (F Minor 7), " + "\n";
    manual += "Fmmaj7 (F Minor-Major 7), Fm7b5 (F Half-Diminished)," + "\n";
    manual += "F7b5 (F Dominant-seventh flat five), Fdim7 (F Fully Diminished)," + "\n";
    manual += "Fsus2 (F Suspended 2), Fsus4 (F Suspended 4), Fadd9 (F Add 9), " + "\n";
    manual += "F5 (F Power Chord), Fmaj9 (F Major 9), F6 (F Major 6), F9 (F 9), " + "\n";
    manual += "D/F (D with F in the bass)." + "\n";
    manual += "" + "\n";
    manual += "3. Sheet Music" + "\n";
    manual += "A sheet music is a written or printed guide for musicians." + "\n";
    manual += "In the BASS system, a chord (NOT note) is the basic unit of a sheet music." + "\n";
    manual += "For example, 4/4 | F F F F || means " + "\n";
    manual += "to play chord F Major four times (NOT single F note four times)." + "\n";
    manual += "" + "\n";
    manual += "4. Time Signature" + "\n";
    manual += "A time signature is a musical notation symbol made of two stacked " + "\n";
    manual += "numbers telling about the rhythm of a song such as: 4/4, 3/4, 6/8, etc. " + "\n";
    manual += "Time signature is usually written in the beginning of a sheet music." + "\n";
    manual += "For example, 3/4 | A B C | D E / | " + "\n";
    manual += "If the sheet music does not start with a time signature, by default the " + "\n";
    manual += "time signature is 4/4. For example, | F D A C | B A B A |" + "\n";
    manual += "" + "\n";
    manual += "5. Time Measure" + "\n";
    manual += "Time Measure (or Bar) is a small container of time that holds " + "\n";
    manual += "a specific number of beats. For example, the following bar " + "\n";
    manual += "contains 3 beats: | / / / |, this bar contains 0 beat: |     | " + "\n";
    manual += "" + "\n";
    manual += "6. Opening Section" + "\n";
    manual += "Opening Section (leading tone) is optional. The number of opening beats " + "\n";
    manual += "cannot go over the nominator beats of time signature." + "\n";
    manual += "For example, A A | D / D / | Amaj7 / Amaj7 / || is accepted " + "\n";
    manual += "with a leading tone A A (2 beats)." + "\n";
    manual += "" + "\n";
    manual += "7. Repeat Section" + "\n";
    manual += "A repeat section (or loop) is a section which is played again and again." + "\n";
    manual += "The loop usually looks like this |:   :|  or ||:    :|| or  " + "\n";
    manual += "|    :| (loop back from beginning)." + "\n";
    manual += "In some cases, it can use back to back loop symbol :|: or :||: " + "\n";
    manual += "For example, |:   :|:   :| or ||:   :||:   :||" + "\n";
    manual += "By default, repeat section will loop for 1 time (2x), but it is up to the user to " + "\n";
    manual += "modify using repeat modifiers as (3x), (4x), etc." + "\n";
    manual += "For example, |: (4x)  F  /  / C  |  B  /  /  A  :| means " + "\n";
    manual += "loop 4 times over the 2 bars of chords." + "\n";
    manual += "" + "\n";
    manual += "8. Skip Section" + "\n";
    manual += "A skip section is similar to a loop but will be skipped to play " + "\n";
    manual += "before the last time it is repeated. " + "\n";
    manual += "For example, the following example during repetition will " + "\n";
    manual += "skip the [1. bar and play the [2. bar instead: " + "\n";
    manual += "4/4 |: A A A A | [1. B B B B | [2. C C C C :| D D D D |" + "\n";
    manual += "" + "\n";
    manual += "9. Ending Section" + "\n";
    manual += "A sheet music must end with either a single bar character | or " + "\n";
    manual += "a double bar character ||" + "\n";
    manual += "If it ends with a || , the system will stop playing (no loop back)." + "\n";
    manual += "Otherwise, the system by default will keep looping back from the beginning " + "\n";
    manual += "even without the user's intervention." + "\n";
    manual += "" + "\n";
    manual += "10. Classical Rule" + "\n";
    manual += "The following rule will be applied heuristically on a case basis:" + "\n";
    manual += "The number of opening beats and ending beats must equal the  " + "\n";
    manual += "nominator beats in time signature." + "\n";
    manual += "" + "\n";
    manual += "11. Tempo" + "\n";
    manual += "Tempo is the speed or pace at which a piece of music is played." + "\n";
    manual += "It is the number of beats per minutes (bpm) set up before " + "\n";
    manual += `playing the sheet music. In the BASS system, by default bpm is set to ${BPM.val}. ` + "\n";
    manual += "The user can change it manually. See section IV for more details." + "\n";
    manual += "" + "\n";
    manual += "12. Octave" + "\n";
    manual += "An octave is the distance between two musical notes that share the " + "\n";
    manual += "same name (like two different C notes). " + "\n";
    manual += "It is exactly eight steps apart on a standard musical scale." + "\n";
    manual += "In the BASS system, octave ranges can be from 0 to 8 " + "\n";
    manual += "where 0 is the lowest bass, and 8 is the highest bass." + "\n";
    manual += "By default, it uses octave 4 similar to the concept of " + "\n";
    manual += "middle C in a piano. User can change it manually. " + "\n";
    manual += "See section IV for more details." + "\n";
    manual += "" + "\n";
    manual += "13. Space" + "\n";
    manual += "Every musical symbol must be separated by a blank space. " + "\n";
    manual += "The recommended space is 1 blank character between two musical symbols." + "\n";
    manual += "For example, one blank space between two opening notes in the following, " + "\n";
    manual += "2/4   D D | F         F | " + "\n";
    manual += "" + "\n";
    manual += "14. Pulse /" + "\n";
    manual += "A pulse / means the user can either play the previous note or sustain (legato) it." + "\n";
    manual += "By default, the BASS system will play the previous note (staccato)." + "\n";
    manual += "For example, | B A / | will play B, A, A" + "\n";
    manual += "Please note, a pulse / is different than a slash / in a slash chord." + "\n";
    manual += "For example, A/E means A Major chord with a E at the bass." + "\n";
    manual += "" + "\n";
    manual += "14. Duplicate %" + "\n";
    manual += "A duplicate % means repeat playing the previous bar." + "\n";
    manual += "For example, | A B C | % || will play A, B, C, A, B, C" + "\n";
    manual += "" + "\n";
    manual += "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n";
    manual += "" + "\n";
    manual += "III. THE CHORD-BASED NOTATION SYSTEM" + "\n";
    manual += "" + "\n";
    manual += "Time Signature:" + "\n";
    manual += "3/4 4/4 6/8 2/2 2/4 12/8 5/4 7/8 9/8 11/8 13/8 15/16 7/4 3/8 (*)" + "\n";
    manual += " " + "\n";
    manual += "Bar:" + "\n";
    manual += "|" + "\n";
    manual += "" + "\n";
    manual += "Opening:" + "\n";
    manual += "|" + "\n";
    manual += "" + "\n";
    manual += "Closing:" + "\n";
    manual += "| ||" + "\n";
    manual += "" + "\n";
    manual += "Repeat:" + "\n";
    manual += ":|" + "\n";
    manual += ":||" + "\n";
    manual += "|:  :|  " + "\n";
    manual += "||:  :||  " + "\n";
    manual += "|:      :|:    :|" + "\n";
    manual += "||:    :||:    :||" + "\n";
    manual += "" + "\n";
    manual += "Times:" + "\n";
    manual += "(1x) (2x) (3x) (4x) (5x) (*)" + "\n";
    manual += "" + "\n";
    manual += "Skip:" + "\n";
    manual += "[1. [2. [3. [4. (*)" + "\n";
    manual += "" + "\n";
    manual += "Pulse:" + "\n";
    manual += "/" + "\n";
    manual += "" + "\n";
    manual += "Duplicate:" + "\n";
    manual += "%" + "\n";
    manual += "" + "\n";
    manual += "Chord:" + "\n";
    manual += "m aug dim maj7 7 m7 mmaj7 m7b5 7b5 dim7 sus sus2 sus4 add9 5 maj9 6 9 /" + "\n";
    manual += "" + "\n";
    manual += "Metadata:" + "\n";
    manual += "(intro) (verse) (chorus) (bridge) (outro) (sustain) (p) (mf) (f) (ff) " + "\n";
    manual += "(Allegro) (Moderato) (Adagio) (Lyrics can go here too) (*)" + "\n";
    manual += "" + "\n";
    manual += "Remark:   " + "\n";
    manual += "(*) means endless" + "\n";
    manual += "" + "\n";
    manual += "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n";
    manual += "" + "\n";
    manual += "IV. SPECIAL NOTATIONS" + "\n";
    manual += "" + "\n";
    manual += "The following notations are separate from the core " + "\n";
    manual += "musical notation system above." + "\n";
    manual += "They are case-sensitive and used for special purposes such as " + "\n";
    manual += "changing music tempo, tuning middle C, or save the sheet music to PDF or BASS files." + "\n";
    manual += "Please note, they must be written at the beginning of the sheet music." + "\n";
    manual += "Also, any value after the colon character (:) can not have any blank space." + "\n";
    manual += "It is recommended to use the underscore character (_). For example, " + "\n"; 
    manual += "Composer:Loremipsum_Dolorsitamet_Maximus_Vesterialian_Batiatus_Mortdevold_Chkft" + "\n";
    manual += "" + "\n";
    manual += "Tempo:<number>          for example, Tempo:100 to set BPM=100" + "\n";
    manual += "Octave:<number>         for example, Octave:5 set middle C to C5 (**)" + "\n";
    manual += "SaveAs:PDF              pop up print dialog box for saving as pdf file" + "\n";
    manual += "SaveAs:BASS             save sheet music to .bass format for listing on bassboard chart" + "\n";
    manual += "Sustain:Yes             disable playing previous BM chord /" + "\n";
    manual += "Sustain:No              enable playing previous BM chord /" + "\n";
    manual += "Title:<songtitle>       for example, Title:My_awesome_melody. Required field when saving to .bass" + "\n";
    manual += "Artist:<name>           for example, Artist:The_BASS" + "\n";
    manual += "Contributor:<name>      for example, Musician:BeatBox" + "\n";
    manual += "Composer:<name>         for example, Composer:RHYTHM" + "\n";
    manual += "Arranger:<name>         for example, Arranger:Chorder" + "\n";
    manual += "Singer:<name>           for example, Singer:Unknown" + "\n";
    manual += "Writer:<name>           for example, Writer:Folklore" + "\n";
    manual += "Author:<name>           for example, Author:Unknown" + "\n";
    manual += "Song:<name>             for example, Song:Hip_And_Hop" + "\n";
    manual += "Performer:<name>        for example, Performer:Super-nova" + "\n";
    manual += "Genre:<type>            for example, Genre:Rap" + "\n";
    manual += "Cover:Yes               means it is a cover" + "\n";
    manual += "Remix:Yes               means it is a remix" + "\n";
    manual += "Original:Yes            means it is your original work" + "\n";
    manual += "Contributor:<name>      for example, Contributor:Newbie_Composer. Required field when saving to .bass" + "\n";
    manual += "Derivative:Yes          means it is an arrangement from others' original work" + "\n";
    manual += "URL:<address>           for example, URL:https://youtube.com/yourmusicchannel. Optional but recommended when saving to .bass" + "\n";
    manual += "Misc:<anything>         for example, Misc:anything_you_want_to_write_here_seperated_by_underscore_character" + "\n";
    manual += "" + "\n";
    manual += "(**) Octave: notation is to set the BASS default system octave, which is not the same as the musical instrument's current octave." + "\n";
    manual += "By default, the BASS system covers the bass clef, and other instruments cover the treble clef." + "\n";
    manual += "" + "\n";
    manual += "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n";
    manual += "" + "\n";
    manual += "V. BASSBOARD CHART" + "\n";
    manual += "" + "\n";
    manual += "It is a collection of sheet music where users can contribute to." + "\n";
    manual += "Users can save to .bass file and send it to the scriptor's email: bassthemusic101 |at| gmail |dot| com" + "\n";
    manual += "Certain phrases are required in order to save to .bass file such as Title:, Contributor:, or URL:" + "\n";
    manual += "(see section IV)." + "\n";
    manual += "Note, any music (chords, rhythms, melody) is allowed, but lyrics and URLs will be filtered for safety to be on the chart." + "\n";
    manual += "" + "\n";
    manual += "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n";
    manual += "" + "\n";
    manual += "VI. QWERTY KEYBOARD" + "\n";
    manual += "" + "\n";
    manual += "Piano notes are mapped to the qwerty row, and number row of a standard computer keyboard. For example: q,w,e,r,t,2,3..." + "\n";
    manual += "Guitar notes are mapped to the next row." + "\n";
    manual += "For example, a,s,d,f,g for frets, and h,j,k,l,;,' for strings 6 to 1." + "\n";
    manual += "" + "\n";
    manual += "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n";
    manual += "" + "\n";
    manual += "VII. DISCLAIMER" + "\n";
    manual += "" + "\n";
    manual += "The BASS system is written by a music enthusiast to help you learn rhythms, " + "\n"; 
    manual += "chords, and very basic compositions. It is by no means to replace a " + "\n";
    manual += "trained professional who can guide you through your complete music endeavor. " + "\n";
    manual += "Well, enjoy and have fun! :)" + "\n";
    manual += "" + "\n";
    manual += "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n";
    manual += "" + "\n";
    manual += "VIII. SOURCE" + "\n";
    manual += "" + "\n";
    manual += "The BASS source code is as below. Report errors, remix, etc. as you wish. Thanks." + "\n";
    manual += "" + "\n";
    manual += "https://github.com/skujp/music" + "\n";
    manual += "" + "\n";
    manual += "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n";
    manual += "" + "\n";
    manual += `Rev ${VERSION}`;

    error.msg = `Loading manual...`;
    return manual;
}

function getErrorMsg() {
    return error.msg;
}

function getChordNotes(chord=FAKE) {

    // this function returns an array of notes for a given chord
    // for example: getChordNotes("C") returns ['C','E','G']    
    // This is the list to recognize and map chords to their notes
    // C Major (C): C - E - G (Bright, stable, default major tonality)
    // C Minor (Cm): C - Eb - G (Darker, sad tonality)
    // C Augmented (C+ or Caug): C - E - G# (Tense, bright, suspended feeling)
    // C Diminished (C°): C - Eb - Gb (Highly dissonant, unresolved)
    // C Major 7 (Cmaj7 or CΔ7): C - E - G - B (Dreamy, jazzy)
    // C Dominant 7 (C7): C - E - G - Bb (Tense, bluesy)
    // C Minor 7 (Cm7): C - Eb - G - Bb (Smooth, jazzy)
    // C Minor-Major 7 Cmmaj7: C - Eb - G - B (Unstable, moody, commonly found in jazz)
    // C Half-Diminished Cm7b5: C - Eb - Gb - Bb (Dark and jazzy)
    // C Dominant-seventh flat five C7b5: C - E - Gb - Bb (tense and moddy)
    // C Fully Diminished Cdim7: C - Eb - Gb - Bbb(A) (Very tense, dissonant)
    // C Suspended 2 (Csus2): C - D - G (Open, unresolved sound)
    // C Suspended 4 (Csus4): C - F - G (Suspenseful, resolves to major)
    // C Add 9 (Cadd9): C - E - G - D (Major chord with a sweet, colorful addition)
    // C Power Chord (C5): C - G (Open, strong—frequently used in rock
    // C Major 9 (Cmaj9): C - E - G - B - D (Lush, beautiful)
    // C Major 6 (C6): C - E - G - A (Warm, jazzy)
    // C 9 (C9): C - E - G - Bb - D (Rich, colorful dominant extension)
    // C/E (C with E in the bass): E - G - C (Inverted chord, changes the bass note)

    // See chordRegex to identify different parts
    // First identify the root note: [A-G](?:#|b)? (A, A#, Ab, B, Bb, C, C#, D, D#, E, F, F#, G, G#)
    // Then identify the chord quality: (?:m|maj|min|dim|aug|sus)? (m, maj, min, dim, aug, sus)
    // Then identify the chord extensions: (?:add9|maj7|m7b5)? (add9, maj7, m7b5)
    // Then identify the chord number: \d* (0 or more digits)
    // Then identify the slash chord: (?:\/[A-G](?:#|b)?)? (optional slash chord)

    const chordRegex = /^([A-G])(#|b)?(m|maj|min|dim|aug|sus)?(add|maj)?(\d*)?((b)(\d+))?(\/([A-G])(#|b)?)?\s*$/;
    chord = chord.trim();
    const match = chord.match(chordRegex);
    if (!match) {
        error.msg = `Invalid chord: ${chord}`;
        return; // invalid chord
    }

    const root = match[1] + (match[2] || ''); // root note with optional sharp or flat
    const quality = match[3] || '';
    const extension = match[4] || '';
    const number = match[5] || '';
    const eflat = match[6] || '';
    const eflatNumber = match[8] || '';
    const ebass = match[9] || '';
    const ebassRoot = (match[10] + (match[11] || '')) || '';

    // // First we represent an octave of notes by using object mirroring
    // const baseNotes = {1: 'C', 2: 'C#', 3: 'D', 4: 'D#', 5: 'E', 6: 'F', 7: 'F#', 8: 'G', 9: 'G#', 10: 'A', 11: 'A#', 12: 'B'};
    // const notes = { ...baseNotes };
    // for (const [key, value] of Object.entries(baseNotes)) {
    //     notes[value] = Number(key);
    // }

    // // Additionally, we can add the flat notes to the notes object
    // const flatNotes = { 'Db': 2, 'Eb': 4, 'Gb': 7, 'Ab': 9, 'Bb': 11 };
    // Object.assign(notes, flatNotes);

    // Now we get the major 3rd and perfect 5th note of a major chord based on the root note
    var rootNoteNumber = notes[root];
    
    // quick check: if rootNoteNumber is undefined, if so return null
    if (rootNoteNumber === undefined) {
        error.msg = `Invalid root for the chord: ${chord}`;
        return null; // invalid root note
    }

    var thirdNoteNumber = (rootNoteNumber + 4) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    var fifthNoteNumber = (rootNoteNumber + 7) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    var sixthNoteNumber = null;
    var seventhNoteNumber = null;
    var ninthNoteNumber = null;
    var ebassNoteNumber = null;

    // Now adjust the notes based on the chord quality
    if (quality === 'm' || quality === 'min') {
        // minor chord: lower the third by a half step
        thirdNoteNumber = (thirdNoteNumber - 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    } else if (quality === 'dim') {
        // diminished chord: lower the third and fifth by a half step
        thirdNoteNumber = (thirdNoteNumber - 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        fifthNoteNumber = (fifthNoteNumber - 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    } else if (quality === 'aug') {
        // augmented chord: raise the fifth by a half step
        fifthNoteNumber = (fifthNoteNumber + 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    }

    // Add or modified the notes based on the chord number
    if (number === '6') {
        // major 6 chord: add the 6th note
        sixthNoteNumber = (rootNoteNumber + 9) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    } else if (number === '7') {
        // Cmmaj7 or Cmaj7 chords
        if (extension === 'maj' || quality === 'maj') { 
            // major 7 chord: add the major 7th note
            seventhNoteNumber = (rootNoteNumber + 11) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        } else {
            // dominant 7 chord: add the minor 7th note
            seventhNoteNumber = (rootNoteNumber + 10) % OCTAVE_LENGTH || OCTAVE_LENGTH;
            if (quality === 'dim') {
                // lower the 7th by a half step for diminished 7th chord
                seventhNoteNumber = (seventhNoteNumber - 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
            }
        }
    } else if (number === '9') {
        if (extension === 'add') {
            // add9 chord: add the 9th note (2nd note an octave higher)
            ninthNoteNumber = (rootNoteNumber + 14) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        } else if (extension === 'maj' || quality === 'maj') {
            // major 9 chord: add the major 7th and 9th notes
            seventhNoteNumber = (rootNoteNumber + 11) % OCTAVE_LENGTH || OCTAVE_LENGTH;
            ninthNoteNumber = (rootNoteNumber + 14) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        } else {
            // dominant 9 chord: add the minor 7th and 9th notes
            seventhNoteNumber = (rootNoteNumber + 10) % OCTAVE_LENGTH || OCTAVE_LENGTH;
            ninthNoteNumber = (rootNoteNumber + 14) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        }
    } else if (number === '5') {
        if (!eflat) {
            // power chord: only root and fifth notes, so we can remove the third note
            thirdNoteNumber = null;
        }
    } else if (number === '4') {
        // handle sus and sus4 chords
        if (quality === 'sus' && !extension) {
            // suspended 4 chord: raise the third by a half step
            thirdNoteNumber = (thirdNoteNumber + 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        }
    } else if (number === '2') {
        // handle sus2 chords
        if (quality === 'sus' && !extension) {
            // suspended 2 chord: lower the third by two half steps
            thirdNoteNumber = (thirdNoteNumber - 2) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        }
    }

    // handle chords such as Cm7b5
    if (eflat) {
        // flat: lower the fifth by a half step 
        if (eflatNumber === '5') {
            fifthNoteNumber = (fifthNoteNumber - 1) % OCTAVE_LENGTH || OCTAVE_LENGTH; 
        } 
    }

    // Add or modified the notes based on the ebass chord
    if (ebass) {
        // ebass chord: change the bass note to the ebass note
        ebassNoteNumber = notes[ebassRoot];
    }

    // Create a set of notes to return, starting with the root note
    const chordNotes = new Set();
    chordNotes.add(rootNoteNumber);
    if (thirdNoteNumber) chordNotes.add(thirdNoteNumber);
    if (fifthNoteNumber) chordNotes.add(fifthNoteNumber);
    if (sixthNoteNumber) chordNotes.add(sixthNoteNumber);
    if (seventhNoteNumber) chordNotes.add(seventhNoteNumber);
    if (ninthNoteNumber) chordNotes.add(ninthNoteNumber);
    // if (ebassNoteNumber) chordNotes.add(ebassNoteNumber);
    // Convert the note numbers back to note names
    const noteNames = [];
    chordNotes.forEach(noteNumber => {
        let nn = notes[noteNumber];
        // lazy all check 1: check if nn not in notes, return null
        if (nn === undefined) {
            error.msg = `Invalid note number: ${noteNumber}`;
            return null;
        }
        noteNames.push(nn); 
    });

    if (ebassNoteNumber) {
        let base = notes[ebassNoteNumber];
        if (base === undefined) {
            error.msg = `Invalid bass note number: ${ebassNoteNumber}`;
            return null;
        }
        return [noteNames, base];
    } 

    return [noteNames, null]; // if no bass note in slash chord
};

function buildSequencer(sheetMusic = EMPTY, pulseFlag = PULSE_FLAG) {

    // build a sequencer (synchronous function) given a string of sheet music, 
    // if return an array of 6 elements: pass (100%) 
    // if return undefined: fail (100%)
    // the passing result array is: [sequencer, loopBackIndex, repeatCount, end, forwardIndex, skipNumberIndex]
    // sequencer: a preprocessed chords progression ready to be played
    // loopBackIndex: where to go back for loop
    // repeatCount: how many times does it need to loop
    // end: does the sheet music have an end
    // forwardIndex: where to jump forward such as skip [1., go to [2.
    // skipNumberIndex: keep track of each [1. , [2. , [3. where to go back to
    // a sheetMusic is a string which can contain the following tokens or more seperated by spaces:
    // <No Time Signature>, 3/4, 4/4, 6/8, 2/4, 12/8, 5/4, 7/8, 9/8, 11/8, 13/8, 15/16, 7/4, 3/8, ...
    // |, ||, |:, :|, ||:, :||, /, ... 
    // [1., [2., [3., [4., ...
    // (2x), (3x), (4x),...
    // (loop), (intro), (verse), (chorus), (bridge), (outro), (sustain), (p), (mf), (f), (ff), (Allegro), (Moderato), (Adagio), ... 
    // % 

    // reshake _sheetMusic from previous run
    _sheetMusic = {};

    // check sheetMusic length
    if (sheetMusic.length > MAX_SHEET_LENGTH) {
        error.msg = `[SHEET MUSIC ERROR] sheet music length exceeds limit`;
        return;
    }

    var timeSignature = DEF_TIME_SIGNATURE; // default time signature

    // group basic tokens into sets to enforce syntax rules
    const openingTokens = new Set([BAR, REP_START, DBL_REP_START]);
    const closingTokens = new Set([DBL_BAR, DBL_REP_END]);
    const repeatTokens = new Set([REP_START, REP_END, DBL_REP_START, DBL_REP_END, BTB_REP, DBL_BTB_REP]);
    const seperateBarTokens = new Set([BAR]);
    const pulseBarTokens = new Set([BM]);
    const repeatPreviousBarTokens = new Set([BAR_REPEAT]);

    // create a set of all valid tokens to check against
    const validTokens = new Set([...openingTokens, ...closingTokens, ...repeatTokens, 
        ...seperateBarTokens, ...pulseBarTokens, ...repeatPreviousBarTokens]);

    // Next we split the sheetMusic string into tokens by spaces
    const tokens = sheetMusic.trim().split(/\s+/);
    const length = tokens.length;
    
    // Check the very last item in a sheetMusic, if the very last letter is not a bar, it is bad syntax
    if (length > 0 && !tokens[length-1].endsWith(BAR)) {
        error.msg = `[SHEET MUSIC ERROR] Last ending token must be | or :| or || or :||. Currently it is: ${tokens[length-1]}`;
        return;
    }

    // Now we begin to check the syntax of the sheetMusic
    var index = 0;

    // First is to check special control variables such as set tempo, set octave, etc are set
    let ctrlVars = [];
    let match;
    // this offset_beats variable keep tracks of how many ctrl_funcs are there, 
    // if there is a time signature or not to correctly count the opening beats later if having it
    let offset_beats = 0; 
    while (index < length && (match = tokens[index].match(CTRL_FUNCS))) {
        let func = match[1];
        let arg = match[3];
        // lazy check convention: add set before func and check if it is in the bass object
        // if in the bass object, push in ctrlVars array for invocation later
        // [!important] recheck if this is bound correctly to bass, not window or global
        let setFunc = 'set' + func;
        if (typeof this[setFunc] !== 'function') {
            error.msg = `[CONTROL VARS INFO] Pass by token at position ${index + 1}: "${tokens[index]}" - OK`;
            
            // check if this func and arg can be candidates for .bass object
            // for later saving it by user for submission
            if (BASSBOARD_DB_FIELD.has(func)) {
                arg = arg.split('_').join(' '); // replace all _ with one blank space
                func = func.toLowerCase(); // to make a properties for _sheetMusic
                _sheetMusic[func] = arg;
            } else if (func == 'URL') {   // for the case of URL (optional), arg should keep the same, no change
                func = func.toLowerCase();
                _sheetMusic[func] = arg;
            }
            
            index += 1;
            offset_beats += 1;
            continue;
        }

        // only this functions need to run here, the rest is after building the sequencer
        // because / can be included or not in the final result of the sequencer
        if (setFunc == 'setSustain') {    
            let status = this[setFunc](arg);  // [!important] recheck for bound of this, catching error when function invokes
            if (status !== undefined) {    // means status now hold the error obj returned
                return;
            }
            pulseFlag = PULSE_FLAG;        // must-have: reshake the default pulseFlag
        } else {
            ctrlVars.push([setFunc,arg]);     // push to stack for later check after building sequencer
        }

        index += 1;
        offset_beats += 1;
    }

    // Next is to check time signature
    [beats, beatType] = DEF_TIME_SIGNATURE.split('/').map(Number); // reset default time signature for beats calculation

    if (length > 0) { 
        const match = tokens[index].match(TIME_SIG);
        if (match) { 
            timeSignature = tokens[index];
            beats = parseInt(match[1],10);
            beatType = parseInt(match[2],10);
            index++;
            offset_beats += 1;
        } else {
            error.msg = `[TIME SIGNATURE WARNING] Time Signature token invalid at position ${index + 1}: "${tokens[index]}"`;
            error.msg = `Using default time signature instead: ${timeSignature}`;
        }
    } else {
        error.msg = `[SHEET MUSIC ERROR] Empty Sheet Music Error`;
        return;
    }

    // reset bpm once knowing time signature of the sheet music - reshaking tree
    BPM.val = BPM.val;

    var stack = [];                // Use stack to keep track of the opening and closing tokens for repeats and brackets
    var sequencer = [];            // This contains preprocessed tokens to be played
    var loopBackIndex = {};        // This will keep track of the index to loop back to for repeats
    var repeatCount = {};          // This will keep track of the number of repeats for each repeat section 
    var end = END;                 // by default, theres no end, the sheet music keeps playing from beginning
    var forwardIndex = {};         // opposite to loopBackIndex, keep track of the index to move forward for skipping section [1., [2., etc.
    var skipNumberIndex = {};      // to keep track of [1. will go to which index to start moving forward...
    var openingClassicalCount = 0; // keep track of number of beats in opening section to add up and see if follow classical rules

    // The very next token should be a bar line or a repeat start token, if not we treat it as an opening section
    if (!tokens[index] || !openingTokens.has(tokens[index])) {
        error.msg = `Expected a bar line or repeat start token after time signature, but found: "${tokens[index]}"`;
        error.msg = `Assuming opening sections exists`;
        while (index - offset_beats <= beats) { // these opening sections must be all chords, otherwise failed immediately, no need beatCount
            if (openingTokens.has(tokens[index])) { // normal opening
                break;
            }
            const chord = getChordNotes(tokens[index]);
            if (chord) {
                sequencer.push(chord); // which include both chord and base note in [];
                openingClassicalCount++ ; // only count openingClassical for opening chords
            } else {
                error.msg = `[OPENING ERROR 1] Invalid token at position ${index + 1}: "${tokens[index]}"`;
                return;
            }
            index++;   
        }
    }

    // start from beginning of the sequencer, 
    // default is loop 1 time if ever encouter :| or :|| later
    // if seeing |: or ||: loop from there, otherwise loop from the opening leading part
    if (tokens[index] == BAR) {
        stack.push([tokens[index], 0, DEF_REP_NUM]);
    } else if (tokens[index] == DBL_REP_START || tokens[index] == REP_START) {
        stack.push([tokens[index], sequencer.length, DEF_REP_NUM]);
    } else {
        error.msg = `[OPENING ERROR 2] Invalid token at position ${index + 1}: "${tokens[index]}"`;
        return;
    }
    index++;

    // Next we will loop through the tokens to the end and check if they are valid tokens
    var beatCount = 0; // Initialize beat count for the current bar
    var jump = DEF_BEAT_JUMP;

    // MAIN LOOP
    for (let i = index; i < length; i++) {

        // check if it is a proper bar with the correct number of beats
        // default beat jump is 1
        beatCount = beatCount + jump;
        // counting beat if more than the bar measure beat, it must be a bar token, otherwise it is the error
        if (beatCount > beats) {
            if (!seperateBarTokens.has(tokens[i]) && 
                !closingTokens.has(tokens[i]) && 
                !repeatTokens.has(tokens[i])) {
                    error.msg = `[Bar Beat Count Error 1] Invalid token at position ${i + 1}: "${tokens[i]}"`;
                    return;
            }
            beatCount = 0;
            // continue;  // let it fall through to catch other later tokens such as :| or :|| to deal with stack            
        } else { // if it is less than or equal number of bar measure beats, check any current token, if not bar token -> error, EXCEPT free ending || case
            if (i == length - 1) { 
                if (tokens[i] == DBL_BAR || tokens[i] == DBL_REP_END) { // it has repeat, must follow the classical rules for adding beats
                    let totalBeats = openingClassicalCount + beatCount - 1;
                    if (openingClassicalCount > 0 && CLASSICAL_CHECK && totalBeats !== beats) { // only check if theres opening
                        error.msg = `[CLASSICAL BEAT ERROR 1] Opening and Closing Bar Beat Count must add up to number of beats in time signature, currenly: ${totalBeats}. Required: ${beats}`;
                        return;
                    }
                } else { // it is not ending music at last 
                    if (openingClassicalCount > 0) { // but have opening, thats wrong
                        error.msg = `[CLASSICAL BEAT ERROR 2] There is no ending music but there is opening section`;
                        return;
                    } else if (seperateBarTokens.has(tokens[i]) || repeatTokens.has(tokens[i])) {
                        error.msg = `[Bar Beat Count Error 2] Invalid token at position ${i + 1}: "${tokens[i]}"`;
                        return;
                    } else {
                        error.msg = `<<< Bypass Classical Rule Check >>> for token at position ${i + 1}: "${tokens[i]}"`;
                    }
                }
            } else if (seperateBarTokens.has(tokens[i]) || 
                closingTokens.has(tokens[i]) || 
                repeatTokens.has(tokens[i])) {
                    error.msg = `[Bar Beat Count Error 3] Invalid token at position ${i + 1}: "${tokens[i]}"`;
                    return;
            }
        }

        // if it is a valid tokens, we will proceed solve each case for valid token
        if (validTokens.has(tokens[i])) {

            // if it is a pulse bar, we will add the previous chord to the sequencer 
            // as default pulseFlag is true, otherwise add it as it is BM 
            // so that later playback will not play the repeating chord.
            if (pulseBarTokens.has(tokens[i])) {    
                if (pulseFlag) {
                    let repeatChord = sequencer[sequencer.length - 1];
                    if (repeatChord) {
                        sequencer.push(repeatChord); // add the previous chord to the sequencer
                    } else {
                        error.msg = `No previous chord to repeat at position ${i + 1}: "${tokens[i]}"`;
                        sequencer.push(BM); // add this as a placeholder to indicate a pulse bar with no previous chord
                    }
                } else {
                    sequencer.push(BM); // add this as a placeholder to indicate a pulse bar so later playback will not play
                }
                continue;
            }

            // This is to handle the % token
            // It will add the previous bar to the sequencer based on the number of 'beats' in time signature
            // Only add if current sequencer length >= beats
            if (repeatPreviousBarTokens.has(tokens[i])) {
                // If previous and next token are not proper, quit immediately
                if (length < 3 || (!openingTokens.has(tokens[i-1]) && !closingTokens.has(tokens[i+1]))) {
                    error.msg = `[REPEAT PREVIOUS BAR ERROR] Invalid token at position ${i + 1}: "${tokens[i]}"`;
                    return;
                }
                if (sequencer.length >= beats) {
                    sequencer.push(...sequencer.slice(-beats));
                    beatCount = beats;  // adjust beatCount to exact number of beats in a bar
                    continue;
                } else {
                    error.msg = `Wrong beat count syntax, cannot repeat previous bar at position ${i + 1} with token: "${tokens[i]}"`;
                    return;
                }
            }

            // handle all tokens to seperate a bar
            // first, lets handle the most basic seperate bar token | , no repeat 
            if (seperateBarTokens.has(tokens[i])) {
                // push to stack and continue
                stack.push(BAR);
                continue;       
            }

            // handle repeat Tokens for bar loop
            if (repeatTokens.has(tokens[i])) {
                if (tokens[i] === REP_START || tokens[i] === DBL_REP_START) {
                    stack.push([tokens[i], sequencer.length, DEF_REP_NUM]); // means repeat from the next note added to sequencer
                    continue;    
                } else if (tokens[i] === REP_END) {  
                    let p;
                    let updateLoop = false;
                    while (stack.length) {  // REP_END must match REP_START or empty stack to go back beginning
                        p = stack.pop();
                        if (p === BAR) {
                            continue;
                        } else if (p[0] === REP_START || p[0] === BAR) { // p[0] === BAR for the case loop from beginning
                            loopBackIndex[sequencer.length - 1] = p[1];
                            repeatCount[sequencer.length - 1] = DEF_REP_NUM * p[2];
                            updateLoop = true;
                            break;
                        } else {
                            error.msg = `[Stack Error 1] contains wrong matching tokens ${p} for ${tokens[i]}`;
                            return;
                        }
                    }
                    if (!updateLoop) {
                        loopBackIndex[sequencer.length - 1] = 0; // loop back to beginning
                        repeatCount[sequencer.length - 1] = DEF_REP_NUM; // by default loop only 1 time 
                    }
                    continue
                } else if (tokens[i] === DBL_REP_END) {
                    let p;
                    let updateLoop = false;
                    while (stack.length) {  // DBL_REP_END must match DBL_REP_START or empty stack to go back beginning
                        p = stack.pop();
                        if (p === BAR) {
                            continue;
                        } else if (p[0] === DBL_REP_START || p[0] === BAR) {
                            loopBackIndex[sequencer.length - 1] = p[1];
                            repeatCount[sequencer.length - 1] = DEF_REP_NUM * p[2];
                            updateLoop = true;
                            break;
                        } else {
                            error.msg = `[Stack Error 2] contains wrong matching tokens ${p} for ${tokens[i]}`;
                            return;
                        }
                    }
                    if (!updateLoop) {
                        loopBackIndex[sequencer.length - 1] = 0; // loop back to beginning
                        repeatCount[sequencer.length - 1] = DEF_REP_NUM; // by default loop only 1 time
                    }
                    continue;

                } else if (tokens[i] === BTB_REP) {  // handle ':|:'
                    let p;
                    let updateLoop = false;
                    while (stack.length) {  // REP_END must match REP_START or empty stack to go back beginning
                        p = stack.pop();
                        if (p === BAR) {
                            continue;
                        } else if (p[0] === REP_START || p[0] === BAR) { // p[0] === BAR for the case loop from beginning
                            loopBackIndex[sequencer.length - 1] = p[1];
                            repeatCount[sequencer.length - 1] = DEF_REP_NUM * p[2];
                            updateLoop = true;
                            break;
                        } else {
                            error.msg = `[Stack Error 3] contains wrong matching tokens ${p} for ${tokens[i]}`;
                            return;
                        }
                    }
                    if (!updateLoop) {
                        loopBackIndex[sequencer.length - 1] = 0; // loop back to beginning
                        repeatCount[sequencer.length - 1] = DEF_REP_NUM; // by default loop only 1 time 
                    }
                    stack.push([REP_START, sequencer.length, DEF_REP_NUM]); // means repeat from the next note added to sequencer
                    continue;

                } else if (tokens[i] === DBL_BTB_REP) { // handle ':||:'
                    let p;
                    let updateLoop = false;
                    while (stack.length) {  // DBL_REP_END must match DBL_REP_START or empty stack to go back beginning
                        p = stack.pop();
                        if (p === BAR) {
                            continue;
                        } else if (p[0] === DBL_REP_START || p[0] === BAR) {
                            loopBackIndex[sequencer.length - 1] = p[1];
                            repeatCount[sequencer.length - 1] = DEF_REP_NUM * p[2];
                            updateLoop = true;
                            break;
                        } else {
                            error.msg = `[Stack Error 4] contains wrong matching tokens ${p} for ${tokens[i]}`;
                            return;
                        }
                    }
                    if (!updateLoop) {
                        loopBackIndex[sequencer.length - 1] = 0; // loop back to beginning
                        repeatCount[sequencer.length - 1] = DEF_REP_NUM; // by default loop only 1 time
                    }
                    stack.push([DBL_REP_START, sequencer.length, DEF_REP_NUM]); // means repeat from the next note added to sequencer
                    continue;
                }
            }


        } else { 
            
            // can it be a repeat number tokens like (2x), (3x), (4x),...?
            const match_rep_num = tokens[i].match(REP_NUM);
            if (match_rep_num) {
                // first adjust beat count, doesn't count as a beat count
                beatCount = beatCount - jump;
                
                let p = stack.pop();
                // if it is a match means previous token should be |: or ||: or | only if it starts from begining
                // check by using top stack item length should be 3 elements
                if (length >= 2 && tokens[i-1] !== REP_START && tokens[i-1] !== DBL_REP_START && p && p.length !== 3) {
                    error.msg = `[REPEAT NUMBER ERROR] Invalid token at position ${i + 1}: "${tokens[i]}"`;
                    return;
                }

                const num = Number(match_rep_num[1]);    
                p[2] = num - 1; // number of repeat such as 4 in 4x
                stack.push(p); // push back to the stack with updated number of reps
                continue;
            }

            // can it be a skip number token like [1. , [2. , [3. ... ?
            const match_skip_num = tokens[i].match(SKIP_NUM);
            if (match_skip_num) {
                // similar to above: adjust beat count, doesn't count as a beat count
                beatCount = beatCount - jump;
                const current_skip_number = Number(match_skip_num[1]); // regex extraction
                if (current_skip_number < LST_SKIPNUM) {
                    error.msg = `[SKIP NUMBER ERROR 1] Invalid token at position ${i + 1}: "${tokens[i]}"`;
                    return;
                } else if (current_skip_number == LST_SKIPNUM) {
                    skipNumberIndex[current_skip_number] = sequencer.length - 1; // go back to the previous playable chord  
                } else {
                    let prev_num = current_skip_number - 1;
                    if (!(prev_num in skipNumberIndex)) {  // must have a sequential number right before this current number
                        error.msg = `[SKIP NUMBER ERROR 2] Invalid token at position ${i + 1}: "${tokens[i]}"`;
                        return;
                    }
                    // saving forwardIndex to an array as it can possibly jump to [2. or [3. or [4. 
                    forwardIndex[skipNumberIndex[prev_num]] = forwardIndex[skipNumberIndex[prev_num]] ? [sequencer.length,...forwardIndex[skipNumberIndex[prev_num]]] : [sequencer.length];
                    skipNumberIndex[current_skip_number] = skipNumberIndex[prev_num]; // solving case [3. : will make [1. jump directly there [3.
                }
                continue;
            }

            // can it be an auxiliary token?
            const match_aux = tokens[i].match(AUX);
            if (match_aux) {
                // doesn't count it as beat count
                beatCount = beatCount - jump;
                error.msg = `Found an auxiliary token: "${tokens[i]}"`;
                continue;
            }

            // if not valid token, can it be a chord?
            const chord = getChordNotes(tokens[i]);
            if (chord) {
                sequencer.push(chord); // which include both chord and base note in []
                continue;
            }   

            // otherwise, very invalid token
            error.msg = `[CHORD ERROR] Invalid token at position ${i + 1}: "${tokens[i]}"`;
            return;
        }        

    
    } // end of MAIN LOOP

    // Check the very last token to see if there is an end
    if (length > 0 ) {
        te = tokens[length - 1];
        if (te.slice(-2) === DBL_BAR) {
            end = true;        
        }    
    }

    // If there is no opening but wrong beatCount in last bar, it violates classical rule check
    error.msg = `Opening classical count (if any): ${openingClassicalCount}`;
    error.msg = `Current last beat count: ${beatCount}`;
    if (CLASSICAL_CHECK && !openingClassicalCount && beatCount != 0) {
        error.msg = `[CLASSICAL BEAT ERROR 3] There is no opening beats or ending number of beats in the last bar is not correct`;
        return;
    }

    // Special Notations: Invoke functions right after parsing to catch early errors
    // If these functions require access to sheetMusic which is correct syntax at this point,
    // they can access it via private variable _sheetMusic
    _sheetMusic.content = sheetMusic;
    for (let [func, arg] of ctrlVars) {
        if (this[func].constructor.name === 'AsyncFunction') {
            error.msg = `func ${func} is an async function. Will be invoke with async function style`;
            let result = this[func](arg);  // [!important] recheck for bound of this
            result.then((data) => {
                if (data) {  // means a customized error message has been returned back from setSaveAs
                    oops(`[Async] [Func Arg Error] ${data}`,'warning');
                } 
            }).catch((exp) => {
                oops(`[Async] [Func Arg Exception] ${exp}`, 'warning');
            });
        } else {
            error.msg = `func ${func} is a regular synchronous function. Will be invoked like regular function`;
            let result = this[func](arg);  // [!important] recheck for bound of this
            if (result !== undefined) {    // means result now hold the error obj returned.
                error.msg = result.err;
                return;                    // undefined sequencer
            } 
        }
    }

    const result = [sequencer, loopBackIndex, repeatCount, end, forwardIndex, skipNumberIndex];
    validArgs.add(result); // other functions can use this to check their arguments validity

    return result; 
}

/* ||||||||||||||||||||||||||||||||| addons implementations  |||||||||||||||||||||||||||||||||||||||||| */

/* ||| external dependencies ||| */

function _freq(note, octave = DEF_OCTAVE) {
    const a4 = 440;
    const semisFromA4 = (octave - 4) * 12 + (notes[note] - 1) - 9;
    return a4 * Math.pow(2, semisFromA4/12);
}

function playChord(chord = FAKE, octave = DEF_OCTAVE, duration = DEF_DURATION) {
    //error.msg = `invoke playChord() with chord = ${chord}, octave = ${octave}, duration = ${duration} means ${duration} beats per second`;
    const notes = getChordNotes(chord);
    _playSequencerChord(notes, octave, duration);
}

function playNote(note = FAKE, octave = DEF_OCTAVE, duration=DEF_DURATION, volume=MAX_VOL) {
// play a note in certain octave for duration in seconds
// by default, not silence
// otherwise, the note will be played with no sound
// [!important: When using inside the sequencer, make duration becomes 0]
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle'; 
  osc.frequency.value = _freq(note, octave);

  osc.connect(gain);
  gain.connect(masterGain);

  const now = audioCtx.currentTime || 0;
  const attackTime = 0.01;
  const minimumVolume = 0.0001; 
  const attackVolume = volume;
  const sustainVolume = (volume > 0.3) ? 0.7 : minimumVolume;  

  gain.gain.value = minimumVolume;
  gain.gain.exponentialRampToValueAtTime(attackVolume, now + attackTime);
  gain.gain.setValueAtTime(sustainVolume, now + (duration || 0.01));
  gain.gain.exponentialRampToValueAtTime(minimumVolume, now + duration + 0.8);

  osc.start(now);
  osc.stop(now + duration + 0.9);

  return {osc, gain};
}

function _delay(ms = DEF_MSEC, signal) {
// _delay in milliseconds
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort);
  });
}

function _playSequencerChord(sequencerChord = BM, octave = DEF_OCTAVE, duration = DEF_DURATION) {
    if (sequencerChord != BM) {
        // error.msg = `Currently playing a sequencer chord: ${JSON.stringify(sequencerChord)}`;
        if (sequencerChord[1]) {
            playNote(sequencerChord[1], octave - 1, duration);
        }
        sequencerChord[0].forEach(note => {
            playNote(note, octave, duration); 
        });
    } else {  
        playNote(FAKE,MIN_OCTAVE,duration,0.001);
    }
}

async function _saveSheetMusicToBASS() {
// return undefined (promise) : pass
// return problem (promise) : maybe fail

  // 1. Validation Logic
  if (Object.keys(_sheetMusic).length === 0 && _sheetMusic.constructor === Object) { 
    const problem = "[SaveAs ERROR] No sheetMusic found when saving sheet music to .bass";
    return problem;
  }

  for (const field of BASSBOARD_DB_FIELD) {
    const lc_field = field.toLowerCase();
    if (!(lc_field in _sheetMusic)) {
        const problem = `[SaveAs ERROR] To save to .bass, you must use control phrase ${field}: (URL: is optional)`;
        return problem;
    }
  }

  const jsonString = JSON.stringify(_sheetMusic, null, 2);

  // 2. Use File System Access API for "Save As" Dialog
  try {
    const options = {
      suggestedName: `${_sheetMusic.title}_by_${_sheetMusic.contributor}.bass`,
      types: [{
        description: 'BASS Music File',
        accept: {
          'application/json': ['.bass'] // Forces or suggests the .bass extension
        }
      }]
    };

    // This triggers the native browser "Save As" dialog box
    const handle = await window.showSaveFilePicker(options);
    
    // Write the JSON text string directly to the selected file
    const writable = await handle.createWritable();
    await writable.write(jsonString);
    await writable.close();

    return;

  } catch (err) {

    // Handle user cancellation or browser denial gracefully
    if (err.name === 'AbortError') {
      const problem = "Save operation was cancelled by the user.";
      return problem;
    } else {
      const problem = `[SaveAs ERROR] ${err.message}`;
      return problem;
    }
    const problem = `there is an exception when invoking _saveSheetMusicToBASS: ${err}`;
    return problem;

  }
}

async function _saveSheetMusicToPDF() {
// return undefined (promise) : pass
// return problem (promise) : maybe fail

    // [!important] the following line 0ms is to wait till main thread is completely finished
    // so it will not block main UI thread
    // also, it will stop Dev Tools warning trigger such as  
    // violation: [Violation] 'click' handler took ...
    await new Promise(resolve => setTimeout(resolve, 0));

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;

    // 1. Create and append the style element
    const style = doc.createElement('style');
    style.textContent = `
        body, pre {
            font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
        }
        @media print {
            body, pre {
                font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
                -webkit-print-color-adjust: exact;
            }
        }
    `;
    doc.head.appendChild(style);

    // 2. Create the pre element and safely assign text
    const pre = doc.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.textContent = _sheetMusic.content; // Automatically escapes HTML/XSS

    doc.body.appendChild(pre);

    // removed
    // Listen for the print sequence finishing
    iframe.contentWindow.addEventListener('afterprint', () => {
        document.body.removeChild(iframe);    
    });

    // Trigger print
    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    // Fallback: Remove after 1 minute if 'afterprint' doesn't fire
    setTimeout(() => {
        if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
        }
    }, 60000);

}

function _createOopsContainer() {
    const container = document.createElement('div');
    container.id = 'oopsContainer';
    container.className = 'oops-container';
    document.body.appendChild(container);
    return container;
}

async function playSequencer(sequencerObj) {
// this function will play the sequencer after built
// return undefined (promise) : pass
// return problem (promise) : maybe fail 

  // create a default sequencer
  var sequencer=SMP_SEQUENCER;
  var loopBackIndex={};
  var repeatCount={};
  var end=END;
  var forwardIndex={};
  var skipNumberIndex={};

  if (validArgs.has(sequencerObj)) {
    [sequencer,loopBackIndex,repeatCount,end=END,forwardIndex,skipNumberIndex] = sequencerObj;
    validArgs.delete(sequencerObj); // make sure to remove it so the next run requires to run buildSequencer() again
    const problem = `Sequencer object will be removed from WeakSet right after playing`;
    if (FULL_ASYNC_DEBUG_MODE) oops(problem, 'info'); 
  } else {
    const problem = `[SEQUENCER WARNING] Must run buildSequencer() first before feeding result to playSequencer(). Using default sequencer: ${JSON.stringify(SMP_SEQUENCER)} with tempo: ${BPM.val} bpm`;
    oops(problem, 'warning');
  }

  // Clean up any previous running instance
  if (taskDropper) taskDropper.abort();
  taskDropper = new AbortController();
  const { signal } = taskDropper;
  
  // Now it is ready to play the sheet music
  let i = 0; // to loop through each item in sequencer
  let n = sequencer.length;
  let heuristic_lowest_number_index = -1;
  if (LST_SKIPNUM in skipNumberIndex) heuristic_lowest_number_index = skipNumberIndex[LST_SKIPNUM];

  try {

    playNote(FAKE,0,1,0.001);
    await _delay(DEF_MSEC, signal); 

    while (!signal.aborted) { 
      i = 0;
      let tempRepeatCount = JSON.parse(JSON.stringify(repeatCount));
      let tempForwardIndex = JSON.parse(JSON.stringify(forwardIndex));
      let skipFlag = false; // only skip and move forward if repeatCount is 0
      while (i < n) {
        if (signal.aborted) break;
        _playSequencerChord(sequencer[i], DEF_OCTAVE, 0); // For sequencer: Play each chord with a duration 0
        await _delay(DEF_MSEC, signal); // This throws instantly if stop is clicked
        if (skipFlag && i in forwardIndex) {   // move forward
            i = forwardIndex[i].pop(); // move forward such as skip [1. and move to [2. or move to [3.
            skipFlag = false;
        } else if (i in loopBackIndex && repeatCount[i] > 0) {  
          repeatCount[i]--;
          if (repeatCount[i] == 0 &&  i > heuristic_lowest_number_index) {  // only skip and move forward if current position is standing more than where [1. or [2. point to
            skipFlag = true;
          } else {
            skipFlag = false;
          }
          i = loopBackIndex[i];  // loop back
        } else {  // everything else
          i++;
        }
      }
      // end when seeing || at the end
      if (end && (!(n-1 in repeatCount) || repeatCount[n-1] == 0)) {
        stopSequencer();  // end music when seeing ||   
      }
      // by default ready to loop from beginning again if theres no || at the end of sheet music
      repeatCount = tempRepeatCount; 
      forwardIndex = tempForwardIndex;
    }
  } catch (exp) {
    if (exp.name === "AbortError") {
      const problem = `Async sequence canceled instantly during _delay.`;
      return problem;
    } else {
      const problem = `[Exception] ${exp}`;
      return problem;
    }
  }

  return;
}

async function setSaveAs(option) {
// this function will save sheet music into a specified option format 
// currently supporting option : pdf or bass file.
// return undefined (promise) : pass
// return   problem (promise) : maybe fail

    if (!SAVE_AS_TYPES.has(option)) {
        const problem =`[SaveAs ERROR] Control phrase SaveAs: must be followed by one of the following terms: ${[...SAVE_AS_TYPES]}`;
        return problem;
    }

    if (typeof(global) !== "object" || global !== window) {
        const problem = `[SaveAs ERROR] Print function is currently supported in browser environment only`;
        return problem;
    }

    if (option == "PDF") {             // save as pdf
        let result = await _saveSheetMusicToPDF();
        return result;                 // undefined or customized error message from async function
    } else if (option == "BASS") {     // save as .bass
        let result = await _saveSheetMusicToBASS(); 
        return result;                 // undefined or customized error message from async function
    } 
    
    // save as other format not supported
    const problem = `This SaveAs format is not supported : ${option}`;
    return problem;
}

function getInstrument() {
    return instrument;
}

function setInstrument(inst) {
// change default instrument
// fail returns error
// success returns undefined

    let lc_inst = inst.toLowerCase();
    if (!DEF_SUPPORT_INST.has(lc_inst)) {
        error.msg = `[Set Instrument Error] Currently not support ${inst} instrument`;
        return error;
    }
}

function oops(message, type = 'info') {
// oops shows a message on browser screen
// info, warning, error, etc.
// dependent on the window and document object
// also a piece of css needed to be loaded for formatting
// this function is very helpful to print out message returned
// from an async function so that we don't have to rely on the 
// error.msg synchronous global var (which may cause race condition)
// the fall back should be alert, only used when very neccessary

    if (typeof(global) !== "object" || global !== window) {
        const problem = `[Oops ERROR] Oops function is currently supported in browser environment only`;
        error.msg = problem;
        alert(problem);
        return error;
    }

    const oopsContainer = document.getElementById('oopsContainer') || _createOopsContainer();
    
    const oopsEl = document.createElement('div');
    oopsEl.className = `oops oops-${type}`;
    oopsEl.textContent = message;
    
    oopsContainer.appendChild(oopsEl);
    
    setTimeout(() => {
        oopsEl.classList.add('oops-show');
    }, 10);
    
    setTimeout(() => {
        oopsEl.classList.remove('oops-show');
        setTimeout(() => oopsEl.remove(), 300);
    }, 3000);
}

/* ||| end external dependencies ||| */

function stopSequencer() {
// stop playing sequencer  
  if (taskDropper) {
    taskDropper.abort(); // Instantly cancels the active _delay() promise
  }
}

function setTempo(bpm) {
    let convert;
    try {
        convert = Number(bpm);
        if (Number.isNaN(convert)) {
            throw new Error(`"${bpm}" cannot be converted to a valid number.`);
        }
    } catch (err) {
        error.msg = `[SET TEMPO ERROR] Conversion failed: ${err.message}`; 
        return error; 
    }
    if (!Number.isInteger(convert) || convert < MIN_TEMPO || convert > MAX_TEMPO) {
        error.msg = `[TEMPO ERROR] Tempo (BPM) must be an integer in the range of ${MIN_TEMPO} and ${MAX_TEMPO}`;
        return error;
    }
    BPM.val = convert;
}

function setOctave(oct) {
    let convert;
    try {
        convert = Number(oct);
        if (Number.isNaN(convert)) {
            throw new Error(`"${oct}" cannot be converted to a valid number.`);
        }
    } catch (err) {
        error.msg = `[SET OCTAVE ERROR] Conversion failed: ${err.message}`; 
        return error; 
    }
    if (!Number.isInteger(convert) || convert < MIN_OCTAVE || convert > MAX_OCTAVE) {
        error.msg = `[SET OCTAVE ERROR] Default octave must be a number in the range of ${MIN_OCTAVE} and ${MAX_OCTAVE}. `;
        return error;
    }
    DEF_OCTAVE = convert;
}

function getOctave() {
    return DEF_OCTAVE;
}

function getTempo() {
// return bpm
    return BPM.val;
}

function getSampleTestCase() {
    return SMP_TESTCASE;
}

function getMaxSheetLength() {
    return MAX_SHEET_LENGTH;
}

function setSustain(d) {
// sustain a chord means no pulse
// not sustain means has pulse
    if (d == "Yes") {
        PULSE_FLAG = false; // when sustain is set
    } else if (d == "No") {
        PULSE_FLAG = true; // when sustain is set
    } else {
        error.msg=`[SUSTAIN ERROR] To sustain BM / character, must use control phrase Sustain:Yes or Sustain:No`;
        return error;
    }
}

function getSustain() {
    return PULSE_FLAG;
}

function getDuration() {
    return DEF_DURATION;
}

function getGuitarNote(st = 6, fret = 0) {
// This function return one single note from a guitar and an offset octave for playback
// given a fret number and a string number. for example getGuitarNote(5,3) = 'C',1
// means play 'C' in the next octave of current st note is in
// A standard guitar has 6 string from 6 to 1 (lower E to higher E - 2 octaves)
// The number of frets on a guitar varies
// One fret to the next is 1 half step similar in a piano scale
// This function only returns the note, it does not specify how high the pitch
// will be, dependent on how high the fret is set
// by default is open (free) fret, and string 6 is lowest bass E in a guitar
// return error object if there is an error
// otherwise pass return the correct note in a standard piano major scale
// assume min and max number of frets are below

    const MIN_FRETS = 0;
    const MAX_FRETS = 38; 

    if (typeof fret !== 'number' || !Number.isInteger(fret) || fret < MIN_FRETS || fret > MAX_FRETS ||
        typeof st !== 'number' || !Number.isInteger(st) || st < 1 || st > 6  
    ) {
        error.msg = `[getGuitarNote Error] parameters error, fret = ${fret}, st = ${st}`;
        return error;
    }
    var lookup_note;
    switch (st) {
    case 6:
        lookup_note = notes['E'];   // lower E
        break;
    case 5:
        lookup_note = notes['A'];
        break;
    case 4:
        lookup_note = notes['D'];
        break;
    case 3:
        lookup_note = notes['G'];
        break;
    case 2:
        lookup_note = notes['B'];
        break;
    case 1:
        lookup_note = notes['E'];   // higher E but no problem
        break;
    default:
        error.msg = `lookup_note failed in getGuitarNotes`;
        return error;
    }
    var calculated_lookup_note = (lookup_note + fret) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    var octave_offset = 0;
    // check if calculated_lookup_note if lower precedency compared to lookup_note
    // it should be play in the next octave or octave_offset will be 1
    if (calculated_lookup_note < lookup_note) {
        octave_offset += 1;
    }
    error.msg = `[TUNING A GUITAR][CURRENT OCTAVE: ${DEF_OCTAVE}], Playing: ${notes[calculated_lookup_note]}, should play in: ${octave_offset} octave higher!`;
    return [notes[calculated_lookup_note], octave_offset];
}

function getFullAsyncDebugMode() {
    return FULL_ASYNC_DEBUG_MODE;
}

function getVersion() {
    return VERSION;    
}

})(typeof window !== "undefined" ? window : this);