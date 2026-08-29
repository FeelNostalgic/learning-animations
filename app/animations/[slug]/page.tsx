import { notFound } from "next/navigation"
import { animationComponentMap } from "@/components/animations/animation-component-map"
import { animationRegistry } from "@/lib/animations/registry"
import { getAnimationById } from "@/app/builder/actions"
import { AnimationPlayer } from "@/components/animations/animation-player"
import { UniversalAnimationPlayer } from "@/components/animations/universal-animation-player"
import { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const meta = animationRegistry.find((a) => a.slug === slug)
  if (meta) {
    return { title: `Animación: ${meta.title}` }
  }

  const res = await getAnimationById(slug)
  if (res.success && res.data) {
    return { title: `Animación: ${res.data.title}` }
  }

  return {
    title: "Animación Educativa",
  }
}

type Slug = keyof typeof animationComponentMap

export default async function AnimationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // 1. Check official animations
  const meta = animationRegistry.find((a) => a.slug === slug)
  if (meta && slug in animationComponentMap) {
    const AnimationComponent = animationComponentMap[slug as Slug]
    return (
      <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col p-4">
        <AnimationPlayer
          steps={meta.steps}
          title={meta.title}
          embedSlugOrId={slug}
          isDynamic={false}
        >
          <AnimationComponent />
        </AnimationPlayer>
      </div>
    )
  }

  // 2. Check community / public animations from Supabase
  const dynamicRes = await getAnimationById(slug)
  if (dynamicRes.success && dynamicRes.data) {
    const anim = dynamicRes.data
    return (
      <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col p-4">
        <AnimationPlayer
          steps={anim.steps}
          title={anim.title}
          embedSlugOrId={anim.id}
          isDynamic={true}
          editHref={`/builder?id=${anim.id}`}
        >
          <UniversalAnimationPlayer animation={anim} />
        </AnimationPlayer>
      </div>
    )
  }

  notFound()
}

export function generateStaticParams() {
  return animationRegistry.map((a) => ({ slug: a.slug }))
}
