if (!localStorage.getItem('helpShown')){
    localStorage.setItem('helpShown', true);
    showHelpModal()
}

const MAX_GUESSES = 8;
let targetInfo = {};
let guesses = [];
let gameWonCheck = false;
let gameLostCheck = false;
let hardGameWonCheck = false;
let hardGameLostCheck = false;
let changingModes = false;

const easyLayer = document.querySelector('.background .easy');
const hardLayer = document.querySelector('.background .hard');

let hardMode = false;
if (localStorage.getItem('hard') && localStorage.getItem('hard') === 'true'){
    // console.log("HARD MODE")
    hardMode = true
    hardLayer.style.opacity = 1;
    easyLayer.style.opacity = 0;
}else{
    // console.log("Easy mode!")
    localStorage.setItem('hard', false)
    easyLayer.style.opacity = 1;
    hardLayer.style.opacity = 0;
}

let trackNumOrder = true;
if (localStorage.getItem('NumericTrackNumbers') && localStorage.getItem('NumericTrackNumbers') === 'true'){
    trackNumOrder = false;
}


function pickRandomSong() {
    // Assuming allTrackNames is an array of song names available globally

    // Generate a seed from today's date
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // Simple seeded random function
    const pseudoRandom = seed => {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    // Generate a list of indices to exclude based on the last 40 days
    let excludeIndices = new Set();
    for (let daysAgo = 1; daysAgo <= 40; daysAgo++) {
        const seedForDay = seed - daysAgo; // Adjust seed for each day in the past 40 days
        const indexToExclude = Math.floor(pseudoRandom(seedForDay) * allTrackNames.length);
        excludeIndices.add(indexToExclude);
    }
    // Filter out songs to exclude
    const availableSongs = allTrackNames.filter((_, index) => !excludeIndices.has(index));

    if (availableSongs.length > 0) {
        // Use the pseudo-random function to get a random index from the available songs
        const randomIndex = Math.floor(pseudoRandom(seed) * availableSongs.length);
        randomSong = availableSongs[randomIndex];
        targetInfo = getTrackInfo(randomSong)
        
    } else {
        // Handle the case where no songs are available
        const randomIndex = Math.floor(pseudoRandom(seed) * allTrackNames.length);
        randomSong = allTrackNames[randomIndex];
        targetInfo = getTrackInfo(randomSong)
    }
}

function updateGuessCounterDisplay() {
    document.getElementById('guesses').innerHTML = `Guess: ${guesses.length}<span class="alternate-font">/</span>8`;
}

function showHelpModal() {
    disableScrolling();
    document.getElementById('helpModal').style.display = "flex";
}

function showSettingsModal() {
    document.getElementById('HardSwitch').checked = hardMode;
    document.getElementById('TrackNumSwitch').checked = !trackNumOrder
    disableScrolling();
    document.getElementById('settingsModal').style.display = "flex";
}

function showResults() {
    if ((gameWonCheck && !hardMode) || (hardGameWonCheck && hardMode)){
        showWinModal()
    } else {
        showLoseModal()
    }
}
function showWinModal() {
    disableScrolling();
    document.getElementById('winModal').style.display = "flex";
    revealTarget("Win");
    showStats("Win")
    const hardModeNotifier = document.getElementById('hardModeNotifier')
    hardModeNotifier.textContent = ""
    if (!hardMode && !hardGameWonCheck){
        hardModeNotifier.textContent = "Try out hard mode in settings!"
    }
}

function showLoseModal() {
    disableScrolling();
    document.getElementById('loseModal').style.display = "flex";
    revealTarget('Lose');
    showStats('Lose')
}

function disableScrolling(){
    document.body.classList.add("stop-scrolling");
}

function enableScroll() {
    document.body.classList.remove("stop-scrolling");
}

function revealTarget(modal) {
    const container = document.getElementById(`correctSong${modal}`);
    container.innerHTML = ""
    const img = document.createElement('img');
    img.src = targetInfo.img_url;
    img.style.width = '150px';
    img.style.height = 'auto';
    img.classList.add('target-image');
    container.appendChild(img);

    const track_name = document.createElement('p');
    track_name.textContent = targetInfo.track_name;
    container.appendChild(track_name);

    if (targetInfo.features && targetInfo.features.length > 0) {
        const ft = document.createElement('p');
        ft.textContent = `ft. ${targetInfo.features.join(', ')}`;
        container.appendChild(ft);
    }
    
}

function showStats(modal) {
    const streak = document.getElementById(`streak${modal}`)
    streak.textContent = localStorage.getItem('streak') || 0;
    
    const correct = document.getElementById(`correct${modal}`)
    correct.textContent = localStorage.getItem('correct') || 0;
    
    const gamesPlayed = document.getElementById(`games${modal}`)
    gamesPlayed.textContent = localStorage.getItem('gamesPlayed') || 0;
}

function closeModal() {
    enableScroll();
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = "none";
    });
}

