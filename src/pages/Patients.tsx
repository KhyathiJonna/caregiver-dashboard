import { useEffect, useState } from "react";
import {
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";

// -----------------------------
// TYPES
// -----------------------------

type Patient = {
  id: string;
  name: string;
  age: number;
  lastActivity: string;
  games: number;
  score: number;
  trend: "up" | "down";
};

type ActivityData = {
  patientId: string;
  gameType: string;
  score: number;
  accuracy: number;
  duration: number;
  difficulty: string;
  playedAt: string;
};

type PatientsProps = {
  onPatientSelect?: (patient: Patient) => void;
};

// -----------------------------
// COMPONENT
// -----------------------------

function Patients({
  onPatientSelect,
}: PatientsProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------
  // FETCH PATIENTS
  // -----------------------------

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        setError("");

        // Get patients
        const patientResponse = await fetch(
          "http://localhost:5000/api/patients"
        );

        if (!patientResponse.ok) {
          throw new Error("Failed to fetch patients");
        }

        const patientData: Patient[] =
          await patientResponse.json();

        // -----------------------------
        // GET ACTIVITIES FOR EACH PATIENT
        // -----------------------------

        const updatedPatients = await Promise.all(
          patientData.map(async (patient) => {
            try {
              const activityResponse = await fetch(
                `http://localhost:5000/api/patients/${patient.id}/activities`
              );

              if (!activityResponse.ok) {
                return patient;
              }

              const activities: ActivityData[] =
                await activityResponse.json();

              // -----------------------------
              // NO ACTIVITY
              // -----------------------------

              if (activities.length === 0) {
                return {
                  ...patient,
                  games: 0,
                };
              }

              // -----------------------------
              // SORT ACTIVITIES
              // -----------------------------

              const sortedActivities =
                [...activities].sort(
                  (a, b) =>
                    new Date(b.playedAt).getTime() -
                    new Date(a.playedAt).getTime()
                );

              // -----------------------------
              // LATEST ACTIVITY
              // -----------------------------

              const latestActivity =
                sortedActivities[0];

              // -----------------------------
              // AVERAGE SCORE
              // -----------------------------

              const averageScore = Math.round(
                activities.reduce(
                  (total, activity) =>
                    total + activity.score,
                  0
                ) / activities.length
              );

              // -----------------------------
              // CALCULATE TREND
              // -----------------------------

              let trend: "up" | "down" =
                patient.trend;

              if (activities.length >= 2) {
                const latestScore =
                  sortedActivities[0].score;

                const previousScore =
                  sortedActivities[1].score;

                trend =
                  latestScore >= previousScore
                    ? "up"
                    : "down";
              }

              // -----------------------------
              // FORMAT LAST ACTIVITY
              // -----------------------------

              const activityDate = new Date(
                latestActivity.playedAt
              );

              const now = new Date();

              const isToday =
                activityDate.getDate() === now.getDate() &&
                activityDate.getMonth() === now.getMonth() &&
                activityDate.getFullYear() ===
                  now.getFullYear();

              const formattedTime =
                activityDate.toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

              const formattedDate =
                activityDate.toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                  }
                );

              const lastActivity = isToday
                ? `Today, ${formattedTime}`
                : `${formattedDate}, ${formattedTime}`;

              // -----------------------------
              // RETURN UPDATED PATIENT
              // -----------------------------

              return {
                ...patient,

                // Dynamic number of games
                games: activities.length,

                // Average score from activities
                score: averageScore,

                // Dynamic performance trend
                trend,

                // Latest activity
                lastActivity,
              };
            } catch {
              // If activity request fails,
              // keep original patient data
              return patient;
            }
          })
        );

        setPatients(updatedPatients);
        setLoading(false);
      } catch {
        setError(
          "Unable to connect to the backend."
        );
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  // -----------------------------
  // STATISTICS
  // -----------------------------

  const totalPatients = patients.length;

  const activeToday = patients.filter(
    (patient) =>
      patient.lastActivity
        .toLowerCase()
        .startsWith("today")
  ).length;

  const averageScore =
    patients.length > 0
      ? Math.round(
          patients.reduce(
            (total, patient) =>
              total + patient.score,
            0
          ) / patients.length
        )
      : 0;

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="p-6">
      {/* PAGE HEADER */}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Patients
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          View and monitor your patients' cognitive activity.
        </p>
      </div>

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* TOTAL PATIENTS */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total Patients
            </p>

            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Users size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {loading ? "..." : totalPatients}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Patients connected to dashboard
          </p>
        </div>

        {/* ACTIVE TODAY */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Active Today
            </p>

            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <Activity size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {loading ? "..." : activeToday}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Patients used the app today
          </p>
        </div>

        {/* AVERAGE SCORE */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Average Score
            </p>

            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <TrendingUp size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {loading ? "..." : `${averageScore}%`}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Overall cognitive game score
          </p>
        </div>
      </div>

      {/* PATIENT TABLE */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="border-b border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900">
            Patient List
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Click on a patient to view detailed performance.
          </p>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading patients...
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="p-8 text-center text-sm text-red-600">
            {error}

            <p className="mt-2 text-xs text-slate-500">
              Make sure the backend server is running on port 5000.
            </p>
          </div>
        )}

        {/* TABLE */}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              {/* HEADER */}

              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Patient
                  </th>

                  <th className="px-5 py-3">
                    Age
                  </th>

                  <th className="px-5 py-3">
                    Last Activity
                  </th>

                  <th className="px-5 py-3">
                    Games
                  </th>

                  <th className="px-5 py-3">
                    Score
                  </th>

                  <th className="px-5 py-3">
                    Trend
                  </th>

                  <th className="px-5 py-3">
                    Details
                  </th>
                </tr>
              </thead>

              {/* BODY */}

              <tbody className="divide-y divide-slate-100">

                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() =>
                      onPatientSelect?.(patient)
                    }
                    className="cursor-pointer transition hover:bg-blue-50"
                  >

                    {/* PATIENT */}

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {patient.name}
                      </div>

                      <div className="text-xs text-slate-400">
                        ID: {patient.id}
                      </div>
                    </td>

                    {/* AGE */}

                    <td className="px-5 py-4">
                      {patient.age}
                    </td>

                    {/* LAST ACTIVITY */}

                    <td className="px-5 py-4 text-slate-500">
                      {patient.lastActivity}
                    </td>

                    {/* GAMES */}

                    <td className="px-5 py-4">
                      {patient.games}
                    </td>

                    {/* SCORE */}

                    <td className="px-5 py-4">
                      <span
                        className={`font-semibold ${
                          patient.score >= 75
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {patient.score}%
                      </span>
                    </td>

                    {/* TREND */}

                    <td className="px-5 py-4">
                      {patient.trend === "up" ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp size={18} />

                          <span className="text-xs">
                            Improving
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendingDown size={18} />

                          <span className="text-xs">
                            Declining
                          </span>
                        </div>
                      )}
                    </td>

                    {/* DETAILS */}

                    <td className="px-5 py-4">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();

                          onPatientSelect?.(patient);
                        }}
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                      >
                        View

                        <ArrowRight size={14} />
                      </button>
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

export default Patients;
