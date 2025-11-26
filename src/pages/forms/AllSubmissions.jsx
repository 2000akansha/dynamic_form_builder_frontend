import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllSubmissionsForAdminService } from "../../redux/apis/form";

// Render a single answer value with image previews when URLs look like images and links for other files.
const AnswerValue = ({ value }) => {
  const isHttp = (u) => typeof u === 'string' && /^https?:\/\//i.test(u);
  const isImgUrl = (u) => typeof u === 'string' && /(\.png|\.jpe?g|\.gif|\.webp|\.svg)$/i.test(u);
  const isFileLike = (u) => typeof u === 'string' && (isHttp(u) || /\.(pdf|docx?|xlsx?|pptx?)$/i.test(u) || u.startsWith('/'));
  const fileBaseUrl = 'http://localhost:1059/uploads/acitve_property_image_folder';
  const toFileUrl = (p) => {
    const s = String(p || "");
    if (/^https?:\/\//i.test(s)) return s;
    return `${fileBaseUrl}/${s.replace(/^\/+/, '')}`;
  };
  if (Array.isArray(value)) {
    const imgs = value.filter(isImgUrl);
    const files = value.filter((v) => !isImgUrl(v) && isFileLike(v));
    const others = value.filter((v) => !isImgUrl(v) && !isFileLike(v));
    return (
      <div className="flex flex-wrap gap-2">
        {imgs.map((src, i) => (
          <a key={`img-${i}`} href={toFileUrl(src)} target="_blank" rel="noreferrer">
            <img src={toFileUrl(src)} alt="uploaded" className="w-20 h-20 object-cover rounded border" />
          </a>
        ))}
        {files.map((src, i) => (
          <a key={`file-${i}`} href={toFileUrl(src)} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs border rounded bg-gray-50">{String(src).split('/').pop()}</a>
        ))}
        {others.length > 0 && (
          <span className="text-gray-800 break-words">{others.join(", ")}</span>
        )}
      </div>
    );
  }
  if (isImgUrl(value)) {
    return (
      <a href={toFileUrl(value)} target="_blank" rel="noreferrer">
        <img src={toFileUrl(value)} alt="uploaded" className="w-20 h-20 object-cover rounded border" />
      </a>
    );
  }
  if (isFileLike(value)) {
    return (
      <a href={toFileUrl(value)} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs border rounded bg-gray-50">{String(value).split('/').pop()}</a>
    );
  }
  return <span className="text-gray-800 break-words">{String(value)}</span>;
};

const DetailModal = ({ open, onClose, record }) => {
  if (!open || !record) return null;
  const entries = Object.entries(record.answers || {});
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
            <div className="text-gray-500">Submitted by</div>
            <div className="font-medium">{record.submittedBy?.email || "-"}{record.submittedBy?.name ? ` • ${record.submittedBy.name}` : ""}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-gray-700 font-semibold mb-2">Answers</div>
          {entries.length === 0 && <div className="text-gray-500">No answers</div>}
          <div className="grid grid-cols-1 gap-3">
            {entries.map(([k, v]) => (
              <div key={k} className="flex gap-3 text-sm">
                <div className="min-w-[180px] text-gray-600 font-medium">{k}</div>
                <div className="flex-1"><AnswerValue value={v} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AllSubmissions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState(null);

  const load = async (p = page) => {
    setLoading(true);
    setError("");
    const res = await getAllSubmissionsForAdminService({ page: p, limit });
    if (res?.submissions) {
      setItems(res.submissions);
      setTotal(res.total || 0);
    } else if (res?.data?.submissions) {
      setItems(res.data.submissions);
      setTotal(res.data.total || 0);
    } else {
      const raw = res?.message || res?.error || res;
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

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-bold">Responses</div>
          <div className="text-gray-600">All submissions across your forms</div>
        </div>
        <Link className="px-3 py-2 bg-gray-100 rounded" to="/home/my-forms">Back to My Forms</Link>
      </div>

      {loading && <div className="bg-white rounded shadow p-4">Loading...</div>}
      {error && <div className="bg-red-100 text-red-700 border border-red-200 rounded p-3 mb-3">{error}</div>}

      {!loading && items.length > 0 && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2">Submitted At</th>
                <th className="px-4 py-2">Submitted By</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-2">{new Date(s.submittedAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{s.submittedBy?.email || "-"}</span>
                      <span className="text-gray-600">{s.submittedBy?.name || "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={()=> setDetail(s)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between p-3 border-t bg-gray-50">
            <div className="text-sm text-gray-600">Page {page} of {totalPages} • Total {total}</div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm">
                <span>Rows:</span>
                <select
                  className="border rounded px-2 py-1"
                  value={limit}
                  onChange={(e) => { const v = Number(e.target.value); setLimit(v); setPage(1); load(1); }}
                >
                  {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button disabled={page<=1} className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50" onClick={()=>{ setPage(p=>p-1); load(page-1); }}>Prev</button>
                <button disabled={page>=totalPages} className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50" onClick={()=>{ setPage(p=>p+1); load(page+1); }}>Next</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !items.length && !error && (
        <div className="bg-white rounded shadow p-6 text-center text-gray-600">No submissions yet.</div>
      )}

      <DetailModal open={!!detail} onClose={()=>setDetail(null)} record={detail} />
    </div>
  );
};

export default AllSubmissions;

