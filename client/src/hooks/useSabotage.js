// FILE: client/src/hooks/useSabotage.js
import { useRef, useCallback } from 'react';

export const useSabotage = (editorRef, monacoRef) => {
  const activeSabotages = useRef({
    drift: null,
    theme: null,
    linter: null
  });

  // --- SABOTAGE 1: THE LINTER LIE ---
  // Injects fake error red squigglies everywhere
  const triggerLinterLie = useCallback(() => {
    if (!editorRef.current || !monacoRef.current) return;
    
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor.getModel();
    
    if (!model) return;

    const lineCount = model.getLineCount();
    const markers = [];

    // Generate 10 fake errors on random lines
    for (let i = 0; i < 10; i++) {
      const randomLine = Math.floor(Math.random() * lineCount) + 1;
      markers.push({
        startLineNumber: randomLine,
        startColumn: 1,
        endLineNumber: randomLine,
        endColumn: 10,
        message: "CRITICAL: Memory Leak Detected in Syntax Tree", 
        severity: monaco.MarkerSeverity.Error,
      });
    }

    // Apply the fake errors
    monaco.editor.setModelMarkers(model, "sabotage", markers);

    // Clear after 10 seconds
    if (activeSabotages.current.linter) clearTimeout(activeSabotages.current.linter);
    activeSabotages.current.linter = setTimeout(() => {
      monaco.editor.setModelMarkers(model, "sabotage", []);
    }, 10000);

  }, [editorRef, monacoRef]);


  // --- SABOTAGE 2: KEYBOARD DRIFT ---
  // Randomly moves the cursor while typing
  const triggerKeyboardDrift = useCallback(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;

    // Dispose previous listener if exists
    if (activeSabotages.current.drift) activeSabotages.current.drift.dispose();

    // Listen for typing
    const disposable = editor.onDidChangeModelContent(() => {
      // 40% chance to trigger drift on every keystroke
      if (Math.random() > 0.6) {
        const position = editor.getPosition();
        if (!position) return;

        const drift = Math.random() > 0.5 ? 1 : -1;
        
        editor.setPosition({
          lineNumber: position.lineNumber,
          column: position.column + drift
        });
      }
    });

    activeSabotages.current.drift = disposable;

    // Stop drifting after 10 seconds
    setTimeout(() => {
      disposable.dispose();
    }, 10000);

  }, [editorRef]);


  // --- SABOTAGE 3: THEME BLACKOUT ---
  // Turns the editor completely black
  const triggerThemeBlackout = useCallback(() => {
    if (!monacoRef.current) return;
    const monaco = monacoRef.current;

    // Define the "Nightmare" theme
    monaco.editor.defineTheme('nightmare', {
      base: 'vs-dark', 
      inherit: true,
      rules: [
        { token: '', foreground: '000000', background: '000000' }, 
        { token: 'keyword', foreground: '000000' },
        { token: 'string', foreground: '000000' },
        { token: 'comment', foreground: '000000' },
      ],
      colors: {
        'editor.background': '#000000', 
        'editor.foreground': '#000000',
        'editorCursor.foreground': '#FF0000', 
        'editor.lineHighlightBackground': '#000000',
        'editorGutter.background': '#000000',
      }
    });

    monaco.editor.setTheme('nightmare');

    // Revert after 5 seconds
    if (activeSabotages.current.theme) clearTimeout(activeSabotages.current.theme);
    activeSabotages.current.theme = setTimeout(() => {
      monaco.editor.setTheme('vs-dark'); 
    }, 5000);

  }, [monacoRef]);

  return {
    triggerLinterLie,
    triggerKeyboardDrift,
    triggerThemeBlackout
  };
};