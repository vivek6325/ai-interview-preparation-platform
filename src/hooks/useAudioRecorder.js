import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Helper function to format seconds into MM:SS
 * @param {number} totalSeconds 
 * @returns {string} Formatted time string (MM:SS)
 */
export function formatAudioTimer(totalSeconds = 0) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Custom hook to handle audio recording via browser native MediaRecorder API.
 * 
 * Provides state for status, recording indicator, timer, recorded audio Blob & Object URL,
 * graceful permission denial handling, unsupported browser checks, and clean stream release.
 */
export function useAudioRecorder() {
  // Status: 'idle' | 'recording' | 'recorded' | 'permission_denied' | 'unavailable' | 'unsupported'
  const [status, setStatus] = useState('idle');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [volumeSamples, setVolumeSamples] = useState([]);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const volumeSamplesRef = useRef([]);

  const isRecording = status === 'recording';
  const isSupported = Boolean(
    typeof window !== 'undefined' &&
    navigator?.mediaDevices?.getUserMedia &&
    window?.MediaRecorder
  );

  // Helper to release microphone stream tracks and audio context
  const stopStreamTracks = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch (e) {
        console.warn('Failed to close AudioContext:', e);
      }
      audioCtxRef.current = null;
    }
    analyserRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Failed to stop audio track:', e);
        }
      });
      streamRef.current = null;
    }
  }, []);

  // Helper to clear timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup object URL
  const cleanupAudioUrl = useCallback((urlToClean) => {
    if (urlToClean) {
      try {
        URL.revokeObjectURL(urlToClean);
      } catch (e) {
        console.warn('Failed to revoke audio object URL:', e);
      }
    }
  }, []);

  /**
   * Resets the recording state and cleans up Object URLs
   */
  const resetRecording = useCallback(() => {
    clearTimer();
    stopStreamTracks();
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore inactive stop errors
      }
    }
    mediaRecorderRef.current = null;

    if (audioUrl) {
      cleanupAudioUrl(audioUrl);
    }

    setAudioUrl(null);
    setAudioBlob(null);
    setVolumeSamples([]);
    setDuration(0);
    setError(null);
    setStatus('idle');
    chunksRef.current = [];
    volumeSamplesRef.current = [];
  }, [audioUrl, cleanupAudioUrl, clearTimer, stopStreamTracks]);

  /**
   * Starts audio recording using browser native MediaRecorder
   */
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setStatus('unsupported');
      setError('MediaRecorder is not supported in this browser. Please use Chrome, Edge, or Firefox.');
      return;
    }

    // Reset existing recording state first
    resetRecording();

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // AudioContext AnalyserNode for volume level sampling
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          audioCtxRef.current = audioCtx;
          analyserRef.current = analyser;
        }
      } catch (e) {
        console.warn('Volume level sampling initialization skipped:', e);
      }

      // Select supported mimeType
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      volumeSamplesRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setError('Recording failed due to a media recording error.');
        stopStreamTracks();
        clearTimer();
        setStatus('idle');
      };

      mediaRecorder.onstop = () => {
        setVolumeSamples([...volumeSamplesRef.current]);
        stopStreamTracks();
        clearTimer();

        if (chunksRef.current.length > 0) {
          const blobMime = mimeType || 'audio/webm';
          const blob = new Blob(chunksRef.current, { type: blobMime });

          if (blob.size === 0) {
            setError('Recorded audio was empty. Please try recording again.');
            setStatus('idle');
            return;
          }

          const url = URL.createObjectURL(blob);
          setAudioBlob(blob);
          setAudioUrl(url);
          setStatus('recorded');
        } else {
          setError('No audio data recorded.');
          setStatus('idle');
        }
      };

      mediaRecorder.start(100); // collect 100ms slices
      setStatus('recording');
      setDuration(0);

      // Start elapsed duration timer & volume sampling interval
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);

        // Sample volume frequency amplitude
        if (analyserRef.current) {
          try {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avgVol = Math.round(sum / dataArray.length);
            volumeSamplesRef.current.push(avgVol);
          } catch {
            // ignore frame sampling errors
          }
        }
      }, 1000);

    } catch (err) {
      console.error('Error starting audio recording:', err);
      stopStreamTracks();
      clearTimer();

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('permission_denied');
        setError('Microphone permission required. Please allow access to record audio.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setStatus('unavailable');
        setError('Microphone unavailable. No audio input device detected.');
      } else {
        setStatus('idle');
        setError(err.message || 'Could not start audio recording.');
      }
    }
  }, [isSupported, resetRecording, stopStreamTracks, clearTimer]);

  /**
   * Stops active audio recording
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping MediaRecorder:', err);
        stopStreamTracks();
        clearTimer();
        setStatus('idle');
      }
    } else {
      stopStreamTracks();
      clearTimer();
    }
  }, [stopStreamTracks, clearTimer]);

  // Clean up stream tracks and Object URLs on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      stopStreamTracks();
      if (audioUrl) {
        cleanupAudioUrl(audioUrl);
      }
    };
  }, [audioUrl, cleanupAudioUrl, clearTimer, stopStreamTracks]);

  return {
    status,
    isRecording,
    isSupported,
    duration,
    formattedTime: formatAudioTimer(duration),
    audioBlob,
    audioUrl,
    volumeSamples,
    error,
    startRecording,
    stopRecording,
    resetRecording
  };
}

export default useAudioRecorder;
