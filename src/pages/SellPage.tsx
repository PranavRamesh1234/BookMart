import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup} from '@/components/ui/radio-group'
import { MapPicker } from '@/components/ui/map-picker'
import { ImageUpload } from '@/components/ui/image-upload'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const genres = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
  'Biography', 'History', 'Self-Help', 'Business', 'Textbook', 'Children',
  'Young Adult', 'Poetry', 'Drama', 'Other'
]

const conditions = [
  { value: 'new', label: 'New', description: 'Brand new, never used' },
  { value: 'like_new', label: 'Like New', description: 'Excellent condition, minimal wear' },
  { value: 'good', label: 'Good', description: 'Good condition, some minor wear' },
  { value: 'fair', label: 'Fair', description: 'Readable, noticeable wear' },
  { value: 'poor', label: 'Poor', description: 'Heavy wear, but still readable' }
]

const priceTypes = [
  { value: 'fixed', label: 'Fixed Price', description: 'Set price, no negotiation' },
  { value: 'negotiable', label: 'Negotiable', description: 'Open to price discussions' },
  { value: 'price_on_call', label: 'Price on Call', description: 'Contact for pricing' }
]

export function SellPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    condition: '',
    price: '',
    priceType: 'fixed',
    genre: '',
    yearPublished: '',
    language: 'English',
    location: '',
    latitude: 0,
    longitude: 0,
    sellerContactPhone: '',
    sellerContactEmail: user?.email || '',
    images: [] as string[]
  })

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const bookData = {
        seller_id: user?.id,
        title: formData.title,
        author: formData.author,
        description: formData.description || null,
        condition: formData.condition as string,
        price: formData.priceType === 'price_on_call' ? null : parseFloat(formData.price),
        price_type: formData.priceType as string,
        genre: formData.genre || null,
        year_published: formData.yearPublished ? parseInt(formData.yearPublished) : null,
        language: formData.language || null,
        images: formData.images,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        seller_contact_phone: formData.sellerContactPhone || null,
        seller_contact_email: formData.sellerContactEmail
      }

      const { error } = await supabase
        .from('books')
        .insert([bookData])

      if (error) {
        if (error.code === '22P02' && error.message.includes('book_condition')) {
          toast.error('Please select a valid book condition')
        } else {
          toast.error('Failed to create listing')
        }
        throw error
      }

      toast.success('Book listed successfully!')
      navigate('/my-listings')
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error creating listing:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Sell Your Book</h1>
          <p className="text-muted-foreground">
            Create a listing to connect with local book lovers in your area
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Book Information */}
          <Card>
            <CardHeader>
              <CardTitle>Book Information</CardTitle>
              <CardDescription>
                Tell us about the book you're selling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Book Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter the book title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleChange('author', e.target.value)}
                    placeholder="Enter the author's name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe the book's condition, any highlights, notes, or other details..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={formData.genre} onValueChange={(value) => handleChange('genre', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre.toLowerCase()}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearPublished">Year Published</Label>
                  <Input
                    id="yearPublished"
                    type="number"
                    value={formData.yearPublished}
                    onChange={(e) => handleChange('yearPublished', e.target.value)}
                    placeholder="e.g. 2020"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={formData.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    placeholder="e.g. English"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Condition and Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Condition & Pricing</CardTitle>
              <CardDescription>
                Set the condition and price for your book
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Book Condition *</Label>
                <RadioGroup
                  value={formData.condition}
                  onValueChange={(value) => handleChange('condition', value)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {conditions.map((condition) => (
                    <div
                      key={condition.value}
                      onClick={() => handleChange('condition', condition.value)}
                      className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5 ${
                        formData.condition === condition.value ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {condition.label}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {condition.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Price Type *</Label>
                <RadioGroup
                  value={formData.priceType}
                  onValueChange={(value) => handleChange('priceType', value)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {priceTypes.map((priceType) => (
                    <div
                      key={priceType.value}
                      onClick={() => handleChange('priceType', priceType.value)}
                      className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5 ${
                        formData.priceType === priceType.value ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {priceType.label}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {priceType.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {formData.priceType !== 'price_on_call' && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1.5 text-muted-foreground">₹</span>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location and Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Location & Contact</CardTitle>
              <CardDescription>
                Set your location and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Location *</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMap(true)}
                  className="w-full"
                >
                  Pick on Map
                </Button>
                {formData.location && (
                  <div className="mt-2">
                    <Input
                      value={formData.location}
                      readOnly
                      placeholder="Location will appear here when selected on map"
                      required
                    />
                  </div>
                )}
              </div>

              {showMap && (
                <MapPicker
                  onClose={() => setShowMap(false)}
                  onLocationSelect={(location) => {
                    setFormData(prev => ({
                      ...prev,
                      location: location.address,
                      latitude: location.lat,
                      longitude: location.lng
                    }))
                    setShowMap(false)
                  }}
                  initialPosition={formData.latitude && formData.longitude ? {
                    lat: formData.latitude,
                    lng: formData.longitude
                  } : undefined}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.sellerContactEmail}
                    onChange={(e) => handleChange('sellerContactEmail', e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.sellerContactPhone}
                    onChange={(e) => handleChange('sellerContactPhone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Book Images</CardTitle>
              <CardDescription>
                Upload up to 5 images of your book
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onImagesChange={(urls: string[]) => handleChange('images', urls)}
                maxImages={5}
                existingImages={formData.images}
              />
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Creating listing...' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}