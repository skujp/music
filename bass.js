(function(global) {
const VERSION = "9.1.2";
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
const manual = 
`| Rev ${VERSION} |

||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

I. INTRODUCTION

BASS, pronounced /beɪs/, spelled /B-A-S-S/ all uppercase, is a musical chord
notation system. Derived from the word 'bass clef' of a piano instrument, it
uses common musical symbols often found in a sheet music. Anyone can use the
BASS system to try new chord progressions, compose, or learn music. The world is
your oyster!!!

||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

II. THE BASICS

1. Note
A musical note is a single, basic building block of music. For a piano common
musical scale, it can be written as: C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb
B.

2. Chord
A chord is a group of three or more notes played at the same time. For example,
chord C (C major) consists of C E G. Chord C/E (C major / bass E) consists of C
E G with a bass note E. Currently, the BASS system supports the following chord
type notations: C (C Major), Cm (C Minor), Caug (C Augmented), Cdim (C
Diminished), Cmaj7 (C Major 7), C7 (C Dominant 7), Cm7 (C Minor 7), Cmmaj7 (C
Minor-Major 7), Cm7b5 (C Half-Diminished), C7b5 (C Dominant-seventh flat five),
Cdim7 (C Fully Diminished), Csus2 (C Suspended 2), Csus4 (C Suspended 4), Cadd9
(C Add 9), C5 (C Power Chord), Cmaj9 (C Major 9), C6 (C Major 6), C9 (C 9), C/E
(C with E in the bass), Cmaug (C Minor Augmented).

3. Sheet Music
A sheet music is a written or printed guide for musicians. In the BASS system, a
chord (NOT note) is the basic unit of a sheet music. For example, 4/4 | C C C C
|| means to play chord C Major four times (NOT single C note four times).

4. Time Signature
A time signature is a musical notation symbol made of two stacked numbers
telling about the rhythm of a song such as: 4/4, 3/4, 6/8, etc. Time signature
is usually written in the beginning of a sheet music. For example, 3/4 | A B C |
D E / |. If the sheet music does not start with a time signature, by default the
time signature is 4/4. For example, | F D A C | B A B A |. Please note that,
time signature in the BASS system has more varieties than common sheet music.
For example, the nominator part represents the number of beats in a bar. The
denominator part is a power of two, representing a fraction of a whole note for
adjusting the actual sheet music speed. For example, 8/16 means there are 8
beats in a bar, and the actual music speed will be adjusted based on the 16th
note. This is to accomodate the treble clef parts and other instruments. So do
not be surprised if you see a time signature such as 123/256 in the BASS system
:)

5. Time Measure
Time Measure (or Bar) is a small container of time that holds a specific number
of beats. For example, the following bar contains 3 beats: | / / / |, this bar
contains 0 beat: | | Please note that, this Bar refers to time measure, not to
be confused with single Bar symbol | or double bar symbol ||

6. Opening Section
An opening section begins the sheet music. It may or may not have a leading
tone. If it has a leading tone, the number of opening beats can not go over the
nominator beats of time signature. For example, A A | D / D / | Amaj7 / Amaj7 /
|| is accepted with a leading tone A A (2 beats). Please note that, without a
leading tone, an opening section usually starts with a | or |: or ||: Besides, a
double bar symbol || is currently not supported in opening section to avoid any
confusion with the ending section.

7. Repeat Section
A repeat section (or loop) is a section which is played again and again. The
loop usually looks like this |: :| or ||: :|| or a loop back from beginning such
as | :| and | :|| In some cases, it can use back to back loop :|: or :||:
symbols. For example, |: :|: :| or ||: :||: :|| By default, repeat section will
loop for 1 time (2x), but it is up to the user to modify it using repeat
multipliers such as (3x), (4x), etc. For example, |: (4x) F / / C | B / / A :|
means loop 4 times over the 2 bars of chords. In the BASS system, if there is no
matching opening repeat symbols, it will go back to the beginning. For example,
2/4 | C D | F G :| A B :| G G ||, each time seeing a repeat symbol :| it will go
back to the beginning.

8. Branching Section
A branching section (or volta bracket) is used to skip from one section to
another of a sheet music AFTER REPEAT. It is written as an open bracket followed
by a number and a dot. For example, [1. [2. [3. [123. , etc. The next example is
a section of a sheet music which will skip [1. and jump to [2. after repeat: 4/4
|: A A A A | [1. B B B B :| [2. C C C C | D D D D | Please note that, the BASS
system implements positional volta brackets, which include usages beyond common
music notation. For example, 3/4 | C C C |: D D D | A A A | [40. D D D :| [20. F
F F :| [30. B B B || After the 1st repeat, it will skip [40. bar to the next bar
[20. After the 2nd repeat, it will skip [40. bar and [20. bar to the next bar
[30. Please note that, the branching section relies on repeat symbols :| or :||
to move back to the closest matching |: or ||: If not finding a match, it will
go back to the beginning of the sheet music. Also, colliding numbers for
branching section are allowed but NOT RECOMMENDED for the clarity of a music
sheet. For example, instead of writing 3/4 | C C C | [1. D D D :| [1. E E E ||
it is recommended to replace the second [1. as [2. or so. Last, branching
section can coexist with multipliers from repeat sections. However, it will
override the default behavior of multipliers in repeat sections. For example,
2/4 | (123x) A A | [1. B B :| C C || will ignore (123x) on the second repeat.

9. Ending Section
A sheet music must end with either a single bar | or a double bar || symbol. If
it ends with a || symbol, the system will stop playing (no loop back).
Otherwise, the system by default will keep looping back from the beginning even
without the user's intervention. Please note that, if it ends with :| or :||
symbol, it will loop back according to music sheet movement direction before the
default system loop back kicks in. For the case of :|| symbol, it will stop
eventually.

10. Classical Rule
If there is a leading tone, this classical rule will be applied: The number of
opening beats and ending beats must equal the nominator beats in time signature.

11. Tempo
Tempo is the speed or pace at which a piece of music is played. It is the number
of beats per minutes (bpm) set up before playing the sheet music. In the BASS
system, by default it is set to 90, assuming quarter note is in time signature
(4/4). The user can change tempo manually. Please note that, the actual final
sheet music speed will be adjusted based on time signature (section IV).

12. Octave
An octave is the distance between two musical notes that share the same name
(like two different C notes). It is exactly eight steps apart on a common
musical scale. In the BASS system, octave ranges can be from 0 to 8 where 0 is
the lowest bass, and 8 is the highest bass. By default, it uses octave 4 similar
to the concept of middle C in a piano. User can change it manually (section IV).

13. Space
Every musical symbol must be separated by a blank space. The recommended space
is 1 blank symbol between two musical symbols. For example, one blank space
between two opening notes in this sheet music 2/4 D D | F F |

14. Pulse /
A pulse / means the user can either play the previous note or sustain it
(legato). By default, the BASS system will play the previous note (staccato).
For example, | B A / | will play B A A chords. Please note that, a pulse / is
different than a slash / in a slash chord. For example, A/E means A major chord
with a E at the bass. To sustain, set control directive Sustain:Yes at the
beginning of the sheet music (section IV).

15. Duplicate %
A duplicate % means repeat playing the previous bar. For example, | A B C | % ||
will play A B C A B C

16. Section Marker (#)
A group of bars can be marked with a section marker such as (A) (B) (C), etc.
Inside the parenthesis, it must be a single uppercase letter from A to Z. Once a
section marker is defined, it can be used later in the sheet music to repeat
that section. For example, 3/4 | (A) F G A | B C D | (B) E F G | (C) D E F |
(Bx3) || means the last bar will repeat the section marked with (B) three times.
Please note that, the section marker must be defined before used. For example,
3/4 | D D D | (Mx2) G G G | will raise an error because (M) is not defined
before it is used. Another example, 4/4 |: (3x) (T) C D E F :| (G) G A B C |
(Tx2) || means the last bar will repeat 2 times the first bar (including 3x), so
it will be played in total 6 times. By default, the marker works by scanning
until the next marker is available to determine which section to repeat. If it
doesn't find any marker, it will scan until the end of the sheet music. For
example, 4/4 | C D E F | (Z) G A B C | D E F G | (Zx1) || means the last bar
will do a 1 time repeat for section (Z), which is G A B C | D E F G | Please
note that, there are 3 types of notations often used in section marker (section
III). For example, (Z), (Zx2), and (Z*2), in which (Z) is the section marker
definition, (Zx2) is the section marker usage with 2 times repeat (INCLUDING
multipliers), and (Z*2) is the section marker usage with 2 times repeat
(EXCLUDING multipliers). For example, 3/4 | A A A |: (3x) (Q) B B B :| (Qx3) ||
will play the last bar 9 times in total because of the multiplier (3x), whereas
3/4 | A A A |: (3x) (Q) B B B :| (Q*3) || will play the last bar 3 times only.
Please note that, (Zx2) also works with branching section, preserving the
branching behavior, whereas (Z*2) will ignore branching behavior.

17. Commented Out Section
Commented out section (or Vi-De) is a special marked section NOT to be played in
a sheet music. The commented opening symbol (Vi) is <- and the closing (De) is
-> They are usually set after the opening section of a sheet music (section
I.6). For example, 2/4 | G G | <- A A | B B | -> D D | <- E E | -> F F || will
only play | G G | D D | F F || This Vi-De mode can be useful to test playing
only specific parts of the sheet music. Please note that, sometimes playback
does not echo any sound due to the commented sheet music containing only BM /
chords. For example, | <- D D D D | -> / / / / ||

18. Roadmap Symbols
In a sheet music, there are special symbols ('roadmap symbols') which designate
to change the music flow such as:
(D.C.) : Go back to the beginning
(D.S.) : Go to SEGNO symbol ($)
(DC.AL.CODA) : Go back to the beginning, play until (TO.CODA) symbol, then jump
to CODA symbol (+)
(DS.AL.CODA) : Go to SEGNO symbol ($), play until (TO.CODA) symbol, then jump to
CODA symbol (+)
(DC.AL.FINE) : Go back to the beginning, play until (FINE) symbol, then end the
music
(DS.AL.FINE) : Go to SEGNO symbol ($), play until (FINE) symbol, then end the
music
By default, in the BASS system during playback, when encountering these symbols,
it will immediately change the music direction. For example, 2/4 | G G | C ($) C
| E (TO.CODA) E | (D.S.AL.CODA) F (+) F || will play G G C C E E C E F.
Sometimes, musicians would prefer to apply those symbols from the second time
after music repeat instead. In such cases, they must set the special control
directive Poof:OnRepeat (section IV). For example, Poof:OnRepeat 2/4 | G G | C
($) C | E (TO.CODA) E | (D.S.AL.CODA) F (+) F :|| will play G G C C E E F F the
1st time through, then play G G C C E E C E F like before. Please note that
these special roadmap symbols should be used with CAUTION to avoid any confusion
in the sheet music. Also, they can be applied for only ONE TIME during the whole
playback in the BASS system.

||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

III. THE CHORD-BASED NOTATION SYSTEM

Time Signature:
3/4 4/4 6/8 2/2 2/4 12/8 5/4 7/8 9/8 11/8 13/8 15/16 7/4 3/8 6/16 32/64 8/128
123/512 ...

Bar:
|

Opening (incl. repeat):
| |: ||:

Closing (incl. repeat):
| || :| :||

Repeat:
:|
:||
|: :|
||: :||
|: :|: :|
||: :||: :||

Multiplier:
(1x) (2x) (3x) (4x) (5x) ...

Branching (Volta):
[1. [2. [3. [4. [99. [101. [123. ...

Pulse:
/

Duplicate:
%

Chord:
m aug dim maj7 7 m7 mmaj7 m7b5 7b5 dim7 sus sus2 sus4 add9 5 maj9 6 9 / maug

Annotation:
(intro) (verse) (chorus) (bridge) (outro) (sustain) (p) (mf) (f) (ff) (allegro)
(moderato) (adagio) (lyrics_separated_by_underscores) ...

Section Marker:
(#) (#x<number>) (#*<number>)

Comment (Vi-De):
<- ->

Roadmap:
(FINE) ($) (+) (TO.CODA) (D.C.) (D.S.) (D.C.AL.CODA) (D.S.AL.CODA) (D.C.AL.FINE)
(D.S.AL.FINE)

||||||
Remark:
... means et cetera
# means any uppercase letter A-Z
<number> means any non-negative integer
roadmap symbols are all uppercase

||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

IV. SPECIAL NOTATIONS

The following notations are separate from the core musical notation system. They
are case-sensitive and used for special purposes such as changing music tempo,
tuning middle C, or save the sheet music to PDF or BASS files. Please note that,
they must be written at the beginning of the sheet music. Also, any value after
the double dot symbol (:) can not have any blank space. In the BASS system, it
is recommended to use the underscore _ symbol. For example, Composer:Loremipsum_
Dolorsitamet_Maximus_Vesterialian_Batiatus_Mortdevold_Ninja_Chkft

Tempo:<number> for example, Tempo:100 to set BPM=100
Octave:<number> for example, Octave:5 to set middle C to C5
SaveAs:PDF to save as pdf file using default host system
SaveAs:BASS to save as .bass file
Sustain:Yes to disable playing previous BM chord /
Sustain:No to enable playing previous BM chord /
Title:<name> for example, Title:My_awesome_melody, required for .bass
Artist:<name> for example, Artist:The_BASS
Musician:<name> for example, Musician:BeatBox
Composer:<name> for example, Composer:RHYTHME
Arranger:<name> for example, Arranger:ChoRder
Singer:<name> for example, Singer:Unknown
Writer:<name> for example, Writer:Folklore
Author:<name> for example, Author:Unknown
Song:<name> for example, Song:Hip_And_Hop
Performer:<name> for example, Performer:Super-nova
Genre:<type> for example, Genre:Rap
Cover:Yes to confirm it is a cover
Remix:Yes to confirm it is a remix
Original:Yes to confirm it is your original masterpiece
Contributor:<name> for example, Contributor:Newbie_Composer, required for .bass
Derivative:Yes to confirm it is an arrangement from others' masterpiece
URL:<address> URL:https://youtube.com/yourmusicchannel, optional but recommended
for .bass
Misc:<anything> for example, Misc:anything_separated_by_underscore
Poof:OnRepeat to activate roadmap symbols only after the music is repeated

Please note that, when setting Octave:<number> above, it is to set the BASS
default system octave. It is not the same as the default octave used in other
instruments for treble clef parts.

||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

V. BASSBOARD CHART

This section is also separate from the core musical notation system. It serves
as a demo collection of sheet music where users can contribute to. To be listed
on the chart, please save to .bass file and send it to this email:
bassthemusic101 |at| gmail |dot| com. Please note that, certain settings are
required in order to save to .bass such as Title: Contributor: or URL: (section
IV). Last, any music (chords, rhythms, melody) is allowed, but lyrics and URLs
will be checked for explicit content prior to posting. A masterpiece with
clarity is always appreciated! :)

||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

VI. QWERTY KEYBOARD

For the treble clef parts of the BASS system:
- Piano notes are mapped to qwerty and number row of a QWERTY computer keyboard.
For example, q,w,e,r,t,2,3...
- Guitar notes are mapped to next rows. For example, a s d f g for frets and h j
k l ; ' for strings 6 to 1.

||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

VII. DISCLAIMER

The BASS system is written by a music enthusiast to help you learn rhythms,
chords, and very basic compositions. It is by no means to replace a trained
professional who can guide you through your complete music endeavor. If you are
a strictly classically trained musician, this system may not be the right fit
for you. Well, enjoy and have fun! :)

||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

VIII. SOURCE

The BASS source code is as below. The library file is bass.js

https://github.com/skujp/music

|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| 
    `;
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
                        error.msg = `[ROADMAP DUPLICATE ERROR] too many roadmap symbols: (${tokens[i]})`;
                        return;
                    }
                    roadmap[match_aux[1]] = sequencer.length;
                    roadmapVisited[match_aux[1]] = poofRepeat; 
                    if (sequencer.length in roadmap) {
                        error.msg = `[ROADMAP EXIST ERROR] too many existing roadmap symbols at position ${i}`;
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
                            error.msg = `[ROADMAP SEGNO ERROR] too many ($) symbols repeats`;
                            return;
                        }
                        roadmapRank[1] = match_aux[1];
                    } else if (match_aux[1] === TOCODA) {
                        if (roadmapRank[2]) {
                            error.msg = `[ROADMAP TOCODA ERROR] too many (TO.CODA) symbols repeats`;
                            return;
                        }
                        roadmapRank[2] = match_aux[1];
                    } else if (match_aux[1] === CODA) {
                        if (roadmapRank[3]) {
                            error.msg = `[ROADMAP + ERROR] too many (+) symbols repeats`;
                            return;
                        }
                        roadmapRank[3] = match_aux[1];
                    } else if (match_aux[1] === FINE) {
                         if (roadmapRank[4]) {
                            error.msg = `[ROADMAP FINE ERROR] too many (FINE) symbols repeats`;
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
        const problem = `[POOF ERROR] To make roadmap symbols start working from second repeat, use phrase Poof:OnRepeat`;
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
                error.msg = `[ROADMAP RUNTIME ERROR] CODA symbol (${CODA}) not found`;
                return -8;
            } 
            return roadmap[CODA];
        } else if (PF === DC || PF === DCALCODA || PF === DCALFINE) {
            return 0;
        } else if (PF === DS || PF === DSALCODA || PF === DSALFINE) {
            if (!(SEGNO in roadmap)) {
                error.msg = `[ROADMAP RUNTIME ERROR] SEGNO symbol (${SEGNO}) not found`;
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