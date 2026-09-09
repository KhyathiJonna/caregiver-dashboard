import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  LayoutDashboard,
  Menu,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
  X,
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

import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import ActivityPage from "./pages/Activity";
import Alerts from "./pages/Alerts";
import SettingsPage from "./pages/Settings";

/* =========================================================
   BACKEND
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://caregiver-dashboard-phyh.onrender.com";

/* =========================================================
   TYPES
========================================================= */

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

type AlertData = {
  id: string;
  patientId: string;
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  resolved: boolean;
  createdAt?: string;
};

/* =========================================================
   APP
========================================================= */

function App() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState("Dashboard");

  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [activities, setActivities] =
    useState<ActivityData[]>([]);

  const [alerts, setAlerts] =
    useState<AlertData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setError("");

        /* -----------------------------------------------
           PATIENTS
        ------------------------------------------------ */

        const patientsResponse =
          await fetch(
            `${API_URL}/api/patients`
          );

        if (!patientsResponse.ok) {
          throw new Error(
            "Unable to fetch patients"
          );
        }

        const patientList: Patient[] =
          await patientsResponse.json();

        /* -----------------------------------------------
           ACTIVITIES
        ------------------------------------------------ */

        const activityResponses =
          await Promise.all(
            patientList.map(
              async (patient) => {
                try {
                  const response =
                    await fetch(
                      `${API_URL}/api/patients/${patient.id}/activities`
                    );

                  if (!response.ok) {
                    return [];
                  }

                  return (await response.json()) as ActivityData[];
                } catch {
                  return [];
                }
              }
            )
          );

        const allActivities =
          activityResponses.flat();

        /* -----------------------------------------------
           UPDATE PATIENT INFORMATION
        ------------------------------------------------ */

        const processedPatients =
          patientList.map((patient) => {
            const patientActivities =
              allActivities.filter(
                (activity) =>
                  activity.patientId ===
                  patient.id
              );

            if (
              patientActivities.length === 0
            ) {
              return {
                ...patient,
                games: 0,
              };
            }

            const sorted =
              [...patientActivities].sort(
                (a, b) =>
                  new Date(
                    b.playedAt
                  ).getTime() -
                  new Date(
                    a.playedAt
                  ).getTime()
              );

            const latest =
              sorted[0];

            const averageScore =
              Math.round(
                patientActivities.reduce(
                  (sum, activity) =>
                    sum + Number(
                      activity.score
                    ),
                  0
                ) /
                  patientActivities.length
              );

            let trend: "up" | "down" =
              patient.trend;

            if (sorted.length >= 2) {
              trend =
                sorted[0].score >=
                sorted[1].score
                  ? "up"
                  : "down";
            }

            const date =
              new Date(latest.playedAt);

            const now = new Date();

            const today =
              date.getDate() ===
                now.getDate() &&
              date.getMonth() ===
                now.getMonth() &&
              date.getFullYear() ===
                now.getFullYear();

            const time =
              date.toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

            const formattedDate =
              date.toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                }
              );

            return {
              ...patient,
              games:
                patientActivities.length,
              score: averageScore,
              trend,
              lastActivity: today
                ? `Today, ${time}`
                : `${formattedDate}, ${time}`,
            };
          });

        /* -----------------------------------------------
           ALERTS
        ------------------------------------------------ */

        let alertList: AlertData[] = [];

        try {
          const alertsResponse =
            await fetch(
              `${API_URL}/api/alerts`
            );

          if (alertsResponse.ok) {
            alertList =
              await alertsResponse.json();
          }
        } catch {
          alertList = [];
        }

        /* -----------------------------------------------
           UPDATE STATE
        ------------------------------------------------ */

        if (mounted) {
          setPatients(
            processedPatients
          );

          setActivities(
            allActivities
          );

          setAlerts(alertList);

          setLoading(false);
        }
      } catch (err) {
        console.error(
          "Backend error:",
          err
        );

        if (mounted) {
          setError(
            "Unable to connect to the backend."
          );

          setLoading(false);
        }
      }
    };

    loadData();

    /* Refresh every 10 seconds */

    const interval =
      setInterval(loadData, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navigate = (page: string) => {
    setCurrentPage(page);
    setSidebarOpen(false);

    if (page !== "Patient Details") {
      setSelectedPatient(null);
    }
  };

  /* =======================================================
     ALERT COUNT
  ======================================================= */

  const activeAlertCount =
    alerts.filter(
      (alert) =>
        !alert.resolved &&
        alert.severity !== "low"
    ).length;

  /* =======================================================
     PATIENT DETAILS
  ======================================================= */

  const openPatientDetails = (
    patient: Patient
  ) => {
    setSelectedPatient(patient);
    setCurrentPage("Patient Details");
  };

  /* =======================================================
     SIDEBAR ITEMS
  ======================================================= */

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Patients",
      icon: Users,
    },
    {
      name: "Activity",
      icon: Activity,
    },
    {
      name: "Alerts",
      icon: Bell,
    },
    {
      name: "Settings",
      icon: Settings,
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}

        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              CareConnect
            </h1>

            <p className="text-xs text-slate-500">
              Caregiver Dashboard
            </p>
          </div>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              currentPage === item.name;

            return (
              <button
                key={item.name}
                onClick={() =>
                  navigate(item.name)
                }
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={20} />

                <span>{item.name}</span>

                {item.name === "Alerts" &&
                  activeAlertCount > 0 && (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
                        active
                          ? "bg-white text-blue-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {activeAlertCount}
                    </span>
                  )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-800">
              SIH Project
            </p>

            <p className="mt-1 text-xs text-blue-600">
              Dementia Care & Monitoring
            </p>
          </div>
        </div>
      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="lg:ml-64">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <Menu size={24} />
            </button>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {currentPage}
              </h2>

              <p className="hidden text-xs text-slate-500 sm:block">
                Caregiver monitoring system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live */}

            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

              <span className="text-xs text-slate-500">
                Live
              </span>
            </div>

            {/* Notifications */}

            <button
              onClick={() =>
                navigate("Alerts")
              }
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <Bell size={21} />

              {activeAlertCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* Caregiver */}

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-900">
                  Caregiver
                </p>

                <p className="text-xs text-slate-500">
                  Healthcare Monitor
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                C
              </div>
            </div>
          </div>
        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main>
          {/* Dashboard */}

          {currentPage ===
            "Dashboard" && (
            <Dashboard
              patients={patients}
              activities={activities}
              alerts={alerts}
              loading={loading}
              error={error}
              onPatientSelect={
                openPatientDetails
              }
              onNavigate={navigate}
            />
          )}

          {/* Patients */}

          {currentPage === "Patients" && (
            <Patients />
          )}

          {/* Patient Details */}

          {currentPage ===
            "Patient Details" &&
            selectedPatient && (
              <PatientDetails
                patient={
                  selectedPatient
                }
                onBack={() =>
                  navigate("Patients")
                }
              />
            )}

          {/* Activity */}

          {currentPage === "Activity" && (
            <ActivityPage />
          )}

          {/* Alerts */}

          {currentPage === "Alerts" && (
            <Alerts />
          )}

          {/* Settings */}

          {currentPage === "Settings" && (
            <SettingsPage />
          )}
        </main>
      </div>
    </div>
  );
}

