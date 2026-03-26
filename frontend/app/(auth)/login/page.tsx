import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card shadow-lg",
          },
        }}
        routing="path"
        path="/login"
        signUpUrl="/register"
        redirectUrl="/dashboard"
      />
    </div>
  )
}
