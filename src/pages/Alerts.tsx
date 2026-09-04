import {
  AlertTriangle,
  Clock,
  Pill,
  CheckCircle,
  TrendingDown,
  Activity,
} from "lucide-react";

type Alert = {
  id: number;
  patient: string;
  type: string;
  message: string;
  time: string;
  severity: "high" | "medium" | "low";
  icon: "decline" | "inactive" | "reminder" | "normal";
};

function Alerts() {
  const alerts: Alert[] = [
    {
      id: 1,
      patient: "Patient #1018",
      type: "Performance Decline",
      message:
        "Cognitive game performance has decreased by 22% compared with the previous week.",
      time: "Today, 9:15 AM",
      severity: "high",
      icon: "decline",
    },
    {
      id: 2,
      patient: "Patient #1009",
      type: "Inactivity Detected",
      message:
        "No cognitive game activity has been recorded for the last 3 days.",
      time: "Yesterday, 6:30 PM",
      severity: "medium",
      icon: "inactive",
    },
    {
      id: 3,
      patient: "Patient #1024",
      type: "Missed Reminder",
      message:
        "The patient did not complete the scheduled medication reminder.",
      time: "Yesterday, 2:00 PM",
      severity: "medium",
      icon: "reminder",
    },
    {
      id: 4,
      patient: "Patient #1007",
      type: "Positive Activity",
      message:
        "Patient completed all scheduled cognitive activities today.",
      time: "Today, 10:00 AM",
      severity: "low",
      icon: "normal",
    },
  ];

  const getIcon = (type: Alert["icon"]) => {
    if (type === "decline") {
      return <TrendingDown size={22} />;
    }

    if (type === "inactive") {
      return <Clock size={22} />;
    }

    if (type === "reminder") {
      return <Pill size={22} />;
    }

    return <CheckCircle size={22} />;
  };

  const getStyles = (severity: Alert["severity"]) => {
    if (severity === "high") {
      return {
        box: "border-red-200 bg-red-50",
        icon: "bg-red-100 text-red-600",
        badge: "bg-red-100 text-red-700",
      };
    }

    if (severity === "medium") {
      return {
        box: "border-yellow-200 bg-yellow-50",
        icon: "bg-yellow-100 text-yellow-600",
        badge: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      box: "border-green-200 bg-green-50",
      icon: "bg-green-100 text-green-600",
      badge: "bg-green-100 text-green-700",
    };
  };

  const highAlerts = alerts.filter(
    (alert) => alert.severity === "high"
  ).length;

  const mediumAlerts = alerts.filter(
    (alert) => alert.severity === "medium"
  ).length;

  const resolvedAlerts = 6;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Alerts & Notifications
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Monitor important changes in patient activity and
          performance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* High Priority */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              High Priority
            </p>

            <div className="rounded-lg bg-red-50 p-2 text-red-600">
              <AlertTriangle size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {highAlerts}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Requires immediate attention
          </p>
        </div>

        {/* Medium Priority */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Medium Priority
            </p>

            <div className="rounded-lg bg-yellow-50 p-2 text-yellow-600">
              <Clock size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {mediumAlerts}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Should be reviewed
          </p>
        </div>

        {/* Active Alerts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Active Alerts
            </p>

            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Activity size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {alerts.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Currently requiring monitoring
          </p>
        </div>

        {/* Resolved */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Resolved
            </p>

            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <CheckCircle size={22} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {resolvedAlerts}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Alerts handled previously
          </p>
        </div>
      </div>

      {/* Alert List */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900">
            Recent Alerts
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Important observations from patient activity.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {alerts.map((alert) => {
            const styles = getStyles(alert.severity);

            return (
              <div
                key={alert.id}
                className={`m-4 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-start ${styles.box}`}
              >
                {/* Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
                >
                  {getIcon(alert.icon)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {alert.type}
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {alert.patient}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${styles.badge}`}
                    >
                      {alert.severity === "high"
                        ? "High"
                        : alert.severity === "medium"
                        ? "Medium"
                        : "Normal"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">
                    {alert.message}
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    {alert.time}
                  </p>
                </div>

                {/* Action */}
                {alert.severity !== "low" && (
                  <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                    Review
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Information Box */}
      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex gap-3">
          <div className="mt-0.5 text-blue-600">
            <AlertTriangle size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-blue-900">
              How alerts work
            </h3>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              Alerts are generated from observed activity
              patterns such as prolonged inactivity, missed
              reminders, or significant changes in cognitive
              game performance. These alerts are intended to
              support caregiver monitoring and are not a medical
              diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;
