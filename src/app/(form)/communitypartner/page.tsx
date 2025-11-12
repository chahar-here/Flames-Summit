import CommunityPartner from '@/components/form/communityPartner'
import { VignetteGridBackground } from '@/components/ui/VignetteGridBackground';
import React from 'react'

const contact = () => {
  return (
    <div>
          <VignetteGridBackground />
          <div className='m-4'>
            <CommunityPartner/>
          </div>
        </div>
  )
}

export default contact