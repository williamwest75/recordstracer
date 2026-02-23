import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const Terms = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container mx-auto px-4 lg:px-8 py-12 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Terms of Service Agreement</h1>
      <p className="text-muted-foreground mb-2 font-semibold">Gran Casa LLC | A Florida Limited Liability Company</p>
      <p className="text-sm text-muted-foreground mb-8">Effective Date: February 21, 2026 | Last Updated: February 21, 2026</p>

      <p className="text-sm text-foreground mb-8 uppercase font-semibold leading-relaxed">
        PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE USING RECORDS TRACER. BY CREATING AN ACCOUNT OR ACCESSING THE PLATFORM, YOU AGREE TO BE BOUND BY THESE TERMS.
      </p>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:leading-relaxed">

        <h2>1. Agreement and Parties</h2>
        <p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Gran Casa LLC, a Florida limited liability company operating Records Tracer ("Company," "we," "us," or "our"). Records Tracer is an investigative public records research platform accessible at recordstracer.com and related subdomains (the "Platform").</p>
        <p>If you are accessing Records Tracer on behalf of a news organization, company, or other entity, you represent that you have the authority to bind that entity to these Terms, and all references to "you" include that entity.</p>

        <h2>2. Eligibility and Permitted Users</h2>
        <p>Records Tracer is designed exclusively for legitimate journalistic, academic, and professional research purposes. By creating an account, you represent and warrant that:</p>
        <ul>
          <li>You are at least 18 years of age</li>
          <li>You are a journalist, researcher, attorney, newsroom employee, journalism student, or other professional with a legitimate need for investigative public records research</li>
          <li>You will use the Platform solely for lawful purposes consistent with applicable federal, state, and local laws</li>
          <li>You will not use the Platform for any personal, commercial, or non-journalistic purpose not expressly permitted by these Terms</li>
          <li>Your use of the Platform does not violate any agreement you have with a third party</li>
        </ul>
        <p>Gran Casa LLC reserves the right to verify user credentials and terminate accounts that do not meet eligibility requirements at any time without notice.</p>

        <h2>3. Permitted and Prohibited Uses</h2>

        <h3>3.1 Permitted Uses</h3>
        <p>You may use Records Tracer solely for the following purposes:</p>
        <ul>
          <li>Investigative journalism research for publication in a news outlet, blog, or journalistic publication</li>
          <li>Academic research conducted in good faith for educational or scholarly purposes</li>
          <li>Legal research by licensed attorneys or their staff for legitimate legal matters</li>
          <li>Background research on public figures, public officials, candidates for public office, and corporate entities</li>
          <li>Verification of information for fact-checking and editorial purposes</li>
          <li>Non-profit investigative research by registered non-profit organizations</li>
        </ul>

        <h3>3.2 Prohibited Uses</h3>
        <p>You expressly agree that you will NOT use Records Tracer for:</p>
        <ul>
          <li>Stalking, harassment, intimidation, or surveillance of any individual</li>
          <li>Identity theft, fraud, or any other criminal activity</li>
          <li>Building marketing lists, mailing lists, or commercial contact databases</li>
          <li>Debt collection, skip tracing for non-journalistic purposes, or repossession</li>
          <li>Employment screening, tenant screening, or credit decisions</li>
          <li>Reselling, redistributing, or sublicensing data obtained through the Platform to third parties</li>
          <li>Automated bulk downloading, scraping, or harvesting of Platform data</li>
          <li>Any purpose that violates the Driver's Privacy Protection Act (DPPA), Gramm-Leach-Bliley Act, Fair Credit Reporting Act (FCRA), or any other applicable law</li>
          <li>Investigating private individuals who are not public figures, candidates for office, or subjects of legitimate public interest</li>
          <li>Any purpose that would require Records Tracer to be classified as a consumer reporting agency under the FCRA</li>
        </ul>
        <p className="font-semibold uppercase text-sm">IMPORTANT: Records Tracer is not a consumer reporting agency and the information provided through this Platform may not be used for any purpose regulated by the Fair Credit Reporting Act, including employment decisions, credit decisions, or tenant screening.</p>

        <h2>4. Data Sources and Accuracy Disclaimer</h2>
        <p>Records Tracer aggregates publicly available information from third-party sources including but not limited to SEC EDGAR, the Federal Election Commission, federal court records, USASpending.gov, Florida Division of Corporations (SunBiz), Florida Division of Elections, OCCRP Aleph, and other public record databases.</p>

        <h3>4.1 No Warranty of Accuracy</h3>
        <p>THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. Gran Casa LLC makes no representation or warranty that information returned by the Platform is accurate, complete, current, or free from error. Public records databases may contain outdated, incomplete, or erroneous information. You are solely responsible for independently verifying all information obtained through the Platform before relying on it for any purpose, including publication.</p>

        <h3>4.2 Journalistic Verification Obligation</h3>
        <p>Records Tracer is a research tool, not a publication-ready source. All information obtained through the Platform must be independently verified through primary sources before publication. Gran Casa LLC expressly disclaims any liability for damages resulting from publication of unverified information obtained through the Platform.</p>

        <h2>5. Third-Party Data Compliance</h2>
        <p>By using Records Tracer, you agree to comply with the terms of service of all third-party data providers whose data is accessed through the Platform, including OCCRP Aleph, the FEC API, SEC EDGAR, and all other data sources. Specifically:</p>
        <ul>
          <li>OCCRP Aleph data may only be used for journalistic and research purposes consistent with OCCRP's terms of access</li>
          <li>You will not use OCCRP Aleph data in ways that would violate OCCRP's data sharing policies</li>
          <li>FEC data is public domain but may not be used for commercial solicitation</li>
          <li>You will attribute data to its original source when publishing findings</li>
        </ul>

        <h2>6. Account Registration and Security</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify Gran Casa LLC immediately of any unauthorized use of your account. Gran Casa LLC reserves the right to suspend or terminate accounts that show evidence of unauthorized use, misuse, or violation of these Terms.</p>
        <p>Account credentials are non-transferable. You may not share your login credentials with any other person. Each individual user must register their own account.</p>

        <h2>7. Subscription, Payment, and Cancellation</h2>

        <h3>7.1 Subscription Tiers</h3>
        <p>Records Tracer is offered on a subscription basis. Current pricing tiers are published on the Platform's pricing page and are subject to change with 30 days notice to existing subscribers. Founding Member rates are locked at the rate in effect at the time of subscription for the lifetime of the account.</p>

        <h3>7.2 Billing</h3>
        <p>Subscription fees are billed monthly or annually in advance. All fees are non-refundable except as required by applicable law. Gran Casa LLC reserves the right to suspend access for accounts with failed payment.</p>

        <h3>7.3 Cancellation</h3>
        <p>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. You will retain access through the end of the paid period.</p>

        <h2>8. Intellectual Property</h2>
        <p>The Records Tracer platform, including its software, design, features, and proprietary search and cross-referencing methodology, is the intellectual property of Gran Casa LLC and is protected by U.S. copyright law. All source code is copyright registered with the U.S. Copyright Office.</p>
        <p>Public records data returned by the Platform is owned by the originating government agencies and third-party data providers and is not the intellectual property of Gran Casa LLC. Nothing in these Terms grants you any ownership rights in the underlying data.</p>

        <h2>9. Privacy and Data Protection</h2>
        <p>Gran Casa LLC collects and processes limited personal data about registered users as described in our Privacy Policy. We do not sell user data to third parties. Search queries conducted on the Platform are logged for security and compliance purposes.</p>
        <p>The Platform surfaces publicly available information about third parties. Users are responsible for ensuring their use of such information complies with applicable privacy laws in their jurisdiction. Gran Casa LLC does not make representations regarding the accuracy or currency of personal information returned by the Platform.</p>

        <h2>10. Limitation of Liability</h2>
        <p className="uppercase text-sm">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, GRAN CASA LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOST PROFITS, LOST DATA, DEFAMATION CLAIMS, OR PUBLICATION OF INACCURATE INFORMATION.</p>
        <p>Gran Casa LLC's total cumulative liability to you for any claims arising under these Terms shall not exceed the total amount paid by you to Gran Casa LLC in the twelve months preceding the claim.</p>

        <h2>11. Indemnification</h2>
        <p>You agree to indemnify, defend, and hold harmless Gran Casa LLC, its officers, employees, and agents from and against any claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising from your use of the Platform, your violation of these Terms, your violation of any third-party rights, or your publication of information obtained through the Platform.</p>

        <h2>12. Governing Law and Dispute Resolution</h2>
        <p>These Terms are governed by the laws of the State of Florida without regard to its conflict of law provisions. Any dispute arising under these Terms shall be resolved exclusively in the state or federal courts located in Pinellas County, Florida, and you consent to the personal jurisdiction of such courts.</p>

        <h2>13. Modifications to Terms</h2>
        <p>Gran Casa LLC reserves the right to modify these Terms at any time. Material changes will be communicated to registered users via email at least 14 days before taking effect. Continued use of the Platform after the effective date of modified Terms constitutes acceptance of the new Terms.</p>

        <h2>14. Termination</h2>
        <p>Gran Casa LLC may suspend or terminate your access to the Platform at any time for violation of these Terms, suspected misuse, or for any other reason at our sole discretion. Upon termination, your right to use the Platform ceases immediately. Provisions of these Terms that by their nature should survive termination shall survive.</p>

        <h2>15. Contact Information</h2>
        <p>For questions about these Terms of Service, to report suspected misuse, or for general inquiries:</p>
        <p>Gran Casa LLC — Records Tracer<br />Tampa Bay, Florida<br />recordstracer.com</p>

        <p>By using Records Tracer, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>

        <p className="text-sm text-muted-foreground mt-8">© 2026 Gran Casa LLC. All rights reserved. Records Tracer is a trademark of Gran Casa LLC. This document does not constitute legal advice. Gran Casa LLC recommends consulting a licensed attorney regarding your specific legal obligations.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
