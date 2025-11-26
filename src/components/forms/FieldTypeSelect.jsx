import React from "react";

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

const FieldTypeSelect = ({ value, onChange }) => (
  <div className="mb-3">
    <label className="block mb-1 font-medium">Answer Type</label>
    <select value={value} onChange={onChange} className="w-full border px-2 py-1 rounded">
      {answerTypes.map(type => (
        <option key={type} value={type}>{type}</option>
      ))}
    </select>
  </div>
);

export default FieldTypeSelect;
