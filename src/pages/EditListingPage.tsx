import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPicker } from '@/components/ui/map-picker'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { TrashIcon } from '@heroicons/react/24/outline'

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
}

const conditions = ['new', 'like_new', 'good', 'fair', 'poor']
const priceTypes = ['fixed', 'negotiable', 'price_on_call']
const genres = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
  'Biography', 'History', 'Self-Help', 'Business', 'Textbook', 'Children',
  'Young Adult', 'Poetry', 'Drama', 'Other'
]

export function EditListingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    author: '',
    description: '',
    condition: 'good',
    price: null,
    price_type: 'fixed',
    genre: null,
    images: [],
    location: '',
    latitude: null,
    longitude: null,
    seller_contact_email: '',
    seller_contact_phone: null,
  })

  useEffect(() => {
    fetchBook()
  }, [id])

  const fetchBook = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      // Check if the user owns this book
      if (data.seller_id !== user?.id) {
        toast.error('You do not have permission to edit this listing')
        navigate('/my-listings')
        return
      }

      setFormData(data)
    } catch (error) {
      console.error('Error fetching book:', error)
      toast.error('Failed to fetch book details')
      navigate('/my-listings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Book, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: formData.title,
          author: formData.author,
          description: formData.description,
          condition: formData.condition,
          price: formData.price,
          price_type: formData.price_type,
          genre: formData.genre,
          images: formData.images,
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          seller_contact_email: formData.seller_contact_email,
          seller_contact_phone: formData.seller_contact_phone,
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Listing updated successfully')
      navigate('/my-listings')
    } catch (error) {
      console.error('Error updating book:', error)
      toast.error('Failed to update listing')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Listing deleted successfully')
      navigate('/my-listings')
    } catch (error) {
      console.error('Error deleting book:', error)
      toast.error('Failed to delete listing')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user?.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('book-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('book-images')
          .getPublicUrl(filePath)

        return publicUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls]
      }))

      toast.success('Images uploaded successfully')
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8">
        <Button 
          variant="ghost"
          onClick={() => navigate('/my-listings')}
          className="mb-4 bg-gray-400"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Listings
        </Button>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => handleChange('author', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe the book's condition, any notes, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => handleChange('condition', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => handleChange('price', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_type">Price Type *</Label>
                    <Select
                      value={formData.price_type}
                      onValueChange={(value) => handleChange('price_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priceTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select
                    value={formData.genre || ''}
                    onValueChange={(value) => handleChange('genre', value)}
                  >
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
                  <Label>Location *</Label>
                  <Button
                    variant="outline"
                    onClick={() => setShowMap(true)}
                    className="w-full"
                  >
                    Pick on Map
                  </Button>
                  {formData.location && (
                    <Input
                      value={formData.location}
                      readOnly
                      placeholder="Location will appear here when selected on map"
                    />
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
                    initialPosition={formData.latitude && formData.longitude ? 
                      { lat: formData.latitude, lng: formData.longitude } : 
                      undefined
                    }
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="seller_contact_email">Contact Email *</Label>
                    <Input
                      id="seller_contact_email"
                      type="email"
                      value={formData.seller_contact_email}
                      onChange={(e) => handleChange('seller_contact_email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seller_contact_phone">Contact Phone (WhatsApp)</Label>
                    <Input
                      id="seller_contact_phone"
                      value={formData.seller_contact_phone || ''}
                      onChange={(e) => handleChange('seller_contact_phone', e.target.value)}
                      placeholder="Include country code (e.g., +1)"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Book Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images?.map((image, index) => (
                      <div key={index} className="relative aspect-[3/4] group">
                        <img
                          src={image}
                          alt={`Book image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <label className="relative aspect-[3/4] border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {uploading ? 'Uploading...' : 'Add Images'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Listing
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 