import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | MergeMaster",
  description: "Get in touch with the MergeMaster team for support or inquiries.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-[800px] py-16 px-4">
      <h1 className="text-4xl font-bold text-ink mb-8">Contact Us</h1>
      <p className="text-ink-muted-80 text-lg mb-8">
        Have a question, feedback, or need support? We'd love to hear from you. Fill out the form below and our team will get back to you as soon as possible.
      </p>
      
      <form className="space-y-6 bg-surface-card border border-hairline p-8 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-ink">Name</label>
            <input 
              type="text" 
              id="name" 
              className="w-full p-3 rounded-md border border-hairline bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/50" 
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-ink">Email</label>
            <input 
              type="email" 
              id="email" 
              className="w-full p-3 rounded-md border border-hairline bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/50" 
              placeholder="your@email.com"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium text-ink">Subject</label>
          <input 
            type="text" 
            id="subject" 
            className="w-full p-3 rounded-md border border-hairline bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/50" 
            placeholder="How can we help?"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-ink">Message</label>
          <textarea 
            id="message" 
            rows={5}
            className="w-full p-3 rounded-md border border-hairline bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" 
            placeholder="Your message here..."
          ></textarea>
        </div>
        <button 
          type="button" 
          className="bg-primary text-primary-foreground font-medium py-3 px-6 rounded-md hover:opacity-90 transition-opacity w-full md:w-auto"
        >
          Send Message
        </button>
      </form>
      
      <div className="mt-16 text-center">
        <p className="text-ink-muted-80">
          Alternatively, you can email us directly at <a href="mailto:support@mergemaster.com" className="text-primary hover:underline">support@mergemaster.com</a>
        </p>
      </div>
    </div>
  );
}
