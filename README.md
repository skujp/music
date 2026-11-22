bass.js (<!--version-->v14.1.3<!--/version-->)
=======

A music sequencer library, written in javascript.

Process common musical notations.

Demo
----

https://skujp.github.io/music

Installation (choose one)
-------------------------

**1. Browser (Full)**

Download the latest minified ```bass.js``` from Github and include in your html...

```html
<script src="bass.js"></script>
```

**2. NPM (Minimal)**

Install...

```shell
npm install bass-sequencer 
```

Then use either...

*CommonJS*
```javascript
const bass = require('bass-sequencer');
```

*ESM*
```javascript
const { default: bass } = await import('bass-sequencer');
```

**3. The B3 Bass Boombox Shell (Full)**

Download and extract the latest B3 shell release from GitHub, then run...

*Windows*

```shell
.\b3.exe  
```

*macOS*

```shell
./b3
```

*Linux*

```shell
./b3
```

Usage
-----

You can now access ```bass``` from the console (*except shell option*).

To generate a sequencer...

```javascript
var sequencer = bass.buildSequencer(sheetMusic);
/*
	Returns a sequencer object which is ready for playback

	sheetMusic
		a string containing common musical notations 
		for example, '| F7 A Cmaj7 F ||'
*/
```

If the returned sequencer is `undefined`, check for errors...

```javascript
bass.getErrorMsg();
```

You can playback the sequencer instantly using...

```javascript
bass.playSequencer(sequencer);

/* 
   Chords or notes will be played in the BASS system 

   If the sequencer is undefined, bass will play its default sequencer

   If sheet music has an end, returns undefined promise, otherwises it plays in a loop
*/
```

To stop playing the sequencer...

```javascript
bass.stopSequencer();
```

To see the full manual...

```javascript
console.log('',bass.help());
```

Advanced 
--------

To rename the library (*browser-only*)...

```javascript
var the_bass = bass.rename();
```

To play a chord...

```javascript
bass.playChord(chordName, octave, duration);

/*
	Plays a musical chord

	chordName
		any of the following chords are supported:
		m aug dim maj7 7 m7 mmaj7 m7b5 7b5 dim7 sus sus2 sus4 add9 5 maj9 6 9 / maug
	
	octave
		an integer number between 0 - 8,
		by default it is set to 4 like middle C in a common piano
	
	duration
		in seconds,
		by default it is set to 1

	Example: bass.playChord('Gmaj7') or bass.playChord('Gmaj7',4,1)
 
*/
```

To get chord notes...

```javascript
bass.getChordNotes(chordName);

/*
	Returns notes for a musical chord
	
	Example: bass.getChordNotes('G/F') returns [['G','B','D'],"F"]
*/
```

To play a note...

```javascript
bass.playNote(noteName, octave, duration, volume);

/*
	Plays a musical note

	noteName
		one of the following 12 notes in a common musical scale:
		C C#/Db D D#/Eb E F F#/Gb G G#/Ab A A#/Bb B 
	
	octave
		see above

	duration
		see above

	volume
		a float number between 0.0001 and 1
		1 is maximum volume (100%)
		0.0001 is minimum volume (~0%)

	Example: bass.playNote('Gb') or bass.playNote('Gb', 4, 1, 1)
*/
```

Notes
-----

For *option 2* customized playback support,

Install `node-web-audio-api`...

```shell
npm install node-web-audio-api
```

Initialize `AudioContext`...

```javascript
const { AudioContext } = require('node-web-audio-api');

/*
	Imports AudioContext object
*/
```

Connect to ```bass```...

```javascript
bass.ssup(AudioContext);

/*	
	bass.js:
	
		Returns a Promise for a custom audio object connected to bass
		
		Resolves with undefined on success
		
		Rejects with an error on failure

	bass.es5.js:

		Returns undefined on success

		Raise exception on failure

	Both:
	
		On failure, use bass.ssup(AudioContext, true)
*/

```

Compatibility
-------------

Works for **ES6-compatible** browsers.

For legacy browsers, use `bass.es5.js`.

Development
-----------

See `src`.

Frontend: option 1.

Backend: option 2.

Package: option 3 or *.tgz* Github release

Test 'em all!

Contact
-------

Feel free to email me at: (listed in manual section V, demo website).

Or X/Twitter: @bassthemusic101 (The Music 101).