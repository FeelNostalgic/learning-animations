"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { universalAnimationSchema } from "@/lib/validations/universal-animation"
import type { UniversalAnimationData } from "@/types/universal-animation"

/**
 * Saves or updates a universal animation in Supabase.
 */
export async function saveAnimation(
  data: UniversalAnimationData
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "Debes iniciar sesión para guardar la animación." }
    }

    // Server-side Zod validation
    const validationResult = universalAnimationSchema.safeParse(data)
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((i) => i.message).join(", ")
      return { success: false, error: `Error de validación: ${errorMsg}` }
    }

    const validData = validationResult.data

    const payload = {
      title: validData.title,
      description: validData.description || "",
      discipline: validData.discipline || "general",
      topic: validData.topic,
      tags: validData.tags || [],
      difficulty: validData.difficulty || "beginner",
      is_public: validData.is_public ?? false,
      nodes: validData.nodes as any,
      connectors: (validData.connectors || []) as any,
      links: (validData.connectors || []) as any, // Backwards compatibility
      steps: validData.steps as any,
      background: validData.background as any,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    if (validData.id) {
      // Update existing animation (RLS ensures user owns the row)
      const { data: updated, error } = await supabase
        .from("animations")
        .update(payload)
        .eq("id", validData.id)
        .select("id")
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      revalidatePath("/animations")
      revalidatePath("/my-animations")
      revalidatePath(`/my-animations/${validData.id}`)
      return { success: true, id: updated.id }
    } else {
      // Insert brand new animation
      const { data: inserted, error } = await supabase
        .from("animations")
        .insert(payload)
        .select("id")
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      revalidatePath("/animations")
      revalidatePath("/my-animations")
      return { success: true, id: inserted.id }
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Error al guardar en Supabase" }
  }
}

/**
 * Retrieves a single animation by its UUID.
 */
export async function getAnimationById(
  id: string
): Promise<{ success: boolean; data?: UniversalAnimationData; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes("placeholder-project")) {
      return { success: false, error: "Animación no encontrada" }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("animations")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      return { success: false, error: error?.message || "Animación no encontrada" }
    }

    const raw: UniversalAnimationData = {
      id: data.id,
      title: data.title,
      description: data.description || "",
      discipline: data.discipline || "general",
      topic: data.topic,
      tags: data.tags || [],
      difficulty: data.difficulty || "beginner",
      is_public: data.is_public ?? false,
      background: (data.background as any) ?? undefined,
      nodes: (data.nodes || []) as any,
      connectors: (data.connectors || data.links || []) as any,
      steps: (data.steps || []) as any,
      user_id: data.user_id,
      views_count: data.views_count || 0,
      likes_count: data.likes_count || 0,
      forked_from: data.forked_from ?? undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
    // Sanitize nulls from legacy DB rows (props: null, background: null, interaction: null, etc.)
    const parsed = universalAnimationSchema.safeParse(raw)
    const sanitized = parsed.success ? (parsed.data as UniversalAnimationData) : raw

    return {
      success: true,
      data: sanitized,
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Error al obtener la animación" }
  }
}

/**
 * Retrieves all animations created by the authenticated user.
 */
export async function getUserAnimations(): Promise<{
  success: boolean
  data?: UniversalAnimationData[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "No autenticado" }
    }

    const { data, error } = await supabase
      .from("animations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || "",
        discipline: item.discipline || "general",
        topic: item.topic,
        tags: item.tags || [],
        difficulty: item.difficulty || "beginner",
        is_public: item.is_public ?? false,
        background: (item.background as any) ?? undefined,
        nodes: (item.nodes || []) as any,
        connectors: (item.connectors || item.links || []) as any,
        steps: (item.steps || []) as any,
        user_id: item.user_id,
        views_count: item.views_count || 0,
        likes_count: item.likes_count || 0,
        forked_from: item.forked_from ?? undefined,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Error al obtener animaciones del usuario" }
  }
}

/**
 * Toggles the public/private visibility state of an animation.
 */
export async function toggleAnimationVisibility(
  id: string,
  is_public: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "No autenticado" }
    }

    const { error } = await supabase
      .from("animations")
      .update({ is_public, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/animations")
    revalidatePath("/my-animations")
    revalidatePath(`/my-animations/${id}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "Error al cambiar visibilidad" }
  }
}

/**
 * Clones/forks an existing animation into a new draft for the current user.
 */
export async function forkAnimation(
  sourceId: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "Debes iniciar sesión para duplicar la animación." }
    }

    const sourceRes = await getAnimationById(sourceId)
    if (!sourceRes.success || !sourceRes.data) {
      return { success: false, error: "Animación de origen no encontrada" }
    }

    const source = sourceRes.data

    const payload = {
      title: `${source.title} (Copia)`,
      description: source.description || "",
      discipline: source.discipline || "general",
      topic: source.topic,
      tags: source.tags || [],
      difficulty: source.difficulty || "beginner",
      is_public: false,
      nodes: source.nodes as any,
      connectors: (source.connectors || []) as any,
      links: (source.connectors || []) as any,
      steps: source.steps as any,
      background: source.background as any,
      user_id: user.id,
      forked_from: source.id,
      updated_at: new Date().toISOString(),
    }

    const { data: inserted, error } = await supabase
      .from("animations")
      .insert(payload)
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/my-animations")
    return { success: true, id: inserted.id }
  } catch (err: any) {
    return { success: false, error: err.message || "Error al duplicar la animación" }
  }
}

/**
 * Deletes an animation permanently.
 */
export async function deleteAnimation(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("animations").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/animations")
    revalidatePath("/my-animations")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "Error al eliminar la animación" }
  }
}

/**
 * Retrieves all publicly shared animations from the community.
 */
export async function getPublicAnimations(): Promise<{
  success: boolean
  data?: UniversalAnimationData[]
  error?: string
}> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes("placeholder-project")) {
      return { success: true, data: [] }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("animations")
      .select("*")
      .eq("is_public", true)
      .order("updated_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || "",
        discipline: item.discipline || "general",
        topic: item.topic,
        tags: item.tags || [],
        difficulty: item.difficulty || "beginner",
        is_public: true,
        background: (item.background as any) ?? undefined,
        nodes: (item.nodes || []) as any,
        connectors: (item.connectors || item.links || []) as any,
        steps: (item.steps || []) as any,
        user_id: item.user_id,
        views_count: item.views_count || 0,
        likes_count: item.likes_count || 0,
        forked_from: item.forked_from ?? undefined,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Error al obtener animaciones públicas" }
  }
}

