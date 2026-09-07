import { useEffect, useState } from "react";

const API_URL =
  "https://caregiver-dashboard-phyh.onrender.com";

type Alert = {
  id: string;
  patientId: string;
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  createdAt: string;
  resolved: boolean;
};

type Patient = {
  id: string;
  name: string;
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const alertsResponse = await fetch(
        `${API_URL}/api/alerts`
      );

      if (!alertsResponse.ok) {
        throw new Error(
          `Alerts API failed with status ${alertsResponse.status}`
        );
      }

      const alertData: Alert[] =
        await alertsResponse.json();

      const patientsResponse = await fetch(
        `${API_URL}/api/patients`
      );

      if (!patientsResponse.ok) {
        throw new Error(
          `Patients API failed with status ${patientsResponse.status}`
        );
      }

      const patientData: Patient[] =
        await patientsResponse.json();

      setAlerts(alertData);
      setPatients(patientData);
    } catch (err) {
      console.error(
        "Alerts backend error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(
      fetchAlerts,
      10000
    );

    return () =>
      clearInterval(interval);
  }, []);

  const getPatientName = (
    patientId: string
  ) => {
    const patient = patients.find(
      (p) => p.id === patientId
    );

    return patient
      ? patient.name
      : `Patient ${patientId}`;
  };

  const getAlertTitle = (
    type: string
  ) => {
    switch (type) {
      case "performance":
        return "Performance Decline";

      case "inactivity":
        return "Inactivity Alert";

      case "reminder":
        return "Missed Reminder";

      default:
        return "Patient Alert";
    }
  };

  const getAlertIcon = (
    type: string
  ) => {
    switch (type) {
      case "performance":
        return "📉";

      case "inactivity":
        return "⏰";

      case "reminder":
        return "💊";

      default:
        return "⚠️";
    }
  };

  const getSeverityStyle = (
    severity: Alert["severity"]
  ) => {
    switch (severity) {
      case "high":
        return {
          badge:
            "bg-red-100 text-red-700 border-red-200",
          icon:
            "bg-red-100 text-red-600 border-red-200",
        };

      case "medium":
        return {
          badge:
            "bg-yellow-100 text-yellow-700 border-yellow-200",
          icon:
            "bg-yellow-100 text-yellow-600 border-yellow-200",
        };

      default:
        return {
          badge:
            "bg-blue-100 text-blue-700 border-blue-200",
          icon:
            "bg-blue-100 text-blue-600 border-blue-200",
        };
    }
  };

  const formatDate = (
    dateString: string
  ) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeAlerts = alerts.filter(
    (alert) => !alert.resolved
  );

  const highAlerts = activeAlerts.filter(
    (alert) =>
      alert.severity === "high"
  );

  const mediumAlerts = activeAlerts.filter(
    (alert) =>
      alert.severity === "medium"
  );

  const resolvedAlerts = alerts.filter(
    (alert) => alert.resolved
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-sm text-gray-600">
            Loading alerts...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl">
              ⚠️
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-800">
                Backend Connection Error
              </h2>

              <p className="mt-2 text-sm text-red-700">
                {error}
              </p>

              <p className="mt-4 text-xs text-gray-600">
                Backend server:
              </p>

              <p className="mt-1 break-all text-sm font-medium text-gray-800">
                {API_URL}
              </p>

              <button
                onClick={fetchAlerts}
                className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Alerts & Notifications
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor important changes in patient
          activity and performance.
        </p>
      </div>

      {/* Summary */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            High Priority
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {highAlerts.length}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Requires immediate attention
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Medium Priority
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {mediumAlerts.length}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Should be reviewed
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Active Alerts
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-600">
            {activeAlerts.length}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Currently requiring monitoring
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Resolved
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {resolvedAlerts.length}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Alerts handled previously
          </p>
        </div>
      </div>

      {/* Recent Alerts */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Alerts
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Important observations from patient
              activity.
            </p>
          </div>

          <button
            onClick={fetchAlerts}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {alerts.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
              ✓
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No alerts
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are no alerts requiring attention.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {alerts.map((alert) => {
              const styles =
                getSeverityStyle(
                  alert.severity
                );

              return (
                <div
                  key={alert.id}
                  className="px-6 py-5 hover:bg-gray-50"
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-xl ${styles.icon}`}
                    >
                      {getAlertIcon(
                        alert.type
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {getAlertTitle(
                            alert.type
                          )}
                        </h3>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${styles.badge}`}
                        >
                          {alert.severity}
                        </span>

                        {alert.resolved && (
                          <span className="rounded-full border border-green-200 bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                            Resolved
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm font-medium text-gray-700">
                        Patient:{" "}
                        {getPatientName(
                          alert.patientId
                        )}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {alert.message}
                      </p>

                      <p className="mt-3 text-xs text-gray-400">
                        {formatDate(
                          alert.createdAt
                        )}
                      </p>
                    </div>

                    <div className="hidden shrink-0 sm:block">
                      <span
                        className={
                          alert.resolved
                            ? "text-sm font-medium text-green-600"
                            : "text-sm font-medium text-red-600"
                        }
                      >
                        {alert.resolved
                          ? "✓ Resolved"
                          : "Needs attention"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
