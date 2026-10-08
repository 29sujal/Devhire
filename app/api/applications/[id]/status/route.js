import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Application from '@/models/Application'
import { authenticate } from '@/lib/auth'

export async function PATCH(request, { params }) {
  try {
    await connectDB()

    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { status } = await request.json()
    const validStatuses = ['applied', 'viewed', 'shortlisted', 'rejected', 'hired']

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 })
    }

    const application = await Application.findOneAndUpdate(
      { _id: params.id, company: auth.userId },
      { status },
      { new: true }
    ).populate('job', 'title').populate('applicant', 'name')

    if (!application) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 })
    }

    // Send real-time notification to applicant
    if (global.io) {
      const notification = {
        type: 'status_update',
        status,
        jobTitle: application.job?.title || 'Job',
        message: getStatusMessage(status, application.job?.title),
        timestamp: new Date(),
      }
      global.io.to(`user_${application.applicant._id}`).emit('notification', notification)
    }

    return NextResponse.json(application)
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

function getStatusMessage(status, jobTitle) {
  const messages = {
    viewed:      `Your application for ${jobTitle} was viewed by the company`,
    shortlisted: `Great news! You've been shortlisted for ${jobTitle} 🎉`,
    rejected:    `Update on your application for ${jobTitle}`,
    hired:       `Congratulations! You've been hired for ${jobTitle} 🎊`,
  }
  return messages[status] || `Your application status updated to ${status}`
}