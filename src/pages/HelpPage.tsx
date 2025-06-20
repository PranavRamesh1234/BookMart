export function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Help Center</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <div className="prose max-w-none">
            <p className="mb-4">
              Welcome to StudySwapBolt! Here's how to get started:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create an account or sign in to your existing account</li>
              <li>Browse available textbooks in the marketplace</li>
              <li>List your textbooks for sale or swap</li>
              <li>Connect with other students for transactions</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">How do I list a book for sale?</h3>
              <p>Go to the "Sell" page, fill in your book details, set your price, and upload photos.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">How do I contact a seller?</h3>
              <p>Click on the book listing and use the contact button to message the seller directly.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Need More Help?</h2>
          <p className="mb-4">
            If you couldn't find what you're looking for, please visit our <a href="/contact" className="text-blue-600 hover:underline">Contact page</a> or email us at theofficialbookmart@gmail.com
          </p>
        </section>
      </div>
    </div>
  )
} 