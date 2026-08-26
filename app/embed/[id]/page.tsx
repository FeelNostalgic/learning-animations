import { notFound } from "next/navigation"
import { getAnimationById } from "@/app/builder/actions"
import { AnimationPlayer } from "@/components/animations/animation-player"
import { DynamicAnimationPlayer } from "@/components/animations/dynamic-animation-player"
import { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const res = await getAnimationById(id)
  return {
    title: res.data ? `${res.data.title} (Embed)` : "Animación",
  }
}

export default async function DynamicEmbedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const res = await getAnimationById(id)

  if (!res.success || !res.data) {
    notFound()
  }

  const anim = res.data

  return (
    <div className="h-screen w-screen p-2 bg-background overflow-hidden flex flex-col">
      <AnimationPlayer steps={anim.steps} title={anim.title}>
        <DynamicAnimationPlayer animation={anim} />
      </AnimationPlayer>
    </div>
  )
}