/* ===========================================================
   DASHBOARD
=========================================================== */

type DashboardProps = {
  patients: Patient[];
  activities: ActivityData[];
  alerts: AlertData[];
  loading: boolean;
  error: string;
  onPatientSelect: (
    patient: Patient
  ) => void;
  onNavigate: (page: string) => void;
};

function Dashboard({
  patients,
  activities,
  alerts,
  loading,
  error,
  onPatientSelect,
  onNavigate,
}: DashboardProps) {
  /* =======================================================
     STATISTICS
  ======================================================= */

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
              sum + patient.score,
            0
          ) / patients.length
        )
      : 0;

  const totalGames =
    activities.length;

  /* =======================================================
     PERFORMANCE CHART
  ======================================================= */

  const performanceData = useMemo(() => {
    const groups: Record<
      string,
      number[]
    > = {};

    activities.forEach((activity) => {
      const date =
        new Date(activity.playedAt);

      const key =
        date.toLocaleDateString(
          "en-CA"
        );

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(
        Number(activity.score)
      );
    });

    return Object.entries(groups)
      .map(([date, scores]) => {
        const average =
          Math.round(
            scores.reduce(
              (a, b) => a + b,
              0
            ) / scores.length
          );

        const dateObject =
          new Date(`${date}T00:00:00`);

        return {
          date,
          day: dateObject.toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
            }
          ),
          score: average,
        };
      })
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      );
  }, [activities]);

  /* =======================================================
     ACTIVE ALERTS
  ======================================================= */

  const activeAlerts =
    alerts.filter(
      (alert) => !alert.resolved
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={22}
              className="text-red-600"
            />

            <div>
              <h3 className="font-semibold text-red-800">
                Backend connection error
              </h3>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              <p className="mt-3 break-all text-xs text-red-500">
                Backend:
                {" "}
                {API_URL}
              </p>

              <button
                onClick={() =>
                  window.location.reload()
                }
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     DASHBOARD UI
  ======================================================= */

  return (
    <div className="p-4 sm:p-6">
      {/* Welcome */}

      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good morning, Caregiver
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor patient activity and
            cognitive performance.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Live backend data
        </div>
      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={totalPatients}
          description="Patients connected"
          icon={<Users size={22} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Active Today"
          value={activeToday}
          description="Patients used the app today"
          icon={<Activity size={22} />}
          iconClass="bg-green-50 text-green-600"
        />

        <StatCard
          title="Average Score"
          value={`${averageScore}%`}
          description="Overall game performance"
          icon={<TrendingUp size={22} />}
          iconClass="bg-purple-50 text-purple-600"
        />

        <StatCard
          title="Games Played"
          value={totalGames}
          description="Recorded game sessions"
          icon={<CheckCircle size={22} />}
          iconClass="bg-orange-50 text-orange-600"
        />
      </div>

      {/* =================================================
          CHART + ALERTS
      ================================================= */}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Performance Chart */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-5">
            <h3 className="font-semibold text-slate-900">
              Overall Performance
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Average cognitive game score over time
            </p>
          </div>

          <div className="h-72">
            {performanceData.length >
            0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={performanceData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="day" />

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
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No performance data available.
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">
                Recent Alerts
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Items requiring attention
              </p>
            </div>

            <button
              onClick={() =>
                onNavigate("Alerts")
              }
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>

          {activeAlerts.length ===
          0 ? (
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <CheckCircle
                className="mx-auto text-green-600"
                size={24}
              />

              <p className="mt-2 text-sm font-medium text-green-700">
                No active alerts
              </p>

              <p className="mt-1 text-xs text-green-600">
                All patients are currently being monitored.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts
                .slice(0, 4)
                .map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          PATIENT TABLE
      ================================================= */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900">
            Patient Activity
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Overview of recent patient performance.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
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

            <tbody className="divide-y divide-slate-100">
              {patients.map(
                (patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {patient.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        ID: {patient.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {patient.age}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock size={15} />

                        {patient.lastActivity}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {patient.games}
                    </td>

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

                    <td className="px-5 py-4">
                      {patient.trend ===
                      "up" ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp
                            size={17}
                          />

                          <span className="text-xs">
                            Improving
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendingDown
                            size={17}
                          />

                          <span className="text-xs">
                            Declining
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() =>
                          onPatientSelect(
                            patient
                          )
                        }
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {patients.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">
            No patients found.
          </div>
        )}
      </div>

      {/* =================================================
          INFO
      ================================================= */}

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <Activity
            size={20}
            className="mt-0.5 text-blue-600"
          />

          <div>
            <h3 className="text-sm font-semibold text-blue-900">
              Continuous monitoring
            </h3>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              Patient activity, cognitive game
              scores and alerts are automatically
              refreshed from the backend every
              10 seconds. These indicators support
              caregiver monitoring and are not a
              medical diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   STAT CARD
=========================================================== */

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
};

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {title}
        </p>

        <div
          className={`rounded-lg p-2 ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ===========================================================
   ALERT ITEM
=========================================================== */

type AlertItemProps = {
  alert: AlertData;
};

function AlertItem({
  alert,
}: AlertItemProps) {
  const boxClass =
    alert.severity === "high"
      ? "border-red-200 bg-red-50"
      : alert.severity === "medium"
        ? "border-orange-200 bg-orange-50"
        : "border-blue-200 bg-blue-50";

  const iconClass =
    alert.severity === "high"
      ? "text-red-600"
      : alert.severity === "medium"
        ? "text-orange-600"
        : "text-blue-600";

  const title =
    alert.type === "performance"
      ? "Performance Alert"
      : alert.type === "inactivity"
        ? "Inactivity Alert"
        : alert.type === "reminder"
          ? "Reminder Alert"
          : "Patient Alert";

  return (
    <div
      className={`rounded-lg border p-3 ${boxClass}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={18}
          className={iconClass}
        />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-800">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            {alert.message}
          </p>

          <p className="mt-2 text-[10px] text-slate-400">
            Patient ID: {alert.patientId}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   EXPORT
=========================================================== */

export default App;
