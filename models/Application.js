import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema(
  {
    // Who applied
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Which job they applied to
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    // Which company owns this job
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Application status — company updates this
    status: {
      type: String,
      enum: ['applied', 'viewed', 'shortlisted', 'rejected', 'hired'],
      default: 'applied',
    },

    // Cover letter / message from applicant
    coverLetter: {
      type: String,
      default: '',
    },

    // Resume URL at time of application
    // (applicant might update resume later, this keeps the original)
    resumeUrl: {
      type: String,
      default: '',
    },

    // Company notes about this applicant (private)
    companyNotes: {
      type: String,
      default: '',
    },

    applicantDetails: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      experience: { type: String, default: '' },
      noticePeriod: { type: String, default: '' },
      currentSalary: { type: String, default: '' },
      expectedSalary: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
  },
  { timestamps: true }
)

// One person can only apply to same job once
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true })
applicationSchema.index({ job: 1 })
applicationSchema.index({ company: 1 })
applicationSchema.index({ applicant: 1 })
applicationSchema.index({ status: 1 })

const Application = mongoose.models.Application ||
  mongoose.model('Application', applicationSchema)

export default Application