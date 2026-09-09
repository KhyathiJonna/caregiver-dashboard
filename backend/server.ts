import express from "express";
import cors from "cors";
import { patients, activities } from "./data";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// ==================================================
// RESOLVED ALERTS
// ==================================================

const resolvedAlertIds = new Set<string>();

// ==================================================
// ROOT
// ==================================================

app.get("/", (_req, res) => {
  res.json({
    message: "Caregiver Dashboard API is running",
  });
});

// ==================================================
// GET ALL PATIENTS
// ==================================================

app.get("/api/patients", (_req, res) => {
  res.json(patients);
});

// ==================================================
// GET SINGLE PATIENT
// ==================================================

app.get("/api/patients/:id", (req, res) => {
  const patient = patients.find(
    (p) => p.id === req.params.id
  );

  if (!patient) {
    return res.status(404).json({
      message: "Patient not found",
    });
  }

  res.json(patient);
});

// ==================================================
// GET PATIENT ACTIVITIES
// ==================================================

app.get(
  "/api/patients/:id/activities",
  (req, res) => {
    const patientActivities = activities.filter(
      (activity) =>
        activity.patientId === req.params.id
    );

    res.json(patientActivities);
  }
);

// ==================================================
// ADD NEW GAME ACTIVITY
// ==================================================

app.post("/api/activity", (req, res) => {
  const {
    patientId,
    gameType,
    score,
    accuracy,
    duration,
    difficulty,
  } = req.body;

  if (
    !patientId ||
    !gameType ||
    score === undefined ||
    accuracy === undefined ||
    duration === undefined ||
    !difficulty
  ) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  const patient = patients.find(
    (p) => p.id === patientId
  );

  if (!patient) {
    return res.status(404).json({
      message: "Patient not found",
    });
  }

  const newActivity = {
    patientId,
    gameType,
    score: Number(score),
    accuracy: Number(accuracy),
    duration: Number(duration),
    difficulty,
    playedAt: new Date().toISOString(),
  };

  activities.push(newActivity);

  patient.lastActivity =
    new Date().toLocaleString();

  patient.games += 1;

  patient.score = Number(score);

  // Update patient trend
  const patientActivities = activities.filter(
    (activity) =>
      activity.patientId === patientId
  );

  if (patientActivities.length >= 2) {
    const sortedActivities =
      [...patientActivities].sort(
        (a, b) =>
          new Date(b.playedAt).getTime() -
          new Date(a.playedAt).getTime()
      );

    patient.trend =
      Number(sortedActivities[0].score) >=
      Number(sortedActivities[1].score)
        ? "up"
        : "down";
  }

  res.status(201).json({
    message: "Game result added successfully",
    activity: newActivity,
  });
});

// ==================================================
// GET ALERTS
// ==================================================

app.get("/api/alerts", (_req, res) => {
  const generatedAlerts: any[] = [];

  patients.forEach((patient) => {
    const patientActivities =
      activities.filter(
        (activity) =>
          activity.patientId === patient.id
      );

    // ----------------------------------------------
    // PERFORMANCE DECLINE
    // ----------------------------------------------

    if (patientActivities.length >= 2) {
      const sortedActivities =
        [...patientActivities].sort(
          (a, b) =>
            new Date(b.playedAt).getTime() -
            new Date(a.playedAt).getTime()
        );

      const latestScore = Number(
        sortedActivities[0].score
      );

      const previousScore = Number(
        sortedActivities[1].score
      );

      if (previousScore > 0) {
        const decline =
          ((previousScore - latestScore) /
            previousScore) *
          100;

        if (decline >= 20) {
          const alertId =
            `PERFORMANCE-${patient.id}`;

          generatedAlerts.push({
            id: alertId,
            patientId: patient.id,
            type: "performance",
            severity: "high",
            message:
              `Cognitive game performance has decreased by ${Math.round(
                decline
              )}% compared with the previous activity.`,
            resolved:
              resolvedAlertIds.has(alertId),
            createdAt:
              new Date().toISOString(),
          });
        }
      }
    }

    // ----------------------------------------------
    // INACTIVITY
    // ----------------------------------------------

    if (patient.id === "1009") {
      const alertId =
        `INACTIVE-${patient.id}`;

      generatedAlerts.push({
        id: alertId,
        patientId: patient.id,
        type: "inactivity",
        severity: "medium",
        message:
          "No cognitive game activity has been recorded for the last 3 days.",
        resolved:
          resolvedAlertIds.has(alertId),
        createdAt:
          new Date().toISOString(),
      });
    }
  });

  // ----------------------------------------------
  // MISSED REMINDER
  // ----------------------------------------------

  const reminderAlertId =
    "REMINDER-1024";

  generatedAlerts.push({
    id: reminderAlertId,
    patientId: "1024",
    type: "reminder",
    severity: "medium",
    message:
      "The patient did not complete the scheduled medication reminder.",
    resolved:
      resolvedAlertIds.has(reminderAlertId),
    createdAt:
      new Date().toISOString(),
  });

  res.json(generatedAlerts);
});

// ==================================================
// RESOLVE ALERT
// ==================================================

app.post(
  "/api/alerts/:id/resolve",
  (req, res) => {
    const alertId = req.params.id;

    const validAlertIds = new Set<string>();

    // ----------------------------------------------
    // CHECK PERFORMANCE ALERTS
    // ----------------------------------------------

    patients.forEach((patient) => {
      const patientActivities =
        activities.filter(
          (activity) =>
            activity.patientId === patient.id
        );

      if (patientActivities.length >= 2) {
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

        const latestScore = Number(
          sortedActivities[0].score
        );

        const previousScore = Number(
          sortedActivities[1].score
        );

        if (previousScore > 0) {
          const decline =
            ((previousScore - latestScore) /
              previousScore) *
            100;

          if (decline >= 20) {
            validAlertIds.add(
              `PERFORMANCE-${patient.id}`
            );
          }
        }
      }

      // --------------------------------------------
      // INACTIVITY ALERT
      // --------------------------------------------

      if (patient.id === "1009") {
        validAlertIds.add(
          `INACTIVE-${patient.id}`
        );
      }
    });

    // ----------------------------------------------
    // REMINDER ALERT
    // ----------------------------------------------

    validAlertIds.add(
      "REMINDER-1024"
    );

    // ----------------------------------------------
    // VALIDATE ALERT
    // ----------------------------------------------

    if (!validAlertIds.has(alertId)) {
      return res.status(404).json({
        message: "Alert not found",
      });
    }

    // ----------------------------------------------
    // SAVE RESOLUTION
    // ----------------------------------------------

    resolvedAlertIds.add(alertId);

    res.json({
      message: "Alert resolved successfully",
      alertId,
      resolved: true,
    });
  }
);

// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Caregiver Dashboard API running on port ${PORT}`
  );
});
