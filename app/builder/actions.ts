"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { DynamicAnimationData } from "@/types/dynamic-animation"

export async function saveAnimation(
  data: DynamicAnimationData
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

    if (!data.title || !data.topic) {
      return { success: false, error: "El título y el tema son obligatorios." }
    }

    if (!data.nodes || data.nodes.length === 0) {
      return { success: false, error: "La animación debe tener al menos un nodo." }
    }

    if (!data.steps || data.steps.length === 0) {
      return { success: false, error: "La animación debe tener al menos un paso." }
    }

    const payload = {
      title: data.title,
      description: data.description || "",
      topic: data.topic,
      nodes: data.nodes as any,
      links: (data.links || []) as any,
      steps: data.steps as any,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    if (data.id) {
      // Update existing
      const { data: updated, error } = await supabase
        .from("animations")
        .update(payload)
        .eq("id", data.id)
        .select("id")
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      revalidatePath("/animations")
      revalidatePath("/my-animations")
      revalidatePath(`/my-animations/${data.id}`)
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
): Promise<{ success: boolean; data?: DynamicAnimationData; error?: string }> {
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
        description: data.description,
        topic: data.topic,
        nodes: data.nodes as any,
        links: data.links as any,
        steps: data.steps as any,
        user_id: data.user_id,
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
  data?: DynamicAnimationData[]
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
        description: item.description,
        topic: item.topic,
        nodes: item.nodes as any,
        links: item.links as any,
        steps: item.steps as any,
        user_id: item.user_id,
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
