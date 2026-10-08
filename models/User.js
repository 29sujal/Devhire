import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      // not required because Google OAuth users have no password
    },
    role: {
      type: String,
      enum: ['seeker', 'company', 'admin'],
      default: 'seeker',
    },
    avatar: {
      type: String,
      default: '',  // profile picture URL from Cloudinary or Google
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',  // local = email/password, google = OAuth
    },

    // Seeker profile fields
    title: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    skills: [{ type: String }],
    experience: { type: String, default: 'fresher' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    isPremium: { type: Boolean, default: false },

    // --- Company specific fields ---
    companyName: { type: String, default: '' },
    companyLogo: { type: String, default: '' },   // Cloudinary URL
    companyWebsite: { type: String, default: '' },
    companyDescription: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }, // admin approves companies

  },
  { timestamps: true }
)

// Hash password before saving — same as Taskify
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method — same as Taskify
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false  // Google OAuth user has no password
  return await bcrypt.compare(enteredPassword, this.password)
}

// Indexes for faster queries
userSchema.index({ role: 1 })

// Prevent model recompilation error in Next.js
// Next.js hot reloads — without this check it tries to create
// the model again and throws an error
const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User