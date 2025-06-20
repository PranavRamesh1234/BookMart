import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { MapPin, ArrowLeft, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { SignInDialog } from '@/components/ui/sign-in-dialog'

interface Book {
  id: string
  title: string
  author: string
  description: string | null
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  price: number | null
  price_type: 'fixed' | 'negotiable' | 'price_on_call'
  genre: string | null
  images: string[]
  location: string
  latitude: number | null
  longitude: number | null
  seller_contact_email: string
  seller_contact_phone: string | null
  created_at: string
  seller_id: string
  seller: {
    full_name: string | null
    avatar_url: string | null
  }
}

export function BookDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showSignInDialog, setShowSignInDialog] = useState(false)
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const fetchBook = async () => {
    if (!id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          seller:profiles(full_name, avatar_url)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setBook(data)
    } catch (error) {
      console.error('Error fetching book:', error)
      toast.error('Failed to fetch book details')
      navigate('/browse')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBook()
  }, [id])

  const formatPrice = (book: Book) => {
    if (!book.price) return 'Price on call'
    if (book.price_type === 'negotiable') return `₹${book.price.toFixed(2)} (Negotiable)`
    return `₹${book.price.toFixed(2)}`
  }

  const formatCondition = (condition: string) => {
    return condition.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  const handlePreviousImage = () => {
    if (book?.images && book.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? book.images.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (book?.images && book.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === book.images.length - 1 ? 0 : prev + 1))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Book Not Found</h2>
        <Button onClick={() => navigate('/browse')}>Back to Browse</Button>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/browse')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Viewer */}
          <div className="space-y-4">
            <div className="relative w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden">
              {book.images && book.images.length > 0 ? (
                <img
                  src={book.images[currentImageIndex]}
                  alt={book.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>

            {book.images && book.images.length > 1 && (
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousImage}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm text-muted-foreground">
                  {currentImageIndex + 1} of {book.images.length}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextImage}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{book.title}</h1>
              <p className="text-xl text-muted-foreground">{book.author}</p>
            </div>

            <div className="flex items-center space-x-4">
              <Link to={`/profile/${book.seller_id}`} className="flex items-center space-x-2 hover:text-primary">
                {book.seller.avatar_url ? (
                  <img
                    src={book.seller.avatar_url}
                    alt={book.seller.full_name || 'Seller'}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-medium">
                      {(book.seller.full_name || 'S').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{book.seller.full_name || 'Anonymous Seller'}</p>
                  <p className="text-sm text-muted-foreground">View Profile</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{formatCondition(book.condition)}</Badge>
              <Badge variant="secondary">{book.genre}</Badge>
            </div>

            <div className="text-2xl font-bold text-primary">
              {formatPrice(book)}
            </div>

            {book.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {book.description}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Location</h3>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                {book.location}
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Seller Information</h2>
                  {user ? (
                    <>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Email:</span> {book.seller_contact_email}
                        </p>
                        {book.seller_contact_phone && (
                          <p>
                            <span className="font-medium">Phone:</span> {book.seller_contact_phone}
                          </p>
                        )}
                      </div>
                      <Button onClick={() => window.location.href = `mailto:${book.seller_contact_email}`}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contact Seller
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-3">Sign in to view seller contact information</p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => navigate('/signin')}>
                          Sign In
                        </Button>
                        <Button onClick={() => navigate('/signup')}>
                          Sign Up
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {user && user.id === book.seller_id && (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/edit-listing/${book.id}`)}
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit Listing
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this listing?')) {
                      // Handle delete
                    }
                  }}
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete Listing
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SignInDialog
        open={showSignInDialog}
        onOpenChange={setShowSignInDialog}
        title="Sign In Required"
        message="Please sign in to view seller contact information and contact the seller"
      />
    </div>
  )
} 