import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Brain,
  Calendar,
  Clock,
  Gamepad2,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = "https://caregiver-dashboard-phyh.onrender.com";

type Patient = {
  id: string;
  name: string;
  age: number;
  language?: string;
  lastActivity: string;
  games: number;
  score: number;
  trend: "up" | "down";
};

type Activity = {
  id?: string;
  patientId: string;
  gameType: string;
  score: number;
  accuracy?: number;
  duration?: number;
  difficulty?: string;
  playedAt: string;
};

type PatientDetailsProps = {
  patient: Patient;
  onBack?: () => void;
};

function PatientDetails({
  patient,
  onBack,
}: PatientDetailsProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/patients/${patient.id}/activities`
        );

        if (!response.ok) {
          throw new Error("Failed to load patient activity");
        }

        const data: Activity[] = await response.json();

        setActivities(data);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load patient activity data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [patient.id]);

  const sortedActivities = useMemo(() => {
    return [...activities].sort(
      (a, b) =>
        new Date(a.playedAt).getTime() -
        new Date(b.playedAt).getTime()
    );
  }, [activities]);

  const averageScore = useMemo(() => {
    if (activities.length === 0) {
      return 0;
    }

    const total = activities.reduce(
      (sum, activity) => sum + Number(activity.score),
      0
    );

    return Math.round(total / activities.length);
  }, [activities]);

  const latestScore = useMemo(() => {
    if (sortedActivities.length === 0) {
      return patient.score;
    }

    return Number(
      sortedActivities[sortedActivities.length - 1].score
    );
  }, [sortedActivities, patient.score]);

  const previousScore = useMemo(() => {
    if (sortedActivities.length < 2) {
      return null;
    }

    return Number(
      sortedActivities[sortedActivities.length - 2].score
    );
  }, [sortedActivities]);

  const scoreChange = useMemo(() => {
    if (
      previousScore === null ||
      previousScore === 0
    ) {
      return 0;
    }

    return Math.round(
      ((latestScore - previousScore) /
        previousScore) *
        100
    );
  }, [latestScore, previousScore]);

  const chartData = useMemo(() => {
    return sortedActivities.map(
      (activity, index) => ({
        name: `Game ${index + 1}`,
        score: Number(activity.score),
        date: new Date(
          activity.playedAt
        ).toLocaleDateString(),
      })
    );
  }, [sortedActivities]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString();
  };

  const formatGameName = (gameType: string) => {
    return gameType
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Patient Details
            </h1>

            <p className="text-sm text-slate-500">
              Cognitive activity and performance overview
            </p>
          </div>
        </div>
      </div>

      {/* Patient Profile */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <User size={30} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {patient.name}
              </h2>

              <p className="text-sm text-slate-500">
                Patient ID: {patient.id}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Age: {patient.age} • Language:{" "}
                {patient.language}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Last activity
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {patient.lastActivity}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Games */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Games Played
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {activities.length || patient.games}
              </p>
            </div>

            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <Gamepad2 size={24} />
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Average Score
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {averageScore || patient.score}
              </p>
            </div>

            <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
              <Brain size={24} />
            </div>
          </div>
        </div>

        {/* Latest Score */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Latest Score
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {latestScore}
              </p>
            </div>

            <div
              className={`rounded-xl p-3 ${
                patient.trend === "up"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {patient.trend === "up" ? (
                <TrendingUp size={24} />
              ) : (
                <TrendingDown size={24} />
              )}
            </div>
          </div>
        </div>

        {/* Score Change */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Recent Change
              </p>

              <p
                className={`mt-2 text-3xl font-bold ${
                  scoreChange >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {scoreChange >= 0 ? "+" : ""}
                {scoreChange}%
              </p>
            </div>

            <div
              className={`rounded-xl p-3 ${
                scoreChange >= 0
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {scoreChange >= 0 ? (
                <TrendingUp size={24} />
              ) : (
                <TrendingDown size={24} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Performance Over Time
          </h2>

          <p className="text-sm text-slate-500">
            Cognitive game scores across recent activities
          </p>
        </div>

        {loading ? (
          <div className="flex h-72 items-center justify-center text-slate-500">
            Loading performance data...
          </div>
        ) : error ? (
          <div className="flex h-72 items-center justify-center text-red-500">
            {error}
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-slate-500">
            No activity data available.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="name" />

                <YAxis
                  domain={[0, 100]}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Activity History */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Activity History
          </h2>

          <p className="text-sm text-slate-500">
            Recent cognitive game sessions
          </p>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-500">
            Loading activity history...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            No activity recorded for this patient.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Game
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Score
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Accuracy
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Duration
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Difficulty
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Played At
                  </th>
                </tr>
              </thead>

              <tbody>
                {[...activities]
                  .sort(
                    (a, b) =>
                      new Date(
                        b.playedAt
                      ).getTime() -
                      new Date(
                        a.playedAt
                      ).getTime()
                  )
                  .map((activity, index) => (
                    <tr
                      key={
                        activity.id ??
                        `${activity.playedAt}-${index}`
                      }
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Gamepad2
                            size={18}
                            className="text-blue-600"
                          />

                          <span className="font-medium text-slate-800">
                            {formatGameName(
                              activity.gameType
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-900">
                          {activity.score}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {activity.accuracy !==
                        undefined
                          ? `${activity.accuracy}%`
                          : "—"}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock size={15} />

                          {activity.duration !==
                          undefined
                            ? `${activity.duration} min`
                            : "—"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {activity.difficulty ??
                            "Standard"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Calendar size={15} />

                          {formatDate(
                            activity.playedAt
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDetails;

