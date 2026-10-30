import mongoose from 'mongoose';
const ContributionSchema = new mongoose.Schema({ member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true }, group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }, month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ }, amount: { type: Number, required: true, min: 0.01 }, paymentStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' }, paymentDate: { type: Date, default: null }, note: { type: String, default: '' } }, { timestamps: true });
ContributionSchema.index({ member: 1, group: 1, month: 1 }, { unique: true });
export default mongoose.models.Contribution || mongoose.model('Contribution', ContributionSchema);
