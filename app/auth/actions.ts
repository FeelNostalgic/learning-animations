"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function checkUsernameAvailability(username: string): Promise<{ available: boolean; error?: string }> {
  const cleanUsername = username.trim().toLowerCase()

  if (!cleanUsername) {
    return { available: false, error: "El nombre de usuario es obligatorio" }
  }

  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    return { available: false, error: "Debe tener entre 3 y 20 caracteres" }
  }

  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return { available: false, error: "Solo puede contener letras, números y guiones bajos" }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .ilike("username", cleanUsername)
    .maybeSingle()

  if (error) {
    return { available: false, error: "Error al verificar disponibilidad" }
  }

  return { available: !data }
}

export async function login(prevState: { error?: string } | null, formData: FormData) {
  const identifier = formData.get("identifier") as string
  const password = formData.get("password") as string
  const redirectTo = (formData.get("redirect") as string) || "/animations"

  if (!identifier || !password) {
    return { error: "Por favor, introduce tu usuario/email y contraseña." }
  }

  const supabase = await createClient()
  let email = identifier.trim()

  // If identifier is not an email, lookup email via username using database function
  if (!email.includes("@")) {
    const { data: userEmail, error: rpcError } = await supabase.rpc("get_email_by_username", {
      p_username: identifier.trim(),
    })

    if (rpcError || !userEmail) {
      return { error: "Nombre de usuario o contraseña incorrectos." }
    }
    email = userEmail
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "Credenciales inválidas. Comprueba tus datos." }
  }

  revalidatePath("/", "layout")
  redirect(redirectTo)
}

export async function signup(prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const username = (formData.get("username") as string)?.trim().toLowerCase()
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string

  if (!username || !email || !password) {
    return { error: "Todos los campos son obligatorios." }
  }

  // Check username availability
  const availability = await checkUsernameAvailability(username)
  if (!availability.available) {
    return { error: availability.error || "El nombre de usuario ya está en uso." }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (error) {
    return { error: error.message || "Error al crear la cuenta." }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function forgotPassword(prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const email = (formData.get("email") as string)?.trim()

  if (!email) {
    return { error: "Introduce tu correo electrónico." }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: "Error al enviar el correo de recuperación." }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
