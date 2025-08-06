import { useState } from "react";
import axios from "axios";

function App() {
  const [prompt, setPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const handleGenerate = async () => {
    setStatus("");
    try {
      const res = await axios.post("http://localhost:5001/api/generate", { prompt });
      setGeneratedEmail(res.data.email);
    } catch (error) {
      console.error("Error generating email", error);
      setStatus("❌ Failed to generate email");
    }
  };

  const handleSend = async () => {
    setSending(true);
    setStatus("");
    try {
      await axios.post("http://localhost:5001/api/send", {
        recipients,
        subject,
        content: generatedEmail,
      });
      setStatus("✅ Email sent successfully!");
    } catch (error) {
      console.error("Error sending email", error);
      setStatus("❌ Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          ✉️ AI Email Generator
        </h1>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            🧠 Prompt
          </label>
          <textarea
            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Type your request like: Write a formal leave application..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            onClick={handleGenerate}
          >
            Generate Email
          </button>
        </div>

        {generatedEmail && (
          <>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                📝 Generated Email
              </label>
              <textarea
                className="w-full border border-gray-300 rounded p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={8}
                value={generatedEmail}
                onChange={(e) => setGeneratedEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="email"
                className="border border-gray-300 rounded p-3"
                placeholder="Recipient email"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
              <input
                type="text"
                className="border border-gray-300 rounded p-3"
                placeholder="Subject (optional)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-medium transition"
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? "Sending..." : "📤 Send Email"}
            </button>
          </>
        )}

        {status && (
          <p
            className={`text-center font-semibold ${
              status.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
