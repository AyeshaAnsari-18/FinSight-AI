import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, FileText, Loader2, ArrowLeft } from "lucide-react";
import { narrativesApi } from "../../../Manager/services/narratives.api";

const InvoiceViewerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let tempUrl: string | null = null;

    const loadInvoice = async () => {
      if (!id) {
        setError("Missing report id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const blob = await narrativesApi.getInvoiceBlob(id);
        tempUrl = URL.createObjectURL(blob);
        if (active) {
          setBlobUrl(tempUrl);
        } else {
          URL.revokeObjectURL(tempUrl);
        }
      } catch (fetchError) {
        console.error("Failed to load invoice", fetchError);
        if (active) {
          setError("Invoice preview could not be loaded.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInvoice();

    return () => {
      active = false;
      if (tempUrl) {
        URL.revokeObjectURL(tempUrl);
      }
    };
  }, [id]);

  const downloadHref = useMemo(() => blobUrl ?? undefined, [blobUrl]);

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Invoice Viewer</p>
            <h1 className="truncate text-2xl font-semibold text-slate-900">
              {id ? `Report ${id}` : "Invoice"}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={15} />
              Back
            </button>
            {downloadHref ? (
              <a
                href={downloadHref}
                download={`${id ?? "invoice"}.pdf`}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1e40af]"
              >
                <Download size={15} />
                Download
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[70vh] items-center justify-center text-slate-500">
            <Loader2 className="animate-spin text-[#1D4ED8]" />
          </div>
        ) : error ? (
          <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 p-8 text-center text-slate-600">
            <FileText className="text-slate-400" size={32} />
            <p className="font-medium">{error}</p>
            {downloadHref ? (
              <a
                href={downloadHref}
                download={`${id ?? "invoice"}.pdf`}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1e40af]"
              >
                <Download size={15} />
                Download invoice
              </a>
            ) : null}
          </div>
        ) : blobUrl ? (
          <iframe
            title="Invoice preview"
            src={blobUrl}
            className="h-[80vh] w-full border-0 bg-white"
          />
        ) : null}
      </div>
    </div>
  );
};

export default InvoiceViewerPage;
