import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setForm, setLoading, setError } from "../../redux/slices/formSlice";
import { createFormService } from "../../redux/apis/form";

const CreateForm = () => {
  const dispatch = useDispatch();
  const createdForm = useSelector((state) => state.formSlice.form);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxFieldsAllowed, setMaxFieldsAllowed] = useState(50);
  const [allowMultipleSubmission, setAllowMultipleSubmission] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    const payload = {
      title,
      description,
      maxFieldsAllowed,
      allowMultipleSubmission,
    };
    const result = await createFormService(payload);
    if (result?.status === "success") {
      // API wraps data in an array -> pick the first item (created form)
      const form = Array.isArray(result.data) ? result.data[0] : result.data;
      dispatch(setForm(form));
      dispatch(setError(null));
      alert("Form created successfully!");
    } else {
      dispatch(setError(result?.message || "Error creating form"));
    }
    dispatch(setLoading(false));
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create New Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block mb-1">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border px-2 py-1 rounded" />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border px-2 py-1 rounded" />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Max Fields Allowed</label>
          <input type="number" value={maxFieldsAllowed} onChange={e => setMaxFieldsAllowed(Number(e.target.value))} min={1} className="w-full border px-2 py-1 rounded" />
        </div>
        <div className="mb-3">
          <label className="inline-flex items-center">
            <input type="checkbox" checked={allowMultipleSubmission} onChange={e => setAllowMultipleSubmission(e.target.checked)} />
            <span className="ml-2">Allow Multiple Submission</span>
          </label>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Form</button>
      </form>

      {createdForm?._id && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Created Form</h3>
          <div className="text-sm">
            <div><strong>ID:</strong> {createdForm._id}</div>
            <div><strong>Title:</strong> {createdForm.title}</div>
            <div><strong>Description:</strong> {createdForm.description || "-"}</div>
            <div><strong>Max Fields:</strong> {createdForm.maxFieldsAllowed}</div>
            <div><strong>Allow Multiple:</strong> {createdForm.allowMultipleSubmission ? "Yes" : "No"}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateForm;

