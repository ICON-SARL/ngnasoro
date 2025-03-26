
import React from 'react';

const ArchitectureOverview = () => {
  return (
    <section id="architecture" className="py-20 md:py-28 relative">
      <div className="absolute inset-0 -z-10 bg-secondary/50 dark:bg-secondary/10"></div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            Architecture
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Scalable Microservices Architecture
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A highly scalable and secure architecture designed for financial applications with isolated components and end-to-end encryption.
          </p>
        </div>
        
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1 order-2 md:order-1">
              <div className="space-y-6 [perspective:1000px]">
                <div className="relative [transform-style:preserve-3d] [transform:rotateY(-10deg)_rotateX(10deg)]">
                  <div className="p-5 rounded-lg border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                      </div>
                      <h3 className="font-medium">React Native Frontend</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cross-platform application with shared codebase between web and mobile, secure API communication, and offline capabilities.
                    </p>
                  </div>
                </div>
                
                <div className="relative [transform-style:preserve-3d] [transform:rotateY(-10deg)_rotateX(10deg)]">
                  <div className="p-5 rounded-lg border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3c.5327 0 .935.4537.9945.9961l.0055.0039v16c0 .5327-.4537.935-.9961.9945L12 21c-.5327 0-.935-.4537-.9945-.9961L11 20V4c0-.5327.4537-.935.9961-.9945L12 3Z" />
                          <path d="M19 6c.5327 0 .935.4537.9945.9961L20 7v10c0 .5327-.4537.935-.9961.9945L19 18h-2c-.5327 0-.935-.4537-.9945-.9961L16 17V7c0-.5327.4537-.935.9961-.9945L17 6h2Z" />
                          <path d="M5 6h2c.5327 0 .935.4537.9945.9961L8 7v10c0 .5327-.4537.935-.9961.9945L7 18H5c-.5327 0-.935-.4537-.9945-.9961L4 17V7c0-.5327.4537-.935.9961-.9945L5 6Z" />
                        </svg>
                      </div>
                      <h3 className="font-medium">API Gateway</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Centralized security layer handling authentication, rate limiting, request validation, and routing to appropriate microservices.
                    </p>
                  </div>
                </div>
                
                <div className="relative [transform-style:preserve-3d] [transform:rotateY(-10deg)_rotateX(10deg)]">
                  <div className="p-5 rounded-lg border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </div>
                      <h3 className="font-medium">Isolated Database Clusters</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Agency-specific database isolation with PostgreSQL for structured data and MongoDB for analytics, ensuring data segregation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 order-1 md:order-2 relative">
              <div className="rounded-lg border shadow-sm p-2 bg-white dark:bg-gray-900">
                <div className="w-full aspect-square md:aspect-auto md:h-[400px] relative bg-secondary/30 rounded overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Client Devices */}
                    <rect x="150" y="20" width="100" height="40" rx="4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5"/>
                    <text x="200" y="45" textAnchor="middle" fill="#0284C7" fontSize="14" fontWeight="500">Client Devices</text>
                    
                    {/* API Gateway */}
                    <rect x="150" y="100" width="100" height="40" rx="4" fill="#EFF6FF" stroke="#1E40AF" strokeWidth="1.5"/>
                    <text x="200" y="125" textAnchor="middle" fill="#1E40AF" fontSize="14" fontWeight="500">API Gateway</text>
                    
                    {/* Connection lines */}
                    <line x1="200" y1="60" x2="200" y2="100" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    
                    {/* Microservices */}
                    <rect x="60" y="180" width="80" height="40" rx="4" fill="#F0F9FF" stroke="#0EA5E9" strokeWidth="1.5"/>
                    <text x="100" y="205" textAnchor="middle" fill="#0EA5E9" fontSize="12" fontWeight="500">SFDAuth</text>
                    
                    <rect x="160" y="180" width="80" height="40" rx="4" fill="#F0F9FF" stroke="#0EA5E9" strokeWidth="1.5"/>
                    <text x="200" y="205" textAnchor="middle" fill="#0EA5E9" fontSize="12" fontWeight="500">SFDTransactions</text>
                    
                    <rect x="260" y="180" width="80" height="40" rx="4" fill="#F0F9FF" stroke="#0EA5E9" strokeWidth="1.5"/>
                    <text x="300" y="205" textAnchor="middle" fill="#0EA5E9" fontSize="12" fontWeight="500">SFDAnalytics</text>
                    
                    {/* Connection lines from Gateway to Microservices */}
                    <line x1="200" y1="140" x2="100" y2="180" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <line x1="200" y1="140" x2="200" y2="180" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <line x1="200" y1="140" x2="300" y2="180" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    
                    {/* Databases */}
                    <rect x="60" y="260" width="80" height="40" rx="4" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5"/>
                    <text x="100" y="285" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="500">Auth DB</text>
                    
                    <rect x="160" y="260" width="80" height="40" rx="4" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5"/>
                    <text x="200" y="285" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="500">Transactions DB</text>
                    
                    <rect x="260" y="260" width="80" height="40" rx="4" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5"/>
                    <text x="300" y="285" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="500">Analytics DB</text>
                    
                    {/* Connections from Microservices to Databases */}
                    <line x1="100" y1="220" x2="100" y2="260" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <line x1="200" y1="220" x2="200" y2="260" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <line x1="300" y1="220" x2="300" y2="260" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    
                    {/* Encryption Layer */}
                    <rect x="30" y="320" width="340" height="30" rx="4" fill="#F0FDF4" stroke="#059669" strokeWidth="1.5"/>
                    <text x="200" y="340" textAnchor="middle" fill="#059669" fontSize="12" fontWeight="500">AES-256 Encryption Layer</text>
                    
                    {/* Connection to Encryption Layer */}
                    <line x1="100" y1="300" x2="100" y2="320" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <line x1="200" y1="300" x2="200" y2="320" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <line x1="300" y1="300" x2="300" y2="320" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    
                    {/* Animated dots to show data flow */}
                    <circle className="animate-pulse" cx="200" cy="80" r="3" fill="#0EA5E9" opacity="0.8"/>
                    <circle className="animate-pulse" cx="150" cy="150" r="3" fill="#0EA5E9" opacity="0.8" style={{ animationDelay: '300ms' }}/>
                    <circle className="animate-pulse" cx="250" cy="150" r="3" fill="#0EA5E9" opacity="0.8" style={{ animationDelay: '600ms' }}/>
                    <circle className="animate-pulse" cx="100" cy="240" r="3" fill="#0EA5E9" opacity="0.8" style={{ animationDelay: '900ms' }}/>
                    <circle className="animate-pulse" cx="200" cy="240" r="3" fill="#0EA5E9" opacity="0.8" style={{ animationDelay: '1200ms' }}/>
                    <circle className="animate-pulse" cx="300" cy="240" r="3" fill="#0EA5E9" opacity="0.8" style={{ animationDelay: '1500ms' }}/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureOverview;
