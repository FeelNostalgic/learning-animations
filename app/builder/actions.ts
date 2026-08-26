"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { DynamicAnimationData } from "@/types/dynamic-animation"

export async function saveAnimation(data: DynamicAnimationData): Promise<{ success: boolean; id?: string; error?: string }> {
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
      nodes: data.nodes,
      links: data.links || [],
      steps: data.steps,
      user_id: user.id,
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
      return { success: true, id: inserted.id }
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Error al guardar en Supabase" }
  }
}
