import { Suspense } from "react"
import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"
import Image from "next/image"

import Spinner from "@/components/ui/spinner"
import LoginForm from "@/app/(auth)/login/login-form"

export async function generateMetadata() {
  const t = await getTranslations("auth.login")

  return {
    title: t("metaTitle"),
    description: t("metaDescription")
  }
}

// skipcq: JS-0116
export default async function LoginPage() {
  const t = await getTranslations("auth.login")

  return (
    <div className="flex min-h-full flex-1">
      <div
        className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6
          lg:flex-none lg:px-20 xl:px-24"
      >
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center">
            <Link href="/" prefetch={false}>
              <Image
                src="/logo-bistro.svg"
                alt="Logo"
                width={44}
                height={44}
                unoptimized
              />
            </Link>
            <h2
              className="font-display mt-4 text-3xl leading-9 font-medium
                tracking-tight text-gray-900 dark:text-gray-200"
            >
              {t("welcome")}
            </h2>
            <span
              className="mt-2 block text-sm text-gray-600 dark:text-gray-400"
            >
              {t("subtitle")}
            </span>
          </div>
          <div className="mt-10">
            <Suspense fallback={<Loading />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1653084019129-1f2303bb5bc0?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          fill
          sizes="(max-width: 1023px) 0px, 50vw"
          unoptimized
        />
      </div>
    </div>
  )
}

const Loading = () => {
  return (
    <div className="flex h-64 grow items-center justify-center">
      <Spinner />
    </div>
  )
}
