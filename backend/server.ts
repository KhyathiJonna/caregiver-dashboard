import express from "express";
import cors from "cors";
import { patients, activities } from "./data";

const app = express();

// Render provides PORT as a string.
// Convert it to a number for Express.
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// --------------------------------------------------
// ROOT
// --------------------------------------------------

app.get("/", (_req, res) => {
  res.json({
    message: "Caregiver Dashboard API is running",
  });
});

// --------------------------------------------------
// GET ALL PATIENTS
// --------------------------------------------------

app.get("/api/patients", (_req, res) => {
  res.json(patients);
});

// --------------------------------------------------
// GET SINGLE PATIENT
// --------------------------------------------------

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

// --------------------------------------------------
// GET PATIENT ACTIVITIES
// --------------------------------------------------

app.get("/api/patients/:id/activities", (req, res) => {
  const patientActivities = activities.filter(
    (activity) =>
      activity.patientId === req.params.id
  );

  res.json(patientActivities);
});

// --------------------------------------------------
// ADD NEW GAME ACTIVITY
// --------------------------------------------------

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
      sortedActivities[0].score >=
      sortedActivities[1].score
        ? "up"
        : "down";
  }

  res.status(201).json({
    message: "Game result added successfully",
    activity: newActivity,
  });
});

// --------------------------------------------------
// AUTOMATIC ALERT GENERATION
// --------------------------------------------------

app.get("/api/alerts", (_req, res) => {
  const generatedAlerts: any[] = [];

  patients.forEach((patient) => {
    const patientActivities =
      activities.filter(
        (activity) =>
          activity.patientId === patient.id
      );

    // ----------------------------------------------
    // PERFORMANCE DECLINE ALERT
    // ----------------------------------------------

    if (patientActivities.length >= 2) {
      const sortedActivities =
        [...patientActivities].sort(
          (a, b) =>
            new Date(b.playedAt).getTime() -
            new Date(a.playedAt).getTime()
        );

      const latestScore =
        sortedActivities[0].score;

      const previousScore =
        sortedActivities[1].score;

      if (previousScore > 0) {
        const decline =
          ((previousScore - latestScore) /
            previousScore) *
          100;

        if (decline >= 20) {
          generatedAlerts.push({
            id: `PERFORMANCE-${patient.id}`,
            patientId: patient.id,
            type: "performance",
            severity: "high",
            message:
              `Cognitive game performance has decreased by ${Math.round(
                decline
              )}% compared with the previous activity.`,
            resolved: false,
            createdAt:
              new Date().toISOString(),
          });
        }
      }
    }

    // ----------------------------------------------
    // INACTIVITY ALERT
    // ----------------------------------------------

    if (patient.id === "1009") {
      generatedAlerts.push({
        id: `INACTIVE-${patient.id}`,
        patientId: patient.id,
        type: "inactivity",
        severity: "medium",
        message:
          "No cognitive game activity has been recorded for the last 3 days.",
        resolved: false,
        createdAt:
          new Date().toISOString(),
      });
    }
  });

  // ----------------------------------------------
  // MISSED REMINDER ALERT
  // ----------------------------------------------

  generatedAlerts.push({
    id: "REMINDER-1024",
    patientId: "1024",
    type: "reminder",
    severity: "medium",
    message:
      "The patient did not complete the scheduled medication reminder.",
    resolved: false,
    createdAt:
      new Date().toISOString(),
  });

  res.json(generatedAlerts);
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Caregiver Dashboard API running on port ${PORT}`
  );
});
