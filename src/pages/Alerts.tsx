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
  const [resolvingId, setResolvingId] =
    useState<string | null>(null);

  // =========================================================
  // LOAD ALERTS
  // =========================================================

  const fetchAlerts = async () => {
    try {
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

  // =========================================================
  // INITIAL LOAD + AUTO REFRESH
  // =========================================================

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(
      fetchAlerts,
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================================
  // RESOLVE ALERT
  // =========================================================

  const resolveAlert = async (
    alertId: string
  ) => {
    try {
      setResolvingId(alertId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/alerts/${encodeURIComponent(
          alertId
        )}/resolve`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        let message =
          `Failed to resolve alert (${response.status})`;

        try {
          const data = await response.json();

          if (data?.message) {
            message = data.message;
          }
        } catch {
          // Keep default error message
        }

        throw new Error(message);
      }

      // Immediately update local screen
      setAlerts((currentAlerts) =>
        currentAlerts.map((alert) =>
          alert.id === alertId
            ? {
                ...alert,
                resolved: true,
              }
            : alert
        )
      );
    } catch (err) {
      console.error(
        "Resolve alert error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to resolve the alert."
      );
    } finally {
      setResolvingId(null);
    }
  };

  // =========================================================
  // GET PATIENT NAME
  // =========================================================

  const getPatientName = (
    patientId: string
  ) => {
    const patient = patients.find(
      (item) => item.id === patientId
    );

    return patient
      ? patient.name
      : `Patient ${patientId}`;
  };

  // =========================================================
  // ALERT TITLE
  // =========================================================

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

  // =========================================================
  // ALERT ICON
  // =========================================================

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

  // =========================================================
  // SEVERITY STYLE
  // =========================================================

  const getSeverityStyle = (
    severity: Alert["severity"]
  ) => {
    switch (severity) {
      case "high":
        return {
          container:
            "border-red-200 bg-red-50",
          icon:
            "border-red-200 bg-red-100",
          badge:
            "border-red-200 bg-red-100 text-red-700",
        };

      case "medium":
        return {
          container:
            "border-yellow-200 bg-yellow-50",
          icon:
            "border-yellow-200 bg-yellow-100",
          badge:
            "border-yellow-200 bg-yellow-100 text-yellow-700",
        };

      default:
        return {
          container:
            "border-blue-200 bg-blue-50",
          icon:
            "border-blue-200 bg-blue-100",
          badge:
            "border-blue-200 bg-blue-100 text-blue-700",
        };
    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (
    dateString: string
  ) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // COUNTS
  // =========================================================

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

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading alerts...
            </p>

          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // CONNECTION ERROR
  // =========================================================

  if (error && alerts.length === 0) {
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

              <p className="mt-4 text-xs text-slate-500">
                Backend server:
              </p>

              <p className="mt-1 break-all text-sm font-medium text-slate-800">
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

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">

      {/* HEADER */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-slate-900">
          Alerts & Notifications
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor important changes in patient
          activity and performance.
        </p>

      </div>

      {/* ERROR BANNER */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">

        {/* HIGH PRIORITY */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            High Priority
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {highAlerts.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Requires immediate attention
          </p>

        </div>

        {/* MEDIUM PRIORITY */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Medium Priority
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {mediumAlerts.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Should be reviewed
          </p>

        </div>

        {/* ACTIVE ALERTS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Active Alerts
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-600">
            {activeAlerts.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Currently requiring monitoring
          </p>

        </div>

        {/* RESOLVED */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Resolved
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {resolvedAlerts.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Alerts handled previously
          </p>

        </div>

      </div>

      {/* RECENT ALERTS */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div>

            <h2 className="text-lg font-semibold text-slate-900">
              Recent Alerts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Important observations from patient
              activity.
            </p>

          </div>

          <button
            onClick={fetchAlerts}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>

        </div>

        {alerts.length === 0 ? (

          <div className="px-6 py-14 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
              ✓
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No alerts
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              There are no alerts requiring attention.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-slate-200">

            {alerts.map((alert) => {

              const styles =
                getSeverityStyle(
                  alert.severity
                );

              return (
                <div
                  key={alert.id}
                  className={`p-6 transition hover:bg-slate-50 ${
                    alert.resolved
                      ? "bg-green-50/30"
                      : ""
                  }`}
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

                    {/* ALERT ICON */}

                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border text-2xl ${styles.icon}`}
                    >
                      {getAlertIcon(
                        alert.type
                      )}
                    </div>

                    {/* ALERT DETAILS */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-base font-semibold text-slate-900">
                          {getAlertTitle(
                            alert.type
                          )}
                        </h3>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${styles.badge}`}
                        >
                          {alert.severity}
                        </span>

                        {alert.resolved && (
                          <span className="rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Resolved
                          </span>
                        )}

                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        Patient:{" "}
                        {getPatientName(
                          alert.patientId
                        )}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {alert.message}
                      </p>

                      <p className="mt-3 text-xs text-slate-400">
                        {formatDate(
                          alert.createdAt
                        )}
                      </p>

                    </div>

                    {/* ACTION */}

                    <div className="shrink-0">

                      {alert.resolved ? (

                        <span className="inline-flex items-center rounded-lg bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700">
                          ✓ Resolved
                        </span>

                      ) : (

                        <button
                          type="button"
                          onClick={() =>
                            resolveAlert(
                              alert.id
                            )
                          }
                          disabled={
                            resolvingId ===
                            alert.id
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {resolvingId ===
                          alert.id
                            ? "Resolving..."
                            : "Mark as Resolved"}
                        </button>

                      )}

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
