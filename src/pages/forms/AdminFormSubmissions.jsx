import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getFormDefinitionService, getFormSubmissionsService } from "../../redux/apis/form";

const AnswersPreview = ({ answers, max = 2 }) => {
  const entries = Object.entries(answers || {});
  if (!entries.length) return <div className="text-gray-400">No answers</div>;
  const short = entries.slice(0, max);
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {short.map(([k, v]) => (
        <span key={k} className="px-2 py-1 rounded bg-gray-100 border text-gray-700">
          <span className="font-medium">{k}:</span> {Array.isArray(v) ? v.join(", ") : String(v)}
        </span>
      ))}
      {entries.length > max && (
        <span className="text-gray-500">+{entries.length - max} more</span>
      )}
    </div>
  );
};

const isImageName = (val) => {
  if (!val || typeof val !== 'string') return false;
  return /(\.png|\.jpe?g|\.gif|\.webp|\.bmp|\.svg)$/i.test(val) || /^https?:\/\//i.test(val);
};

const isFileLike = (val) => {
  if (!val || typeof val !== 'string') return false;
  return /^https?:\/\//i.test(val) || /(\.pdf|\.docx?|\.xlsx?|\.pptx?)$/i.test(val) || val.startsWith('/');
};

const backendBase = (import.meta.env?.VITE_BASE_URL || "").replace(/\/+$/,'');
const toFileUrl = (p) => {
  const s = String(p || "");
  if (/^https?:\/\//i.test(s)) return s;
  if (!backendBase) return s; // fallback to raw if base not set
  return `${backendBase}/${s.replace(/^\/+/, '')}`;
};

const renderImageThumb = (src) => (
  <a key={String(src)} href={toFileUrl(src)} target="_blank" rel="noreferrer">
    <img
      src={toFileUrl(src)}
      alt="uploaded"
      className="w-16 h-16 object-cover rounded border"
      onError={(e)=>{ e.currentTarget.style.display='none'; }}
    />
  </a>
);

const DetailModal = ({ open, onClose, record, fields }) => {
  if (!open || !record) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-[92vw] max-w-3xl rounded-xl shadow-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Submission details</div>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100">Close</button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-500">Submitted at</div>
            <div className="font-medium">{new Date(record.submittedAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-500">Email</div>
            <div className="font-medium">{record.submittedBy?.email || "-"}</div>
          </div>
          <div>
            <div className="text-gray-500">Name</div>
            <div className="font-medium">{record.submittedBy?.name || "-"}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-gray-700 font-semibold mb-2">Answers</div>
          <div className="grid grid-cols-1 gap-3">
            {(Array.isArray(fields) && fields.length ? fields : Object.keys(record.answers||{}).map((name)=>({fieldName:name, fieldLabel:name}))).map((f)=>{
              const v = record.answers?.[f.fieldName];
              const label = f.fieldLabel || f.fieldName;
              const list = Array.isArray(v) ? v : (v!==undefined && v!==null ? [v] : []);
              const imgs = list.filter((x)=> typeof x === 'string' && isImageName(x));
              const files = list.filter((x)=> typeof x === 'string' && !isImageName(x) && isFileLike(x));
              const others = list.filter((x)=> !(typeof x === 'string' && (isImageName(x) || isFileLike(x))));
              return (
                <div key={f.fieldName} className="text-sm">
                  <div className="text-gray-600 font-medium mb-1">{label}</div>
                  {list.length === 0 ? (
                    <div className="text-gray-400">-</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {imgs.map((x, i)=> renderImageThumb(String(x)))}
                      {files.map((x, i)=> (
                        <a key={`file-${i}`} href={toFileUrl(x)} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs border rounded bg-gray-50">{String(x).split('/').pop()}</a>
                      ))}
                      {others.length > 0 && (
                        <div className="text-gray-800 break-words">{others.join(', ')}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminFormSubmissions = () => {
  const { formId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // UI state
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("submittedAt");
  const [sortDir, setSortDir] = useState("desc");
  const [detail, setDetail] = useState(null);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const navigate = useNavigate();

  const load = async (p = page) => {
    setLoading(true);
    setError("");
    const [def, subs] = await Promise.all([
      getFormDefinitionService(formId),
      getFormSubmissionsService(formId, { page: p, limit }),
    ]);
    if (def?.form) setForm(def.form);
    if (Array.isArray(def?.fields)) setFields(def.fields);
    if (subs?.submissions) {
      setItems(subs.submissions);
      setTotal(subs.total || 0);
    } else {
      const raw = subs?.message || subs?.error || subs;
      const msg = typeof raw === "string"
        ? raw
        : (raw && typeof raw.message === "string")
          ? raw.message
          : (raw && typeof raw.error === "string")
            ? raw.error
            : "Failed to fetch submissions";
      setError(msg);
    }
    setLoading(false);
  };

  useEffect(() => { load(1); }, [formId]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Client-side filter + sort for current page
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = [...items];
    if (q) {
      arr = arr.filter((s) => {
        const email = s.submittedBy?.email || "";
        const name = s.submittedBy?.name || "";
        const ans = Object.entries(s.answers || {}).map(([k,v]) => `${k}:${Array.isArray(v)?v.join(', '):String(v)}`).join(" ");
        return (
          email.toLowerCase().includes(q) ||
          name.toLowerCase().includes(q) ||
          ans.toLowerCase().includes(q)
        );
      });
    }
    arr.sort((a,b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const getVal = (s) => {
        if (sortKey === 'submittedAt') return new Date(s.submittedAt).getTime();
        if (sortKey === 'email') return (s.submittedBy?.email || '').toLowerCase();
        if (sortKey === 'name') return (s.submittedBy?.name || '').toLowerCase();
        return 0;
      };
      const av = getVal(a);
      const bv = getVal(b);
      if (av < bv) return -1*dir;
      if (av > bv) return 1*dir;
      return 0;
    });
    return arr;
  }, [items, query, sortKey, sortDir]);

  const changeSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const exportCSV = () => {
    const headers = ["Submitted At","Email","Name","Answers"];
    const rows = shown.map((s) => [
      new Date(s.submittedAt).toISOString(),
      s.submittedBy?.email || "",
      s.submittedBy?.name || "",
      Object.entries(s.answers||{}).map(([k,v])=> `${k}: ${Array.isArray(v)?v.join(' / '):String(v)}`).join(" | ")
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${form?.title || 'submissions'}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="text-2xl font-extrabold tracking-tight">Submissions</div>
          <div className="text-gray-600">Form: <span className="font-medium">{form?.title}</span></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Export CSV</button>
          <Link className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200" to="/home/my-forms">Back to My Forms</Link>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            placeholder="Search by email, name or answer..."
            className="w-full sm:w-80 border rounded px-3 py-2"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort by</label>
            <select className="border rounded px-2 py-2" value={sortKey} onChange={(e)=>setSortKey(e.target.value)}>
              <option value="submittedAt">Submitted At</option>
              <option value="email">Email</option>
              <option value="name">Name</option>
              
            </select>
            <button className="px-2 py-2 border rounded" onClick={()=>setSortDir(d=> d==='asc'?'desc':'asc')}>
              {sortDir === 'asc' ? 'Asc' : 'Desc'}
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows</label>
            <select className="border rounded px-2 py-2" value={limit} onChange={(e)=>{ const l=Number(e.target.value)||10; setLimit(l); setPage(1); load(1); }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading && <div className="bg-white rounded-xl shadow p-6">Loading...</div>}
      {error && <div className="bg-red-100 text-red-700 border border-red-200 rounded p-3 mb-3">{error}</div>}

      {!loading && shown.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="max-h-[65vh] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 text-left shadow-sm z-10">
                <tr>
                  <th className="px-4 py-2 cursor-pointer" onClick={()=>changeSort('submittedAt')}>Submitted At</th>
                  <th className="px-4 py-2 cursor-pointer" onClick={()=>changeSort('email')}>Submitted By</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {shown.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-2 text-gray-800">{new Date(s.submittedAt).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{s.submittedBy?.email || '-'}</span>
                        <span className="text-gray-600">{s.submittedBy?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <button className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={()=> setDetail(s)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-3 border-t bg-gray-50">
            <div className="text-sm text-gray-600">Page {page} of {totalPages} • Total {total}</div>
            <div className="flex gap-2">
              <button disabled={page<=1} className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50" onClick={()=>{ const p = page-1; setPage(p); load(p); }}>Prev</button>
              <button disabled={page>=totalPages} className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50" onClick={()=>{ const p = page+1; setPage(p); load(p); }}>Next</button>
            </div>
          </div>
        </div>
      )}

      {!loading && !shown.length && !error && (
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">No submissions yet.</div>
      )}

      <DetailModal open={!!detail} onClose={()=>setDetail(null)} record={detail} fields={fields} />
    </div>
  );
};

export default AdminFormSubmissions;
