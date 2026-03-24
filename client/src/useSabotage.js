// FILE: client/src/useSabotage.js
import { useCallback, useRef } from "react";

/**
 * useSabotage — Monaco Editor sabotage hook for the Impostor role.
 *
 * All three attacks operate ONLY on Monaco's view/rendering layer.
 * They never touch the Yjs Y.Text document, so all damage is:
 *   - Local to each Crewmate's client
 *   - Temporary (self-reverting via setTimeout)
 *   - Visually disruptive without corrupting shared code
 *
 * @param {React.MutableRefObject} editorRef  - ref to the Monaco editor instance
 * @param {React.MutableRefObject} monacoRef  - ref to the Monaco API object
 */
const useSabotage = (editorRef, monacoRef) => {

  // Stored ref to the drift listener disposable so the setTimeout cleanup
  // can call .dispose() without closure staleness issues.
  const driftListenerRef = useRef(null);

  // ---------------------------------------------------------------------------
  // SABOTAGE 1: THE LINTER LIE
  // Injects a fake critical error marker near the user's current cursor line
  // using Math.max(1, lineNumber - 2) per spec.
  // Uses monaco.editor.setModelMarkers — identical to real VS Code diagnostics.
  // Self-clears after 10 seconds.
  // ---------------------------------------------------------------------------
  const triggerLinterLie = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    // Place the marker near the user's current cursor position (spec: lineNumber - 2).
    const position = editor.getPosition();
    const lineNumber = position ? Math.max(1, position.lineNumber - 2) : 1;
    const lineLength = model.getLineMaxColumn(lineNumber);

    const markers = [
      {
        severity: monaco.MarkerSeverity.Error,
        message: "CRITICAL: Memory leak detected — runtime heap corruption imminent",
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: lineLength,
        source: "ImpostorLint",
      },
    ];

    // "ImpostorLint" owner key scopes our markers so they don't collide with
    // or wipe any real language server diagnostics Monaco has set.
    monaco.editor.setModelMarkers(model, "ImpostorLint", markers);

    setTimeout(() => {
      if (model && !model.isDisposed()) {
        monaco.editor.setModelMarkers(model, "ImpostorLint", []);
      }
    }, 10_000);
  }, [editorRef, monacoRef]);


  // ---------------------------------------------------------------------------
  // SABOTAGE 2: KEYBOARD DRIFT
  // Attaches a content-change listener that fires on every keystroke.
  // 30% chance per keystroke of forcing the cursor forward by +1 or +2 columns.
  // Listener stored in driftListenerRef (useRef) for clean disposal.
  // Self-disposes after 10 seconds.
  // ---------------------------------------------------------------------------
  const triggerKeyboardDrift = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    // Dispose any pre-existing drift listener to prevent stacking.
    if (driftListenerRef.current) {
      driftListenerRef.current.dispose();
      driftListenerRef.current = null;
    }

    driftListenerRef.current = editor.onDidChangeModelContent(() => {
      // 30% probability of drifting on any given keystroke (spec).
      if (Math.random() >= 0.3) return;

      const currentPosition = editor.getPosition();
      if (!currentPosition) return;

      const model = editor.getModel();
      if (!model) return;

      // Drift forward only: +1 or +2 columns (spec — never backward).
      const driftAmount = Math.random() > 0.5 ? 1 : 2;
      const lineMaxColumn = model.getLineMaxColumn(currentPosition.lineNumber);

      // Clamp so we don't drift beyond end of line.
      const newColumn = Math.min(
        lineMaxColumn,
        currentPosition.column + driftAmount
      );

      editor.setPosition({
        lineNumber: currentPosition.lineNumber,
        column: newColumn,
      });
    });

    // Dispose via ref after 10 seconds — avoids closure staleness.
    setTimeout(() => {
      if (driftListenerRef.current) {
        driftListenerRef.current.dispose();
        driftListenerRef.current = null;
      }
    }, 10_000);
  }, [editorRef, monacoRef]);


  // ---------------------------------------------------------------------------
  // SABOTAGE 3: THEME BLACKOUT
  // All text tokens → #000000 (invisible). Cursor → #ff0000 (red).
  // The user can feel themselves typing but cannot read anything.
  // Reverts to vs-dark after 5 seconds (shorter: maximally disruptive).
  // ---------------------------------------------------------------------------
  const triggerThemeBlackout = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    // Theme name matches spec: "blackout"
    monaco.editor.defineTheme("blackout", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "",           foreground: "000000" }, // Default/fallback text
        { token: "keyword",    foreground: "000000" },
        { token: "string",     foreground: "000000" },
        { token: "identifier", foreground: "000000" },
        { token: "comment",    foreground: "000000" },
        { token: "number",     foreground: "000000" },
        { token: "operator",   foreground: "000000" },
        { token: "type",       foreground: "000000" },
        { token: "function",   foreground: "000000" },
        { token: "variable",   foreground: "000000" },
        { token: "delimiter",  foreground: "000000" },
      ],
      colors: {
        "editor.background":              "#000000",
        "editor.foreground":              "#000000",
        // Red cursor per spec — only visible element during blackout.
        "editorCursor.foreground":        "#ff0000",
        "editor.selectionBackground":     "#000000",
        "editor.lineHighlightBackground": "#000000",
        "editorLineNumber.foreground":    "#000000",
        "editorGutter.background":        "#000000",
      },
    });

    monaco.editor.setTheme("blackout");

    // 5 second revert per spec.
    setTimeout(() => {
      monaco.editor.setTheme("vs-dark");
    }, 5_000);
  }, [editorRef, monacoRef]);


  return { triggerLinterLie, triggerKeyboardDrift, triggerThemeBlackout };
};

export default useSabotage;