"use strict";
if (!Object.entries) {
  Object.entries = function (obj) {
    var ownProps = Object.keys(obj),
        i = ownProps.length,
        resArray = new Array(i);
    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }
    return resArray;
  };
}
if (typeof window.AbortController === "undefined") {
  var AbortSignalMock = function() {
    this.aborted = false;
    this._listeners = {};
  };
  AbortSignalMock.prototype.addEventListener = function(type, listener) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push(listener);
  };
  AbortSignalMock.prototype.removeEventListener = function(type, listener) {
    if (!this._listeners[type]) return;
    var index = this._listeners[type].indexOf(listener);
    if (index !== -1) this._listeners[type].splice(index, 1);
  };
  var AbortControllerMock = function() {
    this.signal = new AbortSignalMock();
  };
  AbortControllerMock.prototype.abort = function() {
    if (this.signal.aborted) return;
    this.signal.aborted = true;
    if (this.signal.onabort) this.signal.onabort();
    var listeners = this.signal._listeners["abort"] || [];
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]({ type: "abort", target: this.signal });
    }
  };
  window.AbortController = AbortControllerMock;
  window.AbortSignal = AbortSignalMock;
}

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
(function (global) {
  var VERSION = "6.0.0";
  var error = {
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
  };
  var DEBUG_MODE = false;
  var FULL_ASYNC_DEBUG_MODE = false;
  var DEF_INST = "piano";
  var DEF_SUPPORT_INST = new Set([DEF_INST, "drum", "guitar", "flute"]);
  var instrument = DEF_INST;
  var audioCtx = null;
  var masterGain = null;
  var _oBass = global.bass;
  var TheBass = {};
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
  attach(TheBass, {
    rename: rename,
    setDebug: setDebug,
    help: help,
    getErrorMsg: getErrorMsg,
    getChordNotes: getChordNotes,
    buildSequencer: buildSequencer
  });
  attach(TheBass, {
    setFullAsyncDebug: setFullAsyncDebug,
    getFullAsyncDebugMode: getFullAsyncDebugMode,
    oops: oops,
    playNote: playNote,
    playChord: playChord,
    playSequencer: playSequencer,
    stopSequencer: stopSequencer,
    setTempo: setTempo,
    setOctave: setOctave,
    getOctave: getOctave,
    getTempo: getTempo,
    getSampleTestCase: getSampleTestCase,
    getMaxSheetLength: getMaxSheetLength,
    setSaveAs: setSaveAs,
    setSustain: setSustain,
    getSustain: getSustain,
    getInstrument: getInstrument,
    setInstrument: setInstrument,
    getDuration: getDuration,
    getGuitarNote: getGuitarNote,
    getVersion: getVersion
  });
  var BPM = {
    _val: 90,
    get val() {
      return this._val;
    },
    set val(v) {
      this._val = v;
      DEF_DURATION = 60 / this._val * (beats / beatType);
      DEF_MSEC = DEF_DURATION * 1000;
      error.msg = "reshaking for time signature ".concat(beats, "/").concat(beatType, " : one note now lasts ").concat(DEF_DURATION, " seconds");
    }
  };
  var BAR = "|";
  var DBL_BAR = "||";
  var REP_START = "|:";
  var REP_END = ":|";
  var DBL_REP_START = "||:";
  var DBL_REP_END = ":||";
  var BAR_REPEAT = "%";
  var BM = "/";
  var REP_NUM = /\((\d+)x\)/;
  var BTB_REP = ":|:";
  var DBL_BTB_REP = ":||:";
  var SKIP_NUM = /\[(\d+)\./;
  var TIME_SIG = /^(\d+)\/(1|2|4|8|16|32|64|128|256|512|1024)$/;
  var AUX = /^\(([^)]+)\)$/;
  var MAX_SHEET_LENGTH = 3000;
  var FAKE = "G";
  var DEF_OCTAVE = 4;
  var STACKATO_LEGATO = 0.0001;
  var MIN_OCTAVE = 0;
  var MAX_OCTAVE = 8;
  var MIN_TEMPO = 30;
  var MAX_TEMPO = 300;
  var MIN_VOL = 0.0001;
  var MAX_VOL = 1;
  var PULSE_FLAG = true;
  var END = false;
  var SMP_SEQUENCER = [[['F', 'A', 'C'], 'C'], [['A', 'C', 'E'], 'E']];
  var DEF_REP_NUM = 1;
  var DEF_TIME_SIGNATURE = '4/4';
  var DEF_BEAT_JUMP = 1;
  var CLASSICAL_CHECK = true;
  var LST_SKIPNUM = 1;
  var OCTAVE_LENGTH = 12;
  var EMPTY = "";
  var _DEF_TIME_SIGNATURE$s = DEF_TIME_SIGNATURE.split('/').map(Number),
    _DEF_TIME_SIGNATURE$s2 = _slicedToArray(_DEF_TIME_SIGNATURE$s, 2),
    beats = _DEF_TIME_SIGNATURE$s2[0],
    beatType = _DEF_TIME_SIGNATURE$s2[1];
  var DEF_DURATION = 60 / BPM.val;
  var DEF_MSEC = DEF_DURATION * 1000;
  var SMP_TESTCASE = "Title:Rhythmeus\nComposer:Chordius\nPerformer:⌨Qwerty🖱Clicky📲Tappy\n\n3/4 |: F7 / G | % | [1. G D G/D :| [2. Bmaj7 Aaug Fdim ||";
  var SAVE_AS_TYPES = new Set(["PDF", "BASS"]);
  var BASSBOARD_DB_FIELD = new Set(["Contributor", "Title"]);
  var CTRL_FUNCS = /^(Title|Contributor|Artist|Composer|Arranger|Singer|Writer|Author|Musician|Song|Performer|Cover|Remix|Original|Genre|Tempo|Octave|SaveAs|Sustain|URL|Misc|Derivative)(:)(.+)$/;
  var taskDropper = null;
  var validArgs = new WeakSet();
  var _sheetMusic;
  var notes = _initMusicMajorScale();
  function _initMusicMajorScale() {
    var baseNotes = {
      1: 'C',
      2: 'C#',
      3: 'D',
      4: 'D#',
      5: 'E',
      6: 'F',
      7: 'F#',
      8: 'G',
      9: 'G#',
      10: 'A',
      11: 'A#',
      12: 'B'
    };
    var notes = _objectSpread({}, baseNotes);
    for (var _i = 0, _Object$entries = Object.entries(baseNotes); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        key = _Object$entries$_i[0],
        value = _Object$entries$_i[1];
      notes[value] = Number(key);
    }
    var flatNotes = {
      'Db': 2,
      'Eb': 4,
      'Gb': 7,
      'Ab': 9,
      'Bb': 11
    };
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
    var manual = "";
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
    manual += "Rev ".concat(VERSION);
    error.msg = "Loading manual...";
    return manual;
  }
  function getErrorMsg() {
    return error.msg;
  }
  function getChordNotes() {
    var chord = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : FAKE;
    var chordRegex = /^([A-G])(#|b)?(m|maj|min|dim|aug|sus|maug)?(add|maj)?(\d*)?((b)(\d+))?(\/([A-G])(#|b)?)?\s*$/;
    chord = chord.trim();
    var match = chord.match(chordRegex);
    if (!match) {
      error.msg = "Invalid chord: ".concat(chord);
      return;
    }
    var root = match[1] + (match[2] || '');
    var quality = match[3] || '';
    var extension = match[4] || '';
    var number = match[5] || '';
    var eflat = match[6] || '';
    var eflatNumber = match[8] || '';
    var ebass = match[9] || '';
    var ebassRoot = match[10] + (match[11] || '') || '';
    var rootNoteNumber = notes[root];
    if (rootNoteNumber === undefined) {
      error.msg = "Invalid root for the chord: ".concat(chord);
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
    var chordNotes = new Set();
    chordNotes.add(rootNoteNumber);
    if (thirdNoteNumber) chordNotes.add(thirdNoteNumber);
    if (fifthNoteNumber) chordNotes.add(fifthNoteNumber);
    if (sixthNoteNumber) chordNotes.add(sixthNoteNumber);
    if (seventhNoteNumber) chordNotes.add(seventhNoteNumber);
    if (ninthNoteNumber) chordNotes.add(ninthNoteNumber);
    var noteNames = [];
    var _iterator = _createForOfIteratorHelper(chordNotes),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var noteNumber = _step.value;
        var nn = notes[noteNumber];
        if (nn === undefined) {
          error.msg = "Invalid note number: ".concat(noteNumber);
          return null;
        }
        noteNames.push(nn);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    if (ebassNoteNumber) {
      var base = notes[ebassNoteNumber];
      if (base === undefined) {
        error.msg = "Invalid bass note number: ".concat(ebassNoteNumber);
        return null;
      }
      return [noteNames, base];
    }
    return [noteNames, null];
  }
  ;
  function buildSequencer() {
    var sheetMusic = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : EMPTY;
    var pulseFlag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : PULSE_FLAG;
    _sheetMusic = {};
    if (sheetMusic.length > MAX_SHEET_LENGTH) {
      error.msg = "[SHEET MUSIC ERROR] sheet music length exceeds limit";
      return;
    }
    var timeSignature = DEF_TIME_SIGNATURE;
    var openingTokens = new Set([BAR, REP_START, DBL_REP_START]);
    var closingTokens = new Set([DBL_BAR, DBL_REP_END]);
    var repeatTokens = new Set([REP_START, REP_END, DBL_REP_START, DBL_REP_END, BTB_REP, DBL_BTB_REP]);
    var seperateBarTokens = new Set([BAR]);
    var pulseBarTokens = new Set([BM]);
    var repeatPreviousBarTokens = new Set([BAR_REPEAT]);
    var validTokens = new Set([].concat(_toConsumableArray(openingTokens), _toConsumableArray(closingTokens), _toConsumableArray(repeatTokens), _toConsumableArray(seperateBarTokens), _toConsumableArray(pulseBarTokens), _toConsumableArray(repeatPreviousBarTokens)));
    var tokens = sheetMusic.trim().split(/\s+/);
    var length = tokens.length;
    if (length > 0 && !tokens[length - 1].endsWith(BAR)) {
      error.msg = "[SHEET MUSIC ERROR] Last ending token must be | or :| or || or :||. Currently it is: ".concat(tokens[length - 1]);
      return;
    }
    var index = 0;
    var ctrlVars = [];
    var match;
    var offset_beats = 0;
    while (index < length && (match = tokens[index].match(CTRL_FUNCS))) {
      var func = match[1];
      var arg = match[3];
      var setFunc = 'set' + func;
      if (typeof this[setFunc] !== 'function') {
        error.msg = "[CONTROL VARS INFO] Pass by token at position ".concat(index + 1, ": \"").concat(tokens[index], "\" - OK");
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
        var status = this[setFunc](arg);
        if (status !== undefined) {
          return;
        }
        pulseFlag = PULSE_FLAG;
      } else {
        ctrlVars.push([setFunc, arg]);
      }
      index += 1;
      offset_beats += 1;
    }
    var _DEF_TIME_SIGNATURE$s3 = DEF_TIME_SIGNATURE.split('/').map(Number);
    var _DEF_TIME_SIGNATURE$s4 = _slicedToArray(_DEF_TIME_SIGNATURE$s3, 2);
    beats = _DEF_TIME_SIGNATURE$s4[0];
    beatType = _DEF_TIME_SIGNATURE$s4[1];
    if (length > 0) {
      var _match = tokens[index].match(TIME_SIG);
      if (_match) {
        timeSignature = tokens[index];
        beats = parseInt(_match[1], 10);
        beatType = parseInt(_match[2], 10);
        index++;
        offset_beats += 1;
      } else {
        error.msg = "[TIME SIGNATURE WARNING] Time Signature token invalid at position ".concat(index + 1, ": \"").concat(tokens[index], "\"");
        error.msg = "Using default time signature instead: ".concat(timeSignature);
      }
    } else {
      error.msg = "[SHEET MUSIC ERROR] Empty Sheet Music Error";
      return;
    }
    var reshake = BPM.val;
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
      error.msg = "Expected a bar line or repeat start token after time signature, but found: \"".concat(tokens[index], "\"");
      error.msg = "Assuming opening sections exists";
      while (index - offset_beats <= beats) {
        if (openingTokens.has(tokens[index])) {
          break;
        }
        var chord = getChordNotes(tokens[index]);
        if (chord) {
          sequencer.push(chord);
          openingClassicalCount++;
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
      error.msg = "[OPENING ERROR 2] Invalid token at position ".concat(index + 1, ": \"").concat(tokens[index], "\"");
      return;
    }
    index++;
    var beatCount = 0;
    var jump = DEF_BEAT_JUMP;
    for (var i = index; i < length; i++) {
      beatCount = beatCount + jump;
      if (beatCount > beats) {
        if (!seperateBarTokens.has(tokens[i]) && !closingTokens.has(tokens[i]) && !repeatTokens.has(tokens[i])) {
          error.msg = "[Bar Beat Count Error 1] Invalid token at position ".concat(i + 1, ": \"").concat(tokens[i], "\"");
          return;
        }
        beatCount = 0;
      } else {
        if (i == length - 1) {
          if (tokens[i] == DBL_BAR || tokens[i] == DBL_REP_END) {
            var totalBeats = openingClassicalCount + beatCount - 1;
            if (openingClassicalCount > 0 && CLASSICAL_CHECK && totalBeats !== beats) {
              error.msg = "[CLASSICAL BEAT ERROR 1] Opening and Closing Bar Beat Count must add up to number of beats in time signature, currenly: ".concat(totalBeats, ". Required: ").concat(beats);
              return;
            }
          } else {
            if (openingClassicalCount > 0) {
              error.msg = "[CLASSICAL BEAT ERROR 2] There is no ending music but there is opening section";
              return;
            } else if (seperateBarTokens.has(tokens[i]) || repeatTokens.has(tokens[i])) {
              error.msg = "[Bar Beat Count Error 2] Invalid token at position ".concat(i + 1, ": \"").concat(tokens[i], "\"");
              return;
            } else {
              error.msg = "<<< Bypass Classical Rule Check >>> for token at position ".concat(i + 1, ": \"").concat(tokens[i], "\"");
            }
          }
        } else if (seperateBarTokens.has(tokens[i]) || closingTokens.has(tokens[i]) || repeatTokens.has(tokens[i])) {
          error.msg = "[Bar Beat Count Error 3] Invalid token at position ".concat(i + 1, ": \"").concat(tokens[i], "\"");
          return;
        }
      }
      if (validTokens.has(tokens[i])) {
        if (pulseBarTokens.has(tokens[i])) {
          if (pulseFlag) {
            var repeatChord = sequencer[sequencer.length - 1];
            if (repeatChord) {
              sequencer.push(repeatChord);
            } else {
              error.msg = "No previous chord to repeat at position ".concat(i + 1, ": \"").concat(tokens[i], "\"");
              sequencer.push(BM);
            }
          } else {
            sequencer.push(BM);
          }
          continue;
        }
        if (repeatPreviousBarTokens.has(tokens[i])) {
          if (length < 3 || !openingTokens.has(tokens[i - 1]) && !closingTokens.has(tokens[i + 1])) {
            error.msg = "[REPEAT PREVIOUS BAR ERROR] Invalid token at position ".concat(i + 1, ": \"").concat(tokens[i], "\"");
            return;
          }
          if (sequencer.length >= beats) {
            sequencer.push.apply(sequencer, _toConsumableArray(sequencer.slice(-beats)));
            beatCount = beats;
            continue;
          } else {
            error.msg = "Wrong beat count syntax, cannot repeat previous bar at position ".concat(i + 1, " with token: \"").concat(tokens[i], "\"");
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
            var p = void 0;
            var updateLoop = false;
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
                error.msg = "[Stack Error 1] contains wrong matching tokens ".concat(p, " for ").concat(tokens[i]);
                return;
              }
            }
            if (!updateLoop) {
              loopBackIndex[sequencer.length - 1] = 0;
              repeatCount[sequencer.length - 1] = DEF_REP_NUM;
            }
            continue;
          } else if (tokens[i] === DBL_REP_END) {
            var _p = void 0;
            var _updateLoop = false;
            while (stack.length) {
              _p = stack.pop();
              if (_p === BAR) {
                continue;
              } else if (_p[0] === DBL_REP_START || _p[0] === BAR) {
                loopBackIndex[sequencer.length - 1] = _p[1];
                repeatCount[sequencer.length - 1] = DEF_REP_NUM * _p[2];
                _updateLoop = true;
                break;
              } else {
                error.msg = "[Stack Error 2] contains wrong matching tokens ".concat(_p, " for ").concat(tokens[i]);
                return;
              }
            }
            if (!_updateLoop) {
              loopBackIndex[sequencer.length - 1] = 0;
              repeatCount[sequencer.length - 1] = DEF_REP_NUM;
            }
            continue;
          } else if (tokens[i] === BTB_REP) {
            var _p2 = void 0;
            var _updateLoop2 = false;
            while (stack.length) {
              _p2 = stack.pop();
              if (_p2 === BAR) {
                continue;
              } else if (_p2[0] === REP_START || _p2[0] === BAR) {
                loopBackIndex[sequencer.length - 1] = _p2[1];
                repeatCount[sequencer.length - 1] = DEF_REP_NUM * _p2[2];
                _updateLoop2 = true;
                break;
              } else {
                error.msg = "[Stack Error 3] contains wrong matching tokens ".concat(_p2, " for ").concat(tokens[i]);
                return;
              }
            }
            if (!_updateLoop2) {
              loopBackIndex[sequencer.length - 1] = 0;
              repeatCount[sequencer.length - 1] = DEF_REP_NUM;
            }
            stack.push([REP_START, sequencer.length, DEF_REP_NUM]);
            continue;
          } else if (tokens[i] === DBL_BTB_REP) {
            var _p3 = void 0;
            var _updateLoop3 = false;
            while (stack.length) {
              _p3 = stack.pop();
              if (_p3 === BAR) {
                continue;
              } else if (_p3[0] === DBL_REP_START || _p3[0] === BAR) {
                loopBackIndex[sequencer.length - 1] = _p3[1];
                repeatCount[sequencer.length - 1] = DEF_REP_NUM * _p3[2];
                _updateLoop3 = true;
                break;
              } else {
                error.msg = "[Stack Error 4] contains wrong matching tokens ".concat(_p3, " for ").concat(tokens[i]);
                return;
              }
            }
            if (!_updateLoop3) {
              loopBackIndex[sequencer.length - 1] = 0;
              repeatCount[sequencer.length - 1] = DEF_REP_NUM;
            }
            stack.push([DBL_REP_START, sequencer.length, DEF_REP_NUM]);
            continue;
          }
        }
      } else {
        var match_rep_num = tokens[i].match(REP_NUM);
        if (match_rep_num) {
          beatCount = beatCount - jump;
          var _p4 = stack.pop();
          if (length >= 2 && tokens[i - 1] !== REP_START && tokens[i - 1] !== DBL_REP_START && _p4 && _p4.length !== 3) {
            error.msg = "[REPEAT NUMBER ERROR] Invalid token at position ".concat(i + 1, ": \"").concat(tokens[i], "\"");
            return;
          }
          var num = Number(match_rep_num[1]);
          _p4[2] = num - 1;
          stack.push(_p4);
          continue;
        }
        var match_skip_num = tokens[i].match(SKIP_NUM);
        if (match_skip_num) {
          beatCount = beatCount - jump;
          var current_skip_number = Number(match_skip_num[1]);
          if (current_skip_number < LST_SKIPNUM) {
            error.msg = "[SKIP NUMBER ERROR 1] Invalid token at position ".concat(i + 1, ": \"").concat(tokens[i], "\"");
            return;
          } else if (current_skip_number == LST_SKIPNUM) {
            skipNumberIndex[current_skip_number] = sequencer.length - 1;
          } else {
            var prev_num = current_skip_number - 1;
            if (!(prev_num in skipNumberIndex)) {
              error.msg = "[SKIP NUMBER ERROR 2] Invalid token at position ".concat(i + 1, ": \"").concat(tokens[i], "\"");
              return;
            }
            forwardIndex[skipNumberIndex[prev_num]] = forwardIndex[skipNumberIndex[prev_num]] ? [sequencer.length].concat(_toConsumableArray(forwardIndex[skipNumberIndex[prev_num]])) : [sequencer.length];
            skipNumberIndex[current_skip_number] = skipNumberIndex[prev_num];
          }
          continue;
        }
        var match_aux = tokens[i].match(AUX);
        if (match_aux) {
          beatCount = beatCount - jump;
          error.msg = "Found an auxiliary token: \"".concat(tokens[i], "\"");
          continue;
        }
        var _chord = getChordNotes(tokens[i]);
        if (_chord) {
          sequencer.push(_chord);
          continue;
        }
        error.msg = "[CHORD ERROR] Invalid token at position ".concat(i + 1, ": \"").concat(tokens[i], "\"");
        return;
      }
    }
    if (length > 0) {
      var te = tokens[length - 1];
      if (te.slice(-2) === DBL_BAR) {
        end = true;
      }
    }
    error.msg = "Opening classical count (if any): ".concat(openingClassicalCount);
    error.msg = "Current last beat count: ".concat(beatCount);
    if (CLASSICAL_CHECK && !openingClassicalCount && beatCount != 0) {
      error.msg = "[CLASSICAL BEAT ERROR 3] There is no opening beats or ending number of beats in the last bar is not correct";
      return;
    }
    _sheetMusic.content = sheetMusic;
    for (var _i2 = 0, _ctrlVars = ctrlVars; _i2 < _ctrlVars.length; _i2++) {
      var _ctrlVars$_i = _slicedToArray(_ctrlVars[_i2], 2),
        _func = _ctrlVars$_i[0],
        _arg = _ctrlVars$_i[1];
      if (this[_func].constructor.name === 'AsyncFunction') {
        error.msg = "func ".concat(_func, " is an async function. Will be invoke with async function style");
        var _result = this[_func](_arg);
        _result.then(function (data) {
          if (data) {
            oops("[Async] [Error] ".concat(data), 'warning');
          }
        }).catch(function (exp) {
          oops("[Async] [Exception] ".concat(exp), 'warning');
        });
      } else {
        error.msg = "func ".concat(_func, " is a synchronous function. Will be invoked like regular function");
        var _result2 = this[_func](_arg);
        if (_result2 !== undefined) {
          error.msg = _result2;
          return;
        }
      }
    }
    var result = [sequencer, loopBackIndex, repeatCount, end, forwardIndex, skipNumberIndex];
    validArgs.add(result);
    return result;
  }
  function _freq(note) {
    var octave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEF_OCTAVE;
    var a4 = 440;
    var semisFromA4 = (octave - 4) * 12 + (notes[note] - 1) - 9;
    return a4 * Math.pow(2, semisFromA4 / 12);
  }
  function playChord() {
    var chord = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : FAKE;
    var octave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEF_OCTAVE;
    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEF_DURATION;
    var notes = getChordNotes(chord);
    _playSequencerChord(notes, octave, duration);
  }
  function playNote() {
    var note = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : FAKE;
    var octave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEF_OCTAVE;
    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEF_DURATION;
    var volume = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : MAX_VOL;
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.22;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = _freq(note, octave);
    osc.connect(gain);
    gain.connect(masterGain);
    var now = audioCtx.currentTime || 0;
    var attackTime = 0.01;
    var minimumVolume = MIN_VOL;
    var attackVolume = volume;
    var sustainVolume = volume > 0.3 ? 0.7 : minimumVolume;
    gain.gain.value = minimumVolume;
    gain.gain.exponentialRampToValueAtTime(attackVolume, now + attackTime);
    gain.gain.setValueAtTime(sustainVolume, now + (duration || 0.01));
    gain.gain.exponentialRampToValueAtTime(minimumVolume, now + duration + 0.8);
    osc.addEventListener('ended', function () {
      osc.disconnect();
      gain.disconnect();
    });
    osc.start(now);
    osc.stop(now + duration + 0.9);
  }
  function _delay() {
    var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEF_MSEC;
    var signal = arguments.length > 1 ? arguments[1] : undefined;
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
  function _playSequencerChord() {
    var sequencerChord = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : BM;
    var octave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEF_OCTAVE;
    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEF_DURATION;
    var volume = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : MAX_VOL;
    if (sequencerChord != BM) {
      if (sequencerChord[1]) {
        playNote(sequencerChord[1], octave - 1, duration, volume);
      }
      var _iterator2 = _createForOfIteratorHelper(sequencerChord[0]),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var note = _step2.value;
          playNote(note, octave, duration, volume);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    } else {
      playNote(FAKE, MIN_OCTAVE, duration, MIN_VOL);
    }
  }
  function _saveSheetMusicToBASS() {
    return _saveSheetMusicToBASS2.apply(this, arguments);
  }
  function _saveSheetMusicToBASS2() {
    _saveSheetMusicToBASS2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var problem, _iterator3, _step3, field, lc_field, _problem4, jsonString, filename, options, handle, writable, isIOS, base64Data, dataUri, a, blob, url, _a, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            if (!(Object.keys(_sheetMusic).length === 0 && _sheetMusic.constructor === Object)) {
              _context.n = 1;
              break;
            }
            problem = "[SaveAs ERROR] No sheetMusic found when saving sheet music to .bass";
            return _context.a(2, problem);
          case 1:
            _iterator3 = _createForOfIteratorHelper(BASSBOARD_DB_FIELD);
            _context.p = 2;
            _iterator3.s();
          case 3:
            if ((_step3 = _iterator3.n()).done) {
              _context.n = 5;
              break;
            }
            field = _step3.value;
            lc_field = field.toLowerCase();
            if (lc_field in _sheetMusic) {
              _context.n = 4;
              break;
            }
            _problem4 = "[SaveAs ERROR] To save to .bass, you must use control phrase ".concat(field, ": (URL: is optional)");
            return _context.a(2, _problem4);
          case 4:
            _context.n = 3;
            break;
          case 5:
            _context.n = 7;
            break;
          case 6:
            _context.p = 6;
            _t = _context.v;
            _iterator3.e(_t);
          case 7:
            _context.p = 7;
            _iterator3.f();
            return _context.f(7);
          case 8:
            jsonString = JSON.stringify(_sheetMusic, null, 2);
            filename = "".concat(_sheetMusic.title, "_by_").concat(_sheetMusic.contributor, ".bass");
            if (!(global === window && 'showSaveFilePicker' in global)) {
              _context.n = 13;
              break;
            }
            options = {
              suggestedName: filename,
              types: [{
                description: 'BASS Music File',
                accept: {
                  '*/.bass': ['.bass']
                }
              }]
            };
            _context.n = 9;
            return global.showSaveFilePicker(options);
          case 9:
            handle = _context.v;
            _context.n = 10;
            return handle.createWritable();
          case 10:
            writable = _context.v;
            _context.n = 11;
            return writable.write(jsonString);
          case 11:
            _context.n = 12;
            return writable.close();
          case 12:
            return _context.a(2);
          case 13:
            isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
            if (!isIOS) {
              _context.n = 14;
              break;
            }
            base64Data = btoa(unescape(encodeURIComponent(jsonString)));
            dataUri = "data:application/octet-stream;base64,".concat(base64Data);
            a = document.createElement('a');
            a.href = dataUri;
            a.download = filename;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return _context.a(2);
          case 14:
            blob = new Blob([jsonString], {
              type: 'application/octet-stream'
            });
            url = URL.createObjectURL(blob);
            _a = document.createElement('a');
            _a.href = url;
            _a.download = filename;
            document.body.appendChild(_a);
            _a.click();
            document.body.removeChild(_a);
            URL.revokeObjectURL(url);
            return _context.a(2);
          case 15:
            return _context.a(2);
        }
      }, _callee, null, [[2, 6, 7, 8]]);
    }));
    return _saveSheetMusicToBASS2.apply(this, arguments);
  }
  function _saveSheetMusicToPDF() {
    return _saveSheetMusicToPDF2.apply(this, arguments);
  }
  function _saveSheetMusicToPDF2() {
    _saveSheetMusicToPDF2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var iframe, doc, style, pre;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            _context2.n = 1;
            return new Promise(function (resolve) {
              setTimeout(resolve, 0);
            });
          case 1:
            iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);
            doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
            doc.close();
            style = doc.createElement('style');
            style.textContent = "\n        body, pre {\n            font-family: ui-monospace, SFMono-Regular, Consolas, \"Liberation Mono\", Menlo, monospace;\n        }\n        @media print {\n            body, pre {\n                font-family: ui-monospace, SFMono-Regular, Consolas, \"Liberation Mono\", Menlo, monospace;\n                color-adjust: exact;\n                -webkit-print-color-adjust: exact;\n            }\n        }\n    ";
            doc.head.appendChild(style);
            pre = doc.createElement('pre');
            pre.style.whiteSpace = 'pre-wrap';
            pre.textContent = _sheetMusic.content;
            doc.body.appendChild(pre);
            iframe.contentWindow.addEventListener('afterprint', function () {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            });
            requestAnimationFrame(function () {
              setTimeout(function () {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
              }, 250);
            });
            setTimeout(function () {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 60000);
          case 2:
            return _context2.a(2);
        }
      }, _callee2);
    }));
    return _saveSheetMusicToPDF2.apply(this, arguments);
  }
  function _createOopsContainer() {
    var container = document.createElement('div');
    container.id = 'oopsContainer';
    container.className = 'oops-container';
    document.body.appendChild(container);
    return container;
  }
  function playSequencer(_x) {
    return _playSequencer.apply(this, arguments);
  }
  function _playSequencer() {
    _playSequencer = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(sequencerObj) {
      var sequencer, loopBackIndex, repeatCount, end, forwardIndex, skipNumberIndex, _sequencerObj, _sequencerObj$, problem, _problem5, _taskDropper, signal, i, n, heuristic_lowest_number_index, tempRepeatCount, tempForwardIndex, skipFlag;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.n) {
          case 0:
            sequencer = SMP_SEQUENCER;
            loopBackIndex = {};
            repeatCount = {};
            end = END;
            forwardIndex = {};
            skipNumberIndex = {};
            if (validArgs.has(sequencerObj)) {
              _sequencerObj = _slicedToArray(sequencerObj, 6);
              sequencer = _sequencerObj[0];
              loopBackIndex = _sequencerObj[1];
              repeatCount = _sequencerObj[2];
              _sequencerObj$ = _sequencerObj[3];
              end = _sequencerObj$ === void 0 ? END : _sequencerObj$;
              forwardIndex = _sequencerObj[4];
              skipNumberIndex = _sequencerObj[5];
              validArgs.delete(sequencerObj);
              problem = "Sequencer object will be removed from WeakSet right after playing";
              oops(problem, 'warning', FULL_ASYNC_DEBUG_MODE);
            } else {
              _problem5 = "[SEQUENCER WARNING] Must run buildSequencer() first before feeding result to playSequencer(). Using default sequencer: ".concat(JSON.stringify(SMP_SEQUENCER), " with tempo: ").concat(BPM.val, " bpm");
              oops(_problem5, 'warning');
            }
            if (taskDropper) taskDropper.abort();
            taskDropper = new AbortController();
            _taskDropper = taskDropper, signal = _taskDropper.signal;
            i = 0;
            n = sequencer.length;
            heuristic_lowest_number_index = -1;
            if (LST_SKIPNUM in skipNumberIndex) heuristic_lowest_number_index = skipNumberIndex[LST_SKIPNUM];
            oops('🤟 | | |', 'info');
            playNote(FAKE, MIN_OCTAVE, STACKATO_LEGATO, MIN_VOL);
            _context3.n = 1;
            return _delay(DEF_MSEC, signal);
          case 1:
            oops('✌️ | |', 'info');
            playNote(FAKE, MIN_OCTAVE, STACKATO_LEGATO, MIN_VOL);
            _context3.n = 2;
            return _delay(DEF_MSEC, signal);
          case 2:
            oops('☝️ |', 'info');
            playNote(FAKE, MIN_OCTAVE, STACKATO_LEGATO, MIN_VOL);
            _context3.n = 3;
            return _delay(DEF_MSEC, signal);
          case 3:
            if (signal.aborted) {
              _context3.n = 8;
              break;
            }
            i = 0;
            tempRepeatCount = JSON.parse(JSON.stringify(repeatCount));
            tempForwardIndex = JSON.parse(JSON.stringify(forwardIndex));
            skipFlag = false;
          case 4:
            if (!(i < n)) {
              _context3.n = 7;
              break;
            }
            if (!signal.aborted) {
              _context3.n = 5;
              break;
            }
            return _context3.a(3, 7);
          case 5:
            _playSequencerChord(sequencer[i], DEF_OCTAVE, STACKATO_LEGATO);
            _context3.n = 6;
            return _delay(DEF_MSEC, signal);
          case 6:
            if (skipFlag && i in forwardIndex) {
              i = forwardIndex[i].pop();
              skipFlag = false;
            } else if (i in loopBackIndex && repeatCount[i] > 0) {
              repeatCount[i]--;
              if (repeatCount[i] == 0 && i > heuristic_lowest_number_index) {
                skipFlag = true;
              } else {
                skipFlag = false;
              }
              i = loopBackIndex[i];
            } else {
              i++;
            }
            _context3.n = 4;
            break;
          case 7:
            if (end && (!(n - 1 in repeatCount) || repeatCount[n - 1] == 0)) {
              stopSequencer();
            }
            repeatCount = tempRepeatCount;
            forwardIndex = tempForwardIndex;
            _context3.n = 3;
            break;
          case 8:
            return _context3.a(2);
        }
      }, _callee3);
    }));
    return _playSequencer.apply(this, arguments);
  }
  function setSaveAs(_x2) {
    return _setSaveAs.apply(this, arguments);
  }
  function _setSaveAs() {
    _setSaveAs = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(option) {
      var _problem6, _problem7, result, _result3, problem;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.n) {
          case 0:
            if (SAVE_AS_TYPES.has(option)) {
              _context4.n = 1;
              break;
            }
            _problem6 = "[SaveAs ERROR] Control phrase SaveAs: must be followed by one of the following terms: ".concat(_toConsumableArray(SAVE_AS_TYPES));
            return _context4.a(2, _problem6);
          case 1:
            if (!(_typeof(global) !== "object" || global !== window)) {
              _context4.n = 2;
              break;
            }
            _problem7 = "[SaveAs ERROR] Print function is currently supported in browser environment only";
            return _context4.a(2, _problem7);
          case 2:
            if (!(option == "PDF")) {
              _context4.n = 4;
              break;
            }
            _context4.n = 3;
            return _saveSheetMusicToPDF().catch(function (err) {
              throw new Error("Save As PDF Exception: " + err.message);
            });
          case 3:
            result = _context4.v;
            return _context4.a(2, result);
          case 4:
            if (!(option == "BASS")) {
              _context4.n = 6;
              break;
            }
            _context4.n = 5;
            return _saveSheetMusicToBASS().catch(function (err) {
              throw new Error("Save As BASS Exception: " + err.message);
            });
          case 5:
            _result3 = _context4.v;
            return _context4.a(2, _result3);
          case 6:
            problem = "This SaveAs format is not supported : ".concat(option);
            return _context4.a(2, problem);
        }
      }, _callee4);
    }));
    return _setSaveAs.apply(this, arguments);
  }
  function getInstrument() {
    return instrument;
  }
  function setInstrument(inst) {
    var lc_inst = inst.toLowerCase();
    if (!DEF_SUPPORT_INST.has(lc_inst)) {
      var problem = "[Set Instrument Error] Currently not support ".concat(inst, " instrument");
      error.msg = problem;
      return problem;
    }
  }
  function oops(message) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
    var show = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    if (_typeof(global) !== "object" || global !== window) {
      var problem = "[Oops ERROR] Oops function is currently supported in browser environment only";
      error.msg = problem;
      alert(problem);
      return problem;
    }
    if (!show) {
      return;
    }
    var oopsContainer = document.getElementById('oopsContainer') || _createOopsContainer();
    var oopsEl = document.createElement('div');
    oopsEl.className = "oops oops-".concat(type);
    oopsEl.textContent = message;
    oopsContainer.appendChild(oopsEl);
    setTimeout(function () {
      oopsEl.classList.add('oops-show');
    }, 10);
    setTimeout(function () {
      oopsEl.classList.remove('oops-show');
      setTimeout(function () {
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
    var convert = Number(bpm);
    if (Number.isNaN(convert)) {
      var problem = "[SET TEMPO ERROR] Conversion failed: \"".concat(bpm, "\" cannot be converted to a valid number.");
      error.msg = problem;
      return problem;
    }
    if (!Number.isInteger(convert) || convert < MIN_TEMPO || convert > MAX_TEMPO) {
      var _problem = "[TEMPO ERROR] Tempo (BPM) must be an integer in the range of ".concat(MIN_TEMPO, " and ").concat(MAX_TEMPO);
      error.msg = _problem;
      return _problem;
    }
    BPM.val = convert;
  }
  function setOctave(oct) {
    var convert = Number(oct);
    if (Number.isNaN(convert)) {
      var problem = "[SET OCTAVE ERROR] Conversion failed: \"".concat(oct, "\" cannot be converted to a valid number.");
      error.msg = problem;
      return problem;
    }
    if (!Number.isInteger(convert) || convert < MIN_OCTAVE || convert > MAX_OCTAVE) {
      var _problem2 = "[SET OCTAVE ERROR] Default octave must be a number in the range of ".concat(MIN_OCTAVE, " and ").concat(MAX_OCTAVE, ". ");
      error.msg = _problem2;
      return _problem2;
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
      var problem = "[SUSTAIN ERROR] To sustain BM / character, must use control phrase Sustain:Yes or Sustain:No";
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
  function getGuitarNote() {
    var st = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 6;
    var fret = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var MIN_FRETS = 0;
    var MAX_FRETS = 38;
    if (typeof fret !== 'number' || !Number.isInteger(fret) || fret < MIN_FRETS || fret > MAX_FRETS || typeof st !== 'number' || !Number.isInteger(st) || st < 1 || st > 6) {
      var problem = "[getGuitarNote Error] parameters error, fret = ".concat(fret, ", st = ").concat(st);
      error.msg = problem;
      return problem;
    }
    var lookup_note;
    switch (st) {
      case 6:
        {
          lookup_note = notes['E'];
          break;
        }
      case 5:
        {
          lookup_note = notes['A'];
          break;
        }
      case 4:
        {
          lookup_note = notes['D'];
          break;
        }
      case 3:
        {
          lookup_note = notes['G'];
          break;
        }
      case 2:
        {
          lookup_note = notes['B'];
          break;
        }
      case 1:
        {
          lookup_note = notes['E'];
          break;
        }
      default:
        {
          var _problem3 = "[getGuitarNote Error] string number must be between 1 and 6, but got ".concat(st);
          error.msg = _problem3;
          return _problem3;
        }
    }
    var calculated_lookup_note = (lookup_note + fret) % OCTAVE_LENGTH || OCTAVE_LENGTH;
    var octave_offset = 0;
    if (calculated_lookup_note < lookup_note) {
      octave_offset += 1;
    }
    error.msg = "[TUNING A GUITAR][CURRENT OCTAVE: ".concat(DEF_OCTAVE, "], Playing: ").concat(notes[calculated_lookup_note], ", should play in: ").concat(octave_offset, " octave higher!");
    return [notes[calculated_lookup_note], octave_offset];
  }
  function getFullAsyncDebugMode() {
    return FULL_ASYNC_DEBUG_MODE;
  }
  function getVersion() {
    return VERSION;
  }
})(typeof window !== "undefined" ? window : void 0);
