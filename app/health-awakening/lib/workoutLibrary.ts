export type WorkoutTag = "full" | "upper" | "lower" | "push" | "pull" | "core" | "cardio";

export type WorkoutExercise = {
  id: string;
  name: string;
  description: string;
  targetAreas: string[];
  equipment: "bodyweight" | "chair" | "dumbbells" | "band" | "mixed";
};

export type WorkoutTemplate = {
  tag: WorkoutTag;
  label: string;
  level: "beginner" | "intermediate";
  focus: string;
  exercises: WorkoutExercise[];
  notes?: string;
};

export const WORKOUT_LIBRARY: WorkoutTemplate[] = [
  {
    tag: "cardio",
    label: "Cardio · Walking Focus",
    level: "beginner",
    focus: "Gentle walking-based cardio to help blood sugar and stamina without stressing the joints.",
    exercises: [
      {
        id: "cardio-brisk-walk-flat",
        name: "Brisk Walk (Flat)",
        description: "Walk on flat ground at a pace where breathing is a little faster but you can still talk.",
        targetAreas: ["legs", "heart"],
        equipment: "bodyweight",
      },
      {
        id: "cardio-walk-intervals",
        name: "Walk Intervals (2 min easy / 1 min faster)",
        description: "Alternate 2 minutes of easy walking with 1 minute faster walking for several rounds.",
        targetAreas: ["legs", "heart"],
        equipment: "bodyweight",
      },
      {
        id: "cardio-march-in-place",
        name: "Indoor Marching in Place",
        description: "March on the spot, lifting the knees gently and swinging the arms while you watch or listen to something.",
        targetAreas: ["legs", "heart"],
        equipment: "bodyweight",
      },
    ],
    notes: "Pick one option per day for now. The calendar tracks minutes via the Walk field; this library just describes what that walking looks like.",
  },
  {
    tag: "full",
    label: "Full Body A · Chair & Wall",
    level: "beginner",
    focus: "Simple full-body routine using a chair and wall, focused on balance and basic strength.",
    exercises: [
      {
        id: "fullA-chair-squat",
        name: "Chair Squats",
        description: "Stand up from a chair and sit back down slowly, keeping control and your knees comfortable.",
        targetAreas: ["quads", "glutes"],
        equipment: "chair",
      },
      {
        id: "fullA-wall-pushup",
        name: "Wall Push-ups",
        description: "Hands on wall, body at an angle. Lower chest toward the wall and push back.",
        targetAreas: ["chest", "shoulders", "triceps"],
        equipment: "bodyweight",
      },
      {
        id: "fullA-hip-bridge",
        name: "Hip Bridges",
        description: "Lie on your back (floor or firm bed), feet on the surface, lift hips and squeeze glutes.",
        targetAreas: ["glutes", "hamstrings"],
        equipment: "bodyweight",
      },
      {
        id: "fullA-row",
        name: "Bent-over Row (Bottle or Dumbbell)",
        description: "One hand on a chair for support, pull a bottle or dumbbell from below the knee up toward the ribs.",
        targetAreas: ["upper back", "biceps"],
        equipment: "dumbbells",
      },
      {
        id: "fullA-dead-bug",
        name: "Dead Bug",
        description: "On your back, arms up, legs bent 90°. Extend opposite arm and leg slowly while keeping lower back stable.",
        targetAreas: ["core"],
        equipment: "bodyweight",
      },
    ],
    notes: "Good starting template for a full-body day. Later GAIA can suggest set/reps; for now it is just a structured list.",
  },
  {
    tag: "full",
    label: "Full Body B · Legs & Shoulders",
    level: "beginner",
    focus: "Alternate full-body option with more focus on legs and shoulders.",
    exercises: [
      {
        id: "fullB-static-lunge",
        name: "Static Lunge / Split Stance Hold",
        description: "One foot forward, one back. Either hold the stance or do small controlled up/down movements.",
        targetAreas: ["quads", "glutes"],
        equipment: "bodyweight",
      },
      {
        id: "fullB-incline-pushup",
        name: "Incline Push-ups (Table or Sofa)",
        description: "Hands on a stable edge, body straight, lower chest toward the edge and push back.",
        targetAreas: ["chest", "shoulders", "triceps"],
        equipment: "bodyweight",
      },
      {
        id: "fullB-rdl",
        name: "Romanian Deadlift (Light Dumbbells)",
        description: "Slight knee bend, push hips back while keeping back neutral, then stand back up.",
        targetAreas: ["hamstrings", "glutes", "lower back"],
        equipment: "dumbbells",
      },
      {
        id: "fullB-shoulder-press",
        name: "Dumbbell Shoulder Press",
        description: "Seated or standing, press weights from shoulders up above the head with control.",
        targetAreas: ["shoulders", "triceps"],
        equipment: "dumbbells",
      },
      {
        id: "fullB-knee-plank",
        name: "Knee Plank",
        description: "Plank position on forearms and knees, keeping body straight from shoulders to knees.",
        targetAreas: ["core", "shoulders"],
        equipment: "bodyweight",
      },
    ],
  },
  {
    tag: "upper",
    label: "Upper Body · Push & Pull Mix",
    level: "beginner",
    focus: "Upper body strength using simple pushing and pulling moves.",
    exercises: [
      {
        id: "upper-incline-pushup",
        name: "Incline Push-ups",
        description: "Push-ups with hands on a higher surface, easier than floor but harder than wall.",
        targetAreas: ["chest", "triceps", "shoulders"],
        equipment: "bodyweight",
      },
      {
        id: "upper-row",
        name: "One-arm Row",
        description: "One hand supported on a chair, pull a weight from below the knee up to the ribs.",
        targetAreas: ["upper back", "biceps"],
        equipment: "dumbbells",
      },
      {
        id: "upper-shoulder-press",
        name: "Dumbbell Shoulder Press",
        description: "Press weights from shoulders up overhead in a controlled motion.",
        targetAreas: ["shoulders", "triceps"],
        equipment: "dumbbells",
      },
      {
        id: "upper-curl",
        name: "Dumbbell Curl",
        description: "Hold weights at your sides, curl them toward your shoulders without swinging.",
        targetAreas: ["biceps"],
        equipment: "dumbbells",
      },
      {
        id: "upper-triceps-extension",
        name: "Overhead Triceps Extension",
        description: "Hold one weight with both hands behind your head, extend arms to lift the weight upward.",
        targetAreas: ["triceps"],
        equipment: "dumbbells",
      },
    ],
  },
  {
    tag: "lower",
    label: "Lower Body · Chair & Floor",
    level: "beginner",
    focus: "Legs and glutes work with simple movements and balance focus.",
    exercises: [
      {
        id: "lower-chair-squat",
        name: "Chair Squats",
        description: "Controlled sit-to-stand from a chair, keeping feet planted and knees tracked over toes.",
        targetAreas: ["quads", "glutes"],
        equipment: "chair",
      },
      {
        id: "lower-split-stance",
        name: "Split Stance Hold",
        description: "Step one foot forward and one back, hold the position to train balance and legs.",
        targetAreas: ["quads", "glutes"],
        equipment: "bodyweight",
      },
      {
        id: "lower-hip-bridge",
        name: "Hip Bridges",
        description: "Lift hips up from the floor, squeezing glutes at the top.",
        targetAreas: ["glutes", "hamstrings"],
        equipment: "bodyweight",
      },
      {
        id: "lower-calf-raises",
        name: "Standing Calf Raises",
        description: "Hold a chair for balance, rise onto the balls of your feet and lower slowly.",
        targetAreas: ["calves"],
        equipment: "chair",
      },
      {
        id: "lower-side-leg-raise",
        name: "Side Leg Raises",
        description: "Standing or lying, lift the leg out to the side slowly and lower with control.",
        targetAreas: ["outer hips"],
        equipment: "bodyweight",
      },
    ],
  },
  {
    tag: "push",
    label: "Push Day · Chest & Shoulders",
    level: "beginner",
    focus: "Pushing muscles: chest, shoulders, triceps.",
    exercises: [
      {
        id: "push-incline-pushup",
        name: "Incline Push-ups",
        description: "Hands on table or sofa, lower chest toward the edge and press back.",
        targetAreas: ["chest", "shoulders", "triceps"],
        equipment: "bodyweight",
      },
      {
        id: "push-shoulder-press",
        name: "Dumbbell Shoulder Press",
        description: "Press weights from shoulders to overhead and back with control.",
        targetAreas: ["shoulders", "triceps"],
        equipment: "dumbbells",
      },
      {
        id: "push-chair-dips",
        name: "Chair Dips (short range)",
        description: "Hands on chair edge behind you, lower a little and press up; keep range small and shoulders comfortable.",
        targetAreas: ["triceps", "shoulders"],
        equipment: "chair",
      },
      {
        id: "push-knee-plank",
        name: "Knee Plank",
        description: "Hold a plank on forearms and knees, keeping body straight from shoulders to knees.",
        targetAreas: ["core", "shoulders"],
        equipment: "bodyweight",
      },
    ],
  },
  {
    tag: "pull",
    label: "Pull Day · Back & Biceps",
    level: "beginner",
    focus: "Pulling muscles: upper back and biceps.",
    exercises: [
      {
        id: "pull-row",
        name: "Bent-over Row",
        description: "Hinge at hips and pull weights toward the lower ribs.",
        targetAreas: ["upper back", "biceps"],
        equipment: "dumbbells",
      },
      {
        id: "pull-one-arm-row",
        name: "One-arm Supported Row",
        description: "One hand on a chair for support, pull the weight up toward the ribs with the other hand.",
        targetAreas: ["upper back", "biceps"],
        equipment: "dumbbells",
      },
      {
        id: "pull-hammer-curl",
        name: "Hammer Curls",
        description: "Hold weights with thumbs pointing forward and curl them up without swinging.",
        targetAreas: ["biceps", "forearms"],
        equipment: "dumbbells",
      },
    ],
  },
  {
    tag: "core",
    label: "Core Day · Safe Basics",
    level: "beginner",
    focus: "Deep core and stability without extreme crunches or twisting.",
    exercises: [
      {
        id: "core-dead-bug",
        name: "Dead Bug",
        description: "On your back, extend opposite arm and leg slowly while keeping lower back on the floor.",
        targetAreas: ["core"],
        equipment: "bodyweight",
      },
      {
        id: "core-bird-dog",
        name: "Bird Dog",
        description: "On hands and knees, extend opposite arm and leg, then switch sides.",
        targetAreas: ["core", "lower back"],
        equipment: "bodyweight",
      },
      {
        id: "core-side-plank-knees",
        name: "Side Plank (Knees Bent)",
        description: "Side plank with knees on the floor to reduce load, hold for time.",
        targetAreas: ["obliques", "core"],
        equipment: "bodyweight",
      },
      {
        id: "core-glute-bridge",
        name: "Glute Bridge",
        description: "Hip lift focusing on glutes but also supporting core stability.",
        targetAreas: ["glutes", "core"],
        equipment: "bodyweight",
      },
      {
        id: "core-seated-knee-lifts",
        name: "Seated Knee Lifts",
        description: "Sit on a chair, hold the sides, lift one knee at a time with control.",
        targetAreas: ["hip flexors", "core"],
        equipment: "chair",
      },
    ],
  },
];

export function getWorkoutTemplatesByTag(tag: WorkoutTag): WorkoutTemplate[] {
  return WORKOUT_LIBRARY.filter((template) => template.tag === tag);
}

export const WORKOUT_TAG_LABELS: Record<WorkoutTag, string> = {
  full: "Full body",
  upper: "Upper body",
  lower: "Lower body",
  push: "Push",
  pull: "Pull",
  core: "Core / Abs",
  cardio: "Cardio / Walking",
};