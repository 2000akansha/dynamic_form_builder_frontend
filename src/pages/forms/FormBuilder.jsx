import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setForm, setFields, setError, setLoading } from "../../redux/slices/formSlice";
import { createFormService, createFormFieldsService } from "../../redux/apis/form";

const ANSWER_TYPES = [
  "text",
  "textarea",
  "number",
  "email",
  "date",
  "checkbox",
  "radio",
  "select",
  "image", // single image upload
  "images", // multiple image upload
];

const EmptyField = () => ({
  fieldLabel: "",
  fieldName: "",
  isMandatory: false,
  answerType: "text",
  maxLength: 100,
  order: 0,
  options: [],
  validation: { min: undefined, max: undefined, regex: "" },
  fileConfig: { maxSizeMB: 5, maxCount: 5, allowedTypes: ["image/jpeg","image/png","image/webp","image/gif"] },
  nestedFields: [],
});

const FieldRow = ({ idx, field, onChange, onRemove }) => {
  const slugify = (s) =>
    (s || "")
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const onBasicChange = (key, value) => {
    // Auto-generate internal key from label if not set
    if (key === "fieldLabel" && (!field.fieldName || field.fieldName.trim() === "")) {
      const auto = slugify(value).slice(0, 50) || "field";
      onChange(idx, { ...field, fieldLabel: value, fieldName: auto });
      return;
    }
    onChange(idx, { ...field, [key]: value });
  };

  const showOptions = ["checkbox", "radio", "select"].includes(field.answerType);
  const showFileConfig = ["image", "images"].includes(field.answerType);

  const updateOption = (i, val) => {
    const copy = [...(field.options || [])];
    copy[i] = val;
    onBasicChange("options", copy);
  };
  const addOption = () => onBasicChange("options", [...(field.options || []), ""]);
  const removeOption = (i) => onBasicChange("options", (field.options || []).filter((_,ix)=>ix!==i));

  const updateFileConfig = (key, val) => {
    const current = field.fileConfig || {};
    onBasicChange("fileConfig", { ...current, [key]: val });
  };

  const updateNestedField = (optIndex, nfIndex, key, val) => {
    const nfArr = field.nestedFields ? [...field.nestedFields] : [];
    const optionEntry = nfArr[optIndex] || { option: field.options?.[optIndex] || "", fields: [] };
    const fields = optionEntry.fields ? [...optionEntry.fields] : [];
    fields[nfIndex] = { ...(fields[nfIndex]||{}), [key]: val };
    nfArr[optIndex] = { option: field.options?.[optIndex] || optionEntry.option, fields };
    onBasicChange("nestedFields", nfArr);
  };
  const addNestedField = (optIndex) => {
    const nfArr = field.nestedFields ? [...field.nestedFields] : [];
    const optionEntry = nfArr[optIndex] || { option: field.options?.[optIndex] || "", fields: [] };
    optionEntry.fields = [...(optionEntry.fields||[]), { fieldLabel: "", fieldName: "", answerType: "text", isMandatory: false, options: [], validation: {}, order: 0 }];
    nfArr[optIndex] = optionEntry;
    onBasicChange("nestedFields", nfArr);
  };
  const removeNestedField = (optIndex, nfIndex) => {
    const nfArr = field.nestedFields ? [...field.nestedFields] : [];
    if (!nfArr[optIndex]) return;
    nfArr[optIndex].fields = (nfArr[optIndex].fields||[]).filter((_,ix)=>ix!==nfIndex);
    onBasicChange("nestedFields", nfArr);
  };

  return (
    <div className="border rounded p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Question (shown to users)</label>
          <input className="w-full border px-2 py-1 rounded" placeholder="e.g. Your full name" value={field.fieldLabel} onChange={e=>onBasicChange("fieldLabel", e.target.value)} />
          <p className="text-xs text-gray-500 mt-1">This is the question title the user will see.</p>
        </div>
        <div>
          <label className="block text-sm mb-1">Field key (internal)</label>
          <input className="w-full border px-2 py-1 rounded" placeholder="letters_numbers_underscores" value={field.fieldName} onChange={e=>onBasicChange("fieldName", e.target.value)} />
          <p className="text-xs text-gray-500 mt-1">Used internally when saving responses. Avoid spaces.</p>
        </div>
        <div>
          <label className="block text-sm mb-1">Answer type</label>
          <select className="w-full border px-2 py-1 rounded" value={field.answerType} onChange={e=>onBasicChange("answerType", e.target.value)}>
            {ANSWER_TYPES.map(t=> <option key={t} value={t}>{t}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-1">Choose how the user should answer (text, number, date, image, etc.).</p>
        </div>
        <div>
          <label className="block text-sm mb-1">Required?</label>
          <input type="checkbox" checked={field.isMandatory} onChange={e=>onBasicChange("isMandatory", e.target.checked)} />
          <p className="text-xs text-gray-500 mt-1">If checked, users must answer this question.</p>
        </div>
        <div>
          <label className="block text-sm mb-1">Max characters</label>
          <input type="number" className="w-full border px-2 py-1 rounded" placeholder="e.g. 100" value={field.maxLength||""} onChange={e=>onBasicChange("maxLength", Number(e.target.value))} />
          <p className="text-xs text-gray-500 mt-1">Applies to text/textarea fields.</p>
        </div>
        <div>
          <label className="block text-sm mb-1">Position</label>
          <input type="number" className="w-full border px-2 py-1 rounded" placeholder="e.g. 1" value={field.order||0} onChange={e=>onBasicChange("order", Number(e.target.value))} />
          <p className="text-xs text-gray-500 mt-1">Controls the display order of the field.</p>
        </div>
      </div>

      {/* Validation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        <div>
          <label className="block text-sm mb-1">Min value/length</label>
          <input type="number" className="w-full border px-2 py-1 rounded" placeholder="e.g. 1" value={field.validation?.min ?? ""} onChange={e=>onBasicChange("validation", { ...field.validation, min: e.target.value? Number(e.target.value): undefined })} />
          <p className="text-xs text-gray-500 mt-1">For numbers: smallest allowed value. For text: minimum characters.</p>
        </div>
        <div>
          <label className="block text-sm mb-1">Max value/length</label>
          <input type="number" className="w-full border px-2 py-1 rounded" placeholder="e.g. 100" value={field.validation?.max ?? ""} onChange={e=>onBasicChange("validation", { ...field.validation, max: e.target.value? Number(e.target.value): undefined })} />
          <p className="text-xs text-gray-500 mt-1">For numbers: largest allowed value. For text: maximum characters.</p>
        </div>
        <div>
          <label className="block text-sm mb-1">Pattern (regex)</label>
          <input className="w-full border px-2 py-1 rounded" placeholder="e.g. ^[A-Za-z\\s]+$" value={field.validation?.regex || ""} onChange={e=>onBasicChange("validation", { ...field.validation, regex: e.target.value })} />
          <p className="text-xs text-gray-500 mt-1">Optional. Add a regular expression to validate the answer.</p>
        </div>
      </div>

      {showOptions && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="font-medium">Choices (shown to users)</label>
            <button type="button" className="text-sm bg-gray-200 px-2 py-1 rounded" onClick={addOption}>+ Add Option</button>
          </div>
          {(field.options||[]).map((opt, i)=>(
            <div key={i} className="flex items-center gap-2 mt-2">
              <input className="flex-1 border px-2 py-1 rounded" value={opt} onChange={e=>updateOption(i, e.target.value)} placeholder={`Choice ${i+1}`} />
              <button type="button" className="text-red-600 text-sm" onClick={()=>removeOption(i)}>Remove</button>
            </div>
          ))}

          {/* Nested fields per option for radio/select */}
          {["radio","select"].includes(field.answerType) && (field.options||[]).map((opt, optIdx)=>(
            <div key={`nf-${optIdx}`} className="mt-3 border rounded p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="font-medium">Follow-up questions when user selects: {opt || `#${optIdx+1}`}</div>
                <button type="button" className="text-sm bg-gray-200 px-2 py-1 rounded" onClick={()=>addNestedField(optIdx)}>+ Add Nested Field</button>
              </div>
              {(field.nestedFields?.[optIdx]?.fields || []).map((nf, nfIdx)=>(
                <div key={nfIdx} className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2">
                  <input className="border px-2 py-1 rounded" placeholder="Question (shown to users)" value={nf.fieldLabel||""} onChange={e=>updateNestedField(optIdx, nfIdx, "fieldLabel", e.target.value)} />
                  <input className="border px-2 py-1 rounded" placeholder="Field key (internal)" value={nf.fieldName||""} onChange={e=>updateNestedField(optIdx, nfIdx, "fieldName", e.target.value)} />
                  <select className="border px-2 py-1 rounded" value={nf.answerType||"text"} onChange={e=>updateNestedField(optIdx, nfIdx, "answerType", e.target.value)}>
                    {ANSWER_TYPES.map(t=> <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={nf.isMandatory||false} onChange={e=>updateNestedField(optIdx, nfIdx, "isMandatory", e.target.checked)} /> Required</label>
                  <button type="button" className="text-red-600 text-sm" onClick={()=>removeNestedField(optIdx, nfIdx)}>Remove</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {showFileConfig && (
        <div className="mt-4 border rounded p-3 bg-gray-50">
          <div className="font-medium mb-2">File constraints</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm mb-1">Max size (MB)</label>
              <input
                type="number"
                min={1}
                className="w-full border px-2 py-1 rounded"
                value={field.fileConfig?.maxSizeMB ?? 5}
                onChange={(e)=>updateFileConfig("maxSizeMB", Number(e.target.value))}
              />
            </div>
            {field.answerType === "images" && (
              <div>
                <label className="block text-sm mb-1">Max count</label>
                <input
                  type="number"
                  min={1}
                  className="w-full border px-2 py-1 rounded"
                  value={field.fileConfig?.maxCount ?? 5}
                  onChange={(e)=>updateFileConfig("maxCount", Number(e.target.value))}
                />
              </div>
            )}
            <div className="md:col-span-1">
              <label className="block text-sm mb-1">Allowed types (comma separated)</label>
              <input
                className="w-full border px-2 py-1 rounded"
                value={(field.fileConfig?.allowedTypes || []).join(",")}
                onChange={(e)=>updateFileConfig("allowedTypes", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}
                placeholder="image/jpeg,image/png,image/webp"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-right">
        <button type="button" className="text-red-600" onClick={()=>onRemove(idx)}>Remove Field</button>
      </div>
    </div>
  );
};

const FormBuilder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [createdForm, setCreatedForm] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxFieldsAllowed, setMaxFieldsAllowed] = useState(50);
  const [allowMultipleSubmission, setAllowMultipleSubmission] = useState(false);
  const [requireLogin, setRequireLogin] = useState(false);
  const [fields, setFieldsState] = useState([EmptyField()]);
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  const canProceedToFields = useMemo(()=> title.trim().length>0, [title]);

  const createForm = async (e) => {
    e?.preventDefault();
    if (!canProceedToFields) return;
    dispatch(setLoading(true));
    const payload = { title, description, maxFieldsAllowed, allowMultipleSubmission, requireLogin };
    const result = await createFormService(payload);
    if (result?.status === "success") {
      const form = Array.isArray(result.data) ? result.data[0] : result.data;
      setCreatedForm(form);
      dispatch(setForm(form));
      dispatch(setError(null));
      setStep(2);
    } else {
      dispatch(setError(result?.message || "Error creating form"));
    }
    dispatch(setLoading(false));
  };

  const currentMax = createdForm?.maxFieldsAllowed ?? maxFieldsAllowed;
  const addField = () => {
    setLimitModalOpen(false);
    setFieldsState(prev => {
      if (prev.length >= (currentMax || 0)) {
        setLimitModalOpen(true);
        return prev;
      }
      return [...prev, EmptyField()];
    });
  };
  const updateField = (idx, newVal) => setFieldsState(prev => prev.map((f,i)=> i===idx? newVal : f));
  const removeField = (idx) => setFieldsState(prev => prev.filter((_,i)=> i!==idx));

  const moveFieldUp = (idx) => {
    if (idx <= 0) return;
    setFieldsState(prev => {
      const arr = [...prev];
      [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
      return arr;
    });
  };
  const moveFieldDown = (idx) => {
    setFieldsState(prev => {
      if (idx >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx+1], arr[idx]] = [arr[idx], arr[idx+1]];
      return arr;
    });
  };

  const saveFields = async () => {
    if (!createdForm?._id) return;
    dispatch(setLoading(true));
    const payload = { formId: createdForm._id, fields };
    const result = await createFormFieldsService(payload);
    if (result?.status === "success") {
      dispatch(setFields(result.data));
      dispatch(setError(null));
      // Navigate to listing with highlight on the saved form
      navigate("/home/my-forms", { state: { highlightId: createdForm._id } });
    } else {
      dispatch(setError(result?.message || "Error saving fields"));
    }
    dispatch(setLoading(false));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Dynamic Form Builder</h2>

      <div className="mb-4 flex gap-2">
        <div className={`px-3 py-1 rounded ${step===1? 'bg-blue-600 text-white':'bg-gray-200'}`}>1. Create Form</div>
        <div className={`px-3 py-1 rounded ${step===2? 'bg-blue-600 text-white':'bg-gray-200'}`}>2. Define Fields</div>
      </div>

      {step===1 && (
        <form onSubmit={createForm} className="bg-white rounded shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Title</label>
              <input className="w-full border px-2 py-1 rounded" value={title} onChange={e=>setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1">Max Fields Allowed</label>
              <input type="number" className="w-full border px-2 py-1 rounded" value={maxFieldsAllowed} onChange={e=>setMaxFieldsAllowed(Number(e.target.value))} min={1} />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1">Description</label>
              <textarea className="w-full border px-2 py-1 rounded" value={description} onChange={e=>setDescription(e.target.value)} />
            </div>
            <div>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={allowMultipleSubmission} onChange={e=>setAllowMultipleSubmission(e.target.checked)} />
                Allow Multiple Submission
              </label>
              <p className="text-xs text-gray-500 mt-1">If checked, users can submit more than once.</p>
            </div>
            <div>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={requireLogin} onChange={e=>setRequireLogin(e.target.checked)} />
                Require sign-in to submit
              </label>
              <p className="text-xs text-gray-500 mt-1">Capture who submitted (name/email) and prevent anonymous responses.</p>
            </div>
          </div>
          <div className="mt-4 text-right">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!canProceedToFields}>Continue</button>
          </div>
        </form>
      )}

      {step===2 && (
        <div className="bg-white rounded shadow p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold">
              Form: {createdForm?.title}
              <span className="ml-2 text-sm text-gray-500">({fields.length}/{currentMax} fields)</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="bg-gray-100 px-3 py-2 rounded" onClick={()=>setStep(1)}>Back</button>
              <button type="button" className="bg-blue-600 text-white px-3 py-2 rounded" onClick={addField}>+ Add Field</button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {fields.map((f, idx)=> (
              <div key={idx} className="border rounded">
                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-t">
                  <div className="font-medium">Field #{idx+1}: {f.fieldLabel || f.fieldName || 'Untitled'}</div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="text-sm px-2 py-1 bg-gray-200 rounded" onClick={()=>moveFieldUp(idx)}>↑</button>
                    <button type="button" className="text-sm px-2 py-1 bg-gray-200 rounded" onClick={()=>moveFieldDown(idx)}>↓</button>
                    <button type="button" className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded" onClick={()=>removeField(idx)}>Remove</button>
                  </div>
                </div>
                <div className="p-3">
                  <FieldRow idx={idx} field={f} onChange={updateField} onRemove={removeField} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">Max fields allowed: {currentMax}</div>
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={saveFields}>Save Fields</button>
          </div>

          {limitModalOpen && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded shadow-lg w-full max-w-md p-5">
                <div className="text-lg font-semibold mb-2">Max Fields Reached</div>
                <p className="text-gray-700 mb-4">
                  You already set the maximum fields for this form as {currentMax}. Please go back and update the limit before adding more fields.
                </p>
                <div className="flex justify-end gap-2">
                  <button className="px-3 py-2 bg-gray-100 rounded" onClick={()=>setLimitModalOpen(false)}>Close</button>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={()=>{ setLimitModalOpen(false); setStep(1); }}>Back</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
