import {
  Activity as ActivityIcon,
  Gamepad2,
  Brain,
  Clock,
} from "lucide-react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function Activity() {
  const dailyActivity = [
    { day: "Mon", games: 8 },
    { day: "Tue", games: 12 },
    { day: "Wed", games: 10 },
    { day: "Thu", games: 15 },
    { day: "Fri", games: 13 },
    { day: "Sat", games: 18 },
    { day: "Sun", games: 16 },
  ];

  const performanceData = [
    { day: "Mon", score: 68 },
    { day: "Tue", score: 72 },
    { day: "Wed", score: 70 },
    { day: "Thu", score: 76 },
    { day: "Fri", score: 79 },
    { day: "Sat", score: 83 },
    { day: "Sun", score: 81 },
  ];

  const gamePerformance = [
    {
      game: "Memory Match",
      score: 84,
    },
    {
      game: "Pattern Recognition",
      score: 76,
    },
    {
      game: "Daily Recall",
      score: 81,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Activity & Analytics
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Monitor cognitive activity and performance trends
          across your patients.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Games Today */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Games Today
            </p>

            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Gamepad2 size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            92
          </p>

          <p className="mt-1 text-xs text-green-600">
            +14% from yesterday
          </p>
        </div>

        {/* Active Patients */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Active Patients
            </p>

            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <ActivityIcon size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            18
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Patients active today
          </p>
        </div>

        {/* Average Score */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Average Score
            </p>

            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Brain size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            78%
          </p>

          <p className="mt-1 text-xs text-green-600">
            +6% this week
          </p>
        </div>

        {/* Time */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Avg. Session
            </p>

            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <Clock size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            12 min
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Average game session
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Games Played */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="font-semibold text-slate-900">
              Games Played
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Number of cognitive games completed each day
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="day" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="games"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="font-semibold text-slate-900">
              Performance Over Time
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Average cognitive performance across all patients
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="day" />

                <YAxis domain={[0, 100]} />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Game Comparison */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h3 className="font-semibold text-slate-900">
            Performance by Game Type
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Compare average performance across cognitive
            activities.
          </p>
        </div>

        <div className="h-72">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart data={gamePerformance}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="game" />

              <YAxis domain={[0, 100]} />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="score"
                name="Average Score"
                fill="#7c3aed"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Information */}
      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex gap-3">
          <ActivityIcon
            size={22}
            className="mt-0.5 text-blue-600"
          />

          <div>
            <h3 className="font-semibold text-blue-900">
              Activity Monitoring
            </h3>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              Activity data helps caregivers observe engagement,
              game completion, and changes in performance over
              time. These observations can support follow-up
              decisions and caregiver intervention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Activity;
