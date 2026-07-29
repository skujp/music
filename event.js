// start self invoked function
(function () {

function initEvents() {

    const VERSION = "2.2.1";

    // check if bass has been loaded
    if (typeof bass === "undefined") {
        let problem = '[ERROR] bass.js is not loaded. Program exit';
        alert(problem);
        throw new Error(problem);
    } 

    // now oops function will be available via bass.oops
    const oops = bass.oops;

    // treble clef raise octave compared to bass clef
    var UP1 = 0;
    const MAXUP = 9;
    const MINUP = -9;

    // sustain pedal for treble clef
    var PED = 0.3;

    // volume for treble clef
    var TREB_VOL = 0.5;

    // literals
    const SHEETMUSIC = 'sheetMusic';
    const PLAYBTN = 'playBtn';
    const STOPBTN = 'stopBtn';
    const READBTN = 'readBtn';

    // piano notes
    const CNOTE = 'cNote';
    const CSNOTE = 'cSNote';
    const DNOTE = 'dNote';
    const DSNOTE = 'dSNote';
    const ENOTE = 'eNote';
    const FNOTE = 'fNote';
    const FSNOTE = 'fSNote';
    const GNOTE = 'gNote';
    const GSNOTE = 'gSNote';
    const ANOTE = 'aNote';
    const ASNOTE = 'aSNote';
    const BNOTE = 'bNote';

    const CNOTE1 = 'cNote1';
    const CSNOTE1 = 'cSNote1';
    const DNOTE1 = 'dNote1';
    const DSNOTE1 = 'dSNote1';
    const ENOTE1 = 'eNote1';
    const FNOTE1 = 'fNote1';
    const FSNOTE1 = 'fSNote1';
    const GNOTE1 = 'gNote1';

    // instruments
    const PIANO = 'piano';
    const GUITAR = 'acoustic';
    const ALL = 'allInstrument';

    // piano controls;
    const MINUSBTN = 'minusBtn';
    const PLUSBTN = 'plusBtn';
    const ROTATEBTN = 'rotateBtn';

    // guitar strings and frets
    const S6 = 's6';
    const S5 = 's5';
    const S4 = 's4';
    const S3 = 's3';
    const S2 = 's2';
    const S1 = 's1';

    const F1 = 'f1';
    const F2 = 'f2';
    const F3 = 'f3';
    const F4 = 'f4';
    const F5 = 'f5';

    // emoticons
    const PIANOICON = '🎹';
    const GUITARICON = '🎸';
    const ALLICONS = '🎹 🎸';
    const MINUSICON = '➖';
    const PLUSICON = '➕';


    // bassboard
    const BASSBOARD = 'bassboard';
    const SONGLIST = 'songList';
    const PAGE_SIZE = 11;

    // get id of all the html components

    // piano
    const sheetMusic = document.getElementById(SHEETMUSIC);
    const playBtn = document.getElementById(PLAYBTN);
    const stopBtn = document.getElementById(STOPBTN);
    const readBtn = document.getElementById(READBTN);
    const cNote = document.getElementById(CNOTE);
    const cSNote = document.getElementById(CSNOTE);
    const dNote = document.getElementById(DNOTE);
    const dSNote = document.getElementById(DSNOTE);
    const eNote = document.getElementById(ENOTE);
    const fNote = document.getElementById(FNOTE);
    const fSNote = document.getElementById(FSNOTE);
    const gNote = document.getElementById(GNOTE);
    const gSNote = document.getElementById(GSNOTE);
    const aNote = document.getElementById(ANOTE);
    const aSNote = document.getElementById(ASNOTE);
    const bNote = document.getElementById(BNOTE);

    const cNote1 = document.getElementById(CNOTE1);
    const cSNote1 = document.getElementById(CSNOTE1);
    const dNote1 = document.getElementById(DNOTE1);
    const dSNote1 = document.getElementById(DSNOTE1);
    const eNote1 = document.getElementById(ENOTE1);
    const fNote1 = document.getElementById(FNOTE1);
    const fSNote1 = document.getElementById(FSNOTE1);
    const gNote1 = document.getElementById(GNOTE1);

    const minusBtn = document.getElementById(MINUSBTN);
    const plusBtn = document.getElementById(PLUSBTN);
    const rotateBtn = document.getElementById(ROTATEBTN);

    const piano = document.getElementById(PIANO);

    // guitar 
    const s1 = document.getElementById(S1);
    const s2 = document.getElementById(S2);
    const s3 = document.getElementById(S3);
    const s4 = document.getElementById(S4);
    const s5 = document.getElementById(S5);
    const s6 = document.getElementById(S6);

    const guitar = document.getElementById(GUITAR);

    // bassboard
    const bassBoard = document.getElementById(BASSBOARD);

    // songlist
    const songList = document.getElementById(SONGLIST);


    // Initialize sheetMusic
    sheetMusic.value = bass.getSampleTestCase();


    // Pointer to the last note of the piano for - + adjustment
    adjustPtr = gNote1;

    // Play Button Event Listener
    playBtn.addEventListener('click', () => {
        const sheetContent = sheetMusic.value;
        const sequencer = bass.buildSequencer(sheetContent);
        
        if (sequencer) {
            oops(`Playing music, Tempo ${bass.getTempo()}, Bass Octave ${bass.getOctave()}, Sustain ${!bass.getSustain() ? 'Yes' : 'No'}`, 'success');
            const result = bass.playSequencer(sequencer);
            result.then((data) => {
                if (data) {  // mean error return from async previously
                    if (bass.getFullAsyncDebugMode()) oops(`[Async] [While Play Button Click] ${data}`,'warning');
                } 
            }).catch((exp) => {
                oops(`[Async] [Exception While Play Button Click] ${exp}`, 'warning');
            });
        } else {
            oops(bass.getErrorMsg(), 'error');  // synchronous error
        }

        sheetMusic.prevClick = PLAYBTN;
    });

    // Stop Button Event Listener
    stopBtn.addEventListener('click', () => {
        if (sheetMusic.prevClick == READBTN) {
            if (sheetMusic.value.length >  bass.getMaxSheetLength()) {
                sheetMusic.value = "";
                oops('Stop reading manual', 'warning');
                sheetMusic.style.height = '300px';
            }
            bass.stopSequencer();
        } else if (sheetMusic.prevClick == PLAYBTN) {
            if (sheetMusic.value.length >  bass.getMaxSheetLength()) {
                sheetMusic.value = "";
                sheetMusic.style.height = '300px';
            }
            bass.stopSequencer();
            oops('Stop playing music', 'warning');
        }
        sheetMusic.prevClick = STOPBTN;
    });

    // READ Button Event Listener
    readBtn.addEventListener('click', () => {
        if (sheetMusic.prevClick !== READBTN || sheetMusic.value.length == 0) {
            sheetMusic.value = bass.help();
            sheetMusic.style.height = '300px';
            oops('Reading manual', 'info');
            sheetMusic.prevClick = READBTN;
        }
    });

    // SHEETMUSIC Text Area Listener
    sheetMusic.addEventListener('input', function() {
        this.style.height = 'auto'; // Reset height to calculate correctly
        this.style.height = this.scrollHeight + 'px'; // Expand to fit text
    });

    function bindNoteInteraction(noteEl, playFn) {
        if (!noteEl) {
            return;
        }

        noteEl.onclick = function(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            playFn();
        };
    }

    // PIANO (treble clef) click event listener
    var pianoNoteHandlers = [
        [cNote, function() { bass.playNote('C', bass.getOctave() + UP1, PED, TREB_VOL); }],
        [dNote, function() { bass.playNote('D', bass.getOctave() + UP1, PED, TREB_VOL); }],
        [eNote, function() { bass.playNote('E', bass.getOctave() + UP1, PED, TREB_VOL); }],
        [fNote, function() { bass.playNote('F', bass.getOctave() + UP1, PED, TREB_VOL); }],
        [gNote, function() { bass.playNote('G', bass.getOctave() + UP1, PED, TREB_VOL); }],
        [aNote, function() { bass.playNote('A', bass.getOctave() + UP1, PED, TREB_VOL); }],
        [bNote, function() { bass.playNote('B', bass.getOctave() + UP1, PED, TREB_VOL); }],
        [cSNote, function() { bass.playNote('C#', bass.getOctave() + UP1, PED, TREB_VOL); }],
        [dSNote, function() { bass.playNote('D#', bass.getOctave() + UP1, PED, TREB_VOL); }],
        [fSNote, function() { bass.playNote('F#', bass.getOctave() + UP1, PED, TREB_VOL); }],
        [gSNote, function() { bass.playNote('G#', bass.getOctave() + UP1, PED, TREB_VOL); }],
        [aSNote, function() { bass.playNote('A#', bass.getOctave() + UP1, PED, TREB_VOL); }],
        [cNote1, function() { bass.playNote('C', bass.getOctave() + UP1 + 1, PED, TREB_VOL); }],
        [dNote1, function() { bass.playNote('D', bass.getOctave() + UP1 + 1, PED, TREB_VOL); }],
        [eNote1, function() { bass.playNote('E', bass.getOctave() + UP1 + 1, PED, TREB_VOL); }],
        [fNote1, function() { bass.playNote('F', bass.getOctave() + UP1 + 1, PED, TREB_VOL); }],
        [gNote1, function() { bass.playNote('G', bass.getOctave() + UP1 + 1, PED, TREB_VOL); }],
        [cSNote1, function() { bass.playNote('C#', bass.getOctave() + UP1 + 1, PED, TREB_VOL); }],
        [dSNote1, function() { bass.playNote('D#', bass.getOctave() + UP1 + 1, PED, TREB_VOL); }],
        [fSNote1, function() { bass.playNote('F#', bass.getOctave() + UP1 + 1, PED, TREB_VOL); }]
    ];

    for (var i = 0; i < pianoNoteHandlers.length; i++) {
        bindNoteInteraction(pianoNoteHandlers[i][0], pianoNoteHandlers[i][1]);
    }

    // GUITAR click event listener
    // Standard tuning: E₂, A₂, D₃, G₃, B₃, E₄
    // Actual octave played depending on current octave set in bass object
    var guitarNoteHandlers = [
        [s6, function() { var result = bass.getGuitarNote(6, fretKeyDown); bass.playNote(result[0], bass.getOctave() + UP1 + result[1], PED, TREB_VOL); }],
        [s5, function() { var result = bass.getGuitarNote(5, fretKeyDown); bass.playNote(result[0], bass.getOctave() + UP1 + result[1], PED, TREB_VOL); }],
        [s4, function() { var result = bass.getGuitarNote(4, fretKeyDown); bass.playNote(result[0], bass.getOctave() + UP1 + 1 + result[1], PED, TREB_VOL); }],
        [s3, function() { var result = bass.getGuitarNote(3, fretKeyDown); bass.playNote(result[0], bass.getOctave() + UP1 + 1 + result[1], PED, TREB_VOL); }],
        [s2, function() { var result = bass.getGuitarNote(2, fretKeyDown); bass.playNote(result[0], bass.getOctave() + UP1 + 1 + result[1], PED, TREB_VOL); }],
        [s1, function() { var result = bass.getGuitarNote(1, fretKeyDown); bass.playNote(result[0], bass.getOctave() + UP1 + 2 + result[1], PED, TREB_VOL); }]
    ];

    for (var j = 0; j < guitarNoteHandlers.length; j++) {
        bindNoteInteraction(guitarNoteHandlers[j][0], guitarNoteHandlers[j][1]);
    }

    // PIANO mapping keys
    const noteKeyMap = {
        /* piano section */
        /* w notes */
        q: CNOTE,
        w: DNOTE,
        e: ENOTE,
        r: FNOTE,
        t: GNOTE,
        y: ANOTE,
        u: BNOTE,
        i: CNOTE1,
        o: DNOTE1,
        p: ENOTE1,
        '[': FNOTE1,
        ']': GNOTE1,

        /* b notes */
        2: CSNOTE,
        3: DSNOTE,
        5: FSNOTE,
        6: GSNOTE,
        7: ASNOTE,
        9: CSNOTE1,
        0: DSNOTE1,
        '=': FSNOTE1,

        /* guitar section : vertical keyboard */
        /* frets */
        a: F1,
        s: F2,
        d: F3,
        f: F4,
        g: F5,

        /* strings */
        h: S6,
        j: S5,
        k: S4,
        l: S3,
        ';': S2,
        "'": S1
        
    };

    const isTypingInTextField = (target) => {
        if (!target) return false;
        const tagName = target.tagName ? target.tagName.toLowerCase() : undefined;
        return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
    };

    var fretKeyDown = undefined;

    document.addEventListener('keydown', (e) => {
        if (e.target === sheetMusic || isTypingInTextField(e.target)) return;
        
        const key = e.key.toLowerCase();
        const noteId = noteKeyMap[key];
        
        if (!noteId || e.repeat) return;

        e.preventDefault();

        switch (noteId) {
        case F1:
            fretKeyDown = 1;
            break;
        case F2:
            fretKeyDown = 2;
            break;
        case F3:
            fretKeyDown = 3;
            break;
        case F4:
            fretKeyDown = 4;
            break;
        case F5:
            fretKeyDown = 5;
            break;
        default:
            break;
        }

        const noteEl = document.getElementById(noteId);
        if (noteEl) {
        noteEl.classList.add('active');
        noteEl.click(); 
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.target === sheetMusic || isTypingInTextField(e.target)) return;
        
        const key = e.key.toLowerCase();
        const noteId = noteKeyMap[key];

        if (!noteId) return;

        switch (noteId) {
        case F1: 
        case F2: 
        case F3: 
        case F4: 
        case F5:
            fretKeyDown = undefined;
            break;
        default:
            break;
        }

        const noteEl = document.getElementById(noteId);
        if (noteEl && noteEl.classList) noteEl.classList.remove('active');
    });

    // Minus and Plus Buttons to customize the piano
    function dropNoteClick() {
        if (adjustPtr === cNote) { oops('Minimum notes reached', 'warning'); return; } // sentinel left

        if (adjustPtr.classList.contains('black-key')) {
            adjustPtr.style.display = "none";
            adjustPtr = adjustPtr.previousElementSibling;
        } else {
            adjustPtr.parentElement.style.display = "none";
            if (adjustPtr.parentElement.previousElementSibling.childElementCount == 2) {
                adjustPtr = adjustPtr.parentElement.previousElementSibling.children[1];
            } else {
                adjustPtr = adjustPtr.parentElement.previousElementSibling.children[0];
            }
        }  
    }
    minusBtn.addEventListener('click', dropNoteClick);

    function addNoteClick() {
        if (adjustPtr === gNote1)  { oops('Maximum notes reached!', 'warning'); return; }; // sentinel right

        if (adjustPtr.classList.contains('white-key')) {
            if (adjustPtr.parentElement.childElementCount == 2) {
                adjustPtr = adjustPtr.nextElementSibling;
                adjustPtr.style.display = "flex";
            } else {
                adjustPtr.parentElement.nextElementSibling.style.display = "";
                adjustPtr = adjustPtr.parentElement.nextElementSibling.children[0];
            }
        } else {
            adjustPtr.parentElement.nextElementSibling.style.display = "";
            adjustPtr = adjustPtr.parentElement.nextElementSibling.children[0];
        }
    }

    plusBtn.addEventListener('click', addNoteClick);

    function upOctave() {
        if (UP1 > MAXUP) {
            oops('Max Octave Reached', 'error');
            return;
        }
        UP1 += 1;
        oops('Octave +1', 'warning');
    }

    function downOctave() {
        if (UP1 < MINUP) {
            oops('Min Octave Reached', 'error');
            return;
        }
        UP1 -= 1;
        oops('Octave -1', 'warning');
    }

    // Change instrument button to cycle through each instrument
    // + and - buttons will be have accordingly depending
    // on which instruments are in used
    rotateBtn.currentIns = PIANO;
    rotateBtn.textContent = PIANOICON;
    rotateBtn.addEventListener('click', () => {
        if (rotateBtn.currentIns == PIANO) {
            piano.style.display = 'none';
            guitar.style.display = 'flex';
            rotateBtn.currentIns = GUITAR;
            rotateBtn.textContent = GUITARICON;
            bass.setInstrument(GUITAR);
            plusBtn.removeEventListener('click',addNoteClick);
            plusBtn.addEventListener('click',upOctave);
            minusBtn.removeEventListener('click',dropNoteClick);
            minusBtn.addEventListener('click',downOctave);
        } else if (rotateBtn.currentIns == GUITAR) {
            piano.style.display = 'flex';
            guitar.style.display = 'flex';
            rotateBtn.currentIns = ALL;
            rotateBtn.textContent = ALLICONS;
            bass.setInstrument(PIANO);
            plusBtn.removeEventListener('click',addNoteClick);
            plusBtn.addEventListener('click',upOctave);
            minusBtn.removeEventListener('click',dropNoteClick);
            minusBtn.addEventListener('click',downOctave);
        } else {
            piano.style.display = 'flex';
            guitar.style.display = 'none';
            rotateBtn.currentIns = PIANO;
            rotateBtn.textContent = PIANOICON;
            bass.setInstrument(PIANO);
            plusBtn.removeEventListener('click',upOctave);
            plusBtn.addEventListener('click',addNoteClick);
            minusBtn.removeEventListener('click',downOctave);
            minusBtn.addEventListener('click',dropNoteClick);
        }
    });

    // ------------  Loading bassboard chart database ---------------- //

    let allEntries = [];
    let filteredEntries = [];
    let currentPage = 1;
    const searchInput = bassBoard.querySelector('.song-search');

    const createSongItem = (entry) => {
        const item = document.createElement('li');
        item.className = 'song-item';

        const title = document.createElement('a');
        title.href = '#';
        title.className = 'song-title-link';
        title.textContent = entry.title || 'Untitled Song';
        title.addEventListener('click', (event) => {
            event.preventDefault();
            if (sheetMusic) {
                sheetMusic.value = entry.content || '';
                sheetMusic.style.height = 'auto';
                sheetMusic.style.height = sheetMusic.scrollHeight + 'px';
                sheetMusic.dispatchEvent(new Event('input', { bubbles: true }));
                sheetMusic.scrollIntoView({ behavior: 'smooth', block: 'center' });
                oops(`Loaded: ${entry.title || 'Untitled Song'}`, 'info');
            }
        });

        const meta = document.createElement('small');
        meta.className = 'song-meta';
        meta.textContent = entry.contributor || 'Unknown';

        const hasLink = typeof entry.url === 'string' && entry.url.trim() !== '';

        const link = document.createElement('a');
        link.href = hasLink ? entry.url : '#';
        link.className = 'song-link';
        link.target = hasLink ? '_blank' : '_self';
        link.rel = 'noopener noreferrer';
        link.textContent = '🔗';
        link.style.display = hasLink ? 'inline' : 'none';
        link.addEventListener('click', (event) => {
            if (!hasLink) {
                event.preventDefault();
            }
        });

        item.appendChild(title);
        item.appendChild(meta);
        item.appendChild(link);
        return item;
    };

    const renderPage = () => {
        songList.innerHTML = '';

        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const pageEntries = filteredEntries.slice(start, end);

        pageEntries.forEach((entry) => {
            songList.appendChild(createSongItem(entry));
        });

        const controls = document.createElement('li');
        controls.className = 'pagination-controls';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = 'Prev';
        prevBtn.disabled = currentPage === 1 || filteredEntries.length === 0;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage -= 1;
                renderPage();
            }
        });

        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = 'Next';
        nextBtn.disabled = currentPage >= Math.ceil(filteredEntries.length / PAGE_SIZE) || filteredEntries.length === 0;
        nextBtn.addEventListener('click', () => {
            if (currentPage < Math.ceil(filteredEntries.length / PAGE_SIZE)) {
                currentPage += 1;
                renderPage();
            }
        });

        const pageSpanInfo = document.createElement('span');
        pageSpanInfo.className = 'song-item pagination-info';
        pageSpanInfo.textContent = `${currentPage} / ${Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE))}`;

        controls.appendChild(prevBtn);
        controls.appendChild(pageSpanInfo);
        controls.appendChild(nextBtn);
        songList.appendChild(controls);
    };

    const shuffleEntries = (entries) => {
        const shuffled = Array.isArray(entries) ? [...entries] : [];

        for (let index = shuffled.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }

        return shuffled;
    };

    const applyFilter = () => {
        const query = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : '';
        filteredEntries = allEntries.filter((entry) => {
            const title = (entry.title || '').toLowerCase();
            const contributor = (entry.contributor || '').toLowerCase();
            return title.includes(query) || contributor.includes(query);
        });
        currentPage = 1;
        renderPage();
    };

    const renderEntries = (entries) => {
        allEntries = shuffleEntries(entries);
        filteredEntries = allEntries;

        if (allEntries.length === 0) {
            songList.innerHTML = '';
            const fallbackItem = document.createElement('li');
            fallbackItem.className = 'song-item';
            fallbackItem.innerHTML = '<span>No songs available</span>';
            songList.appendChild(fallbackItem);
            return;
        }

        renderPage();
    };

    const storageAvailable = (storageType) => {
        try {
            const storage = window[storageType];
            const testKey = '__bassboard_storage_test__';
            storage.setItem(testKey, testKey);
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            let msg = `Storage unavailable for ${storageType}:`;
            oops(msg, 'error');
            //console.warn(msg, error);
            return false;
        }
    };

    // [!Important]
    var isStorageAvailable = storageAvailable('localStorage');

    const readStoredValue = (key) => {
        if (!isStorageAvailable) {
            return null;
        }

        try {
            return localStorage.getItem(key);
        } catch (error) {
            let msg = `Unable to read cached value for ${key}:`;
            oops(msg, 'warning');
            //console.warn(msg, error);
            return null;
        }
    };

    const writeStoredValue = (key, value) => {
        if (!isStorageAvailable) {
            return;
        }

        try {
            localStorage.setItem(key, value);
        } catch (error) {
            let msg = `Unable to save cached value for ${key}:`;
            oops(msg, 'error');
            //console.warn(msg, error);
        }
    };

    // 7. if localStorage is full or disabled
    const safeWriteStoredValue = (key, value) => {
        try {
            writeStoredValue(key, value);
        } catch (domException) {
            // Targets QuotaExceededError variants across different web browsers
            if (
                domException.name === 'QuotaExceededError' ||
                domException.name === 'NS_ERROR_DOM_QUOTA_REACHED'
            ) {
                const problem = `Local storage quota exceeded! Running database entirely in-memory, ${domException}`;
                oops(problem, 'error');
                //console.error(problem);
            } else {
                const problem = `Could not write to local storage: ${domException}`;
                oops(problem, 'error');
                //console.error(problem);
            }
        }
    };

    const loadDatabase = async () => {
        const etagKey = 'bassboard-db-etag';
        const lastModifiedKey = 'bassboard-db-last-modified';
        const cachedDataKey = 'bassboard-db-data';
        const lastCheckedKey = 'bassboard-db-last-checked'

        try {

            const cachedEtag = readStoredValue(etagKey);
            const cachedLastModified = readStoredValue(lastModifiedKey);
            const cachedEntries = readStoredValue(cachedDataKey);
            const cachedLastChecked = readStoredValue(lastCheckedKey);

            // 1. Check if we have cached data and if 1 day (24 hours) has passed
            if (cachedEntries && cachedLastChecked) {
                const oneDayInMs = 24 * 60 * 60 * 1000;
                const timePassed = Date.now() - parseInt(cachedLastChecked, 10);

                if (timePassed < oneDayInMs) {
                    renderEntries(JSON.parse(cachedEntries));
                    oops('Loading from local storage', 'info');
                    return; // Stop here! No network request made at all.
                }
            }

            // 2. If 1 day has passed, proceed with the conditional network request
            const headers = {};

            if (cachedEtag) {
                headers['If-None-Match'] = cachedEtag;
            }

            if (cachedLastModified) {
                headers['If-Modified-Since'] = cachedLastModified;
            }

            // Added 'cache: no-cache' back to ensure the browser performs the 304 handshake
            const response = await fetch(`records`, {
                method: 'GET',
                headers: headers,
                cache: 'no-cache'
            });

            // 3. CDN/Server says data hasn't changed. 
            if (response.status === 304) {
                if (cachedEntries) {
                    // Update the timer so we don't ask the network again for another 24 hours
                    safeWriteStoredValue(lastCheckedKey, Date.now().toString());
                    renderEntries(JSON.parse(cachedEntries));
                    oops('Loading from local storage (verified fresh)', 'info');
                    return;
                }
            }

            if (!response.ok) {
                throw new Error(`Failed to load database: ${response.status}`);
            }

            // 4. Handle a fresh 200 OK download
            const serverEtag = response.headers.get('etag') || '';
            const serverLastModified = response.headers.get('last-modified') || '';
            const entries = await response.json();
            
            safeWriteStoredValue(etagKey, serverEtag);
            safeWriteStoredValue(lastModifiedKey, serverLastModified);
            safeWriteStoredValue(cachedDataKey, JSON.stringify(entries));
            safeWriteStoredValue(lastCheckedKey, Date.now().toString()); // Set timer for fresh data

            renderEntries(entries);
            oops("Successfully loading new database from server", "success");

        } catch (error) {

            let msg = `Unable to load bassboard data: ${error}`;
            oops(msg, 'error');
            songList.innerHTML = '';

            const fallbackItem = document.createElement('li');
            fallbackItem.className = 'song-item';
            fallbackItem.innerHTML = '<span>Unable to load songs</span>';
            songList.appendChild(fallbackItem);
            
        }
    };

    if (searchInput) searchInput.addEventListener('input', applyFilter);
    loadDatabase();

    // -------- Refresh page feature, support both local storage and cookies ------ //

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    function setThreeDayCookie() {
        const THREE_DAYS_IN_SECONDS = 3 * 24 * 60 * 60;
        document.cookie = `site_active=true; max-age=${THREE_DAYS_IN_SECONDS}; path=/; SameSite=Strict; Secure`;
    }

    function checkPageAge() {
        const THREE_DAYS = 3 * 24 * 60 * 60 * 1000; // 3 days in ms

        const now = Date.now();
        let shouldUpdate = false;

        if (isStorageAvailable) {
            // --- LOCAL STORAGE ---
            const lastOpen = localStorage.getItem('site_last_opened');
            if (!lastOpen) {
                localStorage.setItem('site_last_opened', now);
            } else if (now - parseInt(lastOpen, 10) > THREE_DAYS) {
                localStorage.setItem('site_last_opened', now);
                shouldUpdate = true;
            }
        } else {
            // --- COOKIES FALLBACK ---
            const isSiteActive = getCookie('site_active');
            if (!isSiteActive) {
                setThreeDayCookie();
                shouldUpdate = true;
            }
        }

        if (shouldUpdate) {
            oops("Refreshing website for updates...","warning");
            setTimeout(() => {
                window.location.reload(true); // Force reload from server
            }, 3000);
        }
    }

    // [!Important]
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkPageAge();
        }
    });

} // end of initEvents

// Run immediately if the DOM is ready, otherwise wait for the event
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initEvents();
} else {
    document.addEventListener('DOMContentLoaded', initEvents);
}

})(); // end of self invoked function