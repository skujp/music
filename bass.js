(function(global) {
const VERSION = "9.0.2";
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
function attach(libObject, functionObj) {
    Object.assign(libObject, functionObj);
}
attach(TheBass, {rename, setDebug, help, getErrorMsg, getChordNotes, buildSequencer});  
attach(TheBass, {setFullAsyncDebug, getFullAsyncDebugMode, oops, 
                 playNote, playChord, playSequencer, stopSequencer, 
                 setTempo, setOctave, getOctave, getTempo, 
                 getSampleTestCase, getMaxSheetLength,
                 setSaveAs, setSustain, getSustain, 
                 getInstrument, setInstrument,
                 getDuration, getGuitarNote, getVersion, hasComment,
                 getRoadmapMode, poof, setPoof 
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
const CMT_START = "<-";                                                 
const CMT_END   = "->";                                                 
const _CODA_  = "CODA";
const _TO_    = "TO.";
const _AL_    = "AL.";
const FINE = "FINE";                                                    
const SEGNO = "$";
const CODA = "+";
const DC = "D.C.";
const DS = "D.S.";
const TOCODA = _TO_ + _CODA_;
const DCALCODA = DC + _AL_ + _CODA_;
const DSALCODA = DS + _AL_ + _CODA_;
const DCALFINE = DC + _AL_ + FINE;
const DSALFINE = DS + _AL_ + FINE;
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
var MAX_VOLTA = 11;                                                     
var MAX_TIMEOUT = 50;                                                   
var MAX_REPEAT_MULTIPLIER = MAX_TIMEOUT*3;                              
var OCTAVE_LENGTH = 12;                                                 
var EMPTY = "";                                                         
var [beats, beatType] = DEF_TIME_SIGNATURE.split('/').map(Number);      
var DEF_DURATION = 60 / BPM.val;                                        
var DEF_MSEC = DEF_DURATION * 1000;                                     
var MAX_SECTION_REP = 51;                                               
var SMP_TESTCASE = "Title:Rhythmeus\nComposer:Chordius\nPerformer:⌨Qwerty🖱Clicky📲Tappy\n\n3/4 |: F7 / G | % | [1. G D G/D :| [2. Bmaj7 Aaug Fdim ||";      
var SAVE_AS_TYPES = new Set(["PDF","BASS"]);                            
var BASSBOARD_DB_FIELD = new Set(["Contributor","Title"]);              
var CTRL_FUNCS = /^(Title|Contributor|Artist|Composer|Arranger|Singer|Writer|Author|Musician|Song|Performer|Cover|Remix|Original|Genre|Tempo|Octave|SaveAs|Sustain|URL|Misc|Derivative|Poof)(:)(.+)$/;
var taskDropper = null;                                                 
var validArgs = new WeakSet();                                          
var _sheetMusic;                                                        
var _cmtActive = false;                                                 
var cmtExist = _cmtActive;                                              
var notes = _initMusicMajorScale();                                     
var roadmapMode = null;                                                 
var MAX_ROADMAP_VISITED = 333;                                          
var DEF_ROADMAP_VISITED = 1;                                            
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
    manual += `| Rev ${VERSION} |`;
    manual += "" + "\n\n";
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
    manual += "For example, chord C (C major) consists of C,E,G ; " + "\n";
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
    manual += "Please note, time signature in the BASS system has more varieties than common " + "\n";
    manual += "sheet music. " + "\n";
    manual += "For example, the nominator part represents the number of beats in a bar. " + "\n";
    manual += "The denominator part is a power of two, representing a fraction of a whole note " + "\n";
    manual += "for calculating the actual sheet music speed." + "\n";
    manual += "For example, 8/16 means there are 8 beats in a bar, and music speed will be a " + "\n"; 
    manual += "tempo adjusted based on the 16th note." + "\n";
    manual += "So do not be surprised if you see a time signature such as " + "\n"; 
    manual += "123/256 in the BASS system :)" + "\n";
    manual += "" + "\n";
    manual += "5. Time Measure" + "\n";
    manual += "Time Measure (or Bar) is a small container of time that holds " + "\n";
    manual += "a specific number of beats. For example, the following bar " + "\n";
    manual += "contains 3 beats: | / / / |, this bar contains 0 beat: |     | " + "\n";
    manual += "" + "\n";
    manual += "6. Opening Section" + "\n";
    manual += "An opening section begins the sheet music. It may or may not have a leading tone." + "\n";
    manual += "If it has a leading tone, the number of opening beats " + "\n";
    manual += "cannot go over the nominator beats of time signature." + "\n";
    manual += "For example, A A | D / D / | Amaj7 / Amaj7 / || is accepted " + "\n";
    manual += "with a leading tone A A (2 beats)." + "\n";
    manual += "Please note, without a leading tone, an opening section usually " + "\n"; 
    manual += "starts with a | or |: or ||: " + "\n";
    manual += "Double bar symbol || is currently not supported in opening section to avoid any " + "\n"; 
    manual += "confusion with the ending section. " + "\n";
    manual += "" + "\n";
    manual += "7. Repeat Section" + "\n";
    manual += "A repeat section (or loop) is a section which is played again and again." + "\n";
    manual += "The loop usually looks like this |:   :|  or ||:    :|| or special loop back " + "\n";
    manual += "from beginning such as |    :| and |    :|| " + "\n";
    manual += "In some cases, it can use back to back loop symbol :|: or :||: " + "\n";
    manual += "For example, |:   :|:   :| or ||:   :||:   :||" + "\n";
    manual += "By default, repeat section will loop for 1 time (2x), but it is up to the user to " + "\n";
    manual += "modify using repeat multipliers such as (3x), (4x), etc." + "\n";
    manual += "For example, |: (4x)  F  /  / C  |  B  /  /  A  :| means " + "\n";
    manual += "loop 4 times over the 2 bars of chords." + "\n";
    manual += "In the BASS system, if there is no matching opening repeat symbols, it will " + "\n";
    manual += "go back to the beginning. For example, 2/4 | C D | F G :| A B :| G G ||, each time " + "\n";
    manual += "seeing a repeat symbol :| it will go back to the beginning. " + "\n";
    manual += "" + "\n";
    manual += "8. Branching Section" + "\n";
    manual += "A branching section (or volta bracket) is used to skip from one section to another" + "\n";
    manual += "of a sheet music AFTER REPEAT. It is written as an open bracket " + "\n";
    manual += "followed by a number and a dot. For example: [1. [2. [3. [123. , etc." + "\n";
    manual += "Below is a section of a sheet music which will skip [1. and jump to [2. after repeat. " + "\n";
    manual += "4/4 |: A A A A | [1. B B B B :| [2. C C C C | D D D D |" + "\n";
    manual += "Please note, BASS implements positional volta brackets, including uses beyond " + "\n";
    manual += "common music notation. For example: " + "\n";
    manual += "3/4 | C C C |: D D D | A A A | [40. D D D :| [20. F F F :| [30. B B B || " + "\n";
    manual += "After the 1st repeat, it will skip [40. bar to the next bar [20. " + "\n";
    manual += "After the 2nd repeat, it will skip [40. bar and [20. bar to the next bar [30. " + "\n";
    manual += "Please note, the branching section relies on repeat symbols :| or :|| to move back " + "\n";
    manual += "to the closest matching |: or ||: . If not finding a match, it will go back to the " + "\n";
    manual += "beginning of the sheet music. Also, colliding numbers for branching section " + "\n";
    manual += "are allowed but NOT RECOMMENDED for the clarity of a music sheet. " + "\n";
    manual += "For example, instead of writing 3/4 | C C C | [1. D D D :| [1. E E E || , it is better " + "\n";
    manual += " to replace the second [1. as [2. or so ... " + "\n";
    manual += "A final note for branching section is it can coexist with multipliers in repeat section. " + "\n";
    manual += "However, it will override the default behavior of multipliers in repeat section. " + "\n"; 
    manual += "So for example, 2/4 | (123x) A A | [1. B B :| C C || will completely ignore (123x) " + "\n";
    manual += " on the second repeat. " + "\n";
    manual += "" + "\n";
    manual += "9. Ending Section" + "\n";
    manual += "A sheet music must end with either a single bar character | or " + "\n";
    manual += "a double bar character ||" + "\n";
    manual += "If it ends with a || , the system will stop playing (no loop back)." + "\n";
    manual += "Otherwise, the system by default will keep looping back from the beginning " + "\n";
    manual += "even without the user's intervention." + "\n";
    manual += "Please note, if it ends with :| or :|| it will loop back according to user's " + "\n";
    manual += "intention first before the default system loop back kicks in. " + "\n";
    manual += "For the case of :||, it will stop eventually." + "\n";
    manual += "" + "\n";
    manual += "10. Classical Rule" + "\n";
    manual += "If there is a leading tone, the following rule will be applied: " + "\n";
    manual += "The number of opening beats and ending beats must equal the  " + "\n";
    manual += "nominator beats in time signature." + "\n";
    manual += "" + "\n";
    manual += "11. Tempo" + "\n";
    manual += "Tempo is the speed or pace at which a piece of music is played." + "\n";
    manual += "It is the number of beats per minutes (bpm) set up before " + "\n";
    manual += "playing the sheet music. In the BASS system, by default bpm is set to 90, " + "\n";
    manual += "assuming quarter note is in time signature. " + "\n";
    manual += "The user can change it manually. See section IV for more details." + "\n";
    manual += "Please note that, tempo will be adjusted based on time signature to " + "\n";
    manual += "result in the actual sheet music speed. " + "\n";
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
    manual += "To sustain, use command Sustain:Yes at the beginning of the sheet music (see Section IV)." + "\n";
    manual += "" + "\n";
    manual += "15. Duplicate %" + "\n";
    manual += "A duplicate % means repeat playing the previous bar." + "\n";
    manual += "For example, | A B C | % || will play A, B, C, A, B, C" + "\n";
    manual += "" + "\n";
    manual += "16. Section Marker (#)" + "\n";
    manual += "A group of bars can be marked with a section marker such as (A), (B), (C), etc." + "\n";
    manual += "Inside the parenthesis, it must be a single uppercase letter A-Z. " + "\n";
    manual += "Once a section marker is defined, it can be used later in the sheet music to repeat " + "\n";
    manual += "that section. For example, 3/4 | (A) F G A | B C D | (B) E F G | (C) D E F | (Bx3) || " + "\n";
    manual += "means the last bar will repeat the section marked with (B) three times." + "\n";
    manual += "Please note, the section marker must be defined " + "\n";
    manual += "before it is used. For example, 3/4 | D D D | (Mx2) G G G | will raise an error because " + "\n";
    manual += "(M) is not defined before it is used." + "\n";
    manual += "Another example, 4/4 |: (3x) (T) C D E F :| (G) G A B C | (Tx2) || " + "\n";
    manual += "means the last bar will repeat 2 times the first bar (including 3x), so it will be played " + "\n";
    manual += "6 times in total. By default, the marker works by scanning until the next marker is " + "\n";
    manual += "found to determine the section to repeat. If it doesn't find any marker, it will scan " + "\n";
    manual += "until the end of the sheet music." + "\n";
    manual += "For example, 4/4 | C D E F | (Z) G A B C | D E F G | (Zx1) || " + "\n";
    manual += "means the last bar will repeat 1 time the section marked with (Z) which is G A B C | D E F G |" + "\n";
    manual += "Please note, there are 3 types of notations often used in section marker. " + "\n";
    manual += "For example: (Z), (Zx2), and (Z*2)," + "\n";
    manual += "in which (Z) is the section marker definition, (Zx2) is the section marker usage with " + "\n";
    manual += "repeat 2 times, including multipliers. " + "\n";
    manual += "and (Z*2) is the section marker usage with repeat 2 times excluding multipliers." + "\n";
    manual += "For example, 3/4 | A A A |: (3x) (Q) B B B :| (Qx3) || will play the last bar 9 times " + "\n";
    manual += "in total because of the multiplier (3x)," + "\n";
    manual += "whereas 3/4 | A A A |: (3x) (Q) B B B :| (Q*3) || will play the last bar 3 times only." + "\n";
    manual += "Please note, (Zx2) also works with branching section, preserving the branching behavior." + "\n";
    manual += "whereas, (Z*2) will ignore branching behavior." + "\n";
    manual += "" + "\n";
    manual += "17. Commented Out Section" + "\n";
    manual += "Commented out section (or Vi-De) is a special marked section NOT to be played in a sheet music. " + "\n";
    manual += "The commented opening symbol (Vi) is <- and the closing (De) is -> " + "\n";
    manual += "They are usually set after the opening section of a sheet music (see section I.6). " + "\n";
    manual += "For example, 2/4 | G G | <- A A | B B | -> D D | <- E E |  -> F F || " + "\n";
    manual += "will only play | G G | D D | F F || " + "\n";
    manual += "This Vi-De mode can be useful to test playing only specific parts of the sheet music. " + "\n";
    manual += "Please note that, sometimes playback does not echo any sound due to the " + "\n";
    manual += "commented sheet music containing only BM / chords. " + "\n";
    manual += "For example, | <- D D D D | -> / / / / || " + "\n";
    manual += "" + "\n";
    manual += "18. Roadmap Symbols" + "\n";
    manual += "In a sheet music, there are special symbols which designate to change the music flow such as:"+"\n";
    manual += "(D.C.) : Go back to the start"+"\n";
    manual += "(D.S.) : Go to SEGNO symbol ($)"+"\n";
    manual += "(DC.AL.CODA) : Go back to the start, play until (TO.CODA) symbol, then jump to CODA symbol (+)"+"\n";
    manual += "(DS.AL.CODA) : Go to SEGNO symbol ($), play until (TO.CODA) symbol, then jump to CODA symbol (+)"+"\n";
    manual += "(DC.AL.FINE) : Go back to the start, play until (FINE) symbol, then end the music"+"\n";
    manual += "(DS.AL.FINE) : Go to SEGNO symbol ($), play until (FINE) symbol, then end the music"+"\n";
    manual += "In the BASS system, they are called roadmap symbols."+"\n";
    manual += "By default, when encountering those symbols, it will immediately change the music direction."+"\n";
    manual += "For example, 2/4 | G G | C ($) C | E (TO.CODA) E | (D.S.AL.CODA) F (+) F ||"+"\n";
    manual += "will play G G C C E E C E F"+"\n";
    manual += "Some musicians would prefer to apply those symbols from the second time after repeat."+"\n";
    manual += "In such cases, they need to set the special control variable Poof:OnRepeat (see section IV). "+"\n";
    manual += "For example, Poof:OnRepeat 2/4 | G G | C ($) C | E (TO.CODA) E | (D.S.AL.CODA) F (+) F :||"+"\n";
    manual += "will play G G C C E E F F (no change 1st time through), then it will play G G C C E E C E F like above."+"\n";
    manual += "Please note that these special roadmap symbols should be used with CAUTION to avoid any confusion."+"\n";
    manual += "Currently, these symbols can only be used once in the BASS system."+"\n";
    manual += "" + "\n";
    manual += "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n";
    manual += "" + "\n";
    manual += "III. THE CHORD-BASED NOTATION SYSTEM" + "\n";
    manual += "" + "\n";
    manual += "Time Signature:" + "\n";
    manual += "3/4 4/4 6/8 2/2 2/4 12/8 5/4 7/8 9/8 11/8 13/8 15/16 7/4 3/8 6/16 32/64 8/128 123/512 ..." + "\n";
    manual += " " + "\n";
    manual += "Bar:" + "\n";
    manual += "|" + "\n";
    manual += "" + "\n";
    manual += "Opening (incl. repeat):" + "\n";
    manual += "| |: ||:" + "\n";
    manual += "" + "\n";
    manual += "Closing (incl. repeat):" + "\n";
    manual += "| || :| :||" + "\n";
    manual += "" + "\n";
    manual += "Repeat:" + "\n";
    manual += ":|" + "\n";
    manual += ":||" + "\n";
    manual += "|:  :|  " + "\n";
    manual += "||:  :||  " + "\n";
    manual += "|:      :|:    :|" + "\n";
    manual += "||:    :||:    :||" + "\n";
    manual += "" + "\n";
    manual += "Multiplier:" + "\n";
    manual += "(1x) (2x) (3x) (4x) (5x) ..." + "\n";
    manual += "" + "\n";
    manual += "Branching (Volta):" + "\n";
    manual += "[1. [2. [3. [4. [99. [101. [123. ..." + "\n";
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
    manual += "Annotation:" + "\n";
    manual += "(intro) (verse) (chorus) (bridge) (outro) (sustain) (p) (mf) (f) (ff) " + "\n";
    manual += "(allegro) (moderato) (adagio) (lyrics_separated_by_underscores) ..." + "\n";
    manual += "" + "\n";
    manual += "Section Marker:" + "\n";
    manual += "(#) (#x<number>) (#*<number>)" + "\n";
    manual += "" + "\n";
    manual += "Comment (Vi-De):" + "\n";
    manual += "<- ->" + "\n";
    manual += "" + "\n";
    manual += "Roadmap:" + "\n";
    manual += "(FINE) ($) (+) (TO.CODA) (D.C.)" + "\n";
    manual += "(D.S.) (D.C.AL.CODA) (D.S.AL.CODA)" + "\n";
    manual += "(D.C.AL.FINE) (D.S.AL.FINE)" + "\n";
    manual += "" + "\n";
    manual += "||||||" + "\n"; 
    manual += "Remark:   " + "\n";
    manual += "... means et cetera" + "\n";
    manual += "# means any uppercase letter A-Z" + "\n";
    manual += "<number> means any non-negative integer" + "\n";
    manual += "roadmap symbols are all uppercase" + "\n";
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
    manual += "Composer:Loremipsum_Dolorsitamet_Maximus_Vesterialian_Batiatus_Mortdevold_Ninja_Chkft" + "\n";
    manual += "" + "\n";
    manual += "Tempo:<number>          for example, Tempo:100 to set BPM=100" + "\n";
    manual += "Octave:<number>         for example, Octave:5 set middle C to C5 (*)" + "\n";
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
    manual += "URL:<address>           for example, URL:https://youtube.com/yourmusicchannel. " + "\n";
    manual += "Optional but recommended when saving to .bass" + "\n";
    manual += "Misc:<anything>         for example, Misc:anything_you_want_to_write_here_seperated_by_underscore_character" + "\n";
    manual += "Poof:OnRepeat           activate roadmap symbols only after the music has been played one time through" + "\n";
    manual += "" + "\n";
    manual += "(*) Octave: notation is to set the BASS default system octave, which is not the same as " + "\n";
    manual += "the musical instrument's current octave." + "\n";
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
    manual += "Note, any music (chords, rhythms, melody) is allowed, but lyrics and URLs will be checked for " + "\n";
    manual += "explicit content prior to posting." + "\n";
    manual += "" + "\n";
    manual += "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n";
    manual += "" + "\n";
    manual += "VI. QWERTY KEYBOARD" + "\n";
    manual += "" + "\n";
    manual += "Piano notes are mapped to the qwerty row, and number row of a common computer keyboard. " + "\n";
    manual += "For example: q,w,e,r,t,2,3..." + "\n";
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
    manual += "If you are a strictly classically trained musician, this system may not be the right fit for you. " + "\n";
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
function buildSequencer(sheetMusic = EMPTY, pulseFlag = PULSE_FLAG, poofRepeat = DEF_ROADMAP_VISITED) {
    _sheetMusic = {};
    _cmtActive = false;
    cmtExist = _cmtActive;
    roadmapMode = null;
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
    const roadmapTokens = new Set([FINE, SEGNO, CODA, TOCODA, DC, DS, DCALCODA, DSALCODA, DCALFINE, DSALFINE]);
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
        } else if (setFunc == 'setPoof') {    
            let status = this[setFunc](arg);  
            if (status !== undefined) {    
                return;
            }
            poofRepeat = DEF_ROADMAP_VISITED; 
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
    var repeatStack = [];          
    var repeatStackMap = {};       
    var sequencer = [];            
    var loopBackIndex = {};        
    var repeatCount = {};          
    var end = END;                 
    var voltaMap = {};             
    var voltaArr = [];             
    var roadmap = {};              
    var roadmapVisited = {};       
    var roadmapRank = [null,null,null,null,null]; 
    var openingClassicalCount = 0; 
    var sectionMarker = [];        
    var markerIndex = {};          
    var currentSection = 0;        
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
        repeatStackMap[sequencer.length] = repeatStack.length;
        repeatStack.push([tokens[index], 0, DEF_REP_NUM]);
    } else if (tokens[index] == DBL_REP_START || tokens[index] == REP_START) {
        repeatStackMap[sequencer.length] = repeatStack.length;
        repeatStack.push([tokens[index], sequencer.length, DEF_REP_NUM]);
    } else {
        error.msg = `[OPENING ERROR 2] Invalid token at position ${index + 1}: "${tokens[index]}"`;
        return;
    }
    index++;
    var beatCount = 0; 
    var jump = DEF_BEAT_JUMP;
    var maxsequencerlength = MAX_SHEET_LENGTH * MAX_SECTION_REP; 
    for (let i = index; i < length; i++) {
        if (sequencer.length > maxsequencerlength) {
            error.msg = `[BUILD SEQUENCER ERROR] Sequencer length after built exceeds limit of ${maxsequencerlength} characters. Check your sheet music for too many repeats or too long sections.`;
            return;
        } 
        if (_cmtActive) {
            if (tokens[i] == CMT_END) {
                _cmtActive = false;
            }
            continue;
        } else {
            if (tokens[i] == CMT_START) {
                _cmtActive = true;
                cmtExist = true;
                continue;
            }
        }
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
                continue;       
            }
            if (repeatTokens.has(tokens[i])) {
                if (tokens[i] === REP_START || tokens[i] === DBL_REP_START) {
                    repeatStackMap[sequencer.length] = repeatStack.length;
                    repeatStack.push([tokens[i], sequencer.length, DEF_REP_NUM]);
                    continue;    
                } else if (tokens[i] === REP_END) {
                    if (voltaArr.length > 0 && voltaArr[voltaArr.length - 1][2] == tokens.length) {
                        voltaArr[voltaArr.length - 1][2] = sequencer.length; 
                    }
                    let p;
                    let updateLoop = false;
                    if (repeatStack.length) {
                        p = repeatStack.pop();
                        if (p[0] === REP_START || p[0] === BAR) { 
                            if (p[0] === BAR && voltaArr.length > 1 && voltaArr[voltaArr.length - 1][1] == voltaArr[voltaArr.length - 2][1]) {
                                loopBackIndex[sequencer.length - 1] = voltaArr[voltaArr.length - 1][1];
                                repeatCount[sequencer.length - 1] = DEF_REP_NUM;  
                            } else {
                                loopBackIndex[sequencer.length - 1] = p[1];
                                repeatCount[sequencer.length - 1] = DEF_REP_NUM * p[2];
                            }
                            updateLoop = true;
                            if (voltaArr.length > 0) {
                                voltaArr[voltaArr.length - 1][1] = loopBackIndex[sequencer.length - 1];  
                            }
                        } else {
                            error.msg = `[Stack Error 1] contains wrong matching tokens ${p} for ${tokens[i]}`;
                            return;
                        }
                    }
                    if (!updateLoop) {
                        loopBackIndex[sequencer.length - 1] = 0; 
                        repeatCount[sequencer.length - 1] = DEF_REP_NUM; 
                        if (voltaArr.length > 0) {
                            voltaArr[voltaArr.length - 1][1] = loopBackIndex[sequencer.length - 1];    
                        }
                    }
                    continue
                } else if (tokens[i] === DBL_REP_END) {
                    if (voltaArr.length > 0 && voltaArr[voltaArr.length - 1][2] == tokens.length) {
                        voltaArr[voltaArr.length - 1][2] = sequencer.length; 
                    }
                    let p;
                    let updateLoop = false;
                    if (repeatStack.length) {
                        p = repeatStack.pop();
                        if (p[0] === DBL_REP_START || p[0] === BAR) {
                            if (p[0] === BAR && voltaArr.length > 1 && voltaArr[voltaArr.length - 1][1] == voltaArr[voltaArr.length - 2][1]) {
                                loopBackIndex[sequencer.length - 1] = voltaArr[voltaArr.length - 1][1];
                                repeatCount[sequencer.length - 1] = DEF_REP_NUM;  
                            } else {
                                loopBackIndex[sequencer.length - 1] = p[1];
                                repeatCount[sequencer.length - 1] = DEF_REP_NUM * p[2];
                            }
                            updateLoop = true;
                            if (voltaArr.length > 0) {
                                voltaArr[voltaArr.length - 1][1] = loopBackIndex[sequencer.length - 1];  
                            }                            
                        } else {
                            error.msg = `[Stack Error 2] contains wrong matching tokens ${p} for ${tokens[i]}`;
                            return;
                        }
                    }
                    if (!updateLoop) {
                        loopBackIndex[sequencer.length - 1] = 0; 
                        repeatCount[sequencer.length - 1] = DEF_REP_NUM; 
                        if (voltaArr.length > 0) {
                            voltaArr[voltaArr.length - 1][1] = loopBackIndex[sequencer.length - 1];    
                        }
                    }
                    continue;
                } else if (tokens[i] === BTB_REP) {  
                    if (voltaArr.length > 0 && voltaArr[voltaArr.length - 1][2] == tokens.length) {
                        voltaArr[voltaArr.length - 1][2] = sequencer.length; 
                    }
                    let p;
                    let updateLoop = false;
                    if (repeatStack.length) {
                        p = repeatStack.pop();
                        if (p[0] === REP_START || p[0] === BAR) { 
                            if (p[0] === BAR && voltaArr.length > 1 && voltaArr[voltaArr.length - 1][1] == voltaArr[voltaArr.length - 2][1]) {
                                loopBackIndex[sequencer.length - 1] = voltaArr[voltaArr.length - 1][1];
                                repeatCount[sequencer.length - 1] = DEF_REP_NUM;  
                            } else {
                                loopBackIndex[sequencer.length - 1] = p[1];
                                repeatCount[sequencer.length - 1] = DEF_REP_NUM * p[2];
                            }
                            updateLoop = true;
                            if (voltaArr.length > 0) {
                                voltaArr[voltaArr.length - 1][1] = loopBackIndex[sequencer.length - 1];  
                            }
                        } else {
                            error.msg = `[Stack Error 3] contains wrong matching tokens ${p} for ${tokens[i]}`;
                            return;
                        }
                    }
                    if (!updateLoop) {
                        loopBackIndex[sequencer.length - 1] = 0; 
                        repeatCount[sequencer.length - 1] = DEF_REP_NUM; 
                        if (voltaArr.length > 0) {
                            voltaArr[voltaArr.length - 1][1] = loopBackIndex[sequencer.length - 1];    
                        }
                    }
                    repeatStack.push([REP_START, sequencer.length, DEF_REP_NUM]); 
                    continue;
                } else if (tokens[i] === DBL_BTB_REP) { 
                    if (voltaArr.length > 0 && voltaArr[voltaArr.length - 1][2] == tokens.length) {
                        voltaArr[voltaArr.length - 1][2] = sequencer.length; 
                    }
                    let p;
                    let updateLoop = false;
                    if (repeatStack.length) {
                        p = repeatStack.pop();
                        if (p[0] === DBL_REP_START || p[0] === BAR) {
                            if (p[0] === BAR && voltaArr.length > 1 && voltaArr[voltaArr.length - 1][1] == voltaArr[voltaArr.length - 2][1]) {
                                loopBackIndex[sequencer.length - 1] = voltaArr[voltaArr.length - 1][1];
                                repeatCount[sequencer.length - 1] = DEF_REP_NUM;  
                            } else {
                                loopBackIndex[sequencer.length - 1] = p[1];
                                repeatCount[sequencer.length - 1] = DEF_REP_NUM * p[2];
                            }
                            updateLoop = true;
                            if (voltaArr.length > 0) {
                                voltaArr[voltaArr.length - 1][1] = loopBackIndex[sequencer.length - 1];  
                            }
                        } else {
                            error.msg = `[Stack Error 4] contains wrong matching tokens ${p} for ${tokens[i]}`;
                            return;
                        }
                    }
                    if (!updateLoop) {
                        loopBackIndex[sequencer.length - 1] = 0; 
                        repeatCount[sequencer.length - 1] = DEF_REP_NUM; 
                        if (voltaArr.length > 0) {
                            voltaArr[voltaArr.length - 1][1] = loopBackIndex[sequencer.length - 1];    
                        }
                    }
                    repeatStack.push([DBL_REP_START, sequencer.length, DEF_REP_NUM]); 
                    continue;
                }
            }
        } else { 
            const match_rep_num = tokens[i].match(REP_NUM);
            if (match_rep_num) {
                beatCount = beatCount - jump;
                let p = repeatStack.pop();
                if ((p === undefined) || 
                    (length >= 2 && tokens[i-1] !== REP_START && tokens[i-1] !== DBL_REP_START && p.length !== 3) ||
                    (p[1] === 0 && sequencer.length !== 0)) {
                    error.msg = `[REPEAT MULTIPLIER ERROR] Invalid token at position ${i + 1}: "${tokens[i]}"`;
                    return;
                }
                const num = Number(match_rep_num[1]);  
                if (num > MAX_REPEAT_MULTIPLIER) {
                    error.msg = `[REPEAT MULTIPLIER ERROR] Invalid token at position ${i + 1}: "${tokens[i]}". Maximum multiplier allowed is: "(${MAX_REPEAT_MULTIPLIER}x)"`;
                    return;
                }  
                p[2] = num - 1; 
                repeatStack.push(p);
                continue;
            }
            const match_skip_num = tokens[i].match(SKIP_NUM);
            if (match_skip_num) {
                beatCount = beatCount - jump;
                voltaMap[sequencer.length] = voltaArr.length;
                voltaArr.push([false, 0, tokens.length]);   
                if (voltaArr.length > 1) {
                    if (voltaArr.length > MAX_VOLTA) {
                        error.msg = `[VOLTA BRACKETS ERROR] Too many volta brackets are in use (max allowed: ${MAX_VOLTA})`;
                        return;
                    }
                    voltaArr[voltaArr.length - 1][1] =  voltaArr[voltaArr.length - 2][1]; 
                }
                continue;
            }
            const match_aux = tokens[i].match(AUX);
            if (match_aux) {
                beatCount = beatCount - jump;
                error.msg = `Found an auxiliary token: "${tokens[i]}"`;
                if (match_aux[1].match(/^[A-Z]$/)) {
                    if (match_aux[1] in markerIndex) {
                        error.msg = `[AUX ERROR 1] Section marker "${match_aux[1]}" is already defined`;
                        return;
                    }
                    markerIndex[match_aux[1]] = currentSection; 
                    sectionMarker[markerIndex[match_aux[1]]] = sequencer.length;
                    currentSection += 1; 
                    continue;
                }
                if (match_aux[1].match(/^[A-Z]x\d+$/)) {                    
                    const letter = match_aux[1].match(/^[A-Z]/)[0];
                    const times = match_aux[1].match(/\d+$/)[0];
                    if (!(letter in markerIndex)) {
                        error.msg = `[AUX ERROR 2] Section marker "${letter}" is not defined`;
                        return;
                    }
                    if (times > MAX_SECTION_REP) {
                        error.msg = `[AUX ERROR 3] Section number "${times}" exceeds maximum limit of ${MAX_SECTION_REP}`;
                        return;
                    }
                    sectionMarker[currentSection] = sequencer.length;
                    currentSection += 1; 
                    let i = 0;
                    let left = markerIndex[letter];
                    let right = left + 1;
                    if (right < sectionMarker.length) {
                        right = sectionMarker[right]-1; 
                    } else {
                        right = sequencer.length-1;
                    }
                    left = sectionMarker[left]; 
                    let offset = sequencer.length - 1 - right; 
                    let distance = right - left + 1;  
                    let temp = [];
                    while (i < times) {
                        temp.push(...sequencer.slice(left, right + 1));
                        for (let key in loopBackIndex) {
                            key = Number(key); 
                            if (key >= left && key <= right) {
                                let newkey = key + offset + distance * (i + 1);
                                let newvalue = loopBackIndex[key] + offset + distance * (i + 1);
                                loopBackIndex[newkey] = newvalue;
                            }
                        }
                        for (let key in repeatCount) {
                            key = Number(key); 
                            if (key >= left && key <= right) {
                                let newkey = key + offset + distance * (i + 1);
                                let newvalue = repeatCount[key]; 
                                repeatCount[newkey] = newvalue;
                            }
                        }
                        for (let key in voltaMap) {
                            key = Number(key);
                            if (key >= left && key <= right) {
                                let newkey = key + offset + distance * (i + 1);
                                let newvalue = voltaArr.length;
                                voltaMap[newkey] = newvalue;
                                let volta    = voltaArr[voltaMap[key]];
                                let newvolta = [volta[0],volta[1] + offset + distance*(i+1), volta[2] + offset + distance*(i+1)];
                                voltaArr.push(newvolta);
                            }
                        }
                        i += 1;
                    }
                    sequencer.push(...temp);
                    beatCount = beats;
                    continue;
                } else if (match_aux[1].match(/^[A-Z]\*\d+$/)) {           
                    const letter = match_aux[1].match(/^[A-Z]/)[0];
                    const times = match_aux[1].match(/\d+$/)[0];
                    if (!(letter in markerIndex)) {
                        error.msg = `[AUX ERROR 4] Section marker "${letter}" is not defined`;
                        return;
                    }
                    if (times > MAX_SECTION_REP) {
                        error.msg = `[AUX ERROR 5] Section number "${times}" exceeds maximum limit of ${MAX_SECTION_REP}`;
                        return;
                    }
                    sectionMarker[currentSection] = sequencer.length;
                    currentSection += 1; 
                    let i = 0;
                    let left = markerIndex[letter];
                    let right = left + 1;
                    if (right < sectionMarker.length) {
                        right = sectionMarker[right] - 1;
                    } else {
                        right = sequencer.length - 1;
                    }
                    left = sectionMarker[left]; 
                    let temp = [];
                    while (i < times) {
                        temp.push(...sequencer.slice(left, right + 1));
                        i += 1;
                    }
                    sequencer.push(...temp);
                    beatCount = beats;
                    continue;
                } 
                if (roadmapTokens.has(match_aux[1])) {
                    if (match_aux[1] in roadmap) {
                        error.msg = `[ROADMAP DUPLICATE ERROR] too many roadmap markers: ${tokens[i]}`;
                        return;
                    }
                    roadmap[match_aux[1]] = sequencer.length;
                    roadmapVisited[match_aux[1]] = poofRepeat; 
                    if (sequencer.length in roadmap) {
                        error.msg = `[ROADMAP EXIST ERROR] too many existing roadmap markers at position ${i}`;
                        return;
                    }
                    roadmap[sequencer.length] = match_aux[1];
                    if (match_aux[1] === DC || match_aux[1] === DCALCODA || match_aux[1] === DCALFINE) {
                        if (roadmapMode) {
                            error.msg = `[ROADMAP DC DACAPO ERROR] too many dc dacapo repeats: ${DC} ${DCALCODA} ${DCALFINE}`;
                            return;
                        }
                        roadmapMode = match_aux[1];
                        roadmapRank[0] = match_aux[1];
                    } else if (match_aux[1] === DS || match_aux[1] === DSALCODA || match_aux[1] === DSALFINE) {
                        if (roadmapMode) {
                            error.msg = `[ROADMAP DS SEGNO ERROR] too many ds segno repeats: ${DS} ${DSALCODA} ${DSALFINE}`;
                            return;
                        }
                        roadmapMode = match_aux[1];
                        roadmapRank[0] = match_aux[1];
                    }
                    if (match_aux[1] === SEGNO) {
                        if (roadmapRank[1]) {
                            error.msg = `[ROADMAP SEGNO ERROR] too many $ symbols repeats`;
                            return;
                        }
                        roadmapRank[1] = match_aux[1];
                    } else if (match_aux[1] === TOCODA) {
                        if (roadmapRank[2]) {
                            error.msg = `[ROADMAP TOCODA ERROR] too many TO.CODA symbols repeats`;
                            return;
                        }
                        roadmapRank[2] = match_aux[1];
                    } else if (match_aux[1] === CODA) {
                        if (roadmapRank[3]) {
                            error.msg = `[ROADMAP + ERROR] too many + symbols repeats`;
                            return;
                        }
                        roadmapRank[3] = match_aux[1];
                    } else if (match_aux[1] === FINE) {
                         if (roadmapRank[4]) {
                            error.msg = `[ROADMAP FINE ERROR] too many FINE symbols repeats`;
                            return;
                        }
                        roadmapRank[4] = match_aux[1];
                    }
                }
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
    const result = [sequencer, loopBackIndex, repeatCount, end, voltaMap, voltaArr, roadmap, roadmapVisited, roadmapRank];
    validArgs.add(result); 
    PULSE_FLAG = true;       
    DEF_ROADMAP_VISITED = 1; 
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
    audioCtx = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: 'playback'
    });
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
  var voltaMap = {};
  var voltaArr = [];
  var roadmap  = {};
  var roadmapVisited = {};
  var roadmapRank = [];
  if (validArgs.has(sequencerObj)) {
    [sequencer,loopBackIndex,repeatCount,end=END,voltaMap,voltaArr,roadmap,roadmapVisited,roadmapRank] = sequencerObj;
    validArgs.delete(sequencerObj); 
    const problem = `Sequencer object will be removed from WeakSet right after playing`;
    oops(problem, 'warning', FULL_ASYNC_DEBUG_MODE);
  } else {
    const problem = `[SEQUENCER WARNING] Must run buildSequencer() first before feeding result to playSequencer(). Using default sequencer: ${JSON.stringify(SMP_SEQUENCER)} with tempo: ${BPM.val} bpm`;
    oops(problem, 'warning');
  }
  if (taskDropper) taskDropper.abort();
  taskDropper = new AbortController();
  const { signal } = taskDropper;
  let i = 0; 
  let n = sequencer.length;
  let timeout = 0; 
  let tempRepeatCount = JSON.parse(JSON.stringify(repeatCount));     
  oops('🤟 | | |', 'info');
  playNote(FAKE,MIN_OCTAVE,STACKATO_LEGATO,MIN_VOL); 
  await _delay(DEF_MSEC, signal); 
  oops('✌️ | |', 'info');
  playNote(FAKE,MIN_OCTAVE,STACKATO_LEGATO,MIN_VOL); 
  await _delay(DEF_MSEC, signal); 
  oops('☝️ |', 'info');
  playNote(FAKE,MIN_OCTAVE,STACKATO_LEGATO,MIN_VOL); 
  await _delay(DEF_MSEC, signal);     
  while (!signal.aborted && timeout < MAX_TIMEOUT) {
    timeout += 1;
    i = 0;
    for (let j = 0, len = voltaArr.length; j < len; j++) {             
        voltaArr[j][0] = false;
    }
    let tempRoadmapVisited = JSON.parse(JSON.stringify(roadmapVisited));     
    let tempRank = [...roadmapRank];
    while (i < n) {
      if (signal.aborted) break;
      if (i in roadmap) {
        let f = poof(sequencer, roadmap, roadmapVisited, roadmapRank, i);
        if (f >= 0) {
            i = f;
            continue;
        } else if (f == -8 || f == -3) {
            oops(getErrorMsg(), 'error');
            return;
        }
      }
      if (i in voltaMap) {
        if (!voltaArr[voltaMap[i]][0]) {      
            _playSequencerChord(sequencer[i],DEF_OCTAVE,STACKATO_LEGATO);
            await _delay(DEF_MSEC, signal);
            voltaArr[voltaMap[i]][0] = true;
            i += 1;
        } else {
            while ((i < n) && (i in voltaMap) && (voltaArr[voltaMap[i]][0])) {
                i = voltaArr[voltaMap[i]][2]; 
            }    
        }
      } else {
        _playSequencerChord(sequencer[i],DEF_OCTAVE,STACKATO_LEGATO);
        await _delay(DEF_MSEC, signal);
        if (i in loopBackIndex) { 
            if (repeatCount[i] > 0) {
                repeatCount[i] -= 1;
                i = loopBackIndex[i];
            } else {
                if ((!end) || (i !== n-1)) {
                    repeatCount[i] = tempRepeatCount[i];
                }
                i += 1;
            }
        } else {
            i += 1;
        }
      }
    }
    if (end && (!(n-1 in repeatCount) || repeatCount[n-1] == 0)) {
        oops('♪ ♫ 👏 Whoohoo! 👏 ♫ ♪ ', 'info');
        return;
    } else {
        roadmapRank = tempRank; 
        roadmapVisited = tempRoadmapVisited; 
        oops('👏🎺🎉Encore, back for more!🎉🎺👏', 'info');
    }
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
function oops(message, type = 'info', show=true) {
    if (typeof(global) !== "object" || global !== window) {
        const problem = `[Oops ERROR] Oops function is currently supported in browser environment only`;
        error.msg = problem;
        alert(problem);
        return problem;
    }
    if (!show) {
        return;
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
function setPoof(d) {
    if (d == "OnRepeat") {
        DEF_ROADMAP_VISITED = 0;
    } else {
        const problem = `[POOF ERROR] To make roadmap markers start working from second repeat, use phrase Poof:OnRepeat`;
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
function hasComment() {
    return cmtExist;
}
function getRoadmapMode() {
    return roadmapMode;
}
function poof(sequencer, roadmap, roadmapVisited, roadmapRank, i) {
    if (!(i in roadmap) || !(sequencer) || (sequencer.length <= 0)) {
        return -4;
    }
    while (roadmapRank.length && !roadmapRank[0]) {
        roadmapRank.shift();
    }
    if (roadmapRank.length == 0) {
        return -7;
    }
    const PF = roadmap[i];
    if (roadmapVisited[PF] === 0) {
        roadmapVisited[PF] += 1;
        return -1;
    } else if (roadmapVisited[PF] === MAX_ROADMAP_VISITED) {
        return -2;
    }
    roadmapVisited[PF] += 1;
    let cmode = getRoadmapMode();
    if ((!cmode) ||
        ( 
          (PF === SEGNO && !cmode.includes(DS)) || 
          (PF === CODA && !cmode.includes(_CODA_)) || 
          (PF === TOCODA && !cmode.includes(_CODA_)) ||
          (PF !== SEGNO && PF !== CODA && PF !== TOCODA && !cmode.includes(PF))
        )) {
        error.msg = `[ROADMAP RUNTIME ERROR] Please read for symbol (${PF}) usage`;
        return -3;
    }
    if (PF === roadmapRank[0]) {
        roadmapRank.shift();
        if (PF === FINE) {
            return sequencer.length;
        } else if (PF === SEGNO) {
            return roadmap[SEGNO];
        } else if (PF === CODA) {
            return roadmap[CODA];
        } else if (PF === TOCODA) {
            if (!(CODA in roadmap)) {
                error.msg = `[ROADMAP RUNTIME ERROR] CODA symbol ${CODA} not found`;
                return -8;
            } 
            return roadmap[CODA];
        } else if (PF === DC || PF === DCALCODA || PF === DCALFINE) {
            return 0;
        } else if (PF === DS || PF === DSALCODA || PF === DSALFINE) {
            if (!(SEGNO in roadmap)) {
                error.msg = `[ROADMAP RUNTIME ERROR] SEGNO symbol ${SEGNO} not found`;
                return -8;
            }
            return roadmap[SEGNO];
        } else {
            return -5;
        }
    } else {
        return -6;
    }    
}
})(typeof window !== "undefined" ? window : this);