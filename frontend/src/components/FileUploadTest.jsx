import React, { useState } from 'react';
import { toast } from 'react-toastify';

const FileUploadTest = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('File selected:', file.name, file.size, file.type);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('chatId', 'test-chat-id');

    try {
      console.log('Starting upload...');
      
      const response = await fetch('http://localhost:9000/api/chat/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok) {
        setUploadResult(`Success: ${result.file.originalName}`);
        toast.success('File uploaded successfully!');
      } else {
        setUploadResult(`Error: ${response.status} - ${result.message || 'Unknown error'}`);
        toast.error(`Upload failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult(`Error: ${error.message}`);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">File Upload Test</h2>
      
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileSelect}
          className="block w-full p-2 border rounded"
        />
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-400"
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {uploadResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Upload Result:</h3>
          <p className="text-sm">{uploadResult}</p>
        </div>
      )}

      {selectedFile && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Selected File:</h3>
          <p className="text-sm">Name: {selectedFile.name}</p>
          <p className="text-sm">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          <p className="text-sm">Type: {selectedFile.type}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadTest;
