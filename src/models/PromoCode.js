import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("PromoCode", promoCodeSchema);
