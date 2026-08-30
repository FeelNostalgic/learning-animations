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
    return { title: `${meta.title} (Embed)` }
  }

  const res = await getAnimationById(slug)
  if (res.success && res.data) {
    return { title: `${res.data.title} (Embed)` }
  }

  return { title: "Embed animación" }
}

type StaticSlug = keyof typeof animationComponentMap

export default async function UnifiedEmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // 1. Check if it's a predefined static animation
  const staticMeta = animationRegistry.find((a) => a.slug === slug)
  if (staticMeta && slug in animationComponentMap) {
    const AnimationComponent = animationComponentMap[slug as StaticSlug]
    return (
      <div className="h-screen w-screen p-2 flex flex-col overflow-hidden bg-background">
        <div className="flex-1 h-full w-full">
          <AnimationPlayer steps={staticMeta.steps} title={staticMeta.title}>
            <AnimationComponent />
          </AnimationPlayer>
        </div>
      </div>
    )
  }

  // 2. Check if it's a dynamic user animation by ID from Supabase
  const dynamicRes = await getAnimationById(slug)
  if (dynamicRes.success && dynamicRes.data) {
    const dynamicAnim = dynamicRes.data
    return (
      <div className="h-screen w-screen p-2 flex flex-col overflow-hidden bg-background">
        <div className="flex-1 h-full w-full">
          <AnimationPlayer steps={dynamicAnim.steps} title={dynamicAnim.title}>
            <UniversalAnimationPlayer animation={dynamicAnim} />
          </AnimationPlayer>
        </div>
      </div>
    )
  }

  // 3. Neither found
  notFound()
}

export function generateStaticParams() {
  return animationRegistry.map((a) => ({ slug: a.slug }))
}
