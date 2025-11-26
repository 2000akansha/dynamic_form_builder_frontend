import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFields, setLoading, setError } from "../../redux/slices/formSlice";
import { createFormFieldsService } from "../../redux/apis/form";

const answerTypes = [
  "text",
  "textarea",
  "number",
  "email",
  "date",
  "checkbox",
  "radio",
  "select",
];

const CreateFormFields = () => {
  const dispatch = useDispatch();
  const form = useSelector(state => state.formSlice.form);
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [isMandatory, setIsMandatory] = useState(false);
  const [answerType, setAnswerType] = useState(answerTypes[0]);
  const [maxLength, setMaxLength] = useState(100);
  const [order, setOrder] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form?._id) {
      alert("Please create a form first.");
      return;
    }
    dispatch(setLoading(true));
    const payload = {
      formId: form._id,
      fieldLabel,
      fieldName,
      isMandatory,
      answerType,
      maxLength,
      order,
    };
    const result = await createFormFieldsService(payload);
    if (result?.status === "success") {
      dispatch(setFields(result.data));
      dispatch(setError(null));
      alert("Field added successfully!");
    } else {
      dispatch(setError(result?.message || "Error adding field"));
    }
    dispatch(setLoading(false));
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Add Form Field</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block mb-1">Field Label</label>
          <input type="text" value={fieldLabel} onChange={e => setFieldLabel(e.target.value)} required className="w-full border px-2 py-1 rounded" />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Field Name</label>
          <input type="text" value={fieldName} onChange={e => setFieldName(e.target.value)} required className="w-full border px-2 py-1 rounded" />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Is Mandatory</label>
          <input type="checkbox" checked={isMandatory} onChange={e => setIsMandatory(e.target.checked)} />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Answer Type</label>
          <select value={answerType} onChange={e => setAnswerType(e.target.value)} className="w-full border px-2 py-1 rounded">
            {answerTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="block mb-1">Max Length</label>
          <input type="number" value={maxLength} onChange={e => setMaxLength(Number(e.target.value))} min={1} className="w-full border px-2 py-1 rounded" />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Order</label>
          <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} min={0} className="w-full border px-2 py-1 rounded" />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add Field</button>
      </form>
    </div>
  );
};

export default CreateFormFields;
