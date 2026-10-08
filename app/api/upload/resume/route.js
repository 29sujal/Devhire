import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { authenticate } from '@/lib/auth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'devhire/resumes',
          access_mode: 'public',
          type: 'upload',
          public_id: `resume_${auth.userId}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })
    // Force correct content-type for PDF viewing
    const viewUrl = result.secure_url.replace(
      '/raw/upload/',
      '/raw/upload/fl_attachment/'
    )

    return NextResponse.json({ url: result.secure_url, viewUrl })
  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 })
  }
}