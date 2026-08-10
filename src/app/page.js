'use client';

import { useState } from 'react';

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState('');

  // Email Sending States
  const [finalRecipient, setFinalRecipient] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDescription) return;

    setIsLoading(true);
    setError('');
    setResultData(null);
    setSendSuccessMessage('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescription, recipientEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process application');
      }

      setResultData(data.data);
      setFinalRecipient(data.data.email_to || recipientEmail || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!finalRecipient || !resultData?.pdf_file_id) return;
    
    setIsSending(true);
    setSendSuccessMessage('');
    setError('');

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfFileId: resultData.pdf_file_id,
          recipientEmail: finalRecipient,
          subject: resultData.email_subject,
          body: resultData.email_body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      if (data.success) {
        setSendSuccessMessage(`✅ Email successfully sent to ${data.sent_to || finalRecipient}!`);
      } else {
        throw new Error('Email sending failed unexpectedly.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="container">
      <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
        <h1 className="heading-title">Job Application Generator</h1>
        <p className="heading-subtitle">
          Paste the job description below, and our n8n workflow will automatically analyze it, tailor your master resume, generate a cover letter, and prepare an email draft for you.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="recipientEmail" className="input-label">Recipient Email (Optional, HR/Company)</label>
            <input
              id="recipientEmail"
              type="email"
              placeholder="hr@company.com"
              className="textarea-field"
              style={{ minHeight: 'auto', padding: '0.75rem' }}
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="jobDescription" className="input-label">Job Description</label>
            <textarea
              id="jobDescription"
              placeholder="Paste the full job description here..."
              className="textarea-field"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading || !jobDescription}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Processing via n8n...
              </>
            ) : (
              'Generate Application'
            )}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#f87171' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {sendSuccessMessage && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '8px', color: '#4ade80' }}>
            {sendSuccessMessage}
          </div>
        )}

        {resultData && (
          <div className="result-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
              <div>
                <h2 style={{ color: 'var(--primary-color)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>Application Ready! 🎉</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                  {resultData.job_title} at <strong style={{ color: 'white' }}>{resultData.company_name}</strong>
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                {resultData.pdf_url && (
                  <a href={resultData.pdf_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', width: 'auto' }}>
                    View PDF
                  </a>
                )}
                {resultData.pdf_download_url && (
                  <a href={resultData.pdf_download_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: 'auto' }}>
                    Download Resume
                  </a>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-input)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Email Draft</h3>
                <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>To: <span style={{ color: 'white' }}>{resultData.email_to || finalRecipient || 'N/A'}</span></p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Subject: <span style={{ color: 'white' }}>{resultData.email_subject}</span></p>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)', lineHeight: '1.6', fontSize: '1rem', marginBottom: '1.5rem' }}>
                  {resultData.email_body}
                </div>

                {/* Send Email Action Section */}
                <div style={{ marginTop: '1rem', padding: '1.5rem', backgroundColor: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Send Application</h4>
                  
                  {(!resultData.email_to) && (
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <label className="input-label">Recipient Email required to send:</label>
                      <input 
                        type="email" 
                        className="textarea-field" 
                        style={{ minHeight: 'auto', padding: '0.75rem', backgroundColor: 'var(--bg-card)' }}
                        placeholder="e.g. hr@company.com"
                        value={finalRecipient}
                        onChange={(e) => setFinalRecipient(e.target.value)}
                      />
                    </div>
                  )}

                  <button 
                    onClick={handleSendEmail} 
                    className="btn-primary" 
                    disabled={isSending || !finalRecipient || !resultData.pdf_file_id}
                    style={{ width: 'auto' }}
                  >
                    {isSending ? (
                      <>
                        <span className="spinner"></span>
                        Sending Email...
                      </>
                    ) : (
                      'Send Email Now'
                    )}
                  </button>
                  
                  {!resultData.pdf_file_id && (
                    <p style={{ marginTop: '0.5rem', color: '#f87171', fontSize: '0.85rem' }}>
                      Cannot send email: pdf_file_id is missing from the workflow response.
                    </p>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </main>
  );
}
