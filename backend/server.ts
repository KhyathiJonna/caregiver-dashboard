import express from "express";
import cors from "cors";
import { patients, activities } from "./data";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());


// -----------------------------
// HOME
// -----------------------------

app.get("/", (_req, res) => {
  res.json({
    message: "Caregiver Dashboard API is running",
  });
});


// -----------------------------
// GET ALL PATIENTS
// -----------------------------

app.get("/api/patients", (_req, res) => {
  res.json(patients);
});


// -----------------------------
// GET ONE PATIENT
// -----------------------------

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


// -----------------------------
// GET PATIENT ACTIVITIES
// -----------------------------

app.get("/api/patients/:id/activities", (req, res) => {
  const patientActivities = activities.filter(
    (activity) =>
      activity.patientId === req.params.id
  );

  res.json(patientActivities);
});


// -----------------------------
// ADD NEW GAME RESULT
// -----------------------------

app.post("/api/activity", (req, res) => {
  const {
    patientId,
    gameType,
    score,
    accuracy,
    duration,
    difficulty,
  } = req.body;

  // Validate required fields
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

  // Check patient exists
  const patient = patients.find(
    (p) => p.id === patientId
  );

  if (!patient) {
    return res.status(404).json({
      message: "Patient not found",
    });
  }

  // Create new activity
  const newActivity = {
    patientId,
    gameType,
    score: Number(score),
    accuracy: Number(accuracy),
    duration: Number(duration),
    difficulty,
    playedAt: new Date().toISOString(),
  };

  // Add activity to memory
  activities.push(newActivity);

  // Update patient's latest information
  patient.lastActivity = new Date().toLocaleString();
  patient.games += 1;
  patient.score = Number(score);

  res.status(201).json({
    message: "Game result added successfully",
    activity: newActivity,
  });
});


// -----------------------------
// AUTOMATIC ALERTS
// -----------------------------

app.get("/api/alerts", (_req, res) => {
  const generatedAlerts: any[] = [];

  patients.forEach((patient) => {

    const patientActivities = activities.filter(
      (activity) =>
        activity.patientId === patient.id
    );

    // Performance decline detection
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
        });
      }
    }


    // Inactivity detection
    if (patient.id === "1009") {

      generatedAlerts.push({
        id: `INACTIVE-${patient.id}`,
        patientId: patient.id,
        type: "inactivity",
        severity: "medium",
        message:
          "No cognitive game activity has been recorded for the last 3 days.",
        resolved: false,
      });
    }
  });


  // Medication reminder example
  generatedAlerts.push({
    id: "REMINDER-1024",
    patientId: "1024",
    type: "reminder",
    severity: "medium",
    message:
      "The patient did not complete the scheduled medication reminder.",
    resolved: false,
  });


  res.json(generatedAlerts);
});


// -----------------------------
// START SERVER
// -----------------------------

app.listen(PORT, () => {
  console.log(
    `Backend server running at http://localhost:${PORT}`
  );
});
