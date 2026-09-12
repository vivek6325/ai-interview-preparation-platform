import { useState, useCallback, useRef } from 'react';

/**
 * Valid Interview Turn States (Day 19 Part 5 State Machine)
 */
export const TURN_STATES = {
  INITIALIZING: 'INITIALIZING',
  AI_SPEAKING: 'AI_SPEAKING',
  READY_FOR_ANSWER: 'READY_FOR_ANSWER',
  RECORDING: 'RECORDING',
  TRANSCRIBING: 'TRANSCRIBING',
  ANALYZING: 'ANALYZING',
  FOLLOW_UP_READY: 'FOLLOW_UP_READY',
  COMPLETING: 'COMPLETING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR'
};

const VALID_TRANSITIONS = {
  [TURN_STATES.INITIALIZING]: [TURN_STATES.AI_SPEAKING, TURN_STATES.READY_FOR_ANSWER, TURN_STATES.ERROR],
  [TURN_STATES.AI_SPEAKING]: [TURN_STATES.READY_FOR_ANSWER, TURN_STATES.RECORDING, TURN_STATES.ERROR],
  [TURN_STATES.READY_FOR_ANSWER]: [TURN_STATES.RECORDING, TURN_STATES.AI_SPEAKING, TURN_STATES.TRANSCRIBING, TURN_STATES.ERROR],
  [TURN_STATES.RECORDING]: [TURN_STATES.TRANSCRIBING, TURN_STATES.READY_FOR_ANSWER, TURN_STATES.ERROR],
  [TURN_STATES.TRANSCRIBING]: [TURN_STATES.ANALYZING, TURN_STATES.READY_FOR_ANSWER, TURN_STATES.ERROR],
  [TURN_STATES.ANALYZING]: [TURN_STATES.FOLLOW_UP_READY, TURN_STATES.READY_FOR_ANSWER, TURN_STATES.COMPLETING, TURN_STATES.ERROR],
  [TURN_STATES.FOLLOW_UP_READY]: [TURN_STATES.AI_SPEAKING, TURN_STATES.RECORDING, TURN_STATES.READY_FOR_ANSWER, TURN_STATES.ERROR],
  [TURN_STATES.COMPLETING]: [TURN_STATES.COMPLETED, TURN_STATES.ERROR],
  [TURN_STATES.COMPLETED]: [TURN_STATES.INITIALIZING],
  [TURN_STATES.ERROR]: [TURN_STATES.INITIALIZING, TURN_STATES.READY_FOR_ANSWER, TURN_STATES.AI_SPEAKING]
};

/**
 * Custom Hook: useInterviewTurn
 * Centralized State Machine for Interview Turn Lifecycle & Stale Async Guarding.
 */
export function useInterviewTurn() {
  const [turnState, setTurnState] = useState(TURN_STATES.INITIALIZING);
  const [errorText, setErrorText] = useState(null);
  
  // Guard against stale async resolution across turn/question navigation
  const activeTurnIdRef = useRef('');

  /**
   * Generates a new turn ID checkpoint and resets state machine for target turn.
   */
  const startNewTurn = useCallback((questionIdx, questionType = 'main') => {
    const newTurnId = `${questionIdx}:${questionType}:${Date.now()}`;
    activeTurnIdRef.current = newTurnId;
    setTurnState(TURN_STATES.INITIALIZING);
    setErrorText(null);
    return newTurnId;
  }, []);

  /**
   * Checks if an async callback's turn ID is still current.
   */
  const isTurnCurrent = useCallback((turnId) => {
    return activeTurnIdRef.current === turnId;
  }, []);

  /**
   * Enforces valid state machine transitions.
   */
  const transitionTo = useCallback((nextState, errorMsg = null) => {
    setTurnState((prevState) => {
      const allowed = VALID_TRANSITIONS[prevState];
      if (allowed && allowed.includes(nextState)) {
        if (errorMsg) setErrorText(errorMsg);
        return nextState;
      }
      console.warn(`⚠️ Invalid state transition attempt: ${prevState} -> ${nextState}. Maintaining ${prevState}.`);
      return prevState;
    });
  }, []);

  const getActiveTurnId = useCallback(() => activeTurnIdRef.current, []);

  return {
    turnState,
    errorText,
    getActiveTurnId,
    startNewTurn,
    isTurnCurrent,
    transitionTo,
    // Convenience boolean derivations
    isInitializing: turnState === TURN_STATES.INITIALIZING,
    isAiSpeaking: turnState === TURN_STATES.AI_SPEAKING,
    isReadyForAnswer: turnState === TURN_STATES.READY_FOR_ANSWER,
    isRecording: turnState === TURN_STATES.RECORDING,
    isTranscribing: turnState === TURN_STATES.TRANSCRIBING,
    isAnalyzing: turnState === TURN_STATES.ANALYZING,
    isFollowUpReady: turnState === TURN_STATES.FOLLOW_UP_READY,
    isCompleting: turnState === TURN_STATES.COMPLETING,
    isCompleted: turnState === TURN_STATES.COMPLETED,
    isError: turnState === TURN_STATES.ERROR
  };
}

export default useInterviewTurn;
