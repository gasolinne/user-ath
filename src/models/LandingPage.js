import mongoose from "mongoose";

const landingPageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    bannerText: { type: String },
    aboutUs: { type: String },
    contactInfo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("LandingPage", landingPageSchema);
