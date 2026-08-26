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
    title: res.data ? `Animación: ${res.data.title}` : "Animación",
  }
}

export default async function UserAnimationDetailPage({
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
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <AnimationPlayer
        steps={anim.steps}
        title={anim.title}
        embedSlugOrId={anim.id}
        isDynamic={true}
        editHref={`/builder?id=${anim.id}`}
      >
        <DynamicAnimationPlayer animation={anim} />
      </AnimationPlayer>
    </div>
  )
}
