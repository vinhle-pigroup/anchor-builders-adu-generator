import React, { useState, useEffect } from 'react';

const AnchorBuildersProposal = () => {
  const [formData, setFormData] = useState({
    // Client Information
    CLIENT_NAME: "John & Jane Smith",
    CLIENT_EMAIL: "john.smith@email.com", 
    CLIENT_PHONE: "(714) 555-1234",
    CLIENT_ADDRESS: "1234 Main Street, Santa Ana, CA 92701",
    
    // Project Specifications
    ADU_TYPE: "Detached",
    SQUARE_FOOTAGE: "800",
    BEDROOMS: "2",
    BATHROOMS: "1",
    HVAC_TYPE: "Central AC",
    APPLIANCES_INCLUDED: true,
    
    // Utilities Configuration
    WATER_METER_SEPARATE: false,
    GAS_METER_SEPARATE: false,
    ELECTRIC_METER_SEPARATE: true,
    
    // Services & Add-Ons
    DESIGN_SERVICES: "8500",
    FEMA_INCLUDED: false,
    SELECTED_ADD_ONS: [],
    ADD_ON_WORK_EXISTS: false,
    
    // Pricing Variables
    COST_PER_SQFT: "231",
    CONSTRUCTION_SUBTOTAL: "185000",
    GRAND_TOTAL: "194500",
    MILESTONES: {
      milestone1: "25000",
      milestone2: "22000", 
      milestone3: "28000",
      milestone4: "35000",
      milestone5: "30000",
      milestone6: "25000",
      milestone7: "20000"
    },
    
    // Timeline & Dates
    PROPOSAL_DATE: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    }),
    TIMELINE: "8-12 months",
    ADDITIONAL_NOTES: ""
  });

  const [showForm, setShowForm] = useState(true);

  // Auto-calculate totals when milestones change
  useEffect(() => {
    const constructionTotal = Object.values(formData.MILESTONES).reduce((sum, val) => sum + parseInt(val || 0), 0);
    const designTotal = parseInt(formData.DESIGN_SERVICES || 0);
    const total = constructionTotal + designTotal + 1000; // +1000 for deposit
    const costPerSqft = Math.round(total / parseInt(formData.SQUARE_FOOTAGE || 1));
    
    setFormData(prev => ({
      ...prev,
      CONSTRUCTION_SUBTOTAL: constructionTotal.toString(),
      GRAND_TOTAL: total.toString(),
      COST_PER_SQFT: costPerSqft.toString()
    }));
  }, [formData.MILESTONES, formData.DESIGN_SERVICES, formData.SQUARE_FOOTAGE]);

  const handleInputChange = (field, value) => {
    if (field.includes('milestone')) {
      setFormData(prev => ({
        ...prev,
        MILESTONES: {
          ...prev.MILESTONES,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const currentDate = formData.PROPOSAL_DATE;
  const proposalNumber = `AB-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Control Panel */}
      <div className={`${showForm ? 'w-1/3' : 'w-12'} bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto`}>
        <div className="p-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-4 px-3 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 text-sm"
          >
            {showForm ? '← Hide Form' : 'Show Form →'}
          </button>
          
          {showForm && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800">Proposal Editor</h2>
              
              {/* Client Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Client Information</h3>
                <input
                  type="text"
                  placeholder="Client Name"
                  value={formData.CLIENT_NAME}
                  onChange={(e) => handleInputChange('CLIENT_NAME', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.CLIENT_PHONE}
                  onChange={(e) => handleInputChange('CLIENT_PHONE', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.CLIENT_EMAIL}
                  onChange={(e) => handleInputChange('CLIENT_EMAIL', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
                <textarea
                  placeholder="Full Address (street, city, state, zip)"
                  value={formData.CLIENT_ADDRESS}
                  onChange={(e) => handleInputChange('CLIENT_ADDRESS', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  rows="2"
                />
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Project Specifications</h3>
                <input
                  type="number"
                  placeholder="Square Footage"
                  value={formData.SQUARE_FOOTAGE}
                  onChange={(e) => handleInputChange('SQUARE_FOOTAGE', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Bedrooms"
                    value={formData.BEDROOMS}
                    onChange={(e) => handleInputChange('BEDROOMS', e.target.value)}
                    className="p-2 border rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Bathrooms"
                    value={formData.BATHROOMS}
                    onChange={(e) => handleInputChange('BATHROOMS', e.target.value)}
                    className="p-2 border rounded text-sm"
                  />
                </div>
                <select
                  value={formData.ADU_TYPE}
                  onChange={(e) => handleInputChange('ADU_TYPE', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="Detached">Detached ADU</option>
                  <option value="Attached">Attached ADU</option>
                  <option value="Junior">Junior ADU</option>
                  <option value="Garage Conversion">Garage Conversion</option>
                </select>
                <select
                  value={formData.HVAC_TYPE}
                  onChange={(e) => handleInputChange('HVAC_TYPE', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="Central AC">Central AC</option>
                  <option value="Mini-Split">Mini-Split System</option>
                  <option value="Heat Pump">Heat Pump</option>
                </select>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.APPLIANCES_INCLUDED}
                    onChange={(e) => handleInputChange('APPLIANCES_INCLUDED', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Appliances Included</span>
                </label>
              </div>

              {/* Utility Connections */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Utilities Configuration</h3>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.WATER_METER_SEPARATE}
                    onChange={(e) => handleInputChange('WATER_METER_SEPARATE', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Separate Water Meter</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.GAS_METER_SEPARATE}
                    onChange={(e) => handleInputChange('GAS_METER_SEPARATE', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Separate Gas Meter</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.ELECTRIC_METER_SEPARATE}
                    onChange={(e) => handleInputChange('ELECTRIC_METER_SEPARATE', e.target.checked)}
                    className="rounded"
                    disabled
                  />
                  <span className="text-sm text-gray-500">Separate Electric Meter (Always Required)</span>
                </label>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Pricing & Services</h3>
                <input
                  type="number"
                  placeholder="Design Services Cost"
                  value={formData.DESIGN_SERVICES}
                  onChange={(e) => handleInputChange('DESIGN_SERVICES', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Cost per Sq Ft"
                  value={formData.COST_PER_SQFT}
                  onChange={(e) => handleInputChange('COST_PER_SQFT', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Grand Total"
                  value={formData.GRAND_TOTAL}
                  onChange={(e) => handleInputChange('GRAND_TOTAL', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.FEMA_INCLUDED}
                    onChange={(e) => handleInputChange('FEMA_INCLUDED', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">FEMA Compliance Included</span>
                </label>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">Construction Milestones</h4>
                  <input
                    type="number"
                    placeholder="Mobilization"
                    value={formData.MILESTONES.milestone1}
                    onChange={(e) => handleInputChange('milestone1', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Underground"
                    value={formData.MILESTONES.milestone2}
                    onChange={(e) => handleInputChange('milestone2', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Foundation"
                    value={formData.MILESTONES.milestone3}
                    onChange={(e) => handleInputChange('milestone3', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Framing"
                    value={formData.MILESTONES.milestone4}
                    onChange={(e) => handleInputChange('milestone4', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="MEP"
                    value={formData.MILESTONES.milestone5}
                    onChange={(e) => handleInputChange('milestone5', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Drywall"
                    value={formData.MILESTONES.milestone6}
                    onChange={(e) => handleInputChange('milestone6', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Final"
                    value={formData.MILESTONES.milestone7}
                    onChange={(e) => handleInputChange('milestone7', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <div className={`${showForm ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Live Preview</h2>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
            >
              Print/Save PDF
            </button>
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto" style={{height: 'calc(100vh - 80px)'}}>
          {/* Professional Construction Proposal */}
          <div style={{
            width: '8.5in',
            minHeight: '11in',
            margin: '0 auto',
            background: 'white',
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: '10px',
            lineHeight: '1.4',
            color: '#374151',
            padding: '0.35in',
            boxShadow: '0 0 20px rgba(0,0,0,0.1)'
          }}>

            {/* Header Section */}
            <header style={{
              marginBottom: '15px',
              background: 'white',
              borderBottom: '2px solid #374151',
              paddingBottom: '10px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: '#374151',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '10px'
                  }}>
                    ANCHOR
                  </div>
                  <div>
                    <h1 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#374151',
                      margin: '0 0 6px 0'
                    }}>ANCHOR BUILDERS</h1>
                    <div style={{
                      fontSize: '9px',
                      color: '#6b7280',
                      lineHeight: '1.4'
                    }}>
                      License #1029392 | (408) 836-2534<br/>
                      info@anchorbuilders.com<br/>
                      12962 Main Street, Garden Grove, CA 92840
                    </div>
                  </div>
                </div>
                
                <div style={{
                  background: '#f9fafb',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  minWidth: '200px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      color: '#6b7280',
                      textTransform: 'uppercase'
                    }}>Proposal Date:</span>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>{currentDate}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      color: '#6b7280',
                      textTransform: 'uppercase'
                    }}>Proposal #:</span>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>{proposalNumber}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      color: '#6b7280',
                      textTransform: 'uppercase'
                    }}>Valid Until:</span>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>30 Days</span>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'white',
                color: '#1f2937',
                textAlign: 'center',
                padding: '12px 0',
                margin: '0 -10px',
                borderTop: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  margin: '0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>ADU Construction Proposal</h2>
              </div>
            </header>

            {/* Project Overview */}
            <section style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '20px 24px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                gap: '24px',
                alignItems: 'start'
              }}>
                {/* Client Information Column */}
                <div>
                  <h4 style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px',
                    borderBottom: '1px solid #d1d5db',
                    paddingBottom: '4px'
                  }}>Client Information</h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px 16px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '8px',
                        fontWeight: '700',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '2px'
                      }}>Client Name</div>
                      <div style={{
                        fontSize: '10px',
                        color: '#374151',
                        fontWeight: '600',
                        lineHeight: '1.2'
                      }}>{formData.CLIENT_NAME}</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '8px',
                        fontWeight: '700',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '2px'
                      }}>Phone</div>
                      <div style={{
                        fontSize: '10px',
                        color: '#374151',
                        fontWeight: '500'
                      }}>{formData.CLIENT_PHONE}</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '8px',
                        fontWeight: '700',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '2px'
                      }}>Email</div>
                      <div style={{
                        fontSize: '10px',
                        color: '#374151',
                        fontWeight: '500'
                      }}>{formData.CLIENT_EMAIL}</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '8px',
                        fontWeight: '700',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '2px'
                      }}>Project Address</div>
                      <div style={{
                        fontSize: '10px',
                        color: '#374151',
                        fontWeight: '500',
                        lineHeight: '1.3'
                      }}>{formData.CLIENT_ADDRESS}</div>
                    </div>
                  </div>
                </div>
                
                {/* Project Details Column */}
                <div>
                  <h4 style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px',
                    borderBottom: '1px solid #d1d5db',
                    paddingBottom: '4px'
                  }}>Project Details</h4>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <div style={{
                        fontSize: '8px',
                        fontWeight: '700',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '2px'
                      }}>Living Area</div>
                      <div style={{
                        fontSize: '11px',
                        color: '#374151',
                        fontWeight: '700'
                      }}>{formData.SQUARE_FOOTAGE} sqft</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '8px',
                        fontWeight: '700',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '2px'
                      }}>Layout</div>
                      <div style={{
                        fontSize: '10px',
                        color: '#374151',
                        fontWeight: '600'
                      }}>{formData.BEDROOMS} bed / {formData.BATHROOMS} bath</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '8px',
                        fontWeight: '700',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '2px'
                      }}>ADU Type</div>
                      <div style={{
                        fontSize: '10px',
                        color: '#374151',
                        fontWeight: '500'
                      }}>{formData.ADU_TYPE} ADU</div>
                    </div>
                  </div>
                </div>

                {/* Project Summary Column */}
                <div>
                  <h4 style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px',
                    borderBottom: '1px solid #d1d5db',
                    paddingBottom: '4px'
                  }}>Project Summary</h4>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <div style={{
                        fontSize: '8px',
                        fontWeight: '700',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '2px'
                      }}>Total Project Cost</div>
                      <div style={{
                        fontSize: '10px',
                        color: '#374151',
                        fontWeight: '600'
                      }}>${parseInt(formData.GRAND_TOTAL || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '8px',
                        fontWeight: '700',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '2px'
                      }}>Cost per Sq Ft</div>
                      <div style={{
                        fontSize: '11px',
                        color: '#374151',
                        fontWeight: '700'
                      }}>${formData.COST_PER_SQFT}/sqft</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '8px',
                        fontWeight: '700',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '2px'
                      }}>Timeline</div>
                      <div style={{
                        fontSize: '10px',
                        color: '#374151',
                        fontWeight: '500',
                        lineHeight: '1.3'
                      }}>{formData.TIMELINE}<br/>from approval</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Scope of Work */}
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#1f2937',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '15px',
                paddingBottom: '8px',
                paddingTop: '8px',
                paddingLeft: '12px',
                paddingRight: '12px',
                borderBottom: '2px solid #e5e7eb',
                background: '#e2e8f0',
                borderRadius: '4px'
              }}>Scope of Work</h3>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}>Project Overview</h4>
                <p style={{
                  fontSize: '10px',
                  lineHeight: '1.5',
                  color: '#475569',
                  marginBottom: '8px'
                }}>
                  Anchor Builders will construct a complete {formData.SQUARE_FOOTAGE} square foot {formData.ADU_TYPE.toLowerCase()} ADU featuring {formData.BEDROOMS} bedroom{formData.BEDROOMS > 1 ? 's' : ''} and {formData.BATHROOMS} bathroom{formData.BATHROOMS > 1 ? 's' : ''}. This turnkey project includes full design and engineering services by Haus of Lines (HOL), followed by complete construction to create a move-in ready accessory dwelling unit.
                </p>
                <p style={{
                  fontSize: '10px',
                  lineHeight: '1.5',
                  color: '#475569'
                }}>
                  The project encompasses everything from initial architectural design through final Certificate of Occupancy, including all structural work, mechanical systems ({formData.HVAC_TYPE}), electrical, plumbing, finishes, and appliances. Our comprehensive approach ensures code compliance, quality construction, and a seamless process from concept to completion.
                </p>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px'
              }}>
                <div>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    background: '#fef9e7',
                    color: '#713f12',
                    padding: '6px 8px',
                    textAlign: 'center',
                    borderRadius: '3px',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>✓ Design & Engineering</div>
                  <ul style={{
                    listStyle: 'none',
                    padding: '0',
                    margin: '6px 0'
                  }}>
                    {['Architectural plans & renderings', 'Structural engineering', 'MEP coordination', 'Permit assistance', 'Construction documents', 'Plan revisions'].map((item, index) => (
                      <li key={index} style={{
                        padding: '2px 0',
                        fontSize: '8px',
                        position: 'relative',
                        paddingLeft: '12px',
                        lineHeight: '1.2'
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: '0',
                          color: '#059669',
                          fontWeight: 'bold',
                          fontSize: '9px'
                        }}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    background: '#e0f2fe',
                    color: '#0c4a6e',
                    padding: '6px 8px',
                    textAlign: 'center',
                    borderRadius: '3px',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>✓ Construction Work</div>
                  <ul style={{
                    listStyle: 'none',
                    padding: '0',
                    margin: '6px 0'
                  }}>
                    {[
                      'Concrete foundation with drainage',
                      'Electrical system with 100-amp panel',
                      'Full plumbing with water heater',
                      `${formData.HVAC_TYPE} installation`,
                      'Insulation package (R-13/R-30)',
                      'Drywall with texture & primer',
                      formData.APPLIANCES_INCLUDED ? 'Kitchen appliances package' : 'Kitchen appliance rough-in only',
                      'Cabinets & vanities',
                      'Interior & exterior doors',
                      'Double-pane vinyl windows'
                    ].map((item, index) => (
                      <li key={index} style={{
                        padding: '2px 0',
                        fontSize: '8px',
                        position: 'relative',
                        paddingLeft: '12px',
                        lineHeight: '1.2'
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: '0',
                          color: '#059669',
                          fontWeight: 'bold',
                          fontSize: '9px'
                        }}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '6px 8px',
                    textAlign: 'center',
                    borderRadius: '3px',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>✓ Included Assurances</div>
                  <ul style={{
                    listStyle: 'none',
                    padding: '0',
                    margin: '6px 0'
                  }}>
                    {[
                      'California Building Code compliance',
                      'Professional city inspections',
                      'Third-party testing & commissioning',
                      'Certificate of Occupancy coordination',
                      '1-year construction warranty',
                      'Licensed contractor (CA #1029392)',
                      'Quality control inspections',
                      'Material warranties transferred',
                      'Final walkthrough & punch list'
                    ].map((item, index) => (
                      <li key={index} style={{
                        padding: '2px 0',
                        fontSize: '8px',
                        position: 'relative',
                        paddingLeft: '12px',
                        lineHeight: '1.2'
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: '0',
                          color: '#059669',
                          fontWeight: 'bold',
                          fontSize: '9px'
                        }}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{
                marginTop: '15px',
                padding: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '4px'
              }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: '6px'
                }}>Utility Connections Included:</div>
                <div style={{
                  fontSize: '9px',
                  color: '#64748b',
                  lineHeight: '1.3'
                }}>
                  <strong>Water:</strong> {formData.WATER_METER_SEPARATE ? 'Separate meter connection' : 'Shared connection'} • <strong>Gas:</strong> {formData.GAS_METER_SEPARATE ? 'Separate meter connection' : 'Shared connection'} • <strong>Electric:</strong> Separate 100-amp service • <strong>Sewer:</strong> Connected to main line
                </div>
              </div>
            </div>

            {/* Project Pricing */}
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#1f2937',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '15px',
                paddingBottom: '8px',
                paddingTop: '8px',
                paddingLeft: '12px',
                paddingRight: '12px',
                borderBottom: '2px solid #e5e7eb',
                background: '#e2e8f0',
                borderRadius: '4px'
              }}>Project Pricing & Payment Schedule</h3>
              
              <div style={{
                margin: '10px 0',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '9px'
                }}>
                  <thead>
                    <tr style={{
                      background: '#f9fafb',
                      color: '#374151',
                      fontWeight: '600',
                      textAlign: 'left'
                    }}>
                      <th style={{
                        padding: '6px 8px',
                        width: '40px',
                        fontSize: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>#</th>
                      <th style={{
                        padding: '6px 8px',
                        fontSize: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>Milestone Description</th>
                      <th style={{
                        padding: '6px 8px',
                        width: '100px',
                        fontSize: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        textAlign: 'right'
                      }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Design Phase - Phase 1 (HOL Work) */}
                    <tr style={{
                      background: '#fef9e7',
                      color: '#713f12',
                      fontWeight: '700',
                      textAlign: 'center'
                    }}>
                      <td colSpan="3" style={{
                        padding: '6px',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>Phase 1: Design & Engineering (HOL)</td>
                    </tr>
                    <tr>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        width: '40px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#6b7280',
                        fontSize: '8px'
                      }}>1.1</td>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '8px'
                      }}>ADU Plan Design</td>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        textAlign: 'right',
                        fontWeight: '700',
                        color: '#374151',
                        width: '100px',
                        fontSize: '8px'
                      }}>${parseInt(formData.DESIGN_SERVICES).toLocaleString()}</td>
                    </tr>
                    <tr style={{ background: '#f9fafb' }}>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        width: '40px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#6b7280',
                        fontSize: '8px'
                      }}>1.2</td>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '8px'
                      }}>Structural Engineering (Roof & Foundation Plan)</td>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        textAlign: 'right',
                        color: '#9ca3af',
                        fontWeight: '500',
                        fontStyle: 'italic',
                        width: '100px',
                        fontSize: '8px'
                      }}>included</td>
                    </tr>
                    <tr>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        width: '40px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#6b7280',
                        fontSize: '8px'
                      }}>1.3</td>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '8px'
                      }}>MEP Design (Mechanical, Electrical, Plumbing)</td>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        textAlign: 'right',
                        color: '#9ca3af',
                        fontWeight: '500',
                        fontStyle: 'italic',
                        width: '100px',
                        fontSize: '8px'
                      }}>included</td>
                    </tr>
                    <tr style={{ background: '#f9fafb' }}>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        width: '40px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#6b7280',
                        fontSize: '8px'
                      }}>1.4</td>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '8px'
                      }}>Zoning & Site Planning Review</td>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        textAlign: 'right',
                        color: '#9ca3af',
                        fontWeight: '500',
                        fontStyle: 'italic',
                        width: '100px',
                        fontSize: '8px'
                      }}>included</td>
                    </tr>
                    <tr>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        width: '40px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#6b7280',
                        fontSize: '8px'
                      }}>1.5</td>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '8px'
                      }}>Title 24 Energy Compliance</td>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        textAlign: 'right',
                        color: '#9ca3af',
                        fontWeight: '500',
                        fontStyle: 'italic',
                        width: '100px',
                        fontSize: '8px'
                      }}>included</td>
                    </tr>

                    {/* Construction Phase - Phase 2 (Construction Work) */}
                    <tr style={{
                      background: '#e0f2fe',
                      color: '#0c4a6e',
                      fontWeight: '700',
                      textAlign: 'center'
                    }}>
                      <td colSpan="3" style={{
                        padding: '6px',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>Phase 2: Construction Build Out</td>
                    </tr>
                    <tr style={{ background: '#f9fafb' }}>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        width: '40px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#6b7280',
                        fontSize: '8px'
                      }}>2.1</td>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '8px'
                      }}>Deposit</td>
                      <td style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #e5e7eb',
                        textAlign: 'right',
                        fontWeight: '700',
                        color: '#374151',
                        width: '100px',
                        fontSize: '8px'
                      }}>$1,000</td>
                    </tr>
                    {[
                      ['2.2', 'Mobilization', formData.MILESTONES.milestone1],
                      ['2.3', 'Trenching & Underground Plumbing', formData.MILESTONES.milestone2],
                      ['2.4', 'Foundation', formData.MILESTONES.milestone3],
                      ['2.5', 'Framing', formData.MILESTONES.milestone4],
                      ['2.6', 'Mechanical, Electrical, Plumbing (MEP)', formData.MILESTONES.milestone5],
                      ['2.7', 'Drywall', formData.MILESTONES.milestone6],
                      ['2.8', 'Final Completion', formData.MILESTONES.milestone7]
                    ].map(([number, description, amount], index) => (
                      <tr key={number} style={index % 2 === 0 ? { background: '#f9fafb' } : {}}>
                        <td style={{
                          padding: '4px 8px',
                          borderBottom: '1px solid #e5e7eb',
                          width: '40px',
                          textAlign: 'center',
                          fontWeight: '600',
                          color: '#6b7280',
                          fontSize: '8px'
                        }}>{number}</td>
                        <td style={{
                          padding: '4px 8px',
                          borderBottom: '1px solid #e5e7eb',
                          fontSize: '8px'
                        }}>{description}</td>
                        <td style={{
                          padding: '4px 8px',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'right',
                          fontWeight: '700',
                          color: '#374151',
                          width: '100px',
                          fontSize: '8px'
                        }}>${parseInt(amount).toLocaleString()}</td>
                      </tr>
                    ))}

                    {/* Total */}
                    <tr style={{
                      background: 'white',
                      color: '#1f2937',
                      fontWeight: '800',
                      fontSize: '10px',
                      borderTop: '2px solid #1f2937'
                    }}>
                      <td colSpan="2" style={{
                        textAlign: 'right',
                        padding: '8px'
                      }}><strong>GRAND TOTAL:</strong></td>
                      <td style={{
                        textAlign: 'right',
                        fontSize: '12px',
                        fontWeight: '800',
                        padding: '8px'
                      }}>${parseInt(formData.GRAND_TOTAL).toLocaleString()}</td>
                    </tr>
                    
                    <tr style={{ background: '#f3f4f6' }}>
                      <td colSpan="2" style={{
                        textAlign: 'right',
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '8px'
                      }}>Base Construction Price per Square Foot:</td>
                      <td style={{
                        textAlign: 'right',
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '8px'
                      }}>${formData.COST_PER_SQFT}/sqft</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Timeline */}
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#1f2937',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '15px',
                paddingBottom: '8px',
                paddingTop: '8px',
                paddingLeft: '12px',
                paddingRight: '12px',
                borderBottom: '2px solid #e5e7eb',
                background: '#e2e8f0',
                borderRadius: '4px'
              }}>Payment Milestones Timeline</h3>
              
              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                padding: '15px',
                margin: '15px 0'
              }}>
                {/* Design & Deposits Row - Phase 1 (HOL Work) */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                  paddingBottom: '15px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#713f12',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Phase 1: Design & Deposits (HOL)</div>
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: '70px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#fef9e7',
                        color: '#713f12',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        fontWeight: '700',
                        border: '2px solid #f59e0b',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }}>D1</div>
                      <div style={{
                        fontSize: '8px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#374151',
                        marginTop: '4px',
                        lineHeight: '1.1'
                      }}>Deposit</div>
                      <div style={{
                        fontSize: '8px',
                        color: '#9ca3af',
                        fontWeight: '500',
                        textAlign: 'center',
                        marginTop: '2px'
                      }}>$1,000</div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: '70px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#fef9e7',
                        color: '#713f12',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        fontWeight: '700',
                        border: '2px solid #f59e0b',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }}>D2</div>
                      <div style={{
                        fontSize: '8px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#374151',
                        marginTop: '4px',
                        lineHeight: '1.1'
                      }}>Design Fee</div>
                      <div style={{
                        fontSize: '8px',
                        color: '#9ca3af',
                        fontWeight: '500',
                        textAlign: 'center',
                        marginTop: '2px'
                      }}>${parseInt(formData.DESIGN_SERVICES).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Construction Row - Phase 2 (Construction Work) */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#0c4a6e',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Phase 2: Construction Milestones</div>
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center'
                  }}>
                    {[
                      ['M1', 'Mobilization', formData.MILESTONES.milestone1],
                      ['M2', 'Underground', formData.MILESTONES.milestone2],
                      ['M3', 'Foundation', formData.MILESTONES.milestone3],
                      ['M4', 'Framing', formData.MILESTONES.milestone4],
                      ['M5', 'MEP', formData.MILESTONES.milestone5],
                      ['M6', 'Drywall', formData.MILESTONES.milestone6],
                      ['M7', 'Final', formData.MILESTONES.milestone7]
                    ].map(([code, label, amount]) => (
                      <div key={code} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '70px'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#e0f2fe',
                          color: '#0c4a6e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          fontWeight: '700',
                          border: '2px solid #0284c7',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }}>{code}</div>
                        <div style={{
                          fontSize: '8px',
                          textAlign: 'center',
                          fontWeight: '600',
                          color: '#374151',
                          marginTop: '4px',
                          lineHeight: '1.1'
                        }}>{label}</div>
                        <div style={{
                          fontSize: '8px',
                          color: '#9ca3af',
                          fontWeight: '500',
                          textAlign: 'center',
                          marginTop: '2px'
                        }}>${parseInt(amount).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Exclusions & Additional Services */}
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#1f2937',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '15px',
                paddingBottom: '8px',
                paddingTop: '8px',
                paddingLeft: '12px',
                paddingRight: '12px',
                borderBottom: '2px solid #e5e7eb',
                background: '#e2e8f0',
                borderRadius: '4px'
              }}>Exclusions & Additional Services</h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#1f2937',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    marginBottom: '12px',
                    paddingBottom: '6px',
                    paddingTop: '6px',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    borderBottom: '1px solid #d1d5db',
                    background: '#e2e8f0',
                    borderRadius: '3px'
                  }}>Exclusions</h4>
                  <div style={{ fontSize: '8px', color: '#374151', marginBottom: '8px' }}>
                    <em>(Any work outside of the normal building of an ADU)</em>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <h5 style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      marginBottom: '6px',
                      color: '#374151'
                    }}>City-Related Costs</h5>
                    <ul style={{
                      listStyle: 'disc',
                      paddingLeft: '12px',
                      margin: '0',
                      fontSize: '8px',
                      lineHeight: '1.3',
                      color: '#4b5563'
                    }}>
                      <li>City permits, planning approval fees, and third-party inspections</li>
                      <li>Land grading, surveys, and soil testing (if required), including grading beyond the building foundation area</li>
                    </ul>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <h5 style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      marginBottom: '6px',
                      color: '#374151'
                    }}>Site Prep & Exterior Work</h5>
                    <ul style={{
                      listStyle: 'disc',
                      paddingLeft: '12px',
                      margin: '0',
                      fontSize: '8px',
                      lineHeight: '1.3',
                      color: '#4b5563'
                    }}>
                      <li>Cleaning or demolishing any existing or unpermitted structures</li>
                      <li>Landscaping, fencing, driveways, patios, rain gutters</li>
                      <li>Potential damage to underground irrigation or tree roots</li>
                    </ul>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <h5 style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      marginBottom: '6px',
                      color: '#374151'
                    }}>Utilities & Unexpected Conditions</h5>
                    <ul style={{
                      listStyle: 'disc',
                      paddingLeft: '12px',
                      margin: '0',
                      fontSize: '8px',
                      lineHeight: '1.3',
                      color: '#4b5563'
                    }}>
                      <li>Utility connections (gas, water, electric) or fire sprinkler system installation (if required)</li>
                      <li>Unforeseen repairs like structural issues, pests, or water damage</li>
                      <li>Builder Risk Insurance or city-required bonds for construction</li>
                    </ul>
                  </div>

                  <div>
                    <h5 style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      marginBottom: '6px',
                      color: '#374151'
                    }}>Security & Insurance</h5>
                    <ul style={{
                      listStyle: 'disc',
                      paddingLeft: '12px',
                      margin: '0',
                      fontSize: '8px',
                      lineHeight: '1.3',
                      color: '#4b5563'
                    }}>
                      <li>Job-site security or surveillance systems</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#1f2937',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    marginBottom: '12px',
                    paddingBottom: '6px',
                    paddingTop: '6px',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    borderBottom: '1px solid #d1d5db',
                    background: '#e2e8f0',
                    borderRadius: '3px'
                  }}>Additional Services (Add On)</h4>
                  <div style={{ fontSize: '8px', color: '#374151', marginBottom: '8px' }}>
                    <em>(These are additional services that are not included)</em>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <h5 style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      marginBottom: '6px',
                      color: '#374151'
                    }}>1) Design Upgrades</h5>
                    <div style={{
                      fontSize: '8px',
                      lineHeight: '1.3',
                      color: '#4b5563',
                      paddingLeft: '8px'
                    }}>
                      a. Customized option to personalize your project beyond our Standardized Material Package.
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <h5 style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      marginBottom: '6px',
                      color: '#374151'
                    }}>2) Landscaping and Hardscaping Site Design</h5>
                    <div style={{
                      fontSize: '8px',
                      lineHeight: '1.3',
                      color: '#4b5563',
                      paddingLeft: '8px'
                    }}>
                      a. Landscape and hardscaping services to improve the appearance and functionality of your property.
                    </div>
                  </div>

                  <div>
                    <h5 style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      marginBottom: '6px',
                      color: '#374151'
                    }}>3) Rental Plans</h5>
                    <div style={{
                      fontSize: '8px',
                      lineHeight: '1.3',
                      color: '#4b5563',
                      paddingLeft: '8px'
                    }}>
                      a. Creation of a site plan to designate a parking spot for tenants, ensuring separation between rental units.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#1f2937',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '15px',
                paddingBottom: '8px',
                paddingTop: '8px',
                paddingLeft: '12px',
                paddingRight: '12px',
                borderBottom: '2px solid #e5e7eb',
                background: '#e2e8f0',
                borderRadius: '4px'
              }}>Terms & Conditions</h3>
              
              <div style={{
                fontSize: '9px',
                lineHeight: '1.5',
                color: '#374151'
              }}>
                <p style={{ marginBottom: '10px' }}>
                  A formal construction contract will be prepared and executed upon acceptance of this bid. The pricing outlined in this proposal is valid for 30 days from the proposal date. A detailed payment schedule will be included in the formal contract.
                </p>
                
                <p style={{ marginBottom: '10px' }}>
                  The overall project schedule is subject to factors such as city permitting timelines, material availability, and the client's responsiveness throughout the process.
                </p>
                
                <p style={{ marginBottom: '10px' }}>
                  Any changes to the agreed-upon scope of work, materials, layout, or finish levels must be requested in writing and formally approved. Approved change orders may result in adjustments to both the total project cost and construction timeline. All changes will be documented and reflected with an updated scope, revised pricing, and adjusted schedule as needed.
                </p>
                
                <p style={{
                  fontStyle: 'italic',
                  color: '#6b7280',
                  textAlign: 'center',
                  marginTop: '15px',
                  fontSize: '8px',
                  fontWeight: '600'
                }}>
                  *This is a non-binding estimate. Final cost is subject to plan approval, scope adjustments, and change orders.*
                </p>

                <div style={{
                  marginTop: '15px',
                  padding: '8px',
                  background: '#f8fafc',
                  borderRadius: '4px',
                  fontSize: '8px'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Footnotes & Clarifications:</div>
                  <div>Interior Design - includes 2 sessions (each session 2 hours). Additional sessions billed at $150/hour.</div>
                </div>
              </div>
            </div>

            {/* Owner Acceptance & Signatures */}
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#1f2937',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '15px',
                paddingBottom: '8px',
                paddingTop: '8px',
                paddingLeft: '12px',
                paddingRight: '12px',
                borderBottom: '2px solid #e5e7eb',
                background: '#e2e8f0',
                borderRadius: '4px'
              }}>Owner Acceptance & Signatures</h3>

              <div style={{
                fontSize: '9px',
                lineHeight: '1.4',
                color: '#374151',
                marginBottom: '25px',
                textAlign: 'center'
              }}>
                I, {formData.CLIENT_NAME.split(' ')[0]}, accept the above scope of work, proposed to be completed by Anchor Builders for the amount of ${parseInt(formData.GRAND_TOTAL).toLocaleString()}.00.
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '40px',
                marginTop: '25px'
              }}>
                <div style={{
                  padding: '15px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  background: '#f9fafb',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '15px'
                  }}>Client Signature</div>
                  <div style={{
                    height: '40px',
                    borderBottom: '2px solid #1f2937',
                    margin: '15px 0'
                  }}></div>
                  <div style={{
                    fontSize: '9px',
                    color: '#6b7280',
                    lineHeight: '1.3'
                  }}>
                    {formData.CLIENT_NAME}<br/>
                    Date: _______________
                  </div>
                </div>
                <div style={{
                  padding: '15px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  background: '#f9fafb',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '15px'
                  }}>Anchor Builders Representative</div>
                  <div style={{
                    height: '40px',
                    borderBottom: '2px solid #1f2937',
                    margin: '15px 0'
                  }}></div>
                  <div style={{
                    fontSize: '9px',
                    color: '#6b7280',
                    lineHeight: '1.3'
                  }}>
                    Authorized Representative<br/>
                    Date: _______________
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer style={{
              marginTop: '25px',
              padding: '15px 0',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center',
              fontSize: '8px',
              color: '#6b7280'
            }}>
              <div style={{
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                Anchor Builders | 12962 Main Street, Garden Grove, CA 92840 | CSLB# 1029392
              </div>
              <div style={{ marginTop: '8px' }}>
                Visit our website at www.AnchorBuilders.io
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnchorBuildersProposal;