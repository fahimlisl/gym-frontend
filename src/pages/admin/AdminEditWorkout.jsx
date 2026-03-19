import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios.api';
import toast from 'react-hot-toast';

const AdminEditWorkout = () => {
  const { workoutId } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);

  const [exerciseForm, setExerciseForm] = useState({
    exerciseName: '',
    sets: 0,
    reps: '',
    restTime: 0,
    notes: '',
    videoUrl: '',
    muscleGroup: '',
  });

  useEffect(() => {
    fetchWorkout();
  }, [workoutId]);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/workout/${workoutId}`);
      setWorkout(res.data.data);
      
      const firstWeek = res.data.data.weeks[0];
      setSelectedWeek(firstWeek.weekNumber);
      
      const firstDay = firstWeek.days[0];
      if (firstDay) setSelectedDay(firstDay._id);
    } catch (err) {
      toast.error('Failed to load workout');
      navigate('/admin/members');
    } finally {
      setLoading(false);
    }
  };

  const currentWeek = workout?.weeks.find(w => w.weekNumber === selectedWeek);
  const currentDay = currentWeek?.days.find(d => d._id === selectedDay);

  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise._id);
    setEditingExercise(exercise._id);
    setExerciseForm({
      exerciseName: exercise.exerciseName,
      sets: exercise.sets,
      reps: exercise.reps,
      restTime: exercise.restTime || 60,
      notes: exercise.notes || '',
      videoUrl: exercise.videoUrl || '',
      muscleGroup: exercise.muscleGroup || '',
    });
  };

  const handleUpdateExercise = async () => {
    if (!exerciseForm.exerciseName || !exerciseForm.sets || !exerciseForm.reps) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const res = await api.put(
        `/admin/workout/${workoutId}/week/${selectedWeek}/day/${selectedDay}/exercise/${editingExercise}`,
        exerciseForm
      );
      setWorkout(res.data.data);
      toast.success('Exercise updated successfully');
      setEditingExercise(null);
      setSelectedExercise(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update exercise');
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm('Delete this exercise?')) return;

    try {
      const res = await api.delete(
        `/admin/workout/${workoutId}/week/${selectedWeek}/day/${selectedDay}/exercise/${exerciseId}`
      );
      setWorkout(res.data.data);
      setEditingExercise(null);
      setSelectedExercise(null);
      toast.success('Exercise deleted successfully');
    } catch (err) {
      toast.error('Failed to delete exercise');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await api.put(`/admin/workout/${workoutId}/status`, {
        status: newStatus,
      });
      setWorkout(res.data.data);
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateCurrentWeek = async (newWeek) => {
    try {
      const res = await api.put(`/admin/workout/${workoutId}/current-week`, {
        currentWeek: newWeek,
      });
      setWorkout(res.data.data);
      toast.success(`Current week updated to ${newWeek}`);
    } catch (err) {
      toast.error('Failed to update current week');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-400 tracking-widest">
        <div className="animate-spin text-red-500 text-4xl mb-4">⟳</div>
        LOADING WORKOUT...
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="p-8 text-red-500 tracking-widest">WORKOUT NOT FOUND</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 text-sm font-semibold"
        >
          <span className="text-lg">←</span>
          BACK
        </button>
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-light text-white mb-2 tracking-tight">
            {workout.name}
          </h1>
          <p className="text-neutral-400 text-sm font-light">
            Edit and customize this workout plan
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-4 mb-6">
              <p className="text-xs font-light text-neutral-400 tracking-wider mb-3">STATUS</p>
              <select
                value={workout.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-xs outline-none focus:border-red-500 transition-colors mb-3"
              >
                <option>Active</option>
                <option>Paused</option>
                <option>Completed</option>
              </select>

              <div className="text-xs text-neutral-400 space-y-2">
                <p>
                  <span className="text-white">Duration:</span> {workout.duration} weeks
                </p>
                <p>
                  <span className="text-white">Current Week:</span> {workout.currentWeek}
                </p>
                <p>
                  <span className="text-white">Goal:</span> {workout.goal}
                </p>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-4">
              <p className="text-xs font-light text-neutral-400 tracking-wider mb-3">WEEKS</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {workout.weeks.map((week) => (
                  <button
                    key={week.weekNumber}
                    onClick={() => {
                      setSelectedWeek(week.weekNumber);
                      setSelectedDay(week.days[0]?._id || null);
                      setEditingExercise(null);
                    }}
                    className={`w-full text-left py-2 px-3 border rounded text-xs transition-all ${
                      selectedWeek === week.weekNumber
                        ? 'border-red-500 bg-red-500/10 text-white'
                        : 'border-white/10 hover:border-red-500/50 text-neutral-400'
                    }`}
                  >
                    <div className="font-light">{week.weekName}</div>
                    <div className="text-[10px] text-neutral-500">
                      {week.days.length} days
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {currentWeek ? (
              <div className="space-y-6">
                <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-6">
                  <h2 className="text-2xl font-light text-white mb-2">
                    {currentWeek.weekName}
                  </h2>
                  <p className="text-neutral-400 text-sm mb-4">
                    Select a day to view and edit exercises
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {currentWeek.days.map((day) => (
                      <button
                        key={day._id}
                        onClick={() => {
                          setSelectedDay(day._id);
                          setEditingExercise(null);
                          setSelectedExercise(null);
                        }}
                        className={`py-2 px-3 border rounded text-xs transition-all ${
                          selectedDay === day._id
                            ? 'border-red-500 bg-red-500/10 text-white'
                            : 'border-white/10 hover:border-red-500/50 text-neutral-400'
                        }`}
                      >
                        <div className="font-light">{day.day}</div>
                        {!day.isRestDay && day.exercises.length > 0 && (
                          <div className="text-[10px] mt-1">
                            {day.exercises.length} ex.
                          </div>
                        )}
                        {day.isRestDay && (
                          <div className="text-[10px] mt-1 text-yellow-400">Rest</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {currentDay && (
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-6">
                      <h3 className="text-xl font-light text-white mb-4">
                        {currentDay.day}
                        {currentDay.isRestDay && ' - Rest Day'}
                      </h3>

                      {currentDay.isRestDay ? (
                        <p className="text-neutral-400 text-sm">This is a rest day</p>
                      ) : currentDay.exercises.length === 0 ? (
                        <p className="text-neutral-400 text-sm">No exercises added</p>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {currentDay.exercises.map((exercise) => (
                            <button
                              key={exercise._id}
                              onClick={() => handleSelectExercise(exercise)}
                              className={`w-full text-left p-3 border rounded transition-all ${
                                selectedExercise === exercise._id
                                  ? 'border-red-500 bg-red-500/10'
                                  : 'border-white/10 hover:border-red-500/50'
                              }`}
                            >
                              <h4 className="text-white font-light mb-1">
                                {exercise.exerciseName}
                              </h4>
                              <p className="text-xs text-neutral-400">
                                {exercise.sets} sets × {exercise.reps} reps
                              </p>
                              {exercise.muscleGroup && (
                                <p className="text-xs text-neutral-500">
                                  {exercise.muscleGroup}
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {editingExercise && (
                      <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-6">
                        <h3 className="text-xl font-light text-white mb-6">
                          EDIT EXERCISE
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-light text-neutral-400 tracking-wider mb-2">
                              EXERCISE NAME
                            </label>
                            <input
                              type="text"
                              value={exerciseForm.exerciseName}
                              onChange={(e) =>
                                setExerciseForm({
                                  ...exerciseForm,
                                  exerciseName: e.target.value,
                                })
                              }
                              className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-red-500 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-light text-neutral-400 tracking-wider mb-2">
                              SETS
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={exerciseForm.sets}
                              onChange={(e) =>
                                setExerciseForm({
                                  ...exerciseForm,
                                  sets: parseInt(e.target.value),
                                })
                              }
                              className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-red-500 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-light text-neutral-400 tracking-wider mb-2">
                              REPS
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 10-12, 8, 15-20"
                              value={exerciseForm.reps}
                              onChange={(e) =>
                                setExerciseForm({
                                  ...exerciseForm,
                                  reps: e.target.value,
                                })
                              }
                              className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-red-500 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-light text-neutral-400 tracking-wider mb-2">
                              REST TIME (seconds)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={exerciseForm.restTime}
                              onChange={(e) =>
                                setExerciseForm({
                                  ...exerciseForm,
                                  restTime: parseInt(e.target.value),
                                })
                              }
                              className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-red-500 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-light text-neutral-400 tracking-wider mb-2">
                              MUSCLE GROUP
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Chest, Back, Legs"
                              value={exerciseForm.muscleGroup}
                              onChange={(e) =>
                                setExerciseForm({
                                  ...exerciseForm,
                                  muscleGroup: e.target.value,
                                })
                              }
                              className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-red-500 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-light text-neutral-400 tracking-wider mb-2">
                              VIDEO URL
                            </label>
                            <input
                              type="text"
                              placeholder="YouTube or video link"
                              value={exerciseForm.videoUrl}
                              onChange={(e) =>
                                setExerciseForm({
                                  ...exerciseForm,
                                  videoUrl: e.target.value,
                                })
                              }
                              className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-red-500 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-light text-neutral-400 tracking-wider mb-2">
                              NOTES
                            </label>
                            <textarea
                              placeholder="Any additional notes..."
                              value={exerciseForm.notes}
                              onChange={(e) =>
                                setExerciseForm({
                                  ...exerciseForm,
                                  notes: e.target.value,
                                })
                              }
                              className="w-full bg-neutral-800/50 border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-red-500 transition-colors resize-none h-20"
                            />
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-white/10">
                            <button
                              onClick={() => {
                                setEditingExercise(null);
                                setSelectedExercise(null);
                              }}
                              className="flex-1 py-2 px-3 border border-white/10 text-white text-xs font-light hover:border-white/30 transition-all"
                            >
                              CANCEL
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteExercise(editingExercise)
                              }
                              className="py-2 px-3 border border-red-500/30 text-red-500 text-xs font-light hover:bg-red-500/10 transition-all"
                            >
                              DELETE
                            </button>
                            <button
                              onClick={handleUpdateExercise}
                              className="flex-1 py-2 px-3 bg-red-500 text-white text-xs font-light hover:bg-red-600 transition-all"
                            >
                              SAVE
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-neutral-900/50 border border-white/10 rounded-lg">
                <p className="text-neutral-400">Select a week to view and edit exercises</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditWorkout;