//TODO: Stop repeats within the last 20 days or something if I can be bothered
//TODO: Add ads
//TODO: Add sharing
//TODO: Add stats (how many times you've guessed 1-8 times or something)
//TODO: Write a help section
//TODO: Get rid of little square again after submitting

if (!localStorage.getItem('helpShown')){
    localStorage.setItem('helpShown', true);
    showHelpModal()
}
const MAX_GUESSES = 8;
let targetInfo = {};
let guesses = [];
let gameWonCheck = false;

function pickRandomSong() {
    if (allTrackNames.length > 0) {
        // Generate a seed from today's date
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        
        // Simple seeded random function
        const pseudoRandom = (seed) => {
            let x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        // Use the pseudo-random function to get a random index
        const randomIndex = Math.floor(pseudoRandom(seed) * allTrackNames.length);
        const randomSong = allTrackNames[randomIndex];
        targetInfo = getTrackInfo(randomSong);
    }
}

function updateGuessCounterDisplay() {
    document.getElementById('guessCounter').textContent = `Guesses: ${guesses.length}/8`;
}


function showHelpModal() {
    document.getElementById('helpModal').style.display = "flex";
}

function showWinModal() {
    document.getElementById('winModal').style.display = "flex";
    const winModal = document.getElementById('winModalContent');
    revealTarget("Win");
    showStats("Win")
}

function showLoseModal() {
    document.getElementById('loseModal').style.display = "flex";
    revealTarget('Lose');
    showStats('Lose')
}

function revealTarget(modal) {
    const container = document.getElementById(`correctSong${modal}`);
    const img = document.createElement('img');
    img.src = targetInfo.img_url;
    img.style.width = '150px';
    img.style.height = 'auto';
    container.appendChild(img);

    const track_name = document.createElement('p');
    track_name.textContent = targetInfo.track_name;
    container.appendChild(track_name);

    if (targetInfo.features.length > 0){
    const ft = document.createElement('p');
        ft.textContent = `ft. ${targetInfo.features.join(', ')}`;
        container.appendChild(ft)
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
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = "none";
    });
}

function handleSubmit() {
    const songInput = document.getElementById('songInput').value;

    if (guesses.length >= MAX_GUESSES) {
        console.log('You have reached the maximum number of guesses. Game over!');
        disableGameInput();
        gameLost();
        return;
    }

    if (allTrackNames.includes(songInput)) {
        document.getElementById('songInput').value = '';
        addGuess(songInput);
        guesses.push(songInput);
        updateGuessCounterDisplay(); // Update guess counter display
        localStorage.setItem('guesses', JSON.stringify(guesses));

    } else if (guesses.includes(songInput)) {
        console.log("You have already guessed this song.");
    } else {
        console.log('Invalid song name. Please try again.');
    }
}


function disableGameInput() {
    // Disable the input field
    const songInputField = document.getElementById('songInput');
    songInputField.disabled = true;

    // Disable the submit button
    const submitButton = document.getElementById('submitBtn');
    submitButton.disabled = true;
}


function gameWon() {
    console.log("GAME WONNNN!")
    gameWonCheck = true;
    
    const today = new Date();
    const formattedToday = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'); // Format YYYY-MM-DD
    
    const lastGame = localStorage.getItem('lastGame')
    if (!(lastGame && lastGame === formattedToday.toString())){
        localStorage.setItem('lastGame', formattedToday)
        localStorage.setItem('streak', parseInt(localStorage.getItem('streak') || 0) + 1);
        localStorage.setItem('correct', parseInt(localStorage.getItem('correct') || 0) + 1);
        localStorage.setItem('gamesPlayed', parseInt(localStorage.getItem('gamesPlayed') || 0) + 1);
    }
    // Disable the input field
    const songInputField = document.getElementById('songInput');
    songInputField.disabled = true;

    // Disable the submit button
    const submitButton = document.getElementById('submitBtn');
    submitButton.disabled = true;

    // Set the last table row's id to 'correctGuess'
    const guessTable = document.querySelector('.guessTable');
    const lastTableRow = guessTable.lastElementChild;
    lastTableRow.id = 'correctGuess';

    // Optionally, you can add a message or visual cue to the user that they have won
    // For example, adding a "Game Won" message above the table or changing the background color of the last row
    // This is a simple way to highlight the correct guess
    showWinModal()
}

function gameLost() {
    const today = new Date();
    const formattedToday = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'); // Format YYYY-MM-DD
    const lastGame = localStorage.getItem('lastGame')
    if (!(lastGame && lastGame === formattedToday.toString())){
        localStorage.setItem('lastGame', formattedToday)
        localStorage.setItem('streak', 0);
        localStorage.setItem('gamesPlayed', parseInt(localStorage.getItem('gamesPlayed') || 0) + 1);
    }

    showLoseModal();
}


