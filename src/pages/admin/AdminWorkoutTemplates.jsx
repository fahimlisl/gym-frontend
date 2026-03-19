import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.api';
import toast from 'react-hot-toast';

const AdminWorkoutTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // list | create | edit
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficultyLevel: 'Beginner',
    goal: 'General Fitness',
    duration: 1,
  });

  const [dayForm, setDayForm] = useState({
    day: 'Monday',
    workoutName: '',
    isRestDay: false,
    notes: '',
  });

  const [exerciseForm, setExerciseForm] = useState({
    exerciseName: '',
    sets: 4,
    reps: '10-12',
    restTime: 60,
    notes: '',
    videoUrl: '',
    muscleGroup: '',
  });

  // Fetch all templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/get/template/all');
      setTemplates(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Create template
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/create/template', formData);
      setTemplates([res.data.data, ...templates]);
      setFormData({
        name: '',
        description: '',
        difficultyLevel: 'Beginner',
        goal: 'General Fitness',
        duration: 1,
      });
      setActiveTab('list');
      toast.success('Template created successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create template');
    }
  };

  // Add day to template
  const handleAddDay = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    try {
      const res = await api.post(`/admin/template/${selectedTemplate._id}/days`, dayForm);
      setSelectedTemplate(res.data.data);
      setTemplates(templates.map(t => t._id === selectedTemplate._id ? res.data.data : t));
      setDayForm({
        day: 'Monday',
        workoutName: '',
        isRestDay: false,
        notes: '',
      });
      toast.success('Day added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add day');
    }
  };

  // Add exercise to day
  const handleAddExercise = async (e) => {
    e.preventDefault();
    if (!selectedTemplate || !selectedDay) return;

    try {
      // Auto-calculate orderIndex based on existing exercises
      const nextOrderIndex = selectedDay.exercises.length;

      const res = await api.post(
        `/admin/template/${selectedTemplate._id}/days/${selectedDay._id}/exercises`,
        {
          ...exerciseForm,
          orderIndex: nextOrderIndex,
        }
      );
      setSelectedTemplate(res.data.data);
      const updatedDay = res.data.data.weeks[0].days.find(d => d._id === selectedDay._id);
      setSelectedDay(updatedDay);
      setExerciseForm({
        exerciseName: '',
        sets: 4,
        reps: '10-12',
        restTime: 60,
        notes: '',
        videoUrl: '',
        muscleGroup: '',
      });
      toast.success('Exercise added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add exercise');
    }
  };

  // Delete exercise
  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      const res = await api.delete(
        `/admin/template/${selectedTemplate._id}/days/${selectedDay._id}/exercises/${exerciseId}`
      );
      setSelectedTemplate(res.data.data);
      const updatedDay = res.data.data.weeks[0].days.find(d => d._id === selectedDay._id);
      setSelectedDay(updatedDay);
      toast.success('Exercise deleted successfully');
    } catch (err) {
      toast.error('Failed to delete exercise');
    }
  };

  // Delete day
  const handleDeleteDay = async (dayId) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      const res = await api.delete(`/admin/template/${selectedTemplate._id}/days/${dayId}`);
      setSelectedTemplate(res.data.data);
      setSelectedDay(null);
      toast.success('Day deleted successfully');
    } catch (err) {
      toast.error('Failed to delete day');
    }
  };

  // Delete template
  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Delete this entire template? This cannot be undone.')) return;

    try {
      await api.delete(`/admin/delete/template/${templateId}`);
      setTemplates(templates.filter(t => t._id !== templateId));
      if (selectedTemplate?._id === templateId) {
        setSelectedTemplate(null);
        setActiveTab('list');
      }
      toast.success('Template deleted successfully');
    } catch (err) {
      toast.error('Failed to delete template');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-light text-white mb-2 tracking-tight">
            Workout Templates
          </h1>
          <p className="text-neutral-400 text-sm font-light">
            Create and manage workout plans for your members
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-light tracking-wider transition-all ${
              activeTab === 'list'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            ALL TEMPLATES
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              setFormData({
                name: '',
                description: '',
                difficultyLevel: 'Beginner',
                goal: 'General Fitness',
                duration: 1,
              });
            }}
            className={`px-4 py-2 text-xs font-light tracking-wider transition-all ${
              activeTab === 'create'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            CREATE NEW
          </button>
          {selectedTemplate && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 text-xs font-light tracking-wider transition-all ${
                activeTab === 'edit'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              EDIT: {selectedTemplate.name}
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'list' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin text-red-500 text-4xl mb-4">⟳</div>
                <p className="text-neutral-400">Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 bg-neutral-900/50 border border-white/10 rounded-lg">
                <p className="text-neutral-400 mb-4">No templates yet</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-2 bg-red-500 text-white text-xs font-light tracking-wider hover:bg-red-600 transition-all"
                >
                  CREATE FIRST TEMPLATE
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div
                    key={template._id}
                    className="bg-neutral-900/50 border border-white/10 rounded-lg p-6 hover:border-red-500/50 transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setActiveTab('edit');
                    }}
                  >
                    <h3 className="text-lg font-light text-white mb-2 group-hover:text-red-500 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mb-4 line-clamp-2">
                      {template.description || 'No description'}
                    </p>

                    <div className="space-y-2 mb-4 text-xs text-neutral-400">
                      <p>
                        <span className="text-white">Difficulty:</span> {template.difficultyLevel}
                      </p>
                      <p>
                        <span className="text-white">Goal:</span> {template.goal}
                      </p>
                      <p>
                        <span className="text-white">Days:</span>{' '}
                        {template.weeks[0]?.days.length || 0}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplate(template);
                          setActiveTab('edit');
                        }}
                        className="flex-1 py-2 px-3 border border-white/10 text-white text-xs font-light hover:border-red-500 hover:text-red-500 transition-all"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template._id);
                        }}
                        className="py-2 px-3 border border-red-500/30 text-red-500 text-xs font-light hover:bg-red-500/10 transition-all"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl">
            <form onSubmit={handleCreateTemplate} className="bg-neutral-900/50 border border-white/10 rounded-lg p-8 space-y-6">
              <div>
                <label className="block text-xs font-light text-neutral-400 tracking-wider mb-2">
                  TEMPLATE NAME
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-800/50 border border-white/10 px-4 py-2 text-white text-sm outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g., Upper Body Hypertrophy"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-light text-neutral-400 tracking-wider mb-2">
                  DESCRIPTION
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-neutral-800/50 border border-white/10 px-4 py-2 text-white text-sm outline-none focus:border-red-500 transition-colors resize-none h-20"
                  placeholder="Describe this workout plan..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-light text-neutral-400 tracking-wider mb-2">
                    DIFFICULTY LEVEL
                  </label>
                  <select
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                    className="w-full bg-neutral-800/50 border border-white/10 px-4 py-2 text-white text-sm outline-none focus:border-red-500 transition-colors"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-light text-neutral-400 tracking-wider mb-2">
                    GOAL
                  </label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full bg-neutral-800/50 border border-white/10 px-4 py-2 text-white text-sm outline-none focus:border-red-500 transition-colors"
                  >
                    <option>General Fitness</option>
                    <option>Strength</option>
                    <option>Hypertrophy</option>
                    <option>Endurance</option>
                    <option>Weight Loss</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-light text-neutral-400 tracking-wider mb-2">
                  DURATION (WEEKS)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full bg-neutral-800/50 border border-white/10 px-4 py-2 text-white text-sm outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-red-500 text-white text-xs font-light tracking-wider hover:bg-red-600 transition-all"
              >
                CREATE TEMPLATE
              </button>
            </form>
          </div>
        )}

        {activeTab === 'edit' && selectedTemplate && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Template Info */}
            <div className="lg:col-span-2">
              <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-light text-white mb-4">{selectedTemplate.name}</h2>
                <p className="text-neutral-400 text-sm mb-4">{selectedTemplate.description}</p>
                <div className="grid grid-cols-3 gap-4 text-xs text-neutral-400">
                  <div>
                    <p className="text-white font-light mb-1">Difficulty</p>
                    <p>{selectedTemplate.difficultyLevel}</p>
                  </div>
                  <div>
                    <p className="text-white font-light mb-1">Goal</p>
                    <p>{selectedTemplate.goal}</p>
                  </div>
                  <div>
                    <p className="text-white font-light mb-1">Duration</p>
                    <p>{selectedTemplate.duration} weeks</p>
                  </div>
                </div>
              </div>

              {/* Days List */}
              <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-light text-white mb-4">Days & Exercises</h3>
                {selectedTemplate.weeks[0]?.days.length === 0 ? (
                  <p className="text-neutral-400 text-sm mb-4">No days added yet</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {selectedTemplate.weeks[0]?.days.map((day) => (
                      <div
                        key={day._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedDay?._id === day._id
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-white/10 hover:border-red-500/50'
                        }`}
                        onClick={() => setSelectedDay(day)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-white font-light">{day.day}</h4>
                            <p className="text-xs text-neutral-400">
                              {day.isRestDay ? 'Rest Day' : day.workoutName || `${day.day} Workout`}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDay(day._id);
                            }}
                            className="text-xs text-red-500 hover:text-red-400"
                          >
                            DELETE
                          </button>
                        </div>
                        {!day.isRestDay && day.exercises.length > 0 && (
                          <p className="text-xs text-neutral-400">
                            {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Day Form */}
                <form onSubmit={handleAddDay} className="space-y-3 pt-4 border-t border-white/10">
                  <p className="text-xs font-light text-neutral-400 tracking-wider">ADD NEW DAY</p>
                  <select
                    value={dayForm.day}
                    onChange={(e) => setDayForm({ ...dayForm, day: e.target.value })}
                    className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-xs outline-none focus:border-red-500 transition-colors"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Workout name (optional)"
                    value={dayForm.workoutName}
                    onChange={(e) => setDayForm({ ...dayForm, workoutName: e.target.value })}
                    className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-xs outline-none focus:border-red-500 transition-colors"
                  />

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dayForm.isRestDay}
                      onChange={(e) => setDayForm({ ...dayForm, isRestDay: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-neutral-400">Rest Day</span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 bg-red-500/20 border border-red-500/50 text-red-500 text-xs font-light hover:bg-red-500/30 transition-all"
                  >
                    ADD DAY
                  </button>
                </form>
              </div>
            </div>

            {/* Selected Day Exercises */}
            {selectedDay && (
              <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-light text-white mb-4">{selectedDay.day}</h3>

                {selectedDay.isRestDay ? (
                  <p className="text-neutral-400 text-sm mb-6">This is a rest day</p>
                ) : (
                  <>
                    {selectedDay.exercises.length > 0 && (
                      <div className="space-y-3 mb-6">
                        {selectedDay.exercises.map((exercise) => (
                          <div key={exercise._id} className="bg-neutral-800/50 border border-white/10 p-3 rounded">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-sm font-light text-white">{exercise.exerciseName}</h4>
                              <button
                                onClick={() => handleDeleteExercise(exercise._id)}
                                className="text-xs text-red-500 hover:text-red-400"
                              >
                                ✕
                              </button>
                            </div>
                            <p className="text-xs text-neutral-400">
                              {exercise.sets} sets × {exercise.reps} reps
                            </p>
                            {exercise.muscleGroup && (
                              <p className="text-xs text-neutral-400">{exercise.muscleGroup}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Exercise Form */}
                    <form onSubmit={handleAddExercise} className="space-y-3 pt-4 border-t border-white/10">
                      <p className="text-xs font-light text-neutral-400 tracking-wider">ADD EXERCISE</p>

                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={exerciseForm.exerciseName}
                        onChange={(e) => setExerciseForm({ ...exerciseForm, exerciseName: e.target.value })}
                        className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-xs outline-none focus:border-red-500 transition-colors"
                        required
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Sets"
                          min="1"
                          value={exerciseForm.sets}
                          onChange={(e) => setExerciseForm({ ...exerciseForm, sets: parseInt(e.target.value) })}
                          className="bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-xs outline-none focus:border-red-500 transition-colors"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Reps (e.g., 10-12)"
                          value={exerciseForm.reps}
                          onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })}
                          className="bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-xs outline-none focus:border-red-500 transition-colors"
                          required
                        />
                      </div>

                      <input
                        type="number"
                        placeholder="Rest time (seconds)"
                        min="0"
                        value={exerciseForm.restTime}
                        onChange={(e) => setExerciseForm({ ...exerciseForm, restTime: parseInt(e.target.value) })}
                        className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-xs outline-none focus:border-red-500 transition-colors"
                      />

                      <input
                        type="text"
                        placeholder="Muscle group"
                        value={exerciseForm.muscleGroup}
                        onChange={(e) => setExerciseForm({ ...exerciseForm, muscleGroup: e.target.value })}
                        className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-xs outline-none focus:border-red-500 transition-colors"
                      />

                      <input
                        type="text"
                        placeholder="Video URL (optional)"
                        value={exerciseForm.videoUrl}
                        onChange={(e) => setExerciseForm({ ...exerciseForm, videoUrl: e.target.value })}
                        className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-xs outline-none focus:border-red-500 transition-colors"
                      />

                      <textarea
                        placeholder="Notes (optional)"
                        value={exerciseForm.notes}
                        onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })}
                        className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-xs outline-none focus:border-red-500 transition-colors resize-none h-16"
                      />

                      <button
                        type="submit"
                        className="w-full py-2 px-3 bg-red-500/20 border border-red-500/50 text-red-500 text-xs font-light hover:bg-red-500/30 transition-all"
                      >
                        ADD EXERCISE
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWorkoutTemplates;