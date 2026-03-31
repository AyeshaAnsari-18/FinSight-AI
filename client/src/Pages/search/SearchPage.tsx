import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import api from "../../lib/api";
import { Search as SearchIcon, FileText, CheckSquare, Shield, BookOpen, Loader2 } from "lucide-react";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    journals: any[];
    tasks: any[];
    policies: any[];
    documents: any[];
  } | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!query) return;

    const fetchSearch = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearch();
  }, [query]);

  const totalResults = results 
    ? results.journals.length + results.tasks.length + results.policies.length + results.documents.length
    : 0;

  const handleRedirect = (type: 'journal' | 'task' | 'policy' | 'document') => {
    if (!user) return;
    const role = user.role.toUpperCase();
    
    switch (type) {
      case 'journal':
        if (role === 'ACCOUNTANT') navigate('/accountant/journals');
        else if (role === 'AUDITOR') navigate('/auditor/journals/details');
        else if (role === 'MANAGER') navigate('/manager/fiscalCloseMain');
        else navigate('/compliance/control-evidence');
        break;
      case 'task':
        if (role === 'ACCOUNTANT') navigate('/accountant/tasks/accruals');
        else if (role === 'AUDITOR') navigate('/auditor/tasks/view');
        else if (role === 'MANAGER') navigate('/manager/managerTasks');
        else navigate('/compliance/dept-clearance');
        break;
      case 'policy':
        if (role === 'COMPLIANCE') navigate('/compliance/policies');
        else if (role === 'MANAGER') navigate('/manager/complianceOverview');
        else if (role === 'AUDITOR') navigate('/auditor/compliance');
        else navigate('/accountant');
        break;
      case 'document':
        if (role === 'ACCOUNTANT') navigate('/accountant/upload');
        else if (role === 'AUDITOR') navigate('/auditor/auditTrail');
        else if (role === 'MANAGER') navigate('/manager/auditTrail');
        else navigate('/compliance/reports');
        break;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 mt-4">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-[#0A2342] flex items-center gap-3">
          <SearchIcon className="w-8 h-8 text-blue-600" />
          Global Search Results
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Searching for keyword: <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">"{query}"</span>
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <p className="font-medium text-lg">Scanning entire database...</p>
        </div>
      ) : results ? (
        totalResults === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <SearchIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">No Matches Found</h3>
            <p className="text-gray-500 max-w-md mt-2">
              Our system scanned journals, tasks, policies, and documents for "{query}" but found no direct records.
            </p>
            <button onClick={() => navigate(-1)} className="mt-8 px-6 py-2 border rounded-md hover:bg-gray-50 transition text-gray-600 bg-white font-medium">
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Journals */}
            {results.journals.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50/50 p-4 border-b flex items-center gap-2">
                  <BookOpen className="text-blue-600 w-5 h-5" />
                  <h3 className="font-bold text-[#0A2342] text-lg">Journal Entries ({results.journals.length})</h3>
                </div>
                <div className="divide-y">
                  {results.journals.map((j) => (
                    <div key={j.id} onClick={() => handleRedirect('journal')} className="p-4 hover:bg-gray-50 transition cursor-pointer">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm text-gray-800 break-words line-clamp-2">{j.description}</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 font-medium text-gray-600">{j.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Ref: {j.reference} • ${j.debit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {results.tasks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-green-50/50 p-4 border-b flex items-center gap-2">
                  <CheckSquare className="text-green-600 w-5 h-5" />
                  <h3 className="font-bold text-[#0A2342] text-lg">Tasks ({results.tasks.length})</h3>
                </div>
                <div className="divide-y">
                  {results.tasks.map((t) => (
                    <div key={t.id} onClick={() => handleRedirect('task')} className="p-4 hover:bg-gray-50 transition cursor-pointer">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm text-gray-800 break-words">{t.title}</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">{t.status}</span>
                      </div>
                      {t.description && <p className="text-xs text-gray-500 mt-2 line-clamp-1">{t.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policies */}
            {results.policies.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-purple-50/50 p-4 border-b flex items-center gap-2">
                  <Shield className="text-purple-600 w-5 h-5" />
                  <h3 className="font-bold text-[#0A2342] text-lg">Policies ({results.policies.length})</h3>
                </div>
                <div className="divide-y">
                  {results.policies.map((p) => (
                    <div key={p.id} onClick={() => handleRedirect('policy')} className="p-4 hover:bg-gray-50 transition cursor-pointer">
                      <span className="font-semibold text-sm text-gray-800 break-words">{p.title}</span>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{p.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {results.documents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-orange-50/50 p-4 border-b flex items-center gap-2">
                  <FileText className="text-orange-600 w-5 h-5" />
                  <h3 className="font-bold text-[#0A2342] text-lg">Documents ({results.documents.length})</h3>
                </div>
                <div className="divide-y">
                  {results.documents.map((d) => (
                    <div key={d.id} onClick={() => handleRedirect('document')} className="p-4 hover:bg-gray-50 transition cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-gray-800 break-words">{d.fileName}</span>
                        <span className="text-xs text-gray-400">{d.fileType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )
      ) : null}
    </div>
  );
};

export default SearchPage;
