import { useEffect, useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Activity,
  Bell,
  Settings,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
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

import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import ActivityPage from "./pages/Activity";
import Alerts from "./pages/Alerts";
import SettingsPage from "./pages/Settings";

const API_URL = import.meta.env.VITE_API_URL;

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
  patientId: string;
  gameType: string;
  score: number;
  accuracy: number;
  duration: number;
  difficulty: string;
  playedAt: string;
};

type BackendAlert = {
  id: string;
  patientId: string;
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  resolved: boolean;
};

type DashboardAlert = {
  id: string;
  patientId: string;
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  resolved: boolean;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentPage, setCurrentPage] =
    useState("Dashboard");

  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [activities, setActivities] =
    useState<ActivityData[]>([]);

  const [alerts, setAlerts] =
    useState<DashboardAlert[]>([]);

  const [dashboardLoading, setDashboardLoading] =
    useState(true);

  const [dashboardError, setDashboardError] =
    useState("");

  /*
   * =========================================================
   * LOAD ALL DASHBOARD DATA
   * =========================================================
   */

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboardError("");

        /*
         * -----------------------------------------------------
         * 1. GET PATIENTS
         * -----------------------------------------------------
         */

        const patientResponse = await fetch(
          `${API_URL}/api/patients`
        );

        if (!patientResponse.ok) {
          throw new Error("Failed to fetch patients");
        }

        const patientData = await patientResponse.json();

        /*
         * -----------------------------------------------------
         * 2. GET ACTIVITIES FOR EACH PATIENT
         * -----------------------------------------------------
         */

        const updatedPatients: Patient[] =
          await Promise.all(
            patientData.map(
              async (patient: Patient) => {
                try {
                  const activityResponse =
                    await fetch(
                      `${API_URL}/api/patients/${patient.id}/activities`
                    );

                  if (!activityResponse.ok) {
                    return patient;
                  }

                  const patientActivities: ActivityData[] =
                    await activityResponse.json();

                  if (patientActivities.length === 0) {
                    return {
                      ...patient,
                      games: 0,
                    };
                  }

                  /*
                   * Sort newest activity first
                   */

                  const sortedActivities =
                    [...patientActivities].sort(
                      (a, b) =>
                        new Date(
                          b.playedAt
                        ).getTime() -
                        new Date(
                          a.playedAt
                        ).getTime()
                    );

                  const latestActivity =
                    sortedActivities[0];

                  /*
                   * Calculate average score
                   */

                  const averageScore =
                    Math.round(
                      patientActivities.reduce(
                        (
                          total,
                          activity
                        ) =>
                          total +
                          activity.score,
                        0
                      ) /
                        patientActivities.length
                    );

                  /*
                   * Calculate trend
                   */

                  let trend: "up" | "down" =
                    patient.trend;

                  if (
                    sortedActivities.length >= 2
                  ) {
                    const latestScore =
                      sortedActivities[0]
                        .score;

                    const previousScore =
                      sortedActivities[1]
                        .score;

                    trend =
                      latestScore >=
                      previousScore
                        ? "up"
                        : "down";
                  }

                  /*
                   * Format last activity
                   */

                  const activityDate =
                    new Date(
                      latestActivity.playedAt
                    );

                  const now = new Date();

                  const isToday =
                    activityDate.getDate() ===
                      now.getDate() &&
                    activityDate.getMonth() ===
                      now.getMonth() &&
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

                  const lastActivity =
                    isToday
                      ? `Today, ${formattedTime}`
                      : `${formattedDate}, ${formattedTime}`;

                  return {
                    ...patient,
                    games:
                      patientActivities.length,
                    score: averageScore,
                    trend,
                    lastActivity,
                  };
                } catch {
                  return patient;
                }
              }
            )
          );

        setPatients(updatedPatients);

        /*
         * -----------------------------------------------------
         * 3. GET ALL ACTIVITIES
         * -----------------------------------------------------
         */

        const allActivities: ActivityData[] =
          [];

        for (const patient of patientData) {
          try {
            const response = await fetch(
              `${API_URL}/api/patients/${patient.id}/activities`
            );

            if (response.ok) {
              const data: ActivityData[] =
                await response.json();

              allActivities.push(...data);
            }
          } catch {
            // Ignore individual patient activity errors
          }
        }

        setActivities(allActivities);

        /*
         * -----------------------------------------------------
         * 4. GET ALERTS
         * -----------------------------------------------------
         */

        const alertResponse = await fetch(
          `${API_URL}/api/alerts`
        );

        if (!alertResponse.ok) {
          throw new Error("Failed to fetch alerts");
        }

        const alertData: BackendAlert[] =
          await alertResponse.json();

        setAlerts(alertData);

        setDashboardLoading(false);
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );

        setDashboardError(
          "Unable to connect to the backend. Make sure the backend server is running on port 5000."
        );

        setDashboardLoading(false);
      }
    };

    /*
     * ---------------------------------------------------------
     * INITIAL LOAD
     * ---------------------------------------------------------
     */

    loadDashboardData();

    /*
     * ---------------------------------------------------------
     * AUTOMATIC REFRESH
     *
     * Dashboard checks the backend every 10 seconds.
     * This means when a new game result is added,
     * the dashboard automatically receives the new data.
     * ---------------------------------------------------------
     */

    const refreshInterval = setInterval(() => {
      loadDashboardData();
    }, 10000);

    /*
     * ---------------------------------------------------------
     * CLEANUP
     * ---------------------------------------------------------
     */

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setSidebarOpen(false);

    if (page !== "Patient Details") {
      setSelectedPatient(null);
    }
  };

  /*
   * =========================================================
   * PATIENT SELECTION
   * =========================================================
   */

  const handlePatientSelect = (
    patient: Patient
  ) => {
    setSelectedPatient(patient);
    setCurrentPage("Patient Details");
  };

  /*
   * =========================================================
   * MENU ITEMS
   * =========================================================
   */

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

  /*
   * =========================================================
   * ACTIVE ALERT COUNT
   * =========================================================
   */

  const activeAlerts = alerts.filter(
    (alert) =>
      !alert.resolved &&
      alert.severity !== "low"
  ).length;

  /*
   * =========================================================
   * PAGE RENDER
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

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
            className="lg:hidden"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              currentPage === item.name;

            return (
              <button
                key={item.name}
                onClick={() =>
                  handleNavigation(
                    item.name
                  )
                }
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={20} />

                <span>{item.name}</span>

                {item.name === "Alerts" &&
                  activeAlerts > 0 && (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
                        isActive
                          ? "bg-white text-blue-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {activeAlerts}
                    </span>
                  )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs font-medium text-blue-800">
              SIH Project
            </p>

            <p className="mt-1 text-xs text-blue-600">
              Dementia Care & Monitoring
            </p>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="lg:ml-64">
        {/* ===================================================
            HEADER
        =================================================== */}

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
            {/* Live status */}

            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

              <span className="text-xs text-slate-500">
                Live
              </span>
            </div>

            {/* Notification */}

            <button
              onClick={() =>
                handleNavigation("Alerts")
              }
              className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
            >
              <Bell size={21} />

              {activeAlerts > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {activeAlerts}
                </span>
              )}
            </button>

            {/* User */}

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

        {/* ===================================================
            CONTENT
        =================================================== */}

        <main>
          {/* Dashboard */}

          {currentPage === "Dashboard" && (
            <Dashboard
              patients={patients}
              activities={activities}
              alerts={alerts}
              loading={dashboardLoading}
              error={dashboardError}
              onPatientSelect={
                handlePatientSelect
              }
            />
          )}

          {/* Patients */}

          {currentPage === "Patients" && (
            <Patients
              onPatientSelect={
                handlePatientSelect
              }
            />
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
                  handleNavigation(
                    "Patients"
                  )
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

/*
 * ===========================================================
 * DASHBOARD COMPONENT
 * ===========================================================
 */

type DashboardProps = {
  patients: Patient[];
  activities: ActivityData[];
  alerts: DashboardAlert[];
  loading: boolean;
  error: string;
  onPatientSelect: (
    patient: Patient
  ) => void;
};

function Dashboard({
  patients,
  activities,
  alerts,
  loading,
  error,
  onPatientSelect,
}: DashboardProps) {
  /*
   * ---------------------------------------------------------
   * DASHBOARD STATISTICS
   * ---------------------------------------------------------
   */

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
            (total, patient) =>
              total + patient.score,
            0
          ) / patients.length
        )
      : 0;

  const totalGames =
    activities.length;

  /*
   * ---------------------------------------------------------
   * PERFORMANCE TREND DATA
   * ---------------------------------------------------------
   */

  const groupedByDate: Record<
    string,
    number[]
  > = {};

  activities.forEach((activity) => {
    const date = new Date(
      activity.playedAt
    );

    const dateKey =
      date.toISOString().split("T")[0];

    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }

    groupedByDate[dateKey].push(
      activity.score
    );
  });

  const performanceData = Object.entries(
    groupedByDate
  )
    .map(([date, scores]) => {
      const average =
        Math.round(
          scores.reduce(
            (a, b) => a + b,
            0
          ) / scores.length
        );

      const dateObject = new Date(date);

      return {
        date: date,
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

  /*
   * ---------------------------------------------------------
   * RECENT ALERTS
   * ---------------------------------------------------------
   */

  const recentAlerts =
    alerts.filter(
      (alert) => !alert.resolved
    );

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * ERROR
   * ---------------------------------------------------------
   */

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="text-red-600"
              size={22}
            />

            <div>
              <h3 className="font-semibold text-red-800">
                Backend connection error
              </h3>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              <p className="mt-3 text-xs text-red-500">
                Backend should be running at:
                {API_URL}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * DASHBOARD UI
   * ---------------------------------------------------------
   */

  return (
    <div className="p-4 sm:p-6">
      {/* =====================================================
          WELCOME
      ===================================================== */}

      <div className="mb-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Good morning, Caregiver
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor patient activity and
              cognitive performance.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

            Dashboard auto-refreshing
          </div>
        </div>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            {totalPatients}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Patients connected
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
            {activeToday}
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
            {averageScore}%
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Overall game performance
          </p>
        </div>

        {/* Games Played */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Games Played
            </p>

            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <CheckCircle size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {totalGames}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Recorded game sessions
          </p>
        </div>
      </div>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* ===================================================
            PERFORMANCE CHART
        =================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">
                Overall Performance
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Average cognitive game score over time
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="h-72 w-full">
            {performanceData.length > 0 ? (
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

        {/* ===================================================
            ALERTS
        =================================================== */}

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
              className="text-xs font-medium text-blue-600 hover:underline"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent(
                    "navigate-alerts"
                  )
                )
              }
            >
              View all
            </button>
          </div>

          {recentAlerts.length === 0 ? (
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
              {recentAlerts
                .slice(0, 4)
                .map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-3 ${
                      alert.severity ===
                      "high"
                        ? "border-red-200 bg-red-50"
                        : alert.severity ===
                            "medium"
                          ? "border-orange-200 bg-orange-50"
                          : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        size={18}
                        className={
                          alert.severity ===
                          "high"
                            ? "text-red-600"
                            : alert.severity ===
                                "medium"
                              ? "text-orange-600"
                              : "text-blue-600"
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800">
                          {alert.type ===
                          "performance"
                            ? "Performance Alert"
                            : alert.type ===
                                "inactivity"
                              ? "Inactivity Alert"
                              : alert.type ===
                                  "reminder"
                                ? "Reminder Alert"
                                : "Patient Alert"}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {alert.message}
                        </p>

                        <p className="mt-2 text-[10px] font-medium uppercase text-slate-400">
                          Patient ID:{" "}
                          {
                            alert.patientId
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          PATIENT ACTIVITY
      ===================================================== */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold text-slate-900">
              Patient Activity
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Overview of recent patient performance.
            </p>
          </div>

          <span className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
            Live backend data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
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
                    className="transition hover:bg-slate-50"
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

                    <td className="px-5 py-4 text-slate-600">
                      {patient.age}
                    </td>

                    {/* Last Activity */}

                    <td className="px-5 py-4 text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock
                          size={15}
                        />

                        {patient.lastActivity}
                      </div>
                    </td>

                    {/* Games */}

                    <td className="px-5 py-4 font-medium">
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

                    {/* Details */}

                    <td className="px-5 py-4">
                      <button
                        onClick={() =>
                          onPatientSelect(
                            patient
                          )
                        }
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                      >
                        View

                        <ArrowRight
                          size={14}
                        />
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

      {/* =====================================================
          MONITORING INFORMATION
      ===================================================== */}

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <Activity
            className="mt-0.5 text-blue-600"
            size={20}
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

export default App;
