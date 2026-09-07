export const patients = [
  {
    id: "1024",
    name: "Lakshmi Devi",
    age: 72,
    language: "Assamese",
    lastActivity: "Today, 10:30 AM",
    games: 3,
    score: 82,
    trend: "up",
  },

  {
    id: "1018",
    name: "Ramesh Kumar",
    age: 68,
    language: "Bengali",
    lastActivity: "Today, 4:15 PM",
    games: 3,
    score: 68,
    trend: "down",
  },

  {
    id: "1007",
    name: "Maya Devi",
    age: 75,
    language: "Manipuri",
    lastActivity: "Today, 9:45 AM",
    games: 4,
    score: 88,
    trend: "up",
  },

  {
    id: "1009",
    name: "Anita Devi",
    age: 70,
    language: "Hindi",
    lastActivity: "3 days ago",
    games: 0,
    score: 70,
    trend: "down",
  },
];


export const activities = [

  // ========================================
  // PATIENT #1024
  // Normal / Improving Performance
  // ========================================

  {
    patientId: "1024",
    gameType: "Memory Match",
    score: 82,
    accuracy: 86,
    duration: 10,
    difficulty: "Medium",
    playedAt: "2026-09-04",
  },

  {
    patientId: "1024",
    gameType: "Pattern Recognition",
    score: 78,
    accuracy: 80,
    duration: 12,
    difficulty: "Medium",
    playedAt: "2026-09-03",
  },

  {
    patientId: "1024",
    gameType: "Daily Recall",
    score: 75,
    accuracy: 78,
    duration: 11,
    difficulty: "Easy",
    playedAt: "2026-09-02",
  },


  // ========================================
  // PATIENT #1018
  // Performance Decline
  // 90 -> 68 = 24% decline
  // ========================================

  {
    patientId: "1018",
    gameType: "Memory Match",
    score: 68,
    accuracy: 70,
    duration: 15,
    difficulty: "Easy",
    playedAt: "2026-09-04",
  },

  {
    patientId: "1018",
    gameType: "Memory Match",
    score: 90,
    accuracy: 92,
    duration: 10,
    difficulty: "Medium",
    playedAt: "2026-09-03",
  },

  {
    patientId: "1018",
    gameType: "Pattern Recognition",
    score: 88,
    accuracy: 90,
    duration: 11,
    difficulty: "Medium",
    playedAt: "2026-09-02",
  },


  // ========================================
  // PATIENT #1007
  // Good Performance
  // ========================================

  {
    patientId: "1007",
    gameType: "Daily Recall",
    score: 88,
    accuracy: 91,
    duration: 9,
    difficulty: "Hard",
    playedAt: "2026-09-04",
  },

  {
    patientId: "1007",
    gameType: "Memory Match",
    score: 84,
    accuracy: 87,
    duration: 10,
    difficulty: "Medium",
    playedAt: "2026-09-03",
  },


  // ========================================
  // PATIENT #1009
  // No recent activity
  // ========================================

  {
    patientId: "1009",
    gameType: "Memory Match",
    score: 70,
    accuracy: 72,
    duration: 12,
    difficulty: "Easy",
    playedAt: "2026-09-01",
  },
];


// ========================================
// OLD ALERT DATA
// ========================================
// Kept here for reference.
// Automatic alerts are now generated
// inside server.ts.

export const alerts = [];