function addGuess(guess) {

    const trackInfo = getTrackInfo(guess); // Assuming guess is the track name

    const correctness = compareToTarget(trackInfo);

    // Create a row for the new guess
    const row = document.createElement('tr');
    let cell = document.createElement('td');
    cell.textContent = guess;
    cell.className = guess === targetInfo.track_name ? "correct" : ""
    row.appendChild(cell);

    // Adding an image cell with arrow for album comparison
    cell = document.createElement('td');

    // Determine the arrow symbol based on albumMatch result
    let imgSpan = document.createElement('span'); // Create a new span for the symbol

    cell.className = correctness.albumMatch.replace(" ", "-")
    cell.className += ' album_cell'
    if (correctness.albumMatch.includes("before")) {
        imgSpan.textContent = "↑"; // Up arrow for before
    } else if (correctness.albumMatch.includes("after")) {
        imgSpan.textContent = "↓"; // Down arrow for after
    }

    const img = document.createElement('img');
    img.src = trackInfo.img_url; // Ensure you have an img_url property
    img.style.width = '50px'; // Adjust size as needed
    img.style.height = 'auto';

    // Append the img element directly to the cell, then the arrow symbol (imgSpan)
    cell.appendChild(img); // This ensures the image is to the left of the arrow
    cell.appendChild(imgSpan); // Append the arrow symbol after the img
    row.appendChild(cell);


    // Function to create and append cells based on correctness, now includes symbols for direction
    const appendCorrectnessCell = (criteria, value) => {
        let cell = document.createElement('td');
        let symbol = ""; // Default, no symbol
        if (criteria.includes("before")) {
            symbol = "↑ "; // Up arrow for before
        } else if (criteria.includes("after")) {
            symbol = "↓ "; // Down arrow for after
        }
        cell.innerHTML = value + symbol; // Use innerHTML to properly render the symbol
        cell.className = criteria.replace(" ", "-"); // Use className for styling based on the criteria
        row.appendChild(cell);
    };

    // Adjusted calls to appendCorrectnessCell to include actual values and correctness indicators
    appendCorrectnessCell(correctness.trackNumberMatch, trackInfo.track_number.toString());
    appendCorrectnessCell(correctness.trackLengthMatch, trackInfo.track_length);

    cell = document.createElement('td');
    cell.textContent = trackInfo.features.join(', ') || 'no features'; // Directly show the features
    cell.className = correctness.sharedFeatures
    row.appendChild(cell);

    // Append the new row to the guess table
    document.querySelector('.guessTable').appendChild(row);

    if (JSON.stringify(trackInfo) === JSON.stringify(targetInfo)) {
        gameWon()
    } else if (guesses.length >= MAX_GUESSES) {
        console.log('No more guesses left. Game over!');
        disableGameInput();
        showLoseModal(); // Show lose modal if no more guesses are left
    }
}


document.addEventListener('DOMContentLoaded', function() {
    fetchAlbums().then(trackNames => {
        allTrackNames = trackNames;
        pickRandomSong();
        checkAndUpdateDate(); // Call this function to check the date and load or reset guesses
        updateGuessCounterDisplay();
    });

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
        localStorage.setItem('lastVisit', formattedToday); // Update the last visit date
    }
}

function loadGuesses() {
    guesses = JSON.parse(localStorage.getItem('guesses')) || [];
    guesses.forEach(guess => addGuess(guess));
}


// Global variable to store albums data
let albumsData = [];

// Adjust the fetchAlbums function to also set albumsData
function fetchAlbums() {
    return fetch('songs.json') // Start the fetch operation
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON of the response
        })
        .then(albums => {
            albumsData = albums; // Set the global albumsData variable
            const trackNames = getAllTrackNames(albums); // Process the albums to get track names
            return trackNames; // Return the track names for the next .then()
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
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
    // Check if inputVal is not empty
    if (inputVal.trim() !== '') {
        const filteredTracks = allTrackNames.filter(name => name.toLowerCase().startsWith(inputVal)).slice(0, 5); // Limit to 5 suggestions
        displaySuggestions(filteredTracks);
    } else {
        // Clear suggestions if the input is empty
        displaySuggestions([]);
    }
});

function displaySuggestions(trackNames) {
    const suggestionsBox = document.getElementById('suggestions');
    suggestionsBox.innerHTML = ''; // Clear previous suggestions
    
    if (trackNames.length > 0) {
        document.getElementById('suggestions').style.display = 'block';
        const suggestionsHTML = trackNames.map(name => `<div class="suggestion-item">${name}</div>`).join('');
        suggestionsBox.innerHTML = suggestionsHTML;
        
        // Add click event to fill the search box with the selected suggestion
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                document.getElementById('songInput').value = this.innerText;
                suggestionsBox.innerHTML = ''; // Clear suggestions
            });
        });
    } else{
        console.log('hide the thing?')
        document.getElementById('suggestions').style.display = 'none';
    }
}


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
    } else if (Math.abs(targetAlbumIndex - comparedAlbumIndex) === 1) {
        comparisonResults.albumMatch = targetAlbumIndex > comparedAlbumIndex ? "before close" : "after close";
    } else {
        comparisonResults.albumMatch = targetAlbumIndex > comparedAlbumIndex ? "before" : "after";
    }

    // Track number comparison
    const trackNumberDifference = Math.abs(targetInfo.track_number - trackInfo.track_number);
    if (trackNumberDifference === 0) {
        comparisonResults.trackNumberMatch = "correct";
    } else if (trackNumberDifference === 1 || trackNumberDifference === 2) {
        comparisonResults.trackNumberMatch = targetInfo.track_number > trackInfo.track_number ? "before close" : "after close";
    } else {
        comparisonResults.trackNumberMatch = targetInfo.track_number > trackInfo.track_number ? "before" : "after";
    }

    // Track length comparison
    const targetTrackLengthSeconds = trackLengthToSeconds(targetInfo.track_length);
    const comparedTrackLengthSeconds = trackLengthToSeconds(trackInfo.track_length);
    const trackLengthDifference = Math.abs(targetTrackLengthSeconds - comparedTrackLengthSeconds);
    if (trackLengthDifference === 0) {
        comparisonResults.trackLengthMatch = "correct";
    } else if (trackLengthDifference <= 20) {
        comparisonResults.trackLengthMatch = targetTrackLengthSeconds > comparedTrackLengthSeconds ? "before close" : "after close";
    } else {
        comparisonResults.trackLengthMatch = targetTrackLengthSeconds > comparedTrackLengthSeconds ? "before" : "after";
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

