export const PLAN = {
  "Day 1": {
    label: "Push",
    subtitle: "Chest · Triceps · Front Delts",
    color: "#E8562A",
    exercises: [
      { name: "Incline Barbell Press", sets: 4, targetReps: 10, startWeight: 95, note: "Ramp: 95/100/105/110. When you hit 4×10, add 5lbs." },
      { name: "Pec Fly Machine", sets: 4, targetReps: 10, startWeight: 110, note: "Ramp: 110/120/130/140. Full stretch at bottom, controlled squeeze at top." },
      { name: "Cable Tricep Pushdown (rope)", sets: 4, targetReps: 10, startWeight: 40, note: "Ramp: 40/45/50/55. Elbows pinned to sides, full lockout each rep. Hits lateral and medial tricep heads." },
      { name: "Arnold Press (DB)", sets: 4, targetReps: 10, startWeight: 25, note: "Ramp: 25/27.5/30/32.5. Rotate palms out as you press. Full shoulder development." },
      { name: "DB Front Raise", sets: 3, targetReps: 12, startWeight: 15, note: "15lbs all sets. Alternate arms. Lift to shoulder height — no higher. No swinging. Targets front delts." },
    ],
  },
  "Day 2": {
    label: "Pull",
    subtitle: "Back · Biceps · Rear Delts",
    color: "#2A7BE8",
    exercises: [
      { name: "Cable Lat Pulldown", sets: 4, targetReps: 10, startWeight: 140, note: "Ramp: 140/160/180/200. Full hang at top, pull to upper chest. Your strongest lift — push it." },
      { name: "Seated Cable Row", sets: 4, targetReps: 10, startWeight: 110, note: "Ramp: 110/120/130/140. Chest tall, drive elbows back. You have more capacity here than your last log showed." },
      { name: "Face Pulls (cable)", sets: 4, targetReps: 10, startWeight: 42, note: "Ramp: 42.5/47.5/52.5/57.5. Rope at face height, pull to forehead. Critical for shoulder health and rear delt development." },
      { name: "Rear Delt Fly Machine", sets: 4, targetReps: 10, startWeight: 85, note: "Ramp: 85/95/100/110. Slow eccentric — 3 seconds down." },
      { name: "Bicep Curl Machine", sets: 4, targetReps: 10, startWeight: 50, note: "Ramp: 50/60/70/75. Full range, supinate at top." },
    ],
  },
  "Day 3": {
    label: "Legs",
    subtitle: "Quads · Hamstrings · Calves",
    color: "#27AE60",
    exercises: [
      { name: "Leg Press", sets: 4, targetReps: 10, startWeight: 230, note: "Ramp: 230/250/270/290. Feet shoulder-width. Full depth without rounding lower back." },
      { name: "Leg Extension Machine", sets: 4, targetReps: 10, startWeight: 85, note: "Ramp: 85/90/95/105. Pause 1 sec at top each rep." },
      { name: "Prone Leg Curl", sets: 4, targetReps: 10, startWeight: 60, note: "Ramp: 60/70/80/85. Control the negative — 3 seconds down." },
      { name: "Leg Curl Machine", sets: 4, targetReps: 10, startWeight: 85, note: "Ramp: 85/95/105/115. Seated variant hits slightly different hamstring angle." },
      { name: "Calf Press Machine", sets: 4, targetReps: 12, startWeight: 135, note: "Ramp: 135/150/165/180. Full stretch at bottom, full contraction at top. No bouncing." },
    ],
  },
  "Day 4": {
    label: "Shoulders + Arms",
    subtitle: "Delts · Biceps · Triceps",
    color: "#8B2AE8",
    exercises: [
      { name: "DB Lateral Raise", sets: 4, targetReps: 12, startWeight: 15, note: "Ramp: 15/17.5/20/25. Slight bend in elbow, lead with elbow not wrist. Stop at shoulder height." },
      { name: "DB Front Raise", sets: 3, targetReps: 12, startWeight: 15, note: "15lbs all sets. Alternate arms. Stop at shoulder height — no swinging." },
      { name: "Arm Curl Machine", sets: 4, targetReps: 10, startWeight: 65, note: "Ramp: 65/70/75/80. Slightly heavier than Day 2. Full supination at top." },
      { name: "Overhead Cable Tricep Extension (rope)", sets: 4, targetReps: 10, startWeight: 35, note: "Ramp: 35/40/45/50. Face away from stack, rope overhead. Loads the long head — the biggest part of the tricep." },
      { name: "Hammer Curl (DB)", sets: 3, targetReps: 12, startWeight: 25, note: "25lbs all sets. Neutral grip throughout. Builds brachialis for arm thickness." },
    ],
  },
  "Day 5": {
    label: "Core + Conditioning",
    subtitle: "Core · Low Back · Extended Cardio",
    color: "#E8A82A",
    exercises: [
      { name: "Abdominal Crunch Machine", sets: 4, targetReps: 15, startWeight: 95, note: "Ramp: 95/105/115/115. Slow and controlled. Exhale at contraction." },
      { name: "Low Back Extension Machine", sets: 4, targetReps: 10, startWeight: 145, note: "Ramp: 145/155/165/175. No hyperextension at top — stop parallel to floor." },
      { name: "Plank Hold", sets: 3, targetReps: 45, startWeight: 0, note: "45 sec holds. Build to 60 sec over 4 weeks. Neutral spine, don't let hips sag." },
      { name: "DB Romanian Deadlift", sets: 3, targetReps: 12, startWeight: 40, note: "Ramp: 40/45/50. Hip hinge — push hips back, slight knee bend. Feel the hamstring stretch." },
      { name: "Treadmill (extended)", sets: 1, targetReps: 25, startWeight: 0, note: "25 min at 3.0–3.5mph, 2–4% incline. Zone 2 cardio — you should be able to hold a conversation." },
    ],
  },
};

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
