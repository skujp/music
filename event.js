(function () {

function initEvents() {

    // VERSION = "6.0.1";

    if (typeof bass === "undefined") {
        let problem = '[ERROR] bass.js is not loaded. Program exit';
        alert(problem);
        console.log(problem);
        return;
    } 

    const oops = bass.oops;

    var UP1 = 0;
    const MAXUP = 3;    
    const MINUP = -5;

    // sustain pedal for treble clef
    var PED = 0.3;

    // volume for treble clef
    var TREB_VOL = 0.5;

    const SHEETMUSIC = 'sheetMusic';
    const PLAYBTN = 'playBtn';
    const STOPBTN = 'stopBtn';
    const READBTN = 'readBtn';

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

    const PIANO = 'piano';
    const GUITAR = 'acoustic';
    const ALL = 'allInstrument';

    const MINUSBTN = 'minusBtn';
    const PLUSBTN = 'plusBtn';
    const ROTATEBTN = 'rotateBtn';

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

    const PIANOICON = '🎹';
    const GUITARICON = '🎸';
    const ALLICONS = '🎹 🎸';

    const BASSBOARD = 'bassboard';
    const SONGLIST = 'songList';
    const PAGE_SIZE = 11;

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

    const s1 = document.getElementById(S1);
    const s2 = document.getElementById(S2);
    const s3 = document.getElementById(S3);
    const s4 = document.getElementById(S4);
    const s5 = document.getElementById(S5);
    const s6 = document.getElementById(S6);

    const guitar = document.getElementById(GUITAR);

    const bassBoard = document.getElementById(BASSBOARD);

    const songList = document.getElementById(SONGLIST);

    sheetMusic.value = bass.getSampleTestCase();

    var adjustPtr = gNote1;

    playBtn.addEventListener('click', () => {
        const sheetContent = sheetMusic.value;
        const sequencer = bass.buildSequencer(sheetContent);
        
        if (sequencer) {
            oops(`🎧 Playing | Tempo ${bass.getTempo()} | Bass Octave ${bass.getOctave()} | Sustain ${!bass.getSustain() ? 'Yes' : 'No'}`, 'success');
            bass.playSequencer(sequencer).catch((e) => {
                if (e.name !== 'AbortError') {
                    oops(`[Error playing sequencer]: ${e.message}`, 'error');
                }
            });
        } else {
            oops(bass.getErrorMsg(), 'error');  // synchronous
        }

        sheetMusic.prevClick = PLAYBTN;
    });

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

    readBtn.addEventListener('click', () => {
        if (sheetMusic.prevClick !== READBTN || sheetMusic.value.length == 0) {
            sheetMusic.value = bass.help();
            sheetMusic.style.height = '300px';
            oops('Reading manual', 'info');
            sheetMusic.prevClick = READBTN;
        }
    });

    sheetMusic.addEventListener('input', function() {
        this.style.height = 'auto'; // Reset height to calculate correctly
        this.style.height = this.scrollHeight + 'px'; // Expand to fit text
    });

    cNote.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('C',bass.getOctave()+UP1,PED,TREB_VOL)});
    dNote.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('D',bass.getOctave()+UP1,PED,TREB_VOL)});
    eNote.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('E',bass.getOctave()+UP1,PED,TREB_VOL)});
    fNote.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('F',bass.getOctave()+UP1,PED,TREB_VOL)});
    gNote.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('G',bass.getOctave()+UP1,PED,TREB_VOL)});
    aNote.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('A',bass.getOctave()+UP1,PED,TREB_VOL)});
    bNote.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('B',bass.getOctave()+UP1,PED,TREB_VOL)});

    cSNote.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('C#',bass.getOctave()+UP1,PED,TREB_VOL)});
    dSNote.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('D#',bass.getOctave()+UP1,PED,TREB_VOL)});
    fSNote.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('F#',bass.getOctave()+UP1,PED,TREB_VOL)});
    gSNote.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('G#',bass.getOctave()+UP1,PED,TREB_VOL)});
    aSNote.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('A#',bass.getOctave()+UP1,PED,TREB_VOL)});

    cNote1.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('C',bass.getOctave()+UP1+1,PED,TREB_VOL)});
    dNote1.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('D',bass.getOctave()+UP1+1,PED,TREB_VOL)});
    eNote1.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('E',bass.getOctave()+UP1+1,PED,TREB_VOL)});
    fNote1.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('F',bass.getOctave()+UP1+1,PED,TREB_VOL)});
    gNote1.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('G',bass.getOctave()+UP1+1,PED,TREB_VOL)});

    cSNote1.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('C#',bass.getOctave()+UP1+1,PED,TREB_VOL)});
    dSNote1.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('D#',bass.getOctave()+UP1+1,PED,TREB_VOL)});
    fSNote1.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); bass.playNote('F#',bass.getOctave()+UP1+1,PED,TREB_VOL)});

    // Guitar common tuning: E₂, A₂, D₃, G₃, B₃, E₄
    s6.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); const [n,o] = bass.getGuitarNote(6,fretKeyDown); bass.playNote(n,bass.getOctave()+UP1+o,PED,TREB_VOL)});      // lower E2, fret#
    s5.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); const [n,o] = bass.getGuitarNote(5,fretKeyDown); bass.playNote(n,bass.getOctave()+UP1+o,PED,TREB_VOL)});      // A2, fret#
    s4.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); const [n,o] = bass.getGuitarNote(4,fretKeyDown); bass.playNote(n,bass.getOctave()+UP1+1+o,PED,TREB_VOL)});    // D3, fret#
    s3.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); const [n,o] = bass.getGuitarNote(3,fretKeyDown); bass.playNote(n,bass.getOctave()+UP1+1+o,PED,TREB_VOL)});    // G3, fret#
    s2.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); const [n,o] = bass.getGuitarNote(2,fretKeyDown); bass.playNote(n,bass.getOctave()+UP1+1+o,PED,TREB_VOL)});    // B3, fret#
    s1.addEventListener('click', (e) => {e.preventDefault(); e.stopPropagation(); const [n,o] = bass.getGuitarNote(1,fretKeyDown); bass.playNote(n,bass.getOctave()+UP1+2+o,PED,TREB_VOL)}); 

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

    function isTypingInTextField(target) {
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
        if (UP1 >= MAXUP) {
            oops('Max Octave Reached', 'error');
            return;
        }
        UP1 += 1;
        oops('Octave +1', 'warning');
    }

    function downOctave() {
        if (UP1 <= MINUP) {
            oops('Min Octave Reached', 'error');
            return;
        }
        UP1 -= 1;
        oops('Octave -1', 'warning');
    }

    // + - behave differently depending on which instrument is in use
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

    function createSongItem(entry) {
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
                oops(`(Loading) ${entry.title || 'Untitled Song'}`, 'info');
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
    }

    function renderPage() {
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
    }

    function shuffleEntries(entries) {
        const shuffled = Array.isArray(entries) ? [...entries] : [];

        for (let index = shuffled.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }

        return shuffled;
    }

    function applyFilter() {
        const query = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : '';
        filteredEntries = allEntries.filter((entry) => {
            const title = (entry.title || '').toLowerCase();
            const contributor = (entry.contributor || '').toLowerCase();
            return title.includes(query) || contributor.includes(query);
        });
        currentPage = 1;
        renderPage();
    }

    function renderEntries(entries) {
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
    }

    function readStoredValue(key) {
        try {
            if (typeof window === 'undefined' || !window.localStorage) {
                return null;
            }
            return localStorage.getItem(key);
        } catch (error) {
            let msg = `Unable to read cached value for ${key}, error: ${error}`;
            oops(msg, 'warning');
            return null;
        }
    }

    function writeStoredValue(key, value) {
        try {
            if (typeof window === 'undefined' || !window.localStorage) {
                return;
            }
            localStorage.setItem(key, value);
        } catch (error) {
            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                let msg = `Local storage quota exceeded! Running database entirely in-memory, error: ${error}`;
                oops(msg, 'error');
            } else {
                let msg = `Could not write to local storage for ${key}, error: ${error}`;
                oops(msg, 'error');
            }
        }
    }

    function safeParse(str) {
        try {
            return str ? JSON.parse(str) : null;
        } catch (error) {
            oops(`JSON parsing error ${error.message}`, 'warning');
            return null;
        }
    }

    async function loadDatabase() {
        const etagKey = 'bassboard-db-etag';
        const lastModifiedKey = 'bassboard-db-last-modified';
        const cachedDataKey = 'bassboard-db-data';
        const lastCheckedKey = 'bassboard-db-last-checked';

        // 1. Pre-fetch and parse cached data
        const cachedEtag = readStoredValue(etagKey);
        const cachedLastModified = readStoredValue(lastModifiedKey);
        const cachedRaw = readStoredValue(cachedDataKey);
        const cachedEntries = safeParse(cachedRaw);
        const cachedLastChecked = readStoredValue(lastCheckedKey);

        // 2. Serve fast from local storage if 1 day (24 hours) has not passed
        if (cachedEntries && cachedLastChecked) {
            const oneDayInMs = 24 * 60 * 60 * 1000;
            const timePassed = Date.now() - parseInt(cachedLastChecked, 10);

            if (timePassed < oneDayInMs) {
                renderEntries(cachedEntries);
                oops("Rhythm and bass, loading with grace!", 'info');
                return; 
            }
        }

        // 3. Prepare HTTP Conditional Headers
        const headers = {};
        if (cachedEtag) headers['If-None-Match'] = cachedEtag;
        if (cachedLastModified) headers['If-Modified-Since'] = cachedLastModified;

        try {
            const response = await fetch(`records`, {
                method: 'GET',
                headers: headers,
                cache: 'no-cache'
            });

            // 4. Server says data hasn't changed (304 Not Modified)
            if (response.status === 304 && cachedEntries) {
                writeStoredValue(lastCheckedKey, Date.now().toString());
                renderEntries(cachedEntries);
                oops('Verified flow, ready to go!', 'info');
                return;
            }

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            // 5. Handle a fresh 200 OK download
            const serverEtag = response.headers.get('etag') || '';
            const serverLastModified = response.headers.get('last-modified') || '';
            const entries = await response.json();

            writeStoredValue(etagKey, serverEtag);
            writeStoredValue(lastModifiedKey, serverLastModified);
            writeStoredValue(cachedDataKey, JSON.stringify(entries));
            writeStoredValue(lastCheckedKey, Date.now().toString());

            renderEntries(entries);
            oops("All clear, the vibe is here!", "success");

        } catch (networkError) {

            // 6. Network/Fetch failed. Attempt emergency offline fallback using existing cache!
            if (cachedEntries) {
                renderEntries(cachedEntries);
                oops(`Network error (${networkError.message}). Loaded historical offline backup.`, 'warning');
                return;
            }

            // 7. Complete failure fallback UI (No network AND no cache found)
            let msg = `Unable to load bassboard data: ${networkError}`;
            oops(msg, 'error');
            
            songList.innerHTML = '';
            const fallbackItem = document.createElement('li');
            fallbackItem.className = 'song-item';
            fallbackItem.innerHTML = '<span>Unable to load songs</span>';
            songList.appendChild(fallbackItem);
        }
    }

    if (searchInput) searchInput.addEventListener('input', applyFilter);
    loadDatabase().catch((error) => {
        oops(`Unexpected error during database load: ${error}`, 'error');
    });

    // -------- Refresh feature, support both local storage and cookies ------ //

    function getCookie(name) {
        const safeName = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const match = document.cookie.match(new RegExp('(^|;\\s*)' + safeName + '=([^;]*)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    const THREE_DAYS_IN_SECONDS = 3 * 24 * 60 * 60;
    const THREE_DAYS_IN_MILLISECONDS = THREE_DAYS_IN_SECONDS * 1000;

    function setThreeDayCookie() {
        const date = new Date();
        date.setTime(date.getTime() + THREE_DAYS_IN_MILLISECONDS);
        const expires = "expires=" + date.toUTCString();
        document.cookie = `__Host-site_active=true; ${expires}; max-age=${THREE_DAYS_IN_SECONDS}; path=/; SameSite=Strict; Secure`;
    }

    function _cookiesEnabled() {
        try {
            document.cookie = "cookietest=1; path=/";
            const cookiesEnabled = document.cookie.indexOf("cookietest=") !== -1;
            document.cookie = "cookietest=1; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            return cookiesEnabled;
        } catch (e) {
            oops(`Cookies are not enabled: ${e.message}`, 'warning');
            return false;
        }
    }

    const cookiesEnabled = _cookiesEnabled();

    function refresher() {
        const now = Date.now();
        let shouldUpdate = false;
        let fallbackRequired = false; // indicates if localStorage is unavailable

        const urlParams = new URLSearchParams(window.location.search);
        const completedFallbackReload = urlParams.has('m');

        try {
            if (typeof window === 'undefined' || !window.localStorage) {
                throw new Error('Storage completely unavailable');
            }
            const lastOpen = parseInt(localStorage.getItem('site_last_opened'), 10);
            if (isNaN(lastOpen)) {
                localStorage.setItem('site_last_opened', now);
            } else if (now - lastOpen > THREE_DAYS_IN_MILLISECONDS) {
                localStorage.setItem('site_last_opened', now);
                shouldUpdate = true;
            }
        } catch {
            fallbackRequired = true;

            if (cookiesEnabled && !completedFallbackReload) {
                const isSiteActive = getCookie('__Host-site_active');
                if (!isSiteActive) {
                    setThreeDayCookie();
                    shouldUpdate = true;
                }
            } else {
                if (!completedFallbackReload) {
                    shouldUpdate = true;
                } else {
                    const sParam = urlParams.get('p');
                    const sTimestamp = parseInt(sParam, 10);
                    if (!isNaN(sTimestamp) && (now - sTimestamp > THREE_DAYS_IN_MILLISECONDS)) {
                        shouldUpdate = true;
                    }
                }
            }
        }

        if (shouldUpdate) {
            oops("Checking for updates...", "warning");
            setTimeout(() => {
                // when both localStorage and cookies are unavailable
                if (fallbackRequired && !cookiesEnabled) {
                    const url = new URL(window.location.href);                    
                    url.searchParams.set('m', 'r');
                    url.searchParams.set('p', Date.now().toString());                    
                    window.location.replace(url.toString());
                } else {
                    window.location.replace(window.location.origin + window.location.pathname);
                }
            }, 1000);
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            refresher();
        }
    });

} // end of initEvents

if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initEvents();
} else {
    document.addEventListener('DOMContentLoaded', initEvents);
}

})();