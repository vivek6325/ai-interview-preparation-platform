/**
 * Mock Voice Architecture Service
 * Prepares interfaces for Speech-To-Text (STT) and Text-To-Speech (TTS) capabilities.
 * 
 * Documentation on future browser Web Speech APIs:
 * - Speech-To-Text (STT): Can be built using the browser's native `window.SpeechRecognition` 
 *   or `window.webkitSpeechRecognition` API. Once started, it captures continuous mic input, 
 *   triggers 'result' callbacks with interim/final transcripts, and throws connection errors.
 * - Text-To-Speech (TTS): Can be built using `window.speechSynthesis` and `SpeechSynthesisUtterance`.
 *   Provides synthesizers to output speech natively via the speakers with custom volumes and pacing.
 */

let recognitionInstance = null;

/**
 * Starts audio recording and triggers transcripts callback
 * @param {Function} onResult - Callback returning (transcriptText, isFinal)
 * @param {Function} onError - Callback returning error details
 */
export function startListening(onResult, onError) {
  console.log("🎙️ [VoiceService] Mock Speech-To-Text started.");
  
  // Future Browser API implementation skeleton:
  /*
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (onError) onError(new Error("Web Speech Recognition is not supported in this browser."));
    return;
  }
  recognitionInstance = new SpeechRecognition();
  recognitionInstance.continuous = true;
  recognitionInstance.interimResults = true;
  recognitionInstance.lang = 'en-US';

  recognitionInstance.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    if (onResult) onResult(finalTranscript || interimTranscript, !!finalTranscript);
  };

  recognitionInstance.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognitionInstance.start();
  */

  // Mock implementation simply prints placeholder intervals:
  const interval = setInterval(() => {
    if (onResult) {
      onResult("This is a mock transcribed answer simulating real-time speech capture...", true);
    }
  }, 3000);

  recognitionInstance = {
    stop: () => {
      clearInterval(interval);
      console.log("🎙️ [VoiceService] Mock Speech-To-Text stopped.");
    }
  };
}

/**
 * Halts mic capture and stops listening
 */
export function stopListening() {
  if (recognitionInstance) {
    recognitionInstance.stop();
    recognitionInstance = null;
  }
}

/**
 * Speaks a given sentence aloud using Text-To-Speech (TTS)
 * @param {string} text - Message to read
 * @param {Function} onEnd - Callback fired when speech is complete
 * @param {Function} onError - Callback fired if speech fails
 */
export function speak(text, onEnd, onError) {
  console.log(`🔊 [VoiceService] Mock Text-To-Speech reading: "${text}"`);

  // Future Browser API implementation skeleton:
  /*
  if (!window.speechSynthesis) {
    if (onError) onError(new Error("Web Speech Synthesis is not supported in this browser."));
    return;
  }
  window.speechSynthesis.cancel(); // Stop any current speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onend = () => { if (onEnd) onEnd(); };
  utterance.onerror = (e) => { if (onError) onError(e); };
  window.speechSynthesis.speak(utterance);
  */

  // Mock implementation triggers onEnd immediately
  setTimeout(() => {
    if (onEnd) onEnd();
  }, 1000);
}
