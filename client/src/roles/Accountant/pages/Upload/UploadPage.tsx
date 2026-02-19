import { useState } from "react";
import api from "../../../../lib/api";
import { Upload, Loader2, CheckCircle, Save, FileText, ArrowRightLeft } from "lucide-react";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ExtractedData {
  vendor_name: string;
  invoice_number: string;
  date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  line_items: LineItem[];
  error?: string;
}

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [entryType, setEntryType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setExtractedData(null);
    setEntryType('DEBIT');
    
    const formData = new FormData();
    formData.append("document", file); 

    try {
      const response = await api.post('/engine/upload-ocr', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (response.data.error) {
        alert(`AI Parsing Error: ${response.data.error}`);
      } else {
        setExtractedData(response.data);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to connect to the server for extraction.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveToLedger = async () => {
    if (!extractedData) return;
    setSaving(true);
    
    try {
      const debitAmount = entryType === 'DEBIT' ? extractedData.total_amount : 0;
      const creditAmount = entryType === 'CREDIT' ? extractedData.total_amount : 0;

      await api.post('/journals', {
        description: `Invoice from ${extractedData.vendor_name}`,
        date: extractedData.date !== "UNKNOWN" ? new Date(extractedData.date).toISOString() : new Date().toISOString(),
        debit: debitAmount, 
        credit: creditAmount, 
        reference: extractedData.invoice_number !== "UNKNOWN" ? extractedData.invoice_number : `INV-${Date.now()}`,
        status: 'DRAFT',
      });
      
      alert("Successfully saved to Ledger as DRAFT!");
      setExtractedData(null);
      setFile(null);
    } catch (error) {
      console.error("Failed to save", error);
      alert("Failed to save journal entry. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const updateFinancials = (field: 'subtotal' | 'tax' | 'total', value: string) => {
    if (!extractedData) return;

    const numValue = value === "" ? 0 : parseFloat(value);

    if (field === 'subtotal') {
      setExtractedData({
        ...extractedData,
        subtotal: numValue,
        total_amount: numValue + extractedData.tax_amount
      });
    } else if (field === 'tax') {
      setExtractedData({
        ...extractedData,
        tax_amount: numValue,
        total_amount: extractedData.subtotal + numValue
      });
    } else {
      setExtractedData({
        ...extractedData,
        total_amount: numValue
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0A2342]">Document Processing (OCR)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Upload */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4 h-fit border border-[#1D4ED8]/20">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-[#0A2342]">
            <Upload size={20}/> Upload Invoice PDF
          </h2>
          <input
            type="file"
            accept=".pdf" 
            className="w-full border p-3 rounded-lg cursor-pointer bg-gray-50"
            onChange={(e) => {
              if (e.target.files) setFile(e.target.files[0]);
              setExtractedData(null);
            }}
          />

          <button 
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-3 bg-[#F5C542] text-[#0A2342] font-semibold rounded hover:bg-[#e4b134] transition disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
            {uploading ? "Extracting via AI Engine..." : "Process Document"}
          </button>
        </div>

        {extractedData && (
          <div className="bg-white shadow rounded-lg p-6 space-y-4 border-t-4 border-t-green-500 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-green-700">
              <CheckCircle size={20}/> Verify Extracted Data
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase">Vendor</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-[#1D4ED8] outline-none" 
                  value={extractedData.vendor_name}
                  onChange={e => setExtractedData({...extractedData, vendor_name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase">Invoice #</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#1D4ED8] outline-none" 
                    value={extractedData.invoice_number}
                    onChange={e => setExtractedData({...extractedData, invoice_number: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase">Date</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#1D4ED8] outline-none" 
                    value={extractedData.date}
                    onChange={e => setExtractedData({...extractedData, date: e.target.value})}
                  />
                </div>
              </div>

              {/* Debit / Credit Toggle */}
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Entry Type</label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setEntryType('DEBIT')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      entryType === 'DEBIT' 
                        ? "bg-white text-[#1D4ED8] shadow-sm border border-gray-200" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <ArrowRightLeft size={14} /> Debit (Expense)
                  </button>
                  <button
                    onClick={() => setEntryType('CREDIT')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      entryType === 'CREDIT' 
                        ? "bg-white text-green-600 shadow-sm border border-gray-200" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <ArrowRightLeft size={14} /> Credit (Refund/Income)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase">Subtotal</label>
                  <input 
                    type="number" 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#1D4ED8] outline-none" 
                    // Use || '' to prevent NaN warning if value is 0 or empty
                    value={extractedData.subtotal}
                    onChange={e => updateFinancials('subtotal', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase">Tax Amount</label>
                  <input 
                    type="number" 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#1D4ED8] outline-none" 
                    value={extractedData.tax_amount}
                    onChange={e => updateFinancials('tax', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase text-[#1D4ED8]">
                    Total ({entryType})
                  </label>
                  <input 
                    type="number" 
                    className={`w-full border-2 p-2 rounded font-bold text-lg outline-none ${
                        entryType === 'DEBIT' ? "border-[#1D4ED8]/50 text-[#1D4ED8]" : "border-green-500/50 text-green-700"
                    }`}
                    value={extractedData.total_amount}
                    onChange={e => updateFinancials('total', e.target.value)}
                  />
                </div>
              </div>

              {extractedData.line_items.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs text-gray-500 font-bold uppercase">Line Items Detected</label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50 text-sm">
                    {extractedData.line_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b last:border-0 py-1">
                        <span className="truncate w-1/2">{item.description}</span>
                        <span className="text-gray-500">x{item.quantity}</span>
                        <span className="font-medium">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleSaveToLedger}
              disabled={saving}
              className="w-full mt-4 py-3 bg-[#1D4ED8] text-white font-semibold rounded hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "Saving to Prisma..." : "Approve & Save to Ledger"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;