// Get the checkbox element
const hardSwitch = document.getElementById('HardSwitch');

// Add an event listener for the 'change' event
hardSwitch.addEventListener('change', function() {
    changingModes = true
    guesses = [];
    document.querySelector('.grid-table').innerHTML = '<div class="grid-header">Track Name</div><div class="grid-header">Album</div><div class="grid-header">Track Number</div><div class="grid-header">Track Length</div><div class="grid-header">Features</div>';
    localStorage.setItem('hard', this.checked)
    hardMode = this.checked
    
    const today = new Date();
    const formattedToday = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'); // Format YYYY-MM-DD
    // console.log('Mode:', this.checked ? 'hard' : 'easy')
    const lastGame = localStorage.getItem(hardMode ? 'lastHardGame' : 'lastGame');
    // console.log(lastGame)
    if ((lastGame && lastGame === formattedToday.toString())){
        disableGameInput();
    }else{
        enableGameInput();
    }
    
    if (this.checked) {
        // Hard Mode is on!
        hardLayer.style.opacity = 1;
        easyLayer.style.opacity = 0;
        
        //load the hard mode random song of today
        //reset guesses to whatever the localstorage says
        //load the guesses in
        
        fetchAlbums('hardSongs.json').then(trackNames => {
            allTrackNames = trackNames;
            pickRandomSong();
            checkAndUpdateDate();
            updateGuessCounterDisplay();
        });
        adjustBodyHeight();
        
        
    } else {
        // Hard Mode is off!
        easyLayer.style.opacity = 1;
        hardLayer.style.opacity = 0;
        
        //load the easy mode random song of today
        //reset guesses to whatever the localstorage says
        //load the guesses in
        fetchAlbums('songs.json').then(trackNames => {
            allTrackNames = trackNames;
            pickRandomSong();
            checkAndUpdateDate();
            updateGuessCounterDisplay();
        });
        adjustBodyHeight();
        
    }
    setTimeout(() => {
        changingModes = false;
    }, 1000)
});

const trackNumSwitch = document.getElementById('TrackNumSwitch');

trackNumSwitch.addEventListener('change', function() {
    trackNumOrder = !this.checked;
    localStorage.setItem('NumericTrackNumbers', this.checked)
    let tempGuesses = guesses;
    guesses = [];
    document.querySelector('.grid-table').innerHTML = '<div class="grid-header">Track Name</div><div class="grid-header">Album</div><div class="grid-header">Track Number</div><div class="grid-header">Track Length</div><div class="grid-header">Features</div>'
    checkAndUpdateDate();
})


