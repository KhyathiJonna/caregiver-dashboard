import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  Gamepad2,
  Send,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = "https://caregiver-dashboard-phyh.onrender.com";

const GAME_NAMES: Record<string, string> = {
  "memory-match": "Memory Match",
  "pattern-recognition": "Pattern Recognition",
  "daily-recall": "Daily Recall",
};

function getGameName(type: string) {
  return GAME_NAMES[type] || type;
}

function getDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActivityPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [activities, setActivities] = useState<any[]>([]);

  const [gameType, setGameType] = useState("memory-match");
  const [score, setScore] = useState("80");
  const [accuracy, setAccuracy] = useState("80");
  const [duration, setDuration] = useState("5");
  const [difficulty, setDifficulty] = useState("Easy");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/patients`);

        if (!response.ok) {
          throw new Error("Failed to load patients");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setPatients(data);

          if (data.length > 0) {
            setSelectedPatientId(String(data[0].id));
          }
        } else {
          setPatients([]);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load patients.");
      } finally {
        setLoading(false);
      }
    }

    void loadPatients();
  }, []);

  useEffect(() => {
    async function loadActivities() {
      if (!selectedPatientId) {
        setActivities([]);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/patients/${selectedPatientId}/activities`,
        );

        if (!response.ok) {
          throw new Error("Failed to load activities");
        }

        const data = await response.json();

        const list = Array.isArray(data) ? data : [];

        list.sort(
          (a, b) =>
            new Date(b.playedAt).getTime() -
            new Date(a.playedAt).getTime(),
        );

        setActivities(list);
      } catch (err) {
        console.error(err);
        setActivities([]);
        setError("Unable to load activity data.");
      } finally {
        setLoading(false);
      }
    }

    void loadActivities();
  }, [selectedPatientId]);

  const selectedPatient = patients.find(
    (patient) => String(patient.id) === selectedPatientId,
  );

  const gamesPlayed = activities.length;

  const averageScore =
    gamesPlayed > 0
      ? activities.reduce(
          (total, item) => total + Number(item.score || 0),
          0,
        ) / gamesPlayed
      : 0;

  const accuracyItems = activities.filter(
    (item) =>
      item.accuracy !== undefined &&
      item.accuracy !== null,
  );

  const averageAccuracy =
    accuracyItems.length > 0
      ? accuracyItems.reduce(
          (total, item) =>
            total + Number(item.accuracy || 0),
          0,
        ) / accuracyItems.length
      : 0;

  const latestScore =
    activities.length > 0
      ? Number(activities[0].score || 0)
      : 0;

  const trend =
    activities.length < 2
      ? "neutral"
      : Number(activities[0].score || 0) >=
          Number(activities[1].score || 0)
        ? "up"
        : "down";

  const performanceData = useMemo(() => {
    return [...activities]
      .reverse()
      .map((item) => ({
        date: getDate(item.playedAt),
        score: Number(item.score || 0),
      }));
  }, [activities]);

  const gameScoreData = useMemo(() => {
    const groups: Record<
      string,
      { total: number; count: number }
    > = {};

    activities.forEach((item) => {
      const type = String(item.gameType);

      if (!groups[type]) {
        groups[type] = {
          total: 0,
          count: 0,
        };
      }

      groups[type].total += Number(item.score || 0);
      groups[type].count += 1;
    });

    return Object.keys(groups).map((type) => ({
      game: getGameName(type),
      score: Math.round(
        groups[type].total / groups[type].count,
      ),
    }));
  }, [activities]);

  const dailyData = useMemo(() => {
    const groups: Record<string, number> = {};

    activities.forEach((item) => {
      const date = getDate(item.playedAt);

      groups[date] = (groups[date] || 0) + 1;
    });

    return Object.keys(groups)
      .reverse()
      .map((date) => ({
        date,
        games: groups[date],
      }));
  }, [activities]);

  async function submitGame(event: any) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedPatientId) {
      setError("Please select a patient.");
      return;
    }

    const scoreNumber = Number(score);
    const accuracyNumber = Number(accuracy);
    const durationNumber = Number(duration);

    if (
      !Number.isFinite(scoreNumber) ||
      scoreNumber < 0 ||
      scoreNumber > 100
    ) {
      setError("Score must be between 0 and 100.");
      return;
    }

    if (
      !Number.isFinite(accuracyNumber) ||
      accuracyNumber < 0 ||
      accuracyNumber > 100
    ) {
      setError("Accuracy must be between 0 and 100.");
      return;
    }

    if (
      !Number.isFinite(durationNumber) ||
      durationNumber <= 0
    ) {
      setError("Duration must be greater than 0.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/api/activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: selectedPatientId,
          gameType,
          score: scoreNumber,
          accuracy: accuracyNumber,
          duration: durationNumber,
          difficulty,
          playedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit result");
      }

      setMessage("Game result submitted successfully.");

      const activityResponse = await fetch(
        `${API_URL}/api/patients/${selectedPatientId}/activities`,
      );

      if (activityResponse.ok) {
        const updatedData =
          await activityResponse.json();

        const updatedList = Array.isArray(updatedData)
          ? updatedData
          : [];

        updatedList.sort(
          (a, b) =>
            new Date(b.playedAt).getTime() -
            new Date(a.playedAt).getTime(),
        );

        setActivities(updatedList);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to submit game result.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Activity Analytics
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor cognitive game activity and performance trends.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3">
              <Brain className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Selected Patient
              </p>

              <p className="text-lg font-bold text-slate-800">
                {selectedPatient?.name ||
                  "No patient selected"}
              </p>
            </div>
          </div>

          <div className="w-full md:w-80">
            <label
              htmlFor="patient-select"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Choose Patient
            </label>

            <select
              id="patient-select"
              value={selectedPatientId}
              disabled={loading}
              onChange={(event) =>
                setSelectedPatientId(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {patients.map((patient) => (
                <option
                  key={patient.id}
                  value={patient.id}
                >
                  {patient.name} — ID {patient.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Gamepad2 className="h-7 w-7 text-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Games Played
          </p>

          <p className="text-3xl font-bold text-slate-800">
            {gamesPlayed}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Brain className="h-7 w-7 text-purple-600" />

          <p className="mt-4 text-sm text-slate-500">
            Average Score
          </p>

          <p className="text-3xl font-bold text-slate-800">
            {Math.round(averageScore)}%
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <TrendingUp className="h-7 w-7 text-green-600" />

          <p className="mt-4 text-sm text-slate-500">
            Average Accuracy
          </p>

          <p className="text-3xl font-bold text-slate-800">
            {Math.round(averageAccuracy)}%
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {trend === "down" ? (
            <TrendingDown className="h-7 w-7 text-red-600" />
          ) : (
            <TrendingUp className="h-7 w-7 text-green-600" />
          )}

          <p className="mt-4 text-sm text-slate-500">
            Latest Score
          </p>

          <p className="text-3xl font-bold text-slate-800">
            {Math.round(latestScore)}%
          </p>

          <p
            className={
              trend === "down"
                ? "text-sm font-semibold text-red-600"
                : "text-sm font-semibold text-green-600"
            }
          >
            {trend === "down"
              ? "Declining"
              : trend === "up"
                ? "Improving"
                : "Stable"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Send className="h-6 w-6 text-indigo-600" />

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Demo Game Result
            </h2>

            <p className="text-sm text-slate-500">
              Submit a sample game result.
            </p>
          </div>
        </div>

        <form
          onSubmit={submitGame}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <div>
            <label
              htmlFor="game-type"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Game
            </label>

            <select
              id="game-type"
              value={gameType}
              onChange={(event) =>
                setGameType(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            >
              <option value="memory-match">
                Memory Match
              </option>

              <option value="pattern-recognition">
                Pattern Recognition
              </option>

              <option value="daily-recall">
                Daily Recall
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="score"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Score
            </label>

            <input
              id="score"
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(event) =>
                setScore(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="accuracy"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Accuracy
            </label>

            <input
              id="accuracy"
              type="number"
              min="0"
              max="100"
              value={accuracy}
              onChange={(event) =>
                setAccuracy(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="duration"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Duration
            </label>

            <input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(event) =>
                setDuration(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="difficulty"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Difficulty
            </label>

            <select
              id="difficulty"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "Submit Game Result"}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">
            Performance Over Time
          </h2>

          <div className="mt-5 h-80">
            {performanceData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No activity data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Score (%)"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">
            Average Score by Game
          </h2>

          <div className="mt-5 h-80">
            {gameScoreData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No game data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={gameScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="game" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="score"
                    name="Average Score (%)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">
          Games Played by Day
        </h2>

        <div className="mt-5 h-80">
          {dailyData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No daily activity data available.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />

                <Bar
                  dataKey="games"
                  name="Games Played"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800">
            Recent Activity
          </h2>
        </div>

        {activities.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            No activity records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Game
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Score
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Accuracy
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Duration
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Difficulty
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {activities.slice(0, 10).map((item) => (
                  <tr key={String(item.id)}>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {getDate(item.playedAt)}
                      </p>

                      <p className="text-xs text-slate-400">
                        {getTime(item.playedAt)}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {getGameName(String(item.gameType))}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-indigo-600">
                      {Number(item.score || 0)}%
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {item.accuracy !== undefined &&
                      item.accuracy !== null
                        ? `${Number(item.accuracy)}%`
                        : "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {Number(item.duration || 0)} min
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {item.difficulty || "Easy"}
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
