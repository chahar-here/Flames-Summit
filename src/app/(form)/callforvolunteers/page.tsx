import { InteractiveDotBackground } from '@/components/ui/InteractiveDotBackground'
import { VolunteersForm } from '../../../form/volunteers'
import React from 'react'
import { TextGenerateEffect } from "../../../components/ui/text-generate-effect";

const words = `We are looking for enthusiastic volunteers to help organize and support our upcoming Flames Summit India 2026. Your time and energy can bring smiles and make this initiative a success!`;

const page = () => {
  return (
    <div>
      <InteractiveDotBackground />
      <div className='m-4'>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-center my-4">
          Call for <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
            Voluteers
          </span>
        </h1>
        <TextGenerateEffect words={words} />
        <VolunteersForm />
      </div>
    </div>
  )
}

export default page