function handleSubmit() {
    consent = localStorage.getItem('cookieConsent')
    if (consent && consent.analytics){
        gtag('event', 'submit_word', {
            'event_category': 'Game Interaction',
            'event_label': 'Word Submission'
        });
    }
    
    const songInput = document.getElementById('songInput').value;
    const inputInfo = getTrackInfo(songInput)
    
    if (guesses.includes(songInput)) {
        showError("you've already guessed this song!")
        document.getElementById('songInput').value = '';
        document.getElementById('suggestions').style.display = 'none';
    } else if (allTrackNames.includes(songInput)) {

        document.getElementById('songInput').value = '';
        document.getElementById('suggestions').style.display = 'none';
        addGuess(songInput);
        guesses.push(songInput);
        updateGuessCounterDisplay();
        localStorage.setItem(hardMode ? 'hardguesses' : 'guesses', JSON.stringify(guesses));
    } 
    else {
        showError('Invalid song name!');
    }

    if (guesses.length >= MAX_GUESSES && JSON.stringify(inputInfo) !== JSON.stringify(targetInfo)) {
        consent = localStorage.getItem('cookieConsent')
        if (consent && consent.analytics){
            gtag('event', 'game_lose', {
                'event_category': 'Game Outcome',
                'event_label': 'Lose',
                'game_mode': hardMode ? 'hard' : 'easy'
            });
        }
        gameLost();
    }
    
}

function showError(message, seconds=2.5) {
    // Create the error box if it doesn't exist
    if (!document.querySelector('#errorBox')) {
        const errorBox = document.createElement('div');
        errorBox.id = 'errorBox';
        document.body.appendChild(errorBox);
    }

    const errorBox = document.querySelector('#errorBox');
    errorBox.textContent = message;

    // Apply the slide-in animation
    errorBox.style.animation = 'slideIn 0.5s ease-in-out forwards';

    // Switch to the slide-out animation after 3 seconds
    setTimeout(() => {
        errorBox.style.animation = 'slideOut 0.5s ease-in-out forwards';
        
    }, seconds * 1000);
    setTimeout(() => {
        errorBox.textContent = '';
    }, seconds * 1000 + 500)
}

function disableGameInput() {
    // console.log('disabling game input')
    // Disable the input field
    const songInputField = document.getElementById('songInput');
    songInputField.disabled = true;
    songInputField.style.display = 'none'

    const inputUnderline = document.getElementById('underline')
    inputUnderline.style.display = 'none'

    // Disable the submit button
    const submitButton = document.getElementById('submitBtn');
    submitButton.disabled = true;
    submitButton.style.display = 'none'

    const resultsButton = document.getElementById('results');
    resultsButton.style.display = 'block'
}

function enableGameInput() {
    // console.log('enabling game input')
    // enable the input field
    const songInputField = document.getElementById('songInput');
    songInputField.disabled = false;
    songInputField.style.display = 'block'

    const inputUnderline = document.getElementById('underline')
    inputUnderline.style.display = 'block'

    // enable the submit button
    const submitButton = document.getElementById('submitBtn');
    submitButton.disabled = false;
    submitButton.style.display = 'block'

    const resultsButton = document.getElementById('results');
    resultsButton.style.display = 'none'
}


function gameWon() {
    consent = localStorage.getItem('cookieConsent')
    if (consent && consent.analytics){
        gtag('event', 'game_won', {
            'event_category': 'Game Outcome',
            'event_label': 'Win'
        });
    }
    // console.log("GAME WOOOON! WOOO!")
    
    const today = new Date();
    const formattedToday = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'); // Format YYYY-MM-DD
    
    const lastGame = localStorage.getItem(hardMode ? 'lastHardGame' : 'lastGame');
    if (!(lastGame && lastGame === formattedToday.toString())){
        localStorage.setItem( hardMode ? 'lastHardGame' : 'lastGame', formattedToday)
        localStorage.setItem('streak', parseInt(localStorage.getItem('streak') || 0) + 1);
        localStorage.setItem('correct', parseInt(localStorage.getItem('correct') || 0) + 1);
        localStorage.setItem('gamesPlayed', parseInt(localStorage.getItem('gamesPlayed') || 0) + 1);
    }
    disableGameInput();

    
    if (!gameWonCheck && !hardMode){
        gameWonCheck = true;
        if (!changingModes){
            showWinModal();
        }
    } else if (!hardGameWonCheck && hardMode){
        hardGameWonCheck = true;
        if (!changingModes){
            showWinModal();
        }
    }
}

