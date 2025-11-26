import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getFormDefinitionService, submitFormService } from "../../redux/apis/form";

const bytesToMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

const ImagePreview = ({ files }) => {
  if (!files || (Array.isArray(files) && files.length === 0)) return null;
  const list = Array.isArray(files) ? files : [files];
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {list.map((f, i) => {
        const url = f instanceof File ? URL.createObjectURL(f) : null;
        return (
          <div key={i} className="w-20 h-20 border rounded overflow-hidden bg-gray-50">
            {url ? (
              <img src={url} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">image</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const FieldInput = ({ field, value, onChange, error }) => {
  const common = {
    id: field.fieldName,
    name: field.fieldName,
    required: !!field.isMandatory,
  };

  const helper = (text) => (
    <div className="mt-1 text-xs text-gray-500">{text}</div>
  );

  switch (field.answerType) {
    case "text":
      return (
        <>
          <input type="text" className="w-full border px-3 py-2 rounded" {...common} value={value || ""} onChange={(e) => onChange(field.fieldName, e.target.value)} />
          {field.maxLength ? helper(`Max ${field.maxLength} characters`) : null}
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
        </>
      );
    case "textarea":
      return (
        <>
          <textarea className="w-full border px-3 py-2 rounded" rows={4} {...common} value={value || ""} onChange={(e) => onChange(field.fieldName, e.target.value)} />
          {field.maxLength ? helper(`Max ${field.maxLength} characters`) : null}
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
        </>
      );
    case "number":
      return (
        <>
          <input type="number" className="w-full border px-3 py-2 rounded" {...common} value={value || ""} onChange={(e) => onChange(field.fieldName, e.target.value)} />
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
        </>
      );
    case "email":
      return (
        <>
          <input type="email" className="w-full border px-3 py-2 rounded" {...common} value={value || ""} onChange={(e) => onChange(field.fieldName, e.target.value)} />
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
        </>
      );
    case "date":
      return (
        <>
          <input type="date" className="w-full border px-3 py-2 rounded" {...common} value={value || ""} onChange={(e) => onChange(field.fieldName, e.target.value)} />
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
        </>
      );
    case "checkbox":
      return (
        <>
          <div className="flex flex-wrap gap-3">
            {(field.options || []).map((opt) => (
              <label key={opt} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) ? value.includes(opt) : false}
                  onChange={(e) => {
                    const arr = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      if (!arr.includes(opt)) arr.push(opt);
                    } else {
                      const i = arr.indexOf(opt);
                      if (i >= 0) arr.splice(i, 1);
                    }
                    onChange(field.fieldName, arr);
                  }}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
        </>
      );
    case "radio":
      return (
        <>
          <div className="flex flex-col gap-1">
            {(field.options || []).map((opt) => (
              <label key={opt} className="inline-flex items-center gap-2">
                <input type="radio" name={field.fieldName} checked={value === opt} onChange={() => onChange(field.fieldName, opt)} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
        </>
      );
    case "select":
      return (
        <>
          <select className="w-full border px-3 py-2 rounded" {...common} value={value || ""} onChange={(e) => onChange(field.fieldName, e.target.value)}>
            <option value="" disabled>Select...</option>
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
        </>
      );
    case "image": {
      const cfg = field.fileConfig || {};
      const helperText = `Max ${cfg.maxSizeMB || 5}MB • Allowed: ${(cfg.allowedTypes || []).join(", ") || "image/*"}`;
      return (
        <>
          <input type="file" accept="image/*" {...common} onChange={(e) => onChange(field.fieldName, e.target.files?.[0] || null)} />
          {helper(helperText)}
          <ImagePreview files={value} />
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
        </>
      );
    }
    case "images": {
      const cfg = field.fileConfig || {};
      const helperText = `Up to ${cfg.maxCount || 5} • Max ${cfg.maxSizeMB || 5}MB each • Allowed: ${(cfg.allowedTypes || []).join(", ") || "image/*"}`;
      return (
        <>
          <input type="file" accept="image/*" multiple {...common} onChange={(e) => onChange(field.fieldName, Array.from(e.target.files || []))} />
          {helper(helperText)}
          <ImagePreview files={value} />
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
        </>
      );
    }
    default:
      return (
        <>
          <input type="text" className="w-full border px-3 py-2 rounded" {...common} value={value || ""} onChange={(e) => onChange(field.fieldName, e.target.value)} />
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
        </>
      );
  }
};

const NestedFields = ({ parentField, answers, onChange, errors }) => {
  const selected = answers[parentField.fieldName];
  const match = Array.isArray(parentField.nestedFields)
    ? parentField.nestedFields.find((nf) => nf.option === selected)
    : null;
  if (!match || !Array.isArray(match.fields) || !match.fields.length) return null;
  return (
    <div className="mt-3 border-l-4 border-blue-200 bg-blue-50 rounded p-3">
      <div className="text-sm font-medium mb-2">Additional details for: {selected}</div>
      <div className="grid grid-cols-1 gap-3">
        {match.fields.map((nf) => (
          <div key={`${parentField.fieldName}-${nf.fieldName}`}>
            <label htmlFor={nf.fieldName} className="block mb-1 text-sm font-medium">
              {nf.fieldLabel} {nf.isMandatory ? <span className="text-red-600">*</span> : null}
            </label>
            <FieldInput field={nf} value={answers[nf.fieldName]} onChange={onChange} error={errors[nf.fieldName]} />
          </div>
        ))}
      </div>
    </div>
  );
};

const PublicForm = () => {
  const { formId } = useParams();
  const { accessToken, email, name } = useSelector((s) => s.userDetailsSlice?.details || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  // Google identity
  const [gEmail, setGEmail] = useState("");
  const [gName, setGName] = useState("");
  const [gIdToken, setGIdToken] = useState("");
  const googleInitRef = useRef(false);
  // interactive tilt state (must be declared before any early returns)
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    const max = 6; // subtle effect
    setTilt({
      x: Math.max(Math.min(dy * max, max), -max),
      y: Math.max(Math.min(-dx * max, max), -max),
    });
  };
  const onCardMouseLeave = () => setTilt({ x: 0, y: 0 });

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const ensureGoogleInit = () => {
    if (googleInitRef.current) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts?.id) return; // script may not be loaded yet
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        const idToken = response.credential;
        setGIdToken(idToken);
        const payload = parseJwt(idToken);
        if (payload) {
          setGEmail(payload.email || "");
          setGName(payload.name || payload.given_name || "");
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      ux_mode: 'popup',
      use_fedcm_for_prompt: false,
    });
    try { window.google.accounts.id.disableAutoSelect(); } catch {}
    // Render official Google buttons if containers are present
    try {
      const btn1 = document.getElementById('google-btn');
      if (btn1) {
        window.google.accounts.id.renderButton(btn1, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }
      const btn2 = document.getElementById('google-btn-2');
      if (btn2) {
        window.google.accounts.id.renderButton(btn2, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }
    } catch {}
    googleInitRef.current = true;
  };

  const triggerGooglePrompt = () => {
    ensureGoogleInit();
    try {
      window.google?.accounts?.id?.prompt();
    } catch {}
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const res = await getFormDefinitionService(formId);
      if (!isMounted) return;
      if (res?.form && res?.fields) {
        setForm(res.form);
        setFields(res.fields);
        document.title = res.form.title || "Form";
        setError("");
        // Initialize Google once the form is ready to render buttons
        setTimeout(() => ensureGoogleInit(), 0);
      } else {
        setError(res?.message || "Failed to load form");
      }
      setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [formId]);

  const onChange = (name, val) => {
    setAnswers((prev) => ({ ...prev, [name]: val }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateClient = () => {
    const nextErrors = {};
    for (const f of fields) {
      const val = answers[f.fieldName];
      if (["image", "images"].includes(f.answerType)) {
        const cfg = f.fileConfig || {};
        const files = f.answerType === "image" ? (val ? [val] : []) : Array.isArray(val) ? val : [];
        if (f.isMandatory && files.length === 0) nextErrors[f.fieldName] = "This field is required";
        if (f.answerType === "images" && files.length > (cfg.maxCount || 5)) nextErrors[f.fieldName] = `Maximum ${cfg.maxCount || 5} files allowed`;
        for (const file of files) {
          if (file instanceof File) {
            if (cfg.allowedTypes && cfg.allowedTypes.length && !cfg.allowedTypes.includes(file.type)) {
              nextErrors[f.fieldName] = "Invalid file type";
              break;
            }
            const maxSizeBytes = (cfg.maxSizeMB || 5) * 1024 * 1024;
            if (file.size > maxSizeBytes) {
              nextErrors[f.fieldName] = `File too large (${bytesToMB(file.size)}MB)`;
              break;
            }
          }
        }
      } else {
        if (f.isMandatory) {
          const empty = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
          if (empty) nextErrors[f.fieldName] = "This field is required";
        }
      }
      // Nested required fields
      if (["radio", "select"].includes(f.answerType) && Array.isArray(f.nestedFields) && f.nestedFields.length) {
        const selected = answers[f.fieldName];
        const match = f.nestedFields.find((nf) => nf.option === selected);
        if (match && Array.isArray(match.fields)) {
          for (const nf of match.fields) {
            const nv = answers[nf.fieldName];
            if (nf.isMandatory) {
              const empty = nv === undefined || nv === null || nv === "" || (Array.isArray(nv) && nv.length === 0);
              if (empty) nextErrors[nf.fieldName] = "This field is required";
            }
          }
        }
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setError("");

    if (!validateClient()) {
      setSubmitting(false);
      return;
    }

    try {
      // Require Google identity capture before submit
      if (!gIdToken) {
        triggerGooglePrompt();
        setError("Please complete Google sign-in to continue.");
        setSubmitting(false);
        return;
      }
      const fd = new FormData();
      // Append non-file fields
      for (const field of fields) {
        const val = answers[field.fieldName];
        if (["image", "images"].includes(field.answerType)) continue; // files below
        if (Array.isArray(val)) {
          val.forEach((v) => fd.append(field.fieldName, v));
        } else if (val !== undefined && val !== null) {
          fd.append(field.fieldName, val);
        }
      }
      // Append file fields
      for (const field of fields) {
        const val = answers[field.fieldName];
        if (field.answerType === "image" && val instanceof File) {
          fd.append(field.fieldName, val);
        }
        if (field.answerType === "images" && Array.isArray(val)) {
          val.forEach((file) => file instanceof File && fd.append(field.fieldName, file));
        }
      }

      // Attach Google identity headers if present
      const extraHeaders = {};
      if (gIdToken) extraHeaders["X-Google-Id-Token"] = gIdToken;
      if (gEmail) extraHeaders["X-Google-Email"] = gEmail;
      if (gName) extraHeaders["X-Google-Name"] = gName;

      const res = await submitFormService(formId, fd, extraHeaders);
      if (res?.success) {
        setSuccessMsg("Your response has been recorded. Thank you!");
        setSubmitted(true);
        if (form?.allowMultipleSubmission) {
          // Keep form visible; allow resubmission
        } else {
          // For single response, clear answers and show thank-you screen
          setAnswers({});
          setErrors({});
        }
      } else {
        setError(res?.message || "Submission failed");
      }
    } catch (err) {
      setError(err?.message || "Submission error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-6">Loading...</div>;
  if (error) return <div className="max-w-2xl mx-auto p-6 text-red-600">{error}</div>;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Scoped styles for animations */}
      <style>{`
        @keyframes floatSlow { 0% { transform: translateY(0) translateX(0) scale(1);} 50% { transform: translateY(-12px) translateX(6px) scale(1.02);} 100% { transform: translateY(0) translateX(0) scale(1);} }
        @keyframes drift { 0% { transform: translate(0,0) rotate(0deg);} 50% { transform: translate(10px,-10px) rotate(10deg);} 100% { transform: translate(0,0) rotate(0deg);} }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animated-bg { background: linear-gradient(-45deg, #eef2ff, #fef3c7, #ecfeff, #fce7f3); background-size: 400% 400%; animation: gradientShift 18s ease infinite; }
        .blob { filter: blur(40px); opacity: 0.45; animation: floatSlow 12s ease-in-out infinite; }
        .blob-2 { animation-duration: 16s; animation-name: drift; opacity: 0.35; }
        @media (prefers-reduced-motion: reduce) { .animated-bg, .blob, .blob-2 { animation: none !important; } }
      `}</style>

      {/* Animated gradient base */}
      <div className="absolute inset-0 animated-bg" />
      {/* Floating soft blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full blob"
           style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,0.25), rgba(59,130,246,0))' }} />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-96 h-96 rounded-full blob-2"
           style={{ background: 'radial-gradient(closest-side, rgba(236,72,153,0.22), rgba(236,72,153,0))' }} />
      <div className="pointer-events-none absolute bottom-[-60px] left-10 w-72 h-72 rounded-full blob"
           style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.22), rgba(16,185,129,0))' }} />

      <div className="relative border-b/0 bg-white/70 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="text-2xl font-semibold">{form?.title}</div>
          {form?.description ? (
            <div className="text-gray-600 mt-1">{form.description}</div>
          ) : null}
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto p-6">
        {form?.requireLogin && !accessToken && (
          <div className="flex items-center justify-center py-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center max-w-md w-full">
              <div className="text-2xl font-semibold mb-2">Sign in required</div>
              <p className="text-gray-600 mb-4">This form is not anonymous. Please log in to continue so we can record who submitted this response.</p>
              <div className="flex flex-col gap-3 items-center">
                <a href="/admin" className="inline-block bg-blue-600 text-white px-5 py-2 rounded">Login (email/password)</a>
                <div id="google-btn" className="mt-1" />
              </div>
            </div>
          </div>
        )}
        {/* Full-screen thank-you for single-submission forms */}
        {submitted && !form?.allowMultipleSubmission && (
          <div className="flex items-center justify-center py-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center max-w-md w-full">
              <div className="text-2xl font-semibold mb-2">Thank you for your response</div>
              <p className="text-gray-600">We have shared this with the admin.</p>
            </div>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 text-green-700 bg-green-100 border border-green-200 px-3 py-2 rounded">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-700 bg-red-100 border border-red-200 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {!form?.requireLogin || accessToken ? (
        !submitted || form?.allowMultipleSubmission ? (
          <form
            onSubmit={handleSubmit}
            className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-5 transition-transform"
            onMouseMove={onCardMouseMove}
            onMouseLeave={onCardMouseLeave}
            style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
          >
            <div className="grid grid-cols-1 gap-5">
              {fields.map((f) => (
                <div key={f._id} className="">
                  <label htmlFor={f.fieldName} className="block mb-1 font-medium">
                    {f.fieldLabel} {f.isMandatory ? <span className="text-red-600">*</span> : null}
                  </label>
                  <FieldInput field={f} value={answers[f.fieldName]} onChange={onChange} error={errors[f.fieldName]} />
                  <NestedFields parentField={f} answers={answers} onChange={onChange} errors={errors} />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              {form?.allowMultipleSubmission && submitted && (
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-100"
                  onClick={() => { setAnswers({}); setErrors({}); setSubmitted(false); setSuccessMsg(""); }}
                >
                  Submit another response
                </button>
              )}
              <div className="flex items-center gap-3">
                <div id="google-btn-2" />
                <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-5 py-2 rounded disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </form>
        ) : null
        ) : null}
      </div>
    </div>
  );
}
export default PublicForm;
