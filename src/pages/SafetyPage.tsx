export function SafetyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Safety Guidelines</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Meeting in Person</h2>
          <div className="prose max-w-none">
            <ul className="list-disc pl-6 space-y-2">
              <li>Always meet in a public place with plenty of people around</li>
              <li>Popular meeting spots include campus libraries, coffee shops, or student centers</li>
              <li>Bring a friend if possible, especially for your first few transactions</li>
              <li>Meet during daylight hours when possible</li>
              <li>Trust your instincts - if something feels off, don't proceed with the transaction</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Payment Safety</h2>
          <div className="prose max-w-none">
            <ul className="list-disc pl-6 space-y-2">
              <li>Use secure payment methods whenever possible</li>
              <li>Be cautious of requests for advance payments</li>
              <li>Verify the condition of the book before making payment</li>
              <li>Keep all transaction records and communications</li>
              <li>Report any suspicious payment requests to our support team</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Online Safety</h2>
          <div className="prose max-w-none">
            <ul className="list-disc pl-6 space-y-2">
              <li>Never share your password or personal financial information</li>
              <li>Use our platform's messaging system instead of sharing personal contact details</li>
              <li>Be wary of offers that seem too good to be true</li>
              <li>Report suspicious behavior or listings to our support team</li>
              <li>Keep your account information secure and up to date</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Emergency Contacts</h2>
          <div className="prose max-w-none">
            <p className="mb-4">
              If you feel unsafe or encounter an emergency:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Call campus security or local police: 911</li>
              <li>Contact our support team: theofficialbookmart@gmail.com</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
} 