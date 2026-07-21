BASS.js
====

A music sequencer library, written in javascript.

Process standard musical notations.

Demo
----

https://skujp.github.io/music

Installation
------------

For processing, `bass.js` only is sufficient.

For playback, an external library is required, such as the *modified* `audiosynth.js` library.

Playback is currently limited to playing chords in the bass clef.

After downloading both files from this repository, include the following in your html document...

```html
<script src="audiosynth.js"></script>
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

   If the squencer is undefined, bass will play its default sequencer.
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
bass.playChord(chordName)

/*
	Play a musical chord

	chordName
		any of the following chords are supported:
		m aug dim maj7 7 m7 mmaj7 m7b5 7b5 dim7 sus sus2 sus4 add9 5 maj9 6 9 /
	
	Example: bass.playChord('Gmaj7')
*/
```

To get chord notes...

```javascript
bass.getChordNotes(chordName)

/*
	Return notes for a musical chord
	
	Example: bass.getChordNotes('B/F') returns [['E','G#','B'],"F"]
*/
```

To turn on debugging...

```javascript
bass.setDebug(true)
```

Acknowledgement
---------------

audiosynth.js library for playback from keithwhor (https://github.com/keithwhor/audiosynth)

Contact
-------

Feel free to email me at: (listed in manual section V in demo website)

Or X/Twitter: @soccer8746 (The Music)