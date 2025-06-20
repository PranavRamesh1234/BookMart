import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase'
import { MapPin, MessageCircle, ArrowLeft, Star } from 'lucide-react'
import { toast } from 'sonner'

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
  seller_contact_email: string
  seller_contact_phone: string | null
  created_at: string
  seller: {
    full_name: string
    avatar_url: string | null
    id: string
  }
}

export function BookPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchBook()
  }, [id])

  const fetchBook = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          seller:profiles(full_name, avatar_url, id)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setBook(data)
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to fetch book details')
        console.error('Error fetching book:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleContactSeller = () => {
    if (!book) return
    
    const subject = encodeURIComponent(`Interested in "${book.title}"`)
    const body = encodeURIComponent(`Hi! I'm interested in your book "${book.title}" by ${book.author}. Is it still available?`)
    
    const emailUrl = `mailto:${book.seller_contact_email}?subject=${subject}&body=${body}`
    window.open(emailUrl, '_blank')
  }

  const handleWhatsAppContact = () => {
    if (!book?.seller_contact_phone) return
    
    const message = encodeURIComponent(`Hi! I'm interested in your book "${book.title}" by ${book.author}. Is it still available?`)
    const whatsappUrl = `https://wa.me/${book.seller_contact_phone.replace(/\D/g, '')}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const formatPrice = (book: Book) => {
    if (book.price_type === 'price_on_call') {
      return 'Price on Call'
    }
    
    const priceText = book.price ? `₹${book.price}` : 'Free'
    
    if (book.price_type === 'negotiable') {
      return `${priceText} (Negotiable)`
    }
    
    return priceText
  }

  const formatCondition = (condition: string) => {
    return condition.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
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
        <h2 className="text-2xl font-bold mb-4">Book not found</h2>
        <Button onClick={() => navigate('/browse')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Images Section */}
        <div className="lg:w-1/2 space-y-4">
          <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
            <img
              src={book.images[currentImageIndex] || 'https://via.placeholder.com/600x800?text=No+Image'}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-4 right-4">
              {formatCondition(book.condition)}
            </Badge>
          </div>
          
          {book.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {book.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-[3/4] rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${book.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="lg:w-1/2 space-y-6">
          <div>
            <Button
              type="button"
              onClick={() => navigate('/browse')}
              variant="outline"
              className="mb-4 flex items-center justify-start text-muted-foreground hover:text-muted-foreground/80"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </Button>
            
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-xl text-muted-foreground">by {book.author}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(book)}
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {book.location}
            </div>
          </div>

          {book.description && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {book.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {book.seller.avatar_url ? (
                    <img
                      src={book.seller.avatar_url}
                      alt={book.seller.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Star className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => navigate(`/profile/${book.seller.id}`)}
                  >
                    {book.seller.full_name}
                  </Button>
                  <p className="text-sm text-muted-foreground">Seller</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="flex-1"
              onClick={handleContactSeller}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Seller
            </Button>
            {book.seller_contact_phone && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleWhatsAppContact}
              >
                WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8 py-4">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="text-foreground hover:text-foreground"
        >
          <Link to="/browse">← Back to Browse</Link>
        </Button>
      </div>
    </div>
  )
} 