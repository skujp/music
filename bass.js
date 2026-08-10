(function(global) {
const VERSION = "5.3.2";                                                 
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
var DEBUG_MODE = false;                                                   
var FULL_ASYNC_DEBUG_MODE = false;                                        
var DEF_INST = "piano";
var DEF_SUPPORT_INST = new Set([DEF_INST, "drum", "guitar", "flute"]);
var instrument = DEF_INST; 
var audioCtx = null; 
var masterGain = null; 
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
bind(TheBass, {rename, setDebug, help, getErrorMsg, getChordNotes, buildSequencer});  
bind(TheBass, {setFullAsyncDebug, getFullAsyncDebugMode, oops, 
                   playNote, playChord, playSequencer, stopSequencer, 
                   setTempo, setOctave, getOctave, getTempo, 
                   getSampleTestCase, getMaxSheetLength,
                   setSaveAs, setSustain, getSustain, 
                   getInstrument, setInstrument,
                   getDuration, getGuitarNote, getVersion 
              });    
const BPM = {                                                           
    _val: 90,                                                           
    get val() {
        return this._val;
    },
    set val(v) {
        this._val = v;
        DEF_DURATION = 60 / this._val * (beats / beatType);
        DEF_MSEC = DEF_DURATION * 1000;
        error.msg = `reshaking for time signature ${beats}/${beatType} : one note now lasts ${DEF_DURATION} seconds`;
    }
}
const BAR = "|";
const DBL_BAR = "||";
const REP_START = "|:";
const REP_END = ":|";
const DBL_REP_START = "||:";
const DBL_REP_END = ":||";
const BAR_REPEAT = "%";
const BM = "/";                                                         
const REP_NUM = /\((\d+)x\)/;                                           
const BTB_REP = ":|:";                                                  
const DBL_BTB_REP = ":||:";                                             
const SKIP_NUM = /\[(\d+)\./;                                           
const TIME_SIG = /^(\d+)\/(1|2|4|8|16|32|64|128|256|512|1024)$/;        
const AUX = /^\(([^)]+)\)$/;                                            
var MAX_SHEET_LENGTH = 3000;                                            
var FAKE = "G";                                                         
var DEF_OCTAVE = 4;                                                     
var STACKATO_LEGATO = 0.0001;                                           
var MIN_OCTAVE = 0;                                                     
var MAX_OCTAVE = 8;                                                     
var MIN_TEMPO  = 30;                                                    
var MAX_TEMPO  = 300;                                                   
var MIN_VOL = 0.0001;                                                   
var MAX_VOL = 1;                                                        
var PULSE_FLAG = true;                                                  
var END = false;                                                        
var SMP_SEQUENCER = [[['F','A','C'],'C'],[['A','C','E'],'E']];          
var DEF_REP_NUM = 1;                                                    
var DEF_TIME_SIGNATURE = '4/4';                                         
var DEF_BEAT_JUMP = 1;                                                  
var CLASSICAL_CHECK = true;                                             
var LST_SKIPNUM = 1;                                                    
var OCTAVE_LENGTH = 12;                                                 
var EMPTY = "";                                                         
var [beats, beatType] = DEF_TIME_SIGNATURE.split('/').map(Number);      
var DEF_DURATION = 60 / BPM.val;                                        
var DEF_MSEC = DEF_DURATION * 1000;                                     
var SMP_TESTCASE = "Title:Rhythmeus\nComposer:Chordius\nPerformer:⌨Qwerty\n\n3/4 |: F7 / G | % | [1. G D G/D :| [2. Bmaj7 Aaug Fdim ||";      
var SAVE_AS_TYPES = new Set(["PDF","BASS"]);                            
var BASSBOARD_DB_FIELD = new Set(["Contributor","Title"]);              
var CTRL_FUNCS = /^(Title|Contributor|Artist|Composer|Arranger|Singer|Writer|Author|Musician|Song|Performer|Cover|Remix|Original|Genre|Tempo|Octave|SaveAs|Sustain|URL|Misc|Derivative)(:)(.+)$/;
var taskDropper = null;                                                 
var validArgs = new WeakSet();                                          
var _sheetMusic;                                                        
var notes = _initMusicMajorScale();                                     
function _initMusicMajorScale() {
    const baseNotes = {1: 'C', 2: 'C#', 3: 'D', 4: 'D#', 5: 'E', 6: 'F', 7: 'F#', 8: 'G', 9: 'G#', 10: 'A', 11: 'A#', 12: 'B'};
    const notes = { ...baseNotes };
    for (const [key, value] of Object.entries(baseNotes)) {
        notes[value] = Number(key);
    }
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
    manual += "For a piano common musical scale, it can be written as:" + "\n";
    manual += "C, C#, Db, D, D#, Eb, E, F, F#, Gb, G, G#, Ab, A, A#, Bb, B." + "\n";
    manual += "" + "\n";
    manual += "2. Chord" + "\n";
    manual += "A chord is a group of three or more notes played at the same time." + "\n";
    manual += "For example, chord C (C major) consists of C,E,G. " + "\n";
    manual += "chord C/E (C major / bass E) consists of C,E,G with a bass note E. " + "\n";
    manual += "Currently, the BASS system supports the following chord type notations: " + "\n";
    manual += "C (C Major), Cm (C Minor), Caug (C Augmented), Cdim (C Diminished), " + "\n";
    manual += "Cmaj7 (C Major 7), C7 (C Dominant 7), Cm7 (C Minor 7), " + "\n";
    manual += "Cmmaj7 (C Minor-Major 7), Cm7b5 (C Half-Diminished)," + "\n";
    manual += "C7b5 (C Dominant-seventh flat five), Cdim7 (C Fully Diminished)," + "\n";
    manual += "Csus2 (C Suspended 2), Csus4 (C Suspended 4), Cadd9 (C Add 9), " + "\n";
    manual += "C5 (C Power Chord), Cmaj9 (C Major 9), C6 (C Major 6), C9 (C 9), " + "\n";
    manual += "C/E (C with E in the bass), Cmaug (C Minor Augmented)." + "\n";
    manual += "" + "\n";
    manual += "3. Sheet Music" + "\n";
    manual += "A sheet music is a written or printed guide for musicians." + "\n";
    manual += "In the BASS system, a chord (NOT note) is the basic unit of a sheet music." + "\n";
    manual += "For example, 4/4 | C C C C || means " + "\n";
    manual += "to play chord C Major four times (NOT single C note four times)." + "\n";
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
    manual += "playing the sheet music. In the BASS system, by default bpm is set to 90, " + "\n";
    manual += "assuming quarter note is in time signature. " + "\n";
    manual += "The user can change it manually. See section IV for more details." + "\n";
    manual += "" + "\n";
    manual += "12. Octave" + "\n";
    manual += "An octave is the distance between two musical notes that share the " + "\n";
    manual += "same name (like two different C notes). " + "\n";
    manual += "It is exactly eight steps apart on a common musical scale." + "\n";
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
    manual += "15. Duplicate %" + "\n";
    manual += "A duplicate % means repeat playing the previous bar." + "\n";
    manual += "For example, | A B C | % || will play A, B, C, A, B, C" + "\n";
    manual += "" + "\n";
    manual += "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n";
    manual += "" + "\n";
    manual += "III. THE CHORD-BASED NOTATION SYSTEM" + "\n";
    manual += "" + "\n";
    manual += "Time Signature:" + "\n";
    manual += "3/4 4/4 6/8 2/2 2/4 12/8 5/4 7/8 9/8 11/8 13/8 15/16 7/4 3/8 ..." + "\n";
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
    manual += "(1x) (2x) (3x) (4x) (5x) ..." + "\n";
    manual += "" + "\n";
    manual += "Skip:" + "\n";
    manual += "[1. [2. [3. [4. ..." + "\n";
    manual += "" + "\n";
    manual += "Pulse:" + "\n";
    manual += "/" + "\n";
    manual += "" + "\n";
    manual += "Duplicate:" + "\n";
    manual += "%" + "\n";
    manual += "" + "\n";
    manual += "Chord:" + "\n";
    manual += "m aug dim maj7 7 m7 mmaj7 m7b5 7b5 dim7 sus sus2 sus4 add9 5 maj9 6 9 / maug" + "\n";
    manual += "" + "\n";
    manual += "Metadata:" + "\n";
    manual += "(intro) (verse) (chorus) (bridge) (outro) (sustain) (p) (mf) (f) (ff) " + "\n";
    manual += "(Allegro) (Moderato) (Adagio) (Lyrics can go here too) ..." + "\n";
    manual += "" + "\n";
    manual += "Remark:   " + "\n";
    manual += "... means et cetera" + "\n";
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
    manual += "Also, any value after the double dot character (:) can not have any blank space." + "\n";
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
    manual += "Musician:<name>         for example, Musician:BeatBox" + "\n";
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
    manual += "Users can save to .bass file and send it to this email: bassthemusic101 |at| gmail |dot| com" + "\n";
    manual += "Certain phrases are required in order to save to .bass file such as Title:, Contributor:, or URL:" + "\n";
    manual += "(see section IV)." + "\n";
    manual += "Note, any music (chords, rhythms, melody) is allowed, but lyrics and URLs will be checked for explicit content prior to posting." + "\n";
    manual += "" + "\n";
    manual += "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n";
    manual += "" + "\n";
    manual += "VI. QWERTY KEYBOARD" + "\n";
    manual += "" + "\n";
    manual += "Piano notes are mapped to the qwerty row, and number row of a common computer keyboard. For example: q,w,e,r,t,2,3..." + "\n";
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
    manual += "The BASS source code is below. The library file is bass.js" + "\n";
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
    const chordRegex = /^([A-G])(#|b)?(m|maj|min|dim|aug|sus|maug)?(add|maj)?(\d*)?((b)(\d+))?(\/([A-G])(#|b)?)?\s*$/;
    chord = chord.trim();
    const match = chord.match(chordRegex);
    if (!match) {
        error.msg = `Invalid chord: ${chord}`;
        return; 
    }
    const root = match[1] + (match[2] || ''); 
    const quality = match[3] || '';
    const extension = match[4] || '';
    const number = match[5] || '';
    const eflat = match[6] || '';
    const eflatNumber = match[8] || '';
    const ebass = match[9] || '';
    const ebassRoot = (match[10] + (match[11] || '')) || '';
    var rootNoteNumber = notes[root];
    if (rootNoteNumber === undefined) {
        error.msg = `Invalid root for the chord: ${chord}`;
        return null; 
    }
    var thirdNoteNumber = (rootNoteNumber + 4) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    var fifthNoteNumber = (rootNoteNumber + 7) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    var sixthNoteNumber = null;
    var seventhNoteNumber = null;
    var ninthNoteNumber = null;
    var ebassNoteNumber = null;
    if (quality === 'm' || quality === 'min') {
        thirdNoteNumber = (thirdNoteNumber - 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    } else if (quality === 'dim') {
        thirdNoteNumber = (thirdNoteNumber - 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        fifthNoteNumber = (fifthNoteNumber - 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    } else if (quality === 'aug') {
        fifthNoteNumber = (fifthNoteNumber + 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    } else if (quality === 'maug') {
        thirdNoteNumber = (thirdNoteNumber - 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        fifthNoteNumber = (fifthNoteNumber + 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    }
    if (number === '6') {
        sixthNoteNumber = (rootNoteNumber + 9) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    } else if (number === '7') {
        if (extension === 'maj' || quality === 'maj') { 
            seventhNoteNumber = (rootNoteNumber + 11) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        } else {
            seventhNoteNumber = (rootNoteNumber + 10) % OCTAVE_LENGTH || OCTAVE_LENGTH;
            if (quality === 'dim') {
                seventhNoteNumber = (seventhNoteNumber - 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
            }
        }
    } else if (number === '9') {
        if (extension === 'add') {
            ninthNoteNumber = (rootNoteNumber + 14) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        } else if (extension === 'maj' || quality === 'maj') {
            seventhNoteNumber = (rootNoteNumber + 11) % OCTAVE_LENGTH || OCTAVE_LENGTH;
            ninthNoteNumber = (rootNoteNumber + 14) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        } else {
            seventhNoteNumber = (rootNoteNumber + 10) % OCTAVE_LENGTH || OCTAVE_LENGTH;
            ninthNoteNumber = (rootNoteNumber + 14) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        }
    } else if (number === '5') {
        if (!eflat) {
            thirdNoteNumber = null;
        }
    } else if (number === '4') {
        if (quality === 'sus' && !extension) {
            thirdNoteNumber = (thirdNoteNumber + 1) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        }
    } else if (number === '2') {
        if (quality === 'sus' && !extension) {
            thirdNoteNumber = (thirdNoteNumber - 2) % OCTAVE_LENGTH || OCTAVE_LENGTH;
        }
    }
    if (eflat) {
        if (eflatNumber === '5') {
            fifthNoteNumber = (fifthNoteNumber - 1) % OCTAVE_LENGTH || OCTAVE_LENGTH; 
        } 
    }
    if (ebass) {
        ebassNoteNumber = notes[ebassRoot];
    }
    const chordNotes = new Set();
    chordNotes.add(rootNoteNumber);
    if (thirdNoteNumber) chordNotes.add(thirdNoteNumber);
    if (fifthNoteNumber) chordNotes.add(fifthNoteNumber);
    if (sixthNoteNumber) chordNotes.add(sixthNoteNumber);
    if (seventhNoteNumber) chordNotes.add(seventhNoteNumber);
    if (ninthNoteNumber) chordNotes.add(ninthNoteNumber);
    const noteNames = [];
    for (let noteNumber of chordNotes) {
        let nn = notes[noteNumber];
        if (nn === undefined) {
            error.msg = `Invalid note number: ${noteNumber}`;
            return null; 
        }
        noteNames.push(nn);
    }
    if (ebassNoteNumber) {
        let base = notes[ebassNoteNumber];
        if (base === undefined) {
            error.msg = `Invalid bass note number: ${ebassNoteNumber}`;
            return null;
        }
        return [noteNames, base];
    } 
    return [noteNames, null]; 
};
function buildSequencer(sheetMusic = EMPTY, pulseFlag = PULSE_FLAG) {
    _sheetMusic = {};
    if (sheetMusic.length > MAX_SHEET_LENGTH) {
        error.msg = `[SHEET MUSIC ERROR] sheet music length exceeds limit`;
        return;
    }
    var timeSignature = DEF_TIME_SIGNATURE; 
    const openingTokens = new Set([BAR, REP_START, DBL_REP_START]);
    const closingTokens = new Set([DBL_BAR, DBL_REP_END]);
    const repeatTokens = new Set([REP_START, REP_END, DBL_REP_START, DBL_REP_END, BTB_REP, DBL_BTB_REP]);
    const seperateBarTokens = new Set([BAR]);
    const pulseBarTokens = new Set([BM]);
    const repeatPreviousBarTokens = new Set([BAR_REPEAT]);
    const validTokens = new Set([...openingTokens, ...closingTokens, ...repeatTokens, 
        ...seperateBarTokens, ...pulseBarTokens, ...repeatPreviousBarTokens]);
    const tokens = sheetMusic.trim().split(/\s+/);
    const length = tokens.length;
    if (length > 0 && !tokens[length-1].endsWith(BAR)) {
        error.msg = `[SHEET MUSIC ERROR] Last ending token must be | or :| or || or :||. Currently it is: ${tokens[length-1]}`;
        return;
    }
    var index = 0;
    let ctrlVars = [];
    let match;
    let offset_beats = 0; 
    while (index < length && (match = tokens[index].match(CTRL_FUNCS))) {
        let func = match[1];
        let arg = match[3];
        let setFunc = 'set' + func;
        if (typeof this[setFunc] !== 'function') {
            error.msg = `[CONTROL VARS INFO] Pass by token at position ${index + 1}: "${tokens[index]}" - OK`;
            if (BASSBOARD_DB_FIELD.has(func)) {
                arg = arg.split('_').join(' '); 
                func = func.toLowerCase(); 
                _sheetMusic[func] = arg;
            } else if (func == 'URL') {   
                func = func.toLowerCase();
                _sheetMusic[func] = arg;
            }
            index += 1;
            offset_beats += 1;
            continue;
        }
        if (setFunc == 'setSustain') {    
            let status = this[setFunc](arg);  
            if (status !== undefined) {    
                return;
            }
            pulseFlag = PULSE_FLAG;        
        } else {
            ctrlVars.push([setFunc,arg]);     
        }
        index += 1;
        offset_beats += 1;
    }
    [beats, beatType] = DEF_TIME_SIGNATURE.split('/').map(Number); 
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
    const reshake = BPM.val;
    BPM.val = reshake;
    var stack = [];                
    var sequencer = [];            
    var loopBackIndex = {};        
    var repeatCount = {};          
    var end = END;                 
    var forwardIndex = {};         
    var skipNumberIndex = {};      
    var openingClassicalCount = 0; 
    if (!tokens[index] || !openingTokens.has(tokens[index])) {
        error.msg = `Expected a bar line or repeat start token after time signature, but found: "${tokens[index]}"`;
        error.msg = `Assuming opening sections exists`;
        while (index - offset_beats <= beats) { 
            if (openingTokens.has(tokens[index])) { 
                break;
            }
            const chord = getChordNotes(tokens[index]);
            if (chord) {
                sequencer.push(chord); 
                openingClassicalCount++ ; 
            } else {
                return;
            }
            index++;   
        }
    }
    if (tokens[index] == BAR) {
        stack.push([tokens[index], 0, DEF_REP_NUM]);
    } else if (tokens[index] == DBL_REP_START || tokens[index] == REP_START) {
        stack.push([tokens[index], sequencer.length, DEF_REP_NUM]);
    } else {
        error.msg = `[OPENING ERROR 2] Invalid token at position ${index + 1}: "${tokens[index]}"`;
        return;
    }
    index++;
    var beatCount = 0; 
    var jump = DEF_BEAT_JUMP;
    for (let i = index; i < length; i++) {
        beatCount = beatCount + jump;
        if (beatCount > beats) {
            if (!seperateBarTokens.has(tokens[i]) && 
                !closingTokens.has(tokens[i]) && 
                !repeatTokens.has(tokens[i])) {
                    error.msg = `[Bar Beat Count Error 1] Invalid token at position ${i + 1}: "${tokens[i]}"`;
                    return;
            }
            beatCount = 0;
        } else { 
            if (i == length - 1) { 
                if (tokens[i] == DBL_BAR || tokens[i] == DBL_REP_END) { 
                    let totalBeats = openingClassicalCount + beatCount - 1;
                    if (openingClassicalCount > 0 && CLASSICAL_CHECK && totalBeats !== beats) { 
                        error.msg = `[CLASSICAL BEAT ERROR 1] Opening and Closing Bar Beat Count must add up to number of beats in time signature, currenly: ${totalBeats}. Required: ${beats}`;
                        return;
                    }
                } else { 
                    if (openingClassicalCount > 0) { 
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
        if (validTokens.has(tokens[i])) {
            if (pulseBarTokens.has(tokens[i])) {    
                if (pulseFlag) {
                    let repeatChord = sequencer[sequencer.length - 1];
                    if (repeatChord) {
                        sequencer.push(repeatChord); 
                    } else {
                        error.msg = `No previous chord to repeat at position ${i + 1}: "${tokens[i]}"`;
                        sequencer.push(BM); 
                    }
                } else {
                    sequencer.push(BM); 
                }
                continue;
            }
            if (repeatPreviousBarTokens.has(tokens[i])) {
                if (length < 3 || (!openingTokens.has(tokens[i-1]) && !closingTokens.has(tokens[i+1]))) {
                    error.msg = `[REPEAT PREVIOUS BAR ERROR] Invalid token at position ${i + 1}: "${tokens[i]}"`;
                    return;
                }
                if (sequencer.length >= beats) {
                    sequencer.push(...sequencer.slice(-beats));
                    beatCount = beats;  
                    continue;
                } else {
                    error.msg = `Wrong beat count syntax, cannot repeat previous bar at position ${i + 1} with token: "${tokens[i]}"`;
                    return;
                }
            }
            if (seperateBarTokens.has(tokens[i])) {
                stack.push(BAR);
                continue;       
            }
            if (repeatTokens.has(tokens[i])) {
                if (tokens[i] === REP_START || tokens[i] === DBL_REP_START) {
                    stack.push([tokens[i], sequencer.length, DEF_REP_NUM]); 
                    continue;    
                } else if (tokens[i] === REP_END) {  
                    let p;
                    let updateLoop = false;
                    while (stack.length) {  
                        p = stack.pop();
                        if (p === BAR) {
                            continue;
                        } else if (p[0] === REP_START || p[0] === BAR) { 
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
                        loopBackIndex[sequencer.length - 1] = 0; 
                        repeatCount[sequencer.length - 1] = DEF_REP_NUM; 
                    }
                    continue
                } else if (tokens[i] === DBL_REP_END) {
                    let p;
                    let updateLoop = false;
                    while (stack.length) {  
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
                        loopBackIndex[sequencer.length - 1] = 0; 
                        repeatCount[sequencer.length - 1] = DEF_REP_NUM; 
                    }
                    continue;
                } else if (tokens[i] === BTB_REP) {  
                    let p;
                    let updateLoop = false;
                    while (stack.length) {  
                        p = stack.pop();
                        if (p === BAR) {
                            continue;
                        } else if (p[0] === REP_START || p[0] === BAR) { 
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
                        loopBackIndex[sequencer.length - 1] = 0; 
                        repeatCount[sequencer.length - 1] = DEF_REP_NUM; 
                    }
                    stack.push([REP_START, sequencer.length, DEF_REP_NUM]); 
                    continue;
                } else if (tokens[i] === DBL_BTB_REP) { 
                    let p;
                    let updateLoop = false;
                    while (stack.length) {  
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
                        loopBackIndex[sequencer.length - 1] = 0; 
                        repeatCount[sequencer.length - 1] = DEF_REP_NUM; 
                    }
                    stack.push([DBL_REP_START, sequencer.length, DEF_REP_NUM]); 
                    continue;
                }
            }
        } else { 
            const match_rep_num = tokens[i].match(REP_NUM);
            if (match_rep_num) {
                beatCount = beatCount - jump;
                let p = stack.pop();
                if (length >= 2 && tokens[i-1] !== REP_START && tokens[i-1] !== DBL_REP_START && p && p.length !== 3) {
                    error.msg = `[REPEAT NUMBER ERROR] Invalid token at position ${i + 1}: "${tokens[i]}"`;
                    return;
                }
                const num = Number(match_rep_num[1]);    
                p[2] = num - 1; 
                stack.push(p); 
                continue;
            }
            const match_skip_num = tokens[i].match(SKIP_NUM);
            if (match_skip_num) {
                beatCount = beatCount - jump;
                const current_skip_number = Number(match_skip_num[1]); 
                if (current_skip_number < LST_SKIPNUM) {
                    error.msg = `[SKIP NUMBER ERROR 1] Invalid token at position ${i + 1}: "${tokens[i]}"`;
                    return;
                } else if (current_skip_number == LST_SKIPNUM) {
                    skipNumberIndex[current_skip_number] = sequencer.length - 1; 
                } else {
                    let prev_num = current_skip_number - 1;
                    if (!(prev_num in skipNumberIndex)) {  
                        error.msg = `[SKIP NUMBER ERROR 2] Invalid token at position ${i + 1}: "${tokens[i]}"`;
                        return;
                    }
                    forwardIndex[skipNumberIndex[prev_num]] = forwardIndex[skipNumberIndex[prev_num]] ? [sequencer.length,...forwardIndex[skipNumberIndex[prev_num]]] : [sequencer.length];
                    skipNumberIndex[current_skip_number] = skipNumberIndex[prev_num]; 
                }
                continue;
            }
            const match_aux = tokens[i].match(AUX);
            if (match_aux) {
                beatCount = beatCount - jump;
                error.msg = `Found an auxiliary token: "${tokens[i]}"`;
                continue;
            }
            const chord = getChordNotes(tokens[i]);
            if (chord) {
                sequencer.push(chord); 
                continue;
            }   
            error.msg = `[CHORD ERROR] Invalid token at position ${i + 1}: "${tokens[i]}"`;
            return;
        }        
    } 
    if (length > 0 ) {
        let te = tokens[length - 1];
        if (te.slice(-2) === DBL_BAR) {
            end = true;        
        }    
    }
    error.msg = `Opening classical count (if any): ${openingClassicalCount}`;
    error.msg = `Current last beat count: ${beatCount}`;
    if (CLASSICAL_CHECK && !openingClassicalCount && beatCount != 0) {
        error.msg = `[CLASSICAL BEAT ERROR 3] There is no opening beats or ending number of beats in the last bar is not correct`;
        return;
    }
    _sheetMusic.content = sheetMusic;
    for (let [func, arg] of ctrlVars) {
        if (this[func].constructor.name === 'AsyncFunction') {
            error.msg = `func ${func} is an async function. Will be invoke with async function style`;
            let result = this[func](arg);  
            result.then(function(data) {
                if (data) {  
                    oops(`[Async] [Error] ${data}`,'warning');
                } 
            }).catch(function(exp) {
                oops(`[Async] [Exception] ${exp}`, 'warning');
            });
        } else {
            error.msg = `func ${func} is a synchronous function. Will be invoked like regular function`;
            let result = this[func](arg);  
            if (result !== undefined) {    
                error.msg = result;
                return;                    
            } 
        }
    }
    const result = [sequencer, loopBackIndex, repeatCount, end, forwardIndex, skipNumberIndex];
    validArgs.add(result); 
    return result; 
}
function _freq(note, octave = DEF_OCTAVE) {
    const a4 = 440;
    const semisFromA4 = (octave - 4) * 12 + (notes[note] - 1) - 9;
    return a4 * Math.pow(2, semisFromA4/12);
}
function playChord(chord = FAKE, octave = DEF_OCTAVE, duration = DEF_DURATION) {
    const notes = getChordNotes(chord);
    _playSequencerChord(notes, octave, duration);
}
function playNote(note = FAKE, octave = DEF_OCTAVE, duration=DEF_DURATION, volume=MAX_VOL) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain(); 
    masterGain.gain.value = 0.22; 
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle'; 
  osc.frequency.value = _freq(note, octave);
  osc.connect(gain);
  gain.connect(masterGain);
  const now = audioCtx.currentTime || 0;
  const attackTime = 0.01;
  const minimumVolume = MIN_VOL; 
  const attackVolume = volume;
  const sustainVolume = (volume > 0.3) ? 0.7 : minimumVolume;  
  gain.gain.value = minimumVolume;
  gain.gain.exponentialRampToValueAtTime(attackVolume, now + attackTime);
  gain.gain.setValueAtTime(sustainVolume, now + (duration || 0.01));
  gain.gain.exponentialRampToValueAtTime(minimumVolume, now + duration + 0.8);
  osc.addEventListener('ended', function() {
    osc.disconnect();
    gain.disconnect();
  });
  osc.start(now);
  osc.stop(now + duration + 0.9);
}
function _delay(ms = DEF_MSEC, signal) {
  return new Promise(function (resolve, reject) {
    if (signal && signal.aborted) {
      return reject(new DOMException("Aborted", "AbortError"));
    }
    var timer;
    function cleanup() {
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }
    }
    function onAbort() {
      clearTimeout(timer);
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    }
    timer = setTimeout(function () {
      cleanup();
      resolve();
    }, ms);
    if (signal) {
      signal.addEventListener("abort", onAbort);
    }
  });
}
function _playSequencerChord(sequencerChord = BM, octave = DEF_OCTAVE, duration = DEF_DURATION, volume = MAX_VOL) {
    if (sequencerChord != BM) {
        if (sequencerChord[1]) {
            playNote(sequencerChord[1], octave - 1, duration, volume); 
        }
        for (let note of sequencerChord[0]) {
            playNote(note, octave, duration, volume); 
        }
    } else {  
        playNote(FAKE, MIN_OCTAVE, duration, MIN_VOL); 
    }
}
async function _saveSheetMusicToBASS() {
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
  const filename = `${_sheetMusic.title}_by_${_sheetMusic.contributor}.bass`;
  if (global === window && 'showSaveFilePicker' in global) {
    const options = {
        suggestedName: filename,
        types: [{
            description: 'BASS Music File',
            accept: { '*/.bass': ['.bass'] }
        }]
    };
    const handle = await global.showSaveFilePicker(options);
    const writable = await handle.createWritable();
    await writable.write(jsonString);
    await writable.close();
    return; 
  }
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
      const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
      const dataUri = `data:application/octet-stream;base64,${base64Data}`;
      const a = document.createElement('a');
      a.href = dataUri;
      a.download = filename;
      a.target = '_blank'; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
  } else {
      const blob = new Blob([jsonString], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return; 
  }
}
async function _saveSheetMusicToPDF() {
    await new Promise(function(resolve) {
        setTimeout(resolve, 0);
    });
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
    doc.close();
    const style = doc.createElement('style');
    style.textContent = `
        body, pre {
            font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
        }
        @media print {
            body, pre {
                font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
                color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
    `;
    doc.head.appendChild(style);
    const pre = doc.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.textContent = _sheetMusic.content; 
    doc.body.appendChild(pre);
    iframe.contentWindow.addEventListener('afterprint', function() {
        if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);    
        }
    });
    requestAnimationFrame(function() {
        setTimeout(function() {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 250); 
    });
    setTimeout(function() {
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
  var sequencer=SMP_SEQUENCER;
  var loopBackIndex={};
  var repeatCount={};
  var end=END;
  var forwardIndex={};
  var skipNumberIndex={};
  if (validArgs.has(sequencerObj)) {
    [sequencer,loopBackIndex,repeatCount,end=END,forwardIndex,skipNumberIndex] = sequencerObj;
    validArgs.delete(sequencerObj); 
    const problem = `Sequencer object will be removed from WeakSet right after playing`;
    if (FULL_ASYNC_DEBUG_MODE) oops(problem, 'info'); 
  } else {
    const problem = `[SEQUENCER WARNING] Must run buildSequencer() first before feeding result to playSequencer(). Using default sequencer: ${JSON.stringify(SMP_SEQUENCER)} with tempo: ${BPM.val} bpm`;
    oops(problem, 'warning');
  }
  if (taskDropper) taskDropper.abort();
  taskDropper = new AbortController();
  const { signal } = taskDropper;
  let i = 0; 
  let n = sequencer.length;
  let heuristic_lowest_number_index = -1;
  if (LST_SKIPNUM in skipNumberIndex) heuristic_lowest_number_index = skipNumberIndex[LST_SKIPNUM];
  oops('🤟 | | |', 'info');
  playNote(FAKE,MIN_OCTAVE,STACKATO_LEGATO,MIN_VOL); 
  await _delay(DEF_MSEC, signal); 
  oops('✌️ | |', 'info');
  playNote(FAKE,MIN_OCTAVE,STACKATO_LEGATO,MIN_VOL); 
  await _delay(DEF_MSEC, signal); 
  oops('☝️ |', 'info');
  playNote(FAKE,MIN_OCTAVE,STACKATO_LEGATO,MIN_VOL); 
  await _delay(DEF_MSEC, signal);     
  while (!signal.aborted) { 
    i = 0;
    let tempRepeatCount = JSON.parse(JSON.stringify(repeatCount));
    let tempForwardIndex = JSON.parse(JSON.stringify(forwardIndex));
    let skipFlag = false; 
    while (i < n) {
      if (signal.aborted) break;
      _playSequencerChord(sequencer[i],DEF_OCTAVE,STACKATO_LEGATO); 
      await _delay(DEF_MSEC, signal); 
      if (skipFlag && i in forwardIndex) {   
          i = forwardIndex[i].pop(); 
          skipFlag = false;
      } else if (i in loopBackIndex && repeatCount[i] > 0) {  
        repeatCount[i]--;
        if (repeatCount[i] == 0 &&  i > heuristic_lowest_number_index) {  
          skipFlag = true;
        } else {
          skipFlag = false;
        }
        i = loopBackIndex[i];  
      } else {  
        i++;
      }
    }
    if (end && (!(n-1 in repeatCount) || repeatCount[n-1] == 0)) {
      stopSequencer();  
    }
    repeatCount = tempRepeatCount; 
    forwardIndex = tempForwardIndex;
  }
  return;
}
async function setSaveAs(option) {
    if (!SAVE_AS_TYPES.has(option)) {
        const problem =`[SaveAs ERROR] Control phrase SaveAs: must be followed by one of the following terms: ${[...SAVE_AS_TYPES]}`;
        return problem;
    }
    if (typeof(global) !== "object" || global !== window) {
        const problem = `[SaveAs ERROR] Print function is currently supported in browser environment only`;
        return problem;
    }
    if (option == "PDF") {             
        let result = await _saveSheetMusicToPDF().catch(function(err) {throw new Error("Save As PDF Exception: " + err.message);});
        return result;                 
    } else if (option == "BASS") {     
        let result = await _saveSheetMusicToBASS().catch(function(err) {throw new Error("Save As BASS Exception: " + err.message);});
        return result;                 
    } 
    const problem = `This SaveAs format is not supported : ${option}`;
    return problem;
}
function getInstrument() {
    return instrument;
}
function setInstrument(inst) {
    let lc_inst = inst.toLowerCase();
    if (!DEF_SUPPORT_INST.has(lc_inst)) {
        const problem = `[Set Instrument Error] Currently not support ${inst} instrument`;
        error.msg = problem;
        return problem;
    }
}
function oops(message, type = 'info') {
    if (typeof(global) !== "object" || global !== window) {
        const problem = `[Oops ERROR] Oops function is currently supported in browser environment only`;
        error.msg = problem;
        alert(problem);
        return problem;
    }
    const oopsContainer = document.getElementById('oopsContainer') || _createOopsContainer();
    const oopsEl = document.createElement('div');
    oopsEl.className = `oops oops-${type}`;
    oopsEl.textContent = message;
    oopsContainer.appendChild(oopsEl);
    setTimeout(function() {
        oopsEl.classList.add('oops-show');
    }, 10);
    setTimeout(function() {
        oopsEl.classList.remove('oops-show');
        setTimeout(function() {
            oopsEl.remove();
        }, 300);
    }, 3000);
}
function stopSequencer() {
  if (taskDropper) {
    taskDropper.abort(); 
  }
}
function setTempo(bpm) {
    const convert = Number(bpm);
    if (Number.isNaN(convert)) {
        const problem = `[SET TEMPO ERROR] Conversion failed: "${bpm}" cannot be converted to a valid number.`;
        error.msg = problem;
        return problem;
    }
    if (!Number.isInteger(convert) || convert < MIN_TEMPO || convert > MAX_TEMPO) {
        const problem = `[TEMPO ERROR] Tempo (BPM) must be an integer in the range of ${MIN_TEMPO} and ${MAX_TEMPO}`;
        error.msg = problem;
        return problem;
    }
    BPM.val = convert;
}
function setOctave(oct) {
    const convert = Number(oct);
    if (Number.isNaN(convert)) {
        const problem = `[SET OCTAVE ERROR] Conversion failed: "${oct}" cannot be converted to a valid number.`;
        error.msg = problem;
        return problem;
    }
    if (!Number.isInteger(convert) || convert < MIN_OCTAVE || convert > MAX_OCTAVE) {
        const problem = `[SET OCTAVE ERROR] Default octave must be a number in the range of ${MIN_OCTAVE} and ${MAX_OCTAVE}. `;
        error.msg = problem;
        return problem;
    }
    DEF_OCTAVE = convert;
}
function getOctave() {
    return DEF_OCTAVE;
}
function getTempo() {
    return BPM.val;
}
function getSampleTestCase() {
    return SMP_TESTCASE;
}
function getMaxSheetLength() {
    return MAX_SHEET_LENGTH;
}
function setSustain(d) {
    if (d == "Yes") {
        PULSE_FLAG = false; 
    } else if (d == "No") {
        PULSE_FLAG = true; 
    } else {
        const problem = `[SUSTAIN ERROR] To sustain BM / character, must use control phrase Sustain:Yes or Sustain:No`;
        error.msg = problem;
        return problem;
    }
}
function getSustain() {
    return PULSE_FLAG;
}
function getDuration() {
    return DEF_DURATION;
}
function getGuitarNote(st = 6, fret = 0) {
    const MIN_FRETS = 0;
    const MAX_FRETS = 38; 
    if (typeof fret !== 'number' || !Number.isInteger(fret) || fret < MIN_FRETS || fret > MAX_FRETS ||
        typeof st !== 'number' || !Number.isInteger(st) || st < 1 || st > 6  
    ) {
        const problem = `[getGuitarNote Error] parameters error, fret = ${fret}, st = ${st}`;
        error.msg = problem;
        return problem;
    }
    var lookup_note;
    switch (st) {
        case 6: {
            lookup_note = notes['E'];   
            break;
        }        
        case 5: {
            lookup_note = notes['A'];
            break;
        }
        case 4: {
            lookup_note = notes['D'];
            break;
        }
        case 3: {
            lookup_note = notes['G'];
            break;
        }
        case 2: {
            lookup_note = notes['B'];
            break;
        }
        case 1: {
            lookup_note = notes['E'];   
            break;
        }
        default: {
            const problem = `[getGuitarNote Error] string number must be between 1 and 6, but got ${st}`;
            error.msg = problem;
            return problem;
        }
    }
    var calculated_lookup_note = (lookup_note + fret) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    var octave_offset = 0;
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