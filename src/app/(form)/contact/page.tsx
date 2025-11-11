import { Contact } from '@/components/Contactus/contact'
import { VignetteGridBackground } from '@/components/ui/VignetteGridBackground'
import { cn } from '@/lib/utils'
import React from 'react'

const contact = () => {
  return (
    <div>
          <VignetteGridBackground />
          <div className='m-4'>
            <Contact />
          </div>
        </div>
  )
}

export default contact