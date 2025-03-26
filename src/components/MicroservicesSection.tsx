
import React from 'react';

const MicroservicesSection = () => {
  const microservices = [
    {
      id: "auth",
      name: "SFDAuth",
      description: "Authentication and authorization service managing user identities, roles, permissions, and multi-factor authentication.",
      features: ["JWT token management", "RBAC implementation", "Multi-factor authentication", "Session management"],
      color: "blue"
    },
    {
      id: "transactions",
      name: "SFDTransactions",
      description: "Core financial transactions service handling all money movements with atomic operations and comprehensive logging.",
      features: ["Double-entry accounting", "Transaction atomicity", "Encryption of financial data", "Comprehensive audit trails"],
      color: "indigo"
    },
    {
      id: "analytics",
      name: "SFDAnalytics",
      description: "Real-time analytics and reporting service providing insights while maintaining data privacy compliance.",
      features: ["Real-time data processing", "Privacy-preserving analytics", "Custom report generation", "Data visualization APIs"],
      color: "cyan"
    }
  ];

  return (
    <section id="microservices" className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-gray-900"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            Microservices
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Dedicated Microservices
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Specialized, independent services designed for scalability, security, and maintainability.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {microservices.map((service, index) => (
            <div
              key={service.id}
              className={`rounded-xl border bg-white dark:bg-gray-900 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-4px]`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={`h-2 bg-${service.color}-500`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-12 w-12 rounded-lg bg-${service.color}-100 dark:bg-${service.color}-900/30 flex items-center justify-center text-${service.color}-600 dark:text-${service.color}-400`}>
                    {service.id === "auth" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    ) : service.id === "transactions" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 17a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V9.48a5 5 0 0 0-2.09-4.06l-4.7-3.13a5 5 0 0 0-5.42 0l-4.7 3.13A5 5 0 0 0 2 9.48V17Z" />
                        <path d="m9 21v-7.15L2 9.5" />
                        <path d="m15 21v-7.15L22 9.5" />
                        <path d="M2 14h20" />
                        <path d="M12 13v8" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18" />
                        <path d="m19 9-5 5-4-4-3 3" />
                      </svg>
                    )}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                    Node.js
                  </div>
                </div>
                
                <h3 className="text-xl font-medium mb-2">{service.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                
                <div className="space-y-2">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-${service.color}-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <path d="M12 11h4" />
                        <path d="M12 16h4" />
                        <path d="M8 11h.01" />
                        <path d="M8 16h.01" />
                      </svg>
                      <span>Isolated Database</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      <span>High Availability</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 space-y-4">
            <h3 className="text-2xl font-medium">Microservices Communication</h3>
            <p className="text-muted-foreground">
              Our architecture implements a robust event-driven communication system between microservices, ensuring loose coupling and high resilience.
            </p>
            
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Synchronous Communication</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>RESTful APIs with OpenAPI specification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>gRPC for high-performance internal calls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Circuit breaker pattern for fault tolerance</span>
                  </li>
                </ul>
              </div>
              
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Asynchronous Communication</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Event-driven architecture with Kafka</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Message queues for non-blocking operations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Guaranteed message delivery with idempotency</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MicroservicesSection;
