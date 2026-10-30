import mongoose from 'mongoose';
const MemberSchema = new mongoose.Schema({ fullName: { type: String, required: true, trim: true }, email: { type: String, lowercase: true, trim: true, default: '' }, phone: { type: String, required: true, trim: true }, group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }, joiningDate: { type: Date, default: Date.now }, status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' } }, { timestamps: true });
export default mongoose.models.Member || mongoose.model('Member', MemberSchema);
