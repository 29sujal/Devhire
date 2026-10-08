import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken } from '@/lib/auth'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // User cancelled Google login
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=cancelled`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=no_code`
      )
    }

    // Step 1 — Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }).toString(),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      console.error('Google token exchange failed:', {
        status: tokenRes.status,
        error: tokenData.error,
        error_description: tokenData.error_description,
      })

      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=token_failed`
      )
    }

    // Step 2 — Get user info from Google
    const userRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    )

    const googleUser = await userRes.json()

    console.log('Google user:', googleUser.email)

    if (!googleUser.email) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=no_email`
      )
    }

    // Step 3 — Find or create user in MongoDB
    await connectDB()

    let user = await User.findOne({
      email: googleUser.email,
    })

    let isNewUser = false

    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.picture,
        authProvider: 'google',
        role: 'seeker',
      })

      isNewUser = true
    } else {
      if (!user.avatar && googleUser.picture) {
        user.avatar = googleUser.picture
        await user.save()
      }
    }

    // Step 4 — Generate DevHire JWT
    const token = generateToken(user._id)

    // Step 5 — Redirect to auth callback
    const redirectUrl = new URL(
      `${process.env.NEXTAUTH_URL}/auth/callback`
    )

    redirectUrl.searchParams.set('token', token)
    redirectUrl.searchParams.set(
      'userId',
      user._id.toString()
    )
    redirectUrl.searchParams.set('name', user.name)
    redirectUrl.searchParams.set('email', user.email)
    redirectUrl.searchParams.set('role', user.role)
    redirectUrl.searchParams.set(
      'avatar',
      user.avatar || ''
    )
    redirectUrl.searchParams.set(
      'isNew',
      isNewUser.toString()
    )
    redirectUrl.searchParams.set(
      'isPremium',
      (user.isPremium || false).toString()
    )

    return NextResponse.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('Google OAuth error:', error)

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?error=server_error`
    )
  }
}