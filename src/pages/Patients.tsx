import {
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";

type Patient = {
  id: string;
  name: string;
  age: number;
  lastActivity: string;
  games: number;
  score: number;
  trend: "up" | "down";
};

type PatientsProps = {
  onPatientSelect?: (patient: Patient) => void;
};

function Patients({ onPatientSelect }: PatientsProps) {
  const patients: Patient[] = [
    {
      id: "1024",
      name: "Patient #1024",
      age: 72,
      lastActivity: "Today, 10:30 AM",
      games: 3,
      score: 82,
      trend: "up",
    },
    {
      id: "1018",
      name: "Patient #1018",
      age: 68,
      lastActivity: "Yesterday, 4:15 PM",
      games: 2,
      score: 64,
      trend: "down",
    },
    {
      id: "1007",
      name: "Patient #1007",
      age: 75,
      lastActivity: "Today, 9:45 AM",
      games: 4,
      score: 88,
      trend: "up",
    },
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Patients
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          View and monitor your patients' cognitive activity.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Patients */}
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
            24
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Registered patients
          </p>
        </div>

        {/* Active Today */}
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
            18
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Patients used the app today
          </p>
        </div>

        {/* Average Score */}
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
            78%
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Overall cognitive game score
          </p>
        </div>
      </div>

      {/* Patient Table */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900">
            Patient List
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Click on a patient to view detailed performance.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Age</th>
                <th className="px-5 py-3">Last Activity</th>
                <th className="px-5 py-3">Games</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Trend</th>
                <th className="px-5 py-3">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => onPatientSelect?.(patient)}
                  className="cursor-pointer transition hover:bg-blue-50"
                >
                  {/* Patient */}
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">
                      {patient.name}
                    </div>

                    <div className="text-xs text-slate-400">
                      ID: {patient.id}
                    </div>
                  </td>

                  {/* Age */}
                  <td className="px-5 py-4">
                    {patient.age}
                  </td>

                  {/* Last Activity */}
                  <td className="px-5 py-4 text-slate-500">
                    {patient.lastActivity}
                  </td>

                  {/* Games */}
                  <td className="px-5 py-4">
                    {patient.games}
                  </td>

                  {/* Score */}
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

                  {/* Trend */}
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

                  {/* Details */}
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
      </div>
    </div>
  );
}

export default Patients;
