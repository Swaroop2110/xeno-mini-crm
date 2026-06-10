import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, ArrowRight, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Copilot.css';

export function Copilot() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Campaign State
  const [goal, setGoal] = useState('');
  const [segmentData, setSegmentData] = useState<any>(null);
  const [audienceSize, setAudienceSize] = useState(0);
  const [message, setMessage] = useState('');

  const API_URL = 'http://localhost:3000/api'; // Local dev

  const handleParseGoal = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    try {
      // 1. Parse goal into JSON filters
      const res = await axios.post(`${API_URL}/copilot/parse-goal`, { goal });
      setSegmentData(res.data);

      // 2. Preview Audience Size
      const previewRes = await axios.post(`${API_URL}/segments/preview`, { filters: res.data.segment });
      setAudienceSize(previewRes.data.audienceSize);

      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Failed to process goal with AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMessage = async () => {
    setLoading(true);
    try {
      // Fetch ONE random customer to preview the message with
      const custRes = await axios.get(`${API_URL}/segments/customers?limit=1`);
      const customerId = custRes.data.customers[0]?._id;

      if (!customerId) {
        alert("No customers in database to generate preview.");
        setLoading(false);
        return;
      }

      // Generate Message
      const msgRes = await axios.post(`${API_URL}/copilot/generate-message`, {
        template: goal,
        customerId
      });
      
      setMessage(msgRes.data.message);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert('Failed to generate message.');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchCampaign = async () => {
    setLoading(true);
    try {
      // 1. Create Campaign
      const createRes = await axios.post(`${API_URL}/campaigns`, {
        name: segmentData.campaignName || 'AI Campaign',
        goal: goal,
        segment: { filters: segmentData.segment },
        channel: segmentData.recommendedChannel || 'email',
        messageTemplate: message
      });

      const campaignId = createRes.data._id;

      // 2. Launch Campaign
      await axios.post(`${API_URL}/campaigns/${campaignId}/send`);
      
      // Navigate to Stats (We haven't built the Stats page yet, so redirect to Dashboard for now)
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to launch campaign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="copilot-container animate-fade-in">
      <div className="copilot-header">
        <div className="header-badge">
          <Sparkles size={16} /> AI Copilot
        </div>
        <h1>Create a Campaign</h1>
        <p>Just tell Xeno what you want to achieve, and we'll handle the rest.</p>
      </div>

      <div className="steps-container">
        {/* STEP 1: Goal */}
        <div className={`step-card glass-panel ${step >= 1 ? 'active' : 'dimmed'}`}>
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>What is your marketing goal?</h3>
            <textarea 
              className="input-glass goal-input" 
              placeholder="e.g., Send an email to customers in Delhi who have spent more than 5000 INR to offer 10% off"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={step > 1 || loading}
            />
            {step === 1 && (
              <button className="btn-primary mt-4" onClick={handleParseGoal} disabled={loading || !goal}>
                {loading ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
                Generate Audience
              </button>
            )}
          </div>
        </div>

        {/* STEP 2: Explainability Panel */}
        {step >= 2 && (
          <div className={`step-card glass-panel animate-fade-in ${step >= 2 ? 'active' : 'dimmed'}`}>
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Audience Segment Review</h3>
              <div className="explainability-panel">
                <div className="stat-card">
                  <span className="stat-label">Estimated Audience Size</span>
                  <span className="stat-value">{audienceSize.toLocaleString()}</span>
                  <span className="stat-sub">Customers found</span>
                </div>
                <div className="json-preview">
                  <div className="json-header">AI Extraction Logic</div>
                  <pre>{JSON.stringify(segmentData?.segment, null, 2)}</pre>
                </div>
                <div className="reasoning-box">
                  <strong>AI Reasoning:</strong> {segmentData?.segmentReasoning}
                </div>
              </div>
              
              {step === 2 && (
                <button className="btn-primary mt-4" onClick={handleGenerateMessage} disabled={loading}>
                  {loading ? <Loader2 className="spin" size={18} /> : <ArrowRight size={18} />}
                  Continue to Message
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Message Generation */}
        {step >= 3 && (
          <div className={`step-card glass-panel animate-fade-in ${step >= 3 ? 'active' : 'dimmed'}`}>
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Personalized Message Preview</h3>
              <p className="text-secondary">Here is how the message will look for a sample customer in this segment.</p>
              
              <div className="message-preview-box">
                <div className="channel-badge">{segmentData?.recommendedChannel.toUpperCase()}</div>
                <p className="message-text">{message}</p>
              </div>
              
              {step === 3 && (
                <button className="btn-primary mt-4 launch-btn" onClick={handleLaunchCampaign} disabled={loading}>
                  {loading ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
                  Launch Campaign
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