function gameLost() {

    // console.log("Oh no! Game lost :(")
    consent = localStorage.getItem('cookieConsent')
    if (consent && consent.analytics){
        gtag('event', 'game_lose', {
            'event_category': 'Game Outcome',
            'event_label': 'Lose'
        });
    }
    
    disableGameInput();
    const today = new Date();
    const formattedToday = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'); // Format YYYY-MM-DD
    const lastGame = localStorage.getItem( hardMode ? 'lastHardGame' : 'lastGame' )
    if (!(lastGame && lastGame === formattedToday.toString())){
        localStorage.setItem(hardMode ? 'lastHardGame' : 'lastGame', formattedToday)
        localStorage.setItem('streak', 0);
        localStorage.setItem('gamesPlayed', parseInt(localStorage.getItem('gamesPlayed') || 0) + 1);
    }
    
    if (!gameLostCheck && !hardMode){
        gameLostCheck = true;
        showLoseModal();
    } else if (!hardGameLostCheck && hardMode){
        hardGameLostCheck = true;
        showLoseModal();
    }
}


function addGuess(guess) {
    
    const trackInfo = getTrackInfo(guess); // Assuming guess is the track name
    const correctness = compareToTarget(trackInfo);

    // Create a row for the new guess
    
    // Add guess name cell
    let cell = document.createElement('div');
    cell.textContent = guess;
    cell.className = 'grid-cell ' + (guess === targetInfo.track_name ? "correct" : "");
    document.querySelector('.grid-table').appendChild(cell);

    // Add album comparison cell with image and arrow
    // Adding an image cell with arrow for album comparison
    cell = document.createElement('div');
    cell.className = 'grid-cell ' + correctness.albumMatch.replace(" ", "-") + ' album_cell';

    const albumContainer = document.createElement('div'); // Create a new div for the album image and arrow
    albumContainer.style.display = 'flex'; // Use flexbox to align items inline
    albumContainer.style.alignItems = 'center'; // Center items vertically

    const img = document.createElement('img');
    img.src = trackInfo.img_url; // Ensure you have an img_url property
    img.style.width = '50px'; // Adjust size as needed
    img.style.height = 'auto';
    img.style.marginRight = '10px'; // Add some space between the image and the arrow
    if (trackInfo.album_name.toLowerCase().includes('edition') || trackInfo.album_name.toLowerCase().includes('deluxe')){
        img.classList.add('deluxe')
    }

    let arrowSpan = document.createElement('span'); // Create a new span for the symbol
    arrowSpan.className = "arrow"; // Assign a base class for styling

    if (correctness.albumMatch.includes("before")) {
        arrowSpan.textContent = "↑"; // Up arrow for before
        arrowSpan.classList.add("up-arrow"); // Add class for up arrow
    } else if (correctness.albumMatch.includes("after")) {
        arrowSpan.textContent = "↓"; // Down arrow for after
        arrowSpan.classList.add("down-arrow"); // Add class for down arrow
    }

    // Append the image and arrow span to the album container
    albumContainer.appendChild(img);
    albumContainer.appendChild(arrowSpan);

    // Append the album container to the cell
    cell.appendChild(albumContainer);
    document.querySelector('.grid-table').appendChild(cell);


    // Function to create and append cells based on correctness
    // Function to create and append cells based on correctness, now includes symbols for direction
    const appendCorrectnessCell = (criteria, value) => {
        let cell = document.createElement('div');
        let symbolSpan = document.createElement('span'); // Create a new span for the arrow symbol
        symbolSpan.className = "arrow-container"; // Reuse the arrow-container class for styling

        let symbol = ""; // Default, no symbol
        if (criteria.includes("before")) {
            symbol = "↑"; // Up arrow for before
            symbolSpan.className += " arrow up-arrow"; // Add classes for up arrow
        } else if (criteria.includes("after")) {
            symbol = "↓"; // Down arrow for after
            symbolSpan.className += " arrow down-arrow"; // Add classes for down arrow
        }
        symbolSpan.textContent = symbol; // Set the text content of the span to the arrow symbol
        
        // Now set the cell's content to the value and append the symbolSpan next to it
        cell.textContent = value + " "; // Add a space for separation
        cell.appendChild(symbolSpan); // Append the arrow span next to the value
        cell.className = criteria.replace(" ", "-"); // Use className for styling based on the criteria
        cell.className += ' grid-cell'
        document.querySelector('.grid-table').appendChild(cell);
        adjustBodyHeight()
    };


    // Append cells for track number, track length, and features
    appendCorrectnessCell(correctness.trackNumberMatch, trackInfo.track_number.toString());
    appendCorrectnessCell(correctness.trackLengthMatch, trackInfo.track_length);

    cell = document.createElement('div');
    cell.textContent = trackInfo.features.join(', ') || 'No features';
    cell.className = 'grid-cell ' + correctness.sharedFeatures;

    // Append the new row to the guess table
    document.querySelector('.grid-table').appendChild(cell);

    // Check for win or lose conditions
    if (JSON.stringify(trackInfo) === JSON.stringify(targetInfo)) {
        gameWon();
    } else if (guesses.length >= MAX_GUESSES && guesses[guesses.length - 1] === guess) {
        gameLost();
        disableGameInput();
    }
}

