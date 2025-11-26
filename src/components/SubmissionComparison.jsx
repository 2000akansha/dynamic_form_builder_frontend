import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFormSubmissionService } from '../redux/apis/form';

const SubmissionComparison = () => {
  const { formId, submissionId1, submissionId2 } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [submission1, setSubmission1] = useState(null);
  const [submission2, setSubmission2] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        const [sub1, sub2] = await Promise.all([
          getFormSubmissionService(formId, submissionId1),
          getFormSubmissionService(formId, submissionId2)
        ]);
        setSubmission1(sub1);
        setSubmission2(sub2);
      } catch (err) {
        setError('Failed to load submissions. Please try again.');
        console.error('Error fetching submissions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (formId && submissionId1 && submissionId2) {
      fetchSubmissions();
    }
  }, [formId, submissionId1, submissionId2]);

  const renderField = (fieldName, value1, value2) => {
    const isDifferent = JSON.stringify(value1) !== JSON.stringify(value2);
    
    if (Array.isArray(value1) && value1.some(v => typeof v === 'string' && (v.startsWith('http') || v.includes('/uploads/')))) {
      return (
        <div className="space-y-2">
          {value1.map((url, idx) => (
            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
              View File {idx + 1}
            </a>
          ))}
        </div>
      );
    }

    if (typeof value1 === 'object' && value1 !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(value1).map(([subField, subValue]) => (
            <div key={subField}>
              <span className="font-medium">{subField}:</span> {String(subValue)}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={`p-2 rounded ${isDifferent ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}>
        {String(value1 || '')}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!submission1 || !submission2) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-700">No submission data available</h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  // Get all unique field names from both submissions
  const allFields = new Set([
    ...Object.keys(submission1.answers || {}),
    ...Object.keys(submission2.answers || {})
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Submission Comparison</h1>
              <p className="mt-1 text-sm text-gray-500">
                Comparing two submissions of the form
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Submissions
              </button>
            </div>
          </div>

          {/* Submission Info */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Submission 1</h3>
                <div className="mt-1 text-sm text-gray-500">
                  Submitted on: {new Date(submission1.submittedAt).toLocaleString()}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Submission 2</h3>
                <div className="mt-1 text-sm text-gray-500">
                  Submitted on: {new Date(submission2.submittedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Fields Comparison */}
          <div className="bg-white shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {Array.from(allFields).map((fieldName) => {
                const value1 = submission1.answers[fieldName];
                const value2 = submission2.answers[fieldName];
                const isDifferent = JSON.stringify(value1) !== JSON.stringify(value2);

                return (
                  <li key={fieldName} className={`px-6 py-4 ${isDifferent ? 'bg-yellow-50' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="font-medium text-gray-900">{fieldName}</div>
                      <div className={`${isDifferent ? 'bg-red-50' : ''} p-2 rounded`}>
                        {value1 !== undefined ? (
                          renderField(fieldName, value1, value2)
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </div>
                      <div className={`${isDifferent ? 'bg-green-50' : ''} p-2 rounded`}>
                        {value2 !== undefined ? (
                          renderField(fieldName, value2, value1)
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </div>
                    </div>
                    {isDifferent && (
                      <div className="mt-1 text-xs text-yellow-600">
                        This field has been modified
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionComparison;
