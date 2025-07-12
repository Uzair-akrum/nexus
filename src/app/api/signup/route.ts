import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createSupabaseServiceClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Basic validation
    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { message: "Invalid input. Password must be at least 8 characters long." },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use." },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const { error } = await supabase
      .from('users')
      .insert([
        {
          email,
          hashed_password: hashedPassword,
        },
      ])

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json(
        { message: "Failed to create user." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "User created successfully." },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    )
  }
} 