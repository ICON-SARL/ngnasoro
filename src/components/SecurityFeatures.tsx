
import React from 'react';

const SecurityFeatures = () => {
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "AES-256 Encryption",
      description: "Military-grade encryption for all financial data at rest and in transit, ensuring complete confidentiality."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Database Isolation",
      description: "Agency-specific database isolation prevents unauthorized cross-access and ensures regulatory compliance."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: "Audit Logging",
      description: "Comprehensive audit trails for all system activities, supporting compliance and forensic analysis."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
      ),
      title: "Biometric Authentication",
      description: "Multi-factor authentication with biometric verification for secure access to sensitive operations."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Real-time Monitoring",
      description: "Advanced threat detection system that monitors for unusual patterns and potential security breaches."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      title: "Microservices Isolation",
      description: "Independent security boundaries for each microservice to limit attack surface and potential breach impact."
    }
  ];

  return (
    <section id="security" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            Security
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Enterprise-grade Security Features
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive security measures to protect sensitive financial data and meet regulatory requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card p-6 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 max-w-3xl mx-auto rounded-xl overflow-hidden shadow-sm border">
          <div className="bg-primary/5 p-4 border-b">
            <h3 className="text-lg font-medium">Security Compliance Matrix</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Feature</th>
                  <th className="px-4 py-3 text-center font-medium">PCI DSS</th>
                  <th className="px-4 py-3 text-center font-medium">GDPR</th>
                  <th className="px-4 py-3 text-center font-medium">ISO 27001</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3">AES-256 Encryption</td>
                  <td className="px-4 py-3 text-center">✓</td>
                  <td className="px-4 py-3 text-center">✓</td>
                  <td className="px-4 py-3 text-center">✓</td>
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="px-4 py-3">Database Isolation</td>
                  <td className="px-4 py-3 text-center">✓</td>
                  <td className="px-4 py-3 text-center">✓</td>
                  <td className="px-4 py-3 text-center">✓</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">Audit Logging</td>
                  <td className="px-4 py-3 text-center">✓</td>
                  <td className="px-4 py-3 text-center">✓</td>
                  <td className="px-4 py-3 text-center">✓</td>
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="px-4 py-3">Multi-factor Authentication</td>
                  <td className="px-4 py-3 text-center">✓</td>
                  <td className="px-4 py-3 text-center">Partial</td>
                  <td className="px-4 py-3 text-center">✓</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">Data Minimization</td>
                  <td className="px-4 py-3 text-center">N/A</td>
                  <td className="px-4 py-3 text-center">✓</td>
                  <td className="px-4 py-3 text-center">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurityFeatures;
