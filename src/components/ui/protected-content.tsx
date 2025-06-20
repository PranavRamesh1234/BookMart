import { ReactNode } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SignInDialog } from '@/components/ui/sign-in-dialog'
import { useState } from 'react'

interface ProtectedContentProps {
  children: ReactNode
  message?: string
}

export function ProtectedContent({ children, message = 'Please sign in to view this content' }: ProtectedContentProps) {
  const { user } = useAuth()
  const [showSignInDialog, setShowSignInDialog] = useState(false)

  if (user) {
    return <>{children}</>
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign In Required</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You need to be signed in to view this content. Please sign in or create an account to continue.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={() => setShowSignInDialog(true)}>
            Sign In
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/signup'}>
            Sign Up
          </Button>
        </CardFooter>
      </Card>

      <SignInDialog
        open={showSignInDialog}
        onOpenChange={setShowSignInDialog}
        title="Sign In Required"
        message={message}
      />
    </>
  )
} 