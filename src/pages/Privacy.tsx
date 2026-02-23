import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const Privacy = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container mx-auto px-4 lg:px-8 py-12 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Privacy Policy — Records Tracer</h1>
      <p className="text-sm text-muted-foreground mb-8">recordstracer.com · Effective Date: February 2026</p>

      <p className="text-foreground mb-8 leading-relaxed">
        This Privacy Policy describes how we collect, use, store, and protect your personal information when you use this Service. By using the Service, you consent to the practices described in this policy.
      </p>

      <div className="space-y-6 text-foreground [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:leading-relaxed">

        <h2>1. Information We Collect</h2>

        <h3>Information you provide directly:</h3>
        <ul>
          <li>First and last name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Mailing address, city, and state</li>
          <li>Payment information (processed securely through Stripe — we do not store full credit card numbers)</li>
          <li>Account password (stored in encrypted form)</li>
          <li>Student email address if applicable</li>
        </ul>

        <h3>Information collected automatically:</h3>
        <ul>
          <li>Log data including IP address, browser type, pages visited, and time spent on the Service</li>
          <li>Device information including operating system and device type</li>
          <li>Usage data including features accessed and search queries entered</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To create and manage your account</li>
          <li>To process payments and manage your subscription</li>
          <li>To deliver briefing emails and platform features you have subscribed to</li>
          <li>To communicate with you about your account, updates, and service changes</li>
          <li>To improve the Service through analysis of usage patterns</li>
          <li>To comply with legal obligations</li>
        </ul>
        <p>We do not sell your personal information to third parties. We do not use your information for advertising purposes.</p>

        <h2>3. Payment Processing</h2>
        <p>All payment processing is handled by Stripe, Inc., a third-party payment processor. We do not store your full credit card number, CVV, or complete payment credentials on our servers. Stripe's privacy policy governs the handling of your payment information. We store only the last four digits of your card and your billing zip code for account identification purposes.</p>

        <h2>4. Data Storage and Security</h2>
        <p>Your data is stored securely using Supabase, a trusted database infrastructure provider with industry-standard security practices including encryption at rest and in transit. We implement reasonable technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction.</p>

        <h2>5. Data Retention</h2>
        <p>We retain your account information for as long as your account is active. If you cancel your subscription, we retain your information for up to 12 months for legal and business purposes, after which it is deleted or anonymized. You may request deletion of your data at any time by contacting us.</p>

        <h2>6. Your Rights</h2>
        <ul>
          <li><strong>Access:</strong> You may request a copy of the personal information we hold about you</li>
          <li><strong>Correction:</strong> You may request correction of inaccurate information</li>
          <li><strong>Deletion:</strong> You may request deletion of your personal information, subject to legal retention requirements</li>
          <li><strong>Portability:</strong> You may request your data in a portable format</li>
        </ul>
        <p>To exercise any of these rights, contact us at: <a href="mailto:privacy@recordstracer.com" className="text-accent hover:underline">privacy@recordstracer.com</a></p>

        <h2>7. Cookies</h2>
        <p>We use essential cookies necessary for the Service to function, including session cookies that keep you logged in. We do not use advertising or tracking cookies. You may disable cookies in your browser settings but doing so may affect the functionality of the Service.</p>

        <h2>8. Third-Party Services</h2>
        <p>The Service integrates with the following third-party providers who have their own privacy policies:</p>
        <ul>
          <li>Stripe — payment processing</li>
          <li>Supabase — database and authentication</li>
          <li>Google — AI analysis features</li>
        </ul>
        <p>We are not responsible for the privacy practices of these third-party providers. We encourage you to review their privacy policies.</p>

        <h2>9. Children's Privacy</h2>
        <p>The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal information, we will delete it promptly.</p>

        <h2>10. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email at least 14 days before they take effect. Your continued use of the Service after changes take effect constitutes acceptance of the revised policy.</p>

        <h2>11. Governing Law</h2>
        <p>This Privacy Policy is governed by the laws of the State of Florida. Any disputes arising from this policy shall be resolved in Pinellas County, Florida.</p>

        <h2>12. Contact</h2>
        <p>For privacy questions or requests, contact us at: <a href="mailto:privacy@recordstracer.com" className="text-accent hover:underline">privacy@recordstracer.com</a></p>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
