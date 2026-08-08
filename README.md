bass.js
=======

A music sequencer library, written in javascript.

Process standard musical notations.

Demo
----

https://skujp.github.io/music

Installation
------------

Download `bass.js` file from this repository, then include the following in your html document...

```html
<script src="bass.js"></script>
```

Usage
-----

Now you will have access to ```bass``` in the browser console.

To generate a sequencer...

```javascript
var sequencer = bass.buildSequencer(sheetMusic);
/*
	Return a sequencer object which is ready for playback.

	sheetMusic
		a string containing standard musical notations. 
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
   Only chords (NOT note) will be played in the BASS system. 

   If the sequencer is undefined, bass will play its default sequencer.

   If sheet music ends with a double bar, an undefined promise will be returned.  
*/
```

To stop playing the sequencer...

```javascript
bass.stopSequencer();
```

To see the full manual...

```javascript
console.log(bass.help());
```

Advanced 
--------

To rename the library...

```javascript
var the_bass = bass.rename();
```

To play a chord...

```javascript
bass.playChord(chordName, octave, duration);

/*
	Play a musical chord

	chordName
		any of the following chords are supported:
		m aug dim maj7 7 m7 mmaj7 m7b5 7b5 dim7 sus sus2 sus4 add9 5 maj9 6 9 /
	
	octave
		an integer number between 0 - 8,
		by default it is set to 4 like middle C in a standard piano
	
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
	Return notes for a musical chord
	
	Example: bass.getChordNotes('G/F') returns [['G','B','D'],"F"]
*/
```

To play a note...

```javascript
bass.playNote(noteName, octave, duration, volume);

/*
	Play a musical note

	noteName
		one of the following 12 notes in a standard musical scale:
		C C#/Db D D#/Eb E F F#/Gb G G#/Ab A A#/Bb B 
	
	octave
		see above

	duration
		see above

	volume
		a float number between 0.0001 and 1
		1 is maximum volume (100%)
		0.0001 is minimum volume (~0%)

	Example: bass.playNote('Gb') or bass.playNote('Gb', 4, 1, 1);
*/
```

To turn on debugging...

```javascript
bass.setDebug(true);
```

To check library version...

```javascript
bass.getVersion();
```

Contact
-------

Feel free to email me at: (listed in manual section V, demo website)

Or X/Twitter: @bassthemusic101 (The Music 101)