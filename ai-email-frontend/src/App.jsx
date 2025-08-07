import { useState } from "react";
import axios from "axios";
import { Mail, Loader2, Send } from "lucide-react"; // ✅ Fixed icon

function App() {
  const [prompt, setPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  const handleGenerate = async () => {
    setStatus("");
    try {
      const res = await axios.post(`${baseURL}/api/generate`, { prompt });
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
      await axios.post(`${baseURL}/api/send`, {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-10 space-y-8 border border-gray-200">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-800 flex items-center justify-center gap-2">
            <Mail className="w-8 h-8" /> AI Email Generator
          </h1>
          <p className="mt-2 text-gray-500 text-lg">
            Generate & send professional emails in seconds
          </p>
        </div>

        {/* PROMPT INPUT */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            🧠 Your Request
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            placeholder="e.g. Write a follow-up email after interview..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            className="mt-3 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow-sm transition"
          >
            <Mail size={18} /> Generate Email
          </button>
        </div>

        {/* GENERATED EMAIL */}
        {generatedEmail && (
          <>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                📄 Generated Email
              </label>
              <textarea
                className="w-full border border-green-300 bg-green-50 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={8}
                value={generatedEmail}
                onChange={(e) => setGeneratedEmail(e.target.value)}
              />
            </div>

            {/* RECIPIENT DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Recipient's Email"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Subject (optional)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-lg flex justify-center items-center gap-2 transition"
            >
              {sending ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" /> Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" /> Send Email
                </>
              )}
            </button>
          </>
        )}

        {/* STATUS */}
        {status && (
          <div className="text-center font-semibold text-lg mt-4">
            <p className={status.startsWith("✅") ? "text-green-600" : "text-red-600"}>
              {status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
