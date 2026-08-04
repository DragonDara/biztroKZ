import type { AppLocale } from "@/i18n/routing"
import { allPosts } from "content-collections"
import { getLocale, getTranslations } from "next-intl/server"
import Image from "next/image"
import { notFound } from "next/navigation"

import Mdx from "@/components/marketing/mdx"
import Waitlist from "@/components/marketing/waitlist"
import { Separator } from "@/components/ui/separator"

const dateLocaleTags: Record<AppLocale, string> = {
  ru: "ru-RU",
  en: "en-US",
  es: "es-MX"
}

// skipcq: JS-0116
export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return allPosts.map(post => ({
    slug: post._meta.path.split("/")
  }))
}

export default async function Page(props: {
  params: Promise<{ slug: string[] }>
}) {
  const params = await props.params
  const slug = params?.slug?.join("/")
  const post = allPosts.find(p => p._meta.path.split("/")[0] === slug)

  if (!post) {
    return notFound()
  }

  const locale = (await getLocale()) as AppLocale
  const t = await getTranslations("marketing.blog")
  const formattedDate = new Intl.DateTimeFormat(dateLocaleTags[locale], {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(post.date))

  return (
    <>
      <Header
        title={post.title}
        category={post.category}
        description={post.description}
        formattedDate={formattedDate}
        author={post.author}
        position={post.position}
        avatar={post.avatar}
        authorAvatarAlt={t("authorAvatarAlt", { author: post.author })}
      />
      <section>
        <Mdx code={post.body} />
      </section>
      <section>
        <Separator className="my-10 w-20 bg-gray-300" />
        <div className="flex flex-col items-center gap-4 text-center">
          <h3 className="text-xl font-medium sm:text-2xl">
            {t("waitlistTitle")}
          </h3>
          <span className="text-gray-500">{t("waitlistDescription")}</span>
          <div className="my-5">
            <Waitlist />
          </div>
        </div>
      </section>
    </>
  )
}

function Header({
  title,
  category,
  formattedDate,
  author,
  position,
  avatar,
  authorAvatarAlt
}: {
  title: string
  category: string
  description?: string
  formattedDate: string
  author: string
  position: string
  avatar: string
  authorAvatarAlt: string
}) {
  return (
    <div className="mt-20 mb-10">
      <div className="space-y-6">
        <div
          className="flex flex-row items-center gap-2 text-xs font-medium
            text-gray-400 md:text-sm"
        >
          <time>{formattedDate}</time>
          <Separator orientation="vertical" className="mx-2 h-5 bg-gray-300" />
          <span className="text-xs font-medium text-orange-500 md:text-sm">
            {category}
          </span>
        </div>
        <h1 className="font-display text-4xl font-medium sm:text-5xl">
          {title}
        </h1>
        <div className="flex items-center gap-2">
          <Image
            src={`/${avatar}`}
            alt={authorAvatarAlt}
            width={32}
            height={32}
            className="rounded-full shadow-md"
          />
          <div className="flex flex-col">
            <span className="text-sm leading-tight">{author}</span>
            <span className="text-xs text-gray-400">{position}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
