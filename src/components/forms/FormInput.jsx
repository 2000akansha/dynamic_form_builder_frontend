import React from "react";

const FormInput = ({ label, type = "text", value, onChange, ...props }) => (
  <div className="mb-3">
    <label className="block mb-1 font-medium">{label}</label>
    {type === "textarea" ? (
      <textarea value={value} onChange={onChange} className="w-full border px-2 py-1 rounded" {...props} />
    ) : (
      <input type={type} value={value} onChange={onChange} className="w-full border px-2 py-1 rounded" {...props} />
    )}
  </div>
);

export default FormInput;
