import { InteractiveDotBackground } from '@/components/ui/InteractiveDotBackground'
import { VolunteersForm } from '@/components/form/volunteers'
import React from 'react';

const page = () => {
  return (
    <div>
      <InteractiveDotBackground />
      <div className='m-4'>
        <VolunteersForm />
      </div>
    </div>
  )
}

export default page
