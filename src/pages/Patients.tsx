import { useEffect, useState } from "react";
import {
  Activity,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  AlertTriangle,
} from "lucide-react";

const API_URL =
  "https://caregiver-dashboard-phyh.onrender.com";

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

type ActivityData = {
  id?: string;
  patientId: string;
  gameType: string;
  score: number;
  accuracy?: number;
  duration?: number;
  difficulty?: string;
  playedAt: string;
};

export default function Patients() {
  const [patients, setPatients] = useState<
    Patient[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

  /* =====================================================
     LOAD PATIENTS
  ===================================================== */

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/patients`
      );

      if (!response.ok) {
        throw new Error(
          `Patients API returned ${response.status}`
        );
      }

      const patientData: Patient[] =
        await response.json();

      /* -----------------------------------------------
         Load activities for every patient
      ------------------------------------------------ */

      const patientsWithData =
        await Promise.all(
          patientData.map(
            async (patient) => {
              try {
                const activityResponse =
                  await fetch(
                    `${API_URL}/api/patients/${patient.id}/activities`
                  );

                if (!activityResponse.ok) {
                  return patient;
                }

                const activities: ActivityData[] =
                  await activityResponse.json();

                if (activities.length === 0) {
                  return {
                    ...patient,
                    games: 0,
                  };
                }

                /* Sort newest first */

                const sortedActivities =
                  [...activities].sort(
                    (a, b) =>
                      new Date(
                        b.playedAt
                      ).getTime() -
                      new Date(
                        a.playedAt
                      ).getTime()
                  );

                /* Average score */

                const averageScore =
                  Math.round(
                    activities.reduce(
                      (sum, activity) =>
                        sum +
                        Number(
                          activity.score
                        ),
                      0
                    ) /
                      activities.length
                  );

                /* Trend */

                let trend:
                  | "up"
                  | "down" =
                  patient.trend;

                if (
                  sortedActivities.length >=
                  2
                ) {
                  trend =
                    sortedActivities[0]
                      .score >=
                    sortedActivities[1]
                      .score
                      ? "up"
                      : "down";
                }

                /* Last activity */

                const latestActivity =
                  sortedActivities[0];

                const latestDate =
                  new Date(
                    latestActivity.playedAt
                  );

                const now = new Date();

                const isToday =
                  latestDate.getDate() ===
                    now.getDate() &&
                  latestDate.getMonth() ===
                    now.getMonth() &&
                  latestDate.getFullYear() ===
                    now.getFullYear();

                const time =
                  latestDate.toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                const date =
                  latestDate.toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                    }
                  );

                return {
                  ...patient,
                  games:
                    activities.length,
                  score: averageScore,
                  trend,
                  lastActivity: isToday
                    ? `Today, ${time}`
                    : `${date}, ${time}`,
                };
              } catch {
                return patient;
              }
            }
          )
        );

      setPatients(
        patientsWithData
      );
    } catch (err) {
      console.error(
        "Unable to connect to backend:",
        err
      );

      setError(
        "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOAD ON PAGE OPEN
  ===================================================== */

  useEffect(() => {
    loadPatients();

    const interval =
      setInterval(
        loadPatients,
        10000
      );

    return () =>
      clearInterval(interval);
  }, []);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalPatients =
    patients.length;

  const activeToday =
    patients.filter((patient) =>
      patient.lastActivity
        .toLowerCase()
        .startsWith("today")
    ).length;

  const averageScore =
    patients.length > 0
      ? Math.round(
          patients.reduce(
            (sum, patient) =>
              sum + Number(
                patient.score
              ),
            0
          ) / patients.length
        )
      : 0;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading patients...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={22}
              className="text-red-600"
            />

            <div>
              <h2 className="text-lg font-semibold text-red-700">
                Backend Connection Error
              </h2>

              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>

              <p className="mt-3 text-xs text-slate-600">
                Backend:
              </p>

              <p className="mt-1 break-all text-xs font-medium text-slate-800">
                {API_URL}
              </p>

              <button
                onClick={loadPatients}
                className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Patients
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and monitor your patients'
          cognitive activity.
        </p>
      </div>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Patients */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Patients
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalPatients}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Patients connected to dashboard
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Users size={22} />
            </div>
          </div>
        </div>

        {/* Active Today */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Active Today
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {activeToday}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Patients used the app today
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <Activity size={22} />
            </div>
          </div>
        </div>

        {/* Average Score */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Average Score
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {averageScore}%
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Overall cognitive game score
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <TrendingUp size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          PATIENT LIST
      ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Patient List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Click on a patient to view detailed
            performance.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">
                  Patient
                </th>

                <th className="px-5 py-3">
                  Age
                </th>

                <th className="px-5 py-3">
                  Language
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
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {patients.map(
                (patient) => (
                  <tr
                    key={patient.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Patient */}

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {patient.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {patient.id}
                      </p>
                    </td>

                    {/* Age */}

                    <td className="px-5 py-4 text-slate-600">
                      {patient.age}
                    </td>

                    {/* Language */}

                    <td className="px-5 py-4 text-slate-600">
                      {patient.language ||
                        "—"}
                    </td>

                    {/* Last Activity */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock
                          size={15}
                        />

                        <span>
                          {
                            patient.lastActivity
                          }
                        </span>
                      </div>
                    </td>

                    {/* Games */}

                    <td className="px-5 py-4 font-medium text-slate-700">
                      {patient.games}
                    </td>

                    {/* Score */}

                    <td className="px-5 py-4">
                      <span
                        className={`font-semibold ${
                          patient.score >=
                          75
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {patient.score}%
                      </span>
                    </td>

                    {/* Trend */}

                    <td className="px-5 py-4">
                      {patient.trend ===
                      "up" ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp
                            size={17}
                          />

                          <span className="text-xs font-medium">
                            Improving
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendingDown
                            size={17}
                          />

                          <span className="text-xs font-medium">
                            Declining
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Action */}

                    <td className="px-5 py-4">
                      <button
                        onClick={() =>
                          setSelectedPatient(
                            patient
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                      >
                        <Eye
                          size={15}
                        />

                        View
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Empty state */}

        {patients.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Users
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-slate-700">
              No patients found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              No patient records are currently available.
            </p>
          </div>
        )}
      </div>

      {/* =================================================
          SELECTED PATIENT PREVIEW
      ================================================= */}

      {selectedPatient && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                Selected Patient
              </p>

              <h3 className="mt-1 text-lg font-semibold text-blue-900">
                {selectedPatient.name}
              </h3>

              <p className="mt-1 text-sm text-blue-700">
                ID: {selectedPatient.id}
                {" • "}
                Age: {selectedPatient.age}
                {" • "}
                Score:{" "}
                {selectedPatient.score}%
              </p>
            </div>

            <button
              onClick={() =>
                setSelectedPatient(
                  null
                )
              }
              className="w-fit rounded-lg border border-blue-200 bg-white px-4 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
