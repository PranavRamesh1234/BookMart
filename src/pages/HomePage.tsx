import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, MapPin, Star, ArrowRight, Search, MessageCircle, Shield } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Carousel } from '@/components/ui/carousel'

interface Book {
  id: string
  title: string
  author: string
  price: number
  price_type: 'fixed' | 'negotiable' | 'price_on_call'
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  location: string
  images: string[]
  is_available: boolean
}

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedBooks()
  }, [])

  const fetchFeaturedBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setFeaturedBooks(data || [])
    } catch (error) {
      console.error('Error fetching featured books:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderBookCard = (book: Book) => (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-200 h-full cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
      onClick={() => navigate(`/book/${book.id}`)}
    >
      <div className="aspect-[3/4] relative">
        <img
          src={book.images[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
          alt={book.title}
          className="object-cover w-full h-full"
        />
        <Badge className="absolute top-2 right-2">
          {book.condition.replace('_', ' ')}
        </Badge>
      </div>
      <CardContent className="p-3 space-y-2">
        <h3 className="font-semibold line-clamp-1 text-sm">{book.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">by {book.author}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-primary">
            {book.price_type === 'price_on_call' ? 'Price on Call' : `₹${book.price}`}
          </span>
          <div className="flex items-center text-xs text-muted-foreground">
            <div className="h-3 w-3 mr-1" />
            {book.location}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Mumbai, Maharashtra",
      content: "Bookmart has transformed how I buy and sell books. The local focus means I can meet sellers in person and get great deals!",
      rating: 5
    },
    {
      name: "Mike Chen",
      location: "Chennai, Tamilnadu",
      content: "Great platform for selling my old books. I've made over 5000 rupees and helped other students save money on textbooks.",
      rating: 5
    },
    {
      name: "Emily Davis",
      location: "Dindugul, Tamilnadu",
      content: "The local focus is perfect. I've connected with so many book lovers in my area and discovered some hidden gems.",
      rating: 5
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Find Your Next Great Read
                <span className="text-primary"> Locally</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Connect with book lovers in your area. Buy, sell, and discover books while building meaningful connections with fellow readers.
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row">
              <Link to="/browse">
                <Button size="lg" className="min-w-[200px]">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Books
                </Button>
              </Link>
              <Link to={user ? "/sell" : "/auth/signup"}>
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {user ? "Sell Books" : "Get Started"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="pt-2 pb-12 md:pt-6 lg:pt-12 md:pb-24 lg:pb-32 bg-muted/50">
        <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Featured Books
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover amazing books from sellers in your area
              </p>
            </div>
          </div>
          <div className="py-12">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Carousel
                items={featuredBooks}
                renderItem={renderBookCard}
                className="max-w-6xl mx-auto"
                autoPlay={true}
                interval={2500}
                itemsPerView={4.5}
              />
            )}
          </div>
          <div className="flex justify-center">
            <Link to="/browse">
              <Button variant="outline" size="lg">
                View All Books
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Why Choose Bookmart?
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We're more than just a marketplace - we're a community of book lovers helping each other discover great stories.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card className="border-0 shadow-lg">
              <CardContent className="flex flex-col items-center space-y-4 p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">Local Connections</h3>
                  <p className="text-muted-foreground">
                    Find books and connect with readers in your area. Meet face-to-face and build lasting friendships.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="flex flex-col items-center space-y-4 p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">Easy Communication</h3>
                  <p className="text-muted-foreground">
                    Connect directly with sellers through email or WhatsApp. No complicated in-app messaging systems.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="flex flex-col items-center space-y-4 p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">Safe & Secure</h3>
                  <p className="text-muted-foreground">
                    Meet in public places, verify book conditions, and use our safety guidelines for worry-free transactions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                What Our Users Say
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of book lovers who have found their perfect reads and made new connections
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Ready to Start Your Book Journey?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join our community today and discover amazing books while connecting with fellow readers in your area.
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row">
              <Link to={user ? "/sell" : "/sign-up"}>
                <Button size="lg" className="min-w-[200px]">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {user ? "Start Selling" : "Join Now"}
                </Button>
              </Link>
              <Link to="/browse">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Books
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}