function adjustBodyHeight() {
    const bodyContentHeight = document.body.scrollHeight;
    const viewportHeight = window.innerHeight;

    if (bodyContentHeight > viewportHeight) {
        document.body.classList.remove("viewport-height");
        document.body.classList.add("content-height");
    } else {
        document.body.classList.remove("content-height");
        document.body.classList.add("viewport-height");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchAlbums(hardMode ? 'hardSongs.json' : 'songs.json').then(trackNames => {
        allTrackNames = trackNames;
        pickRandomSong();
        checkAndUpdateDate();
        updateGuessCounterDisplay();
    });
    adjustBodyHeight();

    // Adjust the height whenever the window is resized
    window.addEventListener("resize", adjustBodyHeight);

    // Add event listener to the submit button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('click', handleSubmit);

});

function checkAndUpdateDate() {
    const today = new Date();
    const formattedToday = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'); // Format YYYY-MM-DD

    const lastVisit = localStorage.getItem('lastVisit');

    if (formattedToday === lastVisit) {
        loadGuesses(); // Load guesses from localStorage if it's the same day
    } else {
        localStorage.setItem('guesses', JSON.stringify([])); // Reset guesses
        localStorage.setItem('hardguesses', JSON.stringify([])); // Reset hard mode guesses
        localStorage.setItem('lastVisit', formattedToday); // Update the last visit date
    }
}

function loadGuesses() {
    guesses = JSON.parse((localStorage.getItem((hardMode ? 'hard' : '') + 'guesses') || '[]'));
    guesses.forEach(guess => addGuess(guess));
}


// Global variable to store albums data
let albumsData = [];

// Adjust the fetchAlbums function to also set albumsData
function fetchAlbums(file) {
    // console.log('getting', file)
    return fetch(file) // Start the fetch operation
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON of the response
        })
        .then(albums => {
            albumsData = albums; // Set the global albumsData variable
            populateAlbumsDiv(albumsData)
            const trackNames = getAllTrackNames(albums); // Process the albums to get track names
            return trackNames; // Return the track names for the next .then()
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

function populateAlbumsDiv(albumsData) {
    const albumsContainer = document.getElementById('albumContainer');
    albumsContainer.innerHTML = '';
    // console.log(albumsData)
    albumsData.forEach((album, index) => {
        const img = document.createElement('img');
        img.className = 'album';
        img.src = album.img_url;
        img.alt = album.album_name;
        if (album.album_name.toLowerCase().includes('edition') || album.album_name.toLowerCase().includes('deluxe')){
            img.classList.add('deluxe')
        }

        // Apply the wave animation with a dynamic delay
        img.style.animation = 'wave 2s infinite';
        img.style.animationDelay = `${index * 0.2}s`;

        albumsContainer.appendChild(img);
    });
}


// Assuming you have a function getAllTrackNames defined like in the previous example
function getAllTrackNames(albums) {
    let trackNames = []; // Initialize an empty array to hold all track names
    albums.forEach(album => {
        album.tracks.forEach(track => {
            trackNames.push(track.track_name);
        });
    });
    return trackNames;
}

// After fetching albums and processing track names
let allTrackNames = []; // This will be filled after fetching albums

document.getElementById('songInput').addEventListener('input', function() {
    const inputVal = this.value.toLowerCase();
    if (inputVal.trim() !== '') {
        const filteredTracks = allTrackNames.filter(name => name.toLowerCase().startsWith(inputVal)).slice(0, 5);
        displaySuggestions(filteredTracks);
    } else {
        displaySuggestions([]);
    }
});

function displaySuggestions(trackNames) {
    const suggestionsBox = document.getElementById('suggestions');
    suggestionsBox.innerHTML = '';
    if (trackNames.length > 0) {
        document.getElementById('suggestions').style.display = 'block';
        const suggestionsHTML = trackNames.map(name => `<div class="suggestion-item">${name}</div>`).join('');
        suggestionsBox.innerHTML = suggestionsHTML;
        
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                document.getElementById('songInput').value = this.innerText;
                displaySuggestions([]);
            });
        });
    } else {
        document.getElementById('suggestions').style.display = 'none';
    }
}

document.addEventListener('click', function(e) {
    const searchInput = document.getElementById('songInput');
    const suggestionsBox = document.getElementById('suggestions');
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.style.display = 'none';
    }
});



// Function to get details about a track
function getTrackInfo(trackName) {
    let trackInfo = {
        track_name: trackName,
        img_url: '',
        album_name: '',
        track_number: -1,
        track_length: '',
        features: []
    };

    // Assume albumsData is the variable holding the JSON structure of albums and tracks
    for (let album of albumsData) {
        let tracks = album.tracks;
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].track_name.toLowerCase() === trackName.toLowerCase()) {
                trackInfo.img_url = album.img_url;
                trackInfo.album_name = album.album_name;
                trackInfo.track_number = i + 1; // Track number in the album
                trackInfo.track_length = tracks[i].track_length;
                trackInfo.features = tracks[i].features;
                return trackInfo; // Return the track info as soon as we find the track
            }
        }
    }
    return trackInfo; // Return default track info if not found
}

function compareToTarget(trackInfo) {
    // Initialize a comparison result object
    let comparisonResults = {
        albumMatch: "correct", // Assume correct to start, will adjust based on logic
        trackNumberMatch: "correct", // Same assumption
        trackLengthMatch: "correct", // Same assumption
        // Start with "incorrect" and adjust based on logic below
        featuresMatch: "incorrect" 
    };

    // Helper function to convert track length (mm:ss) to total seconds
    const trackLengthToSeconds = (trackLength) => {
        const [minutes, seconds] = trackLength.split(':').map(Number);
        return minutes * 60 + seconds;
    };

    // Album comparison
    const targetAlbumIndex = albumsData.findIndex(album => album.album_name === targetInfo.album_name);
    const comparedAlbumIndex = albumsData.findIndex(album => album.album_name === trackInfo.album_name);
    if (targetAlbumIndex === comparedAlbumIndex) {
        comparisonResults.albumMatch = "correct";
    } else if (Math.abs(targetAlbumIndex - comparedAlbumIndex) === 1 || Math.abs(targetAlbumIndex - comparedAlbumIndex) === 2) {
        comparisonResults.albumMatch = targetAlbumIndex > comparedAlbumIndex ? "before close" : "after close";
    } else {
        comparisonResults.albumMatch = targetAlbumIndex > comparedAlbumIndex ? "before" : "after";
    }

    // Track number comparison
    const trackNumberDifference = Math.abs(targetInfo.track_number - trackInfo.track_number);
    if (trackNumberDifference === 0) {
        comparisonResults.trackNumberMatch = "correct";
    } else if (trackNumberDifference === 1 || trackNumberDifference === 2) {
        comparisonResults.trackNumberMatch = (trackNumOrder && targetInfo.track_number < trackInfo.track_number) || (!trackNumOrder && targetInfo.track_number > trackInfo.track_number) ? "before close" : "after close";
    } else {
        comparisonResults.trackNumberMatch = (trackNumOrder && targetInfo.track_number < trackInfo.track_number) || (!trackNumOrder && targetInfo.track_number > trackInfo.track_number) ? "before" : "after";
    }
    

    // Track length comparison
    const targetTrackLengthSeconds = trackLengthToSeconds(targetInfo.track_length);
    const comparedTrackLengthSeconds = trackLengthToSeconds(trackInfo.track_length);
    const trackLengthDifference = Math.abs(targetTrackLengthSeconds - comparedTrackLengthSeconds);
    if (trackLengthDifference === 0) {
        comparisonResults.trackLengthMatch = "correct";
    } else if (trackLengthDifference <= 30) {

        comparisonResults.trackLengthMatch = (targetTrackLengthSeconds > comparedTrackLengthSeconds) ? "before close" : "after close";
    } else {
        comparisonResults.trackLengthMatch = (targetTrackLengthSeconds > comparedTrackLengthSeconds) ? "before" : "after";
    }

    // Checking shared features
    const targetFeaturesSet = new Set(targetInfo.features);
    const trackFeaturesSet = new Set(trackInfo.features);
    const intersection = new Set([...targetFeaturesSet].filter(x => trackFeaturesSet.has(x)));
    
    if (targetFeaturesSet.size === 0 && trackFeaturesSet.size === 0){
        comparisonResults.sharedFeatures = "correct"
        
    } else if (intersection.size > 0) {
        // At least one shared feature
        if (targetFeaturesSet.size === trackFeaturesSet.size && intersection.size === targetFeaturesSet.size) {
            // All features match
            comparisonResults.sharedFeatures = "correct";
        } else {
            // Not all features match, but there is at least one common
            comparisonResults.sharedFeatures = "close";
        }
    } else {
        // No shared features
        comparisonResults.sharedFeatures = "incorrect";
    }

    return comparisonResults;
}

