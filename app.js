const recordButton = document.getElementById('recordButton');
const outputTextarea = document.getElementById('output');
const totalButton = document.getElementById('totalButton');
const resetButton = document.getElementById('resetButton');
const languageDropdown = document.getElementById('languageDropdown');
const totalDisplay = document.getElementById('total');
const lineCountDisplay = document.getElementById('lineCount');
let recognizing = false;
let recognition;
let currentLanguage = 'ta-IN'; // Default language is set to Tamil

// Check if the browser supports the Web Speech API
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
} else if ('SpeechRecognition' in window) {
  recognition = new SpeechRecognition();
} else {
  alert('Your browser does not support the Web Speech API. Please use Chrome or another supported browser.');
}

// Configure the recognition instance
if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true; // Set interimResults to true for real-time feedback
  recognition.lang = currentLanguage; // Set the initial language to Tamil

  recognition.onstart = () => {
    recognizing = true;
    recordButton.innerText = 'Stop Recording';
  };

  recognition.onend = () => {
    recognizing = false;
    recordButton.innerText = 'Start Recording';
  };

  recognition.onresult = (event) => {
    let finalTranscript = '';
    let prevTranscript = outputTextarea.value.split('\n').map(val => val.trim()).filter(val => val !== '');

    for (let i = 0; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        const transcript = event.results[i][0].transcript.trim();
        const numbers = transcript.match(/\d+/g); // Extract all numbers from the transcript

        if (numbers) {
          numbers.forEach(number => {
            if (!prevTranscript.includes(number)) { // Check for duplication
              finalTranscript += number + '\n'; // Append each number on a new line
            }
          });
        }
      }
    }

    // Append the final results to the textarea
    outputTextarea.value += finalTranscript;

    // Update the line count
    updateLineCount();
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error', event);
    recognizing = false;
    recordButton.innerText = 'Start Recording';
  };

  // Add click event listener to the record button
  recordButton.addEventListener('click', () => {
    if (!recognizing) {
      // Request microphone access permission
      navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
        recognition.lang = languageDropdown.value; // Update the recognition language
        recognition.start();
      }).catch((err) => {
        console.error('Error accessing microphone:', err);
      });
    } else {
      recognition.stop();
    }
  });

  // Add change event listener to the language dropdown
  languageDropdown.addEventListener('change', (event) => {
    currentLanguage = event.target.value;
    if (recognizing) {
      recognition.stop();
      recognition.lang = currentLanguage; // Update the recognition language
      recognition.start();
    } else {
      recognition.lang = currentLanguage; // Update the recognition language
    }
  });

  // Total button functionality
  totalButton.addEventListener('click', () => {
    const numbers = outputTextarea.value.trim().split('\n');
    let sum = 0;
    numbers.forEach(num => {
      const parsedNum = parseInt(num, 10);
      if (!isNaN(parsedNum)) {
        sum += parsedNum;
      }
    });
    totalDisplay.innerText = `Total: ${sum}`;
  });

  // Reset button functionality
  resetButton.addEventListener('click', () => {
    outputTextarea.value = '';
    totalDisplay.innerText = 'Total: 0';
    lineCountDisplay.innerText = 'Lines: 0';
  });

  // Function to update the line count
  function updateLineCount() {
    const lineCount = outputTextarea.value.split('\n').filter(line => line.trim() !== '').length;
    lineCountDisplay.innerText = `Lines: ${lineCount}`;
  }

  // Update line count on input change
  outputTextarea.addEventListener('input', updateLineCount);
} else {
  alert('Your browser does not support the Web Speech API. Please use Chrome or another supported browser.');
}
