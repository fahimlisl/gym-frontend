import React, { useState, useEffect } from 'react';
import api from '../../api/axios.api';
import toast from 'react-hot-toast';

const UserWorkoutView = () => {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayDay, setTodayDay] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [expandedExercise, setExpandedExercise] = useState(null);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchWorkout();
  }, []);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/workout');
      setWorkout(res.data.data);

      if (res.data.data) {
        // Get today's day
        const today = new Date();
        const dayName = days[today.getDay()];
        setTodayDay(dayName);

        // Find today's workout in current week
        const currentWeek = res.data.data.weeks.find(
          w => w.weekNumber === res.data.data.currentWeek
        );
        
        if (currentWeek) {
          const todayWorkout = currentWeek.days.find(d => d.day === dayName);
          if (todayWorkout) {
            setSelectedDay(todayWorkout);
          } else {
            setSelectedDay(currentWeek.days[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin text-red-500 text-4xl mb-4">⟳</div>
          <p className="text-neutral-400 font-light">Loading your workout...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-neutral-400 text-lg mb-4">No workout plan assigned</p>
          <p className="text-neutral-500 text-sm">Contact your trainer to get started</p>
        </div>
      </div>
    );
  }

  const currentWeek = workout.weeks.find(w => w.weekNumber === workout.currentWeek);
  const weekDays = currentWeek?.days || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-light text-white mb-2 tracking-tight">
            Your Workout
          </h1>
          <p className="text-neutral-400 text-sm font-light">
            {workout.name}
          </p>
        </div>

        {/* Workout Info Card */}
        <div className="bg-neutral-900/50 border border-red-600/30 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs font-light text-neutral-400 tracking-wider mb-1">WEEK</p>
              <p className="text-2xl font-light text-white">
                {workout.currentWeek} / {workout.duration}
              </p>
            </div>
            <div>
              <p className="text-xs font-light text-neutral-400 tracking-wider mb-1">GOAL</p>
              <p className="text-sm font-light text-white">{workout.goal}</p>
            </div>
            <div>
              <p className="text-xs font-light text-neutral-400 tracking-wider mb-1">DIFFICULTY</p>
              <p className="text-sm font-light text-white">{workout.difficultyLevel}</p>
            </div>
            <div>
              <p className="text-xs font-light text-neutral-400 tracking-wider mb-1">STATUS</p>
              <p className={`text-sm font-light ${
                workout.status === 'Active' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {workout.status}
              </p>
            </div>
          </div>
        </div>

        {/* Days Navigation */}
        <div className="mb-8">
          <p className="text-xs font-light text-neutral-400 tracking-wider mb-3">
            WEEK {workout.currentWeek} - SELECT A DAY
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <button
                key={day._id}
                onClick={() => setSelectedDay(day)}
                className={`py-3 px-2 border rounded-lg transition-all text-center ${
                  selectedDay?._id === day._id
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-white/10 hover:border-red-500/50'
                } ${todayDay === day.day ? 'ring-2 ring-red-500/50' : ''}`}
              >
                <p className="text-[10px] font-light text-neutral-400">
                  {day.day.slice(0, 3)}
                </p>
                <p className={`text-xs font-light mt-1 ${
                  day.isRestDay
                    ? 'text-yellow-400'
                    : selectedDay?._id === day._id
                    ? 'text-red-500'
                    : 'text-white'
                }`}>
                  {day.isRestDay ? 'REST' : day.exercises.length}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Day Workout */}
        {selectedDay && (
          <div className="space-y-4">
            {/* Day Header */}
            <div className="bg-gradient-to-r from-red-600/10 to-transparent border border-red-600/30 rounded-lg p-4">
              <h2 className="text-2xl font-light text-white mb-1">
                {selectedDay.day}
                {todayDay === selectedDay.day && (
                  <span className="ml-2 text-sm text-red-500">• TODAY</span>
                )}
              </h2>
              <p className="text-sm text-neutral-400 font-light">
                {selectedDay.isRestDay ? 'Rest Day - Recovery Time' : selectedDay.workoutName || `${selectedDay.day} Workout`}
              </p>
            </div>

            {/* Rest Day Message */}
            {selectedDay.isRestDay ? (
              <div className="bg-neutral-900/50 border border-yellow-600/30 rounded-lg p-8 text-center">
                <p className="text-3xl mb-2">😌</p>
                <h3 className="text-xl font-light text-white mb-2">Rest & Recover</h3>
                <p className="text-neutral-400 text-sm">
                  Take it easy today. Recovery is just as important as training!
                </p>
                {selectedDay.notes && (
                  <p className="text-xs text-neutral-500 mt-4 italic">{selectedDay.notes}</p>
                )}
              </div>
            ) : selectedDay.exercises.length === 0 ? (
              <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-8 text-center">
                <p className="text-neutral-400">No exercises for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDay.exercises.map((exercise, idx) => (
                  <div
                    key={exercise._id}
                    className="bg-neutral-900/50 border border-white/10 rounded-lg overflow-hidden hover:border-red-500/30 transition-all"
                  >
                    {/* Exercise Header */}
                    <button
                      onClick={() =>
                        setExpandedExercise(
                          expandedExercise === exercise._id ? null : exercise._id
                        )
                      }
                      className="w-full p-4 text-left hover:bg-neutral-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-light text-neutral-400 tracking-wider mb-1">
                            EXERCISE {idx + 1}
                          </p>
                          <h3 className="text-lg font-light text-white mb-2">
                            {exercise.exerciseName}
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            <div>
                              <p className="text-[10px] text-neutral-500 uppercase">Sets</p>
                              <p className="text-sm font-light text-red-500">{exercise.sets}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-neutral-500 uppercase">Reps</p>
                              <p className="text-sm font-light text-red-500">{exercise.reps}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-neutral-500 uppercase">Rest</p>
                              <p className="text-sm font-light text-red-500">
                                {exercise.restTime}s
                              </p>
                            </div>
                            {exercise.muscleGroup && (
                              <div>
                                <p className="text-[10px] text-neutral-500 uppercase">Muscle</p>
                                <p className="text-sm font-light text-neutral-300">
                                  {exercise.muscleGroup}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-2xl ml-2">
                          {expandedExercise === exercise._id ? '▼' : '▶'}
                        </p>
                      </div>
                    </button>

                    {/* Exercise Details (Expanded) */}
                    {expandedExercise === exercise._id && (
                      <div className="border-t border-white/10 px-4 py-4 bg-neutral-800/20">
                        {exercise.notes && (
                          <div className="mb-4">
                            <p className="text-xs font-light text-neutral-400 tracking-wider mb-2">
                              NOTES
                            </p>
                            <p className="text-sm text-neutral-300 leading-relaxed">
                              {exercise.notes}
                            </p>
                          </div>
                        )}

                        {exercise.videoUrl && (
                          <div>
                            <p className="text-xs font-light text-neutral-400 tracking-wider mb-2">
                              VIDEO TUTORIAL
                            </p>
                            <a
                              href={exercise.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-2 border border-red-500/50 text-red-500 text-xs font-light hover:bg-red-500/10 transition-all rounded"
                            >
                              WATCH VIDEO →
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Day Notes */}
            {selectedDay.notes && !selectedDay.isRestDay && (
              <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-4">
                <p className="text-xs font-light text-neutral-400 tracking-wider mb-2">
                  DAY NOTES
                </p>
                <p className="text-sm text-neutral-300 font-light">
                  {selectedDay.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary Footer */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs font-light text-neutral-500 text-center">
            💪 You're crushing it! Stay consistent and you'll see amazing results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserWorkoutView;