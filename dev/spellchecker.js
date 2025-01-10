const sc_wordDataset = [];
const sc_ignoredWords = new Set();
const sc_lengthGroups = {};
const sc_phoneticMap = {
    d: ['t'], t: ['d'], s: ['c', 'z'], c: ['s', 'k', 'z'], z: ['s', 'c'],
    k: ['c', 'g'], g: ['k', 'j'], b: ['p', 'v'], p: ['b', 'f'], v: ['b', 'f'],
    f: ['v', 'p'], m: ['n'], n: ['m'], l: ['r'], r: ['l'],
    i: ['y'], y: ['i'], o: ['u'], u: ['o']
};

fetch('words10k.txt')
  .then(r => r.text()).then(d => {
    sc_wordDataset.push(...d.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(w => w !== ''));
    sc_wordDataset.forEach(w => { const l = w.length; if (!sc_lengthGroups[l]) sc_lengthGroups[l] = []; sc_lengthGroups[l].push(w); });
  });
  

function sc_cleanWord(w) { 
    const cleaned = w
        .replace(/[^a-zA-Z0-9]/g, ' ') // Replace non-alphanumeric characters with spaces
        .replace(/\s+/g, ' ')          // Normalize multiple spaces to a single space
        .trim()
        .toLowerCase();
    return cleaned;
}

function sc_calculateLayeredScore(input, candidate) {
    const inputCleaned = sc_cleanWord(input);
    const candidateCleaned = sc_cleanWord(candidate);
    console.log(inputCleaned)
    let score = 0;

    let orderMatchScore = 0;
    let candidateIndex = 0;

    for (let i = 0; i < inputCleaned.length; i++) {
        const letter = inputCleaned[i];
        const indexInCandidate = candidateCleaned.indexOf(letter, candidateIndex);
        if (indexInCandidate !== -1) {
            orderMatchScore++;
            candidateIndex = indexInCandidate + 1;
        }
    }
    score += (orderMatchScore / inputCleaned.length) * 0.5;

    const editDistance = sc_levenshteinDistance(inputCleaned, candidateCleaned);
    score -= editDistance * 0.2;

    const lengthDifference = Math.abs(inputCleaned.length - candidateCleaned.length);
    score -= lengthDifference * 0.1;

    const inputLetterSet = new Set(inputCleaned);
    const phoneticSet = new Set();

    inputLetterSet.forEach(letter => {
        if (sc_phoneticMap[letter]) {
            sc_phoneticMap[letter].forEach(similar => phoneticSet.add(similar));
        }
    });

    const addedLetters = Array.from(candidateCleaned).filter(letter => !inputLetterSet.has(letter));

    if (addedLetters.length > 0) {
        let phoneticMatches = 0;
        let trulyUnique = 0;

        addedLetters.forEach(letter => {
            if (phoneticSet.has(letter)) {
                phoneticMatches++;
            } else {
                trulyUnique++;
            }
        });

        score -= trulyUnique * 0.075;
        score -= phoneticMatches * 0.02;
    } else {
        score += 0.1;
    }

    if (candidateCleaned.startsWith(inputCleaned[0])) {
        score += 0.15;
    } else {
        score -= 0.25;
    }

    return score;
}

function sc_getClosestWords(inputWord) {
    const cleanInput = sc_cleanWord(inputWord);
    const inputLength = cleanInput.length;
    const thresholdMultiplier = 0.6;
    const maxCandidates = 5;

    const relevantWords = [
        ...(sc_lengthGroups[inputLength - 1] || []),
        ...(sc_lengthGroups[inputLength] || []),
        ...(sc_lengthGroups[inputLength + 1] || [])
    ];

    const scoredWords = relevantWords.map(word => ({
        word,
        score: sc_calculateLayeredScore(cleanInput, word)
    }));

    scoredWords.sort((a, b) => b.score - a.score);

    const threshold = scoredWords.length > 0 ? scoredWords[0].score * thresholdMultiplier : 0;
    return scoredWords
        .filter(entry => entry.score >= threshold)
        .slice(0, maxCandidates)
        .map(entry => entry.word);
}

function sc_levenshteinDistance(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
        }
    }
    return dp[a.length][b.length];
}
function sc_caret(editableDiv, action, position) {
    const selection = window.getSelection();
    if (!editableDiv || !selection) return null;

    if (action === 'get') {
        if (!selection.rangeCount) return null;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editableDiv);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        return {
            start: preCaretRange.toString().length,
            end: preCaretRange.toString().length + range.toString().length,
        };
    } else if (action === 'set' && position) {
        const range = document.createRange();
        let charIndex = 0;
        let nodeStack = [editableDiv];
        let node, foundStart = false, stop = false;

        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType === Node.TEXT_NODE) {
                const nextCharIndex = charIndex + node.length;

                if (!foundStart && position.start >= charIndex && position.start <= nextCharIndex) {
                    range.setStart(node, position.start - charIndex);
                    foundStart = true;
                }

                if (foundStart && position.end >= charIndex && position.end <= nextCharIndex) {
                    range.setEnd(node, position.end - charIndex);
                    stop = true;
                }

                charIndex = nextCharIndex;
            } else {
                let i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }

        selection.removeAllRanges();
        selection.addRange(range);
    }
}

// Initialize spell checker
function sc_initSpellChecker() {
    const sb = document.getElementById('sc_spellingbox');
    if (!sb) {
        console.error("No #sc_spellingbox found.");
        return;
    }

    const popup = document.createElement('div');
    popup.id = 'sc_popup';
    popup.style.cssText = `
        font-family: Verdana, sans-serif;
        font-size: 14px;
        margin-top: 4px;
        box-sizing: border-box;
        position: absolute;
        display: none;
        flex-direction: column;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        padding: 8px;
        z-index: 1000;
        transition: 0.25s;
        transform: scale(1);
    `;
    document.body.appendChild(popup);

    const heading = document.createElement('div');
    heading.id = 'sc_heading';
    heading.style.cssText = `
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 6px;
        color: rgb(85, 83, 83);
    `;
    heading.innerHTML = `<p style="margin: 0; display: flex; align-items: center;"><svg width="14px" height="14px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px;"><path d="m15.97 17.031c-1.479 1.238-3.384 1.985-5.461 1.985-4.697 0-8.509-3.812-8.509-8.508s3.812-8.508 8.509-8.508c4.695 0 8.508 3.812 8.508 8.508 0 2.078-.747 3.984-1.985 5.461l4.749 4.75c.146.146.219.338.219.531 0 .587-.537.75-.75.75-.192 0-.384-.073-.531-.22zm-5.461-13.53c-3.868 0-7.007 3.14-7.007 7.007s3.139 7.007 7.007 7.007c3.866 0 7.007-3.14 7.007-7.007s-3.141-7.007-7.007-7.007z" fill="#555353"/></svg> Suggestions:</p>`;
    popup.appendChild(heading);

    const suggDiv = document.createElement('div');
    suggDiv.id = 'sc_suggestion';
    suggDiv.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    `;
    popup.appendChild(suggDiv);

    const footing = document.createElement('div');
    footing.id = 'sc_footing';
    footing.style.cssText = `
        width: 100%;
        display: flex;
        justify-content: flex-start;
        margin-top: 6px;
    `;
    footing.innerHTML = '<button id="sc_ignorebutton" style=\'font-family: Verdana, sans-serif; font-size: 14px; color: rgb(85, 83, 83); border: none; background: transparent; cursor: pointer; text-decoration: underline; padding: 0;\'>Ignore</button>';
    popup.appendChild(footing);

    sb.setAttribute('contenteditable', 'true');
    sb.setAttribute('spellcheck', 'false');
    sb.style.cssText = 'white-space: pre-wrap; word-wrap: break-word;';

    sb.addEventListener('input', () => {
        const caretPosition = sc_caret(sb, 'get');
        const t = sb.innerText;
        const w = t.split(/\s+/);

        const h = w.map(word => {
            const c = sc_cleanWord(word);
            if (c === '' || sc_wordDataset.includes(c) || sc_ignoredWords.has(c)) return word;
            return `<span id="sc_misspelled" style="text-decoration: underline solid #ff5757 2px; background-color: rgba(255, 87, 87, 0.33); cursor: pointer;" data-word="${word}">${word}</span>`;
        }).join(' ');

        sb.innerHTML = h;
        if (caretPosition) sc_caret(sb, 'set', caretPosition);
    });

    sb.addEventListener('click', e => {
        const t = e.target;
        if (t.id === 'sc_misspelled') {
            const w = t.getAttribute('data-word').toLowerCase();
            const s = sc_getClosestWords(w);
            const r = t.getBoundingClientRect();
            suggDiv.innerHTML = s.map(sugg => `<button data-suggestion="${sugg}" style="
                font-family: Verdana, sans-serif;
                font-size: 14px;
                background-color: #47b39ace;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 4px 8px;
                cursor: pointer;
                transition: 0.25s;
            ">${sugg}</button>`).join('');
            popup.style.cssText = `
                font-family: Verdana, sans-serif;
                display: flex;
                top: ${r.bottom + window.scrollY}px;
                left: ${r.left + window.scrollX}px;
                font-size: 14px;
                margin-top: 4px;
                box-sizing: border-box;
                position: absolute;
                flex-direction: column;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                padding: 8px;
                z-index: 1000;
                transition: 0.25s;
            `;

            popup.querySelectorAll('button').forEach(b => {
                b.addEventListener('click', () => {
                    if (b.id === "sc_ignorebutton") {
                        const iw = sc_cleanWord(t.getAttribute('data-word'));
                        sc_ignoredWords.add(iw);
                        popup.style.display = 'none';
                        t.style.cssText = '';
                        t.removeAttribute('id');
                        return;
                    }
                    t.textContent = b.getAttribute('data-suggestion');
                    popup.style.display = 'none';
                    t.style.cssText = '';
                    t.removeAttribute('id');
                });
            });
        } else {
            popup.style.display = 'none';
        }
    });
}
const sc_style = document.createElement('style');
sc_style.innerHTML = `
    #sc_suggestion button:hover {
        transform: translate(0px, -2px);
        transition: transform 0.2s ease-in-out;
    }
    #sc_suggestion:hover button {
        opacity: 0.5;
    }
    #sc_suggestion button:hover {
        opacity: 1;
    }
    #sc_suggestion button:active {
        transform: translate(0px, 2px) scale(0.95);
        transition: transform 0.1s ease-in-out;
    }
    #sc_footing button:hover {
        opacity: 0.5;
        transition: opacity 0.2s ease-in-out;
    }
`;
document.head.appendChild(sc_style);


window.addEventListener('load', sc_initSpellChecker);
