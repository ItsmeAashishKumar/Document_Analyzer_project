
"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      if (
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".json") ||
        fileName.endsWith(".csv") // Fixed .cv to .csv
      ) {
        setFile(selectedFile);
        setError("");
      } else {
        setError("Please upload a PDF, JSON, or CSV file.");
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError("");
    setResponse("");
  };

  const handleSubmit = async () => {
    if (!file || !query.trim()) {
      setError("Please upload a file and enter a query.");
      return;
    }
    setLoading(true);
    setError("");
    setResponse("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("query", query.trim());

    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        const detail = errorData.detail || "Unknown error";
        if (res.status === 404) {
          setError("Backend server is not running or endpoint not found. Please check http://localhost:8000.");
        } else if (res.status === 400) {
          if (detail.includes("sensitive information")) {
            setError("Your query requests sensitive information (e.g., phone numbers, SSNs). Please rephrase.");
          } else if (detail.includes("No text could be extracted")) {
            setError("Unable to extract text from the uploaded file. Please check the file format.");
          } else if (detail.includes("Response contains sensitive content")) {
            setError("The response contains sensitive content and cannot be displayed.");
          } else {
            setError(detail);
          }
        } else if (res.status === 500) {
          setError("Server error occurred while processing your request. Please try again later.");
        } else {
          setError(`Unexpected error: ${detail}`);
        }
        return;
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      setError("Failed to connect to the backend. Please ensure the server is running at http://localhost:8000.");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const suggestedQueries = [
    "Summarize the main points of this document",
    "What are the key findings?",
    "Extract important dates and numbers",
    "What recommendations are made?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3 animate-pulse">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-700 text-lg">Processing your request...</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full transform transition-transform hover:scale-110">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 animate-fade-in">
            Document Analyzer
          </h1>
          <p className="text-gray-600 text-lg">
            Upload a PDF, JSON, or CSV and ask questions to get intelligent insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform transition-transform hover:scale-[1.02]">
            <h2 className="text-xl text-black font-semibold mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-blue-600" />
              Upload Document
            </h2>

            {!file ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop your file here, or{" "}
                  <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                    browse
                    <input
                      type="file"
                      accept=".pdf,.json,.csv" // Fixed .cv to .csv
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-500">PDF, JSON, or CSV up to 5MB</p>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-900">{file.name}</p>
                      <p className="text-sm text-green-700">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="p-1 hover:bg-green-200 rounded-full transition-colors"
                    aria-label="Clear file"
                  >
                    <X className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Query Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform transition-transform hover:scale-[1.02]">
            <h2 className="text-xl text-black font-semibold mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-600" />
              Ask a Question
            </h2>

            <div className="space-y-4">
              <div>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What would you like to know about this document?"
                  className="w-full text-black border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                  aria-label="Query input"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">
                  Suggested queries:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQueries.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(suggestion)}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !file || !query.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center transform hover:scale-[1.02]"
                aria-label="Analyze document"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyze Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in flex items-start relative">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-1" />
            <p className="text-red-800 flex-1">{error}</p>
            <button
              onClick={() => setError("")}
              className="p-1 hover:bg-red-200 rounded-full transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-100 animate-fade-in">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Analysis Result
              </h2>
              <div className="prose max-w-none">
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {response}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by AI • Secure document processing • No data stored</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
