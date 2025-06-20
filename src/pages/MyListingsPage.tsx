import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import {Plus, PencilIcon, TrashIcon } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  price: number | null
  price_type: 'fixed' | 'negotiable' | 'price_on_call'
  images: string[]
  location: string
  created_at: string
}

export function MyListingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchBooks()
    }
  }, [user])

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBooks(data || [])
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to fetch listings')
        console.error('Error fetching books:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Listing deleted successfully')
      fetchBooks()
    } catch (error) {
      console.error('Error deleting book:', error)
      toast.error('Failed to delete listing')
    }
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/sell')}>
              <Plus className="h-4 w-4 mr-2" />
              List a Book
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Listings Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start selling your books by creating your first listing.
            </p>
            <Button onClick={() => navigate('/sell')}>
              <Plus className="h-4 w-4 mr-2" />
              List a Book
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-[3/4]">
                    <img
                      src={book.images?.[0] || '/placeholder-book.jpg'}
                      alt={book.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => navigate(`/edit-listing/${book.id}`)}
                      >
                        <PencilIcon className="h-4 w-4 text-white dark:text-white" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleDelete(book.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                    <p className="text-muted-foreground mb-2">{book.author}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">
                        {book.condition.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </Badge>
                      {book.price && (
                        <span className="font-semibold">
                          ${book.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 