"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { universalAnimationSchema } from "@/lib/validations/universal-animation"
import type { UniversalAnimationData } from "@/types/universal-animation"

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
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    if (validData.id) {
      // Update existing
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
      // Insert new
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

export async function getAnimationById(
  id: string
): Promise<{ success: boolean; data?: UniversalAnimationData; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("animations")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      return { success: false, error: error?.message || "Animación no encontrada" }
    }

    return {
      success: true,
      data: {
        id: data.id,
        title: data.title,
        description: data.description || "",
        discipline: data.discipline || "general",
        topic: data.topic,
        tags: data.tags || [],
        difficulty: data.difficulty || "beginner",
        is_public: data.is_public ?? false,
        nodes: (data.nodes || []) as any,
        connectors: (data.connectors || data.links || []) as any,
        steps: (data.steps || []) as any,
        user_id: data.user_id,
        views_count: data.views_count || 0,
        likes_count: data.likes_count || 0,
        forked_from: data.forked_from,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Error al obtener la animación" }
  }
}

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
        nodes: (item.nodes || []) as any,
        connectors: (item.connectors || item.links || []) as any,
        steps: (item.steps || []) as any,
        user_id: item.user_id,
        views_count: item.views_count || 0,
        likes_count: item.likes_count || 0,
        forked_from: item.forked_from,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Error al obtener animaciones del usuario" }
  }
}

export async function deleteAnimation(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("animations").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/my-animations")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "Error al eliminar la animación" }
  }
}
