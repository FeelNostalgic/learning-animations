import { notFound } from "next/navigation"
import { animationComponentMap } from "@/components/animations/animation-component-map"
import { animationRegistry } from "@/lib/animations/registry"
import { AnimationPlayer } from "@/components/animations/animation-player"
import { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const meta = animationRegistry.find((a) => a.slug === slug)
  return {
    title: meta ? `Animación: ${meta.title}` : "Animación",
  }
}

type Slug = keyof typeof animationComponentMap

export default async function AnimationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const meta = animationRegistry.find((a) => a.slug === slug)

  if (!meta || !(slug in animationComponentMap)) notFound()

  const AnimationComponent = animationComponentMap[slug as Slug]

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <AnimationPlayer steps={meta.steps} title={meta.title}>
        <AnimationComponent />
      </AnimationPlayer>
    </div>
  )
}

export function generateStaticParams() {
  return animationRegistry.map((a) => ({ slug: a.slug }))
}