function generateEmojiString() {
    // Initialize an empty string to hold the emoji representation
    let emojiString = '';

    const decideEmoji = (comparison) => {
        switch (comparison) {
            case 'correct':
                return '🟩'; // Green square for correct
            case 'before close':
            case 'after close':
            case 'close':
                return '🟨'; // Yellow square for close
            case 'before':
            case 'after':
            default:
                return '⬛'; // No emoji for incorrect or any other case
        }
    };
    
    // Iterate through the guesses array
    guesses.forEach(guess => {
        const trackInfo = getTrackInfo(guess); // Assuming you have a function to get track info based on the guess
        const comparisonResults = compareToTarget(trackInfo); // Compare the guess to the target
        
        emojiString += albumMatch = decideEmoji(comparisonResults.albumMatch);
        emojiString += trackNumberMatch = decideEmoji(comparisonResults.trackNumberMatch);
        emojiString += trackLengthMatch = decideEmoji(comparisonResults.trackLengthMatch);
        emojiString += sharedFeatures = comparisonResults.sharedFeatures === 'correct' ? '🟩' : (comparisonResults.sharedFeatures === 'close' ? '🟨' : '⬛');
        emojiString += '\n'
    });
    return emojiString;
}

function shareContent() {
    const emojis = generateEmojiString();

    const startDate = new Date('2024-04-10'); 
    const currentDate = new Date();
    const timeDiff = currentDate - startDate;
    const dayNumber = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    const textToShare = `Yachtle.xyz ${dayNumber}${hardMode ? ' Hard Mode' : ''}: ${guesses.length}/8\n\n${emojis}\nwww.Yachtle.xyz `;

    // Assuming desktops are less likely to be touch-enabled, use this as a heuristic
    // This is not a perfect check, as some desktops are touch-enabled
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        // Likely a mobile device
        if (navigator.share) {
            // Use Web Share API if available
            navigator.share({
                text: textToShare,
            })
            .catch((error) => showError('Error sharing content...'));
        } else {
            // Fallback if Web Share API is not supported
            copyToClipboard(textToShare);
            
        }
    } else {
        // Likely a desktop, so directly copy to clipboard
        copyToClipboard(textToShare);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    .catch((error) => {
        console.error('Error copying to clipboard:', error);
    });
    showError("Copied to clipboard!")
}


  