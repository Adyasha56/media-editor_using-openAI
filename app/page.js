'use client';

import React, { useState, useRef } from 'react';
import { Upload, Wand2, Download, Loader2, ImageIcon, Trash2, History } from 'lucide-react';

export default function SnapEditAI() {
  const [image, setImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Simulated AI processing (in real app, this calls your backend API)
  const processImageEdit = async (imageData, editCommand) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In production, this would call:
    // const response = await fetch('/api/edit-image', {
    //   method: 'POST',
    //   body: JSON.stringify({ image: imageData, command: editCommand })
    // });
    
    // For demo: Apply simple filter based on command
    return applyDemoEffect(imageData, editCommand);
  };

  const applyDemoEffect = (imageData, cmd) => {
    // Create canvas to apply demo effects
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        // Demo effects based on command keywords
        if (cmd.toLowerCase().includes('blur')) {
          ctx.filter = 'blur(5px)';
          ctx.drawImage(img, 0, 0);
        } else if (cmd.toLowerCase().includes('bright')) {
          ctx.filter = 'brightness(1.5)';
          ctx.drawImage(img, 0, 0);
        } else if (cmd.toLowerCase().includes('dark')) {
          ctx.filter = 'brightness(0.6)';
          ctx.drawImage(img, 0, 0);
        } else if (cmd.toLowerCase().includes('contrast')) {
          ctx.filter = 'contrast(1.5)';
          ctx.drawImage(img, 0, 0);
        } else if (cmd.toLowerCase().includes('grayscale') || cmd.toLowerCase().includes('black and white')) {
          ctx.filter = 'grayscale(100%)';
          ctx.drawImage(img, 0, 0);
        } else if (cmd.toLowerCase().includes('sepia')) {
          ctx.filter = 'sepia(100%)';
          ctx.drawImage(img, 0, 0);
        } else if (cmd.toLowerCase().includes('saturate')) {
          ctx.filter = 'saturate(2)';
          ctx.drawImage(img, 0, 0);
        }
        
        resolve(canvas.toDataURL());
      };
      img.src = imageData;
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setEditedImage(null);
        setHistory([]);
        setError('');
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid image file');
    }
  };

  const handleEdit = async () => {
    if (!image || !command.trim()) {
      setError('Please upload an image and enter a command');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const result = await processImageEdit(editedImage || image, command);
      setEditedImage(result);
      setHistory([...history, { command, timestamp: new Date() }]);
      setCommand('');
    } catch (err) {
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'snapedit-result.png';
    link.href = editedImage || image;
    link.click();
  };

  const handleReset = () => {
    setImage(null);
    setEditedImage(null);
    setCommand('');
    setHistory([]);
    setError('');
  };

  const quickCommands = [
    'Make it brighter',
    'Convert to black and white',
    'Apply blur effect',
    'Increase contrast',
    'Make it darker',
    'Add sepia tone'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  SnapEdit AI
                </h1>
                <p className="text-sm text-gray-600">Natural Language Image Editor</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Demo Mode
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-500" />
                Upload Image
              </h2>
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
              >
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Click to upload</p>
                <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Command Input */}
            {image && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-blue-500" />
                  Edit Command
                </h2>
                
                <textarea
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Describe what you want to do...&#10;e.g., 'Make it brighter' or 'Convert to black and white'"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows="3"
                />

                <button
                  onClick={handleEdit}
                  disabled={isProcessing || !command.trim()}
                  className="w-full mt-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Apply Edit
                    </>
                  )}
                </button>

                {/* Quick Commands */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Quick commands:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickCommands.map((cmd, i) => (
                      <button
                        key={i}
                        onClick={() => setCommand(cmd)}
                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-purple-100 text-gray-700 rounded-full transition-colors"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-green-500" />
                  Edit History
                </h2>
                <div className="space-y-2">
                  {history.slice(-3).reverse().map((item, i) => (
                    <div key={i} className="text-sm p-2 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{item.command}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Image Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {!image ? (
                <div className="aspect-video bg-gray-50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Upload an image to get started</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      {editedImage ? 'Edited Result' : 'Original Image'}
                    </h2>
                    <div className="flex gap-2">
                      {(image || editedImage) && (
                        <button
                          onClick={handleDownload}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      )}
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <img
                      src={editedImage || image}
                      alt="Edited"
                      className="w-full rounded-xl shadow-md"
                    />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                        <div className="bg-white rounded-xl p-6 text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-3" />
                          <p className="text-gray-700 font-medium">Processing your edit...</p>
                          <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {editedImage && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        ✨ Edit applied successfully! You can apply another edit or download the result.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
              <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Upload any image (PNG, JPG)</li>
                <li>2. Describe your edit in natural language</li>
                <li>3. AI processes and applies your edit</li>
                <li>4. Download or continue editing</li>
              </ol>
              <p className="text-xs text-gray-500 mt-4 italic">
                Note: This is a demo version with simulated effects. Production version integrates OpenAI GPT-4 Vision + Stability AI for advanced edits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}