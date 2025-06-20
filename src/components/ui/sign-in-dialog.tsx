import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface SignInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  message?: string
}

export function SignInDialog({ 
  open, 
  onOpenChange, 
  title = "Sign In Required", 
  message = "Please sign in to view this content" 
}: SignInDialogProps) {
  const navigate = useNavigate()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button 
            onClick={() => {
              onOpenChange(false)
              navigate('/signin')
            }}
            className="w-full"
          >
            Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 