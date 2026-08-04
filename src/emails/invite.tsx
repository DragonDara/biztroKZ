import * as React from "react"
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text
} from "react-email"

export type InviteEmailLabels = {
  preview: string
  heading: string
  hello: string
  invitedBy: string
  joinButton: string
  orCopy: string
  footer: string
}

const defaultLabels: InviteEmailLabels = {
  preview: "Join {inviter} on Biztro",
  heading: "Join {team} on Biztro",
  hello: "Hi {username},",
  invitedBy: "{inviter} ({email}) invited you to the {team} team on Biztro.",
  joinButton: "Join the team",
  orCopy: "or copy and paste this URL into your browser:",
  footer:
    "This invitation was intended for {username}. If you weren't expecting an invitation, you can ignore this email."
}

function fillTemplate(
  template: string,
  vars: Record<string, string | undefined>
) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "")
}

interface InviteUserEmailProps {
  username?: string
  invitedByUsername?: string
  invitedByEmail?: string
  teamName?: string
  inviteLink?: string
  baseUrl?: string
  labels?: Partial<InviteEmailLabels>
}

export const InviteUserEmail = ({
  username,
  invitedByUsername,
  invitedByEmail,
  teamName,
  inviteLink,
  baseUrl,
  labels: labelsProp
}: InviteUserEmailProps) => {
  const labels = { ...defaultLabels, ...labelsProp }
  const previewText = fillTemplate(labels.preview, {
    inviter: invitedByUsername
  })

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container
            className="mx-auto my-[40px] max-w-[465px] rounded-sm border
              border-solid border-[#eaeaea] p-[20px]"
          >
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/logo.png`}
                width="40"
                height="37"
                alt="Biztro"
                className="mx-auto my-0"
              />
            </Section>
            <Heading
              className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal
                text-black"
            >
              {fillTemplate(labels.heading, { team: teamName })}
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              {fillTemplate(labels.hello, { username })}
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              {fillTemplate(labels.invitedBy, {
                inviter: invitedByUsername,
                email: invitedByEmail,
                team: teamName
              })}
            </Text>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded-sm bg-[#171717] px-5 py-3 text-center
                  text-[12px] font-semibold text-white no-underline"
                href={inviteLink}
              >
                {labels.joinButton}
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              {labels.orCopy}{" "}
              <Link href={inviteLink} className="text-orange-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
            <Hr
              className="mx-0 my-[26px] w-full border border-solid
                border-[#eaeaea]"
            />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              {fillTemplate(labels.footer, { username })}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

InviteUserEmail.PreviewProps = {
  username: "alanturing",
  invitedByUsername: "Alan",
  invitedByEmail: "alan.turing@example.com",
  teamName: "Enigma",
  inviteLink: "https://biztro.co/invite/foo",
  baseUrl: "http://localhost:3000/static/"
} as InviteUserEmailProps

export default InviteUserEmail
