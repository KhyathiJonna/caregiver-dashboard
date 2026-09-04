import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Activity as ActivityIcon,
  Bell,
  Settings,
  Menu,
  X,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

import PerformanceChart from "./charts/PerformanceChart";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import Alerts from "./pages/Alerts";
import Activity from "./pages/Activity";

type Patient = {
  id: string;
  name: string;
  age: number;
  lastActivity: string;
  games: number;
  score: number;
  trend: "up" | "down";
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

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

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentPage("patient-details");
    setSidebarOpen(false);
  };

  const handleBackToPatients = () => {
    setSelectedPatient(null);
    setCurrentPage("patients");
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setSidebarOpen(false);

    if (page !== "patient-details") {
      setSelectedPatient(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-white shadow-lg transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-600 p-2 text-white">
              <Brain size={22} />
            </div>

            <div>
              <h1 className="font-bold text-slate-900">
                MindCare
              </h1>

              <p className="text-xs text-slate-500">
                Caregiver Portal
              </p>
            </div>
          </div>

          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={currentPage === "dashboard"}
            onClick={() => handleNavigation("dashboard")}
          />

          <NavItem
            icon={<Users size={20} />}
            label="Patients"
            active={currentPage === "patients"}
            onClick={() => handleNavigation("patients")}
          />

          <NavItem
            icon={<ActivityIcon size={20} />}
            label="Activity"
            active={currentPage === "activity"}
            onClick={() => handleNavigation("activity")}
          />

          <NavItem
            icon={<Bell size={20} />}
            label="Alerts"
            active={currentPage === "alerts"}
            onClick={() => handleNavigation("alerts")}
          />

          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            active={currentPage === "settings"}
            onClick={() => handleNavigation("settings")}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div>
              <h2 className="font-semibold text-slate-900">
                {currentPage === "dashboard"
                  ? "Dashboard"
                  : currentPage === "patients"
                  ? "Patients"
                  : currentPage === "patient-details"
                  ? "Patient Details"
                  : currentPage === "activity"
                  ? "Activity"
                  : currentPage === "alerts"
                  ? "Alerts"
                  : "Settings"}
              </h2>

              <p className="hidden text-xs text-slate-500 sm:block">
                Cognitive health monitoring
              </p>
            </div>
          </div>

          {/* Header Right */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigation("alerts")}
              className="relative"
            >
              <Bell
                size={20}
                className="text-slate-600"
              />

              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                3
              </span>
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                CW
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">
                  Caregiver
                </p>

                <p className="text-xs text-slate-500">
                  Healthcare Worker
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Pages */}
        <main>
          {currentPage === "dashboard" && (
            <Dashboard
              patients={patients}
              onPatientSelect={handlePatientSelect}
              onViewPatients={() =>
                handleNavigation("patients")
              }
            />
          )}

          {currentPage === "patients" && (
            <Patients
              onPatientSelect={handlePatientSelect}
            />
          )}

          {currentPage === "patient-details" &&
            selectedPatient && (
              <PatientDetails
                patient={selectedPatient}
                onBack={handleBackToPatients}
              />
            )}

          {currentPage === "activity" && <Activity />}

          {currentPage === "alerts" && <Alerts />}

          {currentPage === "settings" && (
            <PlaceholderPage
              title="Settings"
              description="Manage caregiver dashboard settings."
              icon={<Settings size={28} />}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ================= DASHBOARD ================= */

type DashboardProps = {
  patients: Patient[];
  onPatientSelect: (patient: Patient) => void;
  onViewPatients: () => void;
};

function Dashboard({
  patients,
  onPatientSelect,
  onViewPatients,
}: DashboardProps) {
  return (
    <div className="p-6">
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Good morning, Caregiver 👋
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Here's an overview of your patients' cognitive
          activity.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value="24"
          description="Registered patients"
          icon={<Users size={22} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Active Today"
          value="18"
          description="Patients used the app"
          icon={<ActivityIcon size={22} />}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />

        <StatCard
          title="Average Score"
          value="78%"
          description="Overall performance"
          icon={<Brain size={22} />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Active Alerts"
          value="3"
          description="Require attention"
          icon={<AlertTriangle size={22} />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Patient Selector */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              Select Patient
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Choose a patient to view detailed performance.
            </p>
          </div>

          <select
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
            defaultValue=""
            onChange={(e) => {
              const patient = patients.find(
                (p) => p.id === e.target.value
              );

              if (patient) {
                onPatientSelect(patient);
              }
            }}
          >
            <option value="" disabled>
              Select patient
            </option>

            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">
              Performance Trend
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Average cognitive game score over the week
            </p>
          </div>

          <PerformanceChart />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">
              Recent Alerts
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Alerts that may require attention
            </p>
          </div>

          <div className="space-y-3">
            <AlertItem
              icon={<AlertTriangle size={20} />}
              title="Performance decline"
              description="Patient #1018 score dropped by 22%."
              type="danger"
            />

            <AlertItem
              icon={<Clock size={20} />}
              title="Inactivity detected"
              description="Patient #1009 has not played for 3 days."
              type="warning"
            />

            <AlertItem
              icon={<CheckCircle size={20} />}
              title="Daily activity completed"
              description="Patient #1024 completed today's games."
              type="success"
            />
          </div>
        </div>
      </div>

      {/* Patient Activity */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h3 className="font-semibold text-slate-900">
              Patient Activity
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Recent patient performance
            </p>
          </div>

          <button
            onClick={onViewPatients}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Last Activity</th>
                <th className="px-5 py-3">Games</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Trend</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {patients.map((patient) => (
                <PatientRow
                  key={patient.id}
                  patient={patient}
                  onClick={() =>
                    onPatientSelect(patient)
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= NAV ITEM ================= */

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
};

function NavItem({
  icon,
  label,
  active,
  onClick,
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ================= STAT CARD ================= */

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

function StatCard({
  title,
  value,
  description,
  icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {title}
        </p>

        <div
          className={`rounded-lg p-2 ${iconBg} ${iconColor}`}
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

/* ================= ALERT ITEM ================= */

type AlertItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  type: "danger" | "warning" | "success";
};

function AlertItem({
  icon,
  title,
  description,
  type,
}: AlertItemProps) {
  const styles = {
    danger: "bg-red-50 border-red-200 text-red-600",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-600",
    success:
      "bg-green-50 border-green-200 text-green-600",
  };

  return (
    <div
      className={`flex gap-3 rounded-lg border p-4 ${styles[type]}`}
    >
      {icon}

      <div>
        <p className="font-medium text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ================= PATIENT ROW ================= */

type PatientRowProps = {
  patient: Patient;
  onClick: () => void;
};

function PatientRow({
  patient,
  onClick,
}: PatientRowProps) {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer transition hover:bg-blue-50"
    >
      <td className="px-5 py-4">
        <p className="font-medium text-slate-900">
          {patient.name}
        </p>

        <p className="text-xs text-slate-400">
          ID: {patient.id}
        </p>
      </td>

      <td className="px-5 py-4 text-slate-500">
        {patient.lastActivity}
      </td>

      <td className="px-5 py-4">
        {patient.games}
      </td>

      <td className="px-5 py-4 font-semibold">
        {patient.score}%
      </td>

      <td className="px-5 py-4">
        {patient.trend === "up" ? (
          <TrendingUp
            size={18}
            className="text-green-500"
          />
        ) : (
          <TrendingDown
            size={18}
            className="text-red-500"
          />
        )}
      </td>
    </tr>
  );
}

/* ================= PLACEHOLDER ================= */

type PlaceholderPageProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

function PlaceholderPage({
  title,
  description,
  icon,
}: PlaceholderPageProps) {
  return (
    <div className="p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          {description}
        </p>

        <p className="mt-4 text-xs text-slate-400">
          This section will be developed in the next stage.
        </p>
      </div>
    </div>
  );
}

export default App;
