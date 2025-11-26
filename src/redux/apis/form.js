import apiClient from "../../utils/axois";
import { handleApiError } from "../../utils/apiError";

// Create a form (admin)
export const createFormService = async (formPayload) => {
  try {
    const response = await apiClient.post("/form/create-form", formPayload, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// List my forms (admin)
export const getMyFormsService = async () => {
  try {
    const res = await apiClient.get(`/form`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Delete a form (admin)
export const deleteFormService = async (formId) => {
  try {
    const res = await apiClient.delete(`/form/${formId}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Public: list available forms
export const getPublicFormsService = async () => {
  try {
    const res = await apiClient.get(`/form/available`);
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Toggle publish (admin)
export const togglePublishService = async (formId, published) => {
  try {
    const res = await apiClient.put(`/form/${formId}/publish`, { published }, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Assign users (admin)
export const assignFormService = async (formId, userIds) => {
  try {
    const res = await apiClient.put(`/form/${formId}/assign`, { userIds }, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get a single form submission by ID
export const getFormSubmissionService = async (formId, submissionId) => {
  try {
    const res = await apiClient.get(`/formSubmission/${formId}/${submissionId}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Admin: list submissions for a single form
export const getFormSubmissionsService = async (formId, { page = 1, limit = 20 } = {}) => {
  try {
    const res = await apiClient.get(`/formSubmission/${formId}/submissions`, {
      params: { page, limit },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Admin: create form fields
export const createFormFieldsService = async (fieldsPayload) => {
  try {
    const response = await apiClient.post("/form/create-form-fields", fieldsPayload, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Public: get definition for a given formId
export const getFormDefinitionService = async (formId) => {
  try {
    const res = await apiClient.get(`/formSubmission/${formId}`);
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Public: submit a form (supports optional identity headers like Google)
export const submitFormService = async (formId, formData, extraHeaders = {}) => {
  try {
    const res = await apiClient.post(`/formSubmission/${formId}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data", ...extraHeaders },
    });
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Admin: list all submissions across my forms
export const getAllSubmissionsForAdminService = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const res = await apiClient.get(`/formSubmission/all`, {
      params: { page, limit },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

