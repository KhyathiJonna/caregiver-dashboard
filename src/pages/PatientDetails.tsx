import {
  ArrowLeft,
  Brain,
  Gamepad2,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Patient = {
  id: string;
  name: string;
  age: number;
  lastActivity: string;
  games: number;
  score: number;
  trend: "up" | "down";
};

type PatientDetailsProps = {
  patient: Patient;
  onBack: () => void;
};

function PatientDetails({
  patient,
  onBack,
}: PatientDetailsProps) {
  const performanceData = [
    { day: "Mon", score: 70 },
    { day: "Tue", score: 74 },
    { day: "Wed", score: 72 },
    { day: "Thu", score: 78 },
    { day: "Fri", score: 80 },
    { day: "Sat", score: 84 },
    { day: "Sun", score: patient.score },
  ];

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft size={18} />
        Back to Patients
      </button>

      {/* Patient Header */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Patient ID: {patient.id}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {patient.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Age: {patient.age} years
            </p>
          </div>

          <div
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              patient.trend === "up"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {patient.trend === "up"
              ? "Performance Improving"
              : "Performance Declining"}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Score */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Overall Score
            </p>

            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Brain size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {patient.score}%
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Current average performance
          </p>
        </div>

        {/* Games */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Games Played
            </p>

            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Gamepad2 size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {patient.games}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Games completed recently
          </p>
        </div>

        {/* Activity */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Last Activity
            </p>

            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <Clock size={22} />
            </div>
          </div>

          <p className="mt-3 text-lg font-bold text-slate-900">
            {patient.lastActivity}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Most recent app activity
          </p>
        </div>

        {/* Trend */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Weekly Trend
            </p>

            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <TrendingUp size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {patient.trend === "up" ? "+12%" : "-15%"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Compared with previous week
          </p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Performance Trend
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Cognitive game performance over the last 7 days
          </p>
        </div>

        <div className="h-80 w-full">
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
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Games Performance */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Game Performance
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Average score by cognitive activity
          </p>

          <div className="mt-5 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Memory Match</span>
                <span className="font-semibold">86%</span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: "86%" }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Pattern Recognition</span>
                <span className="font-semibold">78%</span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: "78%" }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Daily Recall</span>
                <span className="font-semibold">82%</span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: "82%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Patient Alerts
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Important observations requiring attention
          </p>

          <div className="mt-5 space-y-3">
            {patient.trend === "down" ? (
              <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertTriangle
                  className="mt-0.5 text-red-600"
                  size={20}
                />

                <div>
                  <p className="font-medium text-red-800">
                    Performance decline detected
                  </p>

                  <p className="mt-1 text-xs text-red-700">
                    Recent scores are lower than the previous
                    period.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <TrendingUp
                  className="mt-0.5 text-green-600"
                  size={20}
                />

                <div>
                  <p className="font-medium text-green-800">
                    Positive performance trend
                  </p>

                  <p className="mt-1 text-xs text-green-700">
                    Patient performance has improved recently.
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="font-medium text-slate-800">
                Reminder Status
              </p>

              <p className="mt-1 text-xs text-slate-500">
                No missed reminders reported today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDetails;
