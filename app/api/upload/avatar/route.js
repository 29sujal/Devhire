import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { authenticate } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'devhire/avatars',
          transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face' }
          ],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    // Update avatar in DB
    await connectDB()
    await User.findByIdAndUpdate(auth.userId, { avatar: result.secure_url })

    return NextResponse.json({ url: result.secure_url })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 })
  }
}