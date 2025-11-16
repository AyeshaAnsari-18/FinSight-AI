const UploadPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upload Documents</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <input
          type="file"
          multiple
          className="w-full border p-3 rounded-lg"
        />

        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Upload
        </button>
      </div>
    </div>
  );
};

export default UploadPage;
