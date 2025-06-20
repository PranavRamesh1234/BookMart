import { Link } from 'react-router-dom'
import { BookOpen, Twitter, Instagram, Mail, Youtube } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold">Bookmart</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting book lovers with the stories they seek. Find your next great read or give your books a new home.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Marketplace</h4>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link to="/browse" className="text-muted-foreground hover:text-foreground">
                Browse Books
              </Link>
              <Link to="/sell" className="text-muted-foreground hover:text-foreground">
                Sell Books
              </Link>
              <Link to="/requests" className="text-muted-foreground hover:text-foreground">
                Book Requests
              </Link>
            </nav>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Support</h4>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link to="/help" className="text-muted-foreground hover:text-foreground">
                Help Center
              </Link>
              <Link to="/safety" className="text-muted-foreground hover:text-foreground">
                Safety Tips
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                Contact Us
              </Link>
            </nav>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
              <a href="https://www.youtube.com/channel/UC2MjJd5sQ2rGrRhh4zbhTjQ?sub_confirmation=1" className="text-muted-foreground hover:text-foreground">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">Youtube</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Bookmart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}