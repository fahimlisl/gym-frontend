import React, { useState, useEffect } from 'react';
import api from '../../api/axios.api.js';
import toast from 'react-hot-toast';

const AssignWorkoutModal = ({ userId, onClose, onSuccess }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const res = await api.get('/admin/get/template/all');
      setTemplates(res.data.data);
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleAssignWorkout = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    try {
      setLoading(true);
      await api.post('/admin/assign/workout', {
        userId,
        templateId: selectedTemplate._id,
        startDate,
      });
      toast.success('Workout plan assigned successfully');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-neutral-900 via-black to-neutral-900 border border-red-600/30 rounded-xl max-w-2xl w-full p-6 sm:p-8 max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-black text-white mb-6 tracking-wide">
          ASSIGN WORKOUT PLAN
        </h2>

        {/* Select Template */}
        <div className="mb-6">
          <label className="block text-xs font-light text-neutral-400 tracking-wider mb-3">
            SELECT TEMPLATE
          </label>

          {templatesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin text-red-500 text-2xl mb-2">⟳</div>
              <p className="text-neutral-400 text-xs">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 bg-neutral-800/50 border border-white/10 rounded-lg">
              <p className="text-neutral-400 text-sm">No templates available</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {templates.map((template) => (
                <button
                  key={template._id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full text-left p-4 border rounded-lg transition-all ${
                    selectedTemplate?._id === template._id
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-white/10 bg-neutral-800/50 hover:border-red-500/50'
                  }`}
                >
                  <h3 className="text-white font-light mb-1">{template.name}</h3>
                  <div className="text-xs text-neutral-400 space-y-1">
                    <p>{template.description}</p>
                    <p>
                      <span className="text-white">Difficulty:</span> {template.difficultyLevel} •{' '}
                      <span className="text-white">Goal:</span> {template.goal}
                    </p>
                    <p>
                      <span className="text-white">Duration:</span> {template.duration} weeks •{' '}
                      <span className="text-white">Days:</span> {template.weeks[0]?.days.length || 0}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Start Date */}
        {selectedTemplate && (
          <div className="mb-6">
            <label className="block text-xs font-light text-neutral-400 tracking-wider mb-3">
              START DATE
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-neutral-800/50 border border-white/10 px-4 py-2 text-white text-sm outline-none focus:border-red-500 transition-colors"
            />
          </div>
        )}

        {selectedTemplate && (
          <div className="bg-neutral-800/50 border border-white/10 rounded-lg p-4 mb-6">
            <p className="text-xs font-light text-neutral-400 tracking-wider mb-3">PLAN SUMMARY</p>
            <div className="space-y-2 text-sm text-neutral-400">
              <p>
                <span className="text-white font-light">Name:</span> {selectedTemplate.name}
              </p>
              <p>
                <span className="text-white font-light">Duration:</span> {selectedTemplate.duration} weeks
              </p>
              <p>
                <span className="text-white font-light">Start Date:</span> {new Date(startDate).toLocaleDateString()}
              </p>
              <p>
                <span className="text-white font-light">Total Days:</span> {selectedTemplate.weeks[0]?.days.length || 0}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-white/10 text-white text-xs font-light hover:border-white/30 transition-all"
          >
            CANCEL
          </button>
          <button
            onClick={handleAssignWorkout}
            disabled={!selectedTemplate || loading}
            className="flex-1 py-2 px-4 bg-red-500 text-white text-xs font-light hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⟳</span> ASSIGNING...
              </span>
            ) : (
              'ASSIGN PLAN'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignWorkoutModal;