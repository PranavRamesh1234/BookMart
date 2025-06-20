import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Search, MapPin, Filter, Grid, List, MessageCircle, X} from 'lucide-react'
import { toast } from 'sonner'
import { MapPicker } from '@/components/ui/map-picker'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth'
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
  latitude: number
  longitude: number
  seller_contact_email: string
  seller_contact_phone: string | null
  created_at: string
  distance?: number
}

const genres = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
  'Biography', 'History', 'Self-Help', 'Business', 'Textbook', 'Children',
  'Young Adult', 'Poetry', 'Drama', 'Other'
]

const conditions = ['new', 'like_new', 'good', 'fair', 'poor']

export function BrowsePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedCondition, setSelectedCondition] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [sortBy, setSortBy] = useState('distance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationSearch, setLocationSearch] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [maxDistance, setMaxDistance] = useState<number | null>(null)
  const { user } = useAuth()
  const [showSignInDialog, setShowSignInDialog] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  useEffect(() => {
    fetchBooks()
    getUserLocation()
  }, [])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          // Get address for the detected location
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          )
            .then(response => response.json())
            .then(data => {
              if (data.display_name) {
                setLocationSearch(data.display_name)
              }
            })
            .catch(error => {
              console.error('Error getting address:', error)
            })
        },
        (error) => {
          console.error('Error getting location:', error)
          // If geolocation fails, set to Chennai as fallback
          setUserLocation({
            lat: 13.0827,
            lng: 80.2707
          })
          setLocationSearch('Chennai, India')
        }
      )
    } else {
      // If geolocation is not supported, set to Chennai as fallback
      setUserLocation({
        lat: 13.0827,
        lng: 80.2707
      })
      setLocationSearch('Chennai, India')
    }
  }

  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setUserLocation({
          lat: parseFloat(lat),
          lng: parseFloat(lon)
        })
      } else {
        toast.error('Location not found')
      }
    } catch (error) {
      console.error('Error searching location:', error)
      toast.error('Failed to search location')
    }
  }

  const clearLocation = () => {
    setUserLocation(null)
    setSortBy('newest')
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBooks(data || [])
      setFilteredBooks(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch books')
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Calculate distances if user location is available
    const withDistances = userLocation 
      ? books.map(book => ({
          ...book,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            book.latitude,
            book.longitude
          )
        }))
      : books

    const filtered = withDistances.filter(book => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())

      // Genre filter
      const matchesGenre = selectedGenre === 'all' || 
        book.genre?.toLowerCase() === selectedGenre.toLowerCase()

      // Condition filter
      const matchesCondition = selectedCondition === 'all' || 
        book.condition === selectedCondition

      // Price range filter
      const matchesPrice = book.price_type === 'price_on_call' || 
        book.price === null || 
        (book.price >= priceRange[0] && book.price <= priceRange[1])

      // Distance filter
      const matchesDistance = !maxDistance || !book.distance || book.distance <= maxDistance

      return matchesSearch && matchesGenre && matchesCondition && matchesPrice && matchesDistance
    })

    // Sort the filtered books
    let sorted = [...filtered]
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => {
        if (a.price_type === 'price_on_call' || a.price === null) return 1
        if (b.price_type === 'price_on_call' || b.price === null) return -1
        return a.price - b.price
      })
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => {
        if (a.price_type === 'price_on_call' || a.price === null) return 1
        if (b.price_type === 'price_on_call' || b.price === null) return -1
        return b.price - a.price
      })
    } else if (sortBy === 'distance' && userLocation) {
      sorted.sort((a, b) => {
        if (!a.distance) return 1
        if (!b.distance) return -1
        return a.distance - b.distance
      })
    } else {
      // Default to newest
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    setFilteredBooks(sorted)
  }, [books, searchTerm, selectedGenre, selectedCondition, priceRange, sortBy, userLocation, maxDistance])

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

  const handleContactSeller = (book: Book) => {
    const subject = encodeURIComponent(`Interested in "${book.title}"`)
    const body = encodeURIComponent(`Hi! I'm interested in your book "${book.title}" by ${book.author}. Is it still available?`)
    
    const emailUrl = `mailto:${book.seller_contact_email}?subject=${subject}&body=${body}`
    window.open(emailUrl, '_blank')
  }

  const handleWhatsAppContact = (book: Book) => {
    if (!book.seller_contact_phone) return
    
    const message = encodeURIComponent(`Hi! I'm interested in your book "${book.title}" by ${book.author}. Is it still available?`)
    const whatsappUrl = `https://wa.me/${book.seller_contact_phone.replace(/\D/g, '')}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const handleBookClick = (book: Book) => {
    if (!user) {
      setSelectedBook(book)
      setShowSignInDialog(true)
      return
    }
    setSelectedBook(book)
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="py-8">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="w-full bg-background border-b">
            <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold">Browse Books</h1>
                <p className="text-muted-foreground">
                  Discover amazing books from sellers in your area
                </p>
              </div>

              {/* Front Menu */}
              <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8 py-4 border-b">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title or author..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        {userLocation && (
                          <SelectItem value="distance">Distance</SelectItem>
                        )}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>

                    <div className="flex border rounded-lg">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={viewMode === 'grid' ? '' : 'text-muted-foreground'}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={viewMode === 'list' ? '' : 'text-muted-foreground'}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full">
            <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8 py-8">
              {/* Filters */}
              {showFilters && (
                <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8 py-4 border-b">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Regular Filters */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Book Filters</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Genre</Label>
                          <Select
                            value={selectedGenre}
                            onValueChange={setSelectedGenre}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select genre" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Genres</SelectItem>
                              {genres.map((genre) => (
                                <SelectItem key={genre} value={genre}>
                                  {genre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Condition</Label>
                          <Select
                            value={selectedCondition}
                            onValueChange={setSelectedCondition}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Conditions</SelectItem>
                              {conditions.map((condition) => (
                                <SelectItem key={condition} value={condition}>
                                  {condition}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Price Range</Label>
                          <div className="space-y-4">
                            <Slider
                              value={priceRange}
                              onValueChange={setPriceRange}
                              min={0}
                              max={2000}
                              step={100}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>₹{priceRange[0]}</span>
                              <span>₹{priceRange[1]}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location-based Filters */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Location Filters</h3>
                      <div className="space-y-6">
                        {/* Location Search */}
                        <div className="space-y-2">
                          <Label>Search Location</Label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="text"
                                placeholder="Enter location..."
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                className="pl-9"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={handleLocationSearch}
                                className="flex-1 sm:flex-none"
                              >
                                Search
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowMap(true)}
                                className="flex-1 sm:flex-none"
                              >
                                Pick on Map
                              </Button>
                              {userLocation && (
                                <Button
                                  variant="outline"
                                  onClick={clearLocation}
                                  title="Clear location"
                                  className="flex-1 sm:flex-none text-white"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Clear
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Distance Filter */}
                        {userLocation && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>Maximum Distance</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMaxDistance(null)}
                                className="h-8 px-2"
                              >
                                Clear
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Slider
                                value={[maxDistance || 0]}
                                onValueChange={(value) => setMaxDistance(value[0])}
                                min={1}
                                max={50}
                                step={1}
                                className="w-full"
                              />
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>1 km</span>
                                <span>{maxDistance ? `${maxDistance} km` : 'No limit'}</span>
                                <span>50 km</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sort Options */}
                        <div className="space-y-2">
                          <Label>Sort By</Label>
                          <Select
                            value={sortBy}
                            onValueChange={setSortBy}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="newest">Newest First</SelectItem>
                              <SelectItem value="price_asc">Price: Low to High</SelectItem>
                              <SelectItem value="price_desc">Price: High to Low</SelectItem>
                              {userLocation && (
                                <SelectItem value="distance">Nearest First</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Book Grid/List */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {filteredBooks.map((book) => (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Card 
                        key={book.id} 
                        className={`cursor-pointer hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex' : ''}`}
                        onClick={() => handleBookClick(book)}
                      >
                        <CardContent className={`p-4 ${viewMode === 'list' ? 'flex gap-4' : ''}`}>
                          <Link
                            to={`/book/${book.id}`}
                            className={`block ${viewMode === 'list' ? 'flex-1' : ''}`}
                          >
                            <div className={`${viewMode === 'list' ? 'flex gap-4' : 'space-y-4'}`}>
                              <div className={`${viewMode === 'list' ? 'w-32' : 'aspect-[3/4]'} relative rounded-lg overflow-hidden`}>
                                <img
                                  src={book.images[0] || 'https://via.placeholder.com/600x800?text=No+Image'}
                                  alt={book.title}
                                  className="w-full h-full object-cover"
                                />
                                <Badge className="absolute top-2 right-2">
                                  {formatCondition(book.condition)}
                                </Badge>
                              </div>
                              
                              <div className={`space-y-2 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">by {book.author}</p>
                                
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{book.location}</span>
                                  {book.distance && (
                                    <span className="ml-2 font-medium text-primary">
                                      ({book.distance.toFixed(1)} km away)
                                    </span>
                                  )}
                                </div>
                                
                                <div className="text-lg font-semibold text-primary">
                                  {formatPrice(book)}
                                </div>
                              </div>
                            </div>
                          </Link>
                          
                          <div className={`flex gap-2 ${viewMode === 'list' ? 'mt-4' : ''}`}>
                            {user && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleContactSeller(book)
                                  }}
                                >
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                  Contact
                                </Button>
                                {book.seller_contact_phone && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleWhatsAppContact(book)
                                    }}
                                  >
                                    WhatsApp
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>{selectedBook?.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Seller Contact</h3>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-medium">Email:</span> {selectedBook?.seller_contact_email}
                            </p>
                            {selectedBook?.seller_contact_phone && (
                              <p className="text-sm">
                                <span className="font-medium">Phone:</span> {selectedBook?.seller_contact_phone}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* ... rest of the dialog content ... */}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
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
              <Link to="/">← Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>

      {showMap && (
        <MapPicker
          onClose={() => {
            setShowMap(false)
          }}
          onLocationSelect={(location) => {
            setUserLocation({ lat: location.lat, lng: location.lng })
            setLocationSearch(location.address)
            setShowMap(false)
          }}
          initialPosition={userLocation || undefined}
        />
      )}

      <SignInDialog
        open={showSignInDialog}
        onOpenChange={setShowSignInDialog}
        title="Sign In Required"
        message="Please sign in to view book details and contact the seller"
      />
    </div>
  )
}