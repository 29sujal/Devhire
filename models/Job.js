import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: [{ type: String }],     // ["3 years React", "Node.js"]
    skills: [{ type: String }],           // ["React", "MongoDB"]
    location: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'remote', 'internship', 'contract'],
      default: 'full-time',
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    experience: {
      type: String,
      enum: ['fresher', '1-2 years', '2-5 years', '5+ years'],
      default: 'fresher',
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
    isPaid: {
      type: Boolean,
      default: false,   // becomes true after Razorpay payment
    },
    paymentId: { type: String, default: '' },

    // Reference to company who posted this job
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: { type: String, required: true },
    companyLogo: { type: String, default: '' },

    // Track how many people viewed this job
    views: { type: Number, default: 0 },

    // Track total applications
    applicationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Indexes for search and filter performance
jobSchema.index({ status: 1 })
jobSchema.index({ company: 1 })
jobSchema.index({ jobType: 1 })
jobSchema.index({ location: 1 })
jobSchema.index({ skills: 1 })
jobSchema.index({ createdAt: -1 })
jobSchema.index({ title: 'text', description: 'text', skills: 'text' })

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema)

export default Job