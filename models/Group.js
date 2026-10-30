import mongoose from 'mongoose';
const GroupSchema = new mongoose.Schema({ name: { type: String, required: true, trim: true }, description: { type: String, default: '' }, monthlyContribution: { type: Number, required: true, min: 1 }, durationMonths: { type: Number, required: true, min: 1 }, startDate: { type: Date, required: true }, status: { type: String, enum: ['Active', 'Completed'], default: 'Active' } }, { timestamps: true });
export default mongoose.models.Group || mongoose.model('Group', GroupSchema);
