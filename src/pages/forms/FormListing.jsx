import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getMyFormsService, deleteFormService } from "../../redux/apis/form";

const FormListing = () => {
  const location = useLocation();
  const highlightId = location.state?.highlightId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const highlightRef = useRef(null);

  // UI controls
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const load = async () => {
    setLoading(true);
    setError("");
    const res = await getMyFormsService();
    if (res?.forms) {
      setItems(res.forms);
    } else if (res?.data) {
      // in case backend success wrapper
      setItems(res.data.forms || res.data || []);
    } else {
      setError(res?.message || "Failed to load forms");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [items]);

  const copyLink = async (id) => {
    const url = `${window.location.origin}/form/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Form link copied to clipboard");
    } catch {
      alert(url);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this form? This cannot be undone.")) return;
    const res = await deleteFormService(id);
    if (res?.success || res?.status === "success") load();
    else alert(res?.message || "Delete failed");
  };

  // Filter + sort
  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = [...items];
    if (q) {
      arr = arr.filter((f) => {
        const created = new Date(f.createdAt).toLocaleString();
        return (
          (f.title || "").toLowerCase().includes(q) ||
          (f.description || "").toLowerCase().includes(q) ||
          created.toLowerCase().includes(q)
        );
      });
    }
    arr.sort((a,b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const getVal = (x) => {
        if (sortKey === 'title') return (x.title||'').toLowerCase();
        if (sortKey === 'createdAt') return new Date(x.createdAt).getTime();
        if (sortKey === 'status') return (x.isDeleted ? 'deleted' : 'active');
        return 0;
      };
      const av = getVal(a); const bv = getVal(b);
      if (av < bv) return -1*dir; if (av > bv) return 1*dir; return 0;
    });
    return arr;
  }, [items, query, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / limit));
  const pageItems = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredSorted.slice(start, start + limit);
  }, [filteredSorted, page, limit]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-extrabold tracking-tight">My Forms</h2>
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-3 py-2 w-64"
            placeholder="Search by title, description, date..."
            value={query}
            onChange={(e)=>{ setQuery(e.target.value); setPage(1); }}
          />
          <label className="text-sm text-gray-600">Sort</label>
          <select className="border rounded px-2 py-2" value={sortKey} onChange={(e)=>setSortKey(e.target.value)}>
            <option value="createdAt">Created</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
          <button className="px-2 py-2 border rounded" onClick={()=>setSortDir(d=> d==='asc'?'desc':'asc')}>
            {sortDir === 'asc' ? 'Asc' : 'Desc'}
          </button>
          <label className="ml-3 text-sm text-gray-600">Rows</label>
          <select className="border rounded px-2 py-2" value={limit} onChange={(e)=>{ const l = Number(e.target.value)||10; setLimit(l); setPage(1); }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      {loading && <div className="bg-white rounded shadow p-4">Loading...</div>}
      {error && <div className="bg-red-100 text-red-700 border border-red-200 rounded p-3 mb-3">{error}</div>}

      {!loading && !filteredSorted.length && (
        <div className="bg-white rounded shadow p-6 text-center text-gray-600">No forms yet.</div>
      )}

      {!loading && filteredSorted.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 text-left shadow-sm z-10">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Max Fields</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageItems.map((f) => {
                const isHighlight = highlightId && f._id === highlightId;
                return (
                <tr
                  key={f._id}
                  ref={isHighlight ? highlightRef : null}
                  className={`hover:bg-gray-50 ${isHighlight ? "bg-yellow-50 ring-2 ring-yellow-300" : ""}`}
                >
                  <td className="px-4 py-2 font-medium">{f.title}</td>
                  <td className="px-4 py-2">{new Date(f.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">{f.maxFieldsAllowed}</td>
                  <td className="px-4 py-2">{f.isDeleted ? "Deleted" : "Active"}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-end">
                      <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => copyLink(f._id)}>Copy Link</button>
                      <a className="px-3 py-1 bg-indigo-600 text-white rounded" href={`/home/my-forms/${f._id}/submissions`}>Submissions</a>
                      <a className="px-3 py-1 bg-blue-600 text-white rounded" href={`/form/${f._id}`} target="_blank" rel="noreferrer">Open</a>
                      <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => remove(f._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
          </div>
          <div className="flex items-center justify-between p-3 border-t bg-gray-50">
            <div className="text-sm text-gray-600">Page {page} of {totalPages} • Total {filteredSorted.length}</div>
            <div className="flex gap-2">
              <button disabled={page<=1} className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50" onClick={()=> setPage(p=> Math.max(1, p-1))}>Prev</button>
              <button disabled={page>=totalPages} className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50" onClick={()=> setPage(p=> Math.min(totalPages, p+1))}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormListing;
