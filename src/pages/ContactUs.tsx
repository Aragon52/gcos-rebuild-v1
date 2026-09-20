import React, { useState } from "react";
import SEO from "@/components/SEO";
import { 
  Mail, MapPin, Phone, Clock, MessageSquare, ShieldCheck, CheckCircle2, 
  Send, AlertCircle, Headphones, Building2, HelpCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@/lib/router-compat";

export default function ContactUs() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill out your name, email address, and message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate inquiry submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast({
        title: "Inquiry Received Successfully",
        description: `Thank you, ${name}. A customer support specialist will review your request and reply to ${email} within 2-4 hours.`,
      });
    }, 800);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <SEO
        title="Contact Customer Support & Official Inquiry Desk"
        description="Get 24/7 assistance from GlobalCart International Pte. Ltd. Contact our support team for order tracking, payment verification, and reseller inquiries."
        canonical="https://globalcart-onlineshop.com/contact"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Contact Us", item: "/contact" },
        ]}
      />

      <div className="text-center mb-12 space-y-3">
        <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-primary border-primary/30 bg-primary/5 uppercase tracking-wider">
          Official Support & Inquiries
        </Badge>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Contact Customer Care & Corporate Office
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          We are dedicated to providing prompt, transparent, and comprehensive support. Reach out through our official channels or send a direct inquiry below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Contact Channels & Corporate Office (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Headphones className="h-5 w-5 text-primary" />
              Direct Support Channels
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Customer Support Email</div>
                  <div className="text-xs text-primary font-medium">support@globalcart-onlineshop.com</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Response Time: Under 2 hours</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Trust & Compliance Desk</div>
                  <div className="text-xs text-primary font-medium">compliance@globalcart-onlineshop.com</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">For merchant verification & security</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">International Telephone</div>
                  <div className="text-xs font-mono font-medium text-foreground">+65 6800 4200</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Mon–Sun: 24/7 Global Dispatch</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Registered Corporate Office</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    GlobalCart International Pte. Ltd.<br />
                    30 Cecil Street #21-05<br />
                    Prudential Tower, Singapore 048716
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-1">UEN: 202301984M</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>Service Level Commitment (SLA)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All buyer protection claims, payment disputes, and delivery status requests are assigned a unique tracking ticket and addressed by our compliance desk within guaranteed turnaround windows.
            </p>
          </div>
        </div>

        {/* Interactive Inquiry Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Send a Verified Support Ticket
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Please include your relevant order number or store identifier if inquiring about an existing purchase.
            </p>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Ticket Successfully Submitted</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Your inquiry has been assigned reference ticket <strong>#GC-{Math.floor(100000 + Math.random() * 900000)}</strong>. A confirmation email has been dispatched to <strong>{email}</strong>.
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setEmail("");
                    setSubject("");
                    setOrderNumber("");
                    setMessage("");
                  }}
                  className="rounded-xl mt-4"
                >
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name" className="text-xs font-semibold">Your Full Name *</Label>
                    <Input 
                      id="contact-name" 
                      placeholder="e.g. Alexander Wright" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      className="rounded-lg h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email" className="text-xs font-semibold">Email Address *</Label>
                    <Input 
                      id="contact-email" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="rounded-lg h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-order" className="text-xs font-semibold">Order Number (Optional)</Label>
                    <Input 
                      id="contact-order" 
                      placeholder="e.g. ORD-89421" 
                      value={orderNumber} 
                      onChange={(e) => setOrderNumber(e.target.value)} 
                      className="rounded-lg h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-subject" className="text-xs font-semibold">Inquiry Type</Label>
                    <Input 
                      id="contact-subject" 
                      placeholder="e.g. Order Tracking, Payment, Refund" 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)} 
                      className="rounded-lg h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message" className="text-xs font-semibold">Your Message *</Label>
                  <Textarea 
                    id="contact-message" 
                    rows={4} 
                    placeholder="Provide details about your question, order, or request..." 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    required 
                    className="rounded-lg text-xs leading-relaxed"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full rounded-xl text-xs font-semibold h-10 gap-2 justify-center"
                >
                  {isSubmitting ? (
                    <span>Submitting Ticket...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Inquiry to Customer Care</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Helpful Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/faq" className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
          <div>
            <div className="font-semibold text-xs text-foreground">Frequently Asked Questions</div>
            <div className="text-[11px] text-muted-foreground">Immediate answers to top queries</div>
          </div>
        </Link>
        <Link to="/returns-refunds" className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
          <div>
            <div className="font-semibold text-xs text-foreground">Returns &amp; Refund Policy</div>
            <div className="text-[11px] text-muted-foreground">Eligibility and processing terms</div>
          </div>
        </Link>
        <Link to="/verification-compliance" className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
          <div>
            <div className="font-semibold text-xs text-foreground">Compliance &amp; Verification</div>
            <div className="text-[11px] text-muted-foreground">Marketplace safety standards</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
