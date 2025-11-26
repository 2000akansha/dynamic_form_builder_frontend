import React, { useEffect, useState } from "react";
import { getPublicFormsService } from "../../redux/apis/form";
import { Link } from "react-router-dom";

const UserForms = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");
    const res = await getPublicFormsService();
    if (res?.forms) setItems(res.forms);
    else if (res?.data?.forms) setItems(res.data.forms);
    else if (Array.isArray(res?.data)) setItems(res.data);
    else setError(res?.message || "Failed to load forms");
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Available Forms</h2>

      {loading && <div className="bg-white rounded shadow p-4">Loading...</div>}
      {error && (
        <div className="bg-red-100 text-red-700 border border-red-200 rounded p-3 mb-3">{error}</div>
      )}

      {!loading && !items.length && (
        <div className="bg-white rounded shadow p-6 text-center text-gray-600">No forms available.</div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((f) => (
            <div key={f._id} className="bg-white border rounded shadow p-4 flex flex-col gap-2">
              <div className="text-lg font-semibold">{f.title}</div>
              {f.description && <div className="text-gray-600 text-sm">{f.description}</div>}
              <div className="text-xs text-gray-500">Created: {new Date(f.createdAt).toLocaleString()}</div>
              <div className="mt-2">
                <Link className="px-3 py-2 bg-blue-600 text-white rounded" to={`/form/${f._id}`}>
                  Fill Form
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserForms;
