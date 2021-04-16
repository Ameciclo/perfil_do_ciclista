import mongoose from "mongoose";

const CyclistProfileSchema = new mongoose.Schema({
  metadata: {
    sheet_index: Number,
    city: String,
    area: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    neighborhood: String,
    researcher_code: Number,
    weekday: String,
    bike_type: String,
  },
  data: {
    days_usage: {
      total: Number,
      working: Number,
      shopping: Number,
      school: Number,
      leisure: Number,
    },
    years_using: String,
    motivation_to_start: String,
    biggest_issue: String,
    collisions: String,
    neighborhood_living: String,
    transport_combination: {
      yes_no: Boolean,
      transportation: String,
    },
    age: Number,
    schooling: String,
    job: String,
    distance_time: String,
    gender: String,
    motivation_to_continue: String,
    biggest_need: String,
    color_race: String,
    neighborhood_origin: String,
    neighborhood_destiny: String,
    wage_standard: String,
  },
});

export default mongoose.model(
  "CyclistProfile",
  CyclistProfileSchema,
  "CyclistProfiles"
);
