function Intro({ onProceed }) {
  return (
    <div className="intro-container">
      <img src="/logo.png" alt="Game Logo" className="intro-logo" />

      <h1 className="intro-title">IMPOSTER CODE</h1>

      <button
        className="intro-btn"
        onClick={() => {
          console.log("Proceed clicked"); // 🔍 debug
          onProceed(); // ✅ THIS IS CRITICAL
        }}
      >
        Tap to proceed
      </button>
    </div>
  );
}

export default Intro;
