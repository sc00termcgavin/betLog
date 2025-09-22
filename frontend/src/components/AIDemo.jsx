import { useState } from "react";
import { askAI } from "../api";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function AIDemo() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");

  async function handleAsk() {
    try {
      const res = await askAI(prompt);
      setReply(res.data.reply || res.data.error);
    } catch (err) {
      setReply("❌ Error: " + err.message);
    }
  }

  // Helper: parse reply for code blocks
  function renderReply(text) {
    if (!text) return null;

    const codeBlockMatch = text.match(/```(\w+)?\n([\s\S]*?)```/);

    if (codeBlockMatch) {
      const lang = codeBlockMatch[1] || "text";
      const code = codeBlockMatch[2];

      return (
        <div>
          <p>{text.split("```")[0]}</p>
          <SyntaxHighlighter language={lang} style={oneDark}>
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }

    return <p>{text}</p>;
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>🤖 Ask BetLog AI</h2>
      <textarea
        rows="3"
        style={{ width: "100%", marginBottom: "0.5rem" }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <br />
      <button onClick={handleAsk}>Send</button>
      <div style={{ marginTop: "1rem" }}>{renderReply(reply)}</div>
    </div>
  );
}

export default AIDemo;