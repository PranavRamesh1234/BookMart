import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { MessageCircle, ArrowLeft, MapPin, Phone } from 'lucide-react'
import { toast } from 'sonner'

interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  email: string
  phone: string | null
  bio: string | null
  created_at: string
  location: string | null
  settings: {
    email_notifications: boolean
    show_phone: boolean
    show_email: boolean
    show_location: boolean
  }
}

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
  is_available: boolean
}

export function PublicProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchBooks()
  }, [id])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to fetch profile')
        console.error('Error fetching profile:', error)
      }
    }
  }

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('seller_id', id)
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBooks(data)
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to fetch books')
        console.error('Error fetching books:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleContactSeller = () => {
    if (!profile) return
    
    const subject = encodeURIComponent('Interested in your books')
    const body = encodeURIComponent(`Hi ${profile.full_name}! I'm interested in some of your books. Are they still available?`)
    
    const emailUrl = `mailto:${profile.email}?subject=${subject}&body=${body}`
    window.open(emailUrl, '_blank')
  }

  const handleWhatsAppContact = () => {
    if (!profile?.phone) return
    
    const message = encodeURIComponent(`Hi ${profile.full_name}! I'm interested in some of your books. Are they still available?`)
    const whatsappUrl = `https://wa.me/${profile.phone.replace(/\D/g, '')}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
        <Button onClick={() => navigate('/browse')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl py-8 mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <img
                    src={profile?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + profile?.full_name}
                    alt={profile?.full_name || 'User'}
                    className="w-32 h-32 rounded-full object-cover border-4 border-background"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
                  {profile?.settings?.show_email && (
                    <p className="text-muted-foreground">{profile?.email}</p>
                  )}
                </div>
                {profile?.bio && (
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                )}
                {profile?.location && profile?.settings?.show_location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.location}
                  </div>
                )}
                {profile?.phone && profile?.settings?.show_phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-1" />
                    {profile.phone}
                  </div>
                )}
                <div className="flex flex-col space-y-2 w-full pt-4">
                  {profile?.settings?.show_email && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleContactSeller}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact via Email
                    </Button>
                  )}
                  {profile?.phone && profile?.settings?.show_phone && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleWhatsAppContact}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact via WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="books" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
              <TabsTrigger value="books">Books</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            
            <TabsContent value="books">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Listed Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {books.map((book) => (
                      <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-[3/4] relative">
                          <img
                            src={book.images[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
                            alt={book.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <CardContent className="p-6 space-y-3">
                          <h3 className="font-semibold line-clamp-1">{book.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">by {book.author}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              {book.price_type === 'price_on_call' ? 'Price on Call' : `₹${book.price}`}
                            </span>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {book.location}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => navigate(`/book/${book.id}`)}
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">About {profile.full_name}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6 max-w-2xl mx-auto">
                    {profile.bio ? (
                      <p className="text-muted-foreground text-center">{profile.bio}</p>
                    ) : (
                      <p className="text-muted-foreground text-center">No bio provided.</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <h3 className="font-semibold mb-2">Member Since</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold mb-2">Books Listed</h3>
                        <p className="text-sm text-muted-foreground">
                          {books.length} books
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 