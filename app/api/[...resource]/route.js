import { auth } from '../../../auth.js';
import { connectDB } from '../../../lib/mongodb.js';
import Group from '../../../models/Group.js';
import Member from '../../../models/Member.js';
import Contribution from '../../../models/Contribution.js';
import { groupSchema, memberSchema, contributionSchema } from '../../../lib/validations.js';
import mongoose from 'mongoose';

const resources = { groups: Group, members: Member, contributions: Contribution };
const json = (data, status = 200) => Response.json(data, { status });
const normalize = (data) => {
  const obj = { ...data };
  if (obj.paymentDate === '') obj.paymentDate = null;
  if (obj.paymentStatus === 'Pending') obj.paymentDate = null;
  return obj;
};

export async function GET(request, { params }) {
  if (!(await auth())) return json({ error: 'Unauthorized' }, 401);
  await connectDB();
  const { resource: rawResource } = await params;
  const resource = Array.isArray(rawResource) ? rawResource.at(-1) : rawResource;
  const search = new URL(request.url).searchParams;
  if (resource === 'dashboard') {
    const [groups, members, paid, pending, recent, monthly, expectedMonthly] = await Promise.all([
      Group.countDocuments(), Member.countDocuments({ status: 'Active' }), Contribution.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Contribution.aggregate([{ $match: { paymentStatus: 'Pending' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Contribution.find().sort({ createdAt: -1 }).limit(8).populate('member', 'fullName').populate('group', 'name'),
      Contribution.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: '$month', collected: { $sum: '$amount' } } }, { $sort: { _id: 1 } }, { $limit: 12 }]),
      Group.aggregate([{ $lookup: { from: 'members', let: { groupId: '$_id' }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$group', '$$groupId'] }, { $eq: ['$status', 'Active'] }] } } }, { $count: 'count' }], as: 'memberStats' } }, { $project: { monthly: { $multiply: ['$monthlyContribution', { $ifNull: [{ $arrayElemAt: ['$memberStats.count', 0] }, 0] }] } } }, { $group: { _id: null, total: { $sum: '$monthly' } } }])
    ]);
    return json({ groups, members, collected: paid[0]?.total || 0, pending: pending[0]?.total || 0, expectedMonthly: expectedMonthly[0]?.total || 0, recent, monthly });
  }
  if (resource === 'groups') {
    const groups = await Group.find({}).sort({ createdAt: -1 }).lean();
    const counts = await Member.aggregate([{ $match: { status: 'Active' } }, { $group: { _id: '$group', count: { $sum: 1 } } }]);
    const byId = new Map(counts.map(x => [String(x._id), x.count]));
    return json(groups.map(g => ({ ...g, memberCount: byId.get(String(g._id)) || 0, monthlyCollection: (byId.get(String(g._id)) || 0) * g.monthlyContribution })));
  }
  if (resource === 'reports') {
    const [paid, pending, groups, monthly, members] = await Promise.all([
      Contribution.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Contribution.aggregate([{ $match: { paymentStatus: 'Pending' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Contribution.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: '$group', total: { $sum: '$amount' } } }, { $lookup: { from: 'groups', localField: '_id', foreignField: '_id', as: 'group' } }, { $unwind: '$group' }, { $project: { name: '$group.name', total: 1 } }]),
      Contribution.aggregate([{ $group: { _id: '$month', paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$amount', 0] } }, pending: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, '$amount', 0] } } } }, { $sort: { _id: 1 } }]),
      Contribution.aggregate([{ $group: { _id: '$member', paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, 1, 0] } }, pending: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, 1, 0] } }, total: { $sum: '$amount' }, group: { $first: '$group' } } }, { $lookup: { from: 'members', localField: '_id', foreignField: '_id', as: 'member' } }, { $unwind: '$member' }, { $lookup: { from: 'groups', localField: 'group', foreignField: '_id', as: 'groupInfo' } }, { $unwind: { path: '$groupInfo', preserveNullAndEmptyArrays: true } }, { $project: { name: '$member.fullName', group: '$groupInfo.name', paid: 1, pending: 1, total: 1 } }])
    ]);
    return json({ collected: paid[0]?.total || 0, pending: pending[0]?.total || 0, groups, monthly, members });
  }
  const Model = resources[resource];
  if (!Model) return json({ error: 'Unknown resource' }, 404);
  const filter = {};
  if (search.get('q') && resource === 'members') filter.$or = [{ fullName: { $regex: search.get('q'), $options: 'i' } }, { email: { $regex: search.get('q'), $options: 'i' } }, { phone: { $regex: search.get('q'), $options: 'i' } }];
  if (search.get('group') && ['members', 'contributions'].includes(resource)) filter.group = search.get('group');
  if (search.get('status') && resource === 'members') filter.status = search.get('status');
  if (search.get('status') && resource === 'contributions') filter.paymentStatus = search.get('status');
  if (search.get('month')) filter.month = search.get('month');
  let query = Model.find(filter).sort({ createdAt: -1 });
  if (resource === 'members' && search.get('group')) {
    filter.status = 'Active';
    return json(await Model.find(filter).sort({ fullName: 1 }).lean());
  }
  if (resource === 'members') query = query.populate('group', 'name');
  if (resource === 'contributions') query = query.populate('member', 'fullName').populate('group', 'name');
  return json(await query);
}

export async function POST(request, { params }) {
  if (!(await auth())) return json({ error: 'Unauthorized' }, 401);
  await connectDB();
  const { resource: rawResource } = await params;
  const resource = Array.isArray(rawResource) ? rawResource.at(-1) : rawResource;
  const Model = resources[resource];
  if (!Model) return json({ error: 'Unknown resource' }, 404);
  const body = await request.json();
  const schema = { groups: groupSchema, members: memberSchema, contributions: contributionSchema }[resource];
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message || 'Invalid data' }, 400);
  try {
    const data = normalize(parsed.data);
    if (resource === 'contributions') {
      const member = await Member.findById(data.member);
      if (!member || member.group.toString() !== data.group) return json({ error: 'Selected member does not belong to this group' }, 400);
    }
    if (resource === 'members' && !(await Group.exists({ _id: data.group }))) return json({ error: 'Select a valid group' }, 400);
    return json(await Model.create(data), 201);
  } catch (error) {
    if (error.code === 11000) return json({ error: 'A contribution already exists for this member, group and month' }, 409);
    throw error;
  }
}

export async function PUT(request, { params }) {
  if (!(await auth())) return json({ error: 'Unauthorized' }, 401);
  await connectDB();
  const { resource: rawResource } = await params;
  const resource = Array.isArray(rawResource) ? rawResource.at(-1) : rawResource;
  const Model = resources[resource];
  if (!Model) return json({ error: 'Unknown resource' }, 404);
  const { id, ...body } = await request.json();
  if (!mongoose.isValidObjectId(id)) return json({ error: 'Invalid record ID' }, 400);
  const schema = { groups: groupSchema, members: memberSchema, contributions: contributionSchema }[resource];
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message || 'Invalid data' }, 400);
  try {
    const data = normalize(parsed.data);
    if (resource === 'contributions') {
      const member = await Member.findById(data.member);
      if (!member || member.group.toString() !== data.group) return json({ error: 'Selected member does not belong to this group' }, 400);
    }
    const updated = await Model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return updated ? json(updated) : json({ error: 'Record not found' }, 404);
  } catch (error) {
    if (error.code === 11000) return json({ error: 'A contribution already exists for this member, group and month' }, 409);
    throw error;
  }
}

export async function DELETE(request, { params }) {
  if (!(await auth())) return json({ error: 'Unauthorized' }, 401);
  await connectDB();
  const { resource: rawResource } = await params;
  const resource = Array.isArray(rawResource) ? rawResource.at(-1) : rawResource;
  const Model = resources[resource];
  if (!Model) return json({ error: 'Unknown resource' }, 404);
  const id = new URL(request.url).searchParams.get('id');
  if (!mongoose.isValidObjectId(id)) return json({ error: 'Invalid record ID' }, 400);
  if (resource !== 'contributions') {
    const reference = resource === 'groups' ? { group: id } : { member: id };
    if (await Contribution.exists(reference)) return json({ error: 'This record has contribution history and cannot be deleted' }, 409);
    if (resource === 'groups' && await Member.exists({ group: id })) return json({ error: 'This group still has members. Move or delete them first.' }, 409);
  }
  const deleted = await Model.findByIdAndDelete(id);
  return deleted ? json({ success: true }) : json({ error: 'Record not found' }, 404);
